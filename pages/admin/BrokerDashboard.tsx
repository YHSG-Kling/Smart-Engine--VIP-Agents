
import React, { useState, useEffect } from 'react';
import { 
    Activity, DollarSign, Users, AlertTriangle, ShieldAlert, BarChart3, Clock, Zap, Target, 
    TrendingUp, ArrowUpRight, FileText, CheckCircle2, Search, Filter, Download, ArrowRight, 
    Bot, ListChecks, Database, ShieldCheck, Briefcase, MessageSquare, Map, Handshake, Globe,
    Medal, Trophy, TrendingDown, PieChart, Wallet, Star, ChevronRight, MousePointerClick,
    ExternalLink, Check, UserPlus, Sparkles, Info, RefreshCw, Layers, Archive, XCircle,
    User, Phone, Mail, MapPin, BadgeCheck, Trash2, Award, LayoutList, Pen,
    Heart, MessageCircle, AlertCircle, Share2, ChartBarStacked,
    // Fix: Added missing HeartPulse and BarChart
    HeartPulse, BarChart
} from 'lucide-react';
import { n8nService } from '../../services/n8n';
import { ClientActionLog, ReferralRecord, ComplianceReport, ListingIntakeDraft, ReviewAndFeedback, ClientReferral } from '../../types';

interface ProductionReport {
    id: string;
    period: string;
    totalVolume: string;
    topAgent: string;
    growthPercent: number;
    dealsClosed: number;
    avgCommission: string;
    aiNarrative: string;
}

interface VelocityMetric {
    agent: string;
    avgHoursToSign: number;
    completionRate: number;
    trend: 'up' | 'down';
}

const BrokerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'kpis' | 'reports' | 'referrals' | 'logs' | 'intake' | 'velocity' | 'reputation' | 'source-tracking' | 'retention'>('kpis');
  
  // State for Risk Alerts
  const [riskAlerts] = useState([
    { id: 101, type: 'anomaly', level: 'high', title: 'Unusual Activity', desc: 'Listing agreement for 456 Elm was deleted by Agent Mike.' },
    { id: 102, type: 'stall', level: 'medium', title: 'Pipeline Stall', desc: '3 deals in "Negotiation" haven\'t moved in 10 days.' },
  ]);

  // Workflow 142: Source Tracking Data
  const [topReferrers] = useState<{name: string, count: number, gci: number}[]>([
      { name: 'Alice Freeman', count: 4, gci: 42000 },
      { name: 'John Smith', count: 3, gci: 28500 },
      { name: 'Emma Stone', count: 2, gci: 18000 },
  ]);

  // Workflow 141: Reputation Data
  const [recentReviews] = useState<ReviewAndFeedback[]>([
      { id: 'rv1', transactionId: 'd1', clientName: 'Alice Freeman', agentName: 'Sarah Smith', internalRating: 5, status: 'Received', giftSent: true, timestamp: '1h ago', sentimentTrend: 'Euphoric' },
      { id: 'rv2', transactionId: 'd2', clientName: 'Bob Driller', agentName: 'Mike Ross', internalRating: 2, status: 'Negative Intervention', giftSent: false, timestamp: '4h ago', sentimentTrend: 'Rocky', feedbackText: 'Closing was delayed by 3 days and I felt out of the loop.' },
      { id: 'rv3', transactionId: 'd3', clientName: 'Charlie Day', agentName: 'Jessica Pearson', internalRating: 5, status: 'Received', giftSent: true, timestamp: '1d ago', sentimentTrend: 'Positive' },
  ]);

  // Workflow 138: Velocity Data
  const [velocityMetrics] = useState<VelocityMetric[]>([
      { agent: 'Sarah Smith', avgHoursToSign: 4.2, completionRate: 98, trend: 'up' },
      { agent: 'Mike Ross', avgHoursToSign: 12.5, completionRate: 85, trend: 'down' },
      { agent: 'Jessica Pearson', avgHoursToSign: 2.1, completionRate: 100, trend: 'up' },
      { agent: 'Harvey Specter', avgHoursToSign: 6.8, completionRate: 92, trend: 'up' },
  ]);

  // Workflow 95: Referral State
  const [pendingReferrals, setPendingReferrals] = useState<ReferralRecord[]>([
      { 
          id: 'ref1', referrerId: 'p1', referrerName: 'Chase Mortgages', leadName: 'Tom Jenkins', budget: 850000, 
          preferredArea: 'Austin 78704', leadEmail: 'tom@example.com',
          status: 'New', timestamp: '1h ago',
          aiMatchScores: [
              { agentName: 'Sarah Smith', score: 95, rationale: 'Expert in 78704. Average price point $900k aligns perfectly with her Q3 performance.' },
              { agentName: 'Mike Ross', score: 72, rationale: 'Serves area but lower average price point history compared to target.' },
              { agentName: 'Harvey Specter', score: 64, rationale: 'Luxury focus, but territory mismatch for this specific zip code.' }
          ],
          notes: 'High-intent buyer relocating for a tech role at Apple. Needs rapid service.'
      },
      { 
          id: 'ref2', referrerId: 'p2', referrerName: 'Elite Realty NYC', leadName: 'Sara Connor', budget: 1500000, 
          preferredArea: 'West Lake Hills', leadEmail: 'sara@example.com',
          status: 'New', timestamp: '3h ago',
          aiMatchScores: [
              { agentName: 'Harvey Specter', score: 98, rationale: 'Specializes in West Lake Luxury. High probability of closing high-value contracts.' },
              { agentName: 'Sarah Smith', score: 85, rationale: 'Strong luxury closer but West Lake is her secondary territory.' }
          ],
          notes: 'Looking for a private estate. Privacy and security are top priorities.'
      }
  ]);

  // Workflow 111: Intake Log State
  const [intakeDrafts] = useState<ListingIntakeDraft[]>([
      { id: 'd1', address: '123 Main St', agentName: 'Sarah Smith', status: 'Draft', createdAt: 'Today, 2:00 PM', timeInPipeline: '14 mins', beds: 4, baths: 3 },
      { id: 'd2', address: '456 Oak Ave', agentName: 'Mike Ross', status: 'Draft', createdAt: 'Yesterday, 10:00 AM', timeInPipeline: '24h', beds: 3, baths: 2 }
  ]);

  // System Logs State
  const [triggerLogs] = useState<ClientActionLog[]>([
      { id: 'tr1', actionName: 'request_repair', status: 'Complete', timestamp: 'Today, 2:14 PM', payloadData: { deal: '123 Main', agent: 'Sarah' }, clientName: 'Alice' },
      { id: 'tr2', actionName: 'cancel_showings', status: 'Complete', timestamp: 'Today, 1:45 PM', payloadData: { range: 'Oct 30-31' }, clientName: 'Bob' },
      { id: 'tr3', actionName: 'upload_bank_stmt', status: 'Processing', timestamp: 'Today, 12:10 PM', payloadData: { file: 'stmt_oct.pdf' }, clientName: 'Charlie' }
  ]);

  // Repurposed: Agent Production Apex Reports
  const [productionReports] = useState<ProductionReport[]>([
    { id: 'apx1', period: 'October 2024', totalVolume: '$42.5M', topAgent: 'Jessica Pearson', growthPercent: 12.4, dealsClosed: 48, avgCommission: '$28.4k', aiNarrative: 'A record-breaking month for the Luxury segment. The 78704 zip code contributed 40% of total volume.' },
    { id: 'apx2', period: 'September 2024', totalVolume: '$38.1M', topAgent: 'Sarah Smith', growthPercent: -2.1, dealsClosed: 41, avgCommission: '$24.2k', aiNarrative: 'Seasonal cooling observed in the mid-market. Recommended a shift toward investor-focused listings for Q4.' }
  ]);

  const systemModules = [
      { name: 'Lead CRM', status: 'Operational', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
      { name: 'Global Inbox', status: 'Operational', icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-50' },
      { name: 'Deal Desk', status: 'Alert', icon: Briefcase, color: 'text-orange-500', bg: 'bg-orange-50' },
      { name: 'Marketing Studio', status: 'Operational', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
      { name: 'Financials', status: 'Operational', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
      { name: 'Map Intelligence', status: 'Operational', icon: Globe, color: 'text-purple-500', bg: 'bg-purple-50' },
      { name: 'Referral Portal', status: 'Operational', icon: Handshake, color: 'text-indigo-500', bg: 'bg-indigo-50' },
      { name: 'Compliance', status: 'Operational', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-600' },
  ];

  const agentPerformance = [
      { name: 'Sarah Smith', volume: '$12.5M', deals: 24, conversion: '4.2%', trend: 'up', avatar: 'SS' },
      { name: 'Mike Ross', volume: '$4.2M', deals: 8, conversion: '3.1%', trend: 'stable', avatar: 'MR' },
      { name: 'Jessica Pearson', volume: '$28.0M', deals: 42, conversion: '5.8%', trend: 'up', avatar: 'JP' },
  ];

  const handleAssignReferral = (refId: string, agentName: string) => {
      setPendingReferrals(prev => prev.filter(r => r.id !== refId));
      alert(`Referral assigned to ${agentName}. Notification sent via Slack.`);
  };

  return (
    <div className="space-y-5 animate-fade-in pb-20">
      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">Broker Command.</h2>
        <div className="flex bg-white rounded-xl p-0.5 border border-slate-200 shadow-sm overflow-x-auto max-w-full scrollbar-hide">
            {[
                { id: 'kpis', label: 'Status', icon: Activity },
                { id: 'source-tracking', label: 'Referral Engine', icon: Share2 }, 
                { id: 'retention', label: 'Retention Apex', icon: HeartPulse }, // Workflow 154
                { id: 'reputation', label: 'Reputation', icon: Heart },
                { id: 'referrals', label: 'Partner Refs', icon: Handshake },
                { id: 'intake', label: 'Intake Log', icon: LayoutList },
                { id: 'velocity', label: 'Sign Velocity', icon: Pen },
                { id: 'reports', label: 'Production Apex', icon: Award },
                { id: 'logs', label: 'Trigger Logs', icon: ListChecks }
            ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <tab.icon size={12} /> {tab.label}
                </button>
            ))}
        </div>
      </div>
      
      {activeTab === 'kpis' && (
        <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 p-5 rounded-2xl shadow-xl text-white border-b-4 border-indigo-600 relative overflow-hidden group">
                    <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Company GCI (MTD)</p>
                    <h3 className="text-2xl font-black tracking-tighter">$482,000</h3>
                    <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1 mt-1"><ArrowUpRight size={10}/> +12% VS LAST MO</span>
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10 group-hover:scale-110 transition-transform"><DollarSign size={80}/></div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">IDX Traffic</p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">142 Active</h3>
                    <p className="text-[8px] text-indigo-600 font-bold mt-1 uppercase tracking-widest">Peak: 2 PM Today</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Deals</p>
                    <h3 className="text-2xl font-black text-indigo-600 tracking-tight">14 Active</h3>
                    <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Avg 22d Velocity</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Entity Risk</p>
                    <h3 className="text-2xl font-black text-orange-500 tracking-tight">Elevated</h3>
                    <p className="text-[8px] text-red-400 font-bold mt-1 uppercase tracking-widest">2 Critical Flags</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-8 space-y-5">
                    <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-6">
                            <h3 className="font-black text-[9px] text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Trophy size={14} className="text-yellow-500" /> Apex Performance Leaderboard
                            </h3>
                        </div>
                        <div className="p-2">
                            {agentPerformance.map((agent, i) => (
                                <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-yellow-400 text-slate-900 shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                                            {agent.avatar}
                                        </div>
                                        <div>
                                            <p className="font-black text-[11px] uppercase text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{agent.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{agent.deals} Deals • {agent.conversion} Conv.</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-indigo-600 tracking-tight">{agent.volume}</p>
                                        <div className="flex items-center justify-end gap-1 mt-0.5">
                                            {agent.trend === 'up' ? <TrendingUp size={10} className="text-emerald-500"/> : <TrendingDown size={10} className="text-red-500"/>}
                                            <span className="text-[8px] font-black text-slate-400 uppercase">{agent.trend}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-6">
                            <h3 className="font-black text-[9px] text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Zap size={14} className="text-indigo-600" /> Module Cockpit
                            </h3>
                        </div>
                        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {systemModules.map((m, i) => (
                                <div key={i} className="p-4 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 transition-all cursor-pointer group shadow-sm">
                                    <div className={`p-2 rounded-lg ${m.bg} ${m.color} w-fit mb-3 group-hover:scale-110 transition-transform`}>
                                        <m.icon size={18} />
                                    </div>
                                    <h4 className="font-black text-slate-900 uppercase tracking-tight text-[10px] mb-1">{m.name}</h4>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${m.status === 'Operational' ? 'bg-emerald-50' : 'bg-orange-50 animate-pulse'}`} />
                                        <span className="text-[8px] font-black text-slate-400 uppercase">{m.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-5">
                    <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-md overflow-hidden h-fit">
                        <div className="p-4 bg-slate-900 text-white flex justify-between items-center px-6">
                            <h3 className="font-black text-[9px] uppercase tracking-[0.2em] flex items-center gap-2">
                                <ShieldAlert size={14} className="text-indigo-400" /> Critical Risk Radar
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {riskAlerts.map(alert => (
                                <div key={alert.id} className="p-5 hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{alert.title}</p>
                                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium mt-1">{alert.desc}</p>
                                            <button className="mt-3 text-[9px] font-black text-indigo-600 uppercase flex items-center gap-1 group-hover:gap-1.5 transition-all">Audit Incident <ArrowRight size={10}/></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
      )}

      {/* --- WORKFLOW 154: RETENTION ANALYTICS (VIEW A) --- */}
      {activeTab === 'retention' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm relative overflow-hidden">
                      <div className="absolute right-0 top-0 p-10 opacity-5"><BarChart size={200}/></div>
                      <div className="relative z-10">
                        <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-8 flex items-center gap-3">
                            <HeartPulse size={24} className="text-indigo-600" /> Retention Analytics (Workflow 154)
                        </h3>
                        <div className="h-80 flex items-end justify-between gap-10 px-4">
                            {[
                                { label: 'New Leads', val: 142, color: 'bg-slate-200' },
                                { label: 'Sphere Refs', val: 312, color: 'bg-indigo-600' }
                            ].map(bar => (
                                <div key={bar.label} className="flex-1 flex flex-col items-center">
                                    <div className="text-sm font-black text-slate-900 mb-4">${bar.val}k</div>
                                    <div className={`w-full ${bar.color} rounded-t-3xl transition-all duration-1000 shadow-xl`} style={{ height: `${(bar.val / 312) * 100}%` }} />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">{bar.label}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-12 p-6 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center gap-6">
                            <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600"><Bot size={28}/></div>
                            <p className="text-sm font-bold text-indigo-900 leading-relaxed italic">
                                "Sphere-based referrals are generating <span className="text-indigo-600 underline">2.2x more GCI</span> per lead than standard cold acquisition this quarter. AI Anniversary Nurture (Protocol 154) is highly effective."
                            </p>
                        </div>
                      </div>
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl flex flex-col justify-center text-center border-b-8 border-indigo-600 relative overflow-hidden">
                        <div className="absolute right-[-10px] top-[-10px] p-4 opacity-10"><Users size={120}/></div>
                        <p className="text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-2 px-1">Sphere Engagement</p>
                        <h3 className="text-4xl font-black italic tracking-tighter tabular-nums mb-4">94.2%</h3>
                        <p className="text-[10px] text-indigo-200 font-medium">Of past clients have engaged with their Home Equity Report in the last 12 months.</p>
                      </div>
                      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm text-center">
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-2">Churn Risk Index</p>
                        <h3 className="text-4xl font-black text-emerald-600 tracking-tighter">LOW</h3>
                        <p className="text-[8px] text-slate-400 font-bold uppercase mt-2 tracking-widest">Protocol 154 active on 1,242 nodes</p>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- WORKFLOW 142: SOURCE TRACKING DASHBOARD (VIEW A) --- */}
      {activeTab === 'source-tracking' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                      <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                        <PieChart size={18} className="text-indigo-600" /> Revenue by Referral Source
                      </h3>
                      <div className="space-y-6">
                        {[
                            { source: 'Past Clients', percent: 65, color: 'bg-indigo-600', val: '$312k' },
                            { source: 'Lender Network', percent: 20, color: 'bg-emerald-500', val: '$96k' },
                            { source: 'Agent-to-Agent', percent: 15, color: 'bg-blue-400', val: '$74k' },
                        ].map(item => (
                            <div key={item.source}>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase mb-2">
                                    <span className="text-slate-500">{item.source}</span>
                                    <span className="text-slate-900">{item.val} ({item.percent}%)</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.percent}%` }} />
                                </div>
                            </div>
                        ))}
                      </div>
                  </div>

                  <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                          <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Medal size={18} className="text-indigo-600" /> Top Ambassadors (Workflow 142)
                          </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                <tr>
                                    <th className="p-8">Client Name</th>
                                    <th className="p-8 text-center">Referrals Sent</th>
                                    <th className="p-8 text-right">Attributed GCI</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                                {topReferrers.map((ref, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-8">
                                            <div className="font-black text-slate-900 uppercase tracking-tight">{ref.name}</div>
                                        </td>
                                        <td className="p-8 text-center">
                                            <div className="text-lg font-black text-indigo-600">{ref.count}</div>
                                        </td>
                                        <td className="p-8 text-right">
                                            <div className="text-lg font-black text-emerald-600 tabular-nums">${ref.gci.toLocaleString()}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- WORKFLOW 141: REPUTATION DASHBOARD (VIEW A) --- */}
      {activeTab === 'reputation' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Aggregate Review Score</p>
                      <div className="flex justify-center text-yellow-400 mb-2">
                          {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
                      </div>
                      <h3 className="text-4xl font-black text-slate-900 tracking-tighter">4.92 / 5.0</h3>
                  </div>
                  <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-xl text-white flex flex-col justify-center border-b-8 border-indigo-900">
                      <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Conversion Velocity</p>
                      <h3 className="text-3xl font-black tracking-tighter">84% Recieved</h3>
                      <p className="text-[9px] font-bold text-indigo-100 mt-2 uppercase tracking-widest italic">AI NUDGE PROTOCOL ACTIVE</p>
                  </div>
                  <div className="bg-red-50 p-8 rounded-[2rem] border-2 border-red-100 shadow-sm flex flex-col justify-center text-center group">
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Intervention Required</p>
                      <h3 className="text-3xl font-black text-red-600 tracking-tighter">1 Deal Flagged</h3>
                      <p className="text-[8px] text-red-400 font-bold uppercase mt-2 tracking-widest">SENTIMENT: ROCKY</p>
                  </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                      <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Heart size={18} className="text-indigo-600" /> Agency-Wide Reputation Ledger
                      </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-8">Client Entity</th>
                                <th className="p-8">Agent Professional</th>
                                <th className="p-8">Internal Rating</th>
                                <th className="p-8">Logic Status</th>
                                <th className="p-8 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                            {recentReviews.map((rv, i) => (
                                <tr key={i} className={`hover:bg-slate-50 transition-colors ${rv.internalRating < 4 ? 'bg-red-50/30' : ''}`}>
                                    <td className="p-8">
                                        <div className="font-black text-slate-900 uppercase tracking-tight">{rv.clientName}</div>
                                        <div className="text-[8px] text-slate-400 uppercase font-black mt-1">Closed {rv.timestamp}</div>
                                    </td>
                                    <td className="p-8 uppercase text-slate-600 font-black">{rv.agentName}</td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-2">
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, j) => (
                                                    <Star key={j} size={12} fill={j < rv.internalRating ? "currentColor" : "none"} className={j < rv.internalRating ? "text-yellow-400" : "text-slate-200"} />
                                                ))}
                                            </div>
                                            <span className={`text-[10px] font-black ${rv.internalRating >= 5 ? 'text-emerald-600' : 'text-red-500'}`}>{rv.internalRating}/5</span>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${
                                            rv.status === 'Received' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            rv.status === 'Negative Intervention' ? 'bg-red-50 text-red-700 border-red-100 animate-pulse' :
                                            'bg-indigo-50 text-indigo-700 border-indigo-100'
                                        }`}>
                                            {rv.status}
                                        </span>
                                    </td>
                                    <td className="p-8 text-right">
                                        {rv.internalRating < 4 ? (
                                            <button className="bg-red-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 ml-auto">
                                                <AlertCircle size={12}/> Intervene Now
                                            </button>
                                        ) : (
                                            <button className="p-2 text-slate-300 hover:text-indigo-600 transition-all"><MessageCircle size={18}/></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
              </div>
          </div>
      )}

      {/* Workflow 138: Signature Velocity Report */}
      {activeTab === 'velocity' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Pen size={180}/></div>
                  <div className="relative z-10">
                      <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-4">Signature Velocity.</h3>
                      <p className="text-indigo-100 text-sm font-medium opacity-90 leading-relaxed mb-8 max-w-xl">
                          Monitoring the friction between document delivery and final execution. AI behavioral nudges (Workflow 138) target agents and clients with high latency to prevent deal stalls.
                      </p>
                  </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                      <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                        <BarChart3 size={18} className="text-indigo-600" /> Agency Performance Matrix
                      </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-8">Professional</th>
                                <th className="p-8">Avg. Time to Sign</th>
                                <th className="p-8">Completion Rate</th>
                                <th className="p-8 text-right">Trend Logic</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                            {velocityMetrics.map((v, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-8">
                                        <div className="font-black text-slate-900 uppercase tracking-tight leading-none">{v.agent}</div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-sm font-black ${v.avgHoursToSign > 10 ? 'text-orange-500' : 'text-slate-800'}`}>{v.avgHoursToSign}h</span>
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                <div className={`h-full ${v.avgHoursToSign > 10 ? 'bg-orange-400' : 'bg-indigo-500'}`} style={{ width: `${Math.max(10, 100 - (v.avgHoursToSign * 5))}%` }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-900">{v.completionRate}%</span>
                                            <div className="w-px h-3 bg-slate-200" />
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">DocuSign Global</span>
                                        </div>
                                    </td>
                                    <td className="p-8 text-right">
                                        <div className="flex justify-end gap-2 items-center">
                                            {v.trend === 'up' ? <TrendingUp size={14} className="text-emerald-500"/> : <TrendingDown size={14} className="text-red-500"/>}
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${v.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>{v.trend === 'up' ? 'Improving' : 'Lagging'}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
              </div>
          </div>
      )}

      {/* Workflow 111: Intake Log Tab */}
      {activeTab === 'intake' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Average Time to List</p>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tighter">42 Mins</h3>
                      <p className="text-[9px] font-black text-emerald-600 uppercase mt-2 tracking-widest">-65% VS MANUAL</p>
                  </div>
                  <div className="bg-indigo-600 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 p-2 opacity-10"><Bot size={100}/></div>
                      <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Intake Efficiency</p>
                      <h3 className="text-3xl font-black tracking-tighter">98.4%</h3>
                      <p className="text-[9px] font-black text-indigo-300 uppercase mt-2 tracking-widest">AI Accuracy Index</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Drafts</p>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{intakeDrafts.length}</h3>
                      <p className="text-[9px] font-black text-slate-400 uppercase mt-2 tracking-widest">Protocol 111</p>
                  </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                      <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                        <LayoutList size={18} className="text-indigo-600" /> Instant Ingest Audit Log
                      </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-8">Draft Entity</th>
                                <th className="p-8">Professional</th>
                                <th className="p-8">AI Specs Captured</th>
                                <th className="p-8">Pipeline Age</th>
                                <th className="p-8 text-right">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                            {intakeDrafts.map(draft => (
                                <tr key={draft.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-8">
                                        <div className="font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{draft.address}</div>
                                        <span className="text-[8px] font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 uppercase">{draft.status}</span>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-400 text-[10px]">{draft.agentName[0]}</div>
                                            <span className="font-black text-slate-800 uppercase tracking-tight">{draft.agentName}</span>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-700">{draft.beds}B / {draft.baths}B</span>
                                            <div className="w-px h-3 bg-slate-200" />
                                            <span className="text-slate-400 font-bold">{draft.sqft} SQFT</span>
                                        </div>
                                    </td>
                                    <td className="p-8 text-slate-400 uppercase font-black">{draft.timeInPipeline}</td>
                                    <td className="p-8 text-right">
                                        <button className="p-2 text-slate-300 hover:text-indigo-600 transition-all"><ArrowRight size={18}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'referrals' && (
          <div className="space-y-4 animate-fade-in-up">
              {/* Compact Header Section */}
              <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border-b-4 border-indigo-900">
                  <div className="absolute right-0 top-0 p-8 opacity-10 pointer-events-none rotate-12"><Handshake size={120}/></div>
                  <div className="relative z-10 max-w-xl text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-2.5 mb-3">
                          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20"><Zap className="text-white animate-pulse" size={18}/></div>
                          <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Referral Intake.</h3>
                      </div>
                      <p className="text-indigo-100 text-xs font-medium leading-relaxed max-w-lg">
                          Algorithmic matching v2.4. Analyzing territory historicals, price alignment, and past closing velocity.
                      </p>
                  </div>
                  <div className="relative z-10 shrink-0 w-full md:w-auto">
                        <div className="bg-black/20 p-4 rounded-2xl border border-white/10 backdrop-blur-xl shadow-lg flex items-center gap-5 min-w-[220px]">
                            <div className="flex-1">
                                <p className="text-2xl font-black text-white tracking-tighter tabular-nums leading-none">{pendingReferrals.length}</p>
                                <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest mt-1">Pending Assignments</p>
                            </div>
                            <RefreshCw size={14} className="text-indigo-300 animate-spin-slow"/>
                        </div>
                  </div>
              </div>

              {/* Detailed Referral Cards */}
              <div className="space-y-4">
                  {pendingReferrals.map(ref => (
                      <div key={ref.id} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex flex-col lg:flex-row hover:border-indigo-400 transition-all duration-300 group">
                          {/* LEFT: Lead & Partner Identity */}
                          <div className="w-full lg:w-[320px] bg-slate-50 p-6 md:p-8 border-r border-slate-100 flex flex-col justify-between shrink-0">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-lg flex items-center justify-center font-black text-xl text-indigo-600 italic">
                                            {ref.leadName[0]}
                                        </div>
                                        <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-md">
                                            Priority
                                        </span>
                                    </div>
                                    
                                    <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-1.5">{ref.leadName}</h4>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mb-6 flex items-center gap-1.5">
                                        <MapPin size={12} className="text-indigo-400"/> {ref.preferredArea}
                                    </p>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="space-y-0.5">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Budget</p>
                                            <p className="text-lg font-black text-slate-900 tracking-tighter tabular-nums">${(ref.budget / 1000).toFixed(0)}k</p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Partner</p>
                                            <p className="text-sm font-black text-indigo-600 truncate">{ref.referrerName}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="bg-white p-3 rounded-xl border border-indigo-50 shadow-sm">
                                            <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                                <Info size={10}/> Intent Matrix
                                            </p>
                                            <p className="text-[10px] text-slate-600 italic leading-relaxed font-medium">"{ref.notes}"</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-200">
                                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Ingested: {ref.timestamp}</p>
                                </div>
                          </div>

                          {/* RIGHT: AI Recommendations Stack */}
                          <div className="flex-1 p-6 md:p-8 bg-white flex flex-col">
                              <div className="flex justify-between items-center mb-6 gap-4">
                                  <div>
                                      <h5 className="font-black text-xs text-slate-900 uppercase tracking-tight flex items-center gap-2 italic">
                                          <Bot size={18} className="text-indigo-600"/> Matching Recommendations.
                                      </h5>
                                  </div>
                                  <button className="bg-slate-100 text-slate-500 p-1.5 rounded-lg hover:bg-slate-200 transition-all"><Filter size={14}/></button>
                              </div>

                              <div className="space-y-3 flex-1">
                                  {ref.aiMatchScores.map((match, i) => (
                                      <div 
                                        key={i} 
                                        className={`p-4 rounded-2xl border-2 transition-all group/agent flex items-center justify-between gap-4 ${
                                            i === 0 
                                            ? 'bg-indigo-50/50 border-indigo-100 shadow-sm' 
                                            : 'bg-white border-slate-50 hover:border-slate-100'
                                        }`}
                                      >
                                          <div className="flex items-center gap-4 min-w-0 flex-1">
                                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm italic shadow-md shrink-0 ${
                                                  i === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'
                                              }`}>
                                                  {match.agentName[0]}
                                              </div>
                                              <div className="min-w-0 flex-1">
                                                  <div className="flex items-center gap-2 mb-1">
                                                      <p className="font-black text-sm text-slate-900 uppercase tracking-tighter truncate leading-none">{match.agentName}</p>
                                                      <span className={`text-base font-black tabular-nums ${i === 0 ? 'text-indigo-600' : 'text-slate-400'}`}>{match.score}%</span>
                                                  </div>
                                                  <p className="text-[10px] text-slate-500 leading-tight font-medium italic line-clamp-1 group-hover/agent:line-clamp-none transition-all">"{match.rationale}"</p>
                                              </div>
                                          </div>

                                          <div className="shrink-0">
                                              <button 
                                                onClick={() => handleAssignReferral(ref.id, match.agentName)}
                                                className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 ${
                                                    i === 0 
                                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                                                    : 'bg-slate-900 text-white hover:bg-black'
                                                }`}
                                              >
                                                  {i === 0 ? <Zap size={12}/> : <UserPlus size={12}/>}
                                                  Assign
                                              </button>
                                          </div>
                                      </div>
                                  ))}
                              </div>

                              <div className="mt-8 pt-6 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                                  <div className="flex items-center gap-2.5">
                                      <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100"><ShieldCheck size={14} className="text-emerald-500"/></div>
                                      <div>
                                          <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Audit Ready</p>
                                      </div>
                                  </div>
                                  <div className="flex gap-4">
                                      <button className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors">
                                          Reject
                                      </button>
                                      <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1.5">
                                          Details <ExternalLink size={12}/>
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
                  
                  {pendingReferrals.length === 0 && (
                      <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 animate-fade-in">
                          <CheckCircle2 size={32} className="mx-auto text-emerald-300 mb-4" />
                          <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Queue Cleared.</h4>
                          <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black uppercase text-[9px] tracking-widest">Refresh Inbox</button>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* REPURPOSED: Agent Production Reports (Apex Performance) */}
      {activeTab === 'reports' && (
          <div className="space-y-4 animate-fade-in-up">
              <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border-b-4 border-indigo-600">
                  <div className="absolute right-0 top-0 p-8 opacity-10 pointer-events-none rotate-12"><Award size={120}/></div>
                  <div className="relative z-10 max-w-xl text-center md:text-left">
                      <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none mb-2">Production Apex Reports.</h3>
                      <p className="text-indigo-200 text-xs font-medium leading-relaxed max-w-lg">
                          High-level production analytics, cohort performance metrics, and profitability audits for the brokerage.
                      </p>
                  </div>
                  <div className="relative z-10 flex gap-4">
                        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md text-center">
                            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">MTD VOLUME</p>
                            <p className="text-xl font-black text-white">$42.5M</p>
                        </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productionReports.map((report) => (
                    <div key={report.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-indigo-400 transition-all flex flex-col justify-between group">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 rounded-xl bg-slate-50 text-indigo-600 group-hover:scale-110 transition-transform`}><Medal size={20}/></div>
                                <div className={`px-2 py-1 rounded-lg flex flex-col items-center justify-center font-black bg-emerald-50 text-emerald-700 border border-emerald-100`}>
                                    <span className="text-[7px] uppercase tracking-widest mb-[-2px]">Growth</span>
                                    <span className="text-base tracking-tighter">+{report.growthPercent}%</span>
                                </div>
                            </div>
                            <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-1.5">{report.period}</h4>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-4">{report.dealsClosed} Closings • Avg. {report.avgCommission} Net</p>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Bot size={12}/> Executive Narrative</p>
                                <p className="text-[10px] text-slate-600 italic leading-relaxed font-medium">"{report.aiNarrative}"</p>
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest border-t border-slate-50 pt-3">
                                <span className="text-slate-400">Top Producer</span>
                                <span className="text-indigo-600">{report.topAgent}</span>
                            </div>
                        </div>
                        <button className="w-full mt-4 bg-slate-50 text-slate-900 py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2">
                            <Download size={14}/> Download Production Pack
                        </button>
                    </div>
                ))}
                <div className="border-2 border-dashed border-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center group hover:bg-slate-50 transition-all cursor-pointer min-h-[200px]">
                    <Archive size={32} className="text-slate-200 group-hover:text-indigo-300 transition-colors mb-3"/>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Access Historic production Pack</p>
                </div>
              </div>
          </div>
      )}

      {activeTab === 'logs' && (
          <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-md overflow-hidden animate-fade-in">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-6">
                <h3 className="font-black text-[9px] text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2"><ListChecks size={12} /> Portal Activity Trace</h3>
                <div className="flex gap-2">
                    <button className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 shadow-sm"><Search size={14}/></button>
                    <button className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 shadow-sm"><Filter size={14}/></button>
                </div>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] font-bold">
                      <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          <tr><th className="p-4">Action Trigger</th><th className="p-4">Client Entity</th><th className="p-4">JSON Payload Extract</th><th className="p-4">State</th><th className="p-4 text-right">Server Time</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {triggerLogs.map(log => (
                              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-4 uppercase text-indigo-600 font-black tracking-tight">{log.actionName}</td>
                                  <td className="p-4 text-slate-900 uppercase font-black">{log.clientName}</td>
                                  <td className="p-4 text-slate-400 font-mono text-[9px] truncate max-w-[200px]">{JSON.stringify(log.payloadData)}</td>
                                  <td className="p-4">
                                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                                          log.status === 'Complete' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'
                                      }`}>
                                          {log.status}
                                      </span>
                                  </td>
                                  <td className="p-4 text-right text-slate-400 uppercase font-black">{log.timestamp}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
    </div>
  );
};

export default BrokerDashboard;
