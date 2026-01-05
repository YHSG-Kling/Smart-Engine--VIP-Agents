
import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileCheck, AlertTriangle, CheckCircle2, XCircle, Search, Filter, 
  Eye, Clock, ShieldAlert, FileText, ChevronRight, User, Calendar, X, Download, MessageSquare,
  Home, Loader2, Sparkles, RefreshCw, ChevronDown, ChevronUp, ShieldCheck, Mail, Phone, ExternalLink,
  Upload, ArrowRight, Send, BarChart3, Archive, Zap, Bot, Award, AlertCircle, LayoutList, PenTool, Database,
  Plus, Gavel, Settings2, Trash2, FileBox, Shield,
  ClipboardList, TrendingUp, UserX, BarChart, Activity
} from 'lucide-react';
import { n8nService } from '../../services/n8n';
import { airtableService } from '../../services/airtable';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, ComplianceReport, Deal, ContractTemplate, ComplianceRule, TaskMasterTemplate, TaskRole, ComplianceFlag } from '../../types';

interface ComplianceDoc {
  id: string;
  name: string;
  agent: string;
  deal: string;
  type: 'Contract' | 'Disclosure' | 'Addendum' | 'Proof of Funds';
  status: 'Pending' | 'Approved' | 'Rejected' | 'AI_Flagged' | 'Scanning';
  submittedDate: string;
  aiIssues?: string[];
  riskScore: number;
  clientEmail?: string;
}

interface AgentLicense {
  id: string;
  agentName: string;
  licenseNumber: string;
  type: 'Broker' | 'Salesperson' | 'Associate';
  status: 'Valid' | 'Expiring Soon' | 'Expired';
  expiryDate: string;
  ceCreditsEarned: number;
  ceCreditsRequired: number;
}

const ComplianceManager: React.FC = () => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'queue' | 'licenses' | 'monthly-reports' | 'master-view' | 'templates' | 'rules' | 'archives' | 'task-master' | 'fair-housing'>('queue');
  const [selectedDoc, setSelectedDoc] = useState<ComplianceDoc | null>(null);
  const [expandedProperties, setExpandedProperties] = useState<Record<string, boolean>>({});
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isArchiving, setIsArchiving] = useState<string | null>(null);
  const [fairHousingFlags, setFairHousingFlags] = useState<ComplianceFlag[]>([]);
  const [isLoadingFlags, setIsLoadingFlags] = useState(false);
  
  // Workflow 148 Admin: Task Master Library
  const [taskTemplates, setTaskTemplates] = useState<TaskMasterTemplate[]>([
    { id: 'tm1', taskName: 'Federal Lead-Based Paint Disclosure', role: 'Agent', phase: 'Inspection', triggerKeyword: '1978', daysAfterAccepted: 3 },
    { id: 'tm2', taskName: 'Schedule Septic Inspection', role: 'Agent', phase: 'Inspection', triggerKeyword: 'Septic', daysAfterAccepted: 5 },
    { id: 'tm3', taskName: 'Upload HOA Resale Certificate', role: 'Agent', phase: 'Inspection', triggerKeyword: 'HOA', daysAfterAccepted: 7 },
    { id: 'tm4', taskName: 'Schedule Professional Movers', role: 'Client', phase: 'Closing', daysAfterAccepted: 20 },
    { id: 'tm5', taskName: 'Verify Appraisal Received', role: 'TC', phase: 'Appraisal', daysAfterAccepted: 14 },
    { id: 'tm6', taskName: 'Confirm Homeowners Insurance', role: 'Client', phase: 'Financing', daysAfterAccepted: 10 },
  ]);

  // Workflow 137 Rule Builder State
  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>([
    { id: 'cr1', triggerKeyword: '1978', requiredDoc: 'Lead-Based Paint Disclosure', logicDesc: 'Year Built before 1978 requires Federal LBP disclosure.' },
    { id: 'cr2', triggerKeyword: 'Septic', requiredDoc: 'Septic Inspection Report', logicDesc: 'Properties with septic systems require specific inspection certs.' },
    { id: 'cr3', triggerKeyword: 'Condo', requiredDoc: 'Condo Association Docs', logicDesc: 'Condo sales require review of bylaws and financials.' },
    { id: 'cr4', triggerKeyword: 'Pool', requiredDoc: 'Pool Safety Addendum', logicDesc: 'Properties with pools require safety disclosure signage check.' },
  ]);

  const [contractTemplates, setContractTemplates] = useState<ContractTemplate[]>([
    { id: 'ct1', name: 'Texas Residential Purchase Agreement', type: 'Offer', lastMapped: '2d ago' },
    { id: 'ct2', name: 'Standard Addendum for Repairs', type: 'Addendum', lastMapped: '1w ago' },
    { id: 'ct3', name: 'Exclusive Right to Sell Agreement', type: 'Listing Agreement', lastMapped: '2mo ago' },
  ]);

  const [docs] = useState<ComplianceDoc[]>([
    { id: '1', name: 'Purchase Agreement', agent: 'Sarah Smith', deal: '123 Main St', type: 'Contract', status: 'AI_Flagged', submittedDate: 'Today, 2:00 PM', riskScore: 85, aiIssues: ['Missing signature on Page 8', 'Closing date is a Sunday'], clientEmail: 'buyer@gmail.com' },
    { id: '2', name: 'Seller Disclosure', agent: 'Mike Ross', deal: '456 Oak Ave', type: 'Disclosure', status: 'Pending', submittedDate: 'Today, 10:00 AM', riskScore: 0, clientEmail: 'seller@gmail.com' }
  ]);

  const [activeDeals] = useState<Deal[]>([
    { id: '1', address: '123 Main St', clientName: 'Alice Freeman', stage: 'Inspection', healthScore: 92, healthStatus: 'Healthy', price: 850000, nextTask: 'Appraisal', missingDocs: 0, winProbability: 95, tasksCompleted: 42, tasksTotal: 47 },
    { id: '2', address: '456 Oak Ave', clientName: 'Bob Driller', stage: 'Due Diligence', healthScore: 45, healthStatus: 'Critical', price: 420000, nextTask: 'Earnest Money', missingDocs: 1, winProbability: 75, tasksCompleted: 8, tasksTotal: 34 }
  ]);

  // Workflow 140: Closed Transactions for Archive
  const [closedDeals, setClosedDeals] = useState<Deal[]>([
    { id: 'arch1', address: '998 Maplewood Ln', clientName: 'Jessica Bloom', stage: 'Closed', price: 1250000, healthScore: 100, healthStatus: 'Healthy', winProbability: 100, nextTask: 'None', missingDocs: 0, auditStatus: 'Archived', auditPacketUrl: '#' },
    { id: 'arch2', address: '55 Canyon Creek', clientName: 'Derek Morgan', stage: 'Closed', price: 890000, healthScore: 98, healthStatus: 'Healthy', winProbability: 100, nextTask: 'None', missingDocs: 0, auditStatus: 'Open' }
  ]);

  const [reports] = useState<ComplianceReport[]>([
    { id: 'rep1', month: 'Nov 2024', totalFilesAudited: 450, criticalErrorsFound: 12, riskScore: 3, pdfUrl: '#', aiExecutiveSummary: 'Disclosure compliance has dropped by 15% in the Downtown office. Missing signatures remain the top friction point.' },
    { id: 'rep2', month: 'Oct 2024', totalFilesAudited: 380, criticalErrorsFound: 4, riskScore: 1, pdfUrl: '#', aiExecutiveSummary: 'Highest compliance month on record. Agent training on GHL forms is showing significant ROI.' }
  ]);

  const [licenses] = useState<AgentLicense[]>([
    { id: 'lic1', agentName: 'Sarah Smith', licenseNumber: 'TX-742910', type: 'Salesperson', status: 'Valid', expiryDate: '2025-10-15', ceCreditsEarned: 18, ceCreditsRequired: 18 },
    { id: 'lic2', agentName: 'Mike Ross', licenseNumber: 'TX-892113', type: 'Associate', status: 'Expiring Soon', expiryDate: '2024-12-01', ceCreditsEarned: 12, ceCreditsRequired: 18 },
    { id: 'lic3', agentName: 'Harvey Specter', licenseNumber: 'TX-112233', type: 'Broker', status: 'Valid', expiryDate: '2026-01-20', ceCreditsEarned: 24, ceCreditsRequired: 24 },
  ]);

  useEffect(() => {
    if (activeTab === 'fair-housing') {
        loadFairHousingFlags();
    }
  }, [activeTab]);

  const loadFairHousingFlags = async () => {
    setIsLoadingFlags(true);
    const data = await airtableService.getComplianceFlags();
    setFairHousingFlags(data);
    setIsLoadingFlags(false);
  };

  const toggleProperty = (property: string) => setExpandedProperties(prev => ({ ...prev, [property]: !prev[property] }));

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await n8nService.triggerWorkflow('generate-compliance-analysis', { brokerId: user?.id });
    setTimeout(() => {
        setIsRegenerating(false);
        alert("Monthly analysis triggered. The report will be ready in 5 minutes.");
    }, 1500);
  };

  const handleManualArchive = async (dealId: string) => {
    setIsArchiving(dealId);
    await n8nService.triggerAuditArchival(dealId);
    setTimeout(() => {
        setClosedDeals(prev => prev.map(d => d.id === dealId ? { ...d, auditStatus: 'Archived' as const, auditPacketUrl: '#' } : d));
        setIsArchiving(null);
        alert("Regulatory Compliance: Audit packet finalized. Communication shadow ledger appended and stored in Secure Google Drive Vault.");
    }, 2500);
  };

  const fairHousingStats = useMemo(() => {
    return {
        total: fairHousingFlags.length,
        highSeverity: fairHousingFlags.filter(f => f.severity === 'high').length,
        overridden: fairHousingFlags.filter(f => f.actionTaken === 'overridden').length,
    };
  }, [fairHousingFlags]);

  return (
    <div className="space-y-5 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">Compliance Command.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5">Brokerage Governance & AI Sentinel</p>
        </div>
        <div className="flex bg-white rounded-xl p-0.5 border border-slate-200 shadow-sm overflow-x-auto max-w-full scrollbar-hide">
            <button onClick={() => setActiveTab('queue')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'queue' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
                <FileCheck size={12} /> Audit Queue
            </button>
            <button onClick={() => setActiveTab('fair-housing')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'fair-housing' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
                <ShieldAlert size={12} className="text-red-500" /> Fair Housing Audit
            </button>
            <button onClick={() => setActiveTab('task-master')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'task-master' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
                <ClipboardList size={12} /> Task Master
            </button>
            <button onClick={() => setActiveTab('archives')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'archives' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
                <Archive size={12} /> Audit Vault
            </button>
            <button onClick={() => setActiveTab('rules')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'rules' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
                <Settings2 size={12} /> Auto-Logic
            </button>
            <button onClick={() => setActiveTab('monthly-reports')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'monthly-reports' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
                <BarChart3 size={12} /> Analysis
            </button>
            <button onClick={() => setActiveTab('licenses')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 transition-all ${activeTab === 'licenses' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}>
                <ShieldCheck size={12} /> Licenses
            </button>
        </div>
      </div>

      {/* --- FAIR HOUSING AUDIT TAB --- */}
      {activeTab === 'fair-housing' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-red-600 flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="absolute right-0 top-0 p-12 opacity-5 rotate-12"><ShieldAlert size={200}/></div>
                  <div className="relative z-10 max-w-xl">
                      <p className="text-red-400 text-sm font-black uppercase tracking-[0.3em] mb-4">E&O Risk Protection</p>
                      <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-4 leading-none">Fair Housing <br/> AI Guardian.</h2>
                      <p className="text-indigo-100 text-lg font-medium opacity-90 leading-relaxed mb-8">Monitoring every outbound comm and listing for potential discrimination. AI (Workflow 156) flags violations in real-time, enforcing brokerage-wide compliance standards.</p>
                      
                      <div className="flex gap-4">
                          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center min-w-[120px]">
                              <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">TOTAL FLAGS</p>
                              <p className="text-3xl font-black">{fairHousingStats.total}</p>
                          </div>
                          <div className="bg-red-500/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-red-500/30 text-center min-w-[120px]">
                              <p className="text-[9px] font-black text-red-300 uppercase tracking-widest mb-1">OVERRIDES</p>
                              <p className="text-3xl font-black text-red-400">{fairHousingStats.overridden}</p>
                          </div>
                          <div className="bg-emerald-500/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-emerald-500/30 text-center min-w-[120px]">
                              <p className="text-[9px] font-black text-emerald-300 uppercase tracking-widest mb-1">RISK SCORE</p>
                              <p className="text-3xl font-black text-emerald-400">LOW</p>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center px-10 gap-4">
                      <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                        <AlertTriangle size={18} className="text-red-500" /> Compliance Audit Trail
                      </h3>
                      <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-3.5 h-3.5" />
                            <input type="text" placeholder="FILTER BY AGENT OR ADDRESS..." className="w-full pl-10 pr-4 py-2 text-[10px] font-black uppercase border border-slate-200 rounded-xl focus:ring-1 focus:ring-red-500 outline-none shadow-inner" />
                        </div>
                        <button onClick={loadFairHousingFlags} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 transition-all shadow-sm">
                            <RefreshCw size={18} className={isLoadingFlags ? 'animate-spin' : ''} />
                        </button>
                      </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-8">Professional / Date</th>
                                <th className="p-8">Content Source</th>
                                <th className="p-8">Flagged Reason</th>
                                <th className="p-8">Audit Action</th>
                                <th className="p-8 text-right">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                            {fairHousingFlags.map(flag => (
                                <tr key={flag.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-8">
                                        <div className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">{flag.userId}</div>
                                        <div className="text-[9px] text-slate-400 uppercase font-black">{flag.createdAt}</div>
                                    </td>
                                    <td className="p-8">
                                        <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-slate-200">{flag.contentType.replace('_', ' ')}</span>
                                    </td>
                                    <td className="p-8 max-w-sm">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex flex-wrap gap-1">
                                                {flag.violationType.map(v => (
                                                    <span key={v} className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[8px] font-black uppercase border border-red-100">{v.replace('_', ' ')}</span>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-slate-600 italic leading-relaxed line-clamp-2">"{flag.originalText}"</p>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex flex-col gap-1">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border w-fit ${
                                                flag.actionTaken === 'corrected' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                flag.actionTaken === 'overridden' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                'bg-red-50 text-red-700 border-red-100'
                                            }`}>{flag.actionTaken}</span>
                                            {flag.overrideReason && <p className="text-[8px] text-amber-600 font-bold italic truncate max-w-[150px]">Reason: {flag.overrideReason}</p>}
                                        </div>
                                    </td>
                                    <td className="p-8 text-right">
                                        <button className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm">
                                            <Eye size={18}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {fairHousingFlags.length === 0 && !isLoadingFlags && (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center text-slate-300 italic font-black uppercase text-xs">No Fair Housing violations recorded in current ledger.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                  </div>
              </div>
          </div>
      )}

      {/* --- WORKFLOW 148: ADMIN VIEW A - TASK MASTER LIBRARY --- */}
      {activeTab === 'task-master' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><ClipboardList size={180}/></div>
                  <div className="relative z-10 max-w-2xl">
                      <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-4 leading-none">Task Master Library.</h3>
                      <p className="text-indigo-100 text-sm font-medium opacity-90 leading-relaxed mb-8">
                          Configure the global blueprint for automated transaction bundles. Workflow 148 will scan accepting contracts and inject these tasks dynamically based on identified keywords.
                      </p>
                      <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-50 active:scale-95 transition-all flex items-center gap-3">
                          <Plus size={18}/> Add Master Task
                      </button>
                  </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                  <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          <tr>
                              <th className="p-8">Task Name</th>
                              <th className="p-8">Owner Role</th>
                              <th className="p-8">Transaction Phase</th>
                              <th className="p-8">Trigger Logic</th>
                              <th className="p-8 text-right">Offset</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                          {taskTemplates.map(tpl => (
                              <tr key={tpl.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-8 font-black text-slate-900 uppercase tracking-tight italic">{tpl.taskName}</td>
                                  <td className="p-8">
                                      <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${
                                          tpl.role === 'Agent' ? 'bg-slate-900 text-white border-slate-900' :
                                          tpl.role === 'Client' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                          'bg-slate-50 text-slate-500 border-slate-200'
                                      }`}>
                                          {tpl.role}
                                      </span>
                                  </td>
                                  <td className="p-8 text-slate-500 uppercase tracking-widest">{tpl.phase}</td>
                                  <td className="p-8">
                                      {tpl.triggerKeyword ? (
                                          <div className="flex items-center gap-2">
                                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Keyword:</span>
                                              <span className="bg-indigo-600 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase shadow-sm italic">"{tpl.triggerKeyword}"</span>
                                          </div>
                                      ) : (
                                          <span className="text-slate-300 italic font-medium uppercase text-[8px]">Static Step</span>
                                      )}
                                  </td>
                                  <td className="p-8 text-right font-black text-indigo-600 tabular-nums">
                                      +{tpl.daysAfterAccepted}d
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* --- WORKFLOW 140: VIEW A - AUDIT VAULT --- */}
      {activeTab === 'archives' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Shield size={180}/></div>
                  <div className="relative z-10 max-w-2xl">
                      <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-4 leading-none">Regulatory Archives.</h3>
                      <p className="text-indigo-100 text-sm font-medium opacity-90 leading-relaxed mb-8">
                          Department of Real Estate compliant archives. Nexus AI automatically synthesizes chronological "Shadow Ledgers" for all closed deals, compiling every email, SMS, and executed document into a single immutable audit packet.
                      </p>
                  </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                      <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                        <FileBox size={18} className="text-indigo-600" /> Immutable Closed File Vault (Workflow 140)
                      </h3>
                      <div className="relative w-64">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3" />
                         <input type="text" placeholder="FILTER VAULT..." className="w-full pl-9 pr-4 py-2 text-[9px] font-black uppercase border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none" />
                      </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-8">Entity Address</th>
                                <th className="p-8">Settlement Data</th>
                                <th className="p-8">Audit Readiness</th>
                                <th className="p-8 text-right">Archive Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                            {closedDeals.map(deal => (
                                <tr key={deal.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-8">
                                        <div className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">{deal.address}</div>
                                        <div className="text-[8px] text-slate-400 uppercase font-black">Client: {deal.clientName}</div>
                                    </td>
                                    <td className="p-8">
                                        <div className="font-black text-slate-800">${(deal.price / 1000).toFixed(0)}k</div>
                                        <div className="text-[9px] text-slate-400 font-bold uppercase mt-1">Closed Oct 24</div>
                                    </td>
                                    <td className="p-8">
                                        {deal.auditStatus === 'Archived' ? (
                                            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[8px] font-black uppercase border border-emerald-100 shadow-sm flex items-center gap-1.5 w-fit">
                                                <CheckCircle2 size={10}/> Audit Ready
                                            </span>
                                        ) : (
                                            <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-[8px] font-black uppercase border border-red-100 flex items-center gap-1.5 w-fit">
                                                <AlertCircle size={10}/> Incomplete Trail
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-8 text-right">
                                        {deal.auditStatus === 'Archived' ? (
                                            <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2 ml-auto active:scale-95">
                                                <Download size={14}/> Download Pkg (.ZIP)
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleManualArchive(deal.id)}
                                                disabled={isArchiving === deal.id}
                                                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all flex items-center gap-2 ml-auto active:scale-95 disabled:opacity-50"
                                            >
                                                {isArchiving === deal.id ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>}
                                                Finalize Archive
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'rules' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><ShieldCheck size={180}/></div>
                  <div className="relative z-10 max-w-2xl">
                      <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-4 leading-none">Checklist Architect.</h3>
                      <p className="text-indigo-100 text-sm font-medium opacity-90 leading-relaxed mb-8">
                          Configure the triggers for Context-Aware Dynamic Checklists. Nexus AI scans transaction details to automatically inject required documents based on these rules.
                      </p>
                      <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-50 active:scale-95 transition-all flex items-center gap-3">
                          <Plus size={18}/> Define New Trigger
                      </button>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {complianceRules.map(rule => (
                      <div key={rule.id} className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm flex flex-col group hover:border-indigo-400 transition-all">
                          <div className="flex justify-between items-start mb-6">
                              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl shadow-sm group-hover:scale-110 transition-transform">
                                  <Gavel size={24}/>
                              </div>
                              <div className="flex gap-2">
                                  <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><PenTool size={16}/></button>
                                  <button className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                              </div>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Trigger Key:</span>
                              <span className="bg-indigo-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase italic shadow-sm tracking-widest">"{rule.triggerKeyword}"</span>
                          </div>
                          <h4 className="font-black text-xl text-slate-900 uppercase tracking-tight mb-4">{rule.requiredDoc}</h4>
                          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex-1">
                              <p className="text-[10px] text-slate-500 italic leading-relaxed">"{rule.logicDesc}"</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {activeTab === 'master-view' && (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden animate-fade-in-up">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                  <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                    <LayoutList size={18} className="text-indigo-600" /> Master Compliance Monitor (Workflow 106)
                  </h3>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          <tr>
                              <th className="p-6">Active Deal</th>
                              <th className="p-6">Progress %</th>
                              <th className="p-6">Critical Task Status</th>
                              <th className="p-6">Audit State</th>
                              <th className="p-6 text-right">Control</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                          {activeDeals.map(deal => {
                              const progress = Math.round((deal.tasksCompleted! / deal.tasksTotal!) * 100);
                              const isEarnestOverdue = deal.address.includes('Oak') && deal.nextTask.includes('Earnest');
                              return (
                                <tr key={deal.id} className={`hover:bg-slate-50 transition-colors ${isEarnestOverdue ? 'bg-red-50/40' : ''}`}>
                                    <td className="p-6">
                                        <div className="font-black text-slate-900 uppercase tracking-tight">{deal.address}</div>
                                        <div className="text-[8px] text-slate-400 font-bold uppercase mt-1">Client: {deal.clientName}</div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${progress}%` }} />
                                            </div>
                                            <span className="text-indigo-600">{progress}%</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`text-[9px] font-black uppercase ${isEarnestOverdue ? 'text-red-600 animate-pulse' : 'text-slate-600'}`}>
                                            {deal.nextTask} {isEarnestOverdue && ' (OVERDUE)'}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${
                                            deal.healthStatus === 'Healthy' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                                        }`}>
                                            {deal.healthStatus}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm">
                                            <ArrowRight size={16}/>
                                        </button>
                                    </td>
                                </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {activeTab === 'templates' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><PenTool size={180}/></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="max-w-xl">
                          <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Contract Automation.</h3>
                          <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                              Manage approved PDF templates for DocuSign automation. AI field-mapping ensures specific stipulated syntax is injected correctly into the legal slots.
                          </p>
                      </div>
                      <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-50 active:scale-95 transition-all flex items-center gap-3 shrink-0">
                          <Plus size={20}/>
                          New Master Template
                      </button>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contractTemplates.map(tpl => (
                      <div key={tpl.id} className="bg-white rounded-[2rem] border-2 border-slate-200 p-8 shadow-sm hover:border-indigo-400 transition-all flex flex-col group">
                          <div className="flex justify-between items-start mb-6">
                              <div className={`p-4 rounded-3xl ${
                                  tpl.type === 'Offer' ? 'bg-indigo-50 text-indigo-600' :
                                  tpl.type === 'Addendum' ? 'bg-emerald-50 text-emerald-600' :
                                  'bg-amber-50 text-amber-600'
                              } shadow-sm group-hover:scale-110 transition-transform`}>
                                  <FileText size={24}/>
                              </div>
                              <div className="text-right">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Mapped</p>
                                  <p className="text-sm font-black text-slate-800">{tpl.lastMapped}</p>
                              </div>
                          </div>
                          
                          <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight italic mb-2">{tpl.name}</h4>
                          <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mb-8">{tpl.type} Category</p>

                          <div className="mt-auto flex gap-3">
                              <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2">
                                  <Database size={14}/> Map Fields
                              </button>
                              <button className="p-3 border-2 border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"><ChevronRight size={18}/></button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {activeTab === 'monthly-reports' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><BarChart3 size={180}/></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="max-w-xl">
                          <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Aggregate Risk Analysis.</h3>
                          <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                              Monthly snapshots of brokerage-wide compliance health. AI audits historical data to identify systemic friction points in document completion and signature velocity.
                          </p>
                      </div>
                      <button 
                        onClick={handleRegenerate}
                        disabled={isRegenerating}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-50 active:scale-95 transition-all flex items-center gap-3 shrink-0"
                      >
                          {isRegenerating ? <Loader2 className="animate-spin" size={20}/> : <RefreshCw size={20}/>}
                          Regenerate Analysis
                      </button>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reports.map(report => (
                      <div key={report.id} className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:border-indigo-400 transition-all flex flex-col group">
                          <div className="flex justify-between items-start mb-6">
                              <div>
                                  <span className="bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-indigo-100">{report.month} Report</span>
                                  <h4 className="text-2xl font-black text-slate-900 italic tracking-tighter mt-2">Compliance Summary</h4>
                              </div>
                              <div className="text-right">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Score</p>
                                  <div className="text-3xl font-black text-indigo-600">{report.riskScore}/10</div>
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Files Audited</p>
                                  <p className="text-xl font-black text-slate-800">{report.totalFilesAudited}</p>
                              </div>
                              <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100">
                                  <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">Critical Errors</p>
                                  <p className="text-xl font-black text-red-700">{report.criticalErrorsFound}</p>
                              </div>
                          </div>

                          <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl mb-8 flex-1">
                              <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Bot size={12}/> AI Executive Summary</p>
                              <p className="text-[11px] text-indigo-900 italic font-medium leading-relaxed">"{report.aiExecutiveSummary}"</p>
                          </div>

                          <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2">
                              <Download size={14}/> Download Audit Pack (PDF)
                          </button>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {activeTab === 'licenses' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                      <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                        <ShieldCheck size={18} className="text-indigo-600" /> Professional Credentials Roster
                      </h3>
                      <button className="bg-white border border-slate-200 p-2 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"><Filter size={18}/></button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-8">Agent Professional</th>
                                <th className="p-8">License Detail</th>
                                <th className="p-8">Status</th>
                                <th className="p-8">CE Credits Progress</th>
                                <th className="p-8 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                            {licenses.map(lic => (
                                <tr key={lic.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black italic">{lic.agentName[0]}</div>
                                            <div>
                                                <div className="font-black text-slate-900 uppercase tracking-tight">{lic.agentName}</div>
                                                <div className="text-[8px] text-slate-400 font-bold uppercase mt-1">{lic.type}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="font-mono text-slate-600">{lic.licenseNumber}</div>
                                        <div className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest">Expires: {lic.expiryDate}</div>
                                    </td>
                                    <td className="p-8">
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border ${
                                            lic.status === 'Valid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            lic.status === 'Expiring Soon' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                            'bg-red-50 text-red-700 border-red-100'
                                        }`}>
                                            {lic.status}
                                        </span>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(lic.ceCreditsEarned / lic.ceCreditsRequired) * 100}%` }} />
                                            </div>
                                            <span className="text-slate-400">{lic.ceCreditsEarned}/{lic.ceCreditsRequired}</span>
                                        </div>
                                    </td>
                                    <td className="p-8 text-right">
                                        <button className="text-indigo-600 hover:underline uppercase text-[9px] font-black tracking-widest">Update Data</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'queue' && (
        <div className="space-y-4">
            {Object.entries(docs.reduce((acc, d) => ({...acc, [d.deal]: [...(acc[d.deal]||[]), d]}), {} as any)).map(([prop, pDocs]: any) => (
                <div key={prop} className="bg-white rounded-[1.5rem] border border-slate-200 shadow-md overflow-hidden">
                    <div className="bg-slate-900 p-4 flex justify-between items-center cursor-pointer" onClick={() => toggleProperty(prop)}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white border border-white/10"><Home size={20} /></div>
                            <div>
                                <h3 className="font-black text-base text-white tracking-tight uppercase italic">{prop}</h3>
                                <p className="text-[8px] text-indigo-400 font-black uppercase tracking-widest">{pDocs[0].agent}</p>
                            </div>
                        </div>
                        {expandedProperties[prop] === false ? <ChevronDown className="text-slate-600" /> : <ChevronUp className="text-slate-600" />}
                    </div>
                    {expandedProperties[prop] !== false && (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                <tr><th className="p-4">Document</th><th className="p-4">Type</th><th className="p-4">Audit Status</th><th className="p-4 text-right">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                                {pDocs.map((doc: any) => (
                                    <tr key={doc.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedDoc(doc)}>
                                        <td className="p-4 text-slate-900 uppercase tracking-tight truncate max-w-[200px]">{doc.name}</td>
                                        <td className="p-4"><span className="text-[8px] bg-slate-100 px-2 py-0.5 rounded font-black">{doc.type}</span></td>
                                        <td className="p-4">
                                            <span className={`flex items-center gap-1.5 uppercase text-[8px] font-black ${doc.status === 'AI_Flagged' ? 'text-red-600' : 'text-slate-400'}`}>
                                                {doc.status === 'AI_Flagged' ? <AlertTriangle size={10}/> : <Clock size={10}/>} {doc.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right"><ChevronRight size={14} className="text-slate-300 ml-auto" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ))}
        </div>
      )}

      {selectedDoc && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-6">
              <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden animate-scale-in flex flex-col">
                  <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center font-black text-2xl border border-white/10 shadow-xl"><FileText size={28}/></div>
                          <div>
                              <h3 className="text-2xl font-black uppercase tracking-tight italic">{selectedDoc.name}</h3>
                              <p className="text-indigo-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                  {selectedDoc.deal} • {selectedDoc.agent}
                              </p>
                          </div>
                      </div>
                      <button onClick={() => setSelectedDoc(null)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X size={24} /></button>
                  </div>
                  
                  <div className="p-10 space-y-8">
                      <div className="bg-red-50 border-2 border-red-100 p-6 rounded-3xl">
                          <h4 className="text-red-800 font-black uppercase text-xs mb-4 flex items-center gap-2"><AlertTriangle size={16}/> AI Compliance Flags</h4>
                          <ul className="space-y-3">
                              {selectedDoc.aiIssues?.map((issue, i) => (
                                  <li key={i} className="flex items-start gap-3 text-red-700 text-sm font-bold italic">
                                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                      {issue}
                                  </li>
                              ))}
                          </ul>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <button className="bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all">Send to Agent for Correction</button>
                          <button className="bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all">Manual Approval</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ComplianceManager;
