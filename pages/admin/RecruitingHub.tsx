
import React, { useState, useMemo } from 'react';
import { 
  UserPlus, Users, TrendingUp, BarChart3, 
  Search, Filter, Plus, ChevronRight, 
  Clock, CheckCircle2, ShieldCheck, Mail, 
  Phone, Bot, Sparkles, Send, RefreshCw, 
  Trophy, DollarSign, Target, Briefcase, 
  Award, ArrowUpRight, Zap, Loader2, X,
  // Added ArrowRight to fix the "Cannot find name 'ArrowRight'" error
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, Recruit } from '../../types';
import { n8nService } from '../../services/n8n';

const RecruitingHub: React.FC = () => {
  const { role, user } = useAuth();
  const isAdmin = role === UserRole.ADMIN || role === UserRole.BROKER;
  const isAgent = role === UserRole.AGENT;

  const [activeTab, setActiveTab] = useState<'funnel' | 'my-recruits' | 'leaderboard' | 'refer'>(isAgent ? 'refer' : 'funnel');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock Recruits Data
  const [recruits, setRecruits] = useState<Recruit[]>([
    { id: 'rec1', name: 'John Doe', email: 'john.d@example.com', phone: '512-555-1001', status: 'Interviewing', sourceAgentId: 'agent_1', sourceAgentName: 'Sarah Smith', experienceYears: 5, lastProductionVolume: 4200000, timestamp: '2d ago' },
    { id: 'rec2', name: 'Jane Miller', email: 'jane.m@example.com', phone: '512-555-1002', status: 'Joined', sourceAgentId: 'agent_1', sourceAgentName: 'Sarah Smith', experienceYears: 8, lastProductionVolume: 12500000, timestamp: '1mo ago' },
    { id: 'rec3', name: 'Mike Ross', email: 'mike.r@example.com', phone: '512-555-1003', status: 'Offered', sourceAgentId: 'agent_2', sourceAgentName: 'Mike Ross', experienceYears: 2, lastProductionVolume: 1500000, timestamp: '1w ago' },
    { id: 'rec4', name: 'Jessica Pearson', email: 'jess.p@example.com', phone: '512-555-1004', status: 'Applied', sourceAgentId: 'agent_1', sourceAgentName: 'Sarah Smith', experienceYears: 15, lastProductionVolume: 35000000, timestamp: 'Today' },
  ]);

  const [referralForm, setReferralForm] = useState({
      name: '',
      email: '',
      phone: '',
      experience: '2-5 years',
      notes: ''
  });

  const handleReferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    const newRecruit: Recruit = {
        id: `rec_${Date.now()}`,
        name: referralForm.name,
        email: referralForm.email,
        phone: referralForm.phone,
        status: 'Lead',
        sourceAgentId: user?.id || 'agent_1',
        sourceAgentName: user?.name || 'Current Agent',
        experienceYears: parseInt(referralForm.experience),
        timestamp: 'Just Now',
        notes: referralForm.notes
    };

    // Workflow Trigger Simulation
    await n8nService.triggerWorkflow('agent-recruiting-referral', newRecruit);
    
    setTimeout(() => {
        setRecruits(prev => [newRecruit, ...prev]);
        setReferralForm({ name: '', email: '', phone: '', experience: '2-5 years', notes: '' });
        setIsProcessing(false);
        setActiveTab('my-recruits');
        alert("Referral Protocol Initialized: Admin notified. Candidate prioritized in the funnel.");
    }, 1200);
  };

  const filteredRecruits = useMemo(() => {
    let base = isAgent ? recruits.filter(r => r.sourceAgentId === (user?.id || 'agent_1')) : recruits;
    if (searchQuery) {
        base = base.filter(r => 
            r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.sourceAgentName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    return base;
  }, [recruits, isAgent, user, searchQuery]);

  const recruiterLeaderboard = useMemo(() => {
    const counts: Record<string, { count: number, joined: number }> = {};
    recruits.forEach(r => {
        if (!counts[r.sourceAgentName]) counts[r.sourceAgentName] = { count: 0, joined: 0 };
        counts[r.sourceAgentName].count++;
        if (r.status === 'Joined') counts[r.sourceAgentName].joined++;
    });
    return Object.entries(counts)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.joined - a.joined || b.count - a.count);
  }, [recruits]);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">Recruiting Hub.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Expansion & Talent Acquisition Desk</p>
        </div>
        <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm overflow-x-auto max-w-full scrollbar-hide">
            {isAdmin && (
                <button onClick={() => setActiveTab('funnel')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'funnel' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                    <Target size={14}/> Full Funnel
                </button>
            )}
            {isAgent && (
                <button onClick={() => setActiveTab('refer')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'refer' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <UserPlus size={14}/> Refer Agent
                </button>
            )}
            <button onClick={() => setActiveTab('my-recruits')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'my-recruits' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                <Users size={14}/> {isAgent ? 'My Recruits' : 'All Candidates'}
            </button>
            {isAdmin && (
                <button onClick={() => setActiveTab('leaderboard')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'leaderboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                    <Trophy size={14}/> Recruiters
                </button>
            )}
        </div>
      </div>

      {/* --- DASHBOARD VIEW: ADMIN FUNNEL --- */}
      {activeTab === 'funnel' && isAdmin && (
          <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl border-b-8 border-indigo-600 relative overflow-hidden group">
                      <div className="absolute right-[-10px] bottom-[-10px] opacity-10 group-hover:scale-110 transition-transform"><UserPlus size={100}/></div>
                      <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-1">New Applications (MTD)</p>
                      <h3 className="text-4xl font-black italic tracking-tighter">14</h3>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-2 uppercase"><ArrowUpRight size={12}/> +22% vs Last Mo</span>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">In Pipeline</p>
                      <h3 className="text-3xl font-black text-slate-800 tracking-tight">8</h3>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Conversion Velocity</p>
                      <h3 className="text-3xl font-black text-indigo-600 tracking-tight">18 Days</h3>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Agent Referred %</p>
                      <h3 className="text-3xl font-black text-emerald-600 tracking-tight">64%</h3>
                  </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-md overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-10">
                      <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Zap size={18} className="text-indigo-600" /> High-Intensity Talent Monitor
                      </h3>
                  </div>
                  <div className="p-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                          {recruits.filter(r => r.status === 'Applied' || r.status === 'Interviewing').map(r => (
                              <div key={r.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-indigo-400 hover:bg-white transition-all shadow-sm group">
                                  <div className="flex justify-between items-start mb-4">
                                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center font-black text-xl italic text-slate-400 shadow-sm border border-slate-50">{r.name[0]}</div>
                                      <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-[8px] font-black uppercase border border-indigo-100">{r.status}</span>
                                  </div>
                                  <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm leading-none mb-2 group-hover:text-indigo-600 transition-colors">{r.name}</h4>
                                  <div className="space-y-3 mb-6">
                                      <div className="flex justify-between text-[9px] font-bold uppercase">
                                          <span className="text-slate-400">Exp Level</span>
                                          <span className="text-slate-700">{r.experienceYears} Years</span>
                                      </div>
                                      <div className="flex justify-between text-[9px] font-bold uppercase">
                                          <span className="text-slate-400">Prior Prod</span>
                                          <span className="text-emerald-600">${((r.lastProductionVolume || 0)/1000000).toFixed(1)}M</span>
                                      </div>
                                      <div className="flex justify-between text-[9px] font-bold uppercase">
                                          <span className="text-slate-400">Referred by</span>
                                          <span className="text-indigo-600">{r.sourceAgentName}</span>
                                      </div>
                                  </div>
                                  <button className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2">
                                      Move to Next Stage <ArrowRight size={12}/>
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- AGENT VIEW: REFER AN AGENT --- */}
      {activeTab === 'refer' && isAgent && (
          <div className="max-w-3xl mx-auto animate-fade-in-up">
              <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
                      <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><UserPlus size={180}/></div>
                      <div className="relative z-10">
                          <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-2 leading-none">Agent Referral Engine.</h3>
                          <p className="text-indigo-200 text-lg font-medium opacity-90">Help grow the brokerage and unlock your Tier 2 revenue shares. Refer high-producing talent directly to the broker.</p>
                      </div>
                  </div>

                  <form onSubmit={handleReferSubmit} className="p-10 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Candidate Full Name</label>
                              <input 
                                required
                                value={referralForm.name}
                                onChange={e => setReferralForm({...referralForm, name: e.target.value})}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner" 
                                placeholder="Candidate Name"
                              />
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Email Identity</label>
                              <input 
                                required
                                type="email"
                                value={referralForm.email}
                                onChange={e => setReferralForm({...referralForm, email: e.target.value})}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner" 
                                placeholder="email@address.com"
                              />
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Phone Number</label>
                              <input 
                                value={referralForm.phone}
                                onChange={e => setReferralForm({...referralForm, phone: e.target.value})}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner" 
                                placeholder="512-555-0000"
                              />
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Experience Tier</label>
                              <select 
                                value={referralForm.experience}
                                onChange={e => setReferralForm({...referralForm, experience: e.target.value})}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none cursor-pointer"
                              >
                                  <option>0-2 years</option>
                                  <option>2-5 years</option>
                                  <option>5-10 years</option>
                                  <option>10+ years</option>
                              </select>
                          </div>
                      </div>

                      <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Internal Notes for Broker</label>
                          <textarea 
                            value={referralForm.notes}
                            onChange={e => setReferralForm({...referralForm, notes: e.target.value})}
                            placeholder="Why should we hire them? Known production volume, specialties, current brokerage..."
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner h-32 resize-none" 
                          />
                      </div>

                      <button 
                        type="submit"
                        disabled={isProcessing}
                        className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black uppercase text-sm tracking-[0.25em] shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 border-b-8 border-indigo-900 disabled:opacity-50"
                      >
                          {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                          Submit Referral to Command
                      </button>
                  </form>
              </div>
          </div>
      )}

      {/* --- SHARED VIEW: RECRUITS DIRECTORY --- */}
      {activeTab === 'my-recruits' && (
          <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center px-10 gap-4">
                      <div className="flex items-center gap-4">
                        <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Users size={18} className="text-indigo-600" /> {isAgent ? 'My Referral Pipeline' : 'Global Talent Pool'}
                        </h3>
                        <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100 shadow-sm">{filteredRecruits.length} Entities</span>
                      </div>
                      <div className="relative w-full md:w-80">
                         <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                         <input 
                            type="text" 
                            placeholder="SEARCH CANDIDATES..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner" 
                         />
                      </div>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                              <tr>
                                  <th className="p-8">Candidate Entity</th>
                                  <th className="p-8">Production Data</th>
                                  <th className="p-8">Filing Agent</th>
                                  <th className="p-8">Pipeline State</th>
                                  <th className="p-8 text-right">Timestamp</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                              {filteredRecruits.map(r => (
                                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                                      <td className="p-8">
                                          <div className="font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{r.name}</div>
                                          <div className="text-[9px] text-slate-400 lowercase">{r.email}</div>
                                      </td>
                                      <td className="p-8">
                                          <div className="flex items-center gap-2">
                                              <span className="text-slate-600 uppercase">Exp:</span>
                                              <span className="text-slate-900">{r.experienceYears}y</span>
                                              <div className="w-px h-3 bg-slate-200 mx-1" />
                                              <span className="text-emerald-600 font-black">${((r.lastProductionVolume || 0)/1000000).toFixed(1)}M</span>
                                          </div>
                                      </td>
                                      <td className="p-8">
                                          <span className="font-black text-indigo-600 uppercase italic tracking-tight">{r.sourceAgentName}</span>
                                      </td>
                                      <td className="p-8">
                                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${
                                              r.status === 'Joined' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                              r.status === 'Lead' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                              'bg-slate-50 text-slate-500 border-slate-200'
                                          }`}>
                                              {r.status}
                                          </span>
                                      </td>
                                      <td className="p-8 text-right text-slate-400 uppercase font-black tabular-nums">{r.timestamp}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}

      {/* --- ADMIN ONLY: LEADERBOARD --- */}
      {activeTab === 'leaderboard' && isAdmin && (
          <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recruiterLeaderboard.map((recruiter, i) => (
                      <div key={recruiter.name} className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm flex items-center justify-between group hover:border-indigo-400 transition-all">
                          <div className="flex items-center gap-6">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl italic ${
                                  i === 0 ? 'bg-yellow-400 text-slate-900 shadow-lg' : 'bg-slate-100 text-slate-400'
                              }`}>
                                  {i + 1}
                              </div>
                              <div>
                                  <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg leading-none mb-1 group-hover:text-indigo-600 transition-colors">{recruiter.name}</h4>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{recruiter.count} Referrals • {recruiter.joined} Joined</p>
                              </div>
                          </div>
                          <div className="text-right">
                                <div className="text-2xl font-black text-indigo-600 italic">{recruiter.joined}</div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Successful</p>
                          </div>
                      </div>
                  ))}
              </div>
              
              <div className="bg-indigo-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600 flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="absolute right-0 top-0 p-8 opacity-5"><DollarSign size={220}/></div>
                  <div className="relative z-10 max-w-xl">
                      <p className="text-indigo-400 text-sm font-black uppercase tracking-[0.3em] mb-4">Financial Protocol</p>
                      <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-4 leading-none">Tier 2 Overrides.</h2>
                      <p className="text-indigo-100 text-lg font-medium opacity-90 leading-relaxed mb-8">
                          The current recruiting incentive model is set to <strong className="text-white underline">Tier 2 Override</strong>. Referrers receive a 5% GCI bonus on every closing from their recruits for the first 12 months.
                      </p>
                      <button className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-50 active:scale-95 transition-all">Recruiting Payout Schedule</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default RecruitingHub;
