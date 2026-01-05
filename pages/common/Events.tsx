
import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, MapPin, Users, Plus, ChevronRight, 
  Search, Filter, BarChart3, Bot, Send, Sparkles, 
  CheckCircle2, Clock, X, MessageSquare, Download,
  ExternalLink, Loader2, PieChart, Landmark,
  ArrowRight, Globe, Settings, RefreshCw, Activity,
  Trophy, Zap
} from 'lucide-react';
import { RealEstateEvent, EventRegistration, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { n8nService } from '../../services/n8n';
import { GoogleGenAI } from "@google/genai";

const Events: React.FC = () => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'hub' | 'manager' | 'guests'>('hub');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
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

  const handleSendReminder = async (regId: string) => {
    setIsProcessing(regId);
    await n8nService.triggerWorkflow('send-event-reminder', { registrationId: regId });
    setTimeout(() => {
        setIsProcessing(null);
        alert(`AI: Personal reminder dispatched to guest.`);
    }, 1000);
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

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <div className="flex bg-white rounded-xl p-1 border border-slate-200 w-fit shadow-md mb-8">
          {[
              { id: 'hub', label: 'Event Hub', icon: Globe },
              { id: 'manager', label: 'Command', icon: Settings, hide: role === UserRole.BUYER || role === UserRole.SELLER },
              { id: 'guests', label: 'Guest List', icon: Users, hide: role === UserRole.BUYER || role === UserRole.SELLER },
          ].filter(t => !t.hide).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                <tab.icon size={14} /> {tab.label}
            </button>
          ))}
      </div>

      {activeTab === 'hub' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {events.map(event => (
                <div key={event.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden group hover:border-indigo-400 transition-all">
                    <div className="h-48 bg-slate-900 relative">
                        <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                        <div className="absolute bottom-6 left-8">
                            <span className="bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest mb-2 inline-block shadow-lg">{event.type}</span>
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{event.name}</h3>
                        </div>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="flex gap-6">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                <Calendar size={16} className="text-indigo-600" /> {new Date(event.dateTime).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                <MapPin size={16} className="text-indigo-600" /> {event.location.split('-')[0]}
                            </div>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">{event.description}</p>
                        <div className="flex gap-4 pt-4">
                            <button className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all">RSVP Now</button>
                            <button onClick={() => { setSelectedEvent(event); setIsConciergeOpen(true); }} className="px-6 bg-indigo-50 text-indigo-600 rounded-xl font-black uppercase text-[10px] tracking-widest border border-indigo-100 flex items-center gap-2 hover:bg-indigo-100 transition-all">
                                <Bot size={16}/> Ask AI
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}

      {activeTab === 'manager' && (
        <div className="space-y-8 animate-fade-in-up">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Calendar size={200}/></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="max-w-xl">
                        <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-4 leading-none">Event Command.</h3>
                        <p className="text-indigo-100 text-lg font-medium opacity-90 leading-relaxed mb-8">Orchestrate seminars, webinars, and mixers. Workflow 94 handles high-frequency RSVPs and automated nurture sequences.</p>
                        <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-500 active:scale-95 transition-all flex items-center gap-2 border-b-4 border-indigo-900">
                            <Plus size={20}/> Launch New Event
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 shrink-0">
                        <div className="bg-white/10 p-4 rounded-2xl border border-white/10 text-center min-w-[120px]">
                            <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">TOTAL RSVPS</p>
                            <p className="text-2xl font-black">{events.reduce((acc, e) => acc + e.rsvpCount, 0)}</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl border border-white/10 text-center min-w-[120px]">
                            <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">CONVERSION</p>
                            <p className="text-2xl font-black italic">14%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        <tr>
                            <th className="p-8">Event Entity</th>
                            <th className="p-8">Engagement</th>
                            <th className="p-8">Logistics</th>
                            <th className="p-8 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                        {events.map(e => (
                            <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-8">
                                    <div className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">{e.name}</div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{e.type}</p>
                                </td>
                                <td className="p-8">
                                    <div className="flex items-center gap-4">
                                        <span className="text-lg font-black text-indigo-600 tabular-nums">{e.rsvpCount}</span>
                                        <p className="text-[8px] text-slate-400 uppercase font-black leading-none">Confirmed <br/> RSVPs</p>
                                    </div>
                                </td>
                                <td className="p-8 text-slate-500">
                                    <div className="flex items-center gap-2"><Clock size={12}/> {new Date(e.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                                </td>
                                <td className="p-8 text-right">
                                    <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><ChevronRight size={20}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {activeTab === 'guests' && (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden animate-fade-in-up">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-10">
                  <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Users size={18} className="text-indigo-600" /> Guest Registry
                  </h3>
                  <div className="flex gap-2">
                      <div className="relative w-64">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-3 h-3" />
                         <input type="text" placeholder="FILTER GUESTS..." className="w-full pl-9 pr-4 py-2 text-[9px] font-black uppercase border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 shadow-inner" />
                      </div>
                      <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"><RefreshCw size={18}/></button>
                  </div>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          <tr>
                              <th className="p-8">Guest Name</th>
                              <th className="p-8">Target Event</th>
                              <th className="p-8">Status</th>
                              <th className="p-8">Host Agent</th>
                              <th className="p-8 text-right">Protocol</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                          {registrations.map(reg => (
                              <tr key={reg.id} className="hover:bg-slate-50 transition-colors group">
                                  <td className="p-8">
                                      <div className="font-black text-slate-900 uppercase tracking-tight">{reg.contactName}</div>
                                      <div className="text-[8px] text-slate-400 uppercase font-black mt-1">Ref: {reg.contactId}</div>
                                  </td>
                                  <td className="p-8 text-slate-600 uppercase italic">
                                      {events.find(e => e.id === reg.eventId)?.name}
                                  </td>
                                  <td className="p-8">
                                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[8px] font-black uppercase border border-emerald-100">{reg.status}</span>
                                  </td>
                                  <td className="p-8 text-slate-400 font-bold uppercase">{reg.invitedByAgentId.split('@')[0]}</td>
                                  <td className="p-8 text-right">
                                      <button 
                                        onClick={() => handleSendReminder(reg.id)}
                                        disabled={isProcessing === reg.id}
                                        className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2 ml-auto"
                                      >
                                          {isProcessing === reg.id ? <Loader2 size={12} className="animate-spin"/> : <Zap size={12}/>}
                                          AI Reminder
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* AI Concierge Chat Drawer */}
      {isConciergeOpen && (
          <div className="fixed inset-0 z-[1000] bg-slate-950/40 backdrop-blur-md flex justify-end">
              <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                  <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0 border-b-8 border-indigo-600">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl"><Bot size={24}/></div>
                          <div>
                              <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none">Event Concierge.</h3>
                              <p className="text-indigo-400 text-[9px] font-bold uppercase tracking-widest mt-1.5">Context: {selectedEvent?.name}</p>
                          </div>
                      </div>
                      <button onClick={() => setIsConciergeOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24}/></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 space-y-6 scrollbar-hide">
                      {chatMessages.length === 0 && (
                          <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-30">
                              <Sparkles size={48} className="mb-4 text-indigo-200" />
                              <p className="font-black uppercase tracking-[0.2em] text-[10px]">Awaiting Queries</p>
                          </div>
                      )}
                      {chatMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                              <div className={`max-w-[85%] rounded-[1.5rem] p-5 text-sm font-bold leading-relaxed shadow-sm ${
                                  msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
                              }`}>
                                  {msg.text}
                              </div>
                          </div>
                      ))}
                      {isTyping && (
                          <div className="flex justify-start">
                              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-100" />
                                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-200" />
                              </div>
                          </div>
                      )}
                      <div ref={chatEndRef} />
                  </div>

                  <div className="p-8 bg-white border-t border-slate-100 shrink-0">
                      <div className="flex gap-2">
                          <input 
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAskConcierge()}
                            placeholder="Ask about location, parking, or details..."
                            className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                          />
                          <button onClick={handleAskConcierge} className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95"><Send size={20}/></button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Events;
