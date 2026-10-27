import { useEffect, useState } from 'react';
import axios from 'axios';
import { Shield, AlertTriangle, Activity, Database, CheckCircle, RefreshCcw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      const statRes = await axios.get('http://localhost:8000/api/dashboard/stats');
      setStats(statRes.data);
      const alertRes = await axios.get('http://localhost:8000/api/alerts?limit=5');
      setAlerts(alertRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const loadDemo = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/api/demo');
      await fetchDashboard();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const chartData = [
    { time: '09:00', events: 12 },
    { time: '09:05', events: 19 },
    { time: '09:10', events: 54 },
    { time: '09:15', events: 30 },
    { time: '09:20', events: 10 },
    { time: '09:25', events: 5 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight glow-text">Security Overview</h1>
          <p className="text-soc-text text-lg">Monitor, detect, and investigate security threats in real-time.</p>
        </motion.div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={loadDemo}
          disabled={loading}
          className="bg-soc-primary/80 hover:bg-soc-primary backdrop-blur-md text-white px-5 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] disabled:opacity-50 border border-blue-400/30"
        >
          {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
          <span>Load Demo Dataset</span>
        </motion.button>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
      >
        <StatCard variants={itemVariants} title="Total Events" value={stats?.total_events || 0} icon={<Activity className="text-blue-400 w-6 h-6" />} color="blue" />
        <StatCard variants={itemVariants} title="Active Alerts" value={stats?.active_alerts || 0} icon={<AlertTriangle className="text-amber-400 w-6 h-6" />} color="amber" />
        <StatCard variants={itemVariants} title="Critical Incidents" value={stats?.detected_incidents || 0} icon={<Shield className="text-red-400 w-6 h-6" />} color="red" />
        <StatCard variants={itemVariants} title="MITRE Techniques" value={stats?.mitre_techniques_detected || 0} icon={<CheckCircle className="text-emerald-400 w-6 h-6" />} color="emerald" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-2 glass-panel premium-gradient p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Event Timeline</h3>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
              <span className="text-sm text-soc-text font-medium">Live Feed</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', backdropFilter: 'blur(10px)', borderColor: 'rgba(55, 65, 81, 0.5)', color: '#fff', borderRadius: '12px' }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="events" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorEvents)" activeDot={{ r: 8, fill: '#3b82f6', stroke: '#1e3a8a', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Alerts Table */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-panel p-6 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Recent Alerts</h3>
            <Link to="/alerts" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">View All</Link>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {alerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-soc-text opacity-70">
                <Shield className="w-12 h-12 mb-3 text-soc-text/50" />
                <p>No recent alerts.</p>
              </div>
            ) : (
              alerts.map((alert, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  key={i} 
                  className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 p-4 rounded-xl backdrop-blur-md group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-white font-medium text-sm truncate pr-4 group-hover:text-blue-400 transition-colors">{alert.title}</h4>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md ${
                      alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      alert.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-soc-text/80">
                    <span className="bg-black/30 px-2 py-1 rounded font-mono">{alert.mitre_id || 'Unknown'}</span>
                    <span className="flex items-center space-x-1">
                      <span>Risk:</span>
                      <span className={`font-bold ${alert.risk_score > 70 ? 'text-red-400' : 'text-orange-400'}`}>{alert.risk_score}/100</span>
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, variants, color }: any) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-500/20 to-blue-500/0 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]",
    amber: "from-amber-500/20 to-amber-500/0 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
    red: "from-red-500/20 to-red-500/0 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]",
    emerald: "from-emerald-500/20 to-emerald-500/0 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
  };

  return (
    <motion.div 
      variants={variants}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`glass-panel p-6 flex flex-col justify-between bg-gradient-to-br ${colorMap[color]} relative overflow-hidden`}
    >
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-medium text-soc-text uppercase tracking-wider">{title}</p>
        <div className="p-2.5 bg-black/40 rounded-xl backdrop-blur-md border border-white/10 shadow-inner">
          {icon}
        </div>
      </div>
      <div>
        <h2 className="text-4xl font-bold text-white tracking-tight">{value}</h2>
      </div>
      
      {/* Decorative background glow */}
      <div className={`absolute -bottom-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-30 bg-${color}-500`} />
    </motion.div>
  );
}
