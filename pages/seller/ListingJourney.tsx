
import React, { useState } from 'react';
import { 
  Sparkles, Bot, TrendingUp, Clock, MapPin, 
  ChevronRight, CheckCircle2, Circle, ArrowRight,
  ShieldCheck, Zap, Home, DollarSign, Activity,
  Info, MessageSquare, LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ListingJourney: React.FC = () => {
  const { user } = useAuth();

  const stages = [
    { id: 'prep', title: 'Preparation', status: 'complete', desc: 'Photos & Staging' },
    { id: 'active', title: 'Active Market', status: 'active', desc: 'Showings & Feedback' },
    { id: 'negotiation', title: 'Negotiation', status: 'upcoming', desc: 'Offer Review' },
    { id: 'pending', title: 'Under Contract', status: 'upcoming', desc: 'Due Diligence' },
    { id: 'closing', title: 'Closing', status: 'upcoming', desc: 'Final Handover' }
  ];

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      {/* Hero Section */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden border-b-8 border-indigo-600">
        <div className="absolute right-0 top-0 p-12 opacity-5 rotate-12"><LayoutDashboard size={200}/></div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-900/50">
              <Sparkles size={20} className="text-white"/>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Main Dashboard</span>
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-4 leading-none">The Listing <br/> Journey.</h1>
          <p className="text-indigo-100 text-lg font-medium opacity-90 leading-relaxed mb-8">
            Your home is currently in the <strong className="text-white underline">Active Marketing Phase</strong>. 
            Smart Engine AI is monitoring buyer sentiment across 14 channels in real-time.
          </p>
          <div className="flex gap-4">
             <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-0.5">Phase Efficiency</p>
                <p className="text-xl font-black">94% OPTIMIZED</p>
             </div>
             <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-0.5">Velocity</p>
                <p className="text-xl font-black">ABOVE AVG</p>
             </div>
          </div>
        </div>
      </div>

      {/* Progress Track */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4">
              {stages.map((stage, i) => (
                  <div key={stage.id} className="flex-1 w-full flex flex-col items-center text-center relative group">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-500 z-10 ${
                          stage.status === 'complete' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-inner' :
                          stage.status === 'active' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-110 ring-4 ring-indigo-50' :
                          'bg-slate-50 text-slate-300 border border-slate-100'
                      }`}>
                          {stage.status === 'complete' ? <CheckCircle2 size={24}/> : <span className="font-black text-xs">{i + 1}</span>}
                      </div>
                      <h4 className={`text-[11px] font-black uppercase tracking-widest ${stage.status === 'active' ? 'text-slate-900' : 'text-slate-400'}`}>{stage.title}</h4>
                      <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">{stage.desc}</p>
                      
                      {i < stages.length - 1 && (
                          <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-slate-100 -z-0" />
                      )}
                  </div>
              ))}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* AI Market Analysis */}
          <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-indigo-600">
                            <Bot size={24}/>
                        </div>
                        <div>
                            <h3 className="font-black text-sm text-slate-800 uppercase tracking-widest">AI Market Pulse Analysis</h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5 italic">Real-time Comp & Sentiment Aggregation</p>
                        </div>
                    </div>
                  </div>
                  <div className="p-8 space-y-8">
                      <div className="flex items-start gap-6">
                          <div className="flex-1 space-y-6">
                              <p className="text-lg font-bold text-slate-700 leading-relaxed italic">
                                "Analysis complete for <span className="text-indigo-600">78704 Market Segment</span>. Your property is currently outperforming the average View-to-Save ratio by <span className="text-emerald-600">22%</span>. However, showing volume suggests price resistance at the 5% upper bound."
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-3xl">
                                      <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                          <TrendingUp size={14}/> Recommendation
                                      </h5>
                                      <p className="text-sm font-bold text-indigo-900 leading-relaxed">Consider a $2,000 professional landscaping refresh to enhance first-impression curb appeal.</p>
                                  </div>
                                  <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-3xl">
                                      <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                          <ShieldCheck size={14}/> Risk Factor
                                      </h5>
                                      <p className="text-sm font-bold text-emerald-900 leading-relaxed">Interest rates projected to tick up next Tuesday. High urgency to capture weekend tours.</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Quick Actions for Sellers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-400 transition-all">
                      <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all shadow-inner">
                              <MessageSquare size={20}/>
                          </div>
                          <div className="text-left">
                              <p className="font-black text-slate-900 uppercase tracking-tight text-base leading-none mb-1">Message Agent</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sarah Smith • Online</p>
                          </div>
                      </div>
                      <ChevronRight size={20} className="text-slate-200 group-hover:text-indigo-600 transition-all" />
                  </button>
                  <button className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-400 transition-all">
                      <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all shadow-inner">
                              <Home size={20}/>
                          </div>
                          <div className="text-left">
                              <p className="font-black text-slate-900 uppercase tracking-tight text-base leading-none mb-1">Update Listing</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Photos • Description</p>
                          </div>
                      </div>
                      <ChevronRight size={20} className="text-slate-200 group-hover:text-indigo-600 transition-all" />
                  </button>
              </div>
          </div>

          {/* Side Panel: Contextual Insights */}
          <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                  <div className="absolute right-0 top-0 p-4 opacity-5"><Zap size={100}/></div>
                  <h4 className="font-black text-[9px] text-indigo-400 uppercase tracking-[0.3em] mb-6">Recent Milestone</h4>
                  <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-emerald-400">
                          <CheckCircle2 size={24}/>
                      </div>
                      <div>
                          <p className="font-black text-sm uppercase tracking-tight leading-none mb-1">MLS Launch Success</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Oct 29, 2024</p>
                      </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <p className="text-[10px] text-slate-300 font-medium leading-relaxed italic">
                        "Your home was successfully syndicated to Zillow, Realtor.com, and Redfin. Traffic peaked at 240 views per hour."
                      </p>
                  </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
                  <h4 className="font-black text-[9px] text-slate-800 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <Activity size={16} className="text-indigo-600" /> Showing Velocity
                  </h4>
                  <div className="space-y-6">
                      {[
                          { label: 'This Week', val: '12 Tours', color: 'bg-indigo-600' },
                          { label: 'Benchmark', val: '8 Tours', color: 'bg-slate-200' },
                      ].map(item => (
                          <div key={item.label}>
                              <div className="flex justify-between items-baseline mb-2">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                  <span className="text-sm font-black text-slate-800 uppercase tracking-tighter">{item.val}</span>
                              </div>
                              <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                                  <div className={`h-full ${item.color} rounded-full`} style={{ width: item.label === 'Benchmark' ? '65%' : '100%' }} />
                              </div>
                          </div>
                      ))}
                      <button className="w-full mt-4 py-3 bg-slate-50 text-slate-600 rounded-xl font-black uppercase text-[8px] tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                          View Calendar <ChevronRight size={12}/>
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ListingJourney;
