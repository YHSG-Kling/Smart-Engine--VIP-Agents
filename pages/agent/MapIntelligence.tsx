
import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, Home, Users, Calendar, Navigation, Filter, Search, 
  RefreshCw, Map as MapIcon, X, ArrowRight, TrendingUp, 
  Sparkles, Loader2, DollarSign, Target, Activity, ShieldAlert,
  Gavel, Zap, Globe, Compass, Crosshair, Send, Bot, ChevronDown,
  ChevronRight, Pin, Plus, Trash2, MapPin, SearchCode
} from 'lucide-react';
import { airtableService } from '../../services/airtable';
import { GoogleGenAI, Type } from "@google/genai";
import { n8nService } from '../../services/n8n';
import L from 'leaflet';

interface MapItem {
  id: string;
  type: 'listing' | 'lead' | 'showing';
  lat: number;
  lng: number;
  title: string;
  status: string;
  detail: string;
  subDetail?: string;
  price?: number;
  metadata?: any;
}

interface AIInsight {
  score: number;
  metricLabel: string;
  summary: string;
  reasoning: string[];
}

interface SavedSector {
  n: string;
  c: [number, number];
}

const MapIntelligence: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  
  const [selectedPin, setSelectedPin] = useState<MapItem | null>(null);
  const [activeLayer, setActiveLayer] = useState<'all' | 'listing' | 'lead' | 'showing'>('all');
  const [mapPins, setMapPins] = useState<MapItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [territoryName, setTerritoryName] = useState('Austin, TX');
  const [currentCoords, setCurrentCoords] = useState<[number, number]>([30.2672, -97.7431]);
  const [searchInput, setSearchInput] = useState('');
  
  // Dynamic Saved Sectors (Tactical Command List)
  const [savedSectors, setSavedSectors] = useState<SavedSector[]>([
    { n: 'Austin, TX', c: [30.2672, -97.7431] },
    { n: 'Dallas, TX', c: [32.7767, -96.7970] },
    { n: 'Houston, TX', c: [29.7604, -95.3698] }
  ]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: currentCoords,
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 20
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    fetchMapData(currentCoords);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync Markers
  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;

    markersLayerRef.current.clearLayers();

    const filteredPins = activeLayer === 'all' 
      ? mapPins 
      : mapPins.filter(p => p.type === activeLayer);

    filteredPins.forEach(pin => {
      const color = pin.type === 'listing' ? '#10b981' : pin.type === 'lead' ? '#4f46e5' : '#f59e0b';
      
      const customIcon = L.divIcon({
        className: 'nexus-tactical-marker',
        html: `
          <div class="animate-pulse-slow" style="
            background-color: ${color}; 
            width: 24px; 
            height: 24px; 
            border-radius: 6px; 
            border: 2px solid white; 
            box-shadow: 0 0 15px ${color}66;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            transform: rotate(45deg);
            font-weight: 900;
          ">
            <div style="transform: rotate(-45deg)">
              ${pin.type === 'listing' ? 'H' : pin.type === 'lead' ? 'L' : 'S'}
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([pin.lat, pin.lng], { icon: customIcon });
      
      marker.on('click', () => {
        setSelectedPin(pin);
        generateAIInsight(pin);
        mapInstanceRef.current?.setView([pin.lat, pin.lng], 15, { animate: true });
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [activeLayer, mapPins]);

  const handleTerritorySearch = async () => {
    if (!searchInput.trim() || !process.env.API_KEY) return;
    setIsJumping(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        GEO-PARSING PROTOCOL:
        Resolve the location "${searchInput}" into precise map coordinates. 
        If the state is missing, assume it is in the USA.
        Include neighborhood resolution if applicable.
        
        Return ONLY valid JSON:
        {
          "lat": number,
          "lng": number,
          "displayName": "string (City, State)"
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      if (response.text) {
        const result = JSON.parse(response.text);
        setTerritoryName(result.displayName);
        setCurrentCoords([result.lat, result.lng]);
        
        // Update list if not present & persist to backend
        if (!savedSectors.some(s => s.n === result.displayName)) {
            setSavedSectors(prev => [{ n: result.displayName, c: [result.lat, result.lng] }, ...prev.slice(0, 4)]);
            await n8nService.saveTerritory(result.displayName, result.lat, result.lng);
        }

        mapInstanceRef.current?.setView([result.lat, result.lng], 13, { animate: true });
        fetchMapData([result.lat, result.lng]);
        setSearchInput('');
      }
    } catch (e) {
      console.error("Geocoding failed", e);
    } finally {
      setIsJumping(false);
    }
  };

  const jumpToTerritory = (name: string, coords: [number, number]) => {
      setTerritoryName(name);
      setCurrentCoords(coords);
      mapInstanceRef.current?.setView(coords, 13, { animate: true });
      fetchMapData(coords);
  };

  const removeSavedSector = (name: string) => {
      setSavedSectors(prev => prev.filter(s => s.n !== name));
  };

  const generateAIInsight = async (pin: MapItem) => {
    if (!process.env.API_KEY) return;
    setIsAnalyzing(true);
    setAiInsight(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        TERRITORY AUDIT PROTOCOL:
        Analyze this property/lead node in the ${territoryName} market.
        TYPE: ${pin.type}
        TITLE: ${pin.title}
        STATUS: ${pin.status}
        PRICE: ${pin.price || 'N/A'}
        DETAIL: ${pin.detail}
        
        Provide a tactical insight summary in JSON format.
        Schema:
        {
          "score": number (0-100),
          "metricLabel": "Strategic Value" | "Conversion Probability",
          "summary": "1-sentence executive brief",
          "reasoning": ["point 1", "point 2", "point 3"]
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { 
            responseMimeType: 'application/json',
            thinkingConfig: { thinkingBudget: 1000 }
        }
      });

      if (response.text) {
        setAiInsight(JSON.parse(response.text));
      }
    } catch (e) {
      console.error("AI Analysis failed", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchMapData = async (center: [number, number]) => {
    setIsLoading(true);
    try {
      const [leads, listings] = await Promise.all([
        airtableService.getLeads(),
        airtableService.getListings()
      ]);

      const items: MapItem[] = [];
      const [cLat, cLng] = center;

      // 1. Process Real Data if Coords Exist
      if (listings) {
        listings.forEach((l, i) => {
          if (l.latitude && l.longitude) {
              items.push({
                id: l.id, type: 'listing',
                lat: l.latitude, lng: l.longitude,
                title: l.address, status: l.status,
                detail: `$${l.price.toLocaleString()}`,
                subDetail: `${l.daysOnMarket}d DOM`,
                price: l.price
              });
          } else {
              // LOCALIZED SIMULATION (Fallback)
              items.push({
                id: l.id + Math.random(), type: 'listing',
                lat: cLat + (Math.sin(i * 2) * 0.035),
                lng: cLng + (Math.cos(i * 2) * 0.035),
                title: l.address, status: l.status,
                detail: `$${l.price.toLocaleString()}`,
                subDetail: `${l.daysOnMarket}d DOM`,
                price: l.price
              });
          }
        });
      }

      if (leads) {
        leads.filter(l => l.score > 50).forEach((l, i) => {
          if (l.latitude && l.longitude) {
              items.push({
                id: l.id, type: 'lead',
                lat: l.latitude, lng: l.longitude,
                title: l.name, status: l.status,
                detail: `Engagement: ${l.score}%`,
                subDetail: `Intent: ${l.intent}`
              });
          } else {
              // LOCALIZED SIMULATION (Fallback)
              items.push({
                id: l.id + Math.random(), type: 'lead',
                lat: cLat + (Math.cos(i * 2.5) * 0.025),
                lng: cLng + (Math.sin(i * 2.5) * 0.025),
                title: l.name, status: l.status,
                detail: `Engagement: ${l.score}%`,
                subDetail: `Intent: ${l.intent}`
              });
          }
        });
      }

      setMapPins(items);
    } catch (e) {
      console.error("Map Data Pipeline failure", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-slate-900 rounded-[2.5rem] overflow-hidden relative border border-slate-800 shadow-2xl animate-fade-in">
      
      {/* TACTICAL SIDEBAR */}
      <div className="w-80 bg-slate-900 border-r border-slate-800 p-8 flex flex-col z-[1000] relative shrink-0">
        <div className="mb-8">
          <h3 className="flex items-center justify-between">
            <span className="flex items-center gap-3 text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px]">
                <Crosshair size={18} className="animate-spin-slow" /> War Room Command
            </span>
            <button onClick={() => fetchMapData(currentCoords)} className="text-slate-500 hover:text-indigo-400 transition-all">
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </h3>
        </div>

        {/* Territory Deployment Input */}
        <div className="mb-8 space-y-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 shadow-inner">
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Target size={14}/> Deploy New Territory
                </p>
                <div className="relative group">
                    <input 
                        type="text" 
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleTerritorySearch()}
                        placeholder="CITY, STATE..." 
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    />
                    <button 
                        onClick={handleTerritorySearch}
                        disabled={!searchInput.trim() || isJumping}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-indigo-400 disabled:opacity-30"
                    >
                        {isJumping ? <Loader2 size={14} className="animate-spin"/> : <SearchCode size={16}/>}
                    </button>
                </div>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter mt-2 italic px-1">AI geocoding resolves global intent</p>
            </div>
        </div>
        
        <div className="space-y-2 mb-8">
          {[
            { id: 'all', label: 'Global Theater', icon: Globe, color: 'text-slate-400' },
            { id: 'listing', label: 'Asset Clusters', icon: Home, color: 'text-emerald-500' },
            { id: 'lead', label: 'Intent Nodes', icon: Users, color: 'text-indigo-500' },
            { id: 'showing', label: 'Operations', icon: Calendar, color: 'text-amber-500' },
          ].map(layer => (
            <button 
              key={layer.id}
              onClick={() => setActiveLayer(layer.id as any)}
              className={`w-full text-left px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between border-2 ${
                activeLayer === layer.id 
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl shadow-indigo-900/40 translate-x-1' 
                  : 'bg-slate-800/50 border-transparent text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <layer.icon size={16} className={activeLayer === layer.id ? 'text-white' : layer.color} />
                {layer.label}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-4 mb-8 flex-1 overflow-y-auto scrollbar-hide">
            <div className="flex justify-between items-center px-1">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tactical Sectors</p>
            </div>
            <div className="grid grid-cols-1 gap-2">
                {savedSectors.map(loc => (
                    <div 
                      key={loc.n}
                      className={`group flex items-center gap-2 w-full p-1 rounded-xl transition-all ${territoryName.includes(loc.n.split(',')[0]) ? 'bg-indigo-600/10' : ''}`}
                    >
                      <button 
                          onClick={() => jumpToTerritory(loc.n, loc.c)}
                          className={`flex-1 text-left px-4 py-3 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center justify-between border ${territoryName.includes(loc.n.split(',')[0]) ? 'text-indigo-400 border-indigo-500/30' : 'bg-slate-800/30 text-slate-500 border-transparent hover:border-slate-700'}`}
                      >
                          {loc.n}
                          <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <button 
                        onClick={() => removeSavedSector(loc.n)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={12}/>
                      </button>
                    </div>
                ))}
            </div>
        </div>

        <div className="mt-auto space-y-6 pt-6 border-t border-slate-800">
            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-[1.5rem] p-6 shadow-inner">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Market Heat</span>
                    <TrendingUp size={14} className="text-emerald-500" />
                </div>
                <div className="space-y-3">
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" style={{ width: '82%' }} />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase italic">{territoryName.split(',')[0]} SECTOR: BULLISH</p>
                </div>
            </div>
        </div>
      </div>

      {/* TACTICAL MAP STAGE */}
      <div className="flex-1 relative bg-slate-950 z-0 overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full opacity-90 grayscale-[0.5] invert-[0.05]" />
        
        {/* FLOAT CONTROLS */}
        <div className="absolute top-8 left-8 right-8 flex justify-end pointer-events-none z-[1000]">
          <div className="flex items-center gap-3 pointer-events-auto">
              <div className="bg-slate-900/95 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 ring-4 ring-black/50 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{territoryName}</span>
              </div>
              <button className="bg-slate-900/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl text-indigo-400 hover:text-white transition-all border border-slate-800 active:scale-90 ring-4 ring-black/50">
                <Filter size={20} />
              </button>
          </div>
        </div>

        {/* AI INTEL CARD */}
        {selectedPin && (
          <div className="absolute bottom-10 right-10 w-[420px] bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] p-10 border border-slate-200 animate-fade-in-up z-[1000] ring-8 ring-black/5">
            <button 
              onClick={() => { setSelectedPin(null); setAiInsight(null); }}
              className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 p-2 hover:bg-slate-100 rounded-full transition-all"
            >
              <X size={24} />
            </button>
            
            <div className="flex items-start gap-8 mb-10">
              <div className={`w-20 h-20 rounded-3xl shadow-xl flex items-center justify-center font-black text-white italic ${
                selectedPin.type === 'listing' ? 'bg-emerald-600' : 
                selectedPin.type === 'lead' ? 'bg-indigo-600' : 
                'bg-amber-600'
              }`}>
                {selectedPin.type === 'listing' ? <Home size={32} /> : selectedPin.type === 'lead' ? <Users size={32} /> : <Calendar size={32} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{selectedPin.status}</p>
                <h4 className="font-black text-slate-900 text-2xl uppercase tracking-tighter italic leading-none mb-3 truncate">{selectedPin.title}</h4>
                <div className="flex items-center gap-4">
                    <p className="text-3xl font-black text-indigo-600 tracking-tighter tabular-nums leading-none">{selectedPin.detail}</p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{selectedPin.subDetail}</span>
                </div>
              </div>
            </div>

            <div className="mb-10 border-t border-slate-100 pt-10">
              <div className="flex items-center justify-between mb-6">
                <h5 className="flex items-center gap-3 text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">
                  <Sparkles size={18} /> Nexus Territory Intel
                </h5>
                {isAnalyzing && <Loader2 className="animate-spin text-indigo-600" size={20} />}
              </div>

              {isAnalyzing ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-24 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner" />
                  <div className="h-4 bg-slate-100 w-3/4 rounded-full" />
                </div>
              ) : aiInsight ? (
                <div className="space-y-8 animate-fade-in">
                  <div className="bg-indigo-50 border-2 border-indigo-100 p-8 rounded-[2.5rem] flex items-center gap-8 shadow-inner relative overflow-hidden group">
                    <div className="absolute right-[-20px] top-[-20px] p-4 opacity-5 text-indigo-900 group-hover:rotate-12 transition-transform"><Target size={120}/></div>
                    <div className="relative flex items-center justify-center shrink-0">
                       <svg className="w-24 h-24 transform -rotate-90">
                          <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white" />
                          <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="264" strokeDashoffset={264 - (264 * (aiInsight.score / 100))} className="text-indigo-600" strokeLinecap="round" />
                       </svg>
                       <span className="absolute text-2xl font-black text-indigo-700 italic">{aiInsight.score}</span>
                    </div>
                    <div className="relative">
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">{aiInsight.metricLabel}</p>
                       <p className="text-base font-bold text-slate-800 leading-[1.3] italic">"{aiInsight.summary}"</p>
                    </div>
                  </div>

                  <ul className="space-y-3 px-2">
                    {aiInsight.reasoning.map((reason, i) => (
                      <li key={i} className="flex items-start gap-4 text-xs text-slate-600 font-medium">
                        <div className="mt-1.5 w-2 h-2 bg-indigo-500 rounded-full shrink-0 shadow-[0_0_5px_rgba(79,70,229,0.4)]" />
                        <span className="italic">"{reason}"</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-slate-300 border-4 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50">
                    <Activity size={40} className="mb-4 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Analysis Signal...</p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button className="flex-[1] bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3">
                Full Dossier <ArrowRight size={16} />
              </button>
              <button className="p-5 bg-indigo-50 text-indigo-600 rounded-[1.5rem] hover:bg-indigo-100 transition-all border-2 border-indigo-100">
                <Send size={20}/>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .nexus-tactical-marker { background: none !important; border: none !important; }
        .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: rotate(45deg) scale(1); } 50% { opacity: 0.8; transform: rotate(45deg) scale(0.95); } }
      `}</style>
    </div>
  );
};

export default MapIntelligence;
