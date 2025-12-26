
import React, { useState, useMemo } from 'react';
import { 
  Calendar, Clock, QrCode, Sparkles, Send, Bot, 
  LayoutList, Plus, Edit3, Loader2, Home, Users,
  ChevronRight, ArrowRight, Share2, Download, RefreshCw,
  Search, Filter, MapPin, ExternalLink, Megaphone, Zap,
  Settings, CheckCircle2, MoreVertical
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, OpenHouse, OHTemplate } from '../../types';
import { n8nService } from '../../services/n8n';

const OpenHouseManager: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === UserRole.ADMIN || role === UserRole.BROKER;
  const isAgent = role === UserRole.AGENT;

  // --- STATE ---
  const [isLaunching, setIsLaunching] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'scheduler' | 'active' | 'templates'>('scheduler');

  // Workflow 115 Admin Data
  const [templates] = useState<OHTemplate[]>([
    { id: 't1', name: 'Mega Open House', description: 'High-energy weekend event for active buyers.', aiPrompt: 'Write a high-energy SMS for active buyers looking in [ZIP] with a price point around [PRICE]. Mention fresh cookies and mimosa brunch.' },
    { id: 't2', name: 'Neighbors Only Preview', description: 'Exclusive sneak peek for the local block.', aiPrompt: 'Write an exclusive invitation for neighbors of [ADDRESS]. Emphasize the opportunity to pick their new neighbor. Keep it community-focused and low pressure.' },
    { id: 't3', name: 'Broker Luncheon', description: 'Catered event for area agents and brokers.', aiPrompt: 'Professional invitation for local brokers. Highlight the commission bonus and catered lunch details. Focus on luxury finishes.' }
  ]);

  // Workflow 115 Agent Data
  const [activeEvents, setActiveEvents] = useState<OpenHouse[]>([
    { id: 'oh1', listingId: 'l1', address: '123 Main St', startTime: 'Sat, Nov 11, 1:00 PM', endTime: '3:00 PM', theme: 'Mimosa Brunch', status: 'Active', rsvpCount: 12, qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://nexus-os.com/reg/oh1' }
  ]);

  const [schedulerForm, setSchedulerForm] = useState({
    listing: '123 Main St',
    date: '2024-11-11',
    startTime: '13:00',
    endTime: '15:00',
    theme: 'Mimosa Brunch'
  });

  const handleLaunchBlitz = async () => {
    setIsLaunching(true);
    // Workflow 115 Node 1 trigger
    await n8nService.triggerLaunchOpenHouseBlitz({
      ...schedulerForm,
      templateId: selectedTemplate || 't1'
    });

    setTimeout(() => {
      setIsLaunching(false);
      alert("Event Horizon Engine: Marketing Blitz Launched. Assets generated and SMS blast dispatched to filtered CRM segment.");
      setActiveTab('active');
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Open House Manager.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Workflow 115: Event Horizon Engine Active</p>
        </div>
        <div className="flex gap-2">
            <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm overflow-x-auto scrollbar-hide max-w-full">
                {isAdmin && (
                    <button onClick={() => setActiveTab('templates')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'templates' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                        <Settings size={14}/> Campaign Templates
                    </button>
                )}
                {isAgent && (
                    <button onClick={() => setActiveTab('scheduler')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'scheduler' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                        <Calendar size={14}/> New Campaign
                    </button>
                )}
                <button onClick={() => setActiveTab('active')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'active' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <Megaphone size={14}/> Active Events
                </button>
            </div>
        </div>
      </div>

      {/* VIEW A: Admin - Campaign Templates */}
      {activeTab === 'templates' && isAdmin && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map(tpl => (
                      <div key={tpl.id} className="bg-white rounded-[2rem] border-2 border-slate-200 p-8 shadow-sm hover:border-indigo-400 transition-all flex flex-col group">
                          <div className="flex justify-between items-start mb-6">
                              <div className="p-4 rounded-3xl bg-indigo-50 text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                                  <LayoutList size={24}/>
                              </div>
                              <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><Edit3 size={18}/></button>
                          </div>
                          <h4 className="font-black text-xl text-slate-900 uppercase tracking-tight italic mb-2">{tpl.name}</h4>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">"{tpl.description}"</p>
                          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-8 flex-1">
                              <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Bot size={12}/> AI Prompt Logic</p>
                              <p className="text-[10px] text-slate-600 leading-relaxed italic line-clamp-3">"{tpl.aiPrompt}"</p>
                          </div>
                          <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all">Configure Rule</button>
                      </div>
                  ))}
                  <button className="border-4 border-dashed border-slate-100 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center gap-3 group hover:border-indigo-200 transition-all">
                        <Plus size={32} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Create New Template</span>
                  </button>
              </div>
          </div>
      )}

      {/* VIEW B: Agent - Scheduler & QR Tools */}
      {activeTab === 'scheduler' && isAgent && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
              <div className="lg:col-span-7 space-y-6">
                  <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-lg p-10">
                      <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-8 flex items-center gap-3">
                        <Calendar size={24} className="text-indigo-600" /> Event Architect.
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Listing</label>
                              <select 
                                value={schedulerForm.listing}
                                onChange={e => setSchedulerForm({...schedulerForm, listing: e.target.value})}
                                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
                              >
                                  <option>123 Main St</option>
                                  <option>456 Oak Ave</option>
                                  <option>789 Skyline Dr</option>
                              </select>
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Campaign Theme</label>
                              <select 
                                value={schedulerForm.theme}
                                onChange={e => setSchedulerForm({...schedulerForm, theme: e.target.value})}
                                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
                              >
                                  {templates.map(t => <option key={t.id}>{t.name}</option>)}
                              </select>
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Event Date</label>
                              <input 
                                type="date"
                                value={schedulerForm.date}
                                onChange={e => setSchedulerForm({...schedulerForm, date: e.target.value})}
                                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
                              />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Start</label>
                                  <input type="time" value={schedulerForm.startTime} onChange={e => setSchedulerForm({...schedulerForm, startTime: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none shadow-inner" />
                              </div>
                              <div className="space-y-1.5">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">End</label>
                                  <input type="time" value={schedulerForm.endTime} onChange={e => setSchedulerForm({...schedulerForm, endTime: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none shadow-inner" />
                              </div>
                          </div>
                      </div>

                      <button 
                        onClick={handleLaunchBlitz}
                        disabled={isLaunching}
                        className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase text-sm tracking-[0.25em] shadow-2xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-4 border-b-8 border-indigo-600 disabled:opacity-50"
                      >
                          {isLaunching ? <Loader2 className="animate-spin" size={24}/> : <Zap size={24}/>}
                          Launch Marketing Blitz
                      </button>
                  </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                  <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                      <div className="absolute right-0 top-0 p-4 opacity-5 rotate-12"><Megaphone size={150}/></div>
                      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                          <Bot size={16}/> AI Strategy Note
                      </h4>
                      <p className="text-sm font-medium leading-relaxed italic text-slate-200 mb-8">
                          "Targeting 142 leads in ZIP 78704. AI will synthesize a 'Mimosa Brunch' narrative for social stories and draft urgent SMS invites. Estimated attendance projection: 8-12 groups."
                      </p>
                      <div className="bg-white/10 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                           <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-3">Multichannel Morph Enabled</p>
                           <div className="flex gap-4">
                               <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><Share2 size={14}/></div>
                               <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><Send size={14}/></div>
                               <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><QrCode size={14}/></div>
                           </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* SHARED VIEW: Active Events */}
      {activeTab === 'active' && (
          <div className="space-y-8 animate-fade-in-up">
              <div className="grid grid-cols-1 gap-6">
                  {activeEvents.map(event => (
                      <div key={event.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col lg:flex-row group hover:border-indigo-400 transition-all duration-500">
                          <div className="lg:w-[340px] bg-slate-50 p-10 border-r border-slate-100 flex flex-col items-center text-center justify-center shrink-0">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Event Registration QR</p>
                                <div className="p-6 bg-white rounded-3xl border-2 border-indigo-100 shadow-xl mb-6 group-hover:scale-105 transition-transform duration-500">
                                    <img src={event.qrCodeUrl} className="w-32 h-32 object-contain mix-blend-multiply" />
                                </div>
                                <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5 hover:underline transition-all">
                                    <Download size={14}/> Download Print QR
                                </button>
                          </div>
                          
                          <div className="flex-1 p-10 flex flex-col justify-between">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-emerald-100 shadow-sm">{event.status}</span>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{event.theme}</span>
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-1">{event.address}</h3>
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs flex items-center gap-1.5 mt-2">
                                            <Clock size={16} className="text-indigo-500"/> {event.startTime} - {event.endTime}
                                        </p>
                                    </div>
                                    <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl min-w-[140px] text-center">
                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Confirmed RSVPs</p>
                                        <p className="text-3xl font-black tracking-tighter tabular-nums">{event.rsvpCount}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
                                    <button className="flex-1 bg-white border-2 border-slate-200 text-slate-700 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                        <ExternalLink size={14}/> Live Guest List
                                    </button>
                                    <button className="flex-1 bg-white border-2 border-slate-200 text-slate-700 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                        <Download size={14}/> AI Social Pack
                                    </button>
                                    <button className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                                        <RefreshCw size={14}/> Retrain Blast
                                    </button>
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

export default OpenHouseManager;
