
import React, { useState } from 'react';
import { 
  Handshake, Send, DollarSign, Clock, CheckCircle2, 
  MapPin, User, Building, Landmark, Star, ArrowRight,
  TrendingUp, Wallet, ShieldCheck, Info, X, RefreshCw, ChevronRight
} from 'lucide-react';
import { n8nService } from '../../services/n8n';

const ReferralPartnerPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'submit' | 'track'>('submit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
      partnerName: 'Chase Mortgages',
      leadName: '',
      leadEmail: '',
      leadPhone: '',
      budget: 850000,
      area: 'Austin, TX',
      notes: ''
  });

  const mockPartnerStats = {
      referralsSent: 12,
      inEscrow: 2,
      closed: 4,
      totalCommissionEarned: 18500
  };

  const mockMyReferrals = [
      { id: '1', name: 'John Smith', budget: '$850k', area: 'Austin, TX', status: 'In Escrow', date: 'Oct 15' },
      { id: '2', name: 'Alice Freeman', budget: '$1.2M', area: 'Rollingwood', status: 'Closed', date: 'Sept 22' },
      { id: '3', name: 'Bob Driller', budget: '$400k', area: 'East Austin', status: 'New', date: 'Today' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      await n8nService.triggerWorkflow('new-referral-submission', formData);
      setTimeout(() => {
          setIsSubmitting(false);
          alert("Referral Submitted. Nexus AI is matching the best agent now.");
          setFormData({ ...formData, leadName: '', leadEmail: '', leadPhone: '', notes: '' });
      }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col items-center">
      {/* Hero Header */}
      <div className="w-full bg-slate-900 text-white p-12 flex flex-col items-center text-center relative overflow-hidden border-b-8 border-indigo-600">
          <div className="absolute right-0 top-0 p-12 opacity-10 rotate-12"><Handshake size={200}/></div>
          <div className="relative z-10 max-w-2xl">
              <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-4 leading-none">Referral Partner <br/> Command.</h1>
              <p className="text-indigo-200 text-lg font-medium opacity-90 leading-relaxed mb-8">Direct interface for Nexus Strategic Partners. High-velocity lead ingestion & transparent tracking.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                      { label: 'SENT', val: mockPartnerStats.referralsSent, icon: Send },
                      { label: 'ESCROW', val: mockPartnerStats.inEscrow, icon: Clock },
                      { label: 'CLOSED', val: mockPartnerStats.closed, icon: CheckCircle2 },
                      { label: 'COMMISSION', val: `$${(mockPartnerStats.totalCommissionEarned/1000).toFixed(1)}k`, icon: Wallet }
                  ].map(stat => (
                      <div key={stat.label} className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
                          <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">{stat.label}</p>
                          <p className="text-xl font-black">{stat.val}</p>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-5xl -mt-8 bg-white rounded-t-[3rem] relative z-10 p-10 shadow-2xl flex flex-col md:flex-row gap-12 border-x border-slate-200">
          
          {/* Navigation Sidebar */}
          <div className="w-full md:w-64 space-y-2">
              <button 
                onClick={() => setActiveTab('submit')}
                className={`w-full p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 transition-all ${activeTab === 'submit' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                  <Send size={18}/> Submit Referral
              </button>
              <button 
                onClick={() => setActiveTab('track')}
                className={`w-full p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 transition-all ${activeTab === 'track' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                  <TrendingUp size={18}/> My Referrals
              </button>
              
              <div className="pt-8 space-y-4">
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Landmark size={12}/> Partnership</p>
                    <p className="text-[10px] text-indigo-900 leading-relaxed font-medium">Standard 25% referral fee applies to all successfully closed transactions.</p>
                </div>
              </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 bg-white">
              {activeTab === 'submit' && (
                  <div className="space-y-8 animate-fade-in-up">
                      <div className="border-b border-slate-100 pb-6">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Ingest New Referral.</h2>
                        <p className="text-slate-400 text-sm font-medium">Nexus AI will match this profile to our highest performing agent in the target area.</p>
                      </div>

                      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Lead Name</label>
                              <input 
                                required
                                value={formData.leadName}
                                onChange={e => setFormData({...formData, leadName: e.target.value})}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
                                placeholder="Full Name"
                              />
                          </div>
                          <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Contact Email</label>
                              <input 
                                required
                                type="email"
                                value={formData.leadEmail}
                                onChange={e => setFormData({...formData, leadEmail: e.target.value})}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
                                placeholder="Email Address"
                              />
                          </div>
                          <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Target Zip/Area</label>
                              <div className="relative">
                                <input 
                                    required
                                    value={formData.area}
                                    onChange={e => setFormData({...formData, area: e.target.value})}
                                    className="w-full p-4 pl-11 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
                                />
                                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                              </div>
                          </div>
                          <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Price Point</label>
                              <div className="relative">
                                <input 
                                    type="number"
                                    value={formData.budget}
                                    onChange={e => setFormData({...formData, budget: parseInt(e.target.value)})}
                                    className="w-full p-4 pl-11 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
                                />
                                <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                              </div>
                          </div>
                          <div className="md:col-span-2 space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Personality Notes / Criteria</label>
                              <textarea 
                                value={formData.notes}
                                onChange={e => setFormData({...formData, notes: e.target.value})}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none h-32" 
                                placeholder="Describe their needs, timeline, or vibe for AI Matching..."
                              />
                          </div>
                          <div className="md:col-span-2 pt-4">
                              <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.25em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 border-b-4 border-indigo-600 disabled:opacity-50"
                              >
                                  {isSubmitting ? <RefreshCw className="animate-spin" size={18}/> : <Send size={18}/>}
                                  Initialize AI Assignment
                              </button>
                          </div>
                      </form>
                  </div>
              )}

              {activeTab === 'track' && (
                  <div className="animate-fade-in space-y-6">
                      <div className="flex justify-between items-center mb-8">
                         <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Referral Ledger.</h2>
                         <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1"><Info size={14}/> Commission Guide</button>
                      </div>

                      <div className="space-y-4">
                          {mockMyReferrals.map(ref => (
                              <div key={ref.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between hover:border-indigo-400 transition-all shadow-sm group">
                                  <div className="flex items-center gap-6">
                                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
                                          {ref.name.split(' ').map(n => n[0]).join('')}
                                      </div>
                                      <div>
                                          <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">{ref.name}</h4>
                                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{ref.budget} • {ref.area}</p>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-8">
                                      <div className="text-right">
                                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                                              ref.status === 'Closed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                              ref.status === 'In Escrow' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                              'bg-slate-50 text-slate-500 border-slate-200'
                                          }`}>
                                              {ref.status}
                                          </span>
                                          <p className="text-[8px] text-slate-400 font-black uppercase mt-2 tracking-widest">Added: {ref.date}</p>
                                      </div>
                                      <ChevronRight size={20} className="text-slate-200 group-hover:text-indigo-600 transition-colors" />
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      </div>

      <div className="py-12 flex items-center justify-center gap-2 text-slate-400">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-widest">V2 Secure Portal • End-to-End Encryption</span>
      </div>
    </div>
  );
};

export default ReferralPartnerPortal;
