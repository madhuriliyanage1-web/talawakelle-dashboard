import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import {
  LayoutDashboard,
  MapPin,
  TableProperties,
  AlertTriangle,
  Camera,
  FileText,
  Plus,
  Tag,
  MapPin,
  UserCheck,
  Download,
  RotateCcw,
  Clock,
  Sparkles,
  ChevronDown,
  Settings
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const {
    isDemoData,
    resetToDemoData,
    exportDataJSON,
    setIsAddProjectOpen,
    setIsAddCategoryOpen,
    setIsAddGndOpen,
    setIsAddCeoOpen,
    setIsSettingsOpen,
    executiveMetrics,
    SECRETARIAT_META
  } = useProject();

  const [currentTime, setCurrentTime] = useState('');
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-GB', {
        timeZone: 'Asia/Colombo',
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'overall', label: 'Overall Dashboard', icon: LayoutDashboard },
    { id: 'gnd', label: 'GND-wise Explorer', icon: MapPin },
    { id: 'master', label: 'Master Monitoring Table', icon: TableProperties },
    {
      id: 'delays',
      label: 'Issues & Delays Tracker',
      icon: AlertTriangle,
      badge: executiveMetrics.delayed > 0 ? executiveMetrics.delayed : null
    },
    { id: 'evidence', label: 'Photo Evidence Gallery', icon: Camera },
    { id: 'reports', label: 'Secretariat Reports', icon: FileText }
  ];

  return (
    <header className="sticky top-0 z-40 gov-header shadow-md no-print">
      {/* Top Bar: Official Branding, Live Sri Lankan Clock & Action Buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 border-b border-slate-700/60">
          {/* Official Emblem & Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 p-0.5 shadow-md flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-950" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Government of Sri Lanka
                </span>
                <span className="text-xs text-slate-300 hidden md:inline">
                  {SECRETARIAT_META.district} • {SECRETARIAT_META.province}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
                Divisional Secretariat Talawakelle
              </h1>
              <p className="text-[11px] text-slate-300 font-medium">
                Planning Branch — Capital Development & GND-wise Project Monitoring Portal
              </p>
            </div>
          </div>

          {/* Right Header: Clock, Demo Badge & Quick Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Clock */}
            <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-200 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-slate-100">{currentTime || 'SL Time (IST)'}</span>
            </div>

            {/* DEMO DATA ACTIVE / LIVE DATA Badge with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className={`flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                  isDemoData
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30'
                }`}
                title="Click to manage mock or live register data"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">
                  {isDemoData ? 'DEMO DATA ACTIVE' : 'LIVE REGISTER ACTIVE'}
                </span>
                <span className="sm:hidden">{isDemoData ? 'DEMO' : 'LIVE'}</span>
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
              </button>

              {showDemoMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1.5 z-50 text-xs text-slate-200"
                  onClick={() => setShowDemoMenu(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-800 text-slate-400">
                    <p className="font-semibold text-slate-200">Data Management</p>
                    <p className="text-[10px]">Talawakelle DS Project Register</p>
                  </div>
                  <button
                    onClick={resetToDemoData}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center space-x-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reset to Default Demo Data</span>
                  </button>
                  <button
                    onClick={exportDataJSON}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center space-x-2"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export Register (JSON)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Top Action Buttons: Settings, + GND, + CEO, + Category & Add Project */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hidden md:flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition"
              title="Settings & Master Configuration"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => setIsAddGndOpen(true)}
              className="hidden sm:flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition"
              title="Add New Grama Niladhari Division"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ GND</span>
            </button>

            <button
              onClick={() => setIsAddCeoOpen(true)}
              className="hidden sm:flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition"
              title="Add Community Empowerment Officer"
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>+ CEO</span>
            </button>

            <button
              onClick={() => setIsAddCategoryOpen(true)}
              className="hidden sm:flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition"
              title="Add New Programme Category"
            >
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
              <span>+ Category</span>
            </button>

            <button
              onClick={() => setIsAddProjectOpen(true)}
              className="flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition"
            >
              <Plus className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar with .gov-nav-tab */}
        <nav className="flex space-x-1 overflow-x-auto py-1 scrollbar-none">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`gov-nav-tab flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap ${
                  isActive ? 'active' : ''
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
