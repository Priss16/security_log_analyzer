import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, Search, Activity, ShieldAlert, FileText, Settings, Bell, User, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import LogExplorer from './pages/LogExplorer';
import PlaceholderPage from './pages/PlaceholderPage';
import Alerts from './pages/Alerts';
import Mitre from './pages/Mitre';
import Reports from './pages/Reports';
import Incidents from './pages/Incidents';
import SettingsPage from './pages/Settings';

function Sidebar() {
  const location = useLocation();
  
  return (
    <div className="w-64 glass-panel border-y-0 border-l-0 rounded-none h-screen p-4 flex flex-col relative z-10 bg-black/40">
      <div className="flex items-center space-x-3 mb-10 px-4 mt-4">
        <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
          <ShieldAlert className="text-blue-400 w-7 h-7" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide glow-text">SentinelTrace</h1>
          <p className="text-[10px] text-blue-400 font-mono tracking-widest uppercase">Enterprise AI</p>
        </div>
      </div>
      
      <nav className="flex-1 space-y-2 px-2">
        <p className="text-xs font-semibold text-soc-text/50 uppercase tracking-wider mb-4 px-2">Main Menu</p>
        <NavItem to="/" icon={<LayoutDashboard />} label="Dashboard" active={location.pathname === '/'} />
        <NavItem to="/logs" icon={<Search />} label="Log Explorer" active={location.pathname === '/logs'} />
        <NavItem to="/alerts" icon={<AlertTriangle />} label="Alerts" active={location.pathname === '/alerts'} />
        <NavItem to="/incidents" icon={<Activity />} label="Incidents" active={location.pathname === '/incidents'} />
        <NavItem to="/mitre" icon={<ShieldAlert />} label="MITRE ATT&CK" active={location.pathname === '/mitre'} />
        <NavItem to="/reports" icon={<FileText />} label="Reports" active={location.pathname === '/reports'} />
      </nav>
      
      <div className="mt-auto pt-4 border-t border-white/10 px-2 pb-4">
        <NavItem to="/settings" icon={<Settings />} label="Settings" active={location.pathname === '/settings'} />
      </div>
    </div>
  );
}

function NavItem({ to, icon, label, active = false }: any) {
  return (
    <Link to={to} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${active ? 'bg-gradient-to-r from-blue-500/20 to-transparent text-white border-l-4 border-blue-500' : 'text-soc-text hover:bg-white/5 hover:text-white border-l-4 border-transparent'}`}>
      {React.cloneElement(icon, { className: `w-5 h-5 transition-colors ${active ? 'text-blue-400' : 'text-soc-text group-hover:text-blue-300'}` })}
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
}

function Topbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="h-16 glass-panel rounded-none border-t-0 border-x-0 flex items-center justify-between px-8 z-10 sticky top-0 bg-black/30">
      <div className="flex items-center">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-soc-text" />
          <input 
            type="text" 
            placeholder="Search logs, alerts, IP addresses..." 
            className="bg-black/20 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 w-64 transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                if (target.value) {
                  // Basic search implementation for demo
                  window.location.href = `/alerts?q=${encodeURIComponent(target.value)}`;
                }
              }
            }}
          />
        </div>
      </div>
      <div className="flex items-center space-x-4 relative">
        <button 
          onClick={() => {
            setNotificationsOpen(!notificationsOpen);
            setProfileOpen(false);
          }} 
          className="relative p-2 text-soc-text hover:text-white transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button 
          onClick={() => {
            setProfileOpen(!profileOpen);
            setNotificationsOpen(false);
          }} 
          className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border border-white/20 hover:ring-2 hover:ring-white/30 transition-all cursor-pointer focus:outline-none"
        ></button>
        
        {notificationsOpen && (
          <div className="absolute top-12 right-10 w-72 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 flex flex-col overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-white/10 mb-1 flex justify-between items-center">
              <p className="text-sm font-semibold text-white">Notifications</p>
              <button className="text-xs text-blue-400 hover:text-blue-300">Mark all read</button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <div className="px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer border-l-2 border-red-500">
                <p className="text-xs font-semibold text-white">Critical Alert Detected</p>
                <p className="text-[10px] text-soc-text mt-1">Multiple failed SSH logins from 192.168.1.105</p>
                <p className="text-[9px] text-soc-text/50 mt-1">2 mins ago</p>
              </div>
              <div className="px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer border-l-2 border-amber-500">
                <p className="text-xs font-semibold text-white">Engine Update</p>
                <p className="text-[10px] text-soc-text mt-1">Sigma rules successfully updated to latest version.</p>
                <p className="text-[9px] text-soc-text/50 mt-1">1 hour ago</p>
              </div>
            </div>
          </div>
        )}

        {profileOpen && (
          <div className="absolute top-12 right-0 w-48 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 flex flex-col overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-white/10 mb-1">
              <p className="text-sm font-semibold text-white">Admin User</p>
              <p className="text-xs text-soc-text">admin@sentineltrace.ai</p>
            </div>
            <button className="px-4 py-2 text-left text-sm text-soc-text hover:bg-white/10 hover:text-white transition-colors flex items-center">
              <User className="w-4 h-4 mr-2" />
              My Profile
            </button>
            <button className="px-4 py-2 text-left text-sm text-soc-text hover:bg-white/10 hover:text-white transition-colors flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Account Settings
            </button>
            <div className="border-t border-white/10 my-1"></div>
            <button className="px-4 py-2 text-left text-sm text-red-400 hover:bg-white/10 hover:text-red-300 transition-colors flex items-center">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function App() {
  return (
    <Router>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <Topbar />
          <main className="flex-1 overflow-y-auto custom-scrollbar relative z-0">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/logs" element={<LogExplorer />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/incidents" element={<Incidents />} />
              <Route path="/mitre" element={<Mitre />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;

