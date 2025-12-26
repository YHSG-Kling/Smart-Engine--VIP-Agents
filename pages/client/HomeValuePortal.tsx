
import React, { useState } from 'react';
import { 
  TrendingUp, Home, DollarSign, ArrowUpRight, ShieldCheck, 
  Activity, RefreshCw, Bot, Sparkles, Loader2, Download,
  Landmark, Info, MessageSquare, Briefcase, Zap, Key, User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const HomeValuePortal: React.FC = () => {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Workflow 154: Mock Home Value Data
  const [homeValue] = useState({
      estimatedValue: 625000,
      purchasePrice: 515000,
      equityPercent: 17.6,
      marketTrend: 'Bullish',
      neighborhoodAvg: 595000,
      zipCode: '78704'
  });

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
        setIsRefreshing(false);
        alert("BatchData API: Real-time AVM recalculated for 123 Main St. Snapshot persistent in portal vault.");
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-20 max-w-7xl mx-auto px-4">
      {/* Hero Header */}
      <div className="bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
        <div className="absolute right-0 top-0 p-12 opacity-5 rotate-12 pointer-events-none"><Landmark size={180}/></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center md:text-left">
                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3 px-1">Asset Management</p>
                <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase mb-3 leading-tight">Your Equity <br className="hidden md:block" /> Dashboard.</h2>
                <p className="text-indigo-100 text-sm md:text-base font-medium opacity-90 leading-relaxed">Tracking your home's performance as an investment. AI monitors market cycles to update your value in real-time.</p>
            </div>
            <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto">
                <button 
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-indigo-50 hover:text-indigo-900 active:scale-95 transition-all flex items-center justify-center gap-2 border-b-4 border-indigo-800"
                >
                    {isRefreshing ? <Loader2 className="animate-spin" size={16}/> : <RefreshCw size={16}/>}
                    Recalculate AVM
                </button>
                <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-center">
                    <p className="text-[8px] font-black text-indigo-300 uppercase mb-0.5">SOURCE: BATCHDATA AI</p>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-6">
              {/* Primary Value Card */}
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-lg p-6 md:p-10 relative overflow-hidden group">
                  <div className="absolute right-[-10px] top-[-10px] p-8 opacity-5 text-indigo-600 group-hover:rotate-12 transition-transform duration-700 pointer-events-none"><TrendingUp size={120}/></div>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                      <div className="space-y-1 text-center md:text-left">
                          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Estimated Market Value</p>
                          <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter tabular-nums italic leading-none">${homeValue.estimatedValue.toLocaleString()}</h3>
                          <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-black border border-emerald-100 flex items-center gap-1 shadow-sm">
                                  <ArrowUpRight size={12}/> +${(homeValue.estimatedValue - homeValue.purchasePrice).toLocaleString()}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Growth Since Purchase</span>
                          </div>
                      </div>
                      <div className="flex flex-col items-center justify-center bg-indigo-50 border border-indigo-100 p-6 md:p-8 rounded-[2.5rem] shadow-inner w-full md:w-auto min-w-[200px]">
                          <p className="text-[9px] font-black text-indigo-400 uppercase mb-3 tracking-widest text-center">Neighborhood percentile</p>
                          <div className="relative w-24 h-24 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white" />
                                    <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="264" strokeDashoffset={264 - (264 * 0.85)} className="text-indigo-600" strokeLinecap="round" />
                                </svg>
                                <span className="absolute text-lg font-black text-indigo-700 italic">85th</span>
                          </div>
                          <p className="text-[9px] text-indigo-900 font-bold mt-4 uppercase tracking-widest text-center">Zip Code {homeValue.zipCode}</p>
                      </div>
                  </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-indigo-400 transition-all">
                      <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors text-slate-400 group-hover:text-indigo-600 shadow-inner shrink-0">
                          <DollarSign size={20}/>
                      </div>
                      <div className="min-w-0">
                          <h4 className="font-black text-slate-900 uppercase tracking-tight text-xs mb-0.5">Purchase Price</h4>
                          <p className="text-base font-black text-slate-600 tabular-nums">${homeValue.purchasePrice.toLocaleString()} (2022)</p>
                      </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-indigo-400 transition-all">
                      <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-emerald-50 transition-colors text-slate-400 group-hover:text-emerald-600 shadow-inner shrink-0">
                          <Activity size={20}/>
                      </div>
                      <div className="min-w-0">
                          <h4 className="font-black text-slate-900 uppercase tracking-tight text-xs mb-0.5">Total Gain</h4>
                          <p className="text-base font-black text-emerald-600 tabular-nums">+{homeValue.equityPercent}% Change</p>
                      </div>
                  </div>
              </div>
          </div>

          {/* Right Sidebar Widgets */}
          <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl flex flex-col justify-between border-b-8 border-indigo-600">
                  <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-600 rounded-lg shadow-lg"><Sparkles size={16}/></div>
                        <h4 className="font-black text-[10px] uppercase tracking-widest text-indigo-400">Strategy Engine</h4>
                      </div>
                      <p className="text-xs font-bold leading-relaxed italic border-l-2 border-indigo-500 pl-4">
                          "Interest rates are lower than your purchase lock. You are a high-probability candidate for a <strong className="text-white underline">Refi Reset</strong>."
                      </p>
                      <button className="w-full py-3.5 bg-white text-slate-900 rounded-xl font-black uppercase text-[9px] tracking-[0.15em] shadow-2xl hover:bg-indigo-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                          <Landmark size={14}/> Get Refi Quote
                      </button>
                  </div>
              </div>

              <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col h-full">
                  <div>
                    <h4 className="font-black text-slate-800 text-[10px] uppercase tracking-widest mb-4">Market Velocity</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-6">
                        The {homeValue.zipCode} market is currently <strong className="text-slate-900 font-black italic uppercase">Bulllish</strong>. Average days on market: 12 days.
                    </p>
                  </div>
                  <button className="w-full mt-auto py-3.5 bg-indigo-600 text-white rounded-xl font-black uppercase text-[9px] tracking-[0.15em] shadow-xl hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2">
                      <ArrowUpRight size={14}/> Get Full Sell Report
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default HomeValuePortal;
