import { Search, Filter, Download, Terminal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function LogExplorer() {
  const [search, setSearch] = useState('');

  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/logs');
        const data = await response.json();
        
        // Map the backend data to match what the table expects
        const formattedLogs = data.map((log: any) => ({
          id: log.id,
          time: log.timestamp || 'Unknown',
          source: log.source_ip || 'N/A',
          dest: log.destination_ip || 'N/A',
          event: log.event_type || 'Unknown Event',
          severity: log.severity || 'Info'
        }));
        
        setLogs(formattedLogs);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      }
    };
    
    fetchLogs();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight glow-text">Log Explorer</h1>
          <p className="text-soc-text text-lg">Search, filter, and analyze security logs.</p>
        </motion.div>
        <div className="flex space-x-4">
          <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg border border-white/10 flex items-center space-x-2 transition-all">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg border border-white/10 flex items-center space-x-2 transition-all">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="glass-panel p-6 flex-1 flex flex-col">
        <div className="relative mb-6">
          <Terminal className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-soc-text" />
          <input 
            type="text" 
            placeholder="Search logs (e.g. Critical, 192.168.1.105, ssh...)" 
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white font-mono text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-auto rounded-lg border border-white/10">
          <table className="w-full text-left border-collapse">
            <thead className="bg-black/60 sticky top-0 backdrop-blur-md">
              <tr>
                <th className="p-4 text-xs font-semibold text-soc-text uppercase tracking-wider">Time</th>
                <th className="p-4 text-xs font-semibold text-soc-text uppercase tracking-wider">Event</th>
                <th className="p-4 text-xs font-semibold text-soc-text uppercase tracking-wider">Source IP</th>
                <th className="p-4 text-xs font-semibold text-soc-text uppercase tracking-wider">Dest IP</th>
                <th className="p-4 text-xs font-semibold text-soc-text uppercase tracking-wider">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.filter(log => 
                log.event.toLowerCase().includes(search.toLowerCase()) || 
                log.source.toLowerCase().includes(search.toLowerCase()) || 
                log.dest.toLowerCase().includes(search.toLowerCase()) ||
                log.severity.toLowerCase().includes(search.toLowerCase())
              ).map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                  <td className="p-4 text-sm text-soc-text group-hover:text-white transition-colors">{log.time}</td>
                  <td className="p-4 text-sm font-medium text-white">{log.event}</td>
                  <td className="p-4 text-sm font-mono text-blue-400">{log.source}</td>
                  <td className="p-4 text-sm font-mono text-blue-400">{log.dest}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      log.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      log.severity === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      log.severity === 'Low' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
