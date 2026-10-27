import { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, Users, Globe, ShieldAlert, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Incidents() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [triagedIncident, setTriagedIncident] = useState<any>(null);

  const handleResolve = async (incident: any) => {
    try {
      // Resolve all alerts tied to this incident
      for (const alert of incident.alerts) {
        await axios.put(`http://localhost:8000/api/alerts/${alert.id}/status`, { status: "Resolved" });
      }
      setIncidents(incidents.filter(i => i.id !== incident.id));
    } catch (e) {
      console.error("Failed to resolve incident", e);
    }
  };

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/alerts');
        const alerts = res.data;
        
        // Group alerts into incidents based on source_ip or username
        const incidentMap = new Map<string, any>();
        
        alerts.filter((a: any) => a.status === 'New').forEach((alert: any) => {
          const key = alert.source_ip || alert.username || 'Unknown Origin';
          if (!incidentMap.has(key)) {
            incidentMap.set(key, {
              id: `INC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
              origin: key,
              type: alert.source_ip ? 'Network' : 'Identity',
              alerts: [],
              severity: 'LOW',
              maxRisk: 0,
              startTime: alert.timestamp,
              status: 'Active'
            });
          }
          
          const incident = incidentMap.get(key);
          incident.alerts.push(alert);
          if (alert.risk_score > incident.maxRisk) incident.maxRisk = alert.risk_score;
          
          if (alert.severity === 'CRITICAL' || incident.severity === 'CRITICAL') {
            incident.severity = 'CRITICAL';
          } else if (alert.severity === 'HIGH' && incident.severity !== 'CRITICAL') {
            incident.severity = 'HIGH';
          }
        });
        
        setIncidents(Array.from(incidentMap.values()).sort((a, b) => b.maxRisk - a.maxRisk));
      } catch (err) {
        console.error("Failed to fetch alerts for incidents", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchIncidents();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight glow-text">Incident Response</h1>
          <p className="text-soc-text text-lg">Manage correlated alerts and coordinate response efforts.</p>
        </motion.div>
      </div>

      <div className="flex-1 glass-panel p-6 flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : incidents.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-soc-text">
            <Activity className="w-16 h-16 text-emerald-500 mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-white mb-2">No Active Incidents</h3>
            <p>No correlated threat campaigns detected.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
            {incidents.map((incident, idx) => (
              <motion.div 
                key={incident.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-black/40 border border-white/10 hover:border-blue-500/50 p-5 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all group"
              >
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-3 rounded-xl mt-1 flex-shrink-0 ${
                    incident.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-500' :
                    incident.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-500' :
                    'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {incident.type === 'Network' ? <Globe className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                        {incident.id} - Suspicious {incident.type} Activity
                      </h3>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                        incident.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        incident.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {incident.severity}
                      </span>
                      <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 text-xs font-bold rounded-md">
                        {incident.alerts.length} Alerts
                      </span>
                    </div>
                    
                    <p className="text-soc-text text-sm mb-3">
                      Target Origin: <span className="text-white font-mono">{incident.origin}</span>
                    </p>
                    
                    <div className="bg-black/60 border border-white/5 rounded-lg p-3">
                      <p className="text-xs font-semibold text-soc-text mb-2 uppercase tracking-wider">Associated Alerts</p>
                      <div className="space-y-1">
                        {incident.alerts.slice(0, 3).map((a: any, i: number) => (
                          <div key={i} className="flex items-center text-xs text-white/80">
                            <ShieldAlert className="w-3 h-3 mr-2 text-soc-text" />
                            <span className="truncate">{a.title}</span>
                          </div>
                        ))}
                        {incident.alerts.length > 3 && (
                          <p className="text-xs text-blue-400 mt-1">+{incident.alerts.length - 3} more alerts</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex lg:flex-col gap-2 shrink-0">
                  <button 
                    onClick={() => setTriagedIncident(incident)}
                    className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 border border-blue-500/30 px-6 py-3 rounded-lg text-sm font-medium transition-colors w-full flex items-center justify-center"
                  >
                    Triage Incident <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                  <button 
                    onClick={() => handleResolve(incident)}
                    className="bg-white/5 hover:bg-emerald-500/20 text-white hover:text-emerald-400 border border-white/10 hover:border-emerald-500/30 px-6 py-2 rounded-lg text-sm font-medium transition-colors w-full"
                  >
                    Resolve
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {triagedIncident && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-blue-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
          >
            <div className="flex items-center space-x-3 mb-4 text-blue-400">
              <Activity className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Case Opened</h2>
            </div>
            <div className="space-y-4 mb-6">
              <p className="text-white font-medium text-lg">Case ID: {triagedIncident.id}</p>
              <div className="bg-black/50 p-4 rounded-lg border border-white/10 text-sm text-soc-text space-y-2">
                <p>Target Origin: <span className="font-mono text-white">{triagedIncident.origin}</span></p>
                <p>Total Alerts: <span className="text-white">{triagedIncident.alerts.length}</span></p>
                <p>Severity: <span className="text-white">{triagedIncident.severity}</span></p>
              </div>
              <p className="text-soc-text text-sm">Incident has been locked for your triage. AI playbooks have been triggered to gather additional context.</p>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => setTriagedIncident(null)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold transition-colors"
              >
                Start Investigation
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
