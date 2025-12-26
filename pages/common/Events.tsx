
import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, MapPin, Users, Plus, ChevronRight, 
  Search, Filter, BarChart3, Bot, Send, Sparkles, 
  CheckCircle2, Clock, X, MessageSquare, Download,
  ExternalLink, Loader2, PieChart, Landmark,
  // Fix: Added missing imports
  ArrowRight, Globe, Settings
} from 'lucide-react';
import { RealEstateEvent, EventRegistration, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { n8nService } from '../../services/n8n';
import { GoogleGenAI } from "@google/genai";

const Events: React.FC = () => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'hub' | 'manager' | 'guests'>('hub');
  const [events, setEvents] = useState<RealEstateEvent[]>([
    {
      id: 'e1',
      name: 'Luxury Downsizing Seminar',
      dateTime: '2024-11-15T18:00:00',
      location: 'Fairmont Austin - Ballroom C',
      type: 'Seminar',
      description: 'A dedicated session for empty nesters looking to transition to low-maintenance luxury living.',
      faqText: 'Parking is validated for 3 hours. Bring a guest is encouraged. Drinks and heavy appetizers provided.',
      rsvpCount: 42,
      attendeeCount: 0
    },
    {
      id: 'e2',
      name: '2025 Real Estate Market Forecast',
      dateTime: '2024-12-01T11:00:00',
      location: 'Zoom Virtual Link',
      type: 'Webinar',
      description: 'Deep dive into interest rate predictions, local inventory shifts, and investment strategies.',
      faqText: 'The webinar will be recorded. PDF of slides will be sent after. Questions can be asked in the chat.',
      rsvpCount: 156,
      attendeeCount: 0
    }
  ]);

  const [registrations, setRegistrations] = useState<EventRegistration[]>([
    { id: 'reg1', eventId: 'e1', contactId: 'c1', contactName: 'John Smith', status: 'Registered', invitedByAgentId: 'sarah@nexus.com', timestamp: '2h ago' },
    { id: 'reg2', eventId: 'e1', contactId: 'c2', contactName: 'Alice Freeman', status: 'Registered', invitedByAgentId: 'sarah@nexus.com', timestamp: '1d ago' },
    { id: 'reg3', eventId: 'e2', contactId: 'c3', contactName: 'Bob Driller', status: 'Registered', invitedByAgentId: 'mike@nexus.com', timestamp: '3h ago' }
  ]);

  const [selectedEvent, setSelectedEvent] = useState<RealEstateEvent | null>(null);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (role === UserRole.ADMIN || role === UserRole.BROKER) setActiveTab('manager');
    else if (role === UserRole.AGENT) setActiveTab('guests');
    else setActiveTab('hub');
  }, [role]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleCreateEvent = () => {
    alert("Protocol: Launching Event Architect. n8n listener active for high-level sync.");
  };

  const handleSendReminder = async (regId: string) => {
    const reg = registrations.find(r => r.id === regId);
    if (!reg) return;
    
    // Workflow 94: AI Drafted Personal Reminder
    alert(`AI: Drafting hype SMS for ${reg.contactName}. Context: Event e1, Status: Registered.`);
    await n8nService.triggerWorkflow('send-event-reminder', { registrationId: regId });
  };

  const handleAskConcierge = async () => {
    if (!chatInput.trim() || !process.env.API_KEY) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const eventContext = selectedEvent || events[0];
        // Fix: Updated call to follow @google/genai guidelines
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: userMsg,
            config: {
                systemInstruction: `You are the Event Concierge for "${eventContext.name}".
                Details: Location: ${eventContext.location}, Date: ${eventContext.dateTime}, Desc: ${eventContext.description}.
                FAQ Context: ${eventContext.faqText}.
                Goal: Answer guest questions specifically using the FAQ context. If unsure, tell them the agent will follow up.`
            }
        });
        setChatMessages(prev => [...prev, { role: 'model', text: response.text || "I'm checking on that for you." }]);
    } catch (e) {
        setChatMessages(prev => [...prev, { role: 'model', text: "Network interference. Please ask your host!" }]);
    } finally {
        setIsTyping(false);
    }
  };

  const renderAdminView = () => (
    <div className="space-y-6 animate-fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Active RSVPs</p>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{events.reduce((acc, e) => acc + e.rsvpCount, 0)}</h3>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Users size={20}/></div>
            </div>
            <div className="bg-indigo-600 p-5 rounded-2xl shadow-xl text-white relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-indigo-200 text-[9px] font-black uppercase tracking-widest">Show-Up Rate (AI Proj)</p>
                    <h3 className="text-2xl font-black">74.2%</h3>
                </div>
                <PieChart className="absolute right-[-10px] bottom-[-10px] opacity-10" size={64}/>
            </div>
            <button onClick={handleCreateEvent} className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg flex items-center justify-center gap-3 hover:bg-black transition-all group">
                <Plus size={20} className="group-hover:rotate-90 transition-transform"/>
                <span className="font-black uppercase tracking-widest text-xs">Launch New Event</span>
            </button>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Calendar size={18} className="text-indigo-600" /> Professional Event Roster
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        <tr>
                            <th className="p-8">Event Name</th>
                            <th className="p-8">Date & Venue</th>
                            <th className="p-8">Type</th>
                            <th className="p-8 text-center">RSVPs</th>
                            <th className="p-8 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                        {events.map(e => (
                            <tr key={e.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                <td className="p-8">
                                    <div className="font-black text-slate-900 uppercase tracking-tight text-sm">{e.name}</div>
                                </td>
                                <td className="p-8">
                                    <div className="text-slate-700">{new Date(e.dateTime).toLocaleDateString()} @ {new Date(e.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    <div className="text-[9px] text-slate-400 uppercase tracking-widest mt-1 truncate max-w-xs">{e.location}</div>
                                </td>
                                <td className="p-8">
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${e.type === 'Webinar' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                                        {e.type}
                                    </span>
                                </td>
                                <td className="p-8 text-center">
                                    <div className="text-lg font-black text-indigo-600">{e.rsvpCount}</div>
                                    <div className="text-[8px] text-slate-400 uppercase">Confirmed</div>
                                </td>
                                <td className="p-8 text-right">
                                    <button className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-600 rounded-xl transition-all shadow-sm">
                                        <BarChart3 size={16}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );

  const renderAgentView = () => (
    <div className="space-y-6 animate-fade-in-up">
        <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="relative z-10">
                <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2 flex items-center gap-3">
                    <Users size={24} className="text-indigo-400" /> Personal Guest Hub.
                </h3>
                <p className="text-indigo-100 text-sm max-w-lg">Track clients you've invited. AI monitors their engagement patterns and drafts personal HYPER-SMS reminders for maximum attendance.</p>
            </div>
            <div className="relative z-10 bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-md">
                <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">MY INVITE SCORE</p>
                <p className="text-3xl font-black tracking-tighter text-white">84%</p>
            </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-3 h-3" />
                    <input type="text" placeholder="FILTER GUESTS..." className="w-full pl-9 pr-4 py-2 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
                <button className="bg-white border border-slate-200 p-2 rounded-xl text-slate-400"><Filter size={16}/></button>
            </div>
            <div className="divide-y divide-slate-100">
                {registrations.filter(r => r.invitedByAgentId === user?.email).map(reg => (
                    <div key={reg.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-sm border border-indigo-100">
                                {reg.contactName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 uppercase tracking-tight">{reg.contactName}</h4>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                    Status: <span className="text-emerald-600">{reg.status}</span> • {reg.timestamp}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => handleSendReminder(reg.id)}
                                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Bot size={14}/> Send AI Reminder
                            </button>
                            <button className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"><MessageSquare size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );

  const renderClientView = () => (
    <div className="space-y-8 animate-fade-in">
        <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden border-b-8 border-indigo-900">
            <div className="absolute right-0 top-0 p-12 opacity-10 rotate-12"><Calendar size={180}/></div>
            <div className="relative z-10 max-w-xl">
                <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-4 leading-none">Your Next <br/> Experience.</h3>
                <p className="text-indigo-100 text-lg font-medium opacity-90 leading-relaxed mb-8">Elevate your real estate intelligence with our curated private events and digital webinars.</p>
                <button className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                    View All Calendar Slots <ArrowRight size={18}/>
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.map(e => (
                <div key={e.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-lg overflow-hidden flex flex-col group hover:border-indigo-400 transition-all">
                    <div className="p-8 border-b border-slate-50 flex-1">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-3xl ${e.type === 'Webinar' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'} shadow-sm`}>
                                {e.type === 'Webinar' ? <Globe size={24}/> : <Landmark size={24}/>}
                            </div>
                            <span className="bg-slate-900 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-lg">Confirmed</span>
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight italic mb-3 group-hover:text-indigo-600 transition-colors">{e.name}</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6 line-clamp-2">{e.description}</p>
                        
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-slate-700 font-black text-[10px] uppercase tracking-widest">
                                <Clock size={16} className="text-indigo-500"/> {new Date(e.dateTime).toLocaleDateString([], { month: 'long', day: 'numeric' })} @ {new Date(e.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex items-center gap-3 text-slate-700 font-black text-[10px] uppercase tracking-widest">
                                <MapPin size={16} className="text-indigo-500"/> {e.location}
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 flex gap-4">
                        <button className="flex-1 bg-slate-900 text-white py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all">Add to Calendar</button>
                        <button 
                            onClick={() => { setSelectedEvent(e); setIsConciergeOpen(true); }}
                            className="bg-white border-2 border-indigo-600 text-indigo-600 px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-50 transition-all flex items-center gap-2"
                        >
                            <Bot size={16}/> Ask
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Event Hub.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Experiences & Engagement Management</p>
        </div>
        <div className="flex bg-white rounded-xl p-1 border border-slate-200 overflow-x-auto max-w-full scrollbar-hide">
          {[
            { id: 'hub', label: 'Explore', icon: Globe },
            { id: 'manager', label: 'Control', icon: Settings, roles: [UserRole.ADMIN, UserRole.BROKER] },
            { id: 'guests', label: 'Guest List', icon: Users, roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.BROKER] },
          ].filter(t => !t.roles || t.roles.includes(role)).map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'manager' && renderAdminView()}
      {activeTab === 'guests' && renderAgentView()}
      {activeTab === 'hub' && renderClientView()}

      {/* AI EVENT CONCIERGE MODAL (Workflow 94 Client View C) */}
      {isConciergeOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-6">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg h-[600px] flex flex-col overflow-hidden animate-scale-in border border-white/20">
                  <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white shadow-lg shadow-indigo-900/50">
                              <Bot size={28}/>
                          </div>
                          <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter italic">Event Concierge.</h3>
                            <p className="text-indigo-400 text-[9px] font-black uppercase tracking-widest mt-1">V2 Intelligence Active</p>
                          </div>
                      </div>
                      <button onClick={() => { setIsConciergeOpen(false); setChatMessages([]); }} className="p-2 hover:bg-white/10 rounded-full transition-all text-white/50 hover:text-white"><X size={24}/></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50 scrollbar-hide">
                      {chatMessages.length === 0 && (
                          <div className="text-center space-y-4 py-12">
                              <Sparkles size={48} className="mx-auto text-indigo-100" />
                              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Ask me about parking, +1s, or agenda details.</p>
                          </div>
                      )}
                      {chatMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                              <div className={`max-w-[85%] px-5 py-4 rounded-[1.5rem] text-sm font-medium leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'}`}>
                                  {msg.text}
                              </div>
                          </div>
                      ))}
                      {isTyping && (
                          <div className="flex justify-start">
                              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex gap-2">
                                  <Loader2 className="animate-spin text-indigo-600" size={16}/>
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consulting Event FAQ...</span>
                              </div>
                          </div>
                      )}
                      <div ref={chatEndRef} />
                  </div>

                  <div className="p-6 bg-white border-t border-slate-100 flex gap-3">
                      <input 
                        type="text" 
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAskConcierge()}
                        placeholder="ASK CONCIERGE..." 
                        className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-4 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <button 
                        onClick={handleAskConcierge}
                        className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
                      >
                          <Send size={20}/>
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Events;
