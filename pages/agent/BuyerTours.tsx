
import React, { useState, useEffect, useMemo } from 'react';
/* Added Edit3, ExternalLink, and Smartphone to fix missing icon errors */
import { 
  MapPin, Calendar, Clock, Plus, Trash2, 
  RefreshCw, CheckCircle2, ChevronRight, 
  ArrowRight, Navigation, Home, Bot, Sparkles, 
  Download, Send, Loader2, Info, User, 
  Search, ShieldAlert, BadgeCheck, FileText,
  GripVertical, Edit3, ExternalLink, Smartphone,
  LayoutGrid, List, ChevronLeft, MoreVertical,
  Map as MapIcon, SearchCode, Users, Flame, Zap
} from 'lucide-react';
import { Tour, TourStop, Lead } from '../../types';
import { n8nService } from '../../services/n8n';
import { airtableService } from '../../services/airtable';

const MOCK_FAVORITES = [
  { id: 'l1', address: '742 Evergreen Terrace', price: 650000, beds: 4, baths: 3, sqft: 2400, img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400' },
  { id: 'l2', address: '12 Grimmauld Place', price: 625000, beds: 3, baths: 2, sqft: 1800, img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400' },
  { id: 'l3', address: '1313 Mockingbird Lane', price: 850000, beds: 5, baths: 4, sqft: 3200, img: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400' }
];

// Lead Data from CRM for consistency
const MOCK_CRM_LEADS: Lead[] = [
    { 
      id: '1', name: 'Alice Freeman', score: 94, lastActivity: 'Viewed Pricing Page (Just Now)', 
      lastActivityDate: new Date().toISOString(),
      status: 'Hot', source: 'Web Form', tags: ['Cash Buyer', 'Upsize Candidate', 'Urgent'], 
      sentiment: 'Delighted', urgency: 5, intent: 'Seller'
    },
    { 
      id: '2', name: 'Bob Driller', score: 88, lastActivity: 'Searched "Fixer Upper" (15 mins ago)', 
      lastActivityDate: new Date().toISOString(),
      status: 'Nurture', source: 'IDX Search', tags: ['Investor', 'Seller Intent'], 
      sentiment: 'Neutral', urgency: 3, intent: 'Investor'
    },
    { 
      id: '3', name: 'James Litigation', score: 99, lastActivity: 'Opted Out via SMS', 
      lastActivityDate: new Date().toISOString(),
      status: 'Cold', source: 'Twilio', tags: ['Opt-Out'], 
      sentiment: 'Negative', urgency: 1, intent: 'Buyer',
      dncEnabled: true
    }
];

const BuyerTours: React.FC = () => {
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [step, setStep] = useState<'create' | 'optimize' | 'review'>('create');

  // Leads state for buyer selection
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);

  // Manual Search State
  const [manualSearch, setManualSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Persistent Saved Tours List
  const [savedTours, setSavedTours] = useState<Tour[]>([
    {
      id: 'tour_old_1',
      buyerId: 'c1',
      buyerName: 'John Smith',
      agentId: 'agent_1',
      tourDate: '2024-11-01',
      startLocation: 'Nexus HQ',
      startTime: '10:00 AM',
      status: 'SentToBuyer',
      stops: [
        { id: 's1', tourId: 'tour_old_1', propertyId: 'l1', address: '742 Evergreen Terrace', lat: 30.2, lng: -97.7, showDurationMinutes: 30, order: 1, arrivalTime: '10:15 AM', imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400' }
      ]
    }
  ]);

  const [tourDraft, setTourDraft] = useState<Partial<Tour>>({
    buyerId: '',
    buyerName: '',
    tourDate: new Date().toISOString().split('T')[0],
    startTime: '13:00',
    startLocation: 'Nexus Office, Austin TX',
    status: 'Draft',
    stops: []
  });

  // Fetch leads on mount - Sync with CRM data source
  useEffect(() => {
    const fetchLeads = async () => {
      setIsLoadingLeads(true);
      const data = await airtableService.getLeads();
      // If Airtable fails or is empty, use the same mocks as the CRM page
      setLeads(data && data.length > 0 ? data : MOCK_CRM_LEADS);
      setIsLoadingLeads(false);
    };
    fetchLeads();
  }, []);

  const handleStartNewTour = () => {
    setTourDraft({
      id: `tour_${Date.now()}`,
      buyerId: '',
      buyerName: '',
      tourDate: new Date().toISOString().split('T')[0],
      startTime: '13:00',
      startLocation: 'Nexus Office, Austin TX',
      status: 'Draft',
      stops: []
    });
    setStep('create');
    setView('editor');
  };

  const handleBuyerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const leadId = e.target.value;
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      setTourDraft(prev => ({
        ...prev,
        buyerId: lead.id,
        buyerName: lead.name
      }));
    }
  };

  const handleAddStop = (property: any) => {
    const newStop: TourStop = {
      id: `stop_${Date.now()}`,
      tourId: tourDraft.id || 'draft',
      propertyId: property.id,
      address: property.address,
      lat: 30.2672,
      lng: -97.7431,
      showDurationMinutes: 30,
      order: tourDraft.stops?.length || 0,
      arrivalTime: '1:15 PM',
      departureTime: '1:45 PM',
      imageUrl: property.img || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400',
      price: property.price || 0,
      listingAgentName: 'Brenda Broker',
      listingAgentPhone: '512-555-0199',
      internalNotes: 'Lockbox on back door. Beware of dog.'
    };
    setTourDraft(prev => ({ ...prev, stops: [...(prev.stops || []), newStop] }));
  };

  const handleManualLookup = async () => {
    if (!manualSearch.trim()) return;
    setIsSearching(true);
    
    // Simulate API/MLS lookup
    setTimeout(() => {
        const foundProperty = {
            id: `mls_${Date.now()}`,
            address: manualSearch.length > 5 ? manualSearch : `MLS #${manualSearch} - 555 Austin Way`,
            price: 750000,
            img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400'
        };
        handleAddStop(foundProperty);
        setManualSearch('');
        setIsSearching(false);
    }, 1200);
  };

  const handleRemoveStop = (id: string) => {
    setTourDraft(prev => ({ ...prev, stops: prev.stops?.filter(s => s.id !== id) }));
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    await n8nService.optimizeTourRoute(tourDraft);
    
    setTimeout(() => {
        const optimizedStops = (tourDraft.stops || []).map((s, i) => ({
            ...s,
            order: i + 1,
            driveTimeFromPrevMinutes: i === 0 ? 12 : 18,
            arrivalTime: '1:15 PM',
            departureTime: '1:45 PM'
        }));
        setTourDraft(prev => ({ ...prev, stops: optimizedStops, status: 'Optimized' }));
        setIsOptimizing(false);
        setStep('optimize');
    }, 2000);
  };

  const handleApproveAndSend = async () => {
      setIsSending(true);
      await n8nService.approveAndSendTour(tourDraft.id || 'draft');
      setTimeout(() => {
          const finalTour = { ...tourDraft, status: 'SentToBuyer' as const } as Tour;
          setTourDraft(finalTour);
          // Save to persistent list
          setSavedTours(prev => {
              const exists = prev.find(t => t.id === finalTour.id);
              if (exists) return prev.map(t => t.id === finalTour.id ? finalTour : t);
              return [finalTour, ...prev];
          });
          setIsSending(false);
          setStep('review');
          alert("Success: Branded Buyer Itinerary dispatched via GHL. SMS link sent to " + tourDraft.buyerName);
      }, 1500);
  };

  const handleOpenTour = (tour: Tour) => {
      setTourDraft(tour);
      if (tour.status === 'SentToBuyer') setStep('review');
      else if (tour.status === 'Optimized') setStep('optimize');
      else setStep('create');
      setView('editor');
  };

  const selectedLead = useMemo(() => leads.find(l => l.id === tourDraft.buyerId), [leads, tourDraft.buyerId]);

  return (
    <div className="space-y-6 pb-20 animate-fade-in max-w-6xl mx-auto">
      
      {/* List View: Tour Registry */}
      {view === 'list' && (
          <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">Tour Registry.</h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Manage and Track Buyer Routes</p>
                </div>
                <button 
                    onClick={handleStartNewTour}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus size={18}/> Create New Tour
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedTours.map(tour => (
                      <div key={tour.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-lg overflow-hidden flex flex-col group hover:border-indigo-400 transition-all">
                          <div className="p-8 flex-1">
                              <div className="flex justify-between items-start mb-6">
                                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner">
                                      <Navigation size={24}/>
                                  </div>
                                  <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${
                                      tour.status === 'SentToBuyer' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                      tour.status === 'Optimized' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                      'bg-slate-50 text-slate-500 border-slate-200'
                                  }`}>{tour.status.replace(/([A-Z])/g, ' $1').trim()}</span>
                              </div>
                              <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight italic mb-1">{tour.buyerName}</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6 flex items-center gap-1.5">
                                  <Calendar size={12}/> {new Date(tour.tourDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                              
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                                  <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                      <span className="text-slate-400">Total Stops</span>
                                      <span className="text-slate-900">{tour.stops.length} Properties</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                      <span className="text-slate-400">Start Time</span>
                                      <span className="text-slate-900">{tour.startTime}</span>
                                  </div>
                              </div>
                          </div>
                          <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                              <button 
                                onClick={() => handleOpenTour(tour)}
                                className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm active:scale-95"
                              >
                                Open Tour
                              </button>
                              <button className="p-3 bg-white border border-slate-200 text-slate-300 hover:text-red-500 rounded-xl transition-all"><Trash2 size={16}/></button>
                          </div>
                      </div>
                  ))}
                  {savedTours.length === 0 && (
                      <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                          <Navigation size={48} className="mx-auto text-slate-100 mb-4" />
                          <h3 className="text-xl font-black text-slate-400 uppercase italic">No Active Tours.</h3>
                          <p className="text-xs text-slate-400 font-bold uppercase mt-2">Initialize your first route by clicking "Create New Tour"</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Editor View: Step-by-step creation */}
      {view === 'editor' && (
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                <button onClick={() => setView('list')} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                    <ChevronLeft size={14}/> Back to Registry
                </button>
                <div className="flex gap-2">
                    {[
                        { id: 'create', label: '1. Build' },
                        { id: 'optimize', label: '2. Route' },
                        { id: 'review', label: '3. Dispatch' }
                    ].map(s => (
                        <div key={s.id} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border transition-all ${step === s.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-300 border-slate-100'}`}>
                            {s.label}
                        </div>
                    ))}
                </div>
            </div>

            {step === 'create' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                            <h3 className="text-lg font-black italic tracking-tighter uppercase mb-6">Tour Parameters</h3>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 flex justify-between">
                                        <span>Touring Client</span>
                                        {selectedLead && (
                                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                                                selectedLead.status === 'Hot' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                            }`}>
                                                {selectedLead.status} • {selectedLead.score}% Score
                                            </span>
                                        )}
                                    </label>
                                    <div className="relative">
                                        <select 
                                          value={tourDraft.buyerId}
                                          onChange={handleBuyerChange}
                                          className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 appearance-none transition-all"
                                        >
                                          <option value="" disabled>Select Buyer from CRM...</option>
                                          {leads.map(lead => (
                                            <option key={lead.id} value={lead.id} disabled={lead.dncEnabled}>
                                                {lead.name} {lead.status === 'Hot' ? '🔥' : ''} ({lead.intent}) - {lead.score}%
                                            </option>
                                          ))}
                                        </select>
                                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                          <ChevronRight className="rotate-90" size={16}/>
                                        </div>
                                    </div>
                                    {isLoadingLeads && <p className="text-[8px] text-indigo-500 font-bold uppercase px-1 mt-1 animate-pulse">Syncing lead roster...</p>}
                                </div>

                                {selectedLead && (
                                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl animate-fade-in">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Bot size={14} className="text-indigo-600"/>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Client Context</p>
                                        </div>
                                        <p className="text-[11px] text-slate-600 italic leading-relaxed font-medium">"{selectedLead.aiSummary}"</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Tour Date</label>
                                        <input type="date" value={tourDraft.tourDate} onChange={e => setTourDraft({...tourDraft, tourDate: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Start Time</label>
                                        <input type="time" value={tourDraft.startTime} onChange={e => setTourDraft({...tourDraft, startTime: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Origin Point</label>
                                    <div className="relative">
                                        <input type="text" value={tourDraft.startLocation} onChange={e => setTourDraft({...tourDraft, startLocation: e.target.value})} className="w-full p-4 pl-11 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" placeholder="Enter starting address..." />
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={18}/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-8 shadow-inner">
                            <div className="flex items-center gap-3 mb-4">
                                <Bot size={20} className="text-indigo-600"/>
                                <h4 className="font-black text-xs uppercase tracking-widest text-indigo-900">Routing Agent</h4>
                            </div>
                            <p className="text-[11px] text-indigo-700 leading-relaxed font-medium italic">
                                "I'll analyze traffic patterns for next Friday and ensure the route follows a logical loop starting from the {tourDraft.startLocation}."
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-lg font-black italic tracking-tighter uppercase">Itinerary Stops</h3>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">{tourDraft.stops?.length || 0} Properties</span>
                            </div>

                            {/* Manual Property Lookup Input */}
                            <div className="mb-10 bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                    <SearchCode size={14} className="text-indigo-600" /> Manual Add by Address or MLS ID
                                </h4>
                                <div className="flex gap-3">
                                    <div className="relative flex-1 group">
                                        <input 
                                            type="text" 
                                            value={manualSearch}
                                            onChange={e => setManualSearch(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleManualLookup()}
                                            placeholder="Type address or MLS#..."
                                            className="w-full p-4 pl-12 bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                                        />
                                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <button 
                                        onClick={handleManualLookup}
                                        disabled={isSearching || !manualSearch.trim()}
                                        className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16}/>}
                                        Lookup & Add
                                    </button>
                                </div>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest ml-1">Nexus AI will crawl internal vault and MLS archives instantly.</p>
                            </div>

                            <div className="space-y-4 mb-10">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Selected Properties</h4>
                                {tourDraft.stops?.map((stop, i) => (
                                    <div key={stop.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl overflow-hidden border border-slate-200 shrink-0">
                                                <img src={stop.imageUrl} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-800 text-xs uppercase">{stop.address}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold tracking-widest">${(stop.price || 0).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleRemoveStop(stop.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                                {(tourDraft.stops?.length || 0) === 0 && (
                                    <div className="py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                        <Home size={32} className="mx-auto text-slate-200 mb-2"/>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No properties added to this tour</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Suggested from Buyer's Favorites</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {MOCK_FAVORITES.map(prop => (
                                        <button 
                                            key={prop.id} 
                                            onClick={() => handleAddStop(prop)}
                                            disabled={tourDraft.stops?.some(s => s.propertyId === prop.id)}
                                            className="p-4 bg-white border border-slate-200 rounded-2xl text-left flex items-center gap-4 hover:border-indigo-400 hover:shadow-lg transition-all disabled:opacity-50"
                                        >
                                            <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                                                <img src={prop.img} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <h5 className="font-black text-slate-900 text-xs truncate uppercase">{prop.address}</h5>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-bold text-indigo-600 tracking-tighter">${(prop.price/1000).toFixed(0)}k</span>
                                                    <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">{prop.beds}B/{prop.baths}B</span>
                                                </div>
                                            </div>
                                            <Plus size={16} className="ml-auto text-slate-300 group-hover:text-indigo-600" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-slate-100">
                                <button 
                                    onClick={handleOptimize}
                                    disabled={isOptimizing || (tourDraft.stops?.length || 0) < 1 || !tourDraft.buyerId}
                                    className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.25em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                >
                                    {isOptimizing ? <Loader2 size={20} className="animate-spin"/> : <Sparkles size={20}/>}
                                    Generate Optimized Smart Route
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {step === 'optimize' && (
                <div className="space-y-6 animate-fade-in-up">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col lg:flex-row">
                        <div className="lg:w-[400px] border-r border-slate-100 p-8 space-y-8 h-[600px] overflow-y-auto scrollbar-hide shrink-0">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black italic tracking-tighter uppercase">Smart Timeline</h3>
                                <button onClick={() => setStep('create')} className="text-[9px] font-black text-indigo-600 uppercase hover:underline">Edit Stops</button>
                            </div>
                            <div className="space-y-0 relative">
                                <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-slate-100" />
                                <div className="flex items-start gap-6 relative mb-12">
                                    <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xl z-10 shrink-0 border-4 border-white">
                                        <Navigation size={18}/>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Start</p>
                                        <h4 className="font-black text-slate-900 text-sm uppercase leading-tight">{tourDraft.startLocation}</h4>
                                        <p className="text-[10px] font-bold text-indigo-600 mt-0.5 tracking-widest uppercase">{tourDraft.startTime} Departure</p>
                                    </div>
                                </div>

                                {tourDraft.stops?.map((stop, i) => (
                                    <div key={stop.id} className="space-y-12">
                                        <div className="ml-[23px] pl-10 py-2 border-l-2 border-indigo-50 flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
                                            <Clock size={12} className="text-indigo-400"/> Drive {stop.driveTimeFromPrevMinutes} mins
                                        </div>
                                        <div className="flex items-start gap-6 relative">
                                            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xl z-10 shrink-0 border-4 border-white font-black text-sm italic">
                                                {i + 1}
                                            </div>
                                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex-1 group hover:border-indigo-400 transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">{stop.arrivalTime} - {stop.departureTime}</p>
                                                    <button className="text-slate-300 group-hover:text-indigo-600"><GripVertical size={14}/></button>
                                                </div>
                                                <h4 className="font-black text-slate-900 text-xs uppercase leading-tight">{stop.address}</h4>
                                                <div className="mt-3 flex gap-2">
                                                    <span className="bg-white px-2 py-0.5 rounded text-[8px] font-black text-slate-400 border border-slate-100">{stop.showDurationMinutes} Min Show</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 bg-slate-50 p-8 flex flex-col">
                            <div className="flex-1 rounded-[2rem] bg-white border border-slate-200 shadow-inner p-8 space-y-8 overflow-y-auto scrollbar-hide">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-6">
                                    <h3 className="text-2xl font-black italic tracking-tighter uppercase">Internal Agent Intel</h3>
                                    <div className="flex gap-2">
                                        <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 transition-all"><Edit3 size={18}/></button>
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    {tourDraft.stops?.map((stop, i) => (
                                        <div key={stop.id} className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                                            <div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-indigo-600 italic shadow-sm">{i+1}</div>
                                                    <h4 className="font-black text-slate-800 uppercase tracking-tight">{stop.address}</h4>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Listing Agent Contact</p>
                                                        <p className="text-sm font-black text-slate-800 uppercase">{stop.listingAgentName}</p>
                                                        <p className="text-[10px] text-indigo-600 font-bold mt-0.5">{stop.listingAgentPhone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><ShieldAlert size={12} className="text-orange-500"/> Showing Instructions (Agent ONLY)</p>
                                                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                                                    <p className="text-xs text-amber-900 font-bold leading-relaxed italic">"{stop.internalNotes}"</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 flex gap-4">
                                <button onClick={handleOptimize} className="flex-1 bg-white border-2 border-slate-200 text-slate-700 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-2">
                                    <RefreshCw size={16}/> Re-Optimize
                                </button>
                                <button 
                                    onClick={handleApproveAndSend}
                                    disabled={isSending}
                                    className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.15em] shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-indigo-900"
                                >
                                    {isSending ? <Loader2 size={18} className="animate-spin"/> : <Send size={18}/>}
                                    Approve & Push to Buyer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {step === 'review' && (
                <div className="space-y-8 animate-fade-in-up">
                    <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 flex items-center justify-center"><CheckCircle2 size={300} className="text-emerald-500"/></div>
                        <div className="relative z-10 space-y-6">
                            <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl animate-bounce-subtle">
                                <BadgeCheck size={48} className="text-white"/>
                            </div>
                            <div className="max-w-xl mx-auto">
                                <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-2 leading-none">Itinerary Dispatched.</h3>
                                <p className="text-indigo-200 text-lg font-medium opacity-90">The tour is live. Branded documents generated and synced with your buyer's portal.</p>
                            </div>
                            <div className="flex justify-center gap-4">
                                <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-50 active:scale-95 transition-all flex items-center gap-2">
                                    <Download size={16}/> Agent Itinerary (PDF)
                                </button>
                                <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-500 active:scale-95 transition-all flex items-center gap-2">
                                    <ExternalLink size={16}/> View Buyer Portal
                                </button>
                            </div>
                            <button onClick={() => setView('list')} className="text-indigo-400 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors block mx-auto">Back to Tour Registry</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                            <h4 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><Smartphone size={16} className="text-indigo-600"/> Delivery Audit</h4>
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center"><CheckCircle2 size={16}/></div>
                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">GHL SMS Broadcast</span>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-300">Sent Oct 31, 2:05 PM</span>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center"><CheckCircle2 size={16}/></div>
                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Email Itinerary</span>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-300">Sent Oct 31, 2:05 PM</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm flex flex-col justify-center text-center">
                            <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-2">Total Tour Duration</h4>
                            <p className="text-4xl font-black text-slate-900 tracking-tighter italic tabular-nums">2h 45m</p>
                            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-2">Includes 45m Total Drive Time</p>
                        </div>
                    </div>
                </div>
            )}
          </div>
      )}
    </div>
  );
};

export default BuyerTours;
