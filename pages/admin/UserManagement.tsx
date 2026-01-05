

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, UserPlus, ShieldAlert, Key, Search, Filter, 
  ChevronRight, MoreVertical, CheckCircle2, XCircle, 
  Clock, Upload, Download, FileText, Loader2, Sparkles, 
  Bot, Mail, ShieldCheck, Database, Ban, RefreshCw, 
  X, User, UserCog, Shield, Phone, MapPin, Activity,
  AlertCircle, Trash2, Edit3, Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, PortalUser, UserActivity } from '../../types';
import { airtableService } from '../../services/airtable';

const UserManagement: React.FC = () => {
  const { user: currentUser, role } = useAuth();
  
  // Authorization check
  const isAuthorized = role === UserRole.ADMIN || role === UserRole.BROKER;
  
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PortalUser | null>(null);

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, activitiesData] = await Promise.all([
        airtableService.getUsers(),
        airtableService.getUserActivity()
      ]);
      setUsers(usersData);
      setActivities(activitiesData);
    } catch (error) {
      console.error("Failed to load user management data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      const matchesSearch = u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           u.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  const handleDeactivate = async (id: string) => {
    if (!confirm('Deactivate User? This will revoke access. User data will be preserved.')) return;
    await airtableService.deactivateUser(id, currentUser?.id || 'admin');
    await airtableService.logUserActivity(currentUser?.id || 'admin', 'role_change', `Deactivated user ${id}`, { targetId: id });
    await loadData();
  };

  const handleReactivate = async (id: string) => {
    // Correctly using airtableService.updateUser
    await airtableService.updateUser(id, {
      'status': 'active',
      'deactivated_at': null,
      'deactivated_by': null
    });
    await airtableService.logUserActivity(currentUser?.id || 'admin', 'role_change', `Reactivated user ${id}`, { targetId: id });
    await loadData();
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 p-12 text-center animate-fade-in">
        <ShieldAlert size={64} className="opacity-20 mb-6" />
        <h3 className="text-2xl font-black text-slate-800 uppercase italic">Access Restricted.</h3>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-4">This terminal is restricted to Brokerage Leadership.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">User Governance.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Identity & Permission Cluster Manager</p>
        </div>
        <button
          onClick={() => { setSelectedUser(null); setShowModal(true); }}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95 border-b-4 border-indigo-900"
        >
          <UserPlus size={18} /> Add New Professional
        </button>
      </div>

      {/* Stats Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Global Entity Count" value={users.length} icon={Users} color="indigo" />
        <StatCard label="Active Agents" value={users.filter(u => u.role === 'AGENT' && u.status === 'active').length} icon={ShieldCheck} color="emerald" />
        <StatCard label="Pending Approval" value={users.filter(u => u.status === 'pending').length} icon={Clock} color="amber" />
        <StatCard label="Suspended Clusters" value={users.filter(u => u.status === 'suspended' || u.status === 'inactive').length} icon={Ban} color="red" />
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH IDENTITIES..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner" 
            />
          </div>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border-none rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
          >
            <option value="all">All Roles</option>
            <option value="ADMIN">Admins</option>
            <option value="BROKER">Brokers</option>
            <option value="AGENT">Agents</option>
            <option value="TC">Transaction Coords</option>
            <option value="ISA">ISA Network</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border-none rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
          >
            <option value="all">All States</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <button onClick={loadData} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Main Roster */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="p-8">Identity Cluster</th>
                <th className="p-8">Role Assignment</th>
                <th className="p-8">Sync Status</th>
                <th className="p-8">Audit Trail</th>
                <th className="p-8 text-right">Protocol Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-bold">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      {u.photoUrl ? (
                        <img src={u.photoUrl} className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md" />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black italic shadow-lg">
                          {u.fullName[0]}
                        </div>
                      )}
                      <div>
                        <p className="text-slate-900 uppercase tracking-tight font-black">{u.fullName}</p>
                        <p className="text-[10px] text-slate-400 font-bold lowercase italic">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border tracking-widest ${
                      u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                      u.role === 'BROKER' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        u.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                        u.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                      <span className="text-[10px] font-black uppercase text-slate-500">{u.status}</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-800 uppercase italic">Last Login: {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'NEVER'}</p>
                      <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">{u.loginCount} TOTAL PULSES</p>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setSelectedUser(u); setShowModal(true); }}
                        className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all border border-slate-100"
                      >
                        <Edit3 size={16} />
                      </button>
                      {u.status === 'active' ? (
                        <button 
                          onClick={() => handleDeactivate(u.id)}
                          className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-600 rounded-xl transition-all border border-slate-100"
                        >
                          <Ban size={16} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleReactivate(u.id)}
                          className="p-2.5 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all border border-slate-100"
                        >
                          {/* Correctly imported Zap icon used from lucide-react */}
                          <Zap size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-300 italic font-black uppercase text-xs">
                    No results found in identity cluster.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Trail Section */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden border-b-8 border-indigo-600">
        <div className="absolute right-0 top-0 p-8 opacity-5 rotate-12"><Activity size={180}/></div>
        <h3 className="text-xl font-black italic tracking-tighter uppercase mb-8 flex items-center gap-3">
          <Activity size={24} className="text-indigo-400" /> Global Audit Ledger
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activities.slice(0, 4).map(activity => (
            <div key={activity.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm flex items-start gap-4">
               <div className="p-2 bg-white/10 rounded-lg text-indigo-300 shadow-inner">
                 <Shield size={16} />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase text-indigo-400 mb-1">{activity.activityType.replace('_', ' ')}</p>
                  <p className="text-sm font-bold text-slate-100 italic leading-relaxed">"{activity.description}"</p>
                  <p className="text-[8px] font-black text-slate-500 uppercase mt-2 tracking-widest">{new Date(activity.createdAt).toLocaleString()}</p>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-[0_30px_100px_rgba(0,0,0,0.4)] border border-white/20 overflow-hidden flex flex-col">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0 border-b-8 border-indigo-600">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center font-black text-white border border-white/10 shadow-xl">
                   <UserCog size={28} />
                 </div>
                 <div>
                   <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none">Identity Architect.</h3>
                   <p className="text-indigo-400 font-bold text-[9px] uppercase tracking-widest mt-1">Configure Node Permissions</p>
                 </div>
               </div>
               <button onClick={() => setShowModal(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X size={24}/></button>
            </div>
            
            <UserFormModal 
              user={selectedUser} 
              onClose={() => setShowModal(false)} 
              onSave={async () => { await loadData(); setShowModal(false); }}
              currentUserId={currentUser?.id || 'admin'}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUBCOMPONENTS ---

const StatCard: React.FC<{ label: string, value: number | string, icon: any, color: string }> = ({ label, value, icon: Icon, color }) => {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    red: 'bg-red-50 text-red-600 border-red-100'
  };
  
  return (
    <div className={`bg-white border rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all group ${colors[color]}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-white rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
          <Icon size={20} />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-3xl font-black text-slate-900 tabular-nums italic tracking-tighter">{value}</p>
    </div>
  );
};

const UserFormModal: React.FC<{ 
  user: PortalUser | null, 
  onClose: () => void, 
  onSave: () => Promise<void>,
  currentUserId: string
}> = ({ user, onClose, onSave, currentUserId }) => {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    fullName: user?.fullName || '',
    role: user?.role || 'AGENT',
    phone: user?.phone || '',
    territoryZipCodes: user?.territoryZipCodes || '',
    permissionsJson: user?.permissionsJson || '{}'
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.fullName) return;
    
    setIsProcessing(true);
    try {
      if (user) {
        // Correctly using airtableService.updateUser
        await airtableService.updateUser(user.id, {
          'full_name': formData.fullName,
          'role': formData.role,
          'phone': formData.phone,
          'territory_zip_codes': formData.territoryZipCodes,
          'permissions_json': formData.permissionsJson
        });
        await airtableService.logUserActivity(currentUserId, 'role_change', `Updated user identity: ${user.fullName}`, { targetId: user.id });
      } else {
        // Correctly using airtableService.createUser
        await airtableService.createUser(formData, currentUserId);
        await airtableService.logUserActivity(currentUserId, 'role_change', `Created new user entity: ${formData.fullName}`, { email: formData.email });
      }
      await onSave();
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Email Identity *</label>
          <div className="relative group">
            <input 
              required
              type="email"
              disabled={!!user}
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all disabled:opacity-50" 
              placeholder="user@brokerage.com"
            />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Full Entity Name *</label>
          <div className="relative group">
            <input 
              required
              type="text"
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
              className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all" 
              placeholder="Full Legal Name"
            />
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Role Allocation *</label>
          <div className="relative group">
            <select 
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value as any})}
              className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none cursor-pointer focus:ring-2 focus:ring-indigo-600 transition-all appearance-none"
            >
              <option value="AGENT">AGENT</option>
              <option value="BROKER">BROKER</option>
              <option value="TC">TRANSACTION COORD</option>
              <option value="ADMIN">ADMIN</option>
              <option value="ISA">ISA NETWORK</option>
              <option value="VENDOR">PARTNER VENDOR</option>
            </select>
            <UserCog className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 rotate-90" size={18} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Contact Phone</label>
          <div className="relative group">
            <input 
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all" 
              placeholder="512-555-0000"
            />
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Territory Assignment (ZIPs)</label>
        <div className="relative group">
          <input 
            type="text"
            value={formData.territoryZipCodes}
            onChange={e => setFormData({...formData, territoryZipCodes: e.target.value})}
            className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all" 
            placeholder="78701, 78704, 78746..."
          />
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
        </div>
        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1 px-1">Separate with commas for territory-based lead routing</p>
      </div>

      <div className="flex gap-4 pt-6">
        <button 
          type="button"
          onClick={onClose}
          className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
        >
          Cancel Protocol
        </button>
        <button 
          type="submit"
          disabled={isProcessing}
          className="flex-[2] bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 border-b-4 border-indigo-600 disabled:opacity-50"
        >
          {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
          {user ? 'Commit Identity Sync' : 'Initialize New Node'}
        </button>
      </div>
    </form>
  );
};

export default UserManagement;
