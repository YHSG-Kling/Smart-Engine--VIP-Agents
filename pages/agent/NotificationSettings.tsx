
import React, { useState } from 'react';
import { 
  Bell, Shield, Smartphone, Mail, MessageSquare, 
  Clock, Zap, Save, RefreshCw, Loader2, Bot, 
  CheckCircle2, AlertTriangle, ShieldCheck, 
  Settings, ChevronRight, UserCheck, Flame, Users,
  Globe, Landmark, Smartphone as PhoneIcon, UserPlus, Trash2,
  Filter, Search, ArrowRight, ListChecks, Map as MapIcon, CloudRain,
  // Added missing Sparkles import to fix error on line 171
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, NotificationRule, NotificationPreference, DealStakeholder, CommsAuditLog, ReminderConfig } from '../../types';
import { n8nService } from '../../services/n8n';

const NotificationSettings: React.FC = () => {
  const { role, user } = useAuth();
  const isAdmin = role === UserRole.ADMIN || role === UserRole.BROKER;
  const isAgent = role === UserRole.AGENT;
  const isClient = role === UserRole.BUYER || role === UserRole.SELLER;

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'preferences' | 'rules' | 'history' | 'stakeholders' | 'audit' | 'reminders'>(
      isAdmin ? 'audit' : isAgent ? 'stakeholders' : 'preferences'
  );

  // --- Workflow 125: Reminder Logic State ---
  const [reminderConfig, setReminderConfig] = useState<ReminderConfig>({
      intervals: ['24h', '2h', '15m'],
      googleMapsApiKey: '••••••••••••••••',
      weatherApiKey: '••••••••••••••••',
      isActive: true
  });

  // --- Workflow 108: View A (Admin) Data ---
  const [auditLogs] = useState<CommsAuditLog[]>([
      { id: '1', recipientType: 'Lender', messageBody: 'Appraisal received. Please confirm Clear to Close timeline.', timestamp: '10 mins ago', channel: 'Email', status: 'Delivered' },
      { id: '2', recipientType: 'Client', messageBody: 'Great news! The home value came in at price. One step closer!', timestamp: '12 mins ago', channel: 'SMS', status: 'Sent' },
      { id: '3', recipientType: 'Title', messageBody: 'Appraisal cleared. We are on track for Nov 24th.', timestamp: '15 mins ago', channel: 'Email', status: 'Delivered' },
  ]);

  // --- Workflow 108: View B (Agent) Data ---
  const [stakeholders, setStakeholders] = useState<DealStakeholder[]>([
      { id: 'st1', dealId: '1', role: 'Lender', name: 'John Lending', email: 'john@luxlending.com', phone: '512-555-0800', autoNotify: true },
      { id: 'st2', dealId: '1', role: 'Title', name: 'Mary Title', email: 'mary@firstam.com', phone: '512-555-0900', autoNotify: true },
  ]);

  // --- Workflow 101: Rule Thresholds ---
  const [rules, setRules] = useState<NotificationRule[]>([
    { id: '1', name: 'Hot Lead Surge', scoreThreshold: 80, primaryChannel: 'SMS', isActive: true },
    { id: '2', name: 'Warm Nurture', scoreThreshold: 50, primaryChannel: 'Email', isActive: true }
  ]);

  // --- Workflow 108: View C (Client) Preferences ---
  const [prefs, setPrefs] = useState<NotificationPreference>({
    agentId: user?.id || 'agent_1',
    smsHotLeads: true,
    emailWarmLeads: true,
    slackTeamUpdates: true,
    quietHoursEnabled: true,
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00"
  });

  const handleSave = async () => {
    setIsSaving(true);
    if (activeTab === 'reminders') {
        await n8nService.updateReminderLogic(reminderConfig);
    }
    await new Promise(r => setTimeout(r, 1000));
    setIsSaving(false);
    alert("VIP Agents Smart Engine: Notification protocols synchronized across clusters.");
  };

  const toggleInterval = (interval: '24h' | '2h' | '15m') => {
      setReminderConfig(prev => ({
          ...prev,
          intervals: prev.intervals.includes(interval) 
            ? prev.intervals.filter(i => i !== interval) 
            : [...prev.intervals, interval]
      }));
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Notification Center.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Contextual Comms & AI Governance</p>
        </div>
        <div className="flex gap-2">
            <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm overflow-x-auto scrollbar-hide max-w-full">
                {isAdmin && (
                  <>
                    <button onClick={() => setActiveTab('audit')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'audit' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                        <ListChecks size={14}/> Audit Log
                    </button>
                    <button onClick={() => setActiveTab('reminders')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'reminders' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                        <Clock size={14}/> Showing Reminders
                    </button>
                    <button onClick={() => setActiveTab('rules')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'rules' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                        <Shield size={14}/> Rules
                    </button>
                  </>
                )}
                {isAgent && (
                    <button onClick={() => setActiveTab('stakeholders')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'stakeholders' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                        <Landmark size={14}/> Stakeholder Map
                    </button>
                )}
                <button onClick={() => setActiveTab('preferences')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'preferences' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <Zap size={14}/> {isClient ? 'Comms Prefs' : 'My Preferences'}
                </button>
            </div>
            <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-black active:scale-95 transition-all disabled:opacity-50"
            >
                {isSaving ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>}
                Sync Protocols
            </button>
        </div>
      </div>

      {/* --- WORKFLOW 125: VIEW A (ADMIN) REMINDER LOGIC --- */}
      {activeTab === 'reminders' && isAdmin && (
          <div className="space-y-8 animate-fade-in-up">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Clock size={180}/></div>
                  <div className="relative z-10 max-w-xl">
                      <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-2 leading-none">Reminder Logic.</h3>
                      <p className="text-indigo-100 text-sm font-medium opacity-90 leading-relaxed mb-8">
                          Configure dynamic showing reminders. The 2h reminder utilizes <strong className="text-white">Google Maps Transit</strong> and <strong className="text-white">OpenWeather API</strong> to calculate late-warnings based on real-time traffic.
                      </p>
                      <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setReminderConfig({...reminderConfig, isActive: !reminderConfig.isActive})}
                            className={`w-14 h-7 rounded-full transition-all relative shrink-0 ${reminderConfig.isActive ? 'bg-indigo-600' : 'bg-slate-600'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${reminderConfig.isActive ? 'left-8' : 'left-1'}`} />
                        </button>
                        <span className="text-[11px] font-black uppercase tracking-widest text-indigo-300">Logic Sentinel: {reminderConfig.isActive ? 'ACTIVE' : 'PAUSED'}</span>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 bg-white rounded-[2rem] border border-slate-200 shadow-md p-8">
                      <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                        <Smartphone size={18} className="text-indigo-600" /> Dispatch Intervals
                      </h3>
                      
                      <div className="space-y-4">
                          {[
                              { id: '24h', label: '24-Hour Confirmation', desc: 'Standard RSVP check dispatched one day prior.' },
                              { id: '2h', label: '2-Hour Traffic Audit', desc: 'Analyzes drive time + weather. Injects late-warning copy via Gemini Flash.', isAI: true },
                              { id: '15m', label: '15-Minute Proximity', desc: 'Final "Arriving Soon" alert for both client and agent.' },
                          ].map(interval => (
                              <div key={interval.id} onClick={() => toggleInterval(interval.id as any)} className={`p-6 rounded-3xl border-2 transition-all cursor-pointer group flex items-center justify-between ${
                                  reminderConfig.intervals.includes(interval.id as any) ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'
                              }`}>
                                  <div className="flex items-center gap-5">
                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                          reminderConfig.intervals.includes(interval.id as any) ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-300 border border-slate-100'
                                      }`}>
                                          {reminderConfig.intervals.includes(interval.id as any) ? <CheckCircle2 size={24}/> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
                                      </div>
                                      <div>
                                          <div className="flex items-center gap-2 mb-1">
                                              <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">{interval.label}</h4>
                                              {interval.isAI && <span className="bg-indigo-200 text-indigo-800 text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-widest"><Sparkles size={8}/> AI Context</span>}
                                          </div>
                                          <p className="text-xs text-slate-500 font-medium">{interval.desc}</p>
                                      </div>
                                  </div>
                                  <Clock size={20} className={reminderConfig.intervals.includes(interval.id as any) ? 'text-indigo-400' : 'text-slate-200'} />
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md p-8">
                          <h4 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                            <Settings size={18} className="text-indigo-600" /> Infrastructure Keys
                          </h4>
                          <div className="space-y-6">
                              <div className="space-y-1.5">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1 flex items-center gap-2">
                                      <MapIcon size={12} className="text-indigo-600"/> Google Maps API
                                  </label>
                                  <input 
                                    type="password"
                                    value={reminderConfig.googleMapsApiKey}
                                    onChange={e => setReminderConfig({...reminderConfig, googleMapsApiKey: e.target.value})}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs focus:ring-1 focus:ring-indigo-500 outline-none shadow-inner" 
                                  />
                              </div>
                              <div className="space-y-1.5">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1 flex items-center gap-2">
                                      <CloudRain size={12} className="text-indigo-600"/> OpenWeatherMap API
                                  </label>
                                  <input 
                                    type="password"
                                    value={reminderConfig.weatherApiKey}
                                    onChange={e => setReminderConfig({...reminderConfig, weatherApiKey: e.target.value})}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs focus:ring-1 focus:ring-indigo-500 outline-none shadow-inner" 
                                  />
                              </div>
                          </div>
                      </div>

                      <div className="bg-indigo-50 border border-indigo-100 rounded-[2.5rem] p-8 shadow-inner">
                          <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-2"><Bot size={16}/> Gemini Copy Preview</h4>
                          <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm italic text-xs text-slate-600 leading-relaxed">
                            "Heads up, it's raining and traffic is heavy on I-35. Suggest leaving 15 mins early for the showing at 123 Main St. See you soon!"
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- WORKFLOW 108: VIEW A (ADMIN) AUDIT LOG --- */}
      {activeTab === 'audit' && isAdmin && (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden animate-fade-in-up">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                  <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                    <ListChecks size={18} className="text-indigo-600" /> Automated Broadcast Audit
                  </h3>
                  <div className="flex gap-2">
                      <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 shadow-sm"><Search size={14}/></button>
                      <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 shadow-sm"><Filter size={14}/></button>
                  </div>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] font-bold">
                      <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          <tr>
                              <th className="p-6">Recipient Type</th>
                              <th className="p-6">AI Contextual Message Extract</th>
                              <th className="p-6">Channel</th>
                              <th className="p-6 text-right">Timestamp</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {auditLogs.map(log => (
                              <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                                  <td className="p-6">
                                      <span className="font-black text-slate-900 uppercase tracking-tight">{log.recipientType}</span>
                                  </td>
                                  <td className="p-6 max-w-md">
                                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                                          <p className="text-[10px] text-slate-600 leading-relaxed font-medium italic">"{log.messageBody}"</p>
                                      </div>
                                  </td>
                                  <td className="p-6">
                                      <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${
                                          log.channel === 'SMS' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                                      }`}>
                                          {log.channel}
                                      </span>
                                  </td>
                                  <td className="p-6 text-right text-slate-400 uppercase font-black">{log.timestamp}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* --- WORKFLOW 108: VIEW B (AGENT) STAKEHOLDER MAP --- */}
      {activeTab === 'stakeholders' && isAgent && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-900 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Users size={180}/></div>
                  <div className="relative z-10 max-w-xl">
                      <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2 leading-none">Stakeholder Logic.</h3>
                      <p className="text-indigo-100 text-sm font-medium opacity-90 leading-relaxed">Map specific deal partners to automate the "Contextual Broadcaster". The AI writes role-specific messages to each party when transaction milestones are hit.</p>
                  </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md p-8">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                        <UserPlus size={18} className="text-indigo-600" /> Active Stakeholder Map
                      </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {stakeholders.map(s => (
                          <div key={s.id} className="bg-slate-50 border border-slate-100 rounded-3xl p-6 relative group hover:border-indigo-200 transition-all">
                              <div className="flex justify-between items-start mb-6">
                                  <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-black text-indigo-600 shadow-sm border border-slate-100">
                                          {s.role[0]}
                                      </div>
                                      <div>
                                          <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">{s.name}</h4>
                                          <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{s.role}</p>
                                      </div>
                                  </div>
                                  <button onClick={() => setStakeholders(prev => prev.map(item => item.id === s.id ? {...item, autoNotify: !item.autoNotify} : item))} className={`w-12 h-6 rounded-full transition-all relative ${s.autoNotify ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${s.autoNotify ? 'left-7' : 'left-1'}`} />
                                  </button>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                                      <input type="text" value={s.email} className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs font-bold focus:ring-1 focus:ring-indigo-500 outline-none" />
                                  </div>
                                  <div className="space-y-1">
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                                      <input type="text" value={s.phone} className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs font-bold focus:ring-1 focus:ring-indigo-500 outline-none" />
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* --- TAB: PREFERENCES (Workflow 101/108 Client View C) --- */}
      {activeTab === 'preferences' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
              <div className="lg:col-span-8 space-y-6">
                  <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                          <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Smartphone size={18} className="text-indigo-600" /> Communication Channels
                          </h3>
                      </div>
                      <div className="p-8 space-y-8">
                          {[
                              { id: 'smsHotLeads', label: 'Notify me via SMS', icon: PhoneIcon, color: 'text-orange-500', desc: 'Real-time text alerts for high-priority transaction milestones.' },
                              { id: 'emailWarmLeads', label: 'Notify me via Email', icon: Mail, color: 'text-indigo-500', desc: 'Detailed deal updates and weekly performance snapshots.' },
                          ].map(item => (
                              <div key={item.id} className="flex items-center justify-between gap-6 group">
                                  <div className="flex items-center gap-5 flex-1">
                                      <div className={`p-3 rounded-2xl bg-slate-50 ${item.color} group-hover:scale-110 transition-transform`}>
                                          <item.icon size={20} />
                                      </div>
                                      <div>
                                          <p className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">{item.label}</p>
                                          <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                                      </div>
                                  </div>
                                  <button 
                                    onClick={() => setPrefs(prev => ({ ...prev, [item.id]: !prev[item.id as keyof NotificationPreference] }))}
                                    className={`w-14 h-7 rounded-full transition-all relative shrink-0 ${prefs[item.id as keyof NotificationPreference] ? 'bg-indigo-600 shadow-inner' : 'bg-slate-200'}`}
                                  >
                                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${prefs[item.id as keyof NotificationPreference] ? 'left-8' : 'left-1'}`} />
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>

                  {!isClient && (
                      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md p-8">
                          <div className="flex items-center justify-between mb-8">
                              <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Clock size={18} className="text-indigo-600" /> Quiet Hours (DND)
                              </h3>
                              <button 
                                onClick={() => setPrefs(prev => ({ ...prev, quietHoursEnabled: !prev.quietHoursEnabled }))}
                                className={`w-12 h-6 rounded-full transition-all relative ${prefs.quietHoursEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                              >
                                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${prefs.quietHoursEnabled ? 'left-7' : 'left-1'}`} />
                              </button>
                          </div>
                          <div className={`flex items-center gap-8 ${!prefs.quietHoursEnabled ? 'opacity-30 pointer-events-none grayscale' : ''} transition-all`}>
                              <div className="flex-1 space-y-2">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Silent From</label>
                                  <input 
                                    type="time" 
                                    value={prefs.quietHoursStart} 
                                    onChange={e => setPrefs({...prefs, quietHoursStart: e.target.value})}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500" 
                                  />
                              </div>
                              <div className="flex-1 space-y-2">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Silent Until</label>
                                  <input 
                                    type="time" 
                                    value={prefs.quietHoursEnd} 
                                    onChange={e => setPrefs({...prefs, quietHoursEnd: e.target.value})}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500" 
                                  />
                              </div>
                          </div>
                      </div>
                  )}
              </div>

              <div className="lg:col-span-4 space-y-6">
                  <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                      <div className="absolute right-0 top-0 p-4 opacity-5"><RefreshCw size={80}/></div>
                      <h4 className="font-black text-xs uppercase tracking-widest text-indigo-400 mb-6 flex items-center gap-2">
                          <Bot size={16}/> {isClient ? 'Concierge Pulse' : 'Live Preview'}
                      </h4>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-inner mb-6">
                          <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-3">Milestone: Appraisal Complete</p>
                          <p className="text-sm font-medium leading-relaxed italic text-slate-200">
                              {isClient 
                                ? '"Great news! Your home appraisal is complete and met the target value. One step closer to closing!"' 
                                : '"🔥 Lead surge detected on 123 Main St. Stakeholders auto-notified."'}
                          </p>
                      </div>
                      <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-indigo-50 active:scale-95 transition-all">
                          {isClient ? 'Send Test Alert' : 'Test Global Hook'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'rules' && isAdmin && (
          <div className="space-y-6">
              <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-900 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Bot size={180}/></div>
                  <div className="relative z-10 max-w-xl">
                      <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Rule Governance.</h3>
                      <p className="text-indigo-100 text-sm font-medium opacity-90 leading-relaxed">Define company-wide behavioral triggers. AI-driven notifications are dispatched only when client scores exceed these thresholds.</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                  {rules.map(rule => (
                      <div key={rule.id} className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm hover:border-indigo-400 transition-all flex items-center justify-between group">
                          <div className="flex items-center gap-6">
                              <div className={`p-4 rounded-2xl ${rule.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-300'}`}>
                                  <ShieldCheck size={24} />
                              </div>
                              <div>
                                  <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg leading-none mb-1.5">{rule.name}</h4>
                                  <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-1.5">
                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">THRESHOLD:</span>
                                          <span className="font-black text-indigo-600 text-sm">{rule.scoreThreshold}+ pts</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">CHANNEL:</span>
                                          <span className="font-black text-slate-800 text-sm uppercase italic">{rule.primaryChannel}</span>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default NotificationSettings;
