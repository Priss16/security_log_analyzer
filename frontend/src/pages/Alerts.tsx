import { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldAlert, CheckCircle, Clock, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [investigatingAlert, setInvestigatingAlert] = useState<any>(null);

  const handleResolve = async (id: any) => {
    try {
      await axios.put(`http://localhost:8000/api/alerts/${id}/status`, { status: "False Positive" });
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/alerts');
        setAlerts(res.data);
      } catch (err) {
        console.error("Failed to fetch alerts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts.filter(a => 
    a.status === 'New' && (
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase()) ||
      a.mitre_id?.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight glow-text">Alerts Management</h1>
          <p className="text-soc-text text-lg">Triage and investigate detected security threats.</p>
        </motion.div>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-soc-text" />
            <input 
              type="text" 
              placeholder="Search alerts..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-black/20 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all w-64" 
            />
          </div>
          <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl border border-white/10 flex items-center space-x-2 transition-all">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="flex-1 glass-panel p-6 flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-soc-text">
            <CheckCircle className="w-16 h-16 text-emerald-500 mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-white mb-2">No Active Alerts</h3>
            <p>Your environment is secure. No threats detected.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
            {filteredAlerts.map((alert, idx) => (
              <motion.div 
                key={alert.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-black/40 border border-white/10 hover:border-amber-500/50 p-5 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all group"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl mt-1 ${
                    alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-500' :
                    alert.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-500' :
                    'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">{alert.title}</h3>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                        alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        alert.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-soc-text text-sm mb-3 max-w-2xl">{alert.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-soc-text/80">
                      <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {alert.timestamp || 'Unknown Time'}</span>
                      <span className="bg-white/5 px-2 py-1 rounded font-mono border border-white/5">Risk: {alert.risk_score}/100</span>
                      {alert.mitre_id && (
                        <span className="bg-white/5 px-2 py-1 rounded font-mono border border-white/5">MITRE: {alert.mitre_id} ({alert.mitre_tactic})</span>
                      )}
                      {alert.source_ip && (
                        <span className="bg-white/5 px-2 py-1 rounded font-mono border border-white/5">IP: {alert.source_ip}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex lg:flex-col gap-2 shrink-0">
                  <button 
                    onClick={() => setInvestigatingAlert(alert)}
                    className="bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 border border-amber-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full"
                  >
                    Investigate
                  </button>
                  <button 
                    onClick={() => handleResolve(alert.id)}
                    className="bg-white/5 hover:bg-red-500/20 text-white hover:text-red-400 border border-white/10 hover:border-red-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full"
                  >
                    Mark False Positive
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {investigatingAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-amber-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
          >
            <div className="flex items-center space-x-3 mb-4 text-amber-400">
              <ShieldAlert className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Investigating Alert</h2>
            </div>
            <div className="space-y-4 mb-6">
              <p className="text-white font-medium">{investigatingAlert.title}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/50 p-4 rounded-lg border border-white/10 font-mono text-sm text-soc-text space-y-2">
                  <p className="text-white mb-2 font-sans font-semibold text-xs uppercase">Threat Intel</p>
                  <p>Source IP: <span className="text-red-400">{investigatingAlert.source_ip || 'N/A'}</span></p>
                  <p>MITRE Tactic: {investigatingAlert.mitre_tactic}</p>
                  <p>Risk Score: {investigatingAlert.risk_score}</p>
                </div>
                
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30 font-mono text-xs text-blue-300 flex flex-col justify-between">
                   <p className="text-blue-400 mb-2 font-sans font-semibold text-xs uppercase">Auto-Mitigation (SOAR)</p>
                   <p className="mb-2">Suggested Firewall Rule to block attacker:</p>
                   <div className="bg-black/80 p-2 rounded border border-blue-500/20 select-all">
                     sudo iptables -A INPUT -s {investigatingAlert.source_ip || '192.168.1.X'} -j DROP
                   </div>
                </div>
              </div>
              
              <p className="text-emerald-400 text-sm flex items-center mt-2">
                <CheckCircle className="w-4 h-4 mr-2" /> AI Playbook execution complete. Waiting for analyst action.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setInvestigatingAlert(null)}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-bold transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  alert(`Firewall rule applied for IP: ${investigatingAlert.source_ip}`);
                  setInvestigatingAlert(null);
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-bold transition-colors flex items-center"
              >
                <ShieldAlert className="w-4 h-4 mr-2" />
                Apply Block Rule
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
