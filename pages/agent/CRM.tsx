
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Flame, Clock, 
  MessageCircle, Phone, Mail, 
  ChevronRight, BrainCircuit, Sparkles, RefreshCw,
  Zap, CheckCircle2, AlertCircle, Plus, X, ArrowRightLeft, UserPlus,
  Linkedin, ShieldCheck, Database, Globe, Download, Loader2, Building2, TrendingUp, Wallet, ArrowRight, Home,
  HeartPulse, Briefcase, Tag, Target, DollarSign, ThumbsDown, MessageSquare, ExternalLink, Bot, MousePointerClick, User, Info, Send,
  Facebook, Instagram, Megaphone, Check, XCircle, Gauge, Calendar, Landmark,
  FileText, Activity, Layout, Key, Gift, Cake, Award, PartyPopper, Ban
} from 'lucide-react';
import { Lead, Prospect, ScrapeJob, SearchActivityLog, SocialLeadLog, PastClient } from '../../types';
import { airtableService } from '../../services/airtable';
import { n8nService } from '../../services/n8n';

const CRM: React.FC = () => {
  const [selectedView, setSelectedView] = useState<'hot-leads' | 'money-board' | 'all' | 'prospecting' | 'idx-activity' | 'social-leads' | 'past-clients'>('hot-leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeLeadTab, setActiveLeadTab] = useState<'profiling' | 'property' | 'strategy'>('profiling');
  const [isEnrichingProperty, setIsEnrichingProperty] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState<string | null>(null);

  // Workflow 154: Past Client Sphere State
  const [pastClients, setPastClients] = useState<PastClient[]>([
    { id: 'pc1', name: 'The Johnson Family', closingDate: '2022-11-03', homeAnniversary: 'Nov 03', houseFeaturesTags: ['Renovated Kitchen', 'Large Yard'], currentEstValue: 625000, referralsSent: 3, lastTouch: '2 weeks ago', giftStatus: 'Sent', reviewStatus: 'Received' },
    { id: 'pc2', name: 'Alice Chen', closingDate: '2023-11-03', homeAnniversary: 'Nov 03', houseFeaturesTags: ['Pool', 'Downtown View'], currentEstValue: 980000, referralsSent: 0, lastTouch: '3 mos ago', giftStatus: 'None', reviewStatus: 'Requested' },
    { id: 'pc3', name: 'Bob Smith', closingDate: '2021-05-12', homeAnniversary: 'May 12', houseFeaturesTags: ['Fixer Upper'], currentEstValue: 345000, birthday: '1985-11-03', referralsSent: 1, lastTouch: '1 mo ago', giftStatus: 'None', reviewStatus: 'None' }
  ]);

  const [anniversaryDrafts, setAnniversaryDrafts] = useState<Record<string, string>>({
      'pc1': "Hi Johnson Family! Happy 2-year Home Anniversary! I hope that beautiful renovated kitchen is still the heart of your home. Just checked the local 78704 stats, and your equity has likely grown significantly—estimated value is now approx $625,000. Hope you are well!",
      'pc2': "Hi Alice! Can't believe it's been a year since you moved in. I bet those downtown views from the pool are incredible right now. Your home is currently estimated at $980,000. Thinking of you today!"
  });

  const [idxActivity] = useState<SearchActivityLog[]>([
      { id: 'act1', leadId: '1', propertyAddress: '123 Tech Lane', price: 850000, featuresViewed: ['Modern', 'Luxury', 'Solar'], timestamp: '2 mins ago', intentTag: 'Luxury' },
      { id: 'act2', leadId: '2', propertyAddress: '88 Fixer Blvd', price: 320000, featuresViewed: ['AS-IS', 'Corner Lot'], timestamp: '15 mins ago', intentTag: 'Investor' },
      { id: 'act3', leadId: '1', propertyAddress: '99 Penthouse Dr', price: 1500000, featuresViewed: ['Downtown', 'Pool'], timestamp: '1h ago', intentTag: 'Luxury' },
      { id: 'act4', leadId: '3', propertyAddress: '42 Ranch Rd', price: 1100000, featuresViewed: ['Acreage', 'Horse Property'], timestamp: '3h ago', intentTag: 'Relocation' }
  ]);

  const [socialLeads] = useState<SocialLeadLog[]>([
      { id: 'sl1', leadId: '101', leadName: 'Tom Hardy', fbFormId: 'f_882910', adSetName: 'West Lake Sellers - Oct', rawPayload: {}, initialAIOutreachSent: true, timestamp: '10 mins ago' },
      { id: 'sl2', leadId: '102', leadName: 'Emma Stone', fbFormId: 'f_441029', adSetName: 'First Time Buyer PDF', rawPayload: {}, initialAIOutreachSent: true, timestamp: '1h ago' },
      { id: 'sl3', leadId: '103', leadName: 'Ryan Gosling', fbFormId: 'f_882910', adSetName: 'West Lake Sellers - Oct', rawPayload: {}, initialAIOutreachSent: false, timestamp: '4h ago' }
  ]);

  const mockLeads: Lead[] = [
    { 
      id: '1', name: 'Alice Freeman', score: 94, lastActivity: 'Viewed Pricing Page (Just Now)', 
      lastActivityDate: new Date().toISOString(),
      status: 'Hot', source: 'Web Form', tags: ['Cash Buyer', 'Upsize Candidate', 'Urgent'], 
      tagRationale: {
          'Upsize Candidate': 'Viewed five 4-Bed properties despite searching for 3-Bed.',
          'Cash Buyer': 'Manually tagged during intake phone call.'
      },
      sentiment: 'Delighted', urgency: 5, intent: 'Seller',
      phone: '512-555-0100', email: 'alice@freeman.com',
      emailStatus: 'Valid', phoneType: 'Mobile',
      urgencyReason: 'Lease ends Nov 1st',
      propertyAddress: '123 Main St, Austin, TX 78704',
      totalEngagementScore: 142,
      engagementVelocity: 45,
      isSurgeDetected: true,
      propertyIntelligence: {
          estimatedValue: 850000,
          mortgageBalance: 320000,
          equityPercent: 62,
          lastSaleDate: '2014-06-12',
          ownerStatus: 'Owner Occupied',
          loanType: 'Conventional Fixed',
          aiSellPrediction: 'High',
          aiSellReason: 'Owned for 9 years with >60% equity. Neighborhood appreciation up 18% this year.',
          lastEnriched: '2h ago'
      },
      aiSummary: 'VP at TechCorp. Fast-paced, needs direct communication.',
      enrichmentStatus: 'Complete',
      socialProfileSummary: 'LinkedIn: VP of Product. Twitter: Tech Enthusiast.',
      estimatedIncome: '$250k+',
      aiPersonalityTip: 'Be direct and data-driven. High D on DISC profile.',
      aiSuggestedOpeningLine: 'Hey Alice, I saw you were looking at luxury moderns in Tech Lane. I have an off-market coming next week.'
    },
    { 
      id: '2', name: 'Bob Driller', score: 88, lastActivity: 'Searched "Fixer Upper" (15 mins ago)', 
      lastActivityDate: new Date().toISOString(),
      status: 'Nurture', source: 'IDX Search', tags: ['Investor', 'Seller Intent'], 
      tagRationale: {
          'Seller Intent': 'Viewed "How to Sell" guide 3 times in 48 hours.',
          'Investor': 'Pixel tracked clicking 10+ foreclosure listings.'
      },
      sentiment: 'Neutral', urgency: 3, intent: 'Investor',
      phone: '512-555-0101', email: 'bob@invest.io',
      emailStatus: 'Risky', phoneType: 'VOIP',
      totalEngagementScore: 58,
      engagementVelocity: 12,
      isSurgeDetected: false,
      aiSummary: 'Looking for ROI > 12%. Asking about zoning.',
      enrichmentStatus: 'Complete',
      aiPersonalityTip: 'Focus on cap rates and hard numbers. Low emotional fluff.',
      estimatedIncome: '$150k - $200k'
    },
    { 
      id: '3', name: 'James Litigation', score: 99, lastActivity: 'Opted Out via SMS', 
      lastActivityDate: new Date().toISOString(),
      status: 'Cold', source: 'Twilio', tags: ['Opt-Out'], 
      sentiment: 'Negative', urgency: 1, intent: 'Buyer',
      phone: '512-555-0810', email: 'james@stop.com',
      dncEnabled: true // Workflow 155
    }
  ];

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    const data = await airtableService.getLeads();
    setLeads(data && data.length > 0 ? data : mockLeads);
    setIsLoading(false);
  };

  const handleEnrichProperty = async (lead: Lead) => {
      if (!lead.propertyAddress) return;
      setIsEnrichingProperty(true);
      await n8nService.triggerPropertyEnrichment(lead.id, lead.propertyAddress);
      setTimeout(() => {
          setIsEnrichingProperty(false);
          alert("BatchData Enrichment Complete: Deep equity & ownership profile synthesized.");
      }, 1500);
  };

  const handleGrantAccess = async (lead: Lead) => {
    if (lead.dncEnabled) return;
    setIsProvisioning(lead.id);
    await n8nService.grantPortalAccess(lead.email || '', lead.intent as any, lead.id, lead.name);
    setTimeout(() => {
        setIsProvisioning(null);
        alert(`Nexus OS: Role-based Portal Access granted for ${lead.name}. Personalized Magic Link sent via SendGrid.`);
    }, 1200);
  };

  const handleApproveDraft = async (clientId: string) => {
      setIsProvisioning(clientId);
      const draft = anniversaryDrafts[clientId];
      await n8nService.approveAnniversaryDraft(clientId, draft);
      setTimeout(() => {
          setIsProvisioning(null);
          setAnniversaryDrafts(prev => {
              const updated = { ...prev };
              delete updated[clientId];
              return updated;
          });
          alert("Anniversary Protocol: AI Draft dispatched to client via GHL.");
      }, 1000);
  };

  const hotLeads = leads.filter(l => (l.totalEngagementScore || 0) > 50 && l.lastActivityDate?.includes(new Date().toISOString().split('T')[0]));

  const currentAnniversaries = pastClients.filter(c => c.homeAnniversary === 'Nov 03' || (c.birthday && c.birthday.includes('11-03')));

  return (
    <div className="space-y-5 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 uppercase italic tracking-tighter">Intelligence CRM.</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Nexus OS Behavioral Data</p>
        </div>
        
        <div className="flex gap-2">
          <div className="flex bg-white rounded-xl p-0.5 border border-slate-200 overflow-x-auto max-w-full scrollbar-hide">
            {[
                { id: 'hot-leads', label: '🔥 Hot Today' },
                { id: 'idx-activity', label: 'Live IDX' },
                { id: 'social-leads', label: 'Social Sync' },
                { id: 'past-clients', label: 'Sphere Nurture' },
                { id: 'money-board', label: 'Pipeline' },
                { id: 'all', label: 'All Contacts' }
            ].map(v => (
                <button key={v.id} onClick={() => setSelectedView(v.id as any)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedView === v.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                    {v.label}
                </button>
            ))}
          </div>
        </div>
      </div>

      {selectedView === 'past-clients' && (
          <div className="space-y-8 animate-fade-in-up">
              {/* Daily Sphere Header */}
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600 flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="absolute right-0 top-0 p-12 opacity-5 rotate-12"><PartyPopper size={200}/></div>
                  <div className="relative z-10 max-xl">
                      <p className="text-indigo-400 text-sm font-black uppercase tracking-[0.3em] mb-4">Sphere Nurture Protocol</p>
                      <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-4 leading-none">Daily Sphere Tasks.</h2>
                      <p className="text-indigo-100 text-lg font-medium opacity-90 leading-relaxed mb-8">Staying top-of-mind with hyper-personalization. AI has scanned your database for milestones and drafted specific outreach messages.</p>
                      
                      <div className="flex gap-4">
                          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center">
                              <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">ANNIVERSARIES</p>
                              <p className="text-2xl font-black">{currentAnniversaries.filter(c => !c.birthday).length}</p>
                          </div>
                          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center">
                              <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">BIRTHDAYS</p>
                              <p className="text-2xl font-black">{currentAnniversaries.filter(c => c.birthday).length}</p>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Task List */}
              <div className="grid grid-cols-1 gap-6">
                  {currentAnniversaries.map(client => (
                      <div key={client.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-md p-8 group hover:border-indigo-400 transition-all flex flex-col lg:flex-row gap-10">
                          <div className="lg:w-72 shrink-0">
                              <div className="flex items-center gap-4 mb-6">
                                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl italic shadow-inner">
                                      {client.name[0]}
                                  </div>
                                  <div>
                                      <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg leading-none mb-1.5">{client.name}</h4>
                                      <div className="flex items-center gap-2">
                                          {client.birthday?.includes('11-03') ? <Cake size={14} className="text-pink-500"/> : <Home size={14} className="text-emerald-500"/>}
                                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{client.birthday?.includes('11-03') ? 'Birthday Today' : 'Home Anniversary'}</span>
                                      </div>
                                  </div>
                              </div>
                              <div className="space-y-4">
                                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Home Features</p>
                                      <div className="flex flex-wrap gap-1.5">
                                          {client.houseFeaturesTags?.map(tag => (
                                              <span key={tag} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[8px] font-black uppercase">{tag}</span>
                                          ))}
                                      </div>
                                  </div>
                                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                      <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Current Est. Value</p>
                                      <p className="text-base font-black text-emerald-800 tabular-nums">${client.currentEstValue?.toLocaleString()}</p>
                                  </div>
                              </div>
                          </div>

                          <div className="flex-1 space-y-6">
                              <div className="flex justify-between items-center">
                                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                      <Bot size={16} className="text-indigo-600"/> AI Personal Outreach Draft
                                  </h5>
                                  <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Edit Script</button>
                              </div>
                              <div className="bg-indigo-50/30 border-2 border-indigo-100 p-6 rounded-3xl relative">
                                  <div className="absolute top-4 right-4 opacity-10"><MessageSquare size={40}/></div>
                                  <p className="text-sm font-bold text-indigo-900 leading-relaxed italic">
                                      "{anniversaryDrafts[client.id] || "AI is drafting a custom anniversary message based on property tags..."}"
                                  </p>
                              </div>
                              <div className="flex gap-4">
                                  <button 
                                    onClick={() => handleApproveDraft(client.id)}
                                    disabled={isProvisioning === client.id}
                                    className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-indigo-900"
                                  >
                                      {isProvisioning === client.id ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}
                                      Approve & Send (GHL)
                                  </button>
                                  <button className="px-8 bg-white border-2 border-slate-200 text-slate-700 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all">Manual Dial</button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {selectedView === 'hot-leads' && (
          <div className="space-y-6 animate-fade-in-up">
              {hotLeads.length === 0 ? (
                  <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                      <Clock size={40} className="mx-auto text-slate-200 mb-4" />
                      <p className="font-black text-slate-400 uppercase tracking-widest text-xs">No Behavioral Surges Detected Yet Today.</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {hotLeads.map(lead => (
                          <div key={lead.id} className={`rounded-[2rem] border-2 p-6 shadow-lg transition-all relative overflow-hidden group ${
                              lead.dncEnabled ? 'bg-red-50 border-red-500 ring-4 ring-red-100' : 
                              lead.isSurgeDetected ? 'bg-white border-orange-500 ring-4 ring-orange-50' : 'bg-white border-slate-200'
                          }`}>
                                {lead.dncEnabled ? (
                                    <div className="absolute top-0 right-0 bg-red-600 text-white px-4 py-1 rounded-bl-2xl font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 z-10 shadow-lg">
                                        <Ban size={12} /> DO NOT CONTACT - OPTED OUT
                                    </div>
                                ) : lead.isSurgeDetected && (
                                    <div className="absolute top-0 right-0 bg-orange-500 text-white px-4 py-1 rounded-bl-2xl font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 z-10 shadow-lg">
                                        <Flame size={12} /> Surge Detected
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border ${
                                            lead.dncEnabled ? 'bg-red-100 text-red-700 border-red-200' :
                                            lead.isSurgeDetected ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                        }`}>
                                            {lead.name[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight leading-none mb-1">{lead.name}</h3>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{lead.intent} • {lead.source}</p>
                                        </div>
                                    </div>
                                    {!lead.dncEnabled && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleGrantAccess(lead); }}
                                            className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                                            title="Provision Portal Access"
                                        >
                                            {isProvisioning === lead.id ? <Loader2 size={18} className="animate-spin text-indigo-500"/> : <Key size={18}/>}
                                        </button>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <div className="flex flex-wrap gap-2">
                                        {lead.tags.map(tag => (
                                            <div key={tag} className="relative group/tag">
                                                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-indigo-100 cursor-help shadow-sm">
                                                    {tag}
                                                </span>
                                                {lead.tagRationale?.[tag] && (
                                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-900 text-white text-[9px] font-bold p-3 rounded-xl opacity-0 group-hover/tag:opacity-100 transition-all pointer-events-none z-20 shadow-2xl border border-white/10">
                                                        <div className="flex items-center gap-1.5 text-indigo-400 mb-1">
                                                            <Bot size={12}/> Behavioral Sherlock
                                                        </div>
                                                        "{lead.tagRationale[tag]}"
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Zap size={10}/> Intent Score</p>
                                        <p className="font-black text-xl text-slate-900 tracking-tight">{lead.totalEngagementScore || 0}</p>
                                    </div>
                                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                        <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><TrendingUp size={10}/> 24h Velocity</p>
                                        <p className="font-black text-xl text-indigo-600 tracking-tight">+{lead.engagementVelocity || 0}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Behavioral Footprint</p>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between group-hover:border-indigo-200 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <MousePointerClick size={14} className="text-indigo-500" />
                                            <span className="text-[10px] font-bold text-slate-700 truncate">{lead.lastActivity}</span>
                                        </div>
                                        <span className="text-[8px] font-black text-slate-400 uppercase">Just Now</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setSelectedLead(lead)}
                                    disabled={lead.dncEnabled}
                                    className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                                        lead.dncEnabled ? 'bg-slate-300 text-white cursor-not-allowed' :
                                        lead.isSurgeDetected ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-slate-900 text-white hover:bg-black'
                                    }`}
                                >
                                    {lead.dncEnabled ? <Ban size={14} /> : lead.isSurgeDetected ? <Phone size={14} /> : <MessageCircle size={14} />}
                                    {lead.dncEnabled ? 'NO CONTACT ALLOWED' : lead.isSurgeDetected ? 'Initiate Urgent Call' : 'Draft Response'}
                                </button>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}

      {selectedView === 'idx-activity' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-900 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Activity size={180}/></div>
                  <div className="relative z-10 max-xl">
                      <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Live Behavioral Feed.</h3>
                      <p className="text-indigo-100 text-sm font-medium">Real-time digital footprint tracking across IDX portals and listing landing pages.</p>
                  </div>
                  <div className="relative z-10 bg-black/20 p-4 rounded-2xl border border-white/10 backdrop-blur-md min-w-[200px] text-center">
                        <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">TOTAL EVENTS (24H)</p>
                        <p className="text-3xl font-black tracking-tighter">1,242</p>
                  </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                      <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Activity size={18} className="text-indigo-600" /> Behavioral Trace Log
                      </h3>
                      <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1.5"><RefreshCw size={12}/> Live Refresh</button>
                  </div>
                  <div className="divide-y divide-slate-100">
                      {idxActivity.map(act => (
                          <div key={act.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                              <div className="flex items-center gap-6">
                                  <div className={`p-3 rounded-2xl ${
                                      act.intentTag === 'Luxury' ? 'bg-purple-50 text-purple-600' :
                                      act.intentTag === 'Investor' ? 'bg-emerald-50 text-emerald-600' :
                                      'bg-blue-50 text-blue-600'
                                  }`}>
                                      <Home size={24}/>
                                  </div>
                                  <div>
                                      <div className="flex items-center gap-2 mb-1">
                                          <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">{act.propertyAddress}</h4>
                                          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[8px] font-black uppercase">${(act.price/1000).toFixed(0)}k</span>
                                      </div>
                                      <div className="flex flex-wrap gap-1.5">
                                          {act.featuresViewed.map(f => (
                                              <span key={f} className="text-[8px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 px-1.5 py-0.5 rounded">{f}</span>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                              <div className="text-right flex items-center gap-8">
                                  <div>
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Behavioral Intent</p>
                                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                                          act.intentTag === 'Luxury' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                          act.intentTag === 'Investor' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                          'bg-blue-50 text-blue-700 border-blue-100'
                                      }`}>
                                          {act.intentTag}
                                      </span>
                                  </div>
                                  <div className="w-32 hidden md:block">
                                      <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">{act.timestamp}</p>
                                      <button className="text-[9px] font-black text-indigo-600 uppercase flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Assign Task <ArrowRight size={10}/></button>
                                  </div>
                                  <ChevronRight size={18} className="text-slate-200 group-hover:text-indigo-600" />
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {selectedView === 'social-leads' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Megaphone size={180}/></div>
                  <div className="relative z-10 max-xl">
                      <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Social Ingestion Hub.</h3>
                      <p className="text-slate-400 text-sm font-medium">Meta & LinkedIn leads synced in real-time with automated AI icebreaker responses.</p>
                  </div>
                  <div className="relative z-10 flex gap-3">
                        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md text-center">
                            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">FB SYNC</p>
                            <p className="text-xl font-black text-white">ACTIVE</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md text-center">
                            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">LI SYNC</p>
                            <p className="text-xl font-black text-white">ACTIVE</p>
                        </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                  {socialLeads.map(log => (
                      <div key={log.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-indigo-400 transition-all flex flex-col md:flex-row justify-between items-center gap-6 group">
                          <div className="flex items-center gap-6 flex-1 min-w-0">
                              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 text-indigo-600 group-hover:scale-105 transition-transform shrink-0">
                                  <Facebook size={24}/>
                              </div>
                              <div className="min-w-0">
                                  <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg leading-none mb-1.5">{log.leadName}</h4>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                      <Megaphone size={10} className="text-indigo-500"/> Campaign: <span className="text-slate-700 italic">"{log.adSetName}"</span>
                                  </p>
                              </div>
                          </div>

                          <div className="flex items-center gap-10 shrink-0">
                              <div className="text-center">
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">AI OUTREACH</p>
                                  {log.initialAIOutreachSent ? (
                                      <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-emerald-100 flex items-center gap-1.5">
                                          <div className="w-1 h-1 rounded-full bg-emerald-500"/> Initialized
                                      </span>
                                  ) : (
                                      <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-orange-100 flex items-center gap-1.5 animate-pulse">
                                          <Bot size={10}/> Queued
                                      </span>
                                  )}
                              </div>
                              <div className="text-right">
                                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{log.timestamp}</p>
                                  <button className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">Audit Lead</button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {(selectedView === 'money-board' || selectedView === 'all') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
              {leads.filter(l => selectedView === 'all' ? true : l.score >= 80).map(lead => (
                  <div key={lead.id} className={`rounded-[2rem] border-2 p-6 shadow-lg transition-all relative overflow-hidden group ${
                    lead.dncEnabled ? 'bg-red-50 border-red-500 ring-4 ring-red-100' : 
                    lead.isSurgeDetected ? 'bg-white border-orange-500 ring-4 ring-orange-50' : 'bg-white border-slate-200'
                }`}>
                      <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border ${
                                  lead.dncEnabled ? 'bg-red-100 text-red-700 border-red-200' :
                                  lead.isSurgeDetected ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                              }`}>
                                  {lead.name[0]}
                              </div>
                              <div>
                                  <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight leading-none mb-1">{lead.name}</h3>
                                  <div className="flex items-center gap-2">
                                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${
                                          lead.dncEnabled ? 'bg-red-600 text-white border-red-700' :
                                          lead.status === 'Hot' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                                      }`}>
                                          {lead.dncEnabled ? 'DNC' : lead.status}
                                      </span>
                                      <span className="text-[10px] font-black text-indigo-600">{lead.score}% Score</span>
                                  </div>
                              </div>
                          </div>
                          <div className="flex gap-1">
                             {!lead.dncEnabled && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleGrantAccess(lead); }}
                                    className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                                    title="Grant Portal Access"
                                >
                                    {isProvisioning === lead.id ? <Loader2 size={16} className="animate-spin text-indigo-600"/> : <Key size={16}/>}
                                </button>
                             )}
                             <button className="p-2 text-slate-300 hover:text-indigo-600" onClick={() => setSelectedLead(lead)}><Info size={20}/></button>
                          </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                          {lead.tags.map(tag => (
                              <div key={tag} className="relative group/tag">
                                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-slate-200 cursor-help transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700">
                                      {tag}
                                  </span>
                                  {lead.tagRationale?.[tag] && (
                                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-900 text-white text-[9px] font-bold p-3 rounded-xl opacity-0 group-hover/tag:opacity-100 transition-all pointer-events-none z-20 shadow-2xl border border-white/10">
                                          <div className="flex items-center gap-1.5 text-indigo-400 mb-1">
                                              <Bot size={12}/> Behavioral Sherlock
                                          </div>
                                          "{lead.tagRationale[tag]}"
                                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                                      </div>
                                  )}
                              </div>
                          ))}
                      </div>

                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4 shadow-sm space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                              <div className="flex items-center gap-2 truncate">
                                  <Mail size={12} className="text-slate-400 shrink-0" />
                                  <span className="text-slate-600 truncate">{lead.email}</span>
                              </div>
                              {lead.emailStatus === 'Valid' && <div className="w-1 h-1 rounded-full bg-emerald-500"/>}
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-bold">
                              <div className="flex items-center gap-2 truncate">
                                  <Phone size={12} className="text-slate-400 shrink-0" />
                                  <span className="text-slate-600 truncate">{lead.phone}</span>
                              </div>
                              <span className="text-[8px] font-black text-indigo-500 uppercase">{lead.phoneType}</span>
                          </div>
                      </div>

                      {lead.propertyIntelligence ? (
                          <div className="bg-white border-2 border-indigo-50 rounded-2xl p-4 mb-4 group/prop hover:border-indigo-100 transition-colors">
                              <div className="flex justify-between items-center mb-3">
                                  <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5"><ShieldCheck size={12}/> Property Intel</p>
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                      lead.propertyIntelligence.aiSellPrediction === 'High' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                  }`}>
                                      Sell Chance: {lead.propertyIntelligence.aiSellPrediction}
                                  </span>
                              </div>
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                  <div>
                                      <p className="text-[8px] text-slate-400 font-bold uppercase">Equity Est.</p>
                                      <p className="text-sm font-black text-slate-800">${(lead.propertyIntelligence.estimatedValue! - lead.propertyIntelligence.mortgageBalance!).toLocaleString()}</p>
                                  </div>
                                  <div>
                                      <p className="text-[8px] text-slate-400 font-bold uppercase">Equity %</p>
                                      <p className="text-sm font-black text-emerald-600">{lead.propertyIntelligence.equityPercent}%</p>
                                  </div>
                              </div>
                              <p className="text-[10px] text-slate-500 italic leading-relaxed border-l-2 border-indigo-100 pl-2">"{lead.propertyIntelligence.aiSellReason}"</p>
                          </div>
                      ) : !lead.dncEnabled && lead.propertyAddress && (
                          <button 
                            onClick={() => handleEnrichProperty(lead)}
                            className="w-full mb-4 py-3 bg-indigo-50 border border-dashed border-indigo-200 text-indigo-600 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all"
                          >
                            {isEnrichingProperty ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>}
                            Enrich Property Intelligence
                          </button>
                      )}

                      <div className="flex gap-3">
                          <button 
                            onClick={() => setSelectedLead(lead)} 
                            disabled={lead.dncEnabled}
                            className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-lg ${
                                lead.dncEnabled ? 'bg-slate-300 text-white cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}>
                                {lead.dncEnabled ? 'Blocked' : 'View Full Profile'}
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {selectedLead && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-6">
              <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full h-[80vh] overflow-hidden animate-scale-in flex flex-col">
                  <div className={`p-8 text-white flex justify-between items-center shrink-0 ${selectedLead.dncEnabled ? 'bg-red-600' : 'bg-slate-900'}`}>
                      <div className="flex items-center gap-6">
                          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center font-black text-2xl border shadow-xl ${selectedLead.dncEnabled ? 'bg-white/20 border-white/30' : 'bg-white/10 border-white/10'}`}>
                            {selectedLead.name[0]}
                          </div>
                          <div>
                              <h3 className="text-2xl font-black uppercase tracking-tight italic">{selectedLead.name}</h3>
                              <p className={`font-black text-[10px] uppercase tracking-widest flex items-center gap-2 ${selectedLead.dncEnabled ? 'text-red-100' : 'text-indigo-400'}`}>
                                  {selectedLead.dncEnabled ? <Ban size={12}/> : null}
                                  {selectedLead.dncEnabled ? 'DO NOT CONTACT - OPTED OUT' : selectedLead.propertyAddress || 'No Address Logged'}
                              </p>
                          </div>
                      </div>
                      <button onClick={() => setSelectedLead(null)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X size={24} /></button>
                  </div>
                  
                  <div className="flex-1 flex overflow-hidden">
                      <div className="w-64 bg-slate-50 border-r border-slate-100 p-6 space-y-2 shrink-0">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Intelligence Modes</p>
                          {[
                              { id: 'profiling', label: 'Persona Profile', icon: User },
                              { id: 'property', label: 'Property Intel', icon: Home },
                              { id: 'strategy', label: 'Growth Strategy', icon: Target }
                          ].map(tab => (
                              <button 
                                key={tab.id}
                                onClick={() => setActiveLeadTab(tab.id as any)}
                                disabled={selectedLead.dncEnabled && tab.id === 'strategy'}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeLeadTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white hover:shadow-sm'
                                } ${selectedLead.dncEnabled && tab.id === 'strategy' ? 'opacity-30 cursor-not-allowed' : ''}`}
                              >
                                  <tab.icon size={16} /> {tab.label}
                              </button>
                          ))}
                      </div>

                      <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                          {activeLeadTab === 'profiling' && (
                              <div className="space-y-8 animate-fade-in">
                                  {selectedLead.dncEnabled && (
                                      <div className="bg-red-50 border-2 border-red-200 p-6 rounded-3xl text-red-900 flex items-start gap-4">
                                          <AlertCircle className="text-red-600 shrink-0" size={24} />
                                          <div>
                                              <p className="font-black uppercase tracking-widest text-[10px] mb-1">TCPA Compliance Alert</p>
                                              <p className="text-sm font-bold leading-relaxed">This contact semanticly opted out. Contact buttons have been disabled globally across Dialers, CRM, and SMS sequences to mitigate legal risk.</p>
                                          </div>
                                      </div>
                                  )}
                                  <div className="grid grid-cols-2 gap-6">
                                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Linkedin size={12} className="text-blue-600"/> Professional Identity</p>
                                          <p className="text-sm font-bold text-slate-800 leading-relaxed mb-4 italic">"{selectedLead.socialProfileSummary || 'Digital profile not yet enriched.'}"</p>
                                          <div className="flex items-center justify-between text-[10px] font-black uppercase text-indigo-600 border-t border-slate-200 pt-3">
                                              <span>EST. INCOME</span>
                                              <span>{selectedLead.estimatedIncome || 'N/A'}</span>
                                          </div>
                                      </div>
                                      <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
                                          <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Sparkles size={12}/> AI Personality Tip</p>
                                          <p className="text-sm font-medium text-indigo-900 leading-relaxed italic">"{selectedLead.aiPersonalityTip || 'Analyzing behavioral patterns...'}"</p>
                                      </div>
                                  </div>
                                  <div className="bg-white border border-slate-200 rounded-3xl p-8 relative overflow-hidden">
                                      <div className="absolute right-[-20px] top-[-20px] opacity-5 text-indigo-600"><Bot size={120}/></div>
                                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Lead Narrative AI Summary</h4>
                                      <p className="text-base text-slate-700 font-medium leading-relaxed italic">"{selectedLead.aiSummary}"</p>
                                  </div>
                              </div>
                          )}

                          {activeLeadTab === 'property' && (
                              <div className="space-y-6 animate-fade-in">
                                  {selectedLead.propertyIntelligence ? (
                                      <>
                                          <div className="grid grid-cols-3 gap-4">
                                              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm text-center flex flex-col justify-center">
                                                  <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Est. Equity Position</p>
                                                  <h4 className="text-2xl font-black text-emerald-600 tracking-tighter">${(selectedLead.propertyIntelligence.estimatedValue! - selectedLead.propertyIntelligence.mortgageBalance!).toLocaleString()}</h4>
                                              </div>
                                              <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl text-center flex flex-col justify-center border-b-4 border-indigo-600">
                                                  <p className="text-[9px] font-black text-indigo-400 uppercase mb-2">Equity %</p>
                                                  <h4 className="text-3xl font-black tracking-tighter">{selectedLead.propertyIntelligence.equityPercent}%</h4>
                                              </div>
                                              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm text-center flex flex-col justify-center">
                                                  <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Likelihood to Sell</p>
                                                  <span className={`w-fit mx-auto px-4 py-1 rounded-full text-[10px] font-black uppercase ${
                                                      selectedLead.propertyIntelligence.aiSellPrediction === 'High' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'
                                                  }`}>
                                                      {selectedLead.propertyIntelligence.aiSellPrediction} Prediction
                                                  </span>
                                              </div>
                                          </div>

                                          <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 flex gap-6 items-center">
                                              <div className="p-4 bg-white rounded-2xl shadow-sm text-indigo-600"><Bot size={32}/></div>
                                              <div>
                                                  <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">AI Seller Analysis</p>
                                                  <p className="text-lg font-bold text-indigo-900 leading-tight">"{selectedLead.propertyIntelligence.aiSellReason}"</p>
                                              </div>
                                          </div>

                                          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-hidden">
                                              <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
                                                  <Database size={16} className="text-slate-400" />
                                                  <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Enriched Data Matrix (BatchData)</h4>
                                              </div>
                                              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                                  {[
                                                      { label: 'Mortgage Bal', val: `$${selectedLead.propertyIntelligence.mortgageBalance!.toLocaleString()}`, icon: Landmark },
                                                      { label: 'Owner Type', val: selectedLead.propertyIntelligence.ownerStatus, icon: User },
                                                      { label: 'Loan Type', val: selectedLead.propertyIntelligence.loanType, icon: FileText },
                                                      { label: 'Last Sale', val: selectedLead.propertyIntelligence.lastSaleDate, icon: Calendar }
                                                  ].map((item, i) => (
                                                      <div key={i} className="space-y-1">
                                                          <p className="text-[8px] font-black text-slate-400 uppercase flex items-center gap-1.5"><item.icon size={10}/> {item.label}</p>
                                                          <p className="text-sm font-black text-slate-900">{item.val}</p>
                                                      </div>
                                                  ))}
                                              </div>
                                          </div>
                                      </>
                                  ) : (
                                      <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-6">
                                          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 border-2 border-dashed border-slate-200">
                                              <Home size={32}/>
                                          </div>
                                          <div className="max-w-xs">
                                              <h4 className="font-black text-slate-800 uppercase italic">No Property Intelligence.</h4>
                                              <p className="text-xs text-slate-400 font-medium mt-2 leading-relaxed">Add a residential address and run the enrichment protocol to unlock deep equity analysis.</p>
                                          </div>
                                          <button 
                                            onClick={() => handleEnrichProperty(selectedLead)}
                                            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
                                          >
                                              Initialize Enrichment Protocol
                                          </button>
                                      </div>
                                  )}
                              </div>
                          )}

                          {activeLeadTab === 'strategy' && (
                              <div className="space-y-8 animate-fade-in">
                                  <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border-b-8 border-indigo-600">
                                      <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Target size={180}/></div>
                                      <div className="relative z-10 max-lg">
                                          <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2">Automated Hook</h4>
                                          <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-4 leading-tight">Drafted for immediate SMS/Email outreach.</h3>
                                          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg italic text-slate-200 font-medium leading-relaxed">
                                              "{selectedLead.aiSuggestedOpeningLine}"
                                          </div>
                                      </div>
                                      <button className="relative z-10 w-full md:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-indigo-50 active:scale-95 transition-all flex items-center justify-center gap-3">
                                          <Send size={18}/> Push Outreach
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

export default CRM;
