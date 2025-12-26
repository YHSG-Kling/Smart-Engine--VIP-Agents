
import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Settings, Zap, 
  ShieldCheck, AlertTriangle, CheckCircle2, ChevronLeft,
  ChevronRight, ArrowRight, Loader2, RefreshCw, Link as LinkIcon,
  Globe, Smartphone, MoreVertical, Plus, ListChecks,
  // Added missing UserCheck import
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, AvailabilitySettings } from '../../types';

const CalendarDashboard: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === UserRole.ADMIN || role === UserRole.BROKER;
  const isAgent = role === UserRole.AGENT;

  const [activeTab, setActiveTab] = useState<'availability' | 'integrations'>('availability');
  const [isSyncing, setIsSyncing] = useState(false);

  // Workflow 123: Admin/Agent Config State
  const [availSettings, setAvailSettings] = useState<AvailabilitySettings>({
      allowDoubleBooking: false,
      driveTimeBufferMins: 30,
      workingHoursStart: '09:00',
      workingHoursEnd: '18:00'
  });

  const [blockedSlots] = useState([
      { id: 'b1', title: 'Inspection: 123 Main', start: 'Today, 10:00 AM', end: '12:00 PM', type: 'Work' },
      { id: 'b2', title: 'Client Call: John S', start: 'Today, 2:00 PM', end: '2:30 PM', type: 'Call' },
      { id: 'b3', title: 'Personal Appointment', start: 'Tomorrow, 1:00 PM', end: '2:00 PM', type: 'Personal' }
  ]);

  const handleSyncGCal = () => {
      setIsSyncing(true);
      setTimeout(() => {
          setIsSyncing(false);
          alert("G-Suite Protocol: Google Calendar synchronized. 3 new collisions identified and blocked.");
      }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Availability Hub.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Workflow 123: Autonomous Negotiation Protocol</p>
        </div>
        <div className="flex gap-2">
            <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm overflow-x-auto scrollbar-hide max-w-full">
                <button onClick={() => setActiveTab('availability')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'availability' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <CalendarIcon size={14}/> Dashboard
                </button>
                {isAdmin && (
                  <button onClick={() => setActiveTab('integrations')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'integrations' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                      <LinkIcon size={14}/> Integrations
                  </button>
                )}
            </div>
        </div>
      </div>

      {activeTab === 'availability' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
              {/* LEFT: Blocking & Settings */}
              <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
                      <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <Settings size={18} className="text-indigo-600" /> Showing Protocol
                      </h3>
                      <div className="space-y-6">
                          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <div>
                                  <p className="font-black text-[10px] text-slate-800 uppercase tracking-tight">Allow Double Booking</p>
                                  <p className="text-[9px] text-slate-400 font-bold">Prevents AI from proposing occupied slots</p>
                              </div>
                              <button 
                                onClick={() => setAvailSettings({...availSettings, allowDoubleBooking: !availSettings.allowDoubleBooking})}
                                className={`w-12 h-6 rounded-full transition-all relative ${availSettings.allowDoubleBooking ? 'bg-indigo-600' : 'bg-slate-300'}`}
                              >
                                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${availSettings.allowDoubleBooking ? 'left-7' : 'left-1'}`} />
                              </button>
                          </div>
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Drive Time Buffer (Mins)</label>
                              <div className="flex items-center gap-4">
                                  <input 
                                    type="range" min="15" max="60" step="15"
                                    value={availSettings.driveTimeBufferMins}
                                    onChange={e => setAvailSettings({...availSettings, driveTimeBufferMins: parseInt(e.target.value)})}
                                    className="flex-1 accent-indigo-600" 
                                  />
                                  <span className="font-black text-indigo-600 text-lg tabular-nums">{availSettings.driveTimeBufferMins}m</span>
                              </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Start Time</label>
                                    <input type="time" value={availSettings.workingHoursStart} onChange={e => setAvailSettings({...availSettings, workingHoursStart: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold focus:ring-1 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">End Time</label>
                                    <input type="time" value={availSettings.workingHoursEnd} onChange={e => setAvailSettings({...availSettings, workingHoursEnd: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold focus:ring-1 focus:ring-indigo-500 outline-none" />
                                </div>
                          </div>
                          <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all">Save Availability</button>
                      </div>
                  </div>
              </div>

              {/* RIGHT: Calendar Feed */}
              <div className="lg:col-span-8 space-y-6">
                  <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                      <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><CalendarIcon size={180}/></div>
                      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                          <div>
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Google Sync Hub.</h3>
                            <p className="text-indigo-100 text-sm font-medium">Auto-blocks slots for current showings and personal appointments. AI uses this data to autonomously propose slots to new leads.</p>
                          </div>
                          <button 
                            onClick={handleSyncGCal}
                            disabled={isSyncing}
                            className="bg-white text-indigo-900 px-6 py-3 rounded-2xl font-black uppercase text-[9px] tracking-widest shadow-2xl hover:bg-indigo-50 active:scale-95 transition-all flex items-center gap-3 shrink-0"
                          >
                              {isSyncing ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16}/>}
                              Sync Master GCal
                          </button>
                      </div>
                  </div>

                  <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                          <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Clock size={18} className="text-indigo-600" /> Blocked Slots (Next 48h)
                          </h3>
                      </div>
                      <div className="divide-y divide-slate-100">
                          {blockedSlots.map(slot => (
                              <div key={slot.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                  <div className="flex items-center gap-6">
                                      <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:text-indigo-600 transition-colors`}>
                                          {slot.type === 'Work' ? <CheckCircle2 size={24}/> : slot.type === 'Call' ? <Smartphone size={24}/> : <UserCheck size={24}/>}
                                      </div>
                                      <div>
                                          <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">{slot.title}</h4>
                                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{slot.start} - {slot.end}</p>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                      <span className="bg-slate-100 text-slate-500 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-slate-200">{slot.type}</span>
                                      <button className="p-2 text-slate-200 hover:text-red-500 transition-colors"><MoreVertical size={16}/></button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'integrations' && isAdmin && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-white rounded-2xl border border-slate-200 p-8 flex items-center justify-between hover:border-indigo-400 transition-all group">
                  <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 group-hover:text-indigo-600 transition-colors">
                          <Globe size={32}/>
                      </div>
                      <div>
                          <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg leading-none mb-1">ShowingTime API</h4>
                          <p className="text-xs text-slate-400 font-medium">Standardize external listing agent availability for one-click bookings.</p>
                      </div>
                  </div>
                  <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">Connect API</button>
              </div>
          </div>
      )}
    </div>
  );
};

export default CalendarDashboard;
