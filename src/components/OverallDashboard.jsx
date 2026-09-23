import React from 'react';
import { useProject } from '../context/ProjectContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Building2,
  FolderGit2,
  Banknote,
  CheckCircle2,
  Clock3,
  AlertOctagon,
  TrendingUp,
  Percent,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function OverallDashboard({ onNavigateToTab }) {
  const {
    executiveMetrics = {},
    filteredProjects = [],
    categories = [],
    WORKFLOW_STAGES = [],
    openProjectDetail = () => {},
    getProjectAlerts = () => []
  } = useProject() || {};

  const formatLKR = (val) => {
    if (!val) return 'Rs. 0.00 M';
    const inMillions = Number(val) / 1000000;
    return `Rs. ${inMillions.toFixed(2)} Mn`;
  };

  // 1. Chart Data: GND-wise Project Allocation / Count (Top 8 GNDs)
  const gndMap = {};
  (filteredProjects || []).forEach(p => {
    if (!p) return;
    const gName = p?.gndName || p?.gnd || '';
    const key = p?.gndCode || gName.slice(0, 12) || 'Other';
    if (!gndMap[key]) {
      gndMap[key] = { count: 0, allocation: 0, physicalSum: 0 };
    }
    gndMap[key].count += 1;
    gndMap[key].allocation += (parseFloat(p?.allocation) || 0) / 1000000;
    gndMap[key].physicalSum += (Number(p?.physicalProgress ?? p?.progress ?? 0) || 0);
  });

  const topGndKeys = Object.keys(gndMap).slice(0, 8);
  const gndBarData = {
    labels: topGndKeys.length ? topGndKeys : ['No data'],
    datasets: [
      {
        label: 'Allocated (Rs. Mn)',
        data: topGndKeys.map(k => gndMap[k]?.allocation || 0),
        backgroundColor: '#10B981',
        borderRadius: 4
      },
      {
        label: 'Avg Progress (%)',
        data: topGndKeys.map(k => gndMap[k]?.count ? Math.round(gndMap[k].physicalSum / gndMap[k].count) : 0),
        backgroundColor: '#3B82F6',
        borderRadius: 4
      }
    ]
  };

  // 2. Chart Data: 15-Stage Workflow Distribution (Doughnut)
  const workflowBuckets = {
    'Planning & Estimates': (filteredProjects || []).filter(p => [
      'Project Identification', 'Proposal Preparation', 'Feasibility Study',
      'Estimate Not Prepared', 'Estimate Prepared', 'Planning'
    ].includes(p?.status || p?.stage)).length,
    'Approvals & Procurement': (filteredProjects || []).filter(p => [
      'Approval Pending', 'Approved', 'Procurement'
    ].includes(p?.status || p?.stage)).length,
    'Agreements': (filteredProjects || []).filter(p => [
      'Agreement Pending', 'Agreement Signed'
    ].includes(p?.status || p?.stage)).length,
    'Construction Ongoing': (filteredProjects || []).filter(p => [
      'Work Started', 'Work Ongoing', 'Execution'
    ].includes(p?.status || p?.stage)).length,
    'Completed & Settled': (filteredProjects || []).filter(p => [
      'Completed', 'Bill Submitted', 'Bill Paid'
    ].includes(p?.status || p?.stage)).length
  };

  const doughnutData = {
    labels: Object.keys(workflowBuckets),
    datasets: [
      {
        data: Object.values(workflowBuckets),
        backgroundColor: [
          '#94A3B8', // Planning
          '#3B82F6', // Approvals
          '#F59E0B', // Agreements
          '#06B6D4', // Ongoing
          '#10B981'  // Completed
        ],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }
    ]
  };

  // 3. Chart Data: Category Breakdown
  const catNames = (categories || []).map(c => c?.name).filter(Boolean);
  const catAllocations = catNames.map(cat => {
    return (filteredProjects || [])
      .filter(p => p?.category === cat)
      .reduce((acc, p) => acc + (parseFloat(p?.allocation) || 0) / 1000000, 0);
  });

  const categoryBarData = {
    labels: catNames.map(c => c?.length > 20 ? c.slice(0, 20) + '...' : (c || 'Other')),
    datasets: [
      {
        label: 'Budget (Rs. Mn)',
        data: catAllocations,
        backgroundColor: '#8B5CF6',
        borderRadius: 4
      }
    ]
  };

  // 4. Chart Data: Physical vs Financial Comparison
  const sampleProjects = (filteredProjects || []).slice(0, 7);
  const dualProgressData = {
    labels: sampleProjects.map(p => (p?.name || p?.title || 'Project').slice(0, 14) + '...'),
    datasets: [
      {
        label: 'Physical Progress %',
        data: sampleProjects.map(p => Number(p?.physicalProgress ?? p?.progress ?? 0) || 0),
        backgroundColor: '#10B981',
        borderRadius: 4
      },
      {
        label: 'Financial Progress %',
        data: sampleProjects.map(p => Number(p?.financialProgress ?? 0) || 0),
        backgroundColor: '#F59E0B',
        borderRadius: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#475569', font: { size: 11, family: 'Inter', weight: '600' } }
      }
    },
    scales: {
      x: {
        ticks: { color: '#64748B', font: { size: 10 } },
        grid: { color: '#E2E8F0' }
      },
      y: {
        ticks: { color: '#64748B', font: { size: 10 } },
        grid: { color: '#E2E8F0' }
      }
    }
  };

  const flaggedList = (filteredProjects || []).filter(p => (getProjectAlerts?.(p) || []).length > 0).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Banner: Talawakelle Divisional Secretariat Overview */}
      <div className="gov-card p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Real-time Portfolio Health
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Talawakelle Divisional Secretariat Planning Dashboard
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5 font-normal">
            Monitoring rural road connectivity, Prajashakthi community development, DCB decentralized capital funds, and public infrastructure across 34 Grama Niladhari Divisions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateToTab?.('master')}
            className="flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition"
          >
            <span>Master Register</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          </button>
          <button
            onClick={() => onNavigateToTab?.('reports')}
            className="flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 border border-amber-500/40 transition"
          >
            <span>District Report</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total GNDs */}
        <div className="gov-card card-accent-green p-4 relative">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active GNDs</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {executiveMetrics?.totalGnds ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Grama Niladhari Divisions</p>
        </div>

        {/* Total Projects */}
        <div className="gov-card card-accent-blue p-4 relative">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Projects</span>
            <FolderGit2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {executiveMetrics?.totalProjects ?? (filteredProjects || []).length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">In filter criteria</p>
        </div>

        {/* Total Allocation */}
        <div className="gov-card card-accent-amber p-4 relative">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Allocation</span>
            <Banknote className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatLKR(executiveMetrics?.totalAllocation)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Exp: {formatLKR(executiveMetrics?.totalExpenditure)}
          </p>
        </div>

        {/* Completed */}
        <div className="gov-card card-accent-green p-4 relative">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {executiveMetrics?.completed ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">100% finished</p>
        </div>

        {/* Ongoing */}
        <div className="gov-card card-accent-cyan p-4 relative">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Work Ongoing</span>
            <Clock3 className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-cyan-600">
            {executiveMetrics?.ongoing ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Active site operations</p>
        </div>

        {/* Not Started */}
        <div className="gov-card p-4 border-l-4 border-slate-400 relative">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Not Started</span>
            <Clock3 className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-black text-slate-700">
            {executiveMetrics?.notStarted ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Planning / procurement</p>
        </div>

        {/* Delayed / Flagged Projects */}
        <div className="gov-card card-accent-red p-4 relative bg-rose-50/40">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Delayed / Flagged</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600">
            {executiveMetrics?.delayed ?? 0}
          </div>
          <p className="text-[11px] text-rose-600/90 mt-1 font-semibold">Requires action</p>
        </div>

        {/* Avg Physical Progress */}
        <div className="gov-card card-accent-green p-4 relative">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Avg Physical %</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {executiveMetrics?.avgPhysicalProgress ?? 0}%
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${Math.min(Math.max(Number(executiveMetrics?.avgPhysicalProgress || 0), 0), 100)}%` }}
            />
          </div>
        </div>

        {/* Total Financial Progress */}
        <div className="gov-card card-accent-amber p-4 relative">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Financial %</span>
            <Percent className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {executiveMetrics?.totalFinancialProgress ?? 0}%
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full"
              style={{ width: `${Math.min(Math.max(Number(executiveMetrics?.totalFinancialProgress || 0), 0), 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4 Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: GND-wise Progress Bar */}
        <div className="gov-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                GND-wise Project Allocation & Progress
              </h3>
              <p className="text-[11px] text-slate-500">
                Top Grama Niladhari Divisions by capital outlay and average completion %
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Bar Chart
            </span>
          </div>
          <div className="h-64">
            <Bar data={gndBarData} options={chartOptions} />
          </div>
        </div>

        {/* Chart 2: Workflow Stage Doughnut */}
        <div className="gov-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Workflow Stage Distribution
              </h3>
              <p className="text-[11px] text-slate-500">
                Portfolio distribution across statutory lifecycles
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Doughnut
            </span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { color: '#475569', font: { size: 10, family: 'Inter', weight: '600' } }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Chart 3: Category Breakdown Bar */}
        <div className="gov-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Programme Category Breakdown
              </h3>
              <p className="text-[11px] text-slate-500">
                Financial allocation by development sector (Rural Roads, Prajashakthi, etc.)
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
              Category Matrix
            </span>
          </div>
          <div className="h-64">
            <Bar data={categoryBarData} options={chartOptions} />
          </div>
        </div>

        {/* Chart 4: Physical vs Financial Comparison */}
        <div className="gov-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Physical vs. Financial Progress Comparison
              </h3>
              <p className="text-[11px] text-slate-500">
                Verifying that disbursement closely tracks physical ground execution
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              Audit Tracker
            </span>
          </div>
          <div className="h-64">
            <Bar data={dualProgressData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Critical Alerts Spotlight */}
      {(flaggedList || []).length > 0 && (
        <div className="gov-card p-5 border-l-4 border-rose-500 bg-rose-50/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-rose-900">
                Critical Project Bottlenecks Requiring Planning Branch Intervention ({flaggedList.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateToTab?.('delays')}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center space-x-1"
            >
              <span>View All Bottlenecks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {flaggedList.map(p => {
              const alerts = getProjectAlerts?.(p) || [];
              const pId = p?.id || 'PROJ';
              const pName = p?.name || p?.title || 'Project';
              const pGnd = p?.gndCode || p?.gndName || p?.gnd || '';
              const pProgress = Number(p?.physicalProgress ?? p?.progress ?? 0);

              return (
                <div
                  key={pId}
                  onClick={() => openProjectDetail?.(p)}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-rose-400 cursor-pointer shadow-sm transition flex items-start justify-between"
                >
                  <div className="space-y-1 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {pId}
                      </span>
                      <span className="text-[10px] text-slate-600 font-semibold">
                        {pGnd}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate">{pName}</h4>
                    <p className="text-[11px] text-rose-700 font-semibold">
                      {alerts?.[0]?.label || 'Pending intervention'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-600">{pProgress}%</span>
                    <p className="text-[9px] text-slate-500">Physical</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
