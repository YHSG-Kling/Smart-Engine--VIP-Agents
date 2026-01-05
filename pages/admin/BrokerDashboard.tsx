
import React, { useState } from 'react';
import { 
    Activity, DollarSign, Users, ShieldAlert, BarChart3, Clock, Zap, Target, 
    TrendingUp, ArrowUpRight, Award, Trophy, PieChart, Landmark, HeartPulse,
    Trophy as TrophyIcon, AlertTriangle, CheckCircle2, ChevronRight, Filter, Search,
    RefreshCw, Globe, Database, Bot
} from 'lucide-react';
import { FEATURE_FLAGS } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

type BrokerTab = 'kpis' | 'reports' | 'logs';

const BrokerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<BrokerTab>('kpis');

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-200">
        <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter italic leading-none">Broker Command.</h2>
        <div className="flex bg-white rounded-xl p-1 border border-slate-200 w-fit shadow-sm overflow-x-auto max-w-full scrollbar-hide">
            {[
                { id: 'kpis', label: 'Company KPIs', icon: Landmark },
                { id: 'reports', label: 'Performance', icon: BarChart3 },
                { id: 'logs', label: 'System Logs', icon: Database }
            ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as BrokerTab)}
                  className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-indigo-700 hover:bg-slate-50'}`}
                >
                    <tab.icon size={14}/> {tab.label}
                </button>
            ))}
        </div>
      </div>
      
      <div className="min-h-[500px]">
          {activeTab === 'kpis' && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl text-white border-b-8 border-indigo-600 relative overflow-hidden group">
                        <p className="text-indigo-400 text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Company GCI (MTD)</p>
                        <h3 className="text-4xl font-black tracking-tighter tabular-nums">$482,000</h3>
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-3 uppercase"><ArrowUpRight size={14}/> +12% VS LAST MO</span>
                        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-1000"><DollarSign size={120}/></div>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Team Consistency</p>
                        <h3 className="text-3xl font-black text-indigo-600 tracking-tight tabular-nums">88 Score</h3>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Deals</p>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight tabular-nums">14 Units</h3>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center border-b-8 border-orange-500">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Brokerage Risk</p>
                        <h3 className="text-3xl font-black text-orange-500 tracking-tight uppercase italic">Elevated</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-md p-8">
                        <h3 className="text-lg font-black italic tracking-tighter uppercase mb-8 flex items-center gap-2 text-slate-800"><Activity size={20} className="text-indigo-600"/> Velocity Audit</h3>
                        <div className="space-y-8">
                            {[
                                { label: 'New Listing Intake', current: 12, target: 15, color: 'bg-indigo-600' },
                                { label: 'Conversion Rate', current: 28, target: 35, color: 'bg-emerald-500' },
                                { label: 'Settlement Speed', current: 42, target: 40, color: 'bg-indigo-400' }
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-baseline mb-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                                        <span className="text-sm font-black text-slate-900">{stat.current} <span className="text-[10px] text-slate-300 font-bold italic">/ {stat.target}</span></span>
                                    </div>
                                    <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden shadow-inner">
                                        <div className={`h-full ${stat.color} rounded-full transition-all duration-1000`} style={{ width: `${(stat.current/stat.target)*100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-md p-8 flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-black italic tracking-tighter uppercase mb-6 flex items-center gap-2 text-slate-800"><Target size={20} className="text-indigo-600"/> Market Intelligence</h3>
                            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl mb-6">
                                {/* Fixed: Added Bot to icon imports to fix error on line 88 */}
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><Bot size={14}/> Executive Summary</p>
                                <p className="text-sm font-bold text-indigo-900 italic leading-relaxed">"The Austin core market is showing a 12% increase in listing velocity. Agent production is tracking at a 92% efficiency rating compared to brokerage historical benchmarks."</p>
                            </div>
                        </div>
                        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all">View Territory Drill-down</button>
                    </div>
                </div>
              </div>
          )}

          {activeTab === 'reports' && (
              <div className="space-y-6 animate-fade-in-up">
                  <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-10">
                          <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2"><Trophy size={18} className="text-indigo-600" /> Professional Leaderboard</h3>
                          <button className="text-[9px] font-black text-indigo-600 uppercase hover:underline">View All Agents</button>
                      </div>
                      <div className="divide-y divide-slate-100">
                          {[
                              { name: 'Sarah Smith', volume: '$12.5M', growth: '+14%', rank: 1 },
                              { name: 'Jessica Pearson', volume: '$11.8M', growth: '+8%', rank: 2 },
                              { name: 'Mike Ross', volume: '$4.2M', growth: '+22%', rank: 3 }
                          ].map((agent, i) => (
                              <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                  <div className="flex items-center gap-6">
                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg italic shadow-sm border ${i === 0 ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>{agent.rank}</div>
                                      <div>
                                          <h4 className="font-black text-slate-900 uppercase tracking-tight text-base leading-none mb-1 group-hover:text-indigo-600 transition-colors">{agent.name}</h4>
                                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{agent.volume} Volume MTD</p>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-sm font-black text-emerald-600 tabular-nums">{agent.growth}</p>
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">MTD Growth</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'logs' && (
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden animate-fade-in-up">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-10">
                      <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2"><Database size={18} className="text-indigo-600" /> Automation Event Log</h3>
                      <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"><RefreshCw size={16}/></button>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                              <tr>
                                  <th className="p-8">Protocol Cluster</th>
                                  <th className="p-8">Event Status</th>
                                  <th className="p-8">Context Detail</th>
                                  <th className="p-8 text-right">Timestamp</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                              {[
                                  { cluster: 'Listing Synerge', status: 'Success', detail: 'Automatic MLS syndication to 14 platforms complete.', time: '10 mins ago' },
                                  { cluster: 'CRM Intake', status: 'Warming', detail: 'Identified High-Intent lead from 78704 QR scan.', time: '24 mins ago' },
                                  { cluster: 'Risk Monitor', status: 'Alert', detail: 'Sentiment drop detected in client #88291 comms.', time: '1h ago' },
                              ].map((log, i) => (
                                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                                      <td className="p-8 font-black text-slate-900 uppercase tracking-tight">{log.cluster}</td>
                                      <td className="p-8">
                                          <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${log.status === 'Success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : log.status === 'Alert' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                                              {log.status}
                                          </span>
                                      </td>
                                      <td className="p-8 text-slate-500 font-medium italic">"{log.detail}"</td>
                                      <td className="p-8 text-right text-slate-400 uppercase font-black tabular-nums">{log.time}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default BrokerDashboard;
