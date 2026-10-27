import { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Download, FileJson, FileSpreadsheet, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Reports() {
  const [stats, setStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, alertsRes] = await Promise.all([
          axios.get('http://localhost:8000/api/dashboard/stats'),
          axios.get('http://localhost:8000/api/alerts')
        ]);
        setStats(statsRes.data);
        setAlerts(alertsRes.data);
      } catch (err) {
        console.error("Failed to fetch data for reports", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  };

  const exportJSON = () => {
    setExporting(true);
    const reportData = {
      generatedAt: new Date().toISOString(),
      summary: stats,
      alerts: alerts
    };
    downloadFile(JSON.stringify(reportData, null, 2), "sentineltrace_security_report.json", "application/json");
    setTimeout(() => setExporting(false), 500);
  };

  const exportCSV = () => {
    setExporting(true);
    if (alerts.length === 0) {
      alert("No alerts to export.");
      setExporting(false);
      return;
    }
    const headers = ["ID", "Title", "Severity", "Risk Score", "MITRE Tactic", "MITRE ID", "Timestamp"];
    const rows = alerts.map(a => [
      a.id,
      `"${a.title}"`,
      a.severity,
      a.risk_score,
      a.mitre_tactic || "N/A",
      a.mitre_id || "N/A",
      a.timestamp
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    downloadFile(csvContent, "sentineltrace_alerts.csv", "text/csv");
    setTimeout(() => setExporting(false), 500);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight glow-text">Compliance & Reports</h1>
          <p className="text-soc-text text-lg">Generate, review, and export detailed security assessment reports.</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="md:col-span-1 space-y-6"
        >
          <div className="glass-panel p-6 premium-gradient from-purple-500/10 to-purple-500/0 border border-purple-500/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-400" />
              Executive Summary
            </h3>
            {loading ? (
              <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-white/10 rounded w-3/4"></div><div className="h-4 bg-white/10 rounded"></div></div></div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-soc-text">Total Events Analyzed</span>
                  <span className="font-mono text-white font-bold">{stats?.total_events || 0}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-soc-text">Active Critical Alerts</span>
                  <span className="font-mono text-red-400 font-bold">{stats?.critical_alerts || 0}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-soc-text">High Severity Alerts</span>
                  <span className="font-mono text-orange-400 font-bold">{stats?.high_alerts || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-soc-text">MITRE Techniques Found</span>
                  <span className="font-mono text-blue-400 font-bold">{stats?.mitre_techniques_detected || 0}</span>
                </div>
              </div>
            )}
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Export Options</h3>
            <div className="space-y-3">
              <button 
                onClick={exportJSON}
                disabled={loading || exporting}
                className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-xl transition-all group"
              >
                <div className="flex items-center">
                  <FileJson className="w-5 h-5 mr-3 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-white">Full JSON Report</span>
                </div>
                <Download className="w-4 h-4 text-soc-text" />
              </button>

              <button 
                onClick={exportCSV}
                disabled={loading || exporting}
                className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-xl transition-all group"
              >
                <div className="flex items-center">
                  <FileSpreadsheet className="w-5 h-5 mr-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-white">Alerts Data (CSV)</span>
                </div>
                <Download className="w-4 h-4 text-soc-text" />
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="md:col-span-2 glass-panel p-6 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-400" />
              Recent Automated Activity
            </h3>
          </div>
          
          <div className="flex-1 overflow-auto custom-scrollbar">
            {loading ? (
              <div className="flex justify-center items-center h-full"><div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div></div>
            ) : (
              <div className="relative border-l border-white/10 ml-4 space-y-8 pb-4">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)] border-2 border-[#0B1120]"></div>
                  <p className="text-xs text-soc-text mb-1">Just now</p>
                  <p className="text-sm font-medium text-white">Security Assessment Report generated</p>
                  <p className="text-xs text-soc-text mt-1 bg-black/30 p-2 rounded border border-white/5 inline-block">System ready for export operations</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#0B1120]"></div>
                  <p className="text-xs text-soc-text mb-1">2 mins ago</p>
                  <p className="text-sm font-medium text-white">MITRE ATT&CK Mapping complete</p>
                  <p className="text-xs text-soc-text mt-1 bg-black/30 p-2 rounded border border-white/5 inline-block">Mapped {stats?.mitre_techniques_detected || 0} techniques across {alerts.length} alerts</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-[#0B1120]"></div>
                  <p className="text-xs text-soc-text mb-1">5 mins ago</p>
                  <p className="text-sm font-medium text-white">Log Ingestion & Analysis</p>
                  <p className="text-xs text-soc-text mt-1 bg-black/30 p-2 rounded border border-white/5 inline-block">Processed {stats?.total_events || 0} events via Detection Engine</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
