
import React, { useState } from 'react';
import { 
  MessageSquare, Star, TrendingUp, TrendingDown, Clock, 
  RefreshCw, Bot, CheckCircle2, ShieldCheck, Settings,
  Loader2, Filter, Search, ArrowRight, ListChecks,
  AlertTriangle, Send, Share2, MoreVertical, LayoutList,
  Flame, CheckSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, ShowingFeedback, FeedbackConfig } from '../../types';
import { n8nService } from '../../services/n8n';

const FeedbackDesk: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === UserRole.ADMIN || role === UserRole.BROKER;
  const isAgent = role === UserRole.AGENT;

  const [activeTab, setActiveTab] = useState<'inbox' | 'logic'>('inbox');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  // Workflow 126: Feedback Inbox Data (Agent View B)
  const [feedbacks, setFeedbacks] = useState<ShowingFeedback[]>([
    { 
      id: 'f1', showingId: 'sh3', address: '123 Main St', leadName: 'Charlie Day', 
      rawResponseText: 'The house was great but the kitchen feels a bit cramped for the price point. 7/10.',
      sentimentScore: 7, keyObjections: ['Layout', 'Price'], interestLevel: 'Warm',
      publishedToSeller: false, timestamp: '10 mins ago' 
    },
    { 
      id: 'f2', showingId: 'sh4', address: '789 Skyline Dr', leadName: 'Diane Court', 
      rawResponseText: 'Stunning view. We are ready to make an offer. 10/10.',
      sentimentScore: 10, keyObjections: [], interestLevel: 'Hot',
      publishedToSeller: true, timestamp: '2h ago' 
    },
    { 
      id: 'f3', showingId: 'sh1', address: '123 Main St', leadName: 'Alice Freeman', 
      rawResponseText: 'Did not like the neighborhood. Too noisy. 4/10.',
      sentimentScore: 4, keyObjections: ['Location'], interestLevel: 'Cold',
      publishedToSeller: false, timestamp: '1d ago' 
    },
  ]);

  // Workflow 126: Admin Config (Admin View A)
  const [logicConfig, setLogicConfig] = useState<FeedbackConfig>({
      delayTimeMins: 45,
      autoShareWithSeller: false,
      isActive: true
  });

  const handlePublish = async (id: string) => {
    setIsProcessing(id);
    await n8nService.publishFeedbackToReport(id);
    setTimeout(() => {
        setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, publishedToSeller: true } : f));
        setIsProcessing(null);
        alert("Success: Feedback synchronized with Listing Performance Report.");
    }, 1200);
  };

  const handleSaveLogic = async () => {
    setIsProcessing('logic');
    await n8nService.updateFeedbackLogic(logicConfig);
    setTimeout(() => {
        setIsProcessing(null);
        alert("VIP Logic: Feedback protocols updated.");
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Feedback Log.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Workflow 126: AI Conversational Extraction</p>
        </div>
        <div className="flex gap-2">
            <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm overflow-x-auto scrollbar-hide max-w-full">
                <button onClick={() => setActiveTab('inbox')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'inbox' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <MessageSquare size={14}/> Feedback Inbox
                </button>
                {isAdmin && (
                  <button onClick={() => setActiveTab('logic')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'logic' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                      <Settings size={14}/> Settings
                  </button>
                )}
            </div>
        </div>
      </div>

      {activeTab === 'inbox' && (
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Score</p>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tighter">7.4 / 10</h3>
                  </div>
                  <div className="bg-indigo-600 p-6 rounded-[2rem] shadow-xl text-white flex flex-col justify-center border-b-8 border-indigo-900 relative overflow-hidden">
                      <div className="absolute right-[-10px] bottom-[-10px] opacity-10 rotate-12"><Flame size={120}/></div>
                      <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-1">Response Rate</p>
                      <h3 className="text-3xl font-black tracking-tighter">92%</h3>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Top Objection</p>
                      <h3 className="text-3xl font-black text-orange-600 tracking-tighter uppercase italic">Layout</h3>
                  </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                      <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                        <LayoutList size={18} className="text-indigo-600" /> Recent Extract Logs
                      </h3>
                      <div className="flex gap-2">
                          <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600"><Search size={14}/></button>
                          <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600"><Filter size={14}/></button>
                      </div>
                  </div>
                  <div className="divide-y divide-slate-100">
                      {feedbacks.map(f => (
                          <div key={f.id} className="p-8 hover:bg-slate-50 transition-all group flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                              <div className="flex items-center gap-6 flex-1">
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border-2 transition-all ${
                                      f.sentimentScore >= 8 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                      f.sentimentScore >= 5 ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                      'bg-red-50 text-red-600 border-red-100'
                                  }`}>
                                      {f.sentimentScore}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                          <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm truncate">{f.address}</h4>
                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{f.timestamp}</span>
                                      </div>
                                      <p className="text-xs text-slate-600 font-medium italic leading-relaxed mb-3">"{f.rawResponseText}"</p>
                                      <div className="flex flex-wrap gap-2">
                                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                              f.interestLevel === 'Hot' ? 'bg-red-100 text-red-700' :
                                              f.interestLevel === 'Warm' ? 'bg-orange-100 text-orange-700' :
                                              'bg-slate-100 text-slate-500'
                                          }`}>
                                              {f.interestLevel}
                                          </span>
                                          {f.keyObjections.map(obj => (
                                              <span key={obj} className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[8px] font-black uppercase">Objection: {obj}</span>
                                          ))}
                                      </div>
                                  </div>
                              </div>

                              <div className="flex items-center gap-4 shrink-0 w-full lg:w-auto">
                                  {f.publishedToSeller ? (
                                      <div className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-emerald-100 shadow-sm">
                                          <ShieldCheck size={14}/> Published
                                      </div>
                                  ) : (
                                      <button 
                                        onClick={() => handlePublish(f.id)}
                                        disabled={isProcessing === f.id}
                                        className="flex-1 lg:flex-none bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                      >
                                          {isProcessing === f.id ? <Loader2 size={14} className="animate-spin"/> : <Share2 size={14}/>}
                                          Publish to Seller
                                      </button>
                                  )}
                                  <button className="p-3 bg-slate-50 text-slate-300 hover:text-slate-600 rounded-2xl transition-all"><MoreVertical size={20}/></button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'logic' && isAdmin && (
          <div className="space-y-8 animate-fade-in-up">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Settings size={180}/></div>
                  <div className="relative z-10 max-w-2xl">
                      <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-4 leading-none">Feedback Protocols.</h3>
                      <p className="text-indigo-100 text-sm font-medium opacity-90 leading-relaxed mb-8">
                          Configure how the system captures and routes showing data. The AI Extract engine (Gemini Flash) is always active, but you control the dispatch timing and sharing rules.
                      </p>
                      <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setLogicConfig({...logicConfig, isActive: !logicConfig.isActive})}
                            className={`w-14 h-7 rounded-full transition-all relative shrink-0 ${logicConfig.isActive ? 'bg-indigo-600' : 'bg-slate-600'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${logicConfig.isActive ? 'left-8' : 'left-1'}`} />
                        </button>
                        <span className="text-[11px] font-black uppercase tracking-widest text-indigo-300">Logic Hub: {logicConfig.isActive ? 'ACTIVE' : 'PAUSED'}</span>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md p-8 space-y-8">
                      <h4 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Clock size={18} className="text-indigo-600" /> Automation Timing
                      </h4>
                      <div className="space-y-4">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Delay Post-Showing (Minutes)</label>
                          <div className="flex items-center gap-4">
                              <input 
                                type="range" min="15" max="120" step="15"
                                value={logicConfig.delayTimeMins}
                                onChange={e => setLogicConfig({...logicConfig, delayTimeMins: parseInt(e.target.value)})}
                                className="flex-1 accent-indigo-600" 
                              />
                              <span className="font-black text-indigo-600 text-lg tabular-nums w-12">{logicConfig.delayTimeMins}m</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold italic">Recommended: 45m. Long enough to leave property, short enough for fresh memory.</p>
                      </div>

                      <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                          <div>
                              <p className="font-black text-[10px] text-slate-800 uppercase tracking-tight">Auto-Share with Seller</p>
                              <p className="text-[9px] text-slate-400 font-bold">Feedback goes live to Seller Dashboard instantly</p>
                          </div>
                          <button 
                            onClick={() => setLogicConfig({...logicConfig, autoShareWithSeller: !logicConfig.autoShareWithSeller})}
                            className={`w-12 h-6 rounded-full transition-all relative ${logicConfig.autoShareWithSeller ? 'bg-indigo-600' : 'bg-slate-300'}`}
                          >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${logicConfig.autoShareWithSeller ? 'left-7' : 'left-1'}`} />
                          </button>
                      </div>

                      <button 
                        onClick={handleSaveLogic}
                        disabled={isProcessing === 'logic'}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                      >
                          {isProcessing === 'logic' ? <Loader2 size={14} className="animate-spin"/> : <ShieldCheck size={14}/>}
                          Save Logic Config
                      </button>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-8 shadow-inner">
                      <h4 className="font-black text-[10px] text-indigo-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-2"><Bot size={16}/> Gemini Extraction Logic</h4>
                      <div className="space-y-4">
                          <p className="text-[10px] text-indigo-800 font-bold uppercase tracking-widest opacity-60">System Prompt Snippet</p>
                          <div className="bg-white p-5 rounded-2xl border border-indigo-100 text-[11px] text-slate-600 font-mono leading-relaxed italic">
                              "Analyze buyer's text. Extract Score (1-10), Sentiment, Specific Objections (e.g. small yard). Return Strictly JSON."
                          </div>
                          <div className="pt-6">
                              <p className="text-[10px] text-indigo-800 font-bold uppercase tracking-widest opacity-60 mb-3">Live Response Trace</p>
                              <div className="p-4 bg-slate-900 rounded-2xl font-mono text-[9px] text-emerald-400 space-y-1">
                                  <div>{`{`}</div>
                                  <div className="pl-4">"score": 7,</div>
                                  <div className="pl-4">"sentiment": "Positive",</div>
                                  <div className="pl-4">"objections": ["Price", "Cramped"],</div>
                                  <div className="pl-4">"interest": "Warm"</div>
                                  <div>{`}`}</div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default FeedbackDesk;
