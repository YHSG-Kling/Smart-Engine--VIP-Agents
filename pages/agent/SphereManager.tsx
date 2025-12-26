
import React, { useState } from 'react';
import { 
  Users, Gift, Star, Share2, MessageSquare, 
  Send, Calendar, Heart, Award, RefreshCw,
  MoreHorizontal, ShoppingBag, TrendingUp, CheckCircle2, ChevronRight,
  Loader2, Sparkles, AlertTriangle, UserCheck, MessageCircle, Info,
  Bot, Zap, Kanban as KanbanIcon, List as ListIcon, Plus
} from 'lucide-react';
import { PastClient, Review, ReviewAndFeedback, ClientReferral } from '../../types';
import { n8nService } from '../../services/n8n';
import { GoogleGenAI } from "@google/genai";

const SphereManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'network' | 'reviews' | 'gifts' | 'redemptions' | 'tracker' | 'referral-leads'>('tracker');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Workflow 142: Referral Leads Tracker
  const [referralLeads, setReferralLeads] = useState<ClientReferral[]>([
      { id: 'ref1', referrerId: 'c1', referrerName: 'Alice Freeman', friendName: 'David Wood', friendPhone: '512-555-0810', status: 'New', rewardStatus: 'Pending', rewardType: '$100 Amazon Card', timestamp: 'Today, 2:00 PM', notes: 'Looking to sell in West Lake.' },
      { id: 'ref2', referrerId: 'c2', referrerName: 'The Johnson Family', friendName: 'Sarah Jenkins', friendPhone: '512-555-0911', status: 'Contacted', rewardStatus: 'Pending', rewardType: 'Designer Vase', timestamp: 'Yesterday', notes: 'First time buyer.' },
  ]);

  // Workflow 141: Review Request Tracker State
  const [reviewTracker, setReviewTracker] = useState<ReviewAndFeedback[]>([
    { id: 'rt1', transactionId: 'd1', clientName: 'Alice Freeman', agentName: 'Sarah Smith', internalRating: 5, status: 'Requested', giftSent: false, timestamp: 'Oct 30', sentimentTrend: 'Euphoric' },
    { id: 'rt2', transactionId: 'd2', clientName: 'Bob Driller', agentName: 'Sarah Smith', internalRating: 3, status: 'Nurture Mode', giftSent: false, timestamp: 'Oct 28', sentimentTrend: 'Rocky', feedbackText: 'Closing felt rushed and disorganized.' },
    { id: 'rt3', transactionId: 'd3', clientName: 'Charlie Day', agentName: 'Sarah Smith', internalRating: 5, status: 'Received', giftSent: true, timestamp: 'Oct 25', sentimentTrend: 'Positive', publicReviewLink: 'https://g.page/nexus/review' },
  ]);

  // Mock Data: Sphere/Past Clients
  const [clients, setClients] = useState<PastClient[]>([
    { 
      id: '1', name: 'The Johnson Family', closingDate: 'Oct 2022', homeAnniversary: 'Oct 15', 
      referralsSent: 3, lastTouch: '2 weeks ago', giftStatus: 'Sent', reviewStatus: 'Received',
      children: [
        { id: '1a', name: 'Mike (Brother)', closingDate: 'Jan 2023', homeAnniversary: 'Jan 10', referralsSent: 0, lastTouch: '1 mo ago', giftStatus: 'None', reviewStatus: 'Requested' },
        { id: '1b', name: 'Sarah (Colleague)', closingDate: 'Pending', homeAnniversary: '', referralsSent: 1, lastTouch: 'Yesterday', giftStatus: 'None', reviewStatus: 'None' }
      ]
    },
    { 
      id: '2', name: 'Alice Chen', closingDate: 'Mar 2023', homeAnniversary: 'Mar 02', 
      referralsSent: 0, lastTouch: '3 mos ago', giftStatus: 'None', reviewStatus: 'Requested' 
    }
  ]);

  // Workflow 85: Referral Tracker State
  const [redemptions] = useState([
    { id: 'red1', client: 'Alice Chen', vendor: 'PoolKings', service: 'Pool Maintenance', date: 'Just Now', status: 'Redeemed' },
    { id: 'red2', client: 'The Johnson Family', vendor: 'CoolAir Inc', service: 'HVAC Tuning', date: 'Yesterday', status: 'Redeemed' },
  ]);

  const [reviews, setReviews] = useState<Review[]>([
    { id: 'r1', clientName: 'The Johnson Family', platform: 'Google', rating: 5, text: "Best agent ever! Saved us $10k.", date: '2 days ago', status: 'Pending' },
    { id: 'r2', clientName: 'Bob Smith', platform: 'Zillow', rating: 4, text: "Great service, but inspection was rocky.", date: '1 week ago', status: 'Replied' }
  ]);

  const handleManualNudge = async (rv: ReviewAndFeedback) => {
    setIsProcessing(rv.id);
    
    if (process.env.API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Rewrite a polite real estate review request SMS for ${rv.clientName}. 
        Context: They gave us an internal 5-star rating yesterday. 
        Agent: ${rv.agentName}. 
        Tone: Personal, low-pressure, euphoric. 
        Include a placeholder for the link. 
        Limit: 140 chars.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ parts: [{ text: prompt }] }]
        });
        
        const text = response.text || "Just checking in!";
        alert(`AI Drafted Nudge: "${text}"\n\nNudge dispatched via Twilio.`);
    } else {
        await new Promise(r => setTimeout(r, 1000));
        alert(`Nexus SMS: Nudge dispatched to ${rv.clientName}.`);
    }

    setIsProcessing(null);
  };

  const handleSendReferralGift = async (id: string) => {
      setIsProcessing(id);
      // Integration with Snappy/Loop & Tie simulated
      await new Promise(r => setTimeout(r, 1500));
      setReferralLeads(prev => prev.map(r => r.id === id ? { ...r, rewardStatus: 'Sent' } : r));
      setIsProcessing(null);
      alert("Gift Engine: Referral reward dispatched via Loop & Tie.");
  };

  const handleSendGift = async (clientId: string) => {
    if (confirm("Send 'Home Anniversary' Gift Box ($50)?")) {
      await n8nService.sendGift(clientId, 'gift_anniversary_standard');
      alert("Gift Ordered! Tracking info will be emailed to you.");
      setClients(prev => prev.map(c => c.id === clientId ? { ...c, giftStatus: 'Sent' } : c));
    }
  };

  const handleRequestReview = async (clientId: string) => {
    await n8nService.requestReview(clientId, 'google');
    alert("AI-drafted review request sent via SMS & Email.");
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, reviewStatus: 'Requested' } : c));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 uppercase italic tracking-tighter">Past Client Center.</h2>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">Post-Close Retention & Review Velocity</p>
        </div>
        <div className="flex bg-white rounded-xl p-1 border border-slate-200 overflow-x-auto max-w-full scrollbar-hide shadow-sm">
          <button 
            onClick={() => setActiveTab('tracker')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === 'tracker' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Star size={16} /> Review Tracker
          </button>
          <button 
            onClick={() => setActiveTab('referral-leads')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === 'referral-leads' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Share2 size={16} /> Referral Network
          </button>
          <button 
            onClick={() => setActiveTab('network')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === 'network' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Users size={16} /> Client Tree
          </button>
          <button 
            onClick={() => setActiveTab('redemptions')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === 'redemptions' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <ShoppingBag size={16} /> Marketplace
          </button>
        </div>
      </div>

      {/* --- WORKFLOW 142: REFERRAL LEADS TRACKER (VIEW B) --- */}
      {activeTab === 'referral-leads' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-slate-900 rounded-[2rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Share2 size={180}/></div>
                  <div className="relative z-10">
                      <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-4 leading-none">Referral Network.</h3>
                      <p className="text-indigo-100 text-lg font-medium opacity-90 leading-relaxed max-w-2xl">
                          Turning happy clients into high-intent lead sources. The AI (Workflow 142) autonomously identifies referral intent in check-in conversations and bridges the warm handoff via Gemini SMS intro.
                      </p>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {['New', 'Contacted', 'Closed Deal'].map(colStatus => (
                    <div key={colStatus} className="bg-slate-100/50 rounded-[2rem] p-4 border border-slate-200/50 flex flex-col h-[600px]">
                        <div className="flex justify-between items-center px-4 py-2 mb-4">
                            <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{colStatus}</h4>
                            <span className="bg-white px-2 py-0.5 rounded-full text-[9px] font-black text-slate-400 border border-slate-100 shadow-sm">{referralLeads.filter(r => r.status === colStatus).length}</span>
                        </div>
                        <div className="space-y-4 overflow-y-auto scrollbar-hide">
                            {referralLeads.filter(r => r.status === colStatus).map(lead => (
                                <div key={lead.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm group hover:border-indigo-400 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black italic shadow-inner">
                                            {lead.friendName[0]}
                                        </div>
                                        <button className="text-slate-300 hover:text-slate-500"><MoreHorizontal size={14}/></button>
                                    </div>
                                    <h5 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">{lead.friendName}</h5>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Ref by: <span className="text-indigo-600">{lead.referrerName}</span></p>
                                    
                                    {lead.notes && (
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 italic text-[10px] text-slate-500 leading-relaxed">
                                            "{lead.notes}"
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-slate-50 flex flex-col gap-3">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[8px] font-black text-slate-400 uppercase">Reward Status</p>
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${
                                                lead.rewardStatus === 'Sent' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                                            }`}>{lead.rewardStatus}</span>
                                        </div>
                                        {lead.rewardStatus === 'Pending' && (
                                            <button 
                                                onClick={() => handleSendReferralGift(lead.id)}
                                                disabled={isProcessing === lead.id}
                                                className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black shadow-lg transition-all flex items-center justify-center gap-2"
                                            >
                                                {isProcessing === lead.id ? <Loader2 size={12} className="animate-spin"/> : <Gift size={12}/>}
                                                Dispatch Reward
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
              </div>
          </div>
      )}

      {/* --- WORKFLOW 141: REVIEW REQUEST TRACKER (VIEW B) --- */}
      {activeTab === 'tracker' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-slate-900 rounded-[2rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Star size={180}/></div>
                  <div className="relative z-10 max-w-2xl">
                      <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-4 leading-none">Review Velocity.</h3>
                      <p className="text-indigo-100 text-lg font-medium opacity-90 leading-relaxed">
                          Capitalize on the post-close euphoric peak. Nexus AI (Workflow 141) monitors closing sentiment and automates direct review requests for 5-star experiences, while routing rocky closings to internal feedback.
                      </p>
                  </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                      <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                        <CheckSquare size={18} className="text-indigo-600" /> Recent Closings Audit
                      </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-8">Client Entity</th>
                                <th className="p-8">Internal Rating</th>
                                <th className="p-8">AI Strategy</th>
                                <th className="p-8">Status</th>
                                <th className="p-8 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                            {reviewTracker.map(rv => (
                                <tr key={rv.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-8">
                                        <div className="font-black text-slate-900 uppercase tracking-tight">{rv.clientName}</div>
                                        <div className="text-[8px] text-slate-400 uppercase font-black mt-1">Closed {rv.timestamp}</div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-2">
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} fill={i < rv.internalRating ? "currentColor" : "none"} className={i < rv.internalRating ? "text-yellow-400" : "text-slate-200"} />
                                                ))}
                                            </div>
                                            <span className={`text-[10px] font-black ${rv.internalRating >= 5 ? 'text-emerald-600' : 'text-slate-400'}`}>{rv.internalRating}/5</span>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl max-w-xs">
                                            <p className="text-[9px] text-indigo-700 leading-relaxed italic flex items-center gap-1.5">
                                                <Bot size={12}/> Mode: {rv.status === 'Nurture Mode' ? 'Salvage' : 'Blitz'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${
                                            rv.status === 'Received' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            rv.status === 'Requested' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                            'bg-orange-50 text-orange-700 border-orange-100'
                                        }`}>
                                            {rv.status}
                                        </span>
                                    </td>
                                    <td className="p-8 text-right">
                                        {rv.status === 'Requested' && (
                                            <button 
                                                onClick={() => handleManualNudge(rv)}
                                                disabled={isProcessing === rv.id}
                                                className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2 ml-auto"
                                            >
                                                {isProcessing === rv.id ? <Loader2 size={12} className="animate-spin"/> : <Zap size={12}/>}
                                                Manual Nudge
                                            </button>
                                        )}
                                        {rv.status === 'Nurture Mode' && (
                                            <button className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all flex items-center gap-2 ml-auto">
                                                <MessageCircle size={12}/> Check-In
                                            </button>
                                        )}
                                        {rv.status === 'Received' && (
                                            <div className="flex justify-end gap-2">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Gift size={10}/> {rv.giftSent ? 'GIFT SENT' : 'PENDING GIFT'}</span>
                                                <button className="p-1.5 bg-slate-50 text-slate-300 hover:text-indigo-600 rounded-lg"><ExternalLink size={14}/></button>
                                            </div>
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

      {/* Referral Tree Visualization */}
      {activeTab === 'network' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
          {clients.map(client => (
            <div key={client.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Users size={100} />
              </div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">
                    {client.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{client.name}</h3>
                    <p className="text-sm text-slate-500">Closed: {client.closingDate}</p>
                  </div>
                </div>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-emerald-600">{client.referralsSent}</span>
                  <span className="text-xs text-slate-400 uppercase font-bold">Referrals</span>
                </div>
              </div>

              {/* Connected Nodes */}
              {client.children && client.children.length > 0 && (
                <div className="ml-6 pl-6 border-l-2 border-slate-200 space-y-4 relative z-10">
                  {client.children.map(child => (
                    <div key={child.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-200 text-xs font-bold text-slate-600">
                          {child.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{child.name}</p>
                          <p className="text-xs text-slate-500">{child.closingDate === 'Pending' ? 'Active Lead' : `Closed ${child.closingDate}`}</p>
                        </div>
                      </div>
                      {child.closingDate !== 'Pending' && (
                        <Award size={16} className="text-amber-500" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                <button 
                  onClick={() => handleSendGift(client.id)}
                  disabled={client.giftStatus === 'Sent'}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Gift size={14} /> {client.giftStatus === 'Sent' ? 'Gift Sent' : 'Send Gift'}
                </button>
                <button className="flex-1 bg-indigo-50 text-indigo-700 py-2 rounded-lg text-sm font-bold hover:bg-indigo-100 flex items-center justify-center gap-2">
                  <MessageSquare size={14} /> Reactivate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Workflow 85: Referral Redemptions */}
      {activeTab === 'redemptions' && (
        <div className="space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Marketplace Leads</p>
                        <h3 className="text-2xl font-black text-slate-800">42</h3>
                    </div>
                    <ShoppingBag size={24} className="text-indigo-600 opacity-20" />
                </div>
                <div className="bg-indigo-600 p-5 rounded-xl shadow-xl text-white flex items-center justify-between overflow-hidden relative">
                    <div className="relative z-10">
                        <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">Conversion Rate</p>
                        <h3 className="text-2xl font-black">28.4%</h3>
                    </div>
                    <TrendingUp size={48} className="absolute right-[-10px] bottom-[-10px] opacity-10" />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-widest">My Clients' Redemptions</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {redemptions.map(red => (
                        <div key={red.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                    <CheckCircle2 size={20} />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">{red.client}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Used <span className="text-indigo-600">{red.vendor}</span> for {red.service}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase">{red.date}</p>
                                <button className="mt-1 text-[9px] font-black text-indigo-600 uppercase flex items-center gap-1 hover:underline">Reach Out <ChevronRight size={10}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// UI Components
const CheckSquare = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
);

const ExternalLink = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
);

export default SphereManager;
