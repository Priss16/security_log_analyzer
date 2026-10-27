import { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Mitre() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTactic, setExpandedTactic] = useState<string | null>(null);

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

  // Compute tactic counts
  const tacticsCount: Record<string, number> = {};
  alerts.forEach(a => {
    if (a.mitre_tactic) {
      tacticsCount[a.mitre_tactic] = (tacticsCount[a.mitre_tactic] || 0) + 1;
    }
  });

  const tactics = [
    "Initial Access", "Execution", "Persistence", "Privilege Escalation", 
    "Defense Evasion", "Credential Access", "Discovery", "Lateral Movement",
    "Collection", "Command and Control", "Exfiltration", "Impact"
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight glow-text">MITRE ATT&CK Matrix</h1>
          <p className="text-soc-text text-lg">Real-time threat coverage mapping based on detected alerts.</p>
        </motion.div>
      </div>

      <div className="flex-1 glass-panel p-6 overflow-auto custom-scrollbar">
        {loading ? (
          <div className="flex h-full justify-center items-center">
             <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tactics.map((tactic, idx) => {
              const count = tacticsCount[tactic] || 0;
              return (
                <motion.div
                  key={tactic}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 rounded-xl border transition-all ${
                    count > 0 
                      ? 'bg-red-500/20 border-red-500/50 hover:bg-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                      : 'bg-black/40 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-semibold text-sm ${count > 0 ? 'text-red-400' : 'text-white'}`}>{tactic}</h3>
                    {count > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
                    )}
                  </div>
                  {count > 0 ? (
                    <div className="mt-4 space-y-2">
                      {alerts.filter(a => a.mitre_tactic === tactic).slice(0, expandedTactic === tactic ? undefined : 3).map((a, i) => (
                        <div key={i} className="text-xs text-red-200 bg-red-950/50 p-2 rounded border border-red-500/20 truncate">
                          {a.mitre_id} - {a.title}
                        </div>
                      ))}
                      {count > 3 && expandedTactic !== tactic && (
                        <button 
                          onClick={() => setExpandedTactic(tactic)}
                          className="w-full text-xs text-red-400 text-center hover:bg-red-500/10 py-1 rounded transition-colors cursor-pointer"
                        >
                          +{count - 3} more
                        </button>
                      )}
                      {expandedTactic === tactic && (
                         <button 
                         onClick={() => setExpandedTactic(null)}
                         className="w-full text-xs text-red-400 text-center hover:bg-red-500/10 py-1 rounded transition-colors cursor-pointer mt-2"
                       >
                         Show less
                       </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-soc-text mt-2 opacity-50">No activity detected</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
