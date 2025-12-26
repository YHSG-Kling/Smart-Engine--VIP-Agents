import React, { useMemo, useState, useEffect } from 'react';
import { 
  Heart, X, MapPin, BedDouble, Bath, Ruler, 
  Sparkles, Info, Check, ArrowRight, TrendingUp, Briefcase, RefreshCw, 
  ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight, Share2, Search,
  DollarSign, SlidersHorizontal, Bot, Loader2, Wand2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleGenAI } from "@google/genai";
import { n8nService } from '../../services/n8n';

// Expanded Mock Data Sets to support dynamic filtering
const ALL_PROPERTIES = [
  {
    id: 1,
    address: '742 Evergreen Terrace',
    price: 650000,
    beds: 4,
    baths: 2.5,
    sqft: 2400,
    zip: '78704',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    matchScore: 98,
    aiReason: 'Matches your desire for a "large backyard" and is within the "Springfield Elementary" zone.',
    features: ['Renovated Kitchen', '0.5 Acre Lot', 'Hardwood Floors'],
    tags: ['Standard']
  },
  {
    id: 2,
    address: '12 Grimmauld Place',
    price: 625000,
    beds: 3,
    baths: 2,
    sqft: 1800,
    zip: '78701',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    matchScore: 85,
    aiReason: 'Price is $25k under budget. A bit smaller than requested, but has the "Chef\'s Kitchen" you prioritized.',
    features: ['Walkable to Coffee', 'Historic Charm', 'New Roof'],
    tags: ['Standard']
  },
  {
    id: 101,
    address: '456 Flip Blvd',
    price: 320000,
    beds: 3,
    baths: 2,
    sqft: 1450,
    zip: '78702',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    matchScore: 94,
    aiReason: 'High Cap Rate Potential (8.5%). Zoned for duplex conversion. Needs cosmetic updates.',
    features: ['Below Market Value', 'R3 Zoning', 'Cash Flow Positive'],
    tags: ['Investor']
  },
  {
    id: 102,
    address: '88 Industrial Way',
    price: 410000,
    beds: 4,
    baths: 3,
    sqft: 2200,
    zip: '78746',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    matchScore: 88,
    aiReason: 'Located in an Opportunity Zone. Tax benefits apply. Stable tenant in place.',
    features: ['Opportunity Zone', 'Tenant Occupied', 'Corner Lot'],
    tags: ['Investor']
  },
  {
    id: 201,
    address: '789 Skyline Penthouse',
    price: 1200000,
    beds: 2,
    baths: 2.5,
    sqft: 1600,
    zip: '78701',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    matchScore: 98,
    aiReason: 'Matches "Turnkey Luxury" & "Close to Tech Hub" criteria. Concierge services included.',
    features: ['City Views', 'Full Service', 'Smart Home'],
    tags: ['Relo']
  }
];

interface SmartMatchesProps {
  isMobile?: boolean;
}

const SmartMatches: React.FC<SmartMatchesProps> = ({ isMobile }) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'swipe' | 'grid'>('swipe');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Criteria State
  const [criteria, setCriteria] = useState({
    zip: user?.searchCriteria?.zip || '78704',
    maxBudget: user?.searchCriteria?.priceRange?.[1] || 1000000,
    minBeds: user?.searchCriteria?.beds || 0,
    naturalQuery: ''
  });

  const [isAIParsing, setIsAIParsing] = useState(false);

  // Filtered Matches Logic
  const matches = useMemo(() => {
    return ALL_PROPERTIES.filter(p => {
      const withinBudget = p.price <= criteria.maxBudget;
      const matchesZip = criteria.zip === 'All' || p.zip === criteria.zip;
      const matchesBeds = p.beds >= criteria.minBeds;
      
      // If a natural query exists, we prioritize score but still respect hard filters
      return withinBudget && matchesZip && matchesBeds;
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [criteria]);

  const activeMatch = matches[currentIndex];

  const personaTitle = useMemo(() => {
    if (user?.email?.includes('investor')) return 'Investor Deal Flow';
    if (user?.email?.includes('relo')) return 'Relocation Curator';
    return 'Dream Home Matches';
  }, [user]);

  const handleAction = (type: 'like' | 'dislike') => {
    if (currentIndex < matches.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setViewMode('grid');
    }
  };

  const handleNaturalSearch = async () => {
    if (!criteria.naturalQuery.trim() || !process.env.API_KEY) return;
    
    setIsAIParsing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Act as a Real Estate Search Assistant. Analyze the following natural language query and extract structured criteria.
      Query: "${criteria.naturalQuery}"
      Current Zip: ${criteria.zip}
      Current Max Budget: ${criteria.maxBudget}

      Task: Return a JSON object with:
      - zip: string (The zip code mentioned, or the current one if not found)
      - maxBudget: number (The maximum price mentioned, or the current one if not found)
      - minBeds: number (The minimum beds mentioned, or current)
      - response: string (A friendly 1-sentence acknowledgement of their specific request)

      Return strictly valid JSON:
      { "zip": "string", "maxBudget": number, "minBeds": number, "response": "string" }`;

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      if (result.text) {
        const parsed = JSON.parse(result.text);
        setCriteria(prev => ({
          ...prev,
          zip: parsed.zip,
          maxBudget: parsed.maxBudget,
          minBeds: parsed.minBeds
        }));
        alert(`AI: ${parsed.response}`);
        setCurrentIndex(0); // Reset swipe queue
        // Sync with CRM/Backend via n8n
        await n8nService.triggerWorkflow('update-client-criteria', { 
          clientId: user?.id, 
          ...parsed 
        });
      }
    } catch (e) {
      console.error(e);
      alert("AI Search Protocol failed. Please refine manually.");
    } finally {
      setIsAIParsing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      
      {/* Dynamic Search Header */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-lg p-6 space-y-6 relative overflow-hidden group">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                      <Sparkles size={24} />
                  </div>
                  <div>
                      <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">{personaTitle}</h2>
                      <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-1">V2 Intelligence Engine</p>
                  </div>
              </div>
              
              <div className="flex bg-slate-100 rounded-xl p-1 shrink-0">
                  <button 
                    onClick={() => setViewMode('swipe')} 
                    className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'swipe' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                      Swipe
                  </button>
                  <button 
                    onClick={() => setViewMode('grid')} 
                    className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                      Grid
                  </button>
              </div>
          </div>

          {/* Natural Language Search Input */}
          <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400">
                  {isAIParsing ? <Loader2 className="animate-spin" size={20}/> : <Bot size={20}/>}
              </div>
              <input 
                type="text"
                placeholder='E.g., "Find me a fixer-upper under 500k in 78702 with a pool"'
                className="w-full pl-12 pr-32 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
                value={criteria.naturalQuery}
                onChange={e => setCriteria({...criteria, naturalQuery: e.target.value})}
                onKeyDown={e => e.key === 'Enter' && handleNaturalSearch()}
              />
              <button 
                onClick={handleNaturalSearch}
                disabled={isAIParsing || !criteria.naturalQuery.trim()}
                className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-6 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                  Refine <Wand2 size={14}/>
              </button>
          </div>

          {/* Manual Refinement Toggles */}
          <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${showFilters ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'}`}
              >
                  <SlidersHorizontal size={14}/> {showFilters ? 'Hide Manual Filters' : 'Adjust Criteria'}
              </button>
              
              {!showFilters && (
                  <div className="flex gap-2">
                      <span className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border border-indigo-100 flex items-center gap-1.5 shadow-sm">
                          <MapPin size={10}/> {criteria.zip}
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                          {/* Fix: escaping less-than and using proper JSX interpolation to fix errors on line 255 */}
                          <DollarSign size={10}/> &lt; ${ (criteria.maxBudget/1000).toFixed(0) }k
                      </span>
                  </div>
              )}
          </div>

          {/* Manual Filter Panel */}
          {showFilters && (
              <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 animate-fade-in-up grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block px-1">Target Zip Code</label>
                      <select 
                        value={criteria.zip}
                        onChange={e => { setCriteria({...criteria, zip: e.target.value}); setCurrentIndex(0); }}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                          <option value="All">All Regions</option>
                          <option value="78704">78704 (Bouldin/Zilker)</option>
                          <option value="78701">78701 (Downtown)</option>
                          <option value="78702">78702 (East Austin)</option>
                          <option value="78746">78746 (West Lake)</option>
                      </select>
                  </div>
                  <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block px-1">Maximum Budget</label>
                      <div className="flex items-center gap-4">
                          <input 
                            type="range" min="300000" max="3000000" step="50000"
                            value={criteria.maxBudget}
                            onChange={e => { setCriteria({...criteria, maxBudget: parseInt(e.target.value)}); setCurrentIndex(0); }}
                            className="flex-1 accent-indigo-600" 
                          />
                          <span className="font-black text-indigo-600 text-sm tabular-nums w-12">${(criteria.maxBudget/1000).toFixed(0)}k</span>
                      </div>
                  </div>
                  <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block px-1">Min Bedrooms</label>
                      <div className="flex gap-2">
                          {[0, 2, 3, 4, 5].map(b => (
                              <button 
                                key={b}
                                onClick={() => { setCriteria({...criteria, minBeds: b}); setCurrentIndex(0); }}
                                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${criteria.minBeds === b ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-200'}`}
                              >
                                  {b === 0 ? 'Any' : b+'+'}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          )}
      </div>

      {/* --- SWIPE MODE (WORKFLOW 73 COMPONENT 1) --- */}
      {viewMode === 'swipe' ? (
        activeMatch ? (
            <div className="max-w-md mx-auto relative h-[600px] mt-8">
                <div className="absolute inset-0 bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scale-in">
                    <div className="relative h-3/5">
                        <img src={activeMatch.image} className="w-full h-full object-cover" />
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                            <span className="bg-indigo-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-lg border border-indigo-400">
                                {activeMatch.matchScore}% Match
                            </span>
                            <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-md w-fit">
                                Zip: {activeMatch.zip}
                            </span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                            <h3 className="text-2xl font-black leading-tight uppercase tracking-tight italic">{activeMatch.address}</h3>
                            <p className="text-lg font-bold text-indigo-300 mt-1">${activeMatch.price.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex gap-4 text-slate-500 text-[10px] font-black uppercase mb-4 border-b border-slate-100 pb-4">
                                <span className="flex items-center gap-1.5"><BedDouble size={14} className="text-indigo-500"/> {activeMatch.beds}</span>
                                <span className="flex items-center gap-1.5"><Bath size={14} className="text-indigo-500"/> {activeMatch.baths}</span>
                                <span className="flex items-center gap-1.5"><Ruler size={14} className="text-indigo-500"/> {activeMatch.sqft}</span>
                            </div>
                            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 relative group/insight">
                                <div className="absolute -top-3 right-4 bg-white border border-indigo-100 p-1.5 rounded-lg shadow-sm text-indigo-600">
                                    <Bot size={14}/>
                                </div>
                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    Why we picked this
                                </p>
                                <p className="text-xs text-indigo-900 leading-relaxed font-medium italic">"{activeMatch.aiReason}"</p>
                            </div>
                        </div>

                        <div className="flex justify-center gap-12 px-4 mt-6">
                            <button 
                                onClick={() => handleAction('dislike')}
                                className="w-16 h-16 rounded-full bg-white text-slate-300 flex items-center justify-center shadow-xl hover:text-red-500 transition-all active:scale-90 border border-slate-100"
                            >
                                <X size={32} strokeWidth={3}/>
                            </button>
                            <button 
                                onClick={() => handleAction('like')}
                                className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-90"
                            >
                                <Heart size={32} fill="currentColor"/>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="absolute -bottom-2 left-6 right-6 h-4 bg-slate-200 rounded-b-[2.5rem] -z-10 opacity-50" />
            </div>
        ) : (
            <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 animate-fade-in">
                <Bot size={48} className="mx-auto text-slate-100 mb-6" />
                <h4 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Queue Exhausted.</h4>
                <p className="text-xs text-slate-400 font-bold uppercase mt-2 tracking-widest">Adjust your budget or zip to discover more properties.</p>
                <button 
                    onClick={() => { setCriteria({zip: 'All', maxBudget: 3000000, minBeds: 0, naturalQuery: ''}); setCurrentIndex(0); }} 
                    className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-black transition-all"
                >
                    Reset Global Search
                </button>
            </div>
        )
      ) : (
        /* GRID MODE */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in-up">
            {matches.map(match => (
            <div key={match.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden group hover:border-indigo-400 hover:shadow-xl transition-all flex flex-col">
                <div className="relative h-64 overflow-hidden">
                    <img src={match.image} alt={match.address} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-4 left-4">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase shadow-sm bg-indigo-600 text-white border border-indigo-400">
                            <Sparkles size={12} /> {match.matchScore}% Match
                        </div>
                    </div>
                    <div className="absolute bottom-4 right-4">
                        <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase px-2 py-1 rounded-lg">Zip: {match.zip}</span>
                    </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight italic mb-1">{match.address}</h3>
                    <p className="text-2xl font-black text-indigo-600 tracking-tighter mb-4">${match.price.toLocaleString()}</p>
                    
                    <div className="flex flex-wrap gap-1.5 mb-6">
                        {match.features.slice(0, 2).map(f => (
                            <span key={f} className="bg-slate-50 text-slate-400 text-[8px] font-black px-2 py-0.5 rounded border border-slate-100 uppercase">{f}</span>
                        ))}
                    </div>

                    <button className="w-full mt-auto py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2 border-b-4 border-indigo-600 active:scale-95">
                        Request Showing <ArrowRight size={14} />
                    </button>
                </div>
            </div>
            ))}
            {matches.length === 0 && (
                 <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                    <XCircleIcon className="mx-auto text-slate-100 mb-6" size={48} />
                    <h4 className="text-xl font-black text-slate-800 uppercase italic">Zero Matches.</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-2">No properties meet your current criteria in the Nexus inventory.</p>
                 </div>
            )}
        </div>
      )}
    </div>
  );
};

const XCircleIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
);

export default SmartMatches;