
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, FileText, Loader2, DollarSign,
  ChevronRight, PenTool, ListTodo, Sparkles, Split, 
  RefreshCw, ShieldCheck, Kanban as KanbanIcon, List as ListIcon, 
  Home, Bot, Inbox, FileDown, ShieldCheck as ShieldIcon,
  Search, Plus, MousePointerClick, AlertCircle, Send,
  LayoutGrid, Landmark, Clock, Upload, Gavel, Check, Activity,
  CheckCircle2, Wand2, MoreVertical,
  // Added missing ListChecks import to fix "Cannot find name 'ListChecks'" error on line 135
  ListChecks
} from 'lucide-react';
import { Deal, TransactionMilestone, FEATURE_FLAGS, UserRole } from '../../types';
import { airtableService, airtableOSService } from '../../services/airtable';
import { n8nService } from '../../services/n8n';
import { useAuth } from '../../contexts/AuthContext';

interface TransactionManagerProps {
  initialDealId?: string;
}

const TransactionManager: React.FC<TransactionManagerProps> = ({ initialDealId }) => {
  const { role, user } = useAuth();
  const [activeDeals, setActiveDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [dealView, setDealView] = useState<'milestones' | 'docs' | 'negotiation' | 'compliance'>('milestones');
  const [milestones, setMilestones] = useState<TransactionMilestone[]>([]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await airtableService.getTransactions();
      const allDeals = data || [];
      
      // Strict role-based filtering
      let filtered: Deal[] = [];
      if (role === UserRole.BROKER || role === UserRole.ADMIN) {
        filtered = allDeals;
      } else {
        // Agent filter - in mock we show based on a simulation, 
        // in real app we'd check lead/deal assignedAgent field
        filtered = allDeals;
      }

      setActiveDeals(filtered);
      
      if (initialDealId && filtered.length > 0) {
        const match = filtered.find(d => d.id === initialDealId);
        if (match) setSelectedDeal(match);
      }
      
      setIsLoading(false);
    };
    load();
  }, [initialDealId, role, user]);

  useEffect(() => {
    if (selectedDeal) {
        airtableOSService.getMilestones(selectedDeal.id).then(setMilestones);
    }
  }, [selectedDeal]);

  const handleAction = async (id: string, action: string) => {
    await n8nService.triggerWorkflow(action, { dealId: id, contextId: id });
    alert(`Success: Protocol ${action} initiated.`);
  };

  const renderKanbanColumn = (stage: string, title: string) => {
    const stageDeals = activeDeals.filter(d => d.stage === stage);
    return (
      <div className="flex-1 min-w-[280px] bg-slate-100/50 rounded-3xl p-3 border border-slate-200/50 flex flex-col h-full">
        <div className="flex justify-between items-center p-3 mb-3 bg-white rounded-2xl shadow-sm">
            <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{title}</h4>
            <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{stageDeals.length}</span>
        </div>
        <div className="space-y-3 overflow-y-auto scrollbar-hide flex-1">
            {stageDeals.map(deal => (
                <div key={deal.id} onClick={() => setSelectedDeal(deal)} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 transition-all cursor-pointer group">
                    <p className="font-black text-slate-900 text-xs uppercase truncate mb-1">{deal.address}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{deal.clientName}</p>
                    <div className="mt-3 flex justify-between items-center">
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                            deal.healthStatus === 'Healthy' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                        }`}>{deal.healthStatus}</span>
                        <p className="text-[9px] font-black text-indigo-600">${(deal.price/1000).toFixed(0)}k</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">
            {role === UserRole.AGENT ? 'My Active Pipeline' : 'Brokerage Transaction Flow'}
          </h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
            {role === UserRole.AGENT ? `Managing ${activeDeals.length} Closings` : `Monitoring Global Theater`}
          </p>
        </div>
        <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
            <button onClick={() => setViewMode('board')} className={`p-2 rounded-lg transition-all ${viewMode === 'board' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><KanbanIcon size={16}/></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><ListIcon size={16}/></button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 -mx-1">
          <div className="flex gap-6 h-full min-w-[1500px] px-1">
            {['New', 'Negotiation', 'Under Contract', 'Inspection', 'Financing', 'Closing'].map(s => renderKanbanColumn(s, s))}
          </div>
      </div>

      {selectedDeal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-6">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden animate-scale-in border border-white/10">
                  <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0 border-b-8 border-indigo-600">
                      <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center font-black text-white border border-white/10 shadow-xl"><Home size={28}/></div>
                          <div>
                            <h3 className="text-2xl font-black uppercase tracking-tight italic">{selectedDeal.address}</h3>
                            <p className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mt-1">{selectedDeal.clientName} • ${selectedDeal.price.toLocaleString()}</p>
                          </div>
                      </div>
                      <button onClick={() => setSelectedDeal(null)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all text-white"><X size={24} /></button>
                  </div>
                  
                  <div className="flex-1 flex overflow-hidden">
                      <div className="w-64 bg-slate-50 border-r border-slate-200 p-8 space-y-2 shrink-0 shadow-inner">
                          {[
                              { id: 'milestones', label: 'Timeline Logic', icon: ListChecks },
                              { id: 'docs', label: 'AI Filing Vault', icon: FileText },
                              { id: 'negotiation', label: 'Strategy Room', icon: Split },
                              { id: 'compliance', label: 'Audit Sentinel', icon: ShieldIcon }
                          ].map(tab => (
                              <button 
                                key={tab.id}
                                onClick={() => setDealView(tab.id as any)}
                                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${dealView === tab.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-white hover:text-indigo-600'}`}
                              >
                                  <tab.icon size={18} /> {tab.label}
                              </button>
                          ))}
                      </div>

                      <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
                          {dealView === 'milestones' && (
                              <div className="space-y-6 animate-fade-in">
                                  <div className="flex justify-between items-center mb-8">
                                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic"><Sparkles size={16}/> Active Deal Milestones</h4>
                                      <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2"><Plus size={14}/> Add Custom Protocol</button>
                                  </div>
                                  <div className="grid grid-cols-1 gap-4">
                                      {milestones.map(m => (
                                          <div key={m.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex items-center justify-between group hover:border-indigo-400 transition-all">
                                              <div className="flex items-center gap-5">
                                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${m.status === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-500' : 'bg-white border-slate-200 text-slate-300'}`}>
                                                      {m.status === 'completed' ? <CheckCircle2 size={20}/> : <Clock size={20}/>}
                                                  </div>
                                                  <div>
                                                      <h5 className="font-black text-slate-800 uppercase tracking-tight text-sm">{m.milestone_type}</h5>
                                                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Due: {new Date(m.due_date).toLocaleDateString()} • Owner: {m.owner_role}</p>
                                                  </div>
                                              </div>
                                              <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><MoreVertical size={16}/></button>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          )}

                          {dealView === 'docs' && (
                              <div className="space-y-10 animate-fade-in">
                                  <div className="bg-slate-50 border-4 border-dashed border-slate-200 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center gap-6 group hover:border-indigo-400 transition-all cursor-pointer">
                                      <div className="p-6 bg-white rounded-[2rem] shadow-2xl group-hover:scale-110 transition-transform"><Upload size={48} className="text-indigo-600"/></div>
                                      <div>
                                          <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">AI Filing Clerk.</h4>
                                          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Drop documents here to auto-name and route to Secure Drive Vault.</p>
                                      </div>
                                  </div>
                                  <button onClick={() => handleAction(selectedDeal.id, 'auto-file-document')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3">
                                      <RefreshCw size={18}/> Re-Index Storage Engine
                                  </button>
                              </div>
                          )}

                          {dealView === 'negotiation' && (
                               <div className="space-y-8 animate-fade-in">
                                   <div className="bg-indigo-50 border-2 border-indigo-100 rounded-[2.5rem] p-10 flex gap-8 items-center shadow-inner relative overflow-hidden group">
                                       <div className="absolute right-[-10px] top-[-10px] p-2 opacity-5 text-indigo-900 group-hover:rotate-12 transition-transform duration-1000"><Bot size={150}/></div>
                                       <div className="p-6 bg-white rounded-3xl shadow-xl text-indigo-600 shrink-0"><Split size={40}/></div>
                                       <div className="relative">
                                           <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Counter Offer Intelligence</h5>
                                           <p className="text-2xl font-black text-indigo-900 leading-tight italic">Analyzing transaction logic. Identifying favorable delta signals in contract text.</p>
                                       </div>
                                   </div>
                                   <div className="grid grid-cols-2 gap-4">
                                       <button onClick={() => handleAction(selectedDeal.id, 'parse-counter-pdf')} className="py-4 bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:border-indigo-400 transition-all flex items-center justify-center gap-2"><FileText size={16}/> Analyze PDF Delta</button>
                                       <button onClick={() => handleAction(selectedDeal.id, 'trigger-counter-draft')} className="py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 border-b-4 border-indigo-900"><Wand2 size={16}/> Draft Response Strategy</button>
                                   </div>
                               </div>
                          )}

                          {dealView === 'compliance' && (
                              <div className="space-y-6 animate-fade-in">
                                  <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-8 flex items-start gap-6 shadow-sm">
                                      <ShieldIcon size={40} className="text-red-500 shrink-0" />
                                      <div>
                                          <h4 className="font-black text-red-900 uppercase tracking-tight text-lg mb-1 italic">Vulnerability Audit Active</h4>
                                          <p className="text-red-700 text-sm font-medium leading-relaxed">AI has flagged {selectedDeal.missingDocs} missing legal disclosures. Outbound comms restricted until corrected.</p>
                                      </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <button onClick={() => handleAction(selectedDeal.id, 'trigger-compliance-checklist')} className="p-6 bg-white border border-slate-200 rounded-2xl text-left hover:border-indigo-400 transition-all flex flex-col gap-3">
                                          <p className="text-[9px] font-black text-slate-400 uppercase">Context Scan</p>
                                          <p className="text-sm font-black text-slate-800 uppercase italic leading-none">Force Check-List Update</p>
                                      </button>
                                      <button onClick={() => handleAction(selectedDeal.id, 'trigger-broker-audit')} className="p-6 bg-white border border-slate-200 rounded-2xl text-left hover:border-indigo-400 transition-all flex flex-col gap-3">
                                          <p className="text-[9px] font-black text-slate-400 uppercase">Escalation</p>
                                          <p className="text-sm font-black text-slate-800 uppercase italic leading-none">Request Broker Intervention</p>
                                      </button>
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default TransactionManager;
