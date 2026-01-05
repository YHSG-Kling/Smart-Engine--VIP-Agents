import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, MapPin, Users, Zap, Clock, Globe, 
  Link as LinkIcon, Filter, Search, MoreVertical, 
  CheckCircle2, XCircle, ChevronRight, AlertTriangle, 
  Bot, RefreshCw, Smartphone, Mail, MousePointerClick,
  LayoutList, ClipboardCheck, ArrowRight, Kanban as KanbanIcon,
  Loader2, Key, ShieldCheck, Eye, EyeOff, Send, FileDown,
  Home, Sparkles,
  ChevronLeft, MessageSquare, AlertCircle, UserX, History,
  Phone, Navigation, CheckSquare,
  Map as MapIcon, Play, StopCircle, Car, Droplets,
  Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, Showing, Tour } from '../../types';
import { n8nService } from '../../services/n8n';
import L from 'leaflet';

const ShowingsDesk: React.FC = () => {
  const { role, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'queue' | 'itinerary' | 'reports'>('queue');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [showings, setShowings] = useState<Showing[]>([
    { id: 'sh1', propertyId: 'l1', leadId: 'lead1', address: '123 Main St', leadName: 'Alice Freeman', requestedTime: 'Saturday, 2:00 PM', status: 'Requested', isPreQualified: true },
    { id: 'sh2', propertyId: 'l2', leadId: 'lead2', address: '456 Oak Ave', leadName: 'Bob Driller', requestedTime: 'Sunday, 11:00 AM', status: 'Pending Seller Confirm', isPreQualified: true },
    { id: 'sh3', propertyId: 'l1', leadId: 'lead3', address: '123 Main St', leadName: 'Charlie Day', requestedTime: 'Saturday, 4:00 PM', status: 'Confirmed', isPreQualified: true, lockboxCode: '1992', alarmCode: 'None' },
  ]);

  const [activeTour] = useState<Tour>({
    id: 'tour_today',
    buyerId: 'lead1',
    buyerName: 'Alice Freeman',
    agentId: user?.id || 'agent_1',
    tourDate: 'Today, Nov 3',
    startLocation: 'Nexus HQ',
    startTime: '1:00 PM',
    status: 'Optimized',
    stops: [
        { id: 's1', tourId: 'tour_today', propertyId: 'l1', address: '123 Main St', lat: 30.2672, lng: -97.7431, showDurationMinutes: 30, order: 1, arrivalTime: '1:15 PM', driveTimeFromPrevMinutes: 15, imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400' },
        { id: 's2', tourId: 'tour_today', propertyId: 'l2', address: '456 Oak Ave', lat: 30.2872, lng: -97.7231, showDurationMinutes: 30, order: 2, arrivalTime: '2:10 PM', driveTimeFromPrevMinutes: 25, imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400' },
        { id: 's3', tourId: 'tour_today', propertyId: 'l3', address: '789 Skyline Dr', lat: 30.2472, lng: -97.7631, showDurationMinutes: 30, order: 3, arrivalTime: '3:05 PM', driveTimeFromPrevMinutes: 25, imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400' }
    ]
  });

  useEffect(() => {
    if (activeTab === 'itinerary' && mapContainerRef.current && !mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
            center: [30.2672, -97.7431],
            zoom: 13,
            zoomControl: false,
            attributionControl: false
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);
        
        activeTour.stops.forEach((stop, i) => {
            const customIcon = L.divIcon({
                className: 'custom-tour-icon',
                html: `<div style="background-color: #4f46e5; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); font-size: 10px;">${i+1}</div>`,
                iconSize: [20, 20]
            });
            L.marker([stop.lat, stop.lng], { icon: customIcon }).addTo(map);
        });

        mapInstanceRef.current = map;
    }

    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    };
  }, [activeTab]);

  const handleApproveAndPropose = async (showingId: string) => {
      setIsProcessing(showingId);
      await n8nService.triggerAvailabilityProposal(showingId);
      setTimeout(() => {
          setShowings(prev => prev.map(s => s.id === showingId ? { ...s, status: 'Picking Slots' } : s));
          setIsProcessing(null);
          alert("Smart Engine AI: Showing approved. I've cross-referenced your calendar and proposed 3 slots to the client via SMS.");
      }, 1500);
  };

  const handleGenBriefing = async (id: string) => {
    setIsProcessing(id);
    await n8nService.triggerBriefingGeneration(id);
    setTimeout(() => {
        setIsProcessing(null);
        alert("Smart Engine AI: Personalized property briefing sent to Client's portal.");
    }, 1200);
  };

  return (
    <div className="space-y-4 animate-fade-in-up pb-10 max-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-lg font-black text-slate-800 uppercase italic tracking-tighter leading-none">Showings Hub.</h2>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Workflow 122: Autonomous Confirmation Protocols</p>
        </div>
        <div className="flex gap-2">
            <div className="flex bg-white rounded-lg p-0.5 border border-slate-200 shadow-sm overflow-x-auto scrollbar-hide max-w-full">
                <button onClick={() => setActiveTab('queue')} className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${activeTab === 'queue' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <LayoutList size={12}/> Incoming Queue
                </button>
                <button onClick={() => setActiveTab('itinerary')} className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${activeTab === 'itinerary' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <Navigation size={12}/> Routing Plan
                </button>
            </div>
        </div>
      </div>

      {activeTab === 'queue' && (
          <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Queue Depth</p>
                      <h3 className="text-xl font-black text-slate-900 tracking-tighter italic">{showings.length} Requests</h3>
                  </div>
                  <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg text-white flex flex-col justify-center relative overflow-hidden border-b-4 border-indigo-900">
                      <p className="text-indigo-300 text-[8px] font-black uppercase tracking-widest mb-0.5">Auto-Confirm Rate</p>
                      <h3 className="text-xl font-black tracking-tighter">84%</h3>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Next Showing</p>
                      <h3 className="text-xl font-black text-emerald-600 tracking-tighter italic uppercase leading-none">In 24m</h3>
                  </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      <h3 className="font-black text-[9px] text-slate-800 uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <Calendar size={14} className="text-indigo-600" /> Showing Operations
                      </h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                      {showings.map(s => (
                          <div key={s.id} className="p-4 hover:bg-slate-50 transition-all group flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm italic border shadow-inner shrink-0 ${
                                      s.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                      s.status === 'Requested' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                      'bg-slate-100 text-slate-400 border-slate-200'
                                  }`}>
                                      {s.address[0]}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                          <h4 className="font-black text-slate-900 uppercase tracking-tight text-xs italic truncate group-hover:text-indigo-600 transition-colors">{s.address}</h4>
                                          <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase border shrink-0 ${
                                              s.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                              s.status === 'Requested' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                              'bg-slate-100 text-slate-500'
                                          }`}>{s.status}</span>
                                      </div>
                                      <div className="flex items-center gap-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                          <span className="flex items-center gap-1"><Users size={10} className="text-indigo-500"/> {s.leadName}</span>
                                          <span className="flex items-center gap-1"><Clock size={10} className="text-indigo-500"/> {s.requestedTime}</span>
                                      </div>
                                  </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto">
                                  {s.status === 'Requested' ? (
                                      <button 
                                        onClick={() => handleApproveAndPropose(s.id)}
                                        disabled={isProcessing === s.id}
                                        className="flex-1 lg:flex-none bg-indigo-600 text-white px-4 py-2 rounded-xl font-black uppercase text-[8px] tracking-widest shadow hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 border-b-2 border-indigo-800"
                                      >
                                          {isProcessing === s.id ? <Loader2 size={10} className="animate-spin"/> : <Zap size={10}/>}
                                          Propose
                                      </button>
                                  ) : (
                                      <button 
                                        onClick={() => handleGenBriefing(s.id)}
                                        disabled={isProcessing === s.id}
                                        className="flex-1 lg:flex-none bg-slate-900 text-white px-4 py-2 rounded-xl font-black uppercase text-[8px] tracking-widest shadow hover:bg-black transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                                      >
                                          {isProcessing === s.id ? <Loader2 size={10} className="animate-spin"/> : <Bot size={10}/>}
                                          Briefing
                                      </button>
                                  )}
                                  <button className="p-2 bg-white border border-slate-100 text-slate-300 hover:text-indigo-600 rounded-xl transition-all"><MoreVertical size={16}/></button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'itinerary' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-fade-in h-[calc(100vh-220px)] overflow-hidden">
              {/* LEFT: Map Preview & Context */}
              <div className="lg:col-span-4 flex flex-col gap-4 h-full overflow-y-auto pr-1 scrollbar-hide">
                  <div className="bg-slate-900 rounded-[1.5rem] p-4 text-white shadow-lg relative overflow-hidden border-b-4 border-indigo-600 shrink-0">
                      <div className="absolute right-0 top-0 p-2 opacity-10 rotate-12"><Navigation size={80}/></div>
                      <div className="relative z-10">
                          <h3 className="text-lg font-black italic tracking-tighter uppercase mb-0.5">Today's Path.</h3>
                          <p className="text-indigo-200 text-[10px] font-medium mb-4">{activeTour.tourDate} • {activeTour.buyerName}</p>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                              <div className="bg-white/10 p-2 rounded-xl border border-white/10">
                                  <p className="text-[7px] font-black text-indigo-300 uppercase tracking-widest mb-0.5">Stops</p>
                                  <p className="text-base font-black">{activeTour.stops.length}</p>
                              </div>
                              <div className="bg-white/10 p-2 rounded-xl border border-white/10">
                                  <p className="text-[7px] font-black text-indigo-300 uppercase tracking-widest mb-0.5">Drive</p>
                                  <p className="text-base font-black">65m</p>
                              </div>
                          </div>
                          <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-black uppercase text-[8px] tracking-widest shadow-lg flex items-center justify-center gap-1.5 hover:bg-indigo-500 transition-all border-b-2 border-indigo-800 active:scale-95">
                              <Play size={10} fill="currentColor"/> Field Mode
                          </button>
                      </div>
                  </div>

                  <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden flex-1 min-h-[200px] flex flex-col">
                      <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 shrink-0">
                          <MapIcon size={12} className="text-indigo-600" />
                          <h4 className="text-[8px] font-black text-slate-800 uppercase tracking-widest">Geo Overview</h4>
                      </div>
                      <div ref={mapContainerRef} className="flex-1 w-full bg-slate-100" />
                  </div>
              </div>

              {/* RIGHT: Timeline Scroll */}
              <div className="lg:col-span-8 bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-4 md:p-6 flex flex-col h-full overflow-hidden">
                  <div className="flex justify-between items-center mb-6 shrink-0">
                      <div>
                        <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none">Live Routing.</h3>
                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-0.5">WF-SHOW-01: Optimized Sequence</p>
                      </div>
                      <div className="flex gap-2 items-center bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-1 text-[7px] font-black text-slate-400 uppercase tracking-widest px-1.5 border-r border-slate-200">
                              <Droplets size={10} className="text-blue-500"/> Rain: 0m
                          </div>
                          <div className="flex items-center gap-1 text-[7px] font-black text-slate-400 uppercase tracking-widest px-1.5">
                              <Activity size={10} className="text-emerald-500"/> Traffic: OK
                          </div>
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto scrollbar-hide space-y-0 relative pr-2">
                      {/* Vertical line */}
                      <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100" />

                      <div className="flex items-start gap-6 relative mb-8">
                          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md z-10 shrink-0 border-4 border-white">
                              <Home size={14}/>
                          </div>
                          <div className="pt-1.5">
                              <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Departure</p>
                              <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight italic">{activeTour.startLocation}</h4>
                              <p className="text-[10px] font-bold text-indigo-600 mt-0.5">{activeTour.startTime}</p>
                          </div>
                      </div>

                      {activeTour.stops.map((stop, i) => (
                          <div key={stop.id} className="mb-8">
                              <div className="ml-[19px] pl-6 mb-4 border-l-2 border-dashed border-indigo-50 py-1 flex items-center gap-2">
                                  <div className="p-1 bg-indigo-50 rounded-md text-indigo-600"><Car size={10}/></div>
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Drive: {stop.driveTimeFromPrevMinutes}m</p>
                              </div>

                              <div className="flex items-start gap-6 relative">
                                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg z-10 shrink-0 border-4 border-white font-black text-sm italic">
                                      {i + 1}
                                  </div>
                                  <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row justify-between gap-4 group hover:border-indigo-400 transition-all hover:bg-white">
                                      <div className="flex gap-4">
                                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 shadow-inner">
                                              <img src={stop.imageUrl} className="w-full h-full object-cover" />
                                          </div>
                                          <div>
                                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight italic">{stop.address}</h4>
                                                  <span className="bg-indigo-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-sm">{stop.arrivalTime}</span>
                                              </div>
                                              <div className="flex items-center gap-3 text-[8px] font-black text-slate-400 uppercase tracking-[0.15em]">
                                                  <span className="flex items-center gap-1"><Smartphone size={9} className="text-indigo-400"/> L-Box</span>
                                                  <span className="flex items-center gap-1"><Clock size={9} className="text-indigo-400"/> {stop.showDurationMinutes}m</span>
                                              </div>
                                          </div>
                                      </div>
                                      <div className="flex flex-row md:flex-col gap-2 shrink-0">
                                          <button className="flex-1 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-md flex items-center justify-center gap-1.5 hover:bg-black transition-all">
                                              <Navigation size={10}/> Go
                                          </button>
                                          <button className="flex-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-400 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:text-indigo-600 transition-all">
                                              <Key size={10}/> Key
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ))}

                      <div className="flex items-start gap-6 relative mt-8">
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center z-10 shrink-0 border-4 border-white">
                              <RefreshCw size={14}/>
                          </div>
                          <div className="pt-1.5 pb-6">
                              <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Completion</p>
                              <h4 className="text-xs font-black text-slate-300 uppercase tracking-tight italic">Return to Origin</h4>
                              <p className="text-[8px] font-bold text-slate-300 mt-0.5 uppercase tracking-widest">Est. 3:45 PM</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ShowingsDesk;