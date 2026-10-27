import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Shield, Database, Bell, Lock, Key, Server, Save } from 'lucide-react';

export default function Settings() {
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
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight glow-text">System Settings</h1>
          <p className="text-soc-text text-lg">Configure SentinelTrace parameters and integrations.</p>
        </motion.div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6"
      >
        <motion.div variants={itemVariants} className="glass-panel p-6">
          <div className="flex items-center space-x-3 mb-6 border-b border-white/10 pb-4">
            <Shield className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Detection Engine</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Strict Mode</h4>
                <p className="text-soc-text text-sm">Enable strict validation for MITRE ATT&CK heuristics.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Auto-Mitigation (Firewall)</h4>
                <p className="text-soc-text text-sm">Automatically generate iptables rules for Critical threats.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-6">
          <div className="flex items-center space-x-3 mb-6 border-b border-white/10 pb-4">
            <Database className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Data Retention</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-soc-text mb-2">Log Retention Period</label>
              <select className="bg-black/30 border border-white/10 text-white rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500">
                <option>30 Days</option>
                <option>90 Days</option>
                <option>1 Year</option>
                <option>Indefinite</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-soc-text mb-2">Alert Retention Period</label>
              <select className="bg-black/30 border border-white/10 text-white rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500">
                <option>90 Days</option>
                <option>1 Year</option>
                <option>Indefinite</option>
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-6">
          <div className="flex items-center space-x-3 mb-6 border-b border-white/10 pb-4">
            <Key className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">API Integrations</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-soc-text mb-2">VirusTotal API Key</label>
              <input type="password" value="************************" readOnly className="bg-black/30 border border-white/10 text-white rounded-lg block w-full p-2.5 opacity-70" />
            </div>
            <div>
              <label className="block text-sm font-medium text-soc-text mb-2">Slack Webhook URL</label>
              <input type="text" placeholder="https://hooks.slack.com/services/..." className="bg-black/30 border border-white/10 text-white rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-end space-x-4 pt-4">
          <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-2 rounded-lg font-medium transition-colors">
            Discard Changes
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20">
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
