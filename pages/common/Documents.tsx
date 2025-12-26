
import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Upload, Filter, Search, MoreVertical, 
  Download, Eye, CheckCircle2, Clock, AlertCircle, File,
  Bot, ShieldCheck, Loader2, RefreshCw, X, ArrowRight,
  Gavel, CheckSquare, Zap, ShieldAlert, BadgeCheck, Sparkles,
  FolderOpen, Folder, ChevronDown, ChevronRight, Share2, SearchCode,
  FileDown, Lock
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { n8nService } from '../../services/n8n';
import { airtableService } from '../../services/airtable';
import { Deal, TransactionDocument, UserRole, DocumentRegistryEntry, DocType, PrivacyLevel } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleGenAI } from "@google/genai";

const Documents: React.FC = () => {
  const { role, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'All' | DocType | 'ApprovalQueue' | 'AuditTree'>('All');
  const [isUploading, setIsUploading] = useState(false);
  const [isFiling, setIsFiling] = useState<string | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [semanticResults, setSemanticResults] = useState<string | null>(null);

  const isAdmin = role === UserRole.ADMIN || role === UserRole.BROKER;
  const isAgent = role === UserRole.AGENT;
  const isClient = role === UserRole.BUYER || role === UserRole.SELLER;

  // Workflow 149: Registry State
  const [registry, setRegistry] = useState<DocumentRegistryEntry[]>([
      { id: 'reg1', dealId: 'd1', fileNameCanonical: '2024-10-24_Contract_123Main.pdf', driveLink: '#', docType: 'Contract', privacyLevel: 'Client-Shared', size: '2.4 MB', timestamp: 'Oct 24' },
      { id: 'reg2', dealId: 'd1', fileNameCanonical: '2024-10-28_Inspection_123Main.pdf', driveLink: '#', docType: 'Inspection', privacyLevel: 'Internal', size: '14.5 MB', timestamp: 'Oct 28' },
      { id: 'reg3', dealId: 'd2', fileNameCanonical: '2024-10-22_Disclosure_456Oak.pdf', driveLink: '#', docType: 'Disclosure', privacyLevel: 'Client-Shared', size: '1.1 MB', timestamp: 'Oct 22' },
  ]);

  useEffect(() => {
    const loadDeals = async () => {
      const activeDeals = await airtableService.getTransactions();
      if (activeDeals) setDeals(activeDeals);
    };
    loadDeals();
    if (isAdmin) setActiveTab('AuditTree');
  }, [isAdmin]);

  // Workflow 149 Node 1 & 2 Simulation: Rename & File
  const handleAutoFile = async (file: File) => {
    setIsUploading(true);
    const mockDeal = deals[0]; // Logic would extract this via Gemini
    
    // Trigger N8N
    await n8nService.autoFileDocument(file, mockDeal.id, user?.email);

    setTimeout(() => {
        const canonicalName = `${new Date().toISOString().split('T')[0]}_NewDoc_${mockDeal.address.split(',')[0]}.pdf`;
        const newEntry: DocumentRegistryEntry = {
            id: Date.now().toString(),
            dealId: mockDeal.id,
            fileNameCanonical: canonicalName,
            driveLink: 'https://drive.google.com/nexus/123main/contract',
            docType: 'Contract',
            privacyLevel: 'Internal',
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            timestamp: 'Just Now'
        };
        setRegistry([newEntry, ...registry]);
        setIsUploading(false);
        alert(`AI Filing Clerk: Classified as "Contract". Renamed to "${canonicalName}" and routed to Google Drive folder: ${mockDeal.address} > 01_Contracts.`);
    }, 2000);
  };

  // Workflow 149 View B: Semantic Search
  const handleSemanticSearch = async () => {
      if (!searchQuery.trim() || !process.env.API_KEY) return;
      setIsSearchingAI(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const prompt = `Act as an AI Filing Clerk. The user is searching for: "${searchQuery}". 
          Available Files: ${registry.map(r => r.fileNameCanonical).join(', ')}.
          Which file matches the intent best? Return a one sentence friendly explanation.`;
          
          const result = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: prompt
          });
          setSemanticResults(result.text || null);
      } catch (e) {
          console.error(e);
      } finally {
          setIsSearchingAI(false);
      }
  };

  const filteredRegistry = useMemo(() => {
      let base = registry;
      if (isClient) base = base.filter(r => r.privacyLevel === 'Client-Shared');
      if (activeTab === 'All' || activeTab === 'ApprovalQueue' || activeTab === 'AuditTree') return base;
      return base.filter(r => r.docType === activeTab);
  }, [registry, activeTab, isClient]);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Nexus Storage.</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Workflow 149: Google Drive AI-Filing active</p>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="bg-white border border-slate-200 rounded-xl p-0.5 flex overflow-x-auto scrollbar-hide max-w-[500px] shadow-sm">
             {isAdmin && (
               <button onClick={() => setActiveTab('AuditTree')} className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'AuditTree' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                 <FolderOpen size={12} /> Audit Browser
               </button>
             )}
             {['All', 'Contract', 'Disclosure', 'Inspection', 'Closing'].map(tab => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab as any)}
                 className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${
                   activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                 }`}
               >
                 {tab}
               </button>
             ))}
           </div>
           
           {(isAgent || isClient) && (
             <label className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-black flex items-center gap-2 cursor-pointer transition-all active:scale-95 border-b-4 border-indigo-600">
                <Upload size={14} /> {isAgent ? 'Clerk Upload' : 'Upload to Agent'}
                <input type="file" className="hidden" onChange={(e) => e.target.files && handleAutoFile(e.target.files[0])} />
             </label>
           )}
        </div>
      </div>

      {/* --- VIEW B: AGENT SEMANTIC SEARCH --- */}
      {isAgent && (
          <div className="bg-white rounded-[2rem] border-2 border-indigo-100 p-8 shadow-xl animate-fade-in relative overflow-hidden group">
              <div className="absolute right-[-20px] top-[-20px] p-4 opacity-5 text-indigo-900 group-hover:rotate-12 transition-transform duration-1000"><Bot size={200}/></div>
              <div className="relative z-10">
                  <h3 className="font-black text-xs uppercase tracking-[0.3em] text-indigo-600 mb-6 flex items-center gap-2"><Sparkles size={16}/> AI Semantic File Search</h3>
                  <div className="flex gap-4">
                      <div className="flex-1 relative">
                          <SearchCode size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" />
                          <input 
                            type="text" 
                            placeholder='Try "Find the termite report" or "Closing Docs from last year"...'
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-indigo-50 rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSemanticSearch()}
                          />
                      </div>
                      <button 
                        onClick={handleSemanticSearch}
                        disabled={isSearchingAI}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all"
                      >
                          {isSearchingAI ? <Loader2 className="animate-spin" size={20}/> : 'Query Engine'}
                      </button>
                  </div>
                  {semanticResults && (
                      <div className="mt-6 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl animate-fade-in flex items-start gap-4">
                          <Bot size={24} className="text-indigo-600 shrink-0"/>
                          <p className="text-sm font-bold text-indigo-900 leading-relaxed italic">"{semanticResults}"</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* --- VIEW A: ADMIN AUDIT BROWSER (TREE STRUCTURE) --- */}
      {isAdmin && activeTab === 'AuditTree' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
              <div className="lg:col-span-4 bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 h-fit">
                  <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] mb-8">Drive Hierarchy Browser</h3>
                  <div className="space-y-6">
                      {deals.map(deal => (
                          <div key={deal.id} className="space-y-3">
                              <div className="flex items-center gap-3 group cursor-pointer">
                                  <ChevronDown size={16} className="text-slate-400 group-hover:text-indigo-600" />
                                  <Folder size={20} className="text-indigo-500" />
                                  <span className="font-black text-[11px] uppercase tracking-tight text-slate-800 group-hover:text-indigo-600 transition-colors">{deal.address.split(',')[0]}</span>
                                  {deal.missingDocs > 0 && <span className="bg-red-50 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded border border-red-100">Empty Folders</span>}
                              </div>
                              <div className="ml-8 space-y-2 border-l border-slate-100 pl-4 py-1">
                                  {['01_Contracts', '02_Disclosures', '03_Inspections', '04_Closing'].map(f => (
                                      <div key={f} className="flex items-center gap-2 group cursor-pointer">
                                          <Folder size={14} className="text-slate-300 group-hover:text-indigo-400" />
                                          <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-800">{f}</span>
                                          {f.includes('Inspections') && <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse ml-auto" />}
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="lg:col-span-8 bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><ShieldAlert size={180}/></div>
                  <div className="relative z-10">
                      <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-6 leading-none">Drive Integrity Audit.</h3>
                      <div className="grid grid-cols-2 gap-6 mb-10">
                          <div className="p-6 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-md">
                              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">AUDIT-READY FILES</p>
                              <p className="text-3xl font-black">142</p>
                          </div>
                          <div className="p-6 bg-red-500/20 rounded-3xl border border-red-500/30 backdrop-blur-md">
                              <p className="text-[10px] font-black text-red-300 uppercase tracking-widest mb-1">ORPHANED FOLDERS</p>
                              <p className="text-3xl font-black">2</p>
                          </div>
                      </div>
                      <button className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                          <RefreshCw size={18}/> Re-Index Storage Engine
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- MAIN REGISTRY TABLE (SHARED VIEW) --- */}
      {activeTab !== 'AuditTree' && (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden animate-fade-in">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-indigo-600" />
                    <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em]">Canonical Registry</h3>
                  </div>
                  {isClient && (
                      <button className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 active:scale-95 transition-all">
                          <FileDown size={14}/> Download All (ZIP)
                      </button>
                  )}
              </div>
              
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          <tr>
                              <th className="p-8">Canonical Filename</th>
                              <th className="p-8">File Class</th>
                              <th className="p-8">Access Level</th>
                              <th className="p-8 text-right">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                          {filteredRegistry.map(reg => (
                              <tr key={reg.id} className="hover:bg-slate-50 transition-colors group">
                                  <td className="p-8">
                                      <div className="flex items-center gap-5">
                                          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                                              <File size={24} />
                                          </div>
                                          <div>
                                              <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">{reg.fileNameCanonical}</h4>
                                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{reg.timestamp} • {reg.size}</p>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="p-8">
                                      <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-indigo-100">{reg.docType}</span>
                                  </td>
                                  <td className="p-8">
                                      <div className="flex items-center gap-2">
                                          {reg.privacyLevel === 'Client-Shared' ? <Share2 size={12} className="text-emerald-500"/> : <Lock size={12} className="text-slate-300"/>}
                                          <span className={`text-[9px] font-black uppercase tracking-widest ${reg.privacyLevel === 'Client-Shared' ? 'text-emerald-700' : 'text-slate-400'}`}>{reg.privacyLevel}</span>
                                      </div>
                                  </td>
                                  <td className="p-8 text-right">
                                      <div className="flex justify-end gap-2">
                                          <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm">
                                              <Download size={16}/>
                                          </button>
                                          <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm">
                                              <MoreVertical size={16}/>
                                          </button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                          {filteredRegistry.length === 0 && (
                              <tr>
                                  <td colSpan={4} className="p-20 text-center text-slate-300 italic font-black uppercase text-xs">No entries found for this category.</td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* Upload Progress Overlay */}
      {isUploading && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1000] flex items-center justify-center">
              <div className="bg-white rounded-[3rem] p-12 text-center space-y-8 shadow-2xl max-w-sm w-full animate-scale-in">
                  <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-indigo-600 shadow-inner">
                      <RefreshCw size={40} className="animate-spin" />
                  </div>
                  <div>
                      <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">AI Filing Clerk.</h3>
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-2">Classifying & Syncing to Drive...</p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Documents;
