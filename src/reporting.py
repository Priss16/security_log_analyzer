import csv
import json
import html
from collections import Counter
from datetime import datetime
import os

def generate_csv(alerts: list, output_path: str):
    if not alerts:
        print("[*] No alerts to write to CSV.")
        return
        
    keys = alerts[0].keys()
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        writer.writerows(alerts)
    print(f"[+] CSV report generated at {output_path}")

def generate_json(alerts: list, output_path: str):
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(alerts, f, indent=4)
    print(f"[+] JSON report generated at {output_path}")

def generate_html(alerts: list, output_path: str):
    # Basic analysis
    ip_counter = Counter(a.get("source_ip") for a in alerts if a.get("source_ip"))
    rule_counter = Counter(a.get("title") for a in alerts if a.get("title"))
    tactics_seen = {a.get("mitre_tactic") for a in alerts if a.get("mitre_tactic")}
    
    top_ips = ip_counter.most_common(5)
    top_rules = rule_counter.most_common(5)
    
    # MITRE Core Tactics
    all_tactics = ["Reconnaissance", "Initial Access", "Execution", "Persistence", "Privilege Escalation", "Defense Evasion", "Credential Access", "Discovery"]
    
    heatmap_html = "<div class='heatmap-container'>"
    for t in all_tactics:
        css_class = "heatmap-hit" if t in tactics_seen else "heatmap-miss"
        heatmap_html += f"<div class='heatmap-box {css_class}'>{t}</div>"
    heatmap_html += "</div>"
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SentinelTrace AI - Security Report</title>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f9; color: #333; margin: 0; padding: 20px; }}
            h1, h2, h3 {{ color: #2c3e50; }}
            .container {{ max-width: 1000px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 10px; }}
            th, td {{ padding: 10px; border-bottom: 1px solid #ddd; text-align: left; }}
            th {{ background-color: #34495e; color: white; }}
            .critical {{ color: #e74c3c; font-weight: bold; }}
            .high {{ color: #e67e22; font-weight: bold; }}
            .medium {{ color: #f1c40f; font-weight: bold; }}
            .heatmap-container {{ display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }}
            .heatmap-box {{ padding: 15px; border-radius: 5px; text-align: center; flex: 1 1 calc(25% - 10px); font-weight: bold; color: white; }}
            .heatmap-hit {{ background-color: #e74c3c; }} /* Red for detected */
            .heatmap-miss {{ background-color: #95a5a6; }} /* Gray for clean */
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Security Log Analysis Report</h1>
            <p><strong>Generated At:</strong> {datetime.utcnow().isoformat()}Z</p>
            <p><strong>Total Alerts:</strong> {len(alerts)}</p>
            
            <h2>MITRE ATT&CK Tactic Heatmap</h2>
            {heatmap_html}
            
            <div style="display: flex; gap: 20px;">
                <div style="flex: 1;">
                    <h3>Top Attacker IPs</h3>
                    <ul>
                        {''.join(f"<li>{html.escape(str(ip))} - {count} alerts</li>" for ip, count in top_ips)}
                    </ul>
                </div>
                <div style="flex: 1;">
                    <h3>Top Triggered Rules</h3>
                    <ul>
                        {''.join(f"<li>{html.escape(str(rule))} - {count} times</li>" for rule, count in top_rules)}
                    </ul>
                </div>
            </div>

            <h2>Alert Details</h2>
            <table>
                <tr>
                    <th>Timestamp</th>
                    <th>Severity</th>
                    <th>Rule Title</th>
                    <th>Source IP</th>
                    <th>MITRE ID</th>
                </tr>
    """
    
    for alert in alerts:
        sev = alert.get("severity", "LOW").lower()
        sev_class = sev if sev in ["critical", "high", "medium"] else ""
        
        html_content += f"""
                <tr>
                    <td>{html.escape(str(alert.get("timestamp", "")))}</td>
                    <td class="{sev_class}">{html.escape(str(alert.get("severity", "")))}</td>
                    <td>{html.escape(str(alert.get("title", "")))}</td>
                    <td>{html.escape(str(alert.get("source_ip", "")))}</td>
                    <td>{html.escape(str(alert.get("mitre_id", "N/A")))}</td>
                </tr>
        """
        
    html_content += """
            </table>
        </div>
    </body>
    </html>
    """
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"[+] HTML report generated at {output_path}")

def generate_firewall_commands(alerts: list):
    """
    Generates optional iptables/ufw block commands for HIGH/CRITICAL alerts.
    """
    malicious_ips = set()
    for alert in alerts:
        if alert.get("severity") in ["HIGH", "CRITICAL"] and alert.get("source_ip"):
            malicious_ips.add(alert.get("source_ip"))
            
    if malicious_ips:
        print("\n" + "="*50)
        print("[!] OPTIONAL RESPONSE MODULE: FIREWALL MITIGATION")
        print("Review the following commands before execution. DO NOT run blindly.")
        print("="*50)
        for ip in malicious_ips:
            print(f"UFW:      sudo ufw deny from {ip} to any")
            print(f"IPTABLES: sudo iptables -A INPUT -s {ip} -j DROP")
        print("="*50 + "\n")

def generate_navigator_layer(alerts: list, output_path: str):
    """
    Exports a JSON file formatted for MITRE ATT&CK Navigator to visually show coverage.
    """
    techniques = []
    seen = set()
    
    for a in alerts:
        t_id = a.get("mitre_id")
        if t_id and t_id not in seen:
            seen.add(t_id)
            techniques.append({
                "techniqueID": t_id,
                "color": "#e62222",
                "comment": a.get("title")
            })
            
    layer = {
        "name": "SentinelTrace AI Detection Layer",
        "versions": {
            "attack": "13",
            "navigator": "4.8.2",
            "layer": "4.4"
        },
        "domain": "enterprise-attack",
        "description": "Auto-generated coverage layer from SentinelTrace AI scan.",
        "techniques": techniques
    }
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(layer, f, indent=4)
    print(f"[+] MITRE ATT&CK Navigator layer generated at {output_path}")
