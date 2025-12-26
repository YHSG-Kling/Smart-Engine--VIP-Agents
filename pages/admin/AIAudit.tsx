
import React, { useState } from 'react';
import { 
  ShieldAlert, CheckCircle2, XCircle, Search, Filter, 
  MessageSquare, AlertTriangle, RefreshCw, Eye, ThumbsDown, Database, Zap, ArrowRight, BrainCircuit
} from 'lucide-react';
import { AuditFlag } from '../../types';
import { n8nService } from '../../services/n8n';

const AIAudit: React.FC = () => {
  const [activeView, setActiveView] = useState<'hallucinations' | 'negative_patterns'>('hallucinations');
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Resolved'>('Pending');
  const [flags, setFlags] = useState<AuditFlag[]>([
    {
      id: 'f1', leadName: 'Alice Freeman', 
      riskType: 'Compliance', riskScore: 9, 
      explanation: 'Potential Fair Housing Violation: AI mentioned "family-friendly neighborhood".',
      transcriptSnippet: 'AI: Yes, it is a very family-friendly neighborhood with lots of children.',
      status: 'Pending', detectedAt: 'Today, 2:00 PM'
    },
    // Workflow 37 Flagged Patterns
    {
        id: 'p1', leadName: 'REMAX Agent',
        riskType: 'Bad Lead Pattern', riskScore: 10,
        explanation: 'Agent Sarah flagged this lead as "Is Realtor". Pattern detected.',
        transcriptSnippet: 'User: Hi, I have 15 years experience and work with Re/Max. Call me.',
        status: 'Pending', detectedAt: 'Yesterday, 11:30 AM'
    }
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleAction = async (id: string, action: 'Dismiss' | 'Retrain') => {
    if (action === 'Retrain') {
        setIsRefreshing(true);
        await n8nService.confirmAndRetrainAI(id);
        setIsRefreshing(false);
        alert("Pattern confirmed. Vector database updated with negative samples.");
    }
    setFlags(prev => prev.map(f => f.id === id ? { ...f, status: 'Resolved' } : f));
  };

  const runWeeklyScan = async () => {
    setIsRefreshing(true);
    await n8nService.triggerWeeklyAIReview();
    setTimeout(() => {
        setIsRefreshing(false);
        alert("Weekly scan complete. 0 new risks found.");
    }, 2000);
  };

  const filteredFlags = flags.filter(f => {
      const typeMatch = activeView === 'negative_patterns' ? f.riskType === 'Bad Lead Pattern' : f.riskType !== 'Bad Lead Pattern';
      const statusMatch = filter === 'All' || f.status === filter;
      return typeMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="text-red-600" /> AI Compliance & Quality
          </h2>
          <p className="text-slate-500">Hallucination Hunting & Pattern Retraining (Workflows 23 & 37)</p>
        </div>
        <div className="flex gap-3">
            <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                <button 
                  onClick={() => setActiveView('hallucinations')}
                  className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeView === 'hallucinations' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <ShieldAlert size={14}/> Hallucination Hunter
                </button>
                <button 
                  onClick={() => setActiveView('negative_patterns')}
                  className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeView === 'negative_patterns' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <BrainCircuit size={14}/> Pattern Feedback Loop
                </button>
            </div>
            <button 
                onClick={runWeeklyScan}
                disabled={isRefreshing}
                className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 flex items-center gap-2"
            >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} /> 
                Run Global Scan
            </button>
        </div>
      </div>

      {activeView === 'negative_patterns' && (
          <div className="bg-indigo-900 rounded-xl p-6 text-white shadow-xl mb-6 flex justify-between items-center">
              <div>
                  <h3 className="text-lg font-bold flex items-center gap-2"><Database size={20}/> Negative Samples Vector DB</h3>
                  <p className="text-indigo-200 text-sm max-w-xl">Patterns reported by agents are stored here. Once confirmed, the Scraper/Intent model will automatically exclude similar incoming text.</p>
              </div>
              <div className="flex items-center gap-4">
                  <div className="text-right">
                      <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Database Size</p>
                      <p className="text-2xl font-bold">142 Patterns</p>
                  </div>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredFlags.map(flag => (
            <div key={flag.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row animate-fade-in-up">
                <div className={`w-2 md:w-2 ${flag.riskType === 'Bad Lead Pattern' ? 'bg-purple-500' : flag.riskScore > 7 ? 'bg-red-500' : 'bg-orange-400'}`}></div>
                
                <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                flag.riskType === 'Compliance' ? 'bg-red-100 text-red-700' : 
                                flag.riskType === 'Bad Lead Pattern' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                                {flag.riskType}
                            </span>
                            <span className="text-sm font-bold text-slate-700">{flag.leadName}</span>
                            <span className="text-xs text-slate-400">{flag.detectedAt}</span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${flag.status === 'Pending' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                            {flag.status}
                        </span>
                    </div>

                    <p className="text-sm text-slate-800 font-medium mb-3">{flag.explanation}</p>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-600 mb-4">
                        {flag.transcriptSnippet}
                    </div>

                    {flag.status === 'Pending' && (
                        <div className="flex gap-3">
                            <button 
                                onClick={() => handleAction(flag.id, flag.riskType === 'Bad Lead Pattern' ? 'Retrain' : 'Dismiss')}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm"
                            >
                                {flag.riskType === 'Bad Lead Pattern' ? <Zap size={14}/> : <CheckCircle2 size={14}/>}
                                {flag.riskType === 'Bad Lead Pattern' ? 'Confirm & Retrain AI' : 'Resolve Flag'}
                            </button>
                            <button 
                                onClick={() => handleAction(flag.id, 'Dismiss')}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50"
                            >
                                <XCircle size={14} /> Dismiss
                            </button>
                            <button className="ml-auto text-indigo-600 text-xs font-bold hover:underline flex items-center gap-1">
                                <Eye size={14} /> View Original Data
                            </button>
                        </div>
                    )}
                </div>
            </div>
        ))}
        {filteredFlags.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <CheckCircle2 size={48} className="mx-auto text-emerald-300 mb-3" />
                <p className="text-slate-400 font-medium">No pending {activeView === 'hallucinations' ? 'risks' : 'patterns'} to review.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AIAudit;
