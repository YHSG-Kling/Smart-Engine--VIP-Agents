
import React, { useState } from 'react';
// Fixed missing RefreshCw import
import { 
  Users, UserPlus, ShieldAlert, Key, 
  Search, Filter, ChevronRight, MoreVertical,
  CheckCircle2, XCircle, Clock, Upload, 
  Download, FileText, Loader2, Sparkles, Bot,
  Mail, ShieldCheck, Database, Ban, RefreshCw
} from 'lucide-react';
import { PortalUser, UserRole } from '../../types';
import { n8nService } from '../../services/n8n';

const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'directory' | 'bulk'>('directory');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Workflow 132 Mock Data
  const [users, setUsers] = useState<PortalUser[]>([
    { id: 'u1', name: 'Alice Freeman', email: 'alice@gmail.com', role: 'Buyer', onboardingStatus: 'Invited', linkedDealId: 'd1', lastLogin: 'Never' },
    { id: 'u2', name: 'Bob Driller', email: 'bob@invest.io', role: 'Seller', onboardingStatus: 'Logged In', linkedDealId: 'd2', lastLogin: '2h ago' },
    { id: 'u3', name: 'Charlie Day', email: 'charlie@iasip.com', role: 'Vendor', onboardingStatus: 'Completed Setup', linkedDealId: 'd1', lastLogin: '1d ago' },
    { id: 'u4', name: 'Diane Court', email: 'diane@sayanything.com', role: 'Buyer', onboardingStatus: 'Suspended', linkedDealId: 'd3', lastLogin: '3d ago' },
  ]);

  const handleStatusChange = (id: string, newStatus: PortalUser['onboardingStatus']) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, onboardingStatus: newStatus } : u));
    alert(`User status updated to ${newStatus}.`);
  };

  const handleResetPassword = async (user: PortalUser) => {
    setIsProcessing(user.id);
    await n8nService.grantPortalAccess(user.email, user.role, user.linkedDealId || '', user.name);
    setTimeout(() => {
        setIsProcessing(null);
        alert(`Magic Link resent to ${user.email}. Workflow 132 executed.`);
    }, 1000);
  };

  const handleBulkInvite = async () => {
      setIsProcessing('bulk');
      // Simulated processing
      await new Promise(r => setTimeout(r, 2500));
      setIsProcessing(null);
      alert("Batch Success: 42 users invited. AI onboarding personalized for each role.");
  };

  const filteredUsers = users.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">User Governance.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Workflow 132: Role-Based Provisioning</p>
        </div>
        <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm overflow-x-auto max-w-full scrollbar-hide">
            <button onClick={() => setActiveTab('directory')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'directory' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                <Users size={14}/> User Directory
            </button>
            <button onClick={() => setActiveTab('bulk')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'bulk' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                <Database size={14}/> Bulk Invite
            </button>
        </div>
      </div>

      {activeTab === 'directory' && (
          <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="relative w-full md:w-80">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-3 h-3" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="FILTER DIRECTORY..." 
                        className="w-full pl-9 pr-4 py-1.5 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest focus:ring-1 focus:ring-indigo-500 outline-none" 
                      />
                  </div>
                  <button className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 active:scale-95 transition-all">
                      <UserPlus size={14} /> Add Manual User
                  </button>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                  <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          <tr>
                              <th className="p-8">Identity</th>
                              <th className="p-8">Portal Role</th>
                              <th className="p-8">Linked Entity</th>
                              <th className="p-8">Onboarding State</th>
                              <th className="p-8 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                          {filteredUsers.map(user => (
                              <tr key={user.id} className={`hover:bg-slate-50 transition-colors ${user.onboardingStatus === 'Suspended' ? 'opacity-50' : ''}`}>
                                  <td className="p-8">
                                      <div className="font-black text-slate-900 uppercase tracking-tight">{user.name}</div>
                                      <div className="text-[9px] text-slate-400 font-bold lowercase">{user.email}</div>
                                  </td>
                                  <td className="p-8">
                                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${
                                          user.role === 'Buyer' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                          user.role === 'Seller' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                          'bg-indigo-50 text-indigo-700 border-indigo-100'
                                      }`}>
                                          {user.role}
                                      </span>
                                  </td>
                                  <td className="p-8">
                                      <div className="flex items-center gap-2 text-slate-600">
                                          <FileText size={14}/>
                                          <span>Deal Ref: {user.linkedDealId}</span>
                                      </div>
                                  </td>
                                  <td className="p-8">
                                      <div className="flex flex-col gap-1">
                                          <span className={`w-fit px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                              user.onboardingStatus === 'Completed Setup' ? 'bg-emerald-50 text-emerald-700' :
                                              user.onboardingStatus === 'Invited' ? 'bg-indigo-50 text-indigo-700' :
                                              'bg-slate-100 text-slate-500'
                                          }`}>
                                              {user.onboardingStatus}
                                          </span>
                                          <p className="text-[7px] text-slate-300 font-black uppercase">Last: {user.lastLogin}</p>
                                      </div>
                                  </td>
                                  <td className="p-8 text-right">
                                      <div className="flex justify-end gap-2">
                                          <button 
                                            onClick={() => handleResetPassword(user)}
                                            disabled={isProcessing === user.id}
                                            className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-inner"
                                            title="Resend Magic Link"
                                          >
                                              {isProcessing === user.id ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16}/>}
                                          </button>
                                          {user.onboardingStatus === 'Suspended' ? (
                                              <button onClick={() => handleStatusChange(user.id, 'Invited')} className="p-2 bg-slate-50 text-emerald-600 rounded-xl shadow-inner"><ShieldCheck size={16}/></button>
                                          ) : (
                                              <button onClick={() => handleStatusChange(user.id, 'Suspended')} className="p-2 bg-slate-50 text-red-400 rounded-xl shadow-inner" title="Suspend User"><Ban size={16}/></button>
                                          )}
                                          <button className="p-2 text-slate-300 hover:text-slate-600"><MoreVertical size={20}/></button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {activeTab === 'bulk' && (
          <div className="space-y-8 animate-fade-in-up max-w-2xl mx-auto">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Database size={180}/></div>
                  <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Mass Provisioning.</h3>
                  <p className="text-indigo-100 text-sm font-medium leading-relaxed mb-8">
                      Upload a CSV of clients or vendors. Nexus AI will parse each row, detect the transaction stage, and write a personalized welcome email before dispatching a passwordless Magic Link.
                  </p>
                  
                  <div className="border-4 border-dashed border-white/10 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center gap-4 group hover:border-indigo-400/50 transition-all cursor-pointer">
                      <Upload size={48} className="text-white/20 group-hover:text-indigo-400 transition-colors" />
                      <div className="space-y-1">
                        <p className="font-black uppercase tracking-widest text-xs">Drop CSV Whitelist Here</p>
                        <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Fields: Name, Email, Role, Address</p>
                      </div>
                  </div>

                  <div className="mt-8 flex gap-4">
                      <button 
                        onClick={handleBulkInvite}
                        disabled={isProcessing === 'bulk'}
                        className="flex-1 bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                          {isProcessing === 'bulk' ? <Loader2 size={18} className="animate-spin"/> : <Sparkles size={18}/>}
                          Execute Batch Onboarding
                      </button>
                      <button className="px-8 bg-white/10 border border-white/20 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/20 transition-all">
                        Get Template
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default UserManagement;
