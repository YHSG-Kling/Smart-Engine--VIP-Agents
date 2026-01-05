
import React, { useState, useEffect } from 'react';
import { 
  Wand2, Sparkles, Send, Copy, RefreshCw, 
  MessageSquare, Mail, Share2, Target, Zap, 
  Bot, Loader2, DollarSign, Smartphone, Monitor,
  Info, CheckCircle2, Layout, Users, Megaphone,
  ArrowRight, Heart, Star, LayoutGrid, ChevronRight, X,
  Instagram, Linkedin, Clock, MessageCircle, AlertTriangle
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { n8nService } from '../../services/n8n';
import { airtableService } from '../../services/airtable';
import { Lead, SmartOffer, AudienceType, ContextType, Message } from '../../types';

// Shared Mock Data Source
const MOCK_LEADS: Lead[] = [
    { 
      id: '1', name: 'Alice Freeman', score: 94, lastActivity: 'Viewed Pricing Page (Just Now)', 
      lastActivityDate: new Date().toISOString(),
      status: 'Hot', source: 'Web Form', tags: ['Cash Buyer', 'Upsize Candidate', 'Urgent'], 
      sentiment: 'Delighted', urgency: 5, intent: 'Seller',
      aiSummary: 'VP at TechCorp. Fast-paced, needs direct communication.'
    },
    { 
      id: '2', name: 'Bob Driller', score: 88, lastActivity: 'Searched "Fixer Upper" (15 mins ago)', 
      lastActivityDate: new Date().toISOString(),
      status: 'Nurture', source: 'IDX Search', tags: ['Investor', 'Seller Intent'], 
      sentiment: 'Neutral', urgency: 3, intent: 'Investor',
      aiSummary: 'Looking for ROI > 12%. Asking about zoning.'
    }
];

// Mock Recent Comms
const MOCK_RECENT_COMMS: Record<string, string[]> = {
    '1': [
        "What's the absolute fastest we can get this on market?",
        "I'm worried about the interest rate hike next month.",
        "The kitchen remodel is 95% done, just waiting on handles.",
        "My neighbor just sold for $875k, I think we are closer to $900k.",
        "Can we skip the open house and do private tours only?"
    ],
    '2': [
        "Is the foundation solid on that East Austin property?",
        "I need a cap rate of at least 8% to make this work.",
        "Searching for something with an ADU potential.",
        "Cash is ready, but I won't overpay in this ZIP.",
        "Send me the inspection for the Oak Ave house again."
    ]
};

interface OfferLabProps {
    initialLeadId?: string;
}

const OfferLab: React.FC<OfferLabProps> = ({ initialLeadId }) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [recentMessages, setRecentMessages] = useState<string[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [activeTab, setActiveTab] = useState<'offer' | 'scripts' | 'social'>('offer');
  const [previewPlatform, setPreviewPlatform] = useState<'SMS' | 'Email' | 'Instagram' | 'LinkedIn'>('SMS');
  const [isDispatching, setIsDispatching] = useState<string | null>(null);
  
  const [config, setConfig] = useState({
      audience: 'Buyer' as AudienceType,
      context: 'New Outreach' as ContextType,
  });

  const [generatedOffer, setGeneratedOffer] = useState<SmartOffer | null>(null);

  // Deep Link & Lead Resolver
  useEffect(() => {
    const resolveLead = async () => {
        const idToFind = initialLeadId || '';
        const leads = await airtableService.getLeads();
        const sourcePool = leads && leads.length > 0 ? leads : MOCK_LEADS;
        const match = sourcePool.find(l => l.id === idToFind);
        
        if (match) {
            setSelectedLead(match);
            // Fetch last 5 messages
            setRecentMessages(MOCK_RECENT_COMMS[match.id] || []);
            
            const mappedAudience: AudienceType = 
                match.intent === 'Seller' ? 'Seller' : 'Buyer';

            setConfig(prev => ({ ...prev, audience: mappedAudience }));
        }
    };
    if (initialLeadId) resolveLead();
  }, [initialLeadId]);

  const handleGenerate = async () => {
    if (!selectedLead || !process.env.API_KEY) return;
    setIsSynthesizing(true);
    setGeneratedOffer(null);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Spec-aligned prompt with CRM communication context
        const prompt = `
            Act as a world-class Real Estate Growth Consultant trained in Alex Hormozi's value equation.
            FORMULA: Dream Outcome x Perceived Likelihood / (Time Delay x Effort & Sacrifice)

            CLIENT PROFILE:
            Name: ${selectedLead.name}
            Intent: ${selectedLead.intent}
            Summary: ${selectedLead.aiSummary}
            
            CRITICAL BEHAVIORAL CONTEXT (Last 5 CRM Messages):
            ${recentMessages.map((m, i) => `${i+1}. ${m}`).join('\n')}

            TASK:
            Analyze the messages above for hidden urgency, price objections, or specific "Dream Outcomes".
            Synthesize a micro-offer that addresses their specific worries (e.g. interest rates, speed, specific ROI).

            1. offer_text: Name the offer and summarize it using the value equation.
            2. warm_dm_script: Personalized intro based on their specific concerns in the messages.
            3. sms_script: High-urgency GHL SMS variant.
            4. email_snippet: GHL email body with CTA.
            5. social_hook_1: Instagram/Facebook hook.
            6. social_hook_2: LinkedIn data hook.

            OUTPUT FORMAT: JSON only.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

        if (response.text) {
            const data = JSON.parse(response.text);
            const newOffer: SmartOffer = {
                id: 'off_' + Date.now(),
                agentId: 'agent_1',
                contactId: selectedLead.id,
                offerText: data.offer_text,
                warmDMScript: data.warm_dm_script,
                smsScript: data.sms_script,
                emailSnippet: data.email_snippet,
                socialHook1: data.social_hook_1,
                socialHook2: data.social_hook_2,
                createdAt: new Date().toISOString()
            };
            setGeneratedOffer(newOffer);
            await n8nService.triggerWorkflow('wf-ai-offer-01-generate', { lead_profile: selectedLead, offer_result: newOffer });
        }
    } catch (e) {
        console.error("AI Offer synthesis failure:", e);
    } finally {
        setIsSynthesizing(false);
    }
  };

  const handleGHLDispatch = async (channel: 'SMS' | 'Email') => {
      if (!generatedOffer || !selectedLead) return;
      setIsDispatching(channel);
      const script = channel === 'SMS' ? generatedOffer.warmDMScript : generatedOffer.emailSnippet;
      await n8nService.triggerWorkflow('wf-ai-offer-01-dispatch', { offerId: generatedOffer.id, contactId: selectedLead.id, channel, message: script });
      setTimeout(() => {
          setIsDispatching(null);
          alert(`Dispatched to ${selectedLead.name} via GHL ${channel}.`);
      }, 1200);
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      alert("Copied.");
  };

  return (
    <div className="space-y-4 animate-fade-in-up pb-10 max-w-full overflow-hidden px-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">Offer Lab.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Behavioral Context Synthesis Engine</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar: Config & CRM Audit */}
          <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md p-6 space-y-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Synthesis Target</label>
                    {selectedLead ? (
                        <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100 relative group animate-fade-in">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-black text-indigo-600 shadow-sm shrink-0 border border-indigo-100 text-sm italic">
                                {selectedLead.name[0]}
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-black text-slate-900 uppercase tracking-tight text-xs truncate">{selectedLead.name}</h4>
                                <p className="text-[8px] font-bold text-indigo-600 uppercase tracking-widest">{selectedLead.status} • {selectedLead.intent}</p>
                            </div>
                            <button onClick={() => { setSelectedLead(null); setGeneratedOffer(null); setRecentMessages([]); }} className="absolute -top-1.5 -right-1.5 p-1 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-red-500 shadow-sm transition-all"><X size={10}/></button>
                        </div>
                    ) : (
                        <div className="p-8 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
                            <Users size={24} className="text-slate-200" />
                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">Select lead from CRM</p>
                        </div>
                    )}
                  </div>

                  {/* CRM Message Audit Section */}
                  {selectedLead && (
                      <div className="space-y-4 animate-fade-in">
                          <div className="flex justify-between items-center px-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">AI Context: Recent Messages</label>
                              <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">Last 5</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3 max-h-48 overflow-y-auto scrollbar-hide shadow-inner">
                              {recentMessages.map((msg, i) => (
                                  <div key={i} className="flex gap-3 items-start group">
                                      <div className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[7px] font-black text-slate-400 shrink-0 mt-0.5">{selectedLead.name[0]}</div>
                                      <p className="text-[10px] text-slate-600 font-medium leading-relaxed italic">"{msg}"</p>
                                  </div>
                              ))}
                              {recentMessages.length === 0 && <p className="text-[9px] text-slate-300 italic text-center py-4">No recent messages logged.</p>}
                          </div>
                      </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Engagement Context</label>
                        <select 
                            value={config.context}
                            onChange={e => setConfig({...config, context: e.target.value as ContextType})}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-all hover:bg-white"
                        >
                            {['New Outreach', 'Follow-up', 'Referral Ask', 'Content Post'].map(opt => <option key={opt}>{opt}</option>)}
                        </select>
                      </div>
                  </div>

                  <button 
                    onClick={handleGenerate}
                    disabled={isSynthesizing || !selectedLead}
                    className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.25em] shadow-xl hover:bg-black transition-all active:scale-95 border-b-4 border-indigo-600 disabled:opacity-50"
                  >
                      {isSynthesizing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                      {generatedOffer ? 'Retrain Engine' : 'Initialize Synthesis'}
                  </button>
              </div>

              <div className="bg-indigo-900 rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden group">
                  <div className="absolute right-[-20px] top-[-20px] p-2 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none"><Zap size={120}/></div>
                  <div className="relative z-10">
                      <h4 className="font-black text-[9px] text-indigo-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2"><Bot size={16}/> Intelligence Briefing</h4>
                      <p className="text-xs font-bold leading-relaxed italic text-indigo-100">
                          {selectedLead?.tags.includes('Urgent') 
                            ? `"The lead's recent messages indicate high anxiety regarding timelines. I am optimizing the offer for 'Reduced Time Delay' to increase the overall value score."`
                            : `"Analyzing communication tone. Lead seems analytical; I will pivot scripts to emphasize 'Perceived Likelihood' via data and proof."`}
                      </p>
                  </div>
              </div>
          </div>

          {/* Results Main Stage */}
          <div className="lg:col-span-8 space-y-4">
              {!generatedOffer && !isSynthesizing ? (
                  <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center bg-white rounded-[2.5rem] border border-slate-200 border-dashed p-12 animate-fade-in">
                      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-100 mb-8 border border-slate-100 shadow-inner">
                          <Wand2 size={40} />
                      </div>
                      <h3 className="text-2xl font-black text-slate-300 uppercase tracking-tighter italic">Offer Lab Idle.</h3>
                      <p className="max-w-xs text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mt-4 leading-relaxed px-6">Select a lead from the CRM stack to synthesize an Alex Hormozi style micro-offer based on their specific behavior.</p>
                  </div>
              ) : isSynthesizing ? (
                  <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center bg-white rounded-[2.5rem] border border-slate-200 p-12 animate-pulse">
                      <div className="relative mb-8">
                        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 shadow-inner ring-4 ring-white">
                            <RefreshCw size={36} className="animate-spin-slow" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border border-indigo-50">
                            <Bot className="text-indigo-600" size={16} />
                        </div>
                      </div>
                      <h3 className="text-2xl font-black text-indigo-600 uppercase tracking-tighter italic leading-none">Context Synthesis...</h3>
                      <p className="max-w-xs text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 leading-relaxed">Analyzing last 5 CRM messages for sentiment, specific goals, and urgency signals.</p>
                  </div>
              ) : (
                  <div className="space-y-4 animate-fade-in">
                      {/* Interaction Tabs */}
                      <div className="flex bg-white rounded-xl p-1 border border-slate-200 w-fit shadow-md overflow-x-auto max-w-full scrollbar-hide">
                          {[
                            { id: 'offer', label: 'Core Offer', icon: DollarSign },
                            { id: 'scripts', label: 'GHL Scripts', icon: MessageSquare },
                            { id: 'social', label: 'Social Hooks', icon: Share2 }
                          ].map(t => (
                              <button 
                                key={t.id}
                                onClick={() => setActiveTab(t.id as any)}
                                className={`px-5 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}
                              >
                                  <t.icon size={14} /> {t.label}
                              </button>
                          ))}
                      </div>

                      {activeTab === 'offer' && generatedOffer && (
                          <div className="space-y-4 animate-fade-in">
                              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
                                  <div className="bg-slate-900 p-8 text-white flex justify-between items-center border-b-8 border-indigo-600">
                                      <div>
                                        <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none">The Micro-Offer.</h3>
                                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1.5"><Bot size={12}/> Behavioral Synthesis Result</p>
                                      </div>
                                      <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 text-center shadow-2xl">
                                          <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest leading-none mb-1">CONVERSION SCORE</p>
                                          <p className="text-2xl font-black tracking-tighter text-white tabular-nums">9.2 / 10</p>
                                      </div>
                                  </div>
                                  <div className="p-8 md:p-12 space-y-10">
                                      <div className="bg-slate-50 border-2 border-indigo-100 p-8 md:p-12 rounded-[2.5rem] relative group/offer">
                                          <div className="absolute -top-3 left-10 bg-indigo-600 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5">
                                              <Sparkles size={12}/> Active Value Proposition
                                          </div>
                                          <p className="text-2xl md:text-3xl font-black text-slate-800 leading-[1.2] italic">
                                              "{generatedOffer.offerText}"
                                          </p>
                                          <button onClick={() => copyToClipboard(generatedOffer.offerText)} className="absolute bottom-6 right-6 p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 opacity-0 group-hover/offer:opacity-100 transition-all shadow-xl active:scale-90">
                                            <Copy size={20}/>
                                          </button>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                          <div className="p-6 bg-indigo-50/30 border border-indigo-100 rounded-3xl shadow-sm">
                                              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-6 flex items-center gap-2 italic"><AlertTriangle size={14} className="text-indigo-500"/> Hormozi Value Matrix</h5>
                                              <div className="space-y-4">
                                                  {[
                                                      { l: 'Dream Outcome', v: 'Buy Fast / Max ROI', c: 'text-emerald-500' },
                                                      { l: 'Perceived Likelihood', v: '98.2% Proof', c: 'text-indigo-500' },
                                                      { l: 'Time Delay', v: '7-Day Blitz', c: 'text-emerald-500' },
                                                      { l: 'Effort & Sacrifice', v: 'Agent Managed', c: 'text-indigo-500' },
                                                  ].map(item => (
                                                      <div key={item.l} className="flex justify-between items-center text-[10px] font-black border-b border-indigo-100/30 pb-2">
                                                          <span className="text-slate-400 uppercase tracking-widest">{item.l}</span>
                                                          <span className={`${item.c} uppercase italic`}>{item.v}</span>
                                                      </div>
                                                  ))}
                                              </div>
                                          </div>
                                          <div className="flex flex-col gap-4 justify-center">
                                              <button onClick={() => setActiveTab('scripts')} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl active:scale-95 border-b-4 border-slate-700">
                                                Approve for Outreach <ArrowRight size={18}/>
                                              </button>
                                              <button onClick={handleGenerate} className="w-full bg-white border-2 border-slate-200 text-slate-400 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
                                                <RefreshCw size={16}/> Re-Synthesize Context
                                              </button>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      )}

                      {activeTab === 'scripts' && generatedOffer && (
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                              <div className="lg:col-span-7 space-y-6">
                                  {[
                                      { l: 'Behavioral SMS (Primary)', v: generatedOffer.warmDMScript, i: Smartphone, color: 'text-indigo-600', bg: 'bg-indigo-50', channel: 'SMS' },
                                      { l: 'High-Urgency Alert', v: generatedOffer.smsScript, i: MessageCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', channel: 'SMS' },
                                      { l: 'Personalized Email snippet', v: generatedOffer.emailSnippet, i: Mail, color: 'text-blue-600', bg: 'bg-blue-50', channel: 'Email' }
                                  ].map(script => (
                                      <div key={script.l} className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm group hover:border-indigo-400 transition-all flex flex-col h-fit">
                                          <div className="flex justify-between items-center mb-4">
                                              <div className="flex items-center gap-3">
                                                  <div className={`p-3 rounded-xl ${script.bg} ${script.color} shadow-inner group-hover:scale-110 transition-transform`}><script.i size={18}/></div>
                                                  <h4 className="font-black text-[11px] text-slate-800 uppercase tracking-widest">{script.l}</h4>
                                              </div>
                                              <button onClick={() => copyToClipboard(script.v)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"><Copy size={16}/></button>
                                          </div>
                                          <div className="bg-slate-50 p-5 rounded-2xl italic text-[12px] text-slate-700 font-medium leading-relaxed border border-slate-100 mb-6 group-hover:bg-white transition-colors">
                                              "{script.v}"
                                          </div>
                                          <button 
                                            onClick={() => { setPreviewPlatform(script.channel as any); handleGHLDispatch(script.channel as any); }}
                                            disabled={isDispatching !== null}
                                            className="w-full py-4 bg-indigo-600 text-white rounded-[1.25rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-indigo-700 active:scale-95 transition-all border-b-4 border-indigo-900 disabled:opacity-50"
                                          >
                                              {isDispatching === script.channel ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}
                                              {isDispatching === script.channel ? 'Syncing with GHL...' : `Dispatch to ${script.channel}`}
                                          </button>
                                      </div>
                                  ))}
                              </div>

                              {/* Device Preview Console */}
                              <div className="lg:col-span-5">
                                  <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white min-h-[550px] sticky top-4 flex flex-col border-b-8 border-indigo-600 shadow-[0_30px_60px_rgba(0,0,0,0.3)] relative overflow-hidden">
                                      <div className="absolute right-[-10px] top-[-10px] p-2 opacity-5 pointer-events-none"><Monitor size={150}/></div>
                                      <div className="relative z-10 flex justify-between items-center mb-8">
                                          <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2 italic"><Bot size={16}/> Live Device Preview</h4>
                                          <div className="flex bg-white/10 p-1 rounded-xl shadow-inner border border-white/5">
                                              {(['SMS', 'Email'] as const).map(p => (
                                                  <button key={p} onClick={() => setPreviewPlatform(p)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${previewPlatform === p ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{p}</button>
                                              ))}
                                          </div>
                                      </div>

                                      {previewPlatform === 'SMS' ? (
                                          <div className="w-full max-w-[260px] mx-auto bg-white rounded-[3rem] p-4 flex flex-col shadow-2xl relative animate-fade-in border-8 border-slate-800 flex-1 mb-4">
                                              <div className="h-5 w-1/4 bg-slate-100 rounded-full mx-auto mb-8 flex items-center justify-center shadow-inner"><div className="w-2 h-2 rounded-full bg-slate-200" /></div>
                                              <div className="space-y-4 flex-1 overflow-hidden">
                                                  <div className="bg-slate-100 text-slate-400 p-3 rounded-2xl rounded-bl-none text-[8px] font-black uppercase w-2/3 shadow-sm italic">Analysis complete...</div>
                                                  <div className="bg-indigo-600 text-white p-5 rounded-[1.5rem] rounded-br-none text-[11px] font-bold leading-relaxed self-end shadow-2xl ml-8 border border-indigo-500">
                                                      {generatedOffer.warmDMScript}
                                                  </div>
                                              </div>
                                              <div className="h-10 w-full bg-slate-50 rounded-full mt-6 flex items-center px-4 justify-between border border-slate-100 shadow-inner">
                                                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest italic">GHL Connect</p>
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
                                              </div>
                                          </div>
                                      ) : (
                                          <div className="bg-white rounded-3xl p-8 flex flex-col shadow-2xl flex-1 overflow-hidden animate-fade-in border-t-8 border-indigo-600 mb-4">
                                              <div className="border-b-2 border-slate-50 pb-5 mb-5">
                                                  <div className="flex justify-between items-center mb-2">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">To: {selectedLead.name}</p>
                                                    <p className="text-[8px] text-slate-300 font-bold">{new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                                                  </div>
                                                  <p className="text-sm font-black text-slate-900 uppercase italic tracking-tight truncate">Market Performance Update</p>
                                              </div>
                                              <p className="text-slate-600 text-xs leading-relaxed font-medium mb-8 overflow-hidden line-clamp-[12]">
                                                  {generatedOffer.emailSnippet}
                                              </p>
                                              <div className="mt-auto pt-5 border-t border-slate-50">
                                                  <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm italic shadow-lg">SS</div>
                                                    <div>
                                                      <p className="text-xs font-black text-indigo-600 uppercase tracking-widest leading-none mb-1">Sarah Smith</p>
                                                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.2em]">Strategy Consultant</p>
                                                    </div>
                                                  </div>
                                              </div>
                                          </div>
                                      )}
                                      <p className="text-[8px] text-indigo-400 text-center font-bold uppercase tracking-[0.3em]">Device: iPhone 15 Pro Max (Simulated)</p>
                                  </div>
                              </div>
                          </div>
                      )}

                      {activeTab === 'social' && generatedOffer && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                              {[
                                { l: 'Viral Pattern Hook', v: generatedOffer.socialHook1, i: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
                                { l: 'Executive Data Hook', v: generatedOffer.socialHook2, i: Linkedin, color: 'text-blue-600', bg: 'bg-blue-50' }
                              ].map(post => (
                                  <div key={post.l} className="bg-white rounded-[2.5rem] border border-slate-200 p-6 shadow-xl flex flex-col group hover:border-indigo-400 transition-all relative overflow-hidden h-fit">
                                      <div className="absolute right-[-20px] top-[-20px] p-2 opacity-5 text-indigo-900 group-hover:rotate-12 transition-transform duration-700 pointer-events-none"><Sparkles size={100}/></div>
                                      <div className="flex justify-between items-center mb-8 relative z-10">
                                          <div className="flex items-center gap-4">
                                              <div className={`p-4 rounded-2xl ${post.bg} ${post.color} shadow-sm group-hover:scale-110 transition-transform`}><post.i size={24}/></div>
                                              <div>
                                                <h4 className="font-black text-[11px] text-slate-800 uppercase tracking-widest">{post.l}</h4>
                                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">Marketing Studio Bundle</p>
                                              </div>
                                          </div>
                                          <button onClick={() => copyToClipboard(post.v)} className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all shadow-inner"><Copy size={18}/></button>
                                      </div>
                                      <div className="bg-slate-50 p-8 rounded-3xl italic text-lg md:text-xl text-slate-900 font-black leading-tight border border-slate-100 mb-8 flex items-center justify-center text-center relative z-10 shadow-inner group-hover:bg-white transition-colors min-h-[140px]">
                                          "{post.v}"
                                      </div>
                                      <button className="relative z-10 w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 hover:bg-black active:scale-95 transition-all border-b-4 border-indigo-600">
                                          <Layout size={18}/> Morph to Studio Asset
                                      </button>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default OfferLab;
