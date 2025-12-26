
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  CheckCircle2, Clock, ShieldAlert, Key, Zap, 
  ArrowRight, Download, Bot, Sparkles, Loader2,
  Calendar, CreditCard, Droplets, AlertTriangle,
  ChevronRight, FileCheck, DollarSign, ExternalLink,
  MessageSquare, UserCheck, ShieldCheck, Landmark,
  MapPin, ShoppingBag, PieChart, Activity, User,
  CheckSquare, Navigation, Map as MapIcon, X, Plus,
  RefreshCw, MousePointerClick, CalendarCheck,
  Circle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, Closing, Deal, TransactionTask } from '../../types';
import { n8nService } from '../../services/n8n';
import { airtableService } from '../../services/airtable';
import L from 'leaflet';

const ClosingDashboard: React.FC = () => {
  const { role, user } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  // --- STATE ---
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Workflow 152 Agent Kanban State
  const [agentClosingTasks, setAgentClosingTasks] = useState<Record<string, {label: string, status: 'To Do' | 'Done'}[]>>({
      'd1': [
          { label: 'Verify CD (Closing Disclosure)', status: 'Done' },
          { label: 'Book Final Walkthrough', status: 'To Do' },
          { label: 'Order Closing Gift', status: 'To Do' },
          { label: 'Coordinate Key Handoff', status: 'To Do' },
      ],
      'd2': [
          { label: 'Verify CD (Closing Disclosure)', status: 'To Do' },
          { label: 'Book Final Walkthrough', status: 'To Do' },
          { label: 'Order Closing Gift', status: 'To Do' },
          { label: 'Coordinate Key Handoff', status: 'To Do' },
      ]
  });

  const isAdmin = role === UserRole.ADMIN || role === UserRole.BROKER;
  const isAgent = role === UserRole.AGENT;
  const isClient = role === UserRole.BUYER || role === UserRole.SELLER;

  // Load actual deals from service
  useEffect(() => {
    const loadDeals = async () => {
      setIsLoading(true);
      const data = await airtableService.getTransactions();
      const closingDeals = (data || []).filter(d => d.stage === 'Closing' || d.stage === 'Under Contract');
      setDeals(closingDeals);
      
      if (closingDeals.length > 0 && !selectedDealId) {
          setSelectedDealId(closingDeals[0].id);
      }
      setIsLoading(false);
    };
    loadDeals();
  }, []);

  const selectedDeal = useMemo(() => deals.find(d => d.id === selectedDealId), [deals, selectedDealId]);

  // Map Initialization for Client/Agent View
  useEffect(() => {
    if (selectedDeal && mapRef.current && !mapInstance) {
      const map = L.map(mapRef.current).setView([30.2672, -97.7431], 14);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);
      setMapInstance(map);
    }
    return () => {
        if (mapInstance) {
            mapInstance.remove();
            setMapInstance(null);
        }
    }
  }, [selectedDealId, selectedDeal]);

  // View A Logic: Admin Projected Revenue
  const projectedRevenue = useMemo(() => {
    return deals.reduce((acc, d) => acc + (d.projectedGCI || 0), 0);
  }, [deals]);

  const handleToggleTask = async (dealId: string, taskLabel: string) => {
    const currentTasks = agentClosingTasks[dealId] || [];
    const newTasks = currentTasks.map(t => 
        t.label === taskLabel ? { ...t, status: t.status === 'To Do' ? 'Done' : 'To Do' } as const : t
    );
    
    setAgentClosingTasks(prev => ({ ...prev, [dealId]: newTasks }));

    if (taskLabel === 'Book Final Walkthrough' && newTasks.find(t => t.label === taskLabel)?.status === 'Done') {
        n8nService.scheduleWalkthrough(dealId, '2024-11-14T16:00:00');
        alert("Workflow 152: Final Walkthrough confirmed. Gemini AI drafted confirmation dispatched to both Agents.");
    }
  };

  const handleTransferUtilities = async () => {
    setIsProcessing(true);
    await n8nService.triggerUtilityConcierge(user?.id || 'client', '78704');
    setTimeout(() => {
        setIsProcessing(false);
        alert("Workflow 152: Utilities marked as 'Transferred'. Agent portal updated with verification stamp.");
    }, 1500);
  };

  if (isLoading) return <div className="flex flex-col items-center justify-center h-64 space-y-4"><Loader2 className="animate-spin text-indigo-600" /> <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Closing Data...</p></div>;

  return (
    <div className="space-y-6 animate-fade-in pb-20 max-w-full">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Closing Conductor.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Workflow 152: Settlement Orchestration</p>
        </div>
        
        {!isClient && (
            <div className="flex items-center gap-3">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Closing:</p>
                <select 
                    value={selectedDealId || ''} 
                    onChange={(e) => setSelectedDealId(e.target.value)}
                    className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                >
                    {deals.map(d => <option key={d.id} value={d.id}>{d.address.split(',')[0]}</option>)}
                </select>
            </div>
        )}
      </div>

      {/* VIEW A: ADMIN (Projected Revenue List) */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
            <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-md overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                        <DollarSign size={18} className="text-emerald-500" /> Projected Revenue (Closing this Week)
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            <tr><th className="p-8">Transaction</th><th className="p-8">Close Date</th><th className="p-8 text-right">Commission</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                            {deals.map(d => (
                                <tr key={d.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-8">
                                        <div className="font-black text-slate-900 uppercase tracking-tight text-sm">{d.address}</div>
                                        <div className="text-[8px] text-slate-400 uppercase font-black">{d.clientName}</div>
                                    </td>
                                    <td className="p-8 text-slate-500">{d.predictedClose || 'TBD'}</td>
                                    <td className="p-8 text-right font-black text-emerald-600 text-lg tabular-nums">${(d.projectedGCI || 12500).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden border-b-8 border-emerald-600">
                    <div className="absolute right-0 top-0 p-4 opacity-10 rotate-12"><PieChart size={120}/></div>
                    <p className="text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-2">Total Projected Revenue</p>
                    <h3 className="text-5xl font-black italic tracking-tighter tabular-nums mb-4">${projectedRevenue.toLocaleString()}</h3>
                    <p className="text-[10px] text-indigo-200 font-medium">Sum of all commissions for deals in 'Closing' stage with 7d proximity.</p>
                </div>
            </div>
        </div>
      )}

      {/* VIEW B: AGENT (Closing Checklist Kanban) */}
      {isAgent && selectedDeal && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-indigo-600 rounded-[2rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-900 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Zap size={180}/></div>
                  <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md"><Bot size={20}/></div>
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-100">Automation Mode Active</span>
                      </div>
                      <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-2 leading-none">The Closing <br/> Conductor.</h3>
                      <p className="text-indigo-100 text-lg font-medium opacity-90 max-w-xl">Orchestrating the final days for {selectedDeal.address}. Actions here trigger real-world logistics.</p>
                  </div>
                  <div className="relative z-10 bg-black/20 p-6 rounded-3xl border border-white/10 backdrop-blur-xl text-center min-w-[200px]">
                      <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">CLOSING DATE</p>
                      <p className="text-3xl font-black text-white italic">{selectedDeal.predictedClose || 'TBD'}</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[500px]">
                  <div className="bg-slate-100/50 rounded-[2.5rem] border border-slate-200 p-6 flex flex-col h-full">
                      <div className="flex justify-between items-center mb-6 px-4">
                          <h4 className="font-black text-[10px] text-slate-500 uppercase tracking-[0.3em]">To Do</h4>
                          <span className="bg-white px-2 py-0.5 rounded-full text-[9px] font-black text-slate-300 border border-slate-100">
                              {(agentClosingTasks[selectedDeal.id] || []).filter(t => t.status === 'To Do').length}
                          </span>
                      </div>
                      <div className="space-y-4 overflow-y-auto flex-1 pr-1 scrollbar-hide">
                          {(agentClosingTasks[selectedDeal.id] || []).filter(t => t.status === 'To Do').map(task => (
                              <div key={task.label} onClick={() => handleToggleTask(selectedDeal.id, task.label)} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 transition-all cursor-pointer flex items-center justify-between group">
                                  <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition-colors">
                                          <Circle size={20} />
                                      </div>
                                      <span className="font-black text-xs text-slate-800 uppercase tracking-tight">{task.label}</span>
                                  </div>
                                  <ArrowRight size={16} className="text-slate-200 group-hover:text-indigo-600" />
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="bg-emerald-50/50 rounded-[2.5rem] border border-emerald-100 p-6 flex flex-col h-full">
                      <div className="flex justify-between items-center mb-6 px-4">
                          <h4 className="font-black text-[10px] text-emerald-600 uppercase tracking-[0.3em]">Done</h4>
                          <span className="bg-white px-2 py-0.5 rounded-full text-[9px] font-black text-emerald-300 border border-emerald-100">
                              {(agentClosingTasks[selectedDeal.id] || []).filter(t => t.status === 'Done').length}
                          </span>
                      </div>
                      <div className="space-y-4 overflow-y-auto flex-1 pr-1 scrollbar-hide">
                          {(agentClosingTasks[selectedDeal.id] || []).filter(t => t.status === 'Done').map(task => (
                              <div key={task.label} onClick={() => handleToggleTask(selectedDeal.id, task.label)} className="bg-white/60 p-6 rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between group cursor-pointer opacity-80">
                                  <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                          <CheckCircle2 size={20} />
                                      </div>
                                      <span className="font-black text-xs text-slate-400 line-through tracking-tight uppercase">{task.label}</span>
                                  </div>
                                  <RefreshCw size={14} className="text-slate-200 group-hover:text-indigo-600 transition-all" />
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* VIEW C: CLIENT (Moving Concierge) */}
      {isClient && selectedDeal && (
          <div className="space-y-8 animate-fade-in">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600 flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="absolute right-0 top-0 p-12 opacity-5 rotate-12"><Key size={200}/></div>
                  <div className="relative z-10 max-xl">
                      <p className="text-indigo-400 text-sm font-black uppercase tracking-[0.3em] mb-4">Moving Day Concierge</p>
                      <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-4 leading-none">Your Move, <br/> Orchestrated.</h2>
                      <p className="text-indigo-100 text-lg font-medium opacity-90 leading-relaxed mb-8">All utilities, title logistics, and key exchange in one command center.</p>
                      
                      <div className="flex gap-4">
                          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
                              <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">CLOSING DATE</p>
                              <p className="text-xl font-black">{selectedDeal.predictedClose || 'Nov 15, 2024'}</p>
                          </div>
                          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
                              <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">POSSESSION</p>
                              <p className="text-xl font-black uppercase italic">At Closing</p>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* UTILITIES SECTION */}
                  <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 flex flex-col">
                      <div className="flex justify-between items-center mb-8">
                          <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                              <Droplets size={18} className="text-indigo-600" /> Utility Provider List
                          </h3>
                          <div className="bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-[8px] font-black text-indigo-600 uppercase tracking-widest">Auto-detected Zip: 78704</div>
                      </div>
                      <div className="space-y-4 flex-1">
                          {[
                              { name: 'Austin Energy (Electric)', url: 'https://austinenergy.com/start-stop-service' },
                              { name: 'City of Austin (Water)', url: 'https://www.austintexas.gov/department/start-service' },
                              { name: 'Texas Gas Service', url: 'https://www.texasgasservice.com/customer-service/start-service' }
                          ].map(provider => (
                              <a 
                                  key={provider.name} 
                                  href={provider.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-400 transition-all group"
                              >
                                  <span className="font-black uppercase text-xs text-slate-700 tracking-tight">{provider.name}</span>
                                  <ExternalLink size={16} className="text-slate-300 group-hover:text-indigo-600" />
                              </a>
                          ))}
                      </div>
                      <button 
                          onClick={handleTransferUtilities}
                          disabled={isProcessing}
                          className="w-full mt-8 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 border-b-4 border-indigo-600"
                      >
                          {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18}/>}
                          I Have Transferred Utilities
                      </button>
                  </div>

                  {/* SIGNING LOGISTICS MAP */}
                  <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                      <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                          <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                              <MapPin size={18} className="text-indigo-600" /> Signing Location
                          </h3>
                          <p className="text-sm font-bold text-slate-500 mt-1">First American Title, 123 Congress Ave, Austin TX</p>
                      </div>
                      <div className="flex-1 relative">
                          <div ref={mapRef} className="absolute inset-0 z-0" />
                          <div className="absolute bottom-6 right-6 z-10">
                              <button className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-2 border border-indigo-100">
                                  <Navigation size={14}/> Open in Maps
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* NO DEALS CASE */}
      {!isLoading && deals.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
              <CalendarCheck size={48} className="mx-auto text-slate-200 mb-4" />
              <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">No Scheduled Closings.</h3>
              <p className="text-slate-400 text-xs font-bold uppercase mt-2">Transactions move here once they reach the settlement phase.</p>
          </div>
      )}

    </div>
  );
};

export default ClosingDashboard;
