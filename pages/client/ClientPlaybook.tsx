
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Circle, Lock, Play, FileText, 
  Upload, ArrowRight, MessageSquare, Bot, AlertTriangle, 
  Briefcase, Key, RefreshCw, Users, MoreHorizontal, Map,
  Plane, TrendingUp, Home, ChevronRight, Search, Calculator, DollarSign,
  Car, Clock, CheckSquare, Loader2, Calendar, Send, X
} from 'lucide-react';
import { ClientPlaybookData, PlaybookStep, UserRole, JourneyState, Deal, Listing, ClientDocument, ShowingRequest } from '../../types';
import { n8nService } from '../../services/n8n';
import { airtableService } from '../../services/airtable';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleGenAI } from "@google/genai";
import { JourneyCardsRenderer } from '../../components/JourneyCardsRenderer';
import { TransparencyFeed } from '../../components/TransparencyFeed';
import { PersonaTools } from '../../components/PersonaTools';
import { DealTeamSection } from '../../components/DealTeamSection';

// --- 1. Playbook Content Definitions (Workflows 38, 39, 40, 42) ---

const PLAYBOOK_TEMPLATES: Record<string, ClientPlaybookData> = {
  'buyer_first_time': {
    id: 'pb_buyer_01',
    name: "Home Buying Master Plan",
    progress: 0,
    currentStepIndex: 0,
    lastActivity: 'Never',
    stalled: false,
    steps: [
      {
        id: 's1',
        title: 'Financial Health Check',
        description: 'Before we hunt, we need to know your purchasing power. Watch the video on DTI ratios and credit scores.',
        type: 'video',
        status: 'complete',
        videoUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        resourceLink: 'https://nexus.com/tools/affordability-calculator'
      },
      {
        id: 's2',
        title: 'Get Pre-Approved',
        description: 'Upload your pre-approval letter from a lender. This is your golden ticket to tour homes.',
        type: 'upload',
        status: 'complete',
        requiredDoc: 'Pre-Approval Letter'
      },
      {
        id: 's3',
        title: 'The Touring Strategy',
        description: 'Learn how to spot red flags during a showing (Foundation, HVAC, Roof).',
        type: 'video',
        status: 'complete',
        videoUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 's4',
        title: 'Making a Winning Offer',
        description: 'Understand contingencies, earnest money, and escalation clauses.',
        type: 'video',
        status: 'complete',
        videoUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 's5',
        title: 'Inspection & Repairs',
        description: 'We are Under Contract! Now we schedule inspectors and negotiate repairs. Watch the guide on "What Matters vs What Doesn\'t".',
        type: 'video',
        status: 'active',
        videoUrl: 'https://images.unsplash.com/photo-1581578731117-10d78b211a7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 's6',
        title: 'Closing Day Prep',
        description: 'Final walkthrough checklist, wiring instructions, and utility transfer.',
        type: 'form',
        status: 'locked'
      }
    ]
  },
  'seller_journey': {
    id: 'pb_seller_01',
    name: "Home Selling Roadmap",
    progress: 0,
    currentStepIndex: 0,
    lastActivity: 'Never',
    stalled: false,
    steps: [
      {
        id: 's1',
        title: 'Listing Prep Checklist',
        description: 'Prepare your home for the market. Complete this checklist before our photographer arrives to maximize value.',
        type: 'form',
        status: 'complete'
      },
      {
        id: 's2',
        title: 'Upload Disclosures',
        description: 'Please sign and upload the Seller Disclosure Notice so we can be legally compliant.',
        type: 'upload',
        requiredDoc: 'Seller Disclosure',
        status: 'complete'
      },
      {
        id: 's3',
        title: 'Active Marketing Plan',
        description: 'Your home is LIVE. Watch the breakdown of our social ads, open houses, and showing tracking strategy.',
        type: 'video',
        status: 'active',
        videoUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 's4',
        title: 'Offer Negotiation Strategy',
        description: 'Review offers, negotiate terms, and select the best buyer for your timeline.',
        type: 'video',
        status: 'locked',
        videoUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 's5',
        title: 'Closing & Move',
        description: 'Finalize paperwork, transfer utilities, and hand over the keys.',
        type: 'action',
        status: 'locked'
      }
    ]
  },
  'relocation_guide': {
    id: 'pb_relo_01',
    name: "City Relocation Guide",
    progress: 0,
    currentStepIndex: 0,
    lastActivity: 'Never',
    stalled: false,
    steps: [
      { id: 's1', title: 'Neighborhood Matchmaker', description: 'Take the quiz to find your ideal vibe (Urban, Suburban, Quiet, Lively) and we\'ll map it.', type: 'form', status: 'complete' },
      { id: 's2', title: 'School District Deep Dive', description: 'Review our curated video on local school ratings and attendance boundaries.', type: 'video', status: 'complete', videoUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
      { id: 's3', title: 'Commute Analysis', description: 'Input your new office location to calculate rush-hour drive times to top neighborhoods.', type: 'tool', status: 'active' },
      { id: 's4', title: 'Virtual Tours Strategy', description: 'We conduct high-fidelity Facetime tours for you. Schedule your first block.', type: 'action', status: 'locked' },
      { id: 's5', title: 'Utility & Moving Concierge', description: 'One-click setup for water, electric, and internet before your arrival.', type: 'action', status: 'locked' }
    ]
  },
  'investor_protocol': {
    id: 'pb_investor_01',
    name: "Investor Wealth Protocol",
    progress: 0,
    currentStepIndex: 0,
    lastActivity: 'Never',
    stalled: false,
    steps: [
      { id: 's1', title: 'Strategy Session', description: 'Define Buy Box: BRRRR, Flip, or Cash Flow? Target Cap Rate?', type: 'form', status: 'complete' },
      { id: 's2', title: 'Instant Property Analyzer', description: 'Run the numbers on any address. Get Estimated Value, Rent, and Cap Rate instantly.', type: 'tool', status: 'active' },
      { id: 's3', title: 'Proof of Funds', description: 'Upload recent bank statement or Hard Money Pre-Approval Letter to unlock deals.', type: 'upload', status: 'locked', requiredDoc: 'POF / Pre-Approval' },
      { id: 's4', title: 'Market Analysis', description: 'Identifying high-yield zip codes and absorption rates in the current market.', type: 'video', status: 'locked', videoUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
      { id: 's5', title: 'Off-Market Access', description: 'Unlock access to our exclusive wholesaler inventory and pocket listings.', type: 'action', status: 'locked' }
    ]
  }
};

// Mock Client Database for Agents
const MOCK_CLIENTS = [
  { id: 'c1', name: 'Alice Freeman', role: 'Buyer', assignedPlaybook: 'buyer_first_time', progress: 66, status: 'Active' },
  { id: 'c2', name: 'Bob Driller', role: 'Investor', assignedPlaybook: 'investor_protocol', progress: 20, status: 'Stalled' },
  { id: 'c3', name: 'Charlie Day', role: 'Seller', assignedPlaybook: 'seller_journey', progress: 40, status: 'Active' },
  { id: 'c4', name: 'Diane Court', role: 'Buyer', assignedPlaybook: 'relocation_guide', progress: 60, status: 'Active' },
];

const ClientPlaybook: React.FC = () => {
  const { user, role } = useAuth();
  
  // Agent State
  const [clients, setClients] = useState(MOCK_CLIENTS);
  const [viewMode, setViewMode] = useState<'agent_dashboard' | 'client_view'>('client_view');
  const [selectedClient, setSelectedClient] = useState<any>(null); // For agent to manage specific client
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [clientToAssign, setClientToAssign] = useState<string | null>(null);

  // Client State (The actual playbook view)
  const [activePlaybook, setActivePlaybook] = useState<ClientPlaybookData>(PLAYBOOK_TEMPLATES['buyer_first_time']);
  const [activeStepId, setActiveStepId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [journeyState, setJourneyState] = useState<JourneyState | null>(null);
  const [transaction, setTransaction] = useState<Deal | null>(null);

  // Tool State
  const [avmAddress, setAvmAddress] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [avmResult, setAvmResult] = useState<any>(null);
  
  // Relo Tool State
  const [commuteAddress, setCommuteAddress] = useState('');
  const [commuteResult, setCommuteResult] = useState<any>(null);

  // --- Initialization Logic ---
  useEffect(() => {
    if (role === UserRole.AGENT || role === UserRole.BROKER) {
      setViewMode('agent_dashboard');
    } else {
      setViewMode('client_view');
      loadPlaybookForUser();
      loadJourneyData();
    }
  }, [role, user]);

  const loadJourneyData = async () => {
    if (user?.id) {
        const state = await airtableService.getJourneyStateByUserId(user.id);
        setJourneyState(state);
        
        if (state?.dealId) {
            const transactions = await airtableService.getTransactions();
            const deal = transactions?.find(t => t.id === state.dealId);
            if (deal) setTransaction(deal);
        }
    }
  };

  const loadPlaybookForUser = () => {
      let templateId = 'buyer_first_time'; 
      let activeStepIndex = 0;

      if (role === UserRole.SELLER) {
        templateId = 'seller_journey';
        activeStepIndex = 2; 
      } else if (user?.email?.includes('investor')) {
        templateId = 'investor_protocol';
        activeStepIndex = 1; 
      } else if (user?.email?.includes('relo')) {
        templateId = 'relocation_guide';
        activeStepIndex = 2; 
      } else if (user?.email?.includes('buyer')) {
        templateId = 'buyer_first_time';
        activeStepIndex = 4; 
      }

      const template = PLAYBOOK_TEMPLATES[templateId];
      if (template) {
        const updatedSteps = template.steps.map((s: any, i: number) => ({
            ...s,
            status: i < activeStepIndex ? 'complete' : i === activeStepIndex ? 'active' : 'locked'
        }));

        const completedCount = updatedSteps.filter((s: any) => s.status === 'complete').length;
        const progressPercent = Math.round((completedCount / updatedSteps.length) * 100);

        const updatedPlaybook: ClientPlaybookData = {
            ...template,
            progress: progressPercent,
            currentStepIndex: activeStepIndex,
            steps: updatedSteps as PlaybookStep[]
        };

        setActivePlaybook(updatedPlaybook);
        setActiveStepId(updatedPlaybook.steps[activeStepIndex]?.id || updatedPlaybook.steps[0].id);
      }
  }

  // --- Agent Actions ---
  const handleAssignPlaybook = (clientId: string, templateKey: string) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, assignedPlaybook: templateKey, progress: 0, status: 'Active' } : c));
    setAssignModalOpen(false);
    setClientToAssign(null);
    n8nService.assignPlaybook(clientId, templateKey);
    alert(`Assigned ${PLAYBOOK_TEMPLATES[templateKey].name} to client.`);
  };

  const handleAgentViewClient = (client: any) => {
    if (!client.assignedPlaybook) {
      setClientToAssign(client.id);
      setAssignModalOpen(true);
      return;
    }
    const template = PLAYBOOK_TEMPLATES[client.assignedPlaybook];
    const stepCount = template.steps.length;
    const estimatedCompletedSteps = Math.floor((client.progress / 100) * stepCount);
    const activeStepIndex = Math.min(estimatedCompletedSteps, stepCount - 1);

    const mockProgressPlaybook = { 
        ...template, 
        progress: client.progress, 
        currentStepIndex: activeStepIndex 
    };
    
    mockProgressPlaybook.steps = mockProgressPlaybook.steps.map((s: any, i: number) => ({
        ...s,
        status: i < activeStepIndex ? 'complete' : i === activeStepIndex ? 'active' : 'locked'
    }));

    setActivePlaybook(mockProgressPlaybook);
    setActiveStepId(mockProgressPlaybook.steps[activeStepIndex]?.id || mockProgressPlaybook.steps[0].id);
    setSelectedClient(client);
    setViewMode('client_view');
  };

  const handleCompleteStep = async (stepId: string) => {
    setIsProcessing(true);
    const updatedSteps = activePlaybook.steps.map(s => 
      s.id === stepId ? { ...s, status: 'complete' as const } : s
    );
    const currentIdx = updatedSteps.findIndex(s => s.id === stepId);
    if (currentIdx < updatedSteps.length - 1) {
      updatedSteps[currentIdx + 1].status = 'active';
      setActiveStepId(updatedSteps[currentIdx + 1].id);
    }
    const completedCount = updatedSteps.filter(s => s.status === 'complete').length;
    const newProgress = Math.round((completedCount / updatedSteps.length) * 100);

    setActivePlaybook(prev => ({
      ...prev,
      steps: updatedSteps,
      progress: newProgress,
      currentStepIndex: currentIdx + 1
    }));
    
    n8nService.updatePlaybookProgress('current-user', stepId, 'complete');
    
    setTimeout(() => setIsProcessing(false), 800);
  };

  const handleAnalyzeProperty = async () => {
    if (!avmAddress) return;
    setIsAnalyzing(true);
    setAvmResult(null);

    setTimeout(() => {
      setAvmResult({
          estimatedValue: 550000,
          rentEstimate: 3200,
          capRate: 5.8,
          insight: "Property is in a high-demand area with strong rental history."
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleCommuteCalc = async () => {
      if (!commuteAddress) return;
      setIsAnalyzing(true);
      setTimeout(() => {
          setCommuteResult([
              { area: 'Downtown', time: '15 mins', mode: 'Car' },
              { area: 'Domain', time: '35 mins', mode: 'Car' },
              { area: 'Airport', time: '20 mins', mode: 'Car' }
          ]);
          setIsAnalyzing(false);
      }, 1500);
  }

  if (viewMode === 'agent_dashboard') {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Journey Command Center</h2>
            <p className="text-slate-500">Manage client playbooks and monitor engagement.</p>
          </div>
          <div className="flex gap-2">
             <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50">
                <Search size={16} /> Filter
             </button>
             <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700">
                <Users size={16} /> Add Client
             </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="p-4">Client Name</th>
                <th className="p-4">Assigned Journey</th>
                <th className="p-4">Status</th>
                <th className="p-4">Progress</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {clients.map(client => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{client.name}</div>
                    <div className="text-xs text-slate-500">{client.role}</div>
                  </td>
                  <td className="p-4">
                    {client.assignedPlaybook ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <Map size={12} /> {PLAYBOOK_TEMPLATES[client.assignedPlaybook].name}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Not Assigned</span>
                    )}
                  </td>
                  <td className="p-4">
                    {client.status === 'Stalled' ? (
                      <span className="text-red-600 font-bold flex items-center gap-1"><AlertTriangle size={12} /> Stalled</span>
                    ) : client.status === 'New' ? (
                      <span className="text-blue-600 font-bold flex items-center gap-1"><Circle size={12} /> New</span>
                    ) : (
                      <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={12} /> Active</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600" style={{ width: `${client.progress}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 mt-1 block">{client.progress}% Complete</span>
                  </td>
                  <td className="p-4 text-right">
                    {client.assignedPlaybook ? (
                        <button onClick={() => handleAgentViewClient(client)} className="text-indigo-600 hover:text-indigo-800 font-bold text-xs">
                            Manage
                        </button>
                    ) : (
                        <button 
                            onClick={() => { setClientToAssign(client.id); setAssignModalOpen(true); }}
                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded text-xs font-bold"
                        >
                            Assign Playbook
                        </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      {role === UserRole.AGENT && (
        <div className="flex items-center gap-4 mb-[-20px]">
            <button onClick={() => { setViewMode('agent_dashboard'); setSelectedClient(null); }} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 text-sm font-bold">
            ← Back to Dashboard
            </button>
            {selectedClient && (
                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold">
                    Viewing as: {selectedClient.name}
                </span>
            )}
        </div>
      )}

      <div className={`rounded-2xl shadow-sm border border-slate-200 p-8 relative overflow-hidden ${
          activePlaybook.id.includes('seller') ? 'bg-slate-900 text-white' : 
          activePlaybook.id.includes('investor') ? 'bg-purple-900 text-white' : 
          activePlaybook.id.includes('relo') ? 'bg-teal-900 text-white' : 
          'bg-white text-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                   activePlaybook.id.includes('buyer') ? 'bg-indigo-100 text-indigo-700' : 'bg-white/20 text-white'
               }`}>
                 Current Journey
               </span>
            </div>
            <h1 className="text-3xl font-bold">{activePlaybook.name}</h1>
          </div>
          <div className="text-right w-full md:w-auto">
            <div className="flex justify-between md:justify-end items-baseline gap-2 mb-1">
               <span className={`text-sm font-bold uppercase opacity-80`}>Progress</span>
               <span className={`text-3xl font-bold ${activePlaybook.id.includes('buyer') ? 'text-indigo-600' : 'text-white'}`}>
                   {activePlaybook.progress}%
               </span>
            </div>
            <div className={`w-full md:w-48 h-3 rounded-full overflow-hidden ${
                activePlaybook.id.includes('buyer') ? 'bg-slate-100' : 'bg-white/10'
            }`}>
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    activePlaybook.id.includes('buyer') ? 'bg-indigo-600' : 'bg-emerald-500'
                }`} 
                style={{ width: `${activePlaybook.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-sm uppercase">
               Timeline
             </div>
             <div className="divide-y divide-slate-100">
                {activePlaybook.steps.map((step: any, index: number) => (
                  <div 
                    key={step.id} 
                    onClick={() => step.status !== 'locked' && setActiveStepId(step.id)}
                    className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                      activeStepId === step.id ? 'bg-indigo-50/50' : 'hover:bg-slate-50'
                    } ${step.status === 'locked' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex-shrink-0">
                      {step.status === 'complete' ? (
                        <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                      ) : step.status === 'locked' ? (
                        <Lock className="text-slate-300 w-5 h-5" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-indigo-600 flex items-center justify-center">
                          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-sm font-bold ${activeStepId === step.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                        {step.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">{step.type}</p>
                    </div>
                    {activeStepId === step.id && <ArrowRight size={16} className="text-indigo-400" />}
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          {activePlaybook.steps.map((step: any) => {
            if (step.id !== activeStepId) return null;
            return (
              <div key={step.id} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in-up">
                
                <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
                  <div>
                     <span className="text-xs font-bold text-slate-400 uppercase">Step Details</span>
                     <h2 className="text-xl font-bold text-slate-800 mt-1">{step.title}</h2>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                    step.status === 'complete' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}>
                    {step.status}
                  </span>
                </div>

                <div className="p-8">
                  <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                    {step.description}
                  </p>

                  {step.type === 'video' && step.videoUrl && (
                    <div className="aspect-video bg-slate-900 rounded-xl relative group cursor-pointer overflow-hidden mb-8 shadow-lg">
                      <img src={step.videoUrl} alt="Video Thumbnail" className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform">
                          <Play size={32} className="text-white ml-1" />
                        </div>
                      </div>
                    </div>
                  )}

                  {step.type === 'upload' && (
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:bg-slate-50 transition-colors cursor-pointer mb-8 group relative">
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={() => alert("File uploaded! (Simulation)")} />
                      <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 group-hover:scale-110 transition-transform">
                        <Upload size={28} />
                      </div>
                      <h4 className="text-lg font-bold text-slate-800">Upload {step.requiredDoc || 'Document'}</h4>
                      <p className="text-slate-500 text-sm mt-1">Securely upload PDF, JPG, or PNG</p>
                    </div>
                  )}

                  {step.type === 'tool' && (
                    <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-200">
                       {activePlaybook.id.includes('relo') ? (
                           <div className="space-y-4">
                               <h4 className="font-bold text-slate-700 text-sm uppercase mb-2 flex items-center gap-2"><Car size={16}/> Commute Calculator</h4>
                               <div className="flex gap-2">
                                   <input 
                                     type="text" 
                                     placeholder="Enter your office address..." 
                                     className="flex-1 p-3 border border-slate-200 rounded-lg"
                                     value={commuteAddress}
                                     onChange={(e) => setCommuteAddress(e.target.value)}
                                   />
                                   <button 
                                     onClick={handleCommuteCalc}
                                     disabled={isAnalyzing || !commuteAddress}
                                     className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                                   >
                                     {isAnalyzing ? <RefreshCw className="animate-spin" /> : <Clock size={18} />} Calculate
                                   </button>
                               </div>
                           </div>
                       ) : (
                           <div>
                               <div className="flex gap-2 mb-4">
                                   <input 
                                     type="text" 
                                     placeholder="Enter property address..." 
                                     className="flex-1 p-3 border border-slate-200 rounded-lg"
                                     value={avmAddress}
                                     onChange={(e) => setAvmAddress(e.target.value)}
                                   />
                                   <button 
                                     onClick={handleAnalyzeProperty}
                                     disabled={isAnalyzing || !avmAddress}
                                     className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                                   >
                                     {isAnalyzing ? <RefreshCw className="animate-spin" /> : <Calculator size={18} />} Analyze
                                   </button>
                               </div>
                           </div>
                       )}
                    </div>
                  )}

                  {step.status !== 'complete' && (
                    <button 
                      onClick={() => handleCompleteStep(step.id)}
                      disabled={isProcessing}
                      className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isProcessing ? <RefreshCw className="animate-spin" /> : (
                        <>Mark as Complete <ArrowRight size={20} /></>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <div className="pt-4">
            <JourneyCardsRenderer userId={user?.id || 'demo-user'} userRole={role === UserRole.BUYER ? 'buyer' : 'seller'} />
          </div>

          <div className="mt-8">
            <TransparencyFeed contactId={user?.id || 'demo-user'} />
          </div>

          <div className="mt-8">
            <PersonaTools 
              userId={user?.id || 'demo-user'}
              persona={journeyState?.persona || 'first_time_buyer'}
              stage={journeyState?.currentStage || 'lead'}
            />
          </div>

          {(transaction || user?.id) && (
            <div className="mt-8">
                <DealTeamSection 
                    dealId={transaction?.id}
                    contactId={user?.id}
                    showAIActivity={true}
                />
            </div>
          )}

          {/* ===== NEW CLIENT SELF-SERVICE SECTIONS ===== */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelfScheduleShowings contactId={user?.id || 'demo-user'} />
            <DocumentUpload contactId={user?.id || 'demo-user'} />
          </div>
          
          <div className="mt-6">
            <FAQChatbot contactId={user?.id || 'demo-user'} />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- NEW SELF-SERVICE COMPONENTS ---

function SelfScheduleShowings({ contactId }: { contactId: string }) {
  const [properties, setProperties] = useState<Listing[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Listing | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  
  useEffect(() => {
    loadSavedProperties();
  }, [contactId]);
  
  const loadSavedProperties = async () => {
    const saved = await airtableService.getSavedProperties(contactId);
    setProperties(saved);
  };
  
  return (
    <div className="bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-tighter text-lg">
        <Calendar className="w-5 h-5 text-indigo-600" />
        Schedule Showings
      </h3>
      
      <p className="text-sm text-slate-600 mb-6 italic font-medium leading-relaxed">
        Found something you love? Request a private tour instantly. We'll confirm within 2 hours.
      </p>
      
      {properties.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-8 font-bold uppercase tracking-widest bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
          No saved properties yet.
        </p>
      ) : (
        <div className="space-y-3">
          {properties.map(property => (
            <button
              key={property.id}
              onClick={() => {
                setSelectedProperty(property);
                setShowRequestModal(true);
              }}
              className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-400 hover:bg-white text-left transition-all group"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-black text-slate-900 uppercase tracking-tight italic">{property.address}</p>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">${property.price.toLocaleString()}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          ))}
        </div>
      )}
      
      {showRequestModal && selectedProperty && (
        <ShowingRequestModal
          property={selectedProperty}
          contactId={contactId}
          onClose={() => setShowRequestModal(false)}
          onSubmit={async (requestData) => {
            await airtableService.createShowingRequest(requestData);
            alert('Showing request submitted! We\'ll confirm within 2 hours via SMS.');
            setShowRequestModal(false);
          }}
        />
      )}
    </div>
  );
}

function ShowingRequestModal({ property, contactId, onClose, onSubmit }: { property: Listing, contactId: string, onClose: () => void, onSubmit: (data: any) => Promise<void> }) {
  const [requestedDate, setRequestedDate] = useState('');
  const [requestedTime, setRequestedTime] = useState('');
  const [alternateTimes, setAlternateTimes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!requestedDate || !requestedTime) {
      alert('Please select a preferred date and time');
      return;
    }
    
    setIsSubmitting(true);
    await onSubmit({
      contactId,
      listingId: property.id,
      requestedDate,
      requestedTime,
      alternateTimes
    });
    setIsSubmitting(false);
  };
  
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[1000] p-6">
      <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-white/20 animate-scale-in">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-black uppercase tracking-tighter italic">Request Tour.</h3>
            <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-all"><X size={20}/></button>
        </div>
        
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl mb-6">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Property</p>
          <p className="font-black text-slate-800 uppercase tracking-tight">{property.address}</p>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">
              Preferred Date
            </label>
            <input
              type="date"
              value={requestedDate}
              onChange={(e) => setRequestedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-600 outline-none"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">
              Preferred Time
            </label>
            <select
              value={requestedTime}
              onChange={(e) => setRequestedTime(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none cursor-pointer focus:ring-2 focus:ring-indigo-600"
            >
              <option value="">Select time...</option>
              <option value="9:00 AM">9:00 AM</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="11:00 AM">11:00 AM</option>
              <option value="12:00 PM">12:00 PM</option>
              <option value="1:00 PM">1:00 PM</option>
              <option value="2:00 PM">2:00 PM</option>
              <option value="3:00 PM">3:00 PM</option>
              <option value="4:00 PM">4:00 PM</option>
              <option value="5:00 PM">5:00 PM</option>
              <option value="6:00 PM">6:00 PM</option>
            </select>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">
              Alternate Times (optional)
            </label>
            <textarea
              value={alternateTimes}
              onChange={(e) => setAlternateTimes(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-sm h-24 resize-none shadow-inner"
              placeholder="e.g., Also available Saturday afternoon"
            />
          </div>
        </div>
        
        <div className="flex gap-4 mt-10">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-700 transition-all border-b-4 border-indigo-950 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={14}/> : <Send size={14} />}
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}

function DocumentUpload({ contactId }: { contactId: string }) {
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => {
    loadDocuments();
  }, [contactId]);
  
  const loadDocuments = async () => {
    const docs = await airtableService.getClientDocuments();
    const myDocs = docs.filter(d => d.contactId === contactId);
    setDocuments(myDocs);
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, documentType: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File too large. Max 10MB allowed for secure vault transfer.');
      return;
    }
    
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Security Protocol: Only PDF, JPG, and PNG files allowed.');
      return;
    }
    
    setUploading(true);
    
    try {
      // Simulation of secure upload
      const mockUrl = `https://storage.nexus-os.com/uploads/${Date.now()}_${file.name}`;
      
      // Create document record in Airtable
      await airtableService.uploadClientDocument({
        contactId,
        documentType,
        fileUrl: mockUrl,
        fileName: file.name,
        fileSize: file.size
      });
      
      alert('Document uploaded to secure vault. Your agent and coordination team have been notified.');
      await loadDocuments();
    } catch (error) {
      alert('Upload failed. Connection error to storage cluster.');
    }
    
    setUploading(false);
  };
  
  return (
    <div className="bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm flex flex-col">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-tighter text-lg">
        <FileText className="w-5 h-5 text-indigo-600" />
        Secure Vault
      </h3>
      
      <p className="text-sm text-slate-600 mb-6 italic font-medium leading-relaxed">
        Upload pre-approval letters or disclosures. All files are encrypted and auto-indexed.
      </p>
      
      <div className="space-y-4 mb-6">
        <label className="block group">
          <div className="px-6 py-8 border-2 border-dashed border-slate-200 rounded-3xl hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer text-center transition-all group-active:scale-95 shadow-inner">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 inline-block mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest group-hover:text-indigo-900 transition-colors">
              {uploading ? 'Clerk Filing...' : 'Drop Documents Here'}
            </p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-1 italic">PDF, JPG, PNG (Max 10MB)</p>
          </div>
          <input
            type="file"
            onChange={(e) => handleFileUpload(e, 'other')}
            className="hidden"
            disabled={uploading}
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </label>
      </div>
      
      {documents.length > 0 && (
        <div className="border-t border-slate-100 pt-6 mt-auto">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Uploaded Assets</p>
          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                    <FileText className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 truncate uppercase tracking-tight">{doc.fileName}</span>
                </div>
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border tracking-widest ${
                  doc.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  doc.status === 'needs_reupload' ? 'bg-red-50 text-red-700 border-red-100' :
                  'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {doc.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FAQChatbot({ contactId }: { contactId: string }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your Smart Concierge. Ask me anything about your current journey or general real estate logic.' }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  
  const commonQuestions = [
    'When is my inspection?',
    'What documents do I need?',
    'How much are closing costs?',
    'When can I move in?'
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);
  
  const handleAsk = async (question: string) => {
    if (!question.trim()) return;
    
    const newMessages = [...messages, { role: 'user', content: question }];
    setMessages(newMessages);
    setInput('');
    setIsThinking(true);
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `A real estate client (ID: ${contactId}) is asking: "${question}". 
            Provide a helpful, expert, yet concise answer based on general real estate knowledge and the context of a home buying/selling journey. 
            Tone: Professional and encouraging. Limit to 3 sentences.`,
        });
        
        setMessages([...newMessages, { role: 'assistant', content: response.text || "I'm processing your request. Please hold." }]);
    } catch (e) {
        setMessages([...newMessages, { role: 'assistant', content: "My connection to the intelligence cluster is briefly interrupted. Please try again or text your agent directly." }]);
    } finally {
        setIsThinking(false);
    }
  };
  
  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group">
      <div className="absolute right-[-20px] top-[-20px] p-4 opacity-5 text-indigo-600 group-hover:rotate-12 transition-transform duration-1000 pointer-events-none"><Bot size={200}/></div>
      
      <div className="relative z-10">
          <h3 className="font-black text-slate-800 mb-6 flex items-center gap-3 uppercase italic tracking-tighter text-xl">
            <Bot className="w-8 h-8 text-indigo-600" />
            Smart FAQ Concierge.
          </h3>
          
          {/* Quick questions */}
          <div className="flex flex-wrap gap-2 mb-8">
            {commonQuestions.map(q => (
              <button
                key={q}
                onClick={() => handleAsk(q)}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
              >
                {q}
              </button>
            ))}
          </div>
          
          {/* Chat messages */}
          <div className="h-80 overflow-y-auto mb-6 space-y-6 scrollbar-hide p-4 bg-slate-50 rounded-[2rem] shadow-inner">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                <div className={`max-w-[85%] px-6 py-4 rounded-[1.5rem] shadow-sm relative ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none border-b-2 border-indigo-800' 
                    : 'bg-white text-slate-700 rounded-bl-none border border-slate-200'
                }`}>
                  <p className="text-sm font-bold leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 px-6 py-4 rounded-[1.5rem] rounded-bl-none shadow-sm flex items-center gap-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Thinking...</p>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          
          {/* Input */}
          <div className="flex gap-4 p-2 bg-white rounded-[2rem] border border-slate-200 shadow-xl">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAsk(input)}
              placeholder="Ask me anything..."
              className="flex-1 px-6 py-4 border-none outline-none text-sm font-bold bg-transparent"
            />
            <button
              onClick={() => handleAsk(input)}
              disabled={!input.trim() || isThinking}
              className="px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center shadow-lg active:scale-95"
            >
              <Send size={20} />
            </button>
          </div>
      </div>
    </div>
  );
}

export default ClientPlaybook;
