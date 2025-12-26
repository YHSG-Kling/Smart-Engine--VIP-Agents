
import React, { useState } from 'react';
import { 
  TrendingUp, AlertCircle, CheckCircle2, Clock, Briefcase, 
  Users, Phone, ShieldAlert, ArrowRight, MapPin, 
  MessageSquare, Trophy, Zap, Bot, ListTodo, DollarSign, 
  Sparkles, Home, BarChart3, Eye, ChevronRight, Star, 
  Target, Plus, Search, Megaphone, Mail, Linkedin, Lock, ClipboardCheck,
  ZapOff, CalendarCheck, Activity, FileText, Hammer, ListCheck, Wallet, AlertTriangle, ArrowUpRight,
  Handshake, PhoneCall, X, Bell, LayoutDashboard, RefreshCw, ShieldCheck, PenTool, ExternalLink, Map as MapIcon,
  Navigation, Trash2, ChevronLeft, CreditCard, Receipt, PiggyBank, Filter, MoreVertical,
  Gavel, Smartphone, PieChart, Shield, FileDown
} from 'lucide-react';
import { Listing, UserContext, Deal, ReferralRecord, RiskIncident } from '../../types';

interface SmartNotification {
  id: string;
  type: 'lead' | 'risk' | 'gamification' | 'doc' | 'playbook' | 'escalation' | 'referral' | 'earnings' | 'portal_action';
  level: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  desc: string;
  timestamp: Date;
  action: string;
}

interface AgentDashboardProps {
    userContext?: UserContext | null;
    onNavigate?: (view: string) => void;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ userContext, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'risk' | 'earnings' | 'referrals' | 'overview'>('overview');
  const [showingModeEnabled, setShowingModeEnabled] = useState(true);
  
  const [activeRiskIncident, setActiveRiskIncident] = useState<RiskIncident | null>({
      id: 'ri1', severity: 'License Risk', triggerPhrase: 'sue', status: 'Open',
      transcript: 'Client: "If this inspection repair isn\'t settled by Friday, my lawyer said we will sue..."',
      clientName: 'Alice Freeman', agentName: 'Sarah Smith', dealId: '1', timestamp: '10 mins ago', sentimentScore: 0.12
  });

  const [tasks, setTasks] = useState([
    { id: 't1', title: 'Appraisal follow-up: 123 Main', due: 'Today, 5 PM', priority: 'High', category: 'Lending', completed: false },
    { id: 't2', title: 'Draft repair credit: 456 Oak', due: 'Tomorrow', priority: 'Critical', category: 'Inspection', completed: false },
    { id: 't3', title: 'Review settlement: 789 Pine', due: 'Wed', priority: 'Med', category: 'Closing', completed: true },
    { id: 't4', title: 'Schedule Photos: 555 Maple', due: 'Friday', priority: 'Low', category: 'Marketing', completed: false }
  ]);

  const [riskAlerts] = useState([
    { 
      id: 'r1', property: '456 Oak Ave', type: 'Contingency Delay', severity: 'Critical',
      desc: 'Inspection period terminates in 4 hours. No Repair Addendum detected in Vault.',
      aiStrategy: 'AI Suggestion: Offer a $1,500 designer paint credit to bypass minor repair list.'
    },
    { 
      id: 'r2', property: '123 Main St', type: 'Mortgage Milestone', severity: 'High',
      desc: 'Lender has not updated CTC status. 48h until contract deadline.',
      aiStrategy: 'AI Suggestion: Contact Underwriting directly via VIP Engine Secure Link.'
    }
  ]);

  const agentStats = {
    activeDeals: 4, pendingGCI: 42500, ytdVolume: 12500000, ytdGCI: 375000, leadsToday: 12, conversionRate: 3.4, capPaid: 18500, capTotal: 20000, nextPayout: 12400, payoutDate: 'Friday, Nov 3'
  };

  const [matchedReferrals] = useState<ReferralRecord[]>([
      { id: 'mr1', referrerId: 'p1', referrerName: 'Chase Mortgages', leadName: 'Tom Jenkins', budget: 850000, preferredArea: 'Austin 78704', leadEmail: 'tom@example.com', status: 'Matched', timestamp: 'Just Now', aiMatchScores: [{ agentName: 'You', score: 95, rationale: 'VIP Engine analyzed your recent sales in 78704.' }], notes: 'Relocating for tech job.' }
  ]);

  const [notifications] = useState<SmartNotification[]>([
    { id: 'pa1', type: 'portal_action', level: 'high', title: 'Reschedule Request', desc: 'Alice Freeman picked Tuesday 2 PM.', timestamp: new Date(), action: 'Sync Calendar' },
    { id: '1', type: 'risk', level: 'critical', title: 'Inspection Expiring', desc: '456 Oak Ave expires in 4h.', timestamp: new Date(), action: 'Resolve Now' },
  ]);

  const [activeDeals] = useState<Deal[]>([
    { id: '1', address: '123 Main St', price: 850000, stage: 'Under Contract', clientName: 'Alice Freeman', healthScore: 92, healthStatus: 'Healthy', nextTask: 'Order Title', missingDocs: 0, winProbability: 95 },
    { id: '2', address: '456 Oak Ave', price: 420000, stage: 'Active', clientName: 'Bob Driller', healthScore: 45, healthStatus: 'Critical', nextTask: 'Sign Addendum', missingDocs: 2, winProbability: 40 }
  ]);

  const toggleTask = (id: string) => {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 max-w-full overflow-hidden">
      {/* Field Mode Indicator */}
      {showingModeEnabled && userContext?.predictedIntent === 'Showing Mode' && (
          <div className="bg-indigo-600 rounded-3xl p-4 text-white shadow-xl relative overflow-hidden flex items-center justify-between group border-b-8 border-indigo-900 transition-all animate-fade-in-up">
              <div className="relative z-10 flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
                      <Navigation className="text-white animate-pulse" size={24} />
                  </div>
                  <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 leading-none mb-1">Active Showing Path</p>
                      <h2 className="text-lg font-black uppercase tracking-tighter italic truncate leading-none">{userContext.address}</h2>
                      <p className="text-[10px] font-bold text-indigo-100 mt-1 uppercase tracking-widest">Entry: {userContext.lockboxCode}</p>
                  </div>
              </div>
              <button onClick={() => setShowingModeEnabled(false)} className="relative z-10 p-3 bg-black/20 hover:bg-black/40 rounded-2xl transition-all"><X size={20} /></button>
          </div>
      )}

      {/* Tab Navigation */}
      <div className="flex bg-white rounded-xl p-1 border border-slate-200 w-fit shadow-sm overflow-x-auto max-w-full scrollbar-hide">
        {[
          { id: 'overview', label: 'Command', icon: LayoutDashboard },
          { id: 'referrals', label: 'Partners', icon: Handshake },
          { id: 'tasks', label: 'Tasks', icon: ListTodo },
          { id: 'risk', label: 'Legal Audit', icon: ShieldAlert },
          { id: 'earnings', label: 'Financials', icon: DollarSign }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'}`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in-up">
              <div className="lg:col-span-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative group overflow-hidden">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">MTD Volume</p>
                          <h3 className="text-3xl font-black tracking-tighter text-slate-900 tabular-nums italic">$1.2M</h3>
                          <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1 mt-2 uppercase"><ArrowUpRight size={12}/> +4.2% Growth</span>
                      </div>
                      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative group overflow-hidden">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Deals</p>
                          <h3 className="text-3xl font-black tracking-tighter text-indigo-600 italic">4 Units</h3>
                          <p className="text-[9px] text-slate-400 mt-2 uppercase font-bold tracking-widest italic">Avg 24d Velocity</p>
                      </div>
                      <div className="bg-slate-900 p-6 rounded-[2rem] shadow-2xl text-white relative overflow-hidden border-b-8 border-indigo-600">
                          <p className="text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-1">Pending GCI</p>
                          <h3 className="text-3xl font-black tracking-tighter tabular-nums italic">${agentStats.pendingGCI.toLocaleString()}</h3>
                      </div>
                  </div>

                  <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden border-b-8 border-indigo-800 group hover:scale-[1.01] transition-transform cursor-pointer" onClick={() => onNavigate && onNavigate('cma')}>
                      <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000"><FileDown size={200}/></div>
                      <div className="relative z-10 max-w-xl">
                        <div className="flex items-center gap-3 mb-6">
                          <Sparkles size={24} className="text-indigo-200"/>
                          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-100">Strategy Lab</span>
                        </div>
                        <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-2 leading-none">New Listing Pitch?</h3>
                        <p className="text-indigo-100 text-lg font-medium mb-10 opacity-90">Generate a branded, data-driven CMA and Marketing Roadmap in under 60 seconds with VIP Engine Vision.</p>
                        <button className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-2xl flex items-center gap-3 hover:bg-indigo-50 transition-colors active:scale-95">
                            <Bot size={20}/> Launch AI Architect
                        </button>
                      </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-md overflow-hidden">
                      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                          <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2"><Briefcase size={18} className="text-indigo-600" /> Active Transaction Board</h3>
                          <button onClick={() => onNavigate?.('transactions')} className="text-[10px] font-black uppercase text-indigo-600 hover:underline tracking-widest">Master View</button>
                      </div>
                      <div className="divide-y divide-slate-50">
                          {activeDeals.map(deal => (
                              <div key={deal.id} className="p-6 hover:bg-slate-50 transition-all group flex items-center justify-between cursor-pointer">
                                  <div className="flex items-center gap-5 min-w-0">
                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl italic border shadow-inner ${deal.healthStatus === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                          {deal.address[0]}
                                      </div>
                                      <div className="min-w-0">
                                          <h4 className="font-black text-slate-900 text-base uppercase tracking-tight italic truncate group-hover:text-indigo-600 transition-colors">{deal.address}</h4>
                                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{deal.clientName} • Stage: {deal.stage}</p>
                                      </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                      <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${deal.healthStatus === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                          {deal.healthStatus}
                                      </span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-md overflow-hidden">
                      <div className="p-6 bg-slate-900 text-white flex justify-between items-center px-8">
                          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                              <Bell size={18} className="text-indigo-400 animate-pulse" /> Pulse Feed
                          </h3>
                      </div>
                      <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto scrollbar-hide">
                          {notifications.map(n => (
                              <div key={n.id} className="p-6 hover:bg-slate-50 transition-colors cursor-pointer group">
                                  <div className="flex items-start gap-4">
                                      <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${n.level === 'critical' ? 'bg-red-500 animate-ping' : 'bg-indigo-500'}`} />
                                      <div className="min-w-0">
                                          <p className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1">{n.title}</p>
                                          <p className="text-xs text-slate-500 font-medium leading-relaxed italic">"{n.desc}"</p>
                                          <button className="mt-4 text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-1 hover:underline">
                                            {n.action} <ChevronRight size={10}/>
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-100 rounded-[2.5rem] p-8 shadow-inner group overflow-hidden relative">
                      <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700"><Trophy size={150}/></div>
                      <div className="relative z-10">
                        <h4 className="font-black text-xs uppercase tracking-widest text-indigo-900 mb-4">Top Achiever Badge</h4>
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center text-indigo-600 border-b-4 border-indigo-200">
                             <Sparkles size={28}/>
                          </div>
                          <div>
                            <p className="font-black text-slate-900 uppercase italic tracking-tighter">Volume Titan</p>
                            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">$12.5M Production Tier</p>
                          </div>
                        </div>
                        <button className="text-[9px] font-black uppercase text-indigo-600 tracking-widest hover:underline">View Badge Vault</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* TASKS VIEW */}
      {activeTab === 'tasks' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-md overflow-hidden">
                  <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-10">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600"><ListCheck size={24}/></div>
                          <div>
                              <h3 className="font-black text-lg text-slate-800 uppercase tracking-tighter italic">Milestone Queue.</h3>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Workflow 148: Deal Logistics Monitor</p>
                          </div>
                      </div>
                      <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">Add Manual Task</button>
                  </div>
                  <div className="divide-y divide-slate-100">
                      {tasks.map(task => (
                          <div key={task.id} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                              <div className="flex items-center gap-6">
                                  <button onClick={() => toggleTask(task.id)} className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-100' : 'bg-white border-slate-200 group-hover:border-indigo-600'}`}>
                                      {task.completed && <CheckCircle2 size={24} className="text-white"/>}
                                  </button>
                                  <div className={task.completed ? 'opacity-30 line-through' : ''}>
                                      <h4 className="font-black text-slate-900 uppercase tracking-tight text-base mb-1">{task.title}</h4>
                                      <div className="flex items-center gap-3">
                                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${task.priority === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{task.priority}</span>
                                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">{task.category} • Due {task.due}</span>
                                      </div>
                                  </div>
                              </div>
                              <button className="p-3 text-slate-200 hover:text-slate-900 transition-all"><MoreVertical size={24}/></button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* RISK VIEW */}
      {activeTab === 'risk' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-red-600 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-red-900">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><ShieldAlert size={180}/></div>
                  <div className="relative z-10 max-w-2xl">
                      <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-4 leading-none">Smart Engine Shield Audit.</h3>
                      <p className="text-red-100 text-lg font-medium opacity-90 leading-relaxed mb-8">
                          Smart Engine AI is monitoring all Deal Vaults. We have flagged <strong className="text-white underline">{riskAlerts.length} vulnerabilities</strong> requiring immediate mitigation or broker intervention.
                      </p>
                  </div>
              </div>
              <div className="grid grid-cols-1 gap-6">
                  {riskAlerts.map(alert => (
                      <div key={alert.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-10 relative group hover:border-red-300 transition-all">
                          <div className="flex flex-col lg:flex-row justify-between gap-10">
                              <div className="flex-1 space-y-6">
                                  <div className="flex items-center gap-4">
                                      <span className="bg-red-50 text-red-600 px-4 py-1 rounded-full text-[10px] font-black uppercase border border-red-100 shadow-sm">{alert.severity} Risk</span>
                                      <h4 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">{alert.property}</h4>
                                  </div>
                                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Gavel size={16}/> Critical Findings</p>
                                      <p className="text-base font-bold text-slate-800 leading-relaxed italic">"{alert.desc}"</p>
                                  </div>
                                  <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl">
                                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Bot size={16}/> AI Recovery Logic</p>
                                      <p className="text-base font-medium text-indigo-900 leading-relaxed italic">"{alert.aiStrategy}"</p>
                                  </div>
                              </div>
                              <div className="lg:w-72 flex flex-col gap-4 justify-center">
                                  <button className="w-full bg-red-600 text-white py-5 rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.15em] shadow-xl hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-3">
                                      <Phone size={18}/> Initiate Salvage Call
                                  </button>
                                  <button className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.15em] shadow-xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-3">
                                      <PenTool size={18}/> Draft Repair Addendum
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* EARNINGS VIEW */}
      {activeTab === 'earnings' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                  <div className="absolute right-0 top-0 p-8 opacity-5 rotate-12"><PiggyBank size={180}/></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                      <div className="max-w-2xl text-center md:text-left">
                          <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-4 leading-none">Your Earnings Ledger.</h3>
                          <p className="text-indigo-100 text-lg font-medium opacity-90 leading-relaxed mb-8">Sarah, your net revenue is tracking <strong className="text-white">12.4% higher</strong> than last month. VIP Engine has analyzed your production velocity and forecasts a strong Q4.</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] min-w-[280px] text-center shadow-2xl">
                          <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em] mb-3">NEXT PAYOUT PENDING</p>
                          <p className="text-5xl font-black text-white tracking-tighter tabular-nums italic leading-none mb-4">${agentStats.nextPayout.toLocaleString()}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Est Delivery: {agentStats.payoutDate}</p>
                          <button className="w-full mt-8 py-3 bg-white text-indigo-900 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-50 active:scale-95 transition-all">Audit Settlement Statement</button>
                      </div>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Volume (YTD)</p>
                       <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic leading-none">${ (agentStats.ytdVolume / 1000000).toFixed(1) }M</h3>
                   </div>
                   <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cap Progress</p>
                       <div className="flex items-center gap-4">
                           <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                               <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${ (agentStats.capPaid / agentStats.capTotal) * 100 }%` }} />
                           </div>
                           <span className="font-black text-slate-900 text-lg tabular-nums">{ Math.round((agentStats.capPaid / agentStats.capTotal) * 100) }%</span>
                       </div>
                   </div>
                   <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gross GCI (YTD)</p>
                       <h3 className="text-3xl font-black text-emerald-600 tracking-tighter italic leading-none">${ agentStats.ytdGCI.toLocaleString() }</h3>
                   </div>
              </div>
          </div>
      )}

      {/* REFERRALS VIEW */}
      {activeTab === 'referrals' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 gap-6">
                  {matchedReferrals.map(ref => (
                      <div key={ref.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-lg overflow-hidden flex flex-col md:flex-row group hover:border-indigo-400 transition-all">
                          <div className="bg-slate-50 p-10 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-center items-center text-center md:w-[320px] shrink-0">
                               <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-indigo-600 font-black text-3xl italic border border-indigo-50 mb-6">
                                  {ref.leadName[0]}
                               </div>
                               <h4 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-1">{ref.leadName}</h4>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">{ref.preferredArea} • ${ (ref.budget/1000).toFixed(0) }k</p>
                               <span className="bg-emerald-50 text-emerald-700 px-4 py-1 rounded-full text-[9px] font-black uppercase border border-emerald-100 shadow-sm">{ref.status}</span>
                          </div>
                          <div className="p-10 flex-1 flex flex-col justify-between bg-white">
                               <div className="space-y-6">
                                   <div className="flex items-center gap-3">
                                       <Bot size={20} className="text-indigo-600" />
                                       <h5 className="font-black text-[10px] text-indigo-600 uppercase tracking-[0.3em]">AI Matching Rationale</h5>
                                   </div>
                                   <p className="text-lg font-medium text-slate-600 leading-relaxed italic border-l-4 border-indigo-500 pl-8 mb-10">
                                       "{ref.aiMatchScores[0].rationale}"
                                   </p>
                               </div>
                               <div className="flex gap-4 pt-10 border-t border-slate-50">
                                   <button className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-indigo-900">
                                       <PhoneCall size={16}/> Accept & Initiate Warm Contact
                                   </button>
                                   <button className="px-6 py-4 bg-white border-2 border-slate-200 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-red-500 hover:border-red-200 transition-all">Decline</button>
                               </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default AgentDashboard;
