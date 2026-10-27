import os
import yaml
import glob
from collections import defaultdict
import schemas, models
from sqlalchemy.orm import Session
from enrichment import enrich_event

class YAMLRuleEngine:
    def __init__(self, rules_dir: str = "../rules"):
        self.rules = []
        # CLI might run from a different CWD
        possible_dirs = [rules_dir, "rules", "../rules"]
        target_dir = None
        for d in possible_dirs:
            if os.path.exists(d):
                target_dir = d
                break
                
        if target_dir:
            self._load_rules(target_dir)
        self.state = defaultdict(list) # memory for threshold rules
        
    def _load_rules(self, rules_dir: str):
        for file in glob.glob(os.path.join(rules_dir, "*.yml")):
            with open(file, "r") as f:
                try:
                    rule = yaml.safe_load(f)
                    self.rules.append(rule)
                except Exception as e:
                    print(f"[!] Failed to load rule {file}: {e}")

    def evaluate(self, event: dict):
        alerts = []
        for rule in self.rules:
            cond = rule.get("detection", {}).get("condition", {})
            filters = cond.get("filters", [])
            match = True
            for f in filters:
                field = f.get("field")
                op = f.get("operator")
                val = f.get("value")
                
                event_val = event.get(field)
                
                if op == "equals" and event_val != val:
                    match = False
                    break
                elif op == "in" and event_val not in val:
                    match = False
                    break
            
            if not match:
                continue
                
            if cond.get("type") == "threshold":
                group_key = "-".join([str(event.get(k, "")) for k in cond.get("group_by", [])])
                state_key = f"{rule['rule_id']}_{group_key}"
                
                self.state[state_key].append(event)
                
                limit = cond.get("threshold", 1)
                if len(self.state[state_key]) >= limit:
                    base_score = rule.get("response", {}).get("risk_score_base", 50)
                    if event.get("enrichment_is_malicious_ip"):
                        base_score += 20
                        
                    alerts.append({
                        "title": rule["title"],
                        "description": rule.get("description", ""),
                        "severity": rule.get("severity", "MEDIUM"),
                        "risk_score": min(100.0, base_score),
                        "confidence": 90.0,
                        "mitre_id": rule.get("mitre_attack", {}).get("technique"),
                        "mitre_tactic": rule.get("mitre_attack", {}).get("tactic"),
                        "source_ip": event.get("source_ip"),
                        "username": event.get("username"),
                        "timestamp": event.get("timestamp")
                    })
                    self.state[state_key] = []
        return alerts

class IncidentCorrelator:
    def __init__(self):
        self.incidents = defaultdict(list)
        
    def add_alert(self, alert: dict):
        ip = alert.get("source_ip")
        if not ip:
            return None
        self.incidents[ip].append(alert)
        return self._evaluate_incident(ip)
        
    def _evaluate_incident(self, ip: str):
        alerts = self.incidents[ip]
        if len(alerts) < 2:
            return None # Require at least 2 alerts for an incident
            
        # Extract unique tactics for a kill-chain timeline
        tactics = []
        for a in alerts:
            t = a.get("mitre_tactic")
            if t and t not in tactics:
                tactics.append(t)
                
        # If we see progression across multiple tactics, elevate to critical incident
        severity = "HIGH"
        if len(tactics) >= 3:
            severity = "CRITICAL"
            
        incident = {
            "incident_id": f"INC-{ip.replace('.', '')}-{len(alerts)}",
            "source_ip": ip,
            "severity": severity,
            "kill_chain_timeline": tactics,
            "alerts_count": len(alerts),
            "description": f"Correlated {len(alerts)} alerts from {ip} spanning tactics: {', '.join(tactics)}"
        }
        return incident

class DetectionEngine:
    def __init__(self, db: Session = None, rules_dir: str = "../rules"):
        self.db = db
        self.rule_engine = YAMLRuleEngine(rules_dir)
        self.correlator = IncidentCorrelator()

    def process_logs(self, logs: list) -> dict:
        total_alerts = 0
        all_generated_alerts = []
        correlated_incidents = []
        
        for log in logs:
            if hasattr(log, "model_dump"):
                event_dict = log.model_dump()
            else:
                event_dict = log
            
            event_dict = enrich_event(event_dict)
            
            if self.db:
                db_log = models.LogEvent(**event_dict)
                self.db.add(db_log)
                self.db.commit()
                self.db.refresh(db_log)
            
            alerts = self.rule_engine.evaluate(event_dict)
            for alert_data in alerts:
                total_alerts += 1
                all_generated_alerts.append(alert_data)
                
                # Correlate alert into incident
                incident = self.correlator.add_alert(alert_data)
                if incident:
                    correlated_incidents.append(incident)
                
                if self.db:
                    alert_obj = models.Alert(**alert_data)
                    self.db.add(alert_obj)
                    self.db.commit()
                else:
                    print(f"[ALERT] {alert_data['severity']} - {alert_data['title']} (IP: {alert_data['source_ip']}, Geo: {event_dict.get('enrichment_geo_country')})")
                    
        # Print correlated incidents if running offline
        if not self.db and correlated_incidents:
            for inc in correlated_incidents[-1:]: # just show the latest updated state for each IP if we wanted, but appending works for demo
                print(f"\n[INCIDENT DETECTED] {inc['description']} (Severity: {inc['severity']})")

        return {
            "status": "success", 
            "processed": len(logs), 
            "alerts_generated": total_alerts,
            "alerts": all_generated_alerts,
            "incidents": correlated_incidents
        }
