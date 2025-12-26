
import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, CheckCircle2, Calendar, 
  MoreHorizontal, Clock, Zap, Upload, X, FileText, Loader2, DollarSign,
  BrainCircuit, TrendingUp, ChevronRight, PenTool, ListTodo, Eye, MessageSquare, Sparkles, Gavel, 
  RefreshCw, ShieldCheck, Phone, LayoutDashboard, Kanban as KanbanIcon, List as ListIcon, Users, FileWarning, ArrowRight,
  Home, Bot, CheckSquare, Inbox, FileDown, Pen, ShieldCheck as ShieldIcon,
  Search, Filter, Plus, Mail, MousePointerClick, AlertCircle, Mic, StopCircle, Send, FileCode, Check, TrendingDown, Split,
  LayoutGrid, Landmark
} from 'lucide-react';
import { Deal, TransactionTask, GeneratedDoc, ComplianceChecklistItem, ESignEnvelope, OfferDraft, NegotiationRound, TaskStatus, TaskRole, FinancingLog, LoanStage } from '../../types';
import { airtableService } from '../../services/airtable';
import { n8nService } from '../../services/n8n';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleGenAI } from "@google/genai";

interface TransactionManagerProps {
  initialDealId?: string;
}

const TransactionManager: React.FC<TransactionManagerProps> = ({ initialDealId }) => {
  const { user } = useAuth();
  const [activeDeals, setActiveDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'board' | 'list' | 'inbox' | 'esign' | 'speed-offer'>('board');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [dealView, setDealView] = useState<'checklist' | 'docs' | 'offer' | 'esign' | 'negotiation' | 'tasks' | 'financing'>('checklist');
  
  // Workflow 151: Financing Log State
  const [isNudging, setIsNudging] = useState(false);
  const [financingLogs, setFinancingLogs] = useState<FinancingLog[]>([
      { 
          id: 'fin1', dealId: '1', lenderName: 'Luxury Lending Co', lenderEmail: 'vip@luxlending.com', 
          loanStage: 'Underwriting', lastUpdateRaw: 'Lender Liaison AI: Email received from underwriting. Conditional approval granted subject to 2023 Tax Return upload.',
          commitmentDate: '2024-11-20', appraisalStatus: 'Completed', conditionsRemaining: true, timestamp: '1h ago'
      },
      { 
          id: 'fin2', dealId: '2', lenderName: 'Standard Mortgage LLC', lenderEmail: 'referrals@standard.com', 
          loanStage: 'Application', lastUpdateRaw: 'Lender Liaison AI: Pinging lender for status. 3 days since last engagement.',
          commitmentDate: '2024-12-05', appraisalStatus: 'Ordered', conditionsRemaining: true, timestamp: '3d ago'
      }
  ]);

  // Workflow 148: Transaction Tasks state
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Workflow 147: Negotiation State
  const [negotiationRounds, setNegotiationRounds] = useState<NegotiationRound[]>([
      { id: 'r1', dealId: '1', roundNumber: 1, offerPrice: 500000, concessions: 'Keep washer/dryer', closingDate: '2024-12-15', status: 'Sent', timestamp: '2d ago', source: 'Our Client' },
      { id: 'r2', dealId: '1', roundNumber: 2, offerPrice: 515000, concessions: 'No washer/dryer, $5k repair credit', closingDate: '2024-12-01', status: 'Received', timestamp: 'Just Now', source: 'Other Side', aiAnalysisSummary: 'Seller countered at $515k. They moved the closing date 14 days earlier. AI detected urgency in their timeline.' }
  ]);
  const [isNegotiating, setIsNegotiating] = useState(false);

  // Workflow 145: Speed Offer Bot State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [offerDraft, setOfferDraft] = useState<OfferDraft | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [manualInput, setManualInput] = useState('');

  // Workflow 138: E-Sign State
  const [eSignEnvelopes, setESignEnvelopes] = useState<ESignEnvelope[]>([
    { id: 'es1', envelopeId: 'ds_882910', status: 'Delivered', recipientEmail: 'alice@gmail.com', dealId: '1', documentName: 'Seller Disclosure', agentId: 'agent_1', viewedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString() }, // 3h ago (STALLED)
    { id: 'es2', envelopeId: 'ds_441029', status: 'Sent', recipientEmail: 'bob@invest.io', dealId: '2', documentName: 'Listing Agreement', agentId: 'agent_1' },
    { id: 'es3', envelopeId: 'ds_112233', status: 'Completed', recipientEmail: 'charlie@iasip.com', dealId: '1', documentName: 'Earnest Money Receipt', agentId: 'agent_1', signedAt: 'Today, 10:00 AM' },
  ]);

  // Workflow 107 Offer Builder State
  const [isDraftingOffer, setIsDraftingOffer] = useState(false);
  const [isPolishingStips, setIsPolishingStips] = useState(false);
  const [offerForm, setOfferForm] = useState({
      price: 0,
      earnest: 0,
      inspectionDays: 7,
      specialStips: '',
      formattedStips: ''
  });
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDoc[]>([]);

  // Workflow 137 Compliance Checklist Items
  const [complianceItems, setComplianceItems] = useState<ComplianceChecklistItem[]>([
    { id: 'ci1', dealId: '1', documentName: 'Lead-Based Paint Disclosure', status: 'Missing', sourceRule: 'Added by AI (Year Built < 1978)' },
    { id: 'ci2', dealId: '1', documentName: 'Septic Inspection Cert', status: 'Pending Review', sourceRule: 'Added by AI (Septic Mentioned)' },
    { id: 'ci3', dealId: '1', documentName: 'Purchase Agreement', status: 'Approved', sourceRule: 'Base Protocol' },
    { id: 'ci4', dealId: '2', documentName: 'Condo Bylaws Receipt', status: 'Missing', sourceRule: 'Added by AI (Property Type: Condo)' },
  ]);

  // Workflow 148: Transaction Tasks
  const [dealTasks, setDealTasks] = useState<TransactionTask[]>([
    { id: 't1', dealId: '1', title: 'Order Septic Inspection', status: 'To Do', priority: 'Critical', category: 'Inspection', due: '2024-11-05', phase: 'Inspection', assignedTo: 'Agent', description: 'Mandatory septic check as per clause 4.2.' },
    { id: 't2', dealId: '1', title: 'Review HOA Bylaws', status: 'In Progress', priority: 'High', category: 'Compliance', due: '2024-11-07', phase: 'Inspection', assignedTo: 'Client' },
    { id: 't3', dealId: '1', title: 'Confirm Appraisal Order', status: 'Done', priority: 'High', category: 'Lending', due: '2024-11-10', phase: 'Appraisal', assignedTo: 'TC' },
    { id: 't4', dealId: '1', title: 'Earnest Money Deposit', status: 'Done', priority: 'Critical', category: 'Lending', due: '2024-11-02', phase: 'Inspection', assignedTo: 'Client' },
  ]);

  const mockDeals: Deal[] = [
    { 
      id: '1', address: '123 Main St, Austin, TX', price: 450000, stage: 'Under Contract', 
      clientName: 'Smith Family', healthScore: 92, healthStatus: 'Healthy', 
      nextTask: 'Order Septic Inspection', missingDocs: 0, winProbability: 98, predictedClose: '2024-12-01',
      tasksCompleted: 42, tasksTotal: 47, financingType: 'Loan', propertyType: 'Freehold'
    },
    { 
      id: '2', address: '456 Oak Ave, Dallas, TX', price: 850000, stage: 'Inspection', 
      clientName: 'Jones Investment', healthScore: 45, healthStatus: 'Critical', 
      nextTask: 'Repair Addendum', missingDocs: 2, riskReason: 'Inspection contingency expires in 4h.',
      winProbability: 40, predictedClose: 'Uncertain',
      tasksCompleted: 12, tasksTotal: 34, financingType: 'Cash', propertyType: 'HOA'
    }
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await airtableService.getTransactions();
      const finalDeals = data && data.length > 0 ? data : mockDeals;
      setActiveDeals(finalDeals);
      setIsLoading(false);

      if (initialDealId) {
          const match = finalDeals.find(d => d.id === initialDealId);
          if (match) openDealCockpit(match);
      }
    };
    loadData();
  }, [initialDealId]);

  const openDealCockpit = async (deal: Deal) => {
    setSelectedDeal(deal);
    setOfferForm({...offerForm, price: deal.price, earnest: deal.price * 0.01});
    if (deal.stage === 'Negotiation') setDealView('negotiation');
    if (deal.stage === 'Under Contract') setDealView('tasks');
  };

  const handleNudgeLender = async (fin: FinancingLog) => {
    setIsNudging(true);
    await n8nService.nudgeLender(fin.id, fin.dealId);
    setTimeout(() => {
        setIsNudging(false);
        alert(`Lender Liaison AI: High-priority nudge dispatched to ${fin.lenderName}. Syncing Inbox for response patterns.`);
    }, 1500);
  };

  const handleGenerateProjectPlan = async () => {
    if (!selectedDeal) return;
    setIsGeneratingPlan(true);
    // Workflow 148 Node 1: Trigger Status Change -> Contract Analysis
    await n8nService.triggerWorkflow('contract-to-project-plan', { dealId: selectedDeal.id });
    
    setTimeout(() => {
        alert("AI Project Plan Generated: 52 tasks mapped to contract terms and effective dates.");
        setIsGeneratingPlan(false);
    }, 2500);
  };

  const handleNegotiationAction = async (decision: 'Accept' | 'Reject' | 'Counter') => {
      setIsNegotiating(true);
      await n8nService.logNegotiationDecision('r2', decision);
      setTimeout(() => {
          setIsNegotiating(false);
          alert(`Decision "${decision}" logged and dispatched to the other side.`);
      }, 1200);
  };

  const handleUploadCounter = async (file: File) => {
      setIsSynthesizing(true);
      await n8nService.parseCounterPDF(file, selectedDeal?.id || '1');
      setTimeout(() => {
          alert("AI Analysis Complete: Counter terms extracted and delta map generated.");
          setIsSynthesizing(false);
      }, 2000);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleGenerateVoiceOffer = async () => {
    setIsSynthesizing(true);
    const textToProcess = manualInput || "Offer 500k on 123 Main, 30 day close, keep the washer dryer, inspection contingency 7 days.";
    
    try {
      if (process.env.API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: `You are a Real Estate Contract Assistant. Extract the following JSON from this dictation text: { "price": number, "address": string, "closing_days": number, "earnest_money": number, "inclusions": string, "inspection_days": number }. 
          Text: "${textToProcess}"`,
          config: { responseMimeType: 'application/json' }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          const draft: OfferDraft = {
            id: 'dr_' + Date.now(),
            dealId: selectedDeal?.id || 'unassigned',
            rawDictation: textToProcess,
            parsedPrice: parsed.price || 0,
            parsedClosingDays: parsed.closing_days || 30,
            parsedInclusions: parsed.inclusions || 'None',
            parsedInspectionDays: parsed.inspection_days || 7,
            pdfUrl: 'https://nexus-os.com/storage/draft_offer_123main.pdf',
            status: 'Draft',
            timestamp: 'Just Now'
          };
          setOfferDraft(draft);
          alert("Dictation Agent: Text transcribed and intent extracted. Drafting PDF fields for State Form TREC-1.");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleSendForESign = async () => {
    if (!offerDraft) return;
    setIsSynthesizing(true);
    await n8nService.sendVoiceOffer(offerDraft.id);
    setTimeout(() => {
        setOfferDraft(prev => prev ? { ...prev, status: 'Sent' } : null);
        setIsSynthesizing(false);
        alert("E-Sign Dispatch: DocuSign envelope finalized and sent to client.");
    }, 1500);
  };

  const handlePolishStips = async () => {
      if (!offerForm.specialStips.trim() || !process.env.API_KEY) return;
      setIsPolishingStips(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const prompt = `Convert this natural language real estate request into formal contract stipulation language. 
          Input: "${offerForm.specialStips}"
          Property: ${selectedDeal?.address}
          Output (Legal Syntax):`;
          
          const result = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: prompt
          });
          if (result.text) {
              setOfferForm({...offerForm, formattedStips: result.text.trim()});
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsPolishingStips(false);
      }
  };

  const handleDraftOffer = async () => {
    if (!selectedDeal) return;
    setIsDraftingOffer(true);
    
    // Workflow 107: Trigger n8n
    const result = await n8nService.triggerDocumentGeneration({
        type: 'Offer',
        dealId: selectedDeal.id,
        price: offerForm.price,
        earnest: offerForm.earnest,
        stips: offerForm.formattedStips || offerForm.specialStips,
        agentEmail: user?.email,
        clientName: selectedDeal.clientName
    });

    setTimeout(() => {
        const newDoc: GeneratedDoc = {
            id: Date.now().toString(),
            envelopeId: 'ds_' + Math.random().toString(36).substr(2, 9),
            docType: 'Offer',
            status: 'Sent',
            pdfUrl: '#',
            dealId: selectedDeal.id,
            timestamp: 'Just Now'
        };
        setGeneratedDocs([newDoc, ...generatedDocs]);
        setIsDraftingOffer(false);
        alert(`Offer for ${selectedDeal.address} has been drafted and sent to ${selectedDeal.clientName} via DocuSign.`);
    }, 2000);
  };

  const handleCompleteTask = (taskId: string) => {
      setDealTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: t.status === 'Done' ? 'To Do' : 'Done' } : t));
  };

  const renderKanbanColumn = (stage: string, title: string, colorClass: string) => {
    const dealsInStage = activeDeals.filter(d => d.stage === stage);
    return (
      <div className="flex-1 min-w-[260px] max-w-[300px] flex flex-col h-full bg-slate-100/50 rounded-2xl p-2 border border-slate-200/50">
        <div className={`p-3 rounded-t-2xl border-t-4 ${colorClass} bg-white shadow-sm mb-2 flex justify-between items-center px-4`}>
          <h3 className="font-black text-[9px] text-slate-700 uppercase tracking-[0.2em]">{title}</h3>
          <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">{dealsInStage.length}</span>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-2 pb-4 scrollbar-hide">
          {dealsInStage.map(deal => (
            <div key={deal.id} onClick={() => openDealCockpit(deal)} className={`bg-white p-3 rounded-xl border shadow-sm hover:shadow-md cursor-pointer transition-all relative overflow-hidden group ${deal.healthStatus === 'Critical' ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'}`}>
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${deal.healthStatus === 'Critical' ? 'bg-red-50' : 'bg-indigo-500'}`} />
              
              <div className="flex justify-between items-start mb-2 pl-1">
                <div className="min-w-0">
                    <p className="font-black text-slate-900 text-[10px] uppercase truncate tracking-tight">{deal.address}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{deal.clientName}</p>
                </div>
                <MoreHorizontal size={12} className="text-slate-300 group-hover:text-slate-600 shrink-0" />
              </div>

              <div className="pl-1 mt-3 space-y-2">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-700 tracking-tighter">${(deal.price / 1000).toFixed(0)}k</span>
                    <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${deal.healthStatus === 'Critical' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                        {deal.healthStatus}
                    </span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Syncing Pipeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in flex flex-col h-[calc(100vh-160px)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800 uppercase italic tracking-tighter">Deal Desk.</h2>
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mt-0.5">Real-time Transaction Velocity</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white rounded-xl p-0.5 border border-slate-200 shadow-sm overflow-x-auto max-w-full">
            <button onClick={() => setViewMode('board')} className={`p-2 rounded-lg transition-all ${viewMode === 'board' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}><KanbanIcon size={14} /></button>
            <button onClick={() => setViewMode('speed-offer')} className={`p-2 rounded-lg transition-all ${viewMode === 'speed-offer' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`} title="Speed Offer Bot"><Mic size={14}/></button>
            <button onClick={() => setViewMode('esign')} className={`p-2 rounded-lg transition-all ${viewMode === 'esign' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`} title="E-Sign Monitor"><Pen size={14}/></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}><ListIcon size={14} /></button>
            <button onClick={() => setViewMode('inbox')} className={`p-2 rounded-lg transition-all ${viewMode === 'inbox' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}><Inbox size={14} /></button>
          </div>
        </div>
      </div>

      {/* Workflow 145: Speed Offer Bot (Mobile-First View) */}
      {viewMode === 'speed-offer' && (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden flex-1 animate-fade-in-up flex flex-col p-8">
              <div className="flex flex-col items-center justify-center text-center space-y-6 flex-1 max-w-2xl mx-auto w-full">
                  <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white w-full relative overflow-hidden border-b-8 border-indigo-600">
                      <div className="absolute right-0 top-0 p-4 opacity-10 rotate-12"><Mic size={120}/></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                          <div className="p-2 bg-indigo-500 rounded-xl"><Bot size={20}/></div>
                          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Voice-to-Contract</span>
                        </div>
                        <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Speed Offer Bot.</h3>
                        <p className="text-indigo-200 text-sm font-medium leading-relaxed">Generated legally binding offers in under 60 seconds via dictation.</p>
                      </div>
                  </div>

                  <div className="w-full space-y-8 py-10">
                      {!offerDraft ? (
                          <div className="flex flex-col items-center gap-8">
                              <button 
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${isRecording ? 'bg-red-500 scale-110 shadow-[0_0_50px_rgba(239,68,68,0.5)]' : 'bg-indigo-600 shadow-2xl hover:scale-105'}`}
                              >
                                  {isRecording ? <StopCircle size={48} className="text-white animate-pulse" /> : <Mic size={48} className="text-white" />}
                              </button>
                              <div className="w-full">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Manual Dictation Input (Alternative)</p>
                                  <textarea 
                                    value={manualInput}
                                    onChange={e => setManualInput(e.target.value)}
                                    placeholder='Speak or type: "Offer 500k on 123 Main, 30 day close..."'
                                    className="w-full h-32 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] p-6 text-sm font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
                                  />
                              </div>
                              <button 
                                onClick={handleGenerateVoiceOffer}
                                disabled={isSynthesizing || (!audioBlob && !manualInput.trim())}
                                className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.25em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 border-b-4 border-indigo-600 disabled:opacity-50"
                              >
                                  {isSynthesizing ? <Loader2 size={18} className="animate-spin"/> : <Sparkles size={18}/>}
                                  Generate Draft Offer
                              </button>
                          </div>
                      ) : (
                          <div className="space-y-6 animate-fade-in-up w-full">
                              <div className="bg-slate-50 rounded-[2rem] border border-slate-200 p-8">
                                  <div className="flex justify-between items-start mb-8 border-b border-slate-200 pb-6">
                                      <div>
                                          <h4 className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Bot size={12}/> AI Extracted terms</h4>
                                          <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">{offerDraft.parsedPrice.toLocaleString()} USD</p>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">CLOSING WINDOW</p>
                                          <p className="text-xl font-black text-slate-800 tabular-nums">{offerDraft.parsedClosingDays} Days</p>
                                      </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-8 mb-8">
                                      <div>
                                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Earnest Money</p>
                                          <p className="text-sm font-bold text-slate-700">${(offerDraft.parsedPrice * 0.01).toLocaleString()}</p>
                                      </div>
                                      <div>
                                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Inspection Period</p>
                                          <p className="text-sm font-bold text-slate-700">{offerDraft.parsedInspectionDays} Days</p>
                                      </div>
                                  </div>
                                  <div className="p-4 bg-white rounded-2xl border border-slate-100 italic text-xs text-slate-500 leading-relaxed">
                                      "Inclusions: {offerDraft.parsedInclusions}"
                                  </div>
                              </div>

                              <div className="flex gap-4">
                                  <button onClick={() => setOfferDraft(null)} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">Re-Record</button>
                                  <button 
                                    onClick={handleSendForESign}
                                    disabled={isSynthesizing || offerDraft.status === 'Sent'}
                                    className={`flex-[2] py-4 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${offerDraft.status === 'Sent' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                  >
                                      {isSynthesizing ? <Loader2 size={16} className="animate-spin"/> : offerDraft.status === 'Sent' ? <Check size={16}/> : <Send size={16}/>}
                                      {offerDraft.status === 'Sent' ? 'Dispatched to DocuSign' : 'Approve & Send for E-Sign'}
                                  </button>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Workflow 138: Live E-Sign Dashboard (View B) */}
      {viewMode === 'esign' && (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden flex-1 animate-fade-in-up flex flex-col">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                  <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Pen size={18} className="text-indigo-600" /> Live E-Sign Dashboard (Workflow 138)
                  </h3>
                  <div className="flex gap-2">
                      <button className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-[9px] font-black uppercase text-indigo-600 flex items-center gap-2 shadow-sm"><RefreshCw size={12}/> Sync DocuSign</button>
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left">
                      <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest sticky top-0 z-10">
                          <tr>
                              <th className="p-6">Document Name</th>
                              <th className="p-6">Recipient</th>
                              <th className="p-6">Current Status</th>
                              <th className="p-6">Behavioral Trace</th>
                              <th className="p-6 text-right">Control</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                          {eSignEnvelopes.map(env => {
                              const viewedDate = env.viewedAt ? new Date(env.viewedAt) : null;
                              const isStalled = env.status === 'Delivered' && viewedDate && (Date.now() - viewedDate.getTime() > 2 * 3600 * 1000);
                              
                              return (
                                <tr key={env.id} className={`hover:bg-slate-50 transition-colors ${isStalled ? 'bg-red-50/30' : ''}`}>
                                    <td className="p-6">
                                        <div className="font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{env.documentName}</div>
                                        <div className="text-[8px] text-slate-400 uppercase font-bold tracking-widest">ID: {env.envelopeId}</div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2">
                                            <Mail size={12} className="text-slate-300"/>
                                            <span className="text-slate-600">{env.recipientEmail}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${
                                            env.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            env.status === 'Delivered' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                            'bg-slate-50 text-slate-500 border-slate-200'
                                        }`}>
                                            {env.status}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="space-y-1">
                                            {env.viewedAt && (
                                                <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase ${isStalled ? 'text-red-600 animate-pulse' : 'text-slate-400'}`}>
                                                    <MousePointerClick size={10}/> {isStalled ? 'STALLED: VIEWED BUT UNSIGNED' : `Viewed: ${new Date(env.viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                                </div>
                                            )}
                                            {env.signedAt && (
                                                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-emerald-600">
                                                    <CheckCircle2 size={10}/> Signed: {env.signedAt}
                                                </div>
                                            )}
                                            {!env.viewedAt && env.status === 'Sent' && (
                                                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-300 italic">
                                                    <Clock size={10}/> Not Viewed Yet
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        {isStalled ? (
                                            <button className="bg-red-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 ml-auto active:scale-95 transition-all">
                                                <Zap size={12}/> Send AI Nudge
                                            </button>
                                        ) : (
                                            <button className="p-2 text-slate-300 hover:text-indigo-600 transition-all"><RefreshCw size={16}/></button>
                                        )}
                                    </td>
                                </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {viewMode === 'inbox' ? (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden flex-1 animate-fade-in-up">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                  <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                    <ListTodo size={18} className="text-indigo-600" /> My Task Inbox
                  </h3>
              </div>
              <div className="overflow-y-auto h-full p-6">
                  <div className="space-y-4">
                      {dealTasks.map(task => (
                          <div key={task.id} className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all group ${
                              new Date(task.due) < new Date() && task.status !== 'Done' ? 'bg-red-50/50 border-red-100' : 'bg-white border-slate-100'
                          }`}>
                              <div className="flex items-center gap-4">
                                  <button onClick={() => handleCompleteTask(task.id)} className={`p-1.5 rounded-lg border-2 transition-all ${task.status === 'Done' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200'}`}>
                                      <CheckCircle2 size={16} />
                                  </button>
                                  <div>
                                      <h4 className={`font-black text-slate-800 text-[11px] uppercase tracking-tight ${task.status === 'Done' ? 'line-through opacity-40' : ''}`}>{task.title}</h4>
                                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                          Due: <span className={new Date(task.due) < new Date() && task.status !== 'Done' ? 'text-red-500' : 'text-slate-600'}>{new Date(task.due).toLocaleDateString()}</span> • {activeDeals.find(d => d.id === task.dealId)?.address}
                                      </p>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      ) : viewMode === 'board' ? (
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 -mx-1">
          <div className="flex gap-4 h-full min-w-[1500px] px-1">
            {['New', 'Negotiation', 'Under Contract', 'Inspection', 'Financing', 'Closing'].map(s => renderKanbanColumn(s, s, 'border-indigo-500'))}
          </div>
        </div>
      ) : viewMode === 'list' && (
        <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-md overflow-hidden flex-1">
          <div className="overflow-y-auto h-full">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] sticky top-0 z-10">
                <tr><th className="p-5">Property</th><th className="p-5">Volume</th><th className="p-5">Audit</th><th className="p-5">Task</th><th className="p-5 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[10px] font-bold">
                {activeDeals.map(deal => (
                    <tr key={deal.id} className="hover:bg-slate-50 cursor-pointer group" onClick={() => openDealCockpit(deal)}>
                        <td className="p-5">
                            <div className="font-black text-slate-900 uppercase tracking-tight">{deal.address}</div>
                            <div className="text-[8px] text-slate-400 uppercase font-black">{deal.clientName}</div>
                        </td>
                        <td className="p-5 font-black text-slate-800 tracking-tighter text-sm">${deal.price.toLocaleString()}</td>
                        <td className="p-5">
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${deal.healthStatus === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                {deal.healthStatus}
                            </span>
                        </td>
                        <td className="p-5 text-slate-500 uppercase tracking-wide">{deal.nextTask}</td>
                        <td className="p-5 text-right"><ChevronRight size={16} className="ml-auto text-slate-300 group-hover:text-indigo-600 transition-colors"/></td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedDeal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[500] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.4)] w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden animate-scale-in border border-white/20">
            <div className="p-6 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-start shrink-0">
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg">
                    <Home className="text-white" size={24} />
                 </div>
                 <div>
                    <h2 className="text-xl font-black uppercase tracking-tight italic">{selectedDeal.address}</h2>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{selectedDeal.clientName}</span>
                        <div className="w-1 h-1 bg-white/20 rounded-full" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">${selectedDeal.price.toLocaleString()}</span>
                    </div>
                 </div>
              </div>
              <button onClick={() => setSelectedDeal(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><X size={24} /></button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <div className="w-64 bg-slate-50 border-r border-slate-200 p-6 overflow-y-auto shrink-0 flex flex-col gap-6">
                    <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 px-1">Deal Tools</p>
                        {[
                            { id: 'financing', label: 'Loan Status', icon: Landmark },
                            { id: 'tasks', label: 'Task Manager', icon: LayoutGrid },
                            { id: 'checklist', label: 'Compliance', icon: ShieldIcon },
                            { id: 'negotiation', label: 'Negotiation', icon: Split },
                            { id: 'esign', label: 'E-Sign Monitor', icon: Pen },
                            { id: 'offer', label: 'Offer Builder', icon: PenTool },
                            { id: 'docs', label: 'Vault', icon: FileText }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setDealView(tab.id as any)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    dealView === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white hover:shadow-sm'
                                }`}
                            >
                                <tab.icon size={16} /> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 bg-white flex flex-col overflow-hidden">
                    <div className="p-8 overflow-y-auto h-full space-y-8">
                        {/* Workflow 151: Agent Loan Status sub-view */}
                        {dealView === 'financing' && (
                            <div className="space-y-8 animate-fade-in h-full flex flex-col">
                                <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 p-8 opacity-5 rotate-12"><Landmark size={180}/></div>
                                    <div className="relative z-10">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                            <div>
                                                <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-1">Loan Lifecycle.</h3>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Workflow 151: Lender Liaison AI Agent</p>
                                            </div>
                                            <button 
                                                onClick={() => handleNudgeLender(financingLogs.find(f => f.dealId === selectedDeal.id) || financingLogs[0])}
                                                disabled={isNudging}
                                                className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
                                            >
                                                {isNudging ? <Loader2 size={14} className="animate-spin"/> : <Zap size={14}/>}
                                                Nudge Lender Now
                                            </button>
                                        </div>

                                        {financingLogs.filter(f => f.dealId === selectedDeal.id).map(fin => (
                                            <div key={fin.id} className="space-y-8">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Lender</p>
                                                        <p className="text-lg font-black text-slate-900 uppercase tracking-tight truncate">{fin.lenderName}</p>
                                                        <p className="text-[9px] text-indigo-600 font-bold lowercase mt-1">{fin.lenderEmail}</p>
                                                    </div>
                                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Commitment Date</p>
                                                        <p className="text-lg font-black text-slate-900 tabular-nums">{new Date(fin.commitmentDate).toLocaleDateString()}</p>
                                                        <div className="flex items-center gap-1.5 mt-1 text-[8px] font-black text-emerald-600 uppercase">
                                                            <Clock size={10}/> On Schedule
                                                        </div>
                                                    </div>
                                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Appraisal Status</p>
                                                        <p className="text-lg font-black text-slate-900 uppercase tracking-tight">{fin.appraisalStatus}</p>
                                                        <span className="bg-emerald-50 text-emerald-700 text-[7px] font-black px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-widest mt-1 inline-block">Value Met</span>
                                                    </div>
                                                </div>

                                                <div className="bg-white border-2 border-indigo-100 rounded-3xl p-8 relative">
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <Bot size={20} className="text-indigo-600"/>
                                                        <h4 className="font-black text-xs uppercase tracking-widest text-indigo-900">Latest Liaison Synthesis</h4>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-700 leading-relaxed italic border-l-4 border-indigo-500 pl-6 mb-8">
                                                        "{fin.lastUpdateRaw}"
                                                    </p>
                                                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                        <RefreshCw size={10}/> Last Sync: {fin.timestamp}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Workflow 148: Agent Task Kanban View */}
                        {dealView === 'tasks' && (
                            <div className="space-y-8 animate-fade-in h-full flex flex-col">
                                <div className="flex justify-between items-center shrink-0">
                                    <div>
                                        <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-1">Project Plan.</h3>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Workflow 148: Context-Aware Bundle</p>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" checked={showCompletedTasks} onChange={() => setShowCompletedTasks(!showCompletedTasks)} className="hidden" />
                                            <div className={`w-4 h-4 rounded border ${showCompletedTasks ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                                                {showCompletedTasks && <Check size={14}/>}
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-indigo-600">Show Completed</span>
                                        </label>
                                        <button 
                                            onClick={handleGenerateProjectPlan}
                                            disabled={isGeneratingPlan}
                                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {isGeneratingPlan ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
                                            Regenerate Context Tasks
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide flex-1">
                                    {['Inspection', 'Appraisal', 'Financing', 'Closing'].map(phase => {
                                        const phaseTasks = dealTasks.filter(t => t.dealId === selectedDeal.id && t.phase === phase && (showCompletedTasks || t.status !== 'Done'));
                                        return (
                                            <div key={phase} className="flex-1 min-w-[320px] bg-slate-50/50 rounded-[2rem] p-5 flex flex-col border border-slate-200">
                                                <div className="flex justify-between items-center mb-6 px-4 pt-2">
                                                    <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.25em]">{phase}</h3>
                                                    <span className="bg-white px-2 py-0.5 rounded-full text-[9px] font-black text-slate-300 border border-slate-100 shadow-sm">{phaseTasks.length}</span>
                                                </div>
                                                <div className="space-y-4 overflow-y-auto flex-1 px-1 scrollbar-hide">
                                                    {phaseTasks.map(task => {
                                                        const isOverdue = new Date(task.due) < new Date() && task.status !== 'Done';
                                                        return (
                                                            <div key={task.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 transition-all group relative overflow-hidden">
                                                                {task.priority === 'Critical' && <div className="absolute top-0 right-0 w-12 h-1 bg-red-500" />}
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <h4 className={`font-black text-slate-900 uppercase tracking-tight text-xs leading-tight mb-1 flex-1 ${task.status === 'Done' ? 'line-through text-slate-300' : ''}`}>{task.title}</h4>
                                                                    <div className="flex gap-1 items-center">
                                                                        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${
                                                                            task.assignedTo === 'Client' ? 'bg-indigo-50 text-indigo-700' : 
                                                                            task.assignedTo === 'Agent' ? 'bg-slate-900 text-white' : 
                                                                            'bg-slate-100 text-slate-500'
                                                                        }`}>
                                                                            {task.assignedTo}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-between items-center">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Clock size={12} className={isOverdue ? 'text-red-500' : 'text-slate-300'} />
                                                                        <span className={`text-[9px] font-black uppercase ${isOverdue ? 'text-red-600 animate-pulse' : 'text-slate-400'}`}>
                                                                            {new Date(task.due).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                    <button 
                                                                        onClick={() => handleCompleteTask(task.id)}
                                                                        className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${task.status === 'Done' ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 group-hover:border-indigo-500'}`}
                                                                    >
                                                                        {task.status === 'Done' && <Check size={12} />}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-300 hover:text-indigo-600 hover:border-indigo-300 transition-all font-black uppercase text-[9px] tracking-widest">
                                                        <Plus size={14}/> Add Phase Task
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {dealView === 'negotiation' && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600 flex justify-between items-center">
                                    <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Split size={180}/></div>
                                    <div className="relative z-10">
                                        <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Negotiation Portal.</h3>
                                        <p className="text-indigo-200 text-sm font-medium">Workflow 147: Analyzing round-by-round delta & leverage.</p>
                                    </div>
                                    <div className="relative z-10">
                                        <label className="bg-indigo-600 text-white px-5 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center gap-2 cursor-pointer hover:bg-indigo-700 transition-all">
                                            <Upload size={16}/> Upload New Counter (PDF)
                                            <input type="file" className="hidden" onChange={e => e.target.files && handleUploadCounter(e.target.files[0])}/>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Left: Original / Previous Offer */}
                                    <div className="bg-slate-50 rounded-[2rem] border-2 border-slate-200 p-8">
                                        <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-6">
                                            <h4 className="font-black text-slate-400 uppercase tracking-widest text-[9px]">Round 1: Our Offer</h4>
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-slate-200 px-2 py-0.5 rounded text-slate-600">Locked</span>
                                        </div>
                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Price</p>
                                                <p className="text-2xl font-black text-slate-900 tabular-nums">$500,000</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Concessions</p>
                                                <p className="text-sm font-bold text-slate-700">Keep washer/dryer</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Closing Date</p>
                                                <p className="text-sm font-bold text-slate-700">Dec 15, 2024</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Current Counter */}
                                    <div className="bg-white rounded-[2rem] border-2 border-indigo-200 p-8 shadow-2xl relative ring-4 ring-indigo-50">
                                        <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-6">
                                            <h4 className="font-black text-indigo-600 uppercase tracking-widest text-[9px]">Round 2: Their Counter</h4>
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white px-2 py-0.5 rounded shadow-sm animate-pulse">Action Required</span>
                                        </div>
                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Price</p>
                                                <p className="text-2xl font-black text-red-600 tabular-nums">$515,000 <span className="text-[10px] text-red-400 ml-1 font-bold">+$15k</span></p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Concessions</p>
                                                <p className="text-sm font-bold text-red-700">Removed appliances, added $5k repair credit</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Closing Date</p>
                                                <p className="text-sm font-bold text-emerald-600 flex items-center gap-2">Dec 01, 2024 <span className="text-[10px] font-bold">(-14 days)</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-[2.5rem] p-8 relative overflow-hidden">
                                    <div className="absolute right-[-10px] top-[-10px] p-4 opacity-5"><Sparkles size={120}/></div>
                                    <div className="relative z-10">
                                        <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><Bot size={18}/> Gemini Strategy Co-Pilot</h4>
                                        <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm mb-8">
                                            <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"The seller has moved the closing date up by 2 weeks. This is a massive leverage signal suggesting they need to liquidate fast. **Strategy Recommendation**: Accept the $515k price point but demand the washer/dryer be included AND request an additional $5k credit for the roof. They are unlikely to blow up the deal for $10k with a Dec 1 deadline looming."</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <button onClick={() => handleNegotiationAction('Accept')} className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-emerald-700 active:scale-95 transition-all">Accept Counter</button>
                                            <button onClick={() => handleNegotiationAction('Counter')} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">Generate Counter #3</button>
                                            <button onClick={() => handleNegotiationAction('Reject')} className="px-8 bg-white border-2 border-red-100 text-red-600 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-50 transition-all">Reject</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {dealView === 'esign' && (
                             <div className="space-y-6 animate-fade-in">
                                 <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Active Envelopes for {selectedDeal.address}</h3>
                                 </div>
                                 <div className="space-y-4">
                                     {eSignEnvelopes.filter(e => e.dealId === selectedDeal.id).map(env => {
                                         const viewedDate = env.viewedAt ? new Date(env.viewedAt) : null;
                                         const isStalled = env.status === 'Delivered' && viewedDate && (Date.now() - viewedDate.getTime() > 2 * 3600 * 1000);
                                         
                                         return (
                                            <div key={env.id} className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col md:flex-row items-center justify-between gap-6 group ${isStalled ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
                                                <div className="flex items-center gap-5">
                                                    <div className={`p-4 rounded-3xl ${env.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : isStalled ? 'bg-red-100 text-red-600' : 'bg-white text-slate-300'} shadow-sm`}>
                                                        <FileText size={24}/>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-900 uppercase tracking-tight text-base mb-1">{env.documentName}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                                                                env.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-indigo-50 text-indigo-700'
                                                            }`}>{env.status}</span>
                                                            <span className="text-[9px] text-slate-400 font-bold uppercase">{env.recipientEmail}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {isStalled && (
                                                        <div className="bg-white/50 px-4 py-2 rounded-2xl border border-red-100 flex items-center gap-2 animate-pulse">
                                                            <AlertCircle size={14} className="text-red-500"/>
                                                            <span className="text-[9px] font-black text-red-700 uppercase tracking-widest">Stalled: Seen 3h ago</span>
                                                        </div>
                                                    )}
                                                    {isStalled ? (
                                                        <button className="bg-red-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 active:scale-95">
                                                            <Zap size={14}/> Dispatch AI Nudge
                                                        </button>
                                                    ) : (
                                                        <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 active:scale-95">
                                                            <RefreshCw size={14}/> Sync Status
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                         );
                                     })}
                                 </div>
                             </div>
                        )}

                        {dealView === 'offer' && (
                            <div className="animate-fade-in-up space-y-8 max-w-2xl">
                                <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl border-b-8 border-indigo-900">
                                    <div className="absolute right-0 top-0 p-4 opacity-10"><Pen size={120}/></div>
                                    <div className="relative z-10">
                                        <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Smart Offer Builder.</h3>
                                        <p className="text-indigo-100 text-sm font-medium">Auto-mapping data to state-approved DocuSign templates. AI handles the special stipulations syntax.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Offer Price</label>
                                        <div className="relative">
                                            <input type="number" value={offerForm.price} onChange={e => setOfferForm({...offerForm, price: parseInt(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                                            <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Earnest Money</label>
                                        <div className="relative">
                                            <input type="number" value={offerForm.earnest} onChange={e => setOfferForm({...offerForm, earnest: parseInt(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                                            <ShieldIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1 flex justify-between">
                                        Special Stipulations (Natural Language)
                                        <button onClick={handlePolishStips} disabled={isPolishingStips} className="text-indigo-600 flex items-center gap-1 hover:underline">
                                            {isPolishingStips ? <Loader2 size={10} className="animate-spin"/> : <Sparkles size={10}/>} AI Legal Polish
                                        </button>
                                    </label>
                                    <textarea 
                                        value={offerForm.specialStips}
                                        onChange={e => setOfferForm({...offerForm, specialStips: e.target.value})}
                                        placeholder="e.g. Seller to pay $5k closing costs and repair roof leak in master."
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none h-32" 
                                    />
                                </div>

                                {offerForm.formattedStips && (
                                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 relative animate-fade-in">
                                        <h4 className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Bot size={14}/> AI Formatted Contract Language</h4>
                                        <p className="text-sm font-bold text-slate-700 italic leading-relaxed">"{offerForm.formattedStips}"</p>
                                    </div>
                                )}

                                <div className="pt-4 flex gap-4">
                                    <button 
                                        onClick={handleDraftOffer}
                                        disabled={isDraftingOffer}
                                        className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.25em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 border-b-4 border-indigo-600 disabled:opacity-50"
                                    >
                                        {isDraftingOffer ? <Loader2 size={18} className="animate-spin"/> : <FileDown size={18}/>}
                                        Draft & Send via DocuSign
                                    </button>
                                </div>
                            </div>
                        )}

                        {dealView === 'checklist' && (
                            <div className="space-y-6 animate-fade-in h-full flex flex-col">
                                <div className="flex justify-between items-center mb-6 shrink-0">
                                    <div>
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Compliance Checklist (Workflow 137)</h3>
                                        <p className="text-[9px] text-indigo-600 font-bold uppercase mt-1">AI-Assigned Requirements Engine</p>
                                    </div>
                                    <button 
                                        onClick={() => n8nService.triggerComplianceChecklist(selectedDeal.id, { description: 'Built 1970, pool, septic', yearBuilt: 1970, type: 'Single Family' })}
                                        className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:underline"
                                    >
                                        <RefreshCw size={12}/> Run AI Scan
                                    </button>
                                </div>

                                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide flex-1">
                                    {['Missing', 'Pending Review', 'Approved'].map(status => (
                                        <div key={status} className="flex-1 min-w-[300px] bg-slate-100/50 rounded-3xl p-4 flex flex-col border border-slate-200/50">
                                            <div className="flex justify-between items-center mb-4 px-3">
                                                <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{status}</h4>
                                                <span className="bg-white px-2 py-0.5 rounded-full text-[9px] font-black text-slate-400">{complianceItems.filter(ci => ci.dealId === selectedDeal.id && ci.status === status).length}</span>
                                            </div>
                                            <div className="space-y-3 overflow-y-auto flex-1 scrollbar-hide">
                                                {complianceItems.filter(ci => ci.dealId === selectedDeal.id && ci.status === status).map(item => (
                                                    <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm group hover:border-indigo-400 transition-all">
                                                        <h5 className="font-black text-slate-900 uppercase tracking-tight text-xs mb-2 leading-tight">{item.documentName}</h5>
                                                        <div className="bg-indigo-50/50 border border-indigo-100 p-2 rounded-xl mb-3">
                                                            <div className="flex items-center gap-1.5 text-[8px] font-black text-indigo-600 uppercase tracking-widest">
                                                                <Bot size={10}/> Rule: {item.sourceRule}
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <button className="text-[8px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">Action Protocol</button>
                                                            <button className="p-1.5 bg-slate-50 text-slate-300 rounded-lg group-hover:text-indigo-600 transition-colors"><ChevronRight size={14}/></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {dealView === 'docs' && (
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
                                {generatedDocs.map((doc, i) => (
                                    <div key={i} className="p-5 rounded-[1.5rem] border border-indigo-200 shadow-xl bg-indigo-50/30 hover:bg-white hover:border-indigo-400 transition-all group relative cursor-pointer h-40 flex flex-col justify-between border-b-4">
                                        <div className="flex justify-between items-start">
                                            <div className="p-2 bg-indigo-600 rounded-xl shadow-sm text-white">
                                                <FileText size={20} />
                                            </div>
                                            <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest bg-indigo-600 text-white`}>{doc.status}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 text-[10px] uppercase tracking-tight line-clamp-2">{doc.docType} (Generated)</h4>
                                            <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{doc.timestamp}</p>
                                        </div>
                                    </div>
                                ))}
                                {[
                                    {n: 'Purchase Agreement', s: 'Compliant', d: 'Oct 24'},
                                    {n: 'Seller Disclosure', s: 'Review Needed', d: 'Oct 25'},
                                    {n: 'Inspection Report', s: 'Missing', d: '--'}
                                ].map((doc, i) => (
                                    <div key={i} className="p-5 rounded-[1.5rem] border border-slate-200 shadow-sm bg-slate-50 hover:bg-white hover:border-indigo-300 transition-all group relative cursor-pointer h-40 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:bg-indigo-50 transition-colors text-slate-400 group-hover:text-indigo-600">
                                                <FileText size={20} />
                                            </div>
                                            <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest ${
                                                doc.s === 'Compliant' ? 'bg-emerald-50 text-emerald-700' : 
                                                doc.s === 'Missing' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
                                            }`}>{doc.s}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 text-[10px] uppercase tracking-tight line-clamp-2">{doc.n}</h4>
                                            <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{doc.d}</p>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        )}
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManager;
