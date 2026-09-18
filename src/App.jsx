import React, { useState } from 'react';
import { ProjectProvider } from './context/ProjectContext';
import Navbar from './components/Navbar';
import GlobalFilterBar from './components/GlobalFilterBar';
import OverallDashboard from './components/OverallDashboard';
import GndDashboard from './components/GndDashboard';
import MasterTable from './components/MasterTable';
import DelaysTracker from './components/DelaysTracker';
import EvidenceGallery from './components/EvidenceGallery';
import ExecutiveReports from './components/ExecutiveReports';

// Modals
import ProjectDetailModal from './components/modals/ProjectDetailModal';
import AddProjectModal from './components/modals/AddProjectModal';
import AddCategoryModal from './components/modals/AddCategoryModal';
import AddGndModal from './components/modals/AddGndModal';
import AddCeoModal from './components/modals/AddCeoModal';
import QuickUpdateProgressModal from './components/modals/QuickUpdateProgressModal';
import AddEvidenceModal from './components/modals/AddEvidenceModal';
import SettingsModal from './components/modals/SettingsModal';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState('overall');

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Sticky Official Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Reactive Global Filter Bar (applied across views) */}
      <GlobalFilterBar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overall' && (
          <OverallDashboard onNavigateToTab={(tab) => setActiveTab(tab)} />
        )}
        {activeTab === 'gnd' && <GndDashboard />}
        {activeTab === 'master' && <MasterTable />}
        {activeTab === 'delays' && <DelaysTracker />}
        {activeTab === 'evidence' && <EvidenceGallery />}
        {activeTab === 'reports' && <ExecutiveReports />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-850 py-4 px-4 text-center text-xs text-slate-500 no-print">
        <p>
          Divisional Secretariat Talawakelle • Planning Branch Development Monitoring System (Prajashakthi / DCB / Rural Roads) • Nuwara Eliya District
        </p>
      </footer>

      {/* Modals Container */}
      <ProjectDetailModal />
      <AddProjectModal />
      <AddCategoryModal />
      <AddGndModal />
      <AddCeoModal />
      <QuickUpdateProgressModal />
      <AddEvidenceModal />
      <SettingsModal />
    </div>
  );
}

export default function App() {
  return (
    <ProjectProvider>
      <DashboardContent />
    </ProjectProvider>
  );
}
