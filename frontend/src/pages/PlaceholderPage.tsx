import { motion } from 'framer-motion';
import { Settings, ShieldAlert, Activity, FileText, AlertTriangle } from 'lucide-react';

export default function PlaceholderPage({ title, description, type }: { title: string, description: string, type: 'alerts' | 'incidents' | 'mitre' | 'reports' | 'settings' }) {
  const getIcon = () => {
    switch (type) {
      case 'alerts': return <AlertTriangle className="w-16 h-16 text-amber-400 mb-6" />;
      case 'incidents': return <Activity className="w-16 h-16 text-blue-400 mb-6" />;
      case 'mitre': return <ShieldAlert className="w-16 h-16 text-emerald-400 mb-6" />;
      case 'reports': return <FileText className="w-16 h-16 text-purple-400 mb-6" />;
      case 'settings': return <Settings className="w-16 h-16 text-gray-400 mb-6" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight glow-text">{title}</h1>
          <p className="text-soc-text text-lg">{description}</p>
        </motion.div>
      </div>

      <div className="glass-panel p-10 flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Subtle background glow effect based on type */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[100px] pointer-events-none opacity-20 ${
          type === 'alerts' ? 'bg-amber-500' :
          type === 'incidents' ? 'bg-blue-500' :
          type === 'mitre' ? 'bg-emerald-500' :
          type === 'reports' ? 'bg-purple-500' : 'bg-gray-500'
        }`} />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center text-center z-10"
        >
          {getIcon()}
          <h2 className="text-3xl font-bold text-white mb-4 tracking-wide">{title} Dashboard Active</h2>
          <p className="text-soc-text max-w-lg mb-8 text-lg">
            This module is now active and ready for data integration. Premium dashboard layout loaded successfully.
          </p>
          <div className="flex space-x-4">
            <button 
              onClick={() => alert(`Opening configuration panel for ${title}. (This is a mockup feature)`)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl font-semibold transition-all border border-white/20"
            >
              Configure {title}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
