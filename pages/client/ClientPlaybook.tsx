
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Circle, Lock, Play, FileText, 
  Upload, ArrowRight, MessageSquare, Bot, AlertTriangle, 
  Briefcase, Key, RefreshCw, Users, MoreHorizontal, Map,
  Plane, TrendingUp, Home, ChevronRight, Search, Calculator, DollarSign,
  Car, Clock, CheckSquare
} from 'lucide-react';
import { ClientPlaybookData, PlaybookStep, UserRole } from '../../types';
import { n8nService } from '../../services/n8n';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleGenAI } from "@google/genai";

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
        videoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
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
  const [heyGenModalOpen, setHeyGenModalOpen] = useState(false);

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
        const updatedSteps = template.steps.map((s, i) => ({
            ...s,
            status: i < activeStepIndex ? 'complete' : i === activeStepIndex ? 'active' : 'locked'
        }));

        const completedCount = updatedSteps.filter(s => s.status === 'complete').length;
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
  }, [role, user]);

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
    
    mockProgressPlaybook.steps = mockProgressPlaybook.steps.map((s, i) => ({
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
                {activePlaybook.steps.map((step, index) => (
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

        <div className="lg:col-span-8">
          {activePlaybook.steps.map(step => {
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
        </div>
      </div>
    </div>
  );
};

export default ClientPlaybook;
