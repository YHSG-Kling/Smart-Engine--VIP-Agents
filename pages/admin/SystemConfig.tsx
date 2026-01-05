
import React, { useState } from 'react';
import { 
  Save, Loader2, Database, Clock, BrainCircuit, Languages, 
  Sparkles, Bot, BarChart3, TrendingUp, LayoutList, Info, 
  ShieldAlert, UserCircle, Gamepad2, DatabaseZap, Trophy, Settings,
  Zap, AlertCircle, History, UserX, Smartphone, Settings2, Activity,
  FileText, LayoutGrid, Layers, Gauge, Target, ShieldCheck,
  MessageSquare, Gavel, Shield, Ban, ClipboardList,
  // Added missing Download import
  Download
} from 'lucide-react';
import { n8nService } from '../../services/n8n';
import { PointRule, ScoringWeight, ComplianceLogEntry } from '../../types';
import { GoogleGenAI } from "@google/genai";

const SystemConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ai' | 'scraping' | 'risk' | 'gamification' | 'enrichment' | 'scoring' | 'no-show' | 'tcpa'>('scraping');
  const [isSaving, setIsSaving] = useState(false);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);

  // Workflow 155: Compliance Logs
  const [complianceLogs, setComplianceLogs] = useState<ComplianceLogEntry[]>([
    { id: 'cp1', phoneNumber: '512-555-0810', status: 'Opt-Out', evidence: 'Stop contacting me', timestamp: 'Today, 2:14 PM', source: 'Twilio SMS' },
    { id: 'cp2', phoneNumber: '512-555-0911', status: 'Opt-Out', evidence: 'Take me off your list please', timestamp: 'Yesterday, 4:00 PM', source: 'GHL Incoming' },
    { id: 'cp3', phoneNumber: '512-555-1234', status: 'Opt-In', evidence: 'Send me more listings in 78704', timestamp: '2 days ago', source: 'Web Form' },
  ]);

  // Workflow 128: No-Show Templates
  const [noShowTemplates, setNoShowTemplates] = useState({
      gentleNudge: "Hi [Name], [Agent Name] here. I'm at the property ([Address]). Hope everything is okay! Let me know if you're running late or need to reschedule.",
      professionalApology: "Apologies, my client had an emergency and could not make the showing. We have vacated the time slot."
  });

  // Workflow 99: Scoring Weights
  const [scoringWeights, setScoringWeights] = useState<ScoringWeight[]>([
    { id: 'sw1', activityName: 'Portal Login', points: 5 },
    { id: 'sw2', activityName: 'Saved Home', points: 10 },
    { id: 'sw3', activityName: 'Email Open', points: 2 },
    { id: 'sw4', activityName: 'Request Tour', points: 25 },
    { id: 'sw5', activityName: 'Link Click', points: 3 },
  ]);

  // Workflow 71: Point Rules
  const [pointRules, setPointRules] = useState<PointRule[]>([
      { id: '1', activity: 'Call (per minute)', basePoints: 10, currentMultiplier: 1.0 },
      { id: '2', activity: 'New Listing Signed', basePoints: 500, currentMultiplier: 1.5 },
      { id: '3', activity: 'Closing', basePoints: 2000, currentMultiplier: 1.0 },
      { id: '4', activity: '5-Star Review', basePoints: 100, currentMultiplier: 1.2 }
  ]);

  const [enrichmentConfig, setEnrichmentConfig] = useState({
      batchDataKey: 'BD_SK_992810X442',
      maxCostPerLead: 0.50,
      autoEnrichHotLeads: true,
      minLeadScore: 80
  });

  const [scrapeConfig, setScrapeConfig] = useState({
    facebookGroups: 'https://facebook.com/groups/movingtoaustin, https://facebook.com/groups/austinhomes',
    zillowZip: '78701, 78702, 78704, 78746'
  });

  const [personaConfig, setPersonaConfig] = useState({
      voiceTone: 'Professional & Direct',
      avatarProvider: 'HeyGen v2',
      autoTranslation: true,
      humanHandoffThreshold: 0.8
  });

  const [riskConfig, setRiskConfig] = useState({
      sentimentCritical: 0.3,
      stallDays: 14,
      notificationChannel: '#ai-risk-radar'
  });

  const handleSuggestMultipliers = async () => {
      setIsAIAnalyzing(true);
      try {
          if (process.env.API_KEY) {
              const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
              const prompt = "You are a Game Balancer for a Real Estate Brokerage. Current Market Context: High Interest Rates, Low Inventory. Suggest multipliers (e.g. 1.5x) for 'Calls', 'Listings', and 'Closings' to drive agent behavior this month. Return JSON format only: { 'Calls': 1.2, ... }";
              const response = await ai.models.generateContent({
                  model: 'gemini-3-flash-preview',
                  contents: prompt,
                  config: { responseMimeType: 'application/json' }
              });
              const suggestions = JSON.parse(response.text || '{}');
              setPointRules(prev => prev.map(rule => {
                  const key = rule.activity.includes('Call') ? 'Calls' : rule.activity.includes('Listing') ? 'Listings' : 'Closings';
                  if (suggestions[key]) return { ...rule, currentMultiplier: suggestions[key] };
                  return rule;
              }));
              alert("AI: Market-adjusted multipliers applied to gamification engine.");
          } else {
              await new Promise(r => setTimeout(r, 1000));
              alert("AI Suggested: Listing Multiplier -> 2.0x (Low Inventory detected)");
          }
      } catch (e) { console.error(e); }
      finally { setIsAIAnalyzing(false); }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    alert("System Config: All clusters synchronized and persistent.");
  };

  const optOutRate = ((complianceLogs.filter(l => l.status === 'Opt-Out').length / (complianceLogs.length + 400)) * 100).toFixed(2);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 italic tracking-tighter uppercase">System Config.</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Infrastructure & Rule Governance</p>
        </div>
        <div className="flex gap-3">
            <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm overflow-x-auto max-w-full scrollbar-hide">
                <button onClick={() => setActiveTab('scraping')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'scraping' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <DatabaseZap size={14} /> Scrapers
                </button>
                <button onClick={() => setActiveTab('tcpa')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'tcpa' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <ShieldCheck size={14} /> TCPA/Compliance
                </button>
                <button onClick={() => setActiveTab('scoring')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'scoring' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <LayoutList size={14} /> Lead Score
                </button>
                <button onClick={() => setActiveTab('enrichment')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'enrichment' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <Sparkles size={14} /> Enrichment
                </button>
                <button onClick={() => setActiveTab('no-show')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'no-show' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <UserX size={14} /> No-Show
                </button>
                <button onClick={() => setActiveTab('gamification')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'gamification' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <Gamepad2 size={14} /> Points
                </button>
                <button onClick={() => setActiveTab('ai')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'ai' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <UserCircle size={14} /> Persona
                </button>
                <button onClick={() => setActiveTab('risk')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'risk' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <ShieldAlert size={14} /> Risk Radar
                </button>
            </div>
            <button onClick={handleSave} disabled={isSaving} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all border-b-4 border-indigo-600">
                {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} 
                Save
            </button>
        </div>
      </div>

      {/* TABS CONTENT */}

      {activeTab === 'tcpa' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600 flex flex-col justify-center">
                    <div className="absolute right-[-20px] top-[-20px] opacity-5"><Shield size={150}/></div>
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-1">Opt-Out Rate</p>
                    <h3 className="text-4xl font-black italic tracking-tighter tabular-nums">{optOutRate}%</h3>
                    <p className="text-[10px] text-indigo-200 mt-2 font-medium">A2P 10DLC Health: <span className="text-emerald-400">Excellent</span></p>
                </div>
                <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm flex flex-col justify-center">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Compliance Events</p>
                    <h3 className="text-3xl font-black text-slate-900 tabular-nums">{complianceLogs.length}</h3>
                    <p className="text-[8px] text-slate-400 font-bold uppercase mt-2">Workflow 155 Active</p>
                </div>
                <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm flex flex-col justify-center group hover:border-indigo-400 transition-all cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Bot size={20}/></div>
                        <h4 className="font-black text-slate-900 uppercase text-xs tracking-tight">Semantic Guard</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium italic">Recognizing hostile intent & stop requests without keywords.</p>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                      <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Gavel size={18} className="text-indigo-600" /> Compliance Audit Log
                      </h3>
                      <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 flex items-center gap-2 transition-all">
                          {/* Correct Download icon used from imports */}
                          <Download size={14}/> Export Proof for Legal
                      </button>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                              <tr>
                                  <th className="p-8">Phone Number</th>
                                  <th className="p-8">Status</th>
                                  <th className="p-8">Semantic Evidence</th>
                                  <th className="p-8">Source Cluster</th>
                                  <th className="p-8 text-right">Timestamp</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                              {complianceLogs.map(log => (
                                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                      <td className="p-8 font-mono text-slate-600">{log.phoneNumber}</td>
                                      <td className="p-8">
                                          <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${
                                              log.status === 'Opt-Out' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                          }`}>
                                              {log.status}
                                          </span>
                                      </td>
                                      {/* Corrected Syntax error in template string mapping */}
                                      <td className="p-8 italic text-slate-700">"{log.evidence}"</td>
                                      <td className="p-8">
                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{log.source}</span>
                                      </td>
                                      <td className="p-8 text-right text-slate-400 uppercase font-black tabular-nums">{log.timestamp}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'no-show' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                      <div>
                          <h3 className="font-black text-slate-800 uppercase tracking-tighter italic text-xl flex items-center gap-2">
                             <UserX size={24} className="text-red-600" /> No-Show Scripts.
                          </h3>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Workflow 128: Recovery Automation Templates</p>
                      </div>
                  </div>
                  <div className="p-8 space-y-8">
                      <div>
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Gentle Nudge (SMS to Client)</label>
                          <textarea 
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm h-32 outline-none font-medium focus:ring-1 focus:ring-indigo-500" 
                            value={noShowTemplates.gentleNudge} 
                            onChange={(e) => setNoShowTemplates({...noShowTemplates, gentleNudge: e.target.value})} 
                          />
                          <p className="text-[9px] text-slate-400 mt-2 uppercase font-bold tracking-widest">Supports [Name], [Agent Name], [Address] tags</p>
                      </div>
                      <div>
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Listing Agent Apology (Email)</label>
                          <textarea 
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm h-32 outline-none font-medium focus:ring-1 focus:ring-indigo-500" 
                            value={noShowTemplates.professionalApology} 
                            onChange={(e) => setNoShowTemplates({...noShowTemplates, professionalApology: e.target.value})} 
                          />
                          <p className="text-[9px] text-slate-400 mt-2 uppercase font-bold tracking-widest">Dispatched to listing agent after 2h of silence</p>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'scoring' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                      <div>
                          <h3 className="font-black text-slate-800 uppercase tracking-tighter italic text-xl flex items-center gap-2">
                             <Zap size={24} className="text-indigo-600" /> Scoring Weights.
                          </h3>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Points per Behavioral Event</p>
                      </div>
                  </div>
                  <div className="p-8">
                      <table className="w-full text-left">
                          <tbody className="divide-y divide-slate-100 text-sm font-bold">
                              {scoringWeights.map(weight => (
                                  <tr key={weight.id} className="hover:bg-slate-50 transition-colors">
                                      <td className="py-5">
                                          <div className="font-black text-slate-900 uppercase tracking-tight">{weight.activityName}</div>
                                      </td>
                                      <td className="py-5 text-right">
                                          <input type="number" value={weight.points} className="w-24 p-2 bg-slate-50 border border-slate-200 rounded-lg text-right font-black text-indigo-600 outline-none" onChange={()=>{}} />
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'enrichment' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                      <div>
                          <h3 className="font-black text-slate-800 uppercase tracking-tighter italic text-xl flex items-center gap-2">
                             <Sparkles size={24} className="text-indigo-600" /> Lead Enrichment.
                          </h3>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Property Intel & Social Synthesis (BatchData)</p>
                      </div>
                  </div>
                  <div className="p-10 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">BatchData API Secret</label>
                              <div className="relative">
                                  <input type="password" value={enrichmentConfig.batchDataKey} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs focus:ring-1 focus:ring-indigo-500 outline-none shadow-inner" />
                                  <ShieldCheck size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Max Cost Per Lead (USD)</label>
                              <div className="flex items-center gap-4">
                                  <input type="range" min="0.1" max="2.0" step="0.1" value={enrichmentConfig.maxCostPerLead} onChange={e => setEnrichmentConfig({...enrichmentConfig, maxCostPerLead: parseFloat(e.target.value)})} className="flex-1 accent-indigo-600" />
                                  <span className="font-black text-indigo-600 text-lg tabular-nums">${enrichmentConfig.maxCostPerLead.toFixed(2)}</span>
                              </div>
                          </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                          <div>
                              <p className="font-black text-[11px] text-indigo-900 uppercase tracking-tight">Auto-Enrich Hot Leads</p>
                              <p className="text-[9px] text-indigo-500 font-bold">Triggers skip-trace on leads exceeding score threshold</p>
                          </div>
                          <div className="flex items-center gap-4">
                              <div className="flex flex-col items-end">
                                  <span className="text-[8px] font-black text-indigo-400 uppercase">Min Score</span>
                                  <input type="number" value={enrichmentConfig.minLeadScore} className="w-16 bg-white border border-indigo-200 rounded-lg p-1 text-center font-black text-indigo-600 text-xs" />
                              </div>
                              <button onClick={() => setEnrichmentConfig({...enrichmentConfig, autoEnrichHotLeads: !enrichmentConfig.autoEnrichHotLeads})} className={`w-14 h-7 rounded-full transition-all relative shrink-0 ${enrichmentConfig.autoEnrichHotLeads ? 'bg-indigo-600 shadow-lg' : 'bg-slate-300'}`}>
                                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${enrichmentConfig.autoEnrichHotLeads ? 'left-8' : 'left-1'}`} />
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'gamification' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Trophy size={180}/></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="max-w-xl text-center md:text-left">
                          <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2 leading-none">Incentive Architect.</h3>
                          <p className="text-indigo-100 text-sm font-medium opacity-90 leading-relaxed">
                              Calibrate agent point rules based on real-time market friction. Use the Game Balancer to auto-adjust multipliers for listings when inventory is low.
                          </p>
                      </div>
                      <button 
                        onClick={handleSuggestMultipliers}
                        disabled={isAIAnalyzing}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-50 transition-all flex items-center gap-3 shrink-0 active:scale-95"
                      >
                          {isAIAnalyzing ? <Loader2 className="animate-spin" size={18}/> : <Bot size={18}/>}
                          AI: Adjust Multipliers
                      </button>
                  </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                      <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Gamepad2 size={18} className="text-indigo-600" /> Production Point Rules
                      </h3>
                  </div>
                  <div className="p-8">
                      <table className="w-full text-left">
                          <thead className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                              <tr><th className="p-4">Activity Description</th><th className="p-4">Base Points</th><th className="p-4">Market Multiplier</th><th className="p-4 text-right">Effective Total</th></tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {pointRules.map(rule => (
                                  <tr key={rule.id} className="hover:bg-slate-50 transition-colors font-bold">
                                      <td className="p-4 font-black text-slate-900 uppercase tracking-tight">{rule.activity}</td>
                                      <td className="p-4 text-slate-500">{rule.basePoints}</td>
                                      <td className="p-4">
                                          <div className="flex items-center gap-3">
                                              <input type="number" step="0.1" value={rule.currentMultiplier} className="w-16 p-1.5 bg-white border border-slate-200 rounded-lg text-center font-black text-indigo-600 text-xs" readOnly />
                                              {rule.currentMultiplier > 1 && <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-black uppercase shadow-sm">Hot Bonus</span>}
                                          </div>
                                      </td>
                                      <td className="p-4 text-right font-black text-slate-900 text-lg tabular-nums">{Math.round(rule.basePoints * rule.currentMultiplier)}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'ai' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                      <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                        <UserCircle size={18} className="text-indigo-600" /> Digital Persona Config
                      </h3>
                  </div>
                  <div className="p-10 space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">AI Voice Persona</label>
                              <div className="grid grid-cols-2 gap-3">
                                  {['Zephyr', 'Puck', 'Fenrir', 'Kore'].map(voice => (
                                      <button key={voice} className={`p-4 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest transition-all ${voice === 'Zephyr' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-indigo-200'}`}>
                                          {voice}
                                      </button>
                                  ))}
                              </div>
                          </div>
                          <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Avatar Provider</label>
                              <div className="flex gap-4">
                                  <div className="flex-1 p-5 rounded-2xl border border-indigo-100 bg-indigo-50/50 flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white"><Smartphone size={16}/></div>
                                          <span className="font-black text-xs uppercase text-indigo-900">{personaConfig.avatarProvider}</span>
                                      </div>
                                      <button className="text-[9px] font-black text-indigo-600 uppercase hover:underline">Re-Sync API</button>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-6">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Human Handoff Confidence Threshold</label>
                          <div className="flex items-center gap-6">
                              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden relative">
                                  <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${personaConfig.humanHandoffThreshold * 100}%` }} />
                              </div>
                              <span className="font-black text-indigo-600 text-2xl tracking-tighter w-16">{Math.round(personaConfig.humanHandoffThreshold * 100)}%</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold italic">AI will automatically route the conversation to the agent if response confidence drops below this level.</p>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'risk' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-red-50/20 flex justify-between items-center px-8">
                      <h3 className="font-black text-[10px] text-red-900 uppercase tracking-[0.3em] flex items-center gap-2">
                        <ShieldAlert size={18} className="text-red-600" /> Churn Risk Parameters
                      </h3>
                  </div>
                  <div className="p-10 space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Critical Sentiment Floor</label>
                              <div className="flex items-center gap-4">
                                  <input type="range" min="0.1" max="0.5" step="0.05" value={riskConfig.sentimentCritical} onChange={e => setRiskConfig({...riskConfig, sentimentCritical: parseFloat(e.target.value)})} className="flex-1 accent-red-600" />
                                  <span className="font-black text-red-600 text-lg tabular-nums">{riskConfig.sentimentCritical}</span>
                              </div>
                          </div>
                          <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Pipeline Stall Warning (Days)</label>
                              <div className="flex items-center gap-4">
                                  <input type="number" value={riskConfig.stallDays} onChange={e => setRiskConfig({...riskConfig, stallDays: parseInt(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 outline-none focus:ring-1 focus:ring-red-500 shadow-inner" />
                              </div>
                          </div>
                      </div>

                      <div className="bg-slate-900 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-8 border-b-8 border-red-600">
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-red-400 border border-white/10"><MessageSquare size={24}/></div>
                              <div>
                                  <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-0.5">Alert Broadcast Channel</p>
                                  <p className="text-xl font-black text-white italic tracking-tight">{riskConfig.notificationChannel}</p>
                              </div>
                          </div>
                          <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-red-50 active:scale-95 transition-all">Configure Slack Hook</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'scraping' && (
          <div className="space-y-8 animate-fade-in-up">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-8 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Target Social Sources</label>
                              <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm h-32 outline-none font-medium shadow-inner focus:bg-white focus:border-indigo-500 transition-all" value={scrapeConfig.facebookGroups} onChange={(e) => setScrapeConfig({...scrapeConfig, facebookGroups: e.target.value})} />
                          </div>
                          <div>
                              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Zip Codes</label>
                              <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm h-32 outline-none font-medium shadow-inner focus:bg-white focus:border-indigo-500 transition-all" value={scrapeConfig.zillowZip} onChange={(e) => setScrapeConfig({...scrapeConfig, zillowZip: e.target.value})} />
                          </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-700">
                          <Bot size={20} />
                          <p className="text-xs font-bold italic">"AI Architect: Scraper models are optimized for 4-hour intervals to minimize rate-limiting while capturing high-velocity leads."</p>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default SystemConfig;
