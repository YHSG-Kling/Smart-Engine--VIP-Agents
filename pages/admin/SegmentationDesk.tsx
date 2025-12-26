
import React, { useState } from 'react';
import { 
  Tags, Plus, Play, ShieldCheck, Zap, 
  Trash2, Edit3, Loader2, RefreshCw, Bot,
  MousePointerClick, Search, Filter, Info,
  CheckCircle2, XCircle, AlertTriangle, ArrowRight,
  Sparkles, ListChecks
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, TagRule } from '../../types';

const SegmentationDesk: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === UserRole.ADMIN || role === UserRole.BROKER;
  
  const [rules, setRules] = useState<TagRule[]>([
    { id: 'tr1', ruleName: 'Upsize Sherlock', conditionField: 'Property_Type', conditionValue: '4+ Bed', frequencyThreshold: 5, tagToApply: 'Upsize Candidate', isActive: true },
    { id: 'tr2', ruleName: 'Seller Intent Radar', conditionField: 'Page_URL', conditionValue: '/how-to-sell', frequencyThreshold: 2, tagToApply: 'Seller Intent', isActive: true },
    { id: 'tr3', ruleName: 'Luxury High-Rollers', conditionField: 'Price_Range', conditionValue: '>$2.5M', frequencyThreshold: 3, tagToApply: 'Luxury Lead', isActive: true },
    { id: 'tr4', ruleName: 'Condo Enthusiast', conditionField: 'Property_Type', conditionValue: 'Condo', frequencyThreshold: 4, tagToApply: 'Condo-Lover', isActive: false },
  ]);

  const [isProcessing, setIsProcessing] = useState(false);

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const handleRunSimulation = async () => {
    setIsProcessing(true);
    // Workflow 117 Global Simulation
    setTimeout(() => {
        setIsProcessing(false);
        alert("Behavioral Sherlock: Simulated scan of 1,200 leads complete. Applied 42 new tags based on digital body language.");
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Segmentation Desk.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Workflow 117: Behavioral Sherlock Engine</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleRunSimulation}
                disabled={isProcessing}
                className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
            >
                {isProcessing ? <Loader2 className="animate-spin" size={14}/> : <Play size={14}/>}
                Simulate Logic
            </button>
            <button className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-black transition-all">
                <Plus size={14}/> Add Rule
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute right-[-10px] bottom-[-10px] opacity-5 text-indigo-600 group-hover:scale-110 transition-transform"><Tags size={120}/></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Behavioral Tags</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">48 Categories</h3>
          </div>
          <div className="bg-indigo-600 p-6 rounded-[2rem] shadow-xl text-white flex flex-col justify-center relative overflow-hidden border-b-8 border-indigo-900">
              <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-1">AI Morph Volume</p>
              <h3 className="text-3xl font-black tracking-tighter">2,412 Tags Applied</h3>
              <div className="flex items-center gap-1 mt-1 text-indigo-300 text-[9px] font-black uppercase tracking-widest">
                <RefreshCw size={12} className="animate-spin-slow"/> REAL-TIME CLASSIFICATION
              </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Precision Index</p>
              <h3 className="text-3xl font-black text-emerald-600 tracking-tighter">98.2%</h3>
              <p className="text-[8px] text-slate-400 mt-1 uppercase font-bold tracking-widest italic">Confirmed by Agents</p>
          </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
              <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                <ListChecks size={18} className="text-indigo-600" /> Behavioral Rule Set
              </h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-3 h-3" />
                <input type="text" placeholder="FILTER RULES..." className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      <tr>
                          <th className="p-8">Rule Name</th>
                          <th className="p-8">Trigger Event Condition</th>
                          <th className="p-8">Frequency Threshold</th>
                          <th className="p-8">Tag to Apply</th>
                          <th className="p-8">Status</th>
                          <th className="p-8 text-right">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                      {rules.map(rule => (
                          <tr key={rule.id} className={`hover:bg-slate-50 transition-colors group ${!rule.isActive ? 'opacity-50' : ''}`}>
                              <td className="p-8">
                                  <div className="font-black text-slate-900 uppercase tracking-tight italic">{rule.ruleName}</div>
                              </td>
                              <td className="p-8">
                                  <div className="flex items-center gap-2">
                                      <span className="text-slate-400 uppercase">Field:</span>
                                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px] font-black uppercase">{rule.conditionField}</span>
                                      <span className="text-slate-300">is</span>
                                      <span className="text-indigo-600 font-black italic">"{rule.conditionValue}"</span>
                                  </div>
                              </td>
                              <td className="p-8">
                                  <div className="flex items-center gap-2">
                                      <span className="text-slate-800 font-black text-sm">>{rule.frequencyThreshold}</span>
                                      <span className="text-[9px] text-slate-400 uppercase tracking-widest">Times</span>
                                  </div>
                              </td>
                              <td className="p-8">
                                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-indigo-100 shadow-sm">
                                      {rule.tagToApply}
                                  </span>
                              </td>
                              <td className="p-8">
                                  <button 
                                    onClick={() => toggleRule(rule.id)}
                                    className={`w-12 h-6 rounded-full transition-all relative ${rule.isActive ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                  >
                                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${rule.isActive ? 'left-7' : 'left-1'}`} />
                                  </button>
                              </td>
                              <td className="p-8 text-right">
                                  <div className="flex justify-end gap-2">
                                      <button className="p-2 text-slate-300 hover:text-indigo-600 transition-all"><Edit3 size={16}/></button>
                                      <button className="p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>

      <div className="bg-slate-900 rounded-[2rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
          <div className="absolute left-0 top-0 p-8 opacity-10 rotate-[-12deg]"><Bot size={180}/></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-2xl">
                  <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.3em] mb-4">Behavioral Sherlock Logic</p>
                  <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-4 leading-none">The AI doesn't just copy-paste tags. It synthesizes digital body language.</h3>
                  <p className="text-indigo-100 text-lg font-medium opacity-90 leading-relaxed italic">
                    "If a user registered as a 'Buyer' but views 3+ 'How to Sell' articles, Sherlock auto-tags them with <strong className="text-white underline">Seller Intent</strong> and notifies the agent of a potential hybrid opportunity."
                  </p>
              </div>
              <div className="shrink-0 bg-white/10 p-8 rounded-[2rem] border border-white/10 backdrop-blur-md text-center">
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2 px-1">Retrain Frequency</p>
                  <p className="text-4xl font-black tracking-tighter">DAILY</p>
                  <button className="mt-6 bg-white text-indigo-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all">Optimize Logic</button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default SegmentationDesk;
