
import React, { useState, useEffect, useRef } from 'react';
import { Layers, Home, Users, Calendar, Navigation, Filter, Search, RefreshCw, Map as MapIcon, X, ArrowRight, TrendingUp, Sparkles, Loader2, DollarSign, Target, Activity } from 'lucide-react';
import { airtableService } from '../../services/airtable';
import { GoogleGenAI } from "@google/genai";
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

const MapIntelligence: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  
  const [selectedPin, setSelectedPin] = useState<MapItem | null>(null);
  const [activeLayer, setActiveLayer] = useState<'all' | 'listing' | 'lead' | 'showing'>('all');
  const [mapPins, setMapPins] = useState<MapItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // AI Insight State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initialize Leaflet Map centered on Austin
    const map = L.map(mapContainerRef.current, {
      center: [30.2672, -97.7431],
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    // Use CartoDB Voyager tiles for a clean, professional "Nexus" look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 20
    }).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    fetchMapData();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when filter or data changes
  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;

    markersLayerRef.current.clearLayers();

    const filteredPins = activeLayer === 'all' 
      ? mapPins 
      : mapPins.filter(p => p.type === activeLayer);

    filteredPins.forEach(pin => {
      const color = pin.type === 'listing' ? '#10b981' : pin.type === 'lead' ? '#4f46e5' : '#f59e0b';
      
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="
            background-color: ${color}; 
            width: 32px; 
            height: 32px; 
            border-radius: 50%; 
            border: 3px solid white; 
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          ">
            ${pin.type === 'listing' ? '🏠' : pin.type === 'lead' ? '👤' : '📅'}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([pin.lat, pin.lng], { icon: customIcon });
      
      marker.on('click', () => {
        handlePinSelect(pin);
        mapInstanceRef.current?.setView([pin.lat, pin.lng], 15, { animate: true });
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [activeLayer, mapPins]);

  const handlePinSelect = (pin: MapItem) => {
    setSelectedPin(pin);
    generateAIInsight(pin);
  };

  const generateAIInsight = async (pin: MapItem) => {
    setIsAnalyzing(true);
    setAiInsight(null);
    
    if (!process.env.API_KEY) {
      // Mock delay if no key
      setTimeout(() => {
        setAiInsight({
          score: 84,
          metricLabel: pin.type === 'listing' ? 'Investment Potential' : 'Likelihood to Sell',
          summary: `High activity detected for ${pin.title}. Local inventory is down 12% in this sector.`,
          reasoning: ['Inventory velocity is high', 'Comparable sales support current pricing', 'Demographic shift favoring this ZIP']
        });
        setIsAnalyzing(false);
      }, 1500);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        You are a Real Estate Intelligence Engine. Analyze the following property/lead data and provide specific insights.
        
        TYPE: ${pin.type}
        TITLE: ${pin.title}
        STATUS: ${pin.status}
        DETAIL: ${pin.detail}
        SUBDETAIL: ${pin.subDetail}
        PRICE: ${pin.price || 'N/A'}
        
        If it's a LISTING, calculate 'Investment Potential Score'.
        If it's a LEAD, calculate 'Likelihood to Sell Score'.
        
        Return strictly valid JSON in this format:
        {
          "score": number (0-100),
          "metricLabel": "Likelihood to Sell" | "Investment Potential",
          "summary": "Short 1-sentence executive summary",
          "reasoning": ["Bullet point 1", "Bullet point 2", "Bullet point 3"]
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
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

  const fetchMapData = async () => {
    setIsLoading(true);
    try {
      const [leads, listings] = await Promise.all([
        airtableService.getLeads(),
        airtableService.getListings()
      ]);

      const items: MapItem[] = [];
      
      const generateCoords = (idx: number) => {
        const centerLat = 30.2672;
        const centerLng = -97.7431;
        // Distribute items realistically around Austin
        const offsetLat = (Math.sin(idx * 0.5) * 0.03) + (Math.random() * 0.01);
        const offsetLng = (Math.cos(idx * 0.5) * 0.03) + (Math.random() * 0.01);
        return { lat: centerLat + offsetLat, lng: centerLng + offsetLng };
      };

      if (listings) {
        listings.forEach((listing, i) => {
          const coords = generateCoords(i);
          items.push({
            id: listing.id,
            type: 'listing',
            lat: coords.lat,
            lng: coords.lng,
            title: listing.address,
            status: listing.status,
            detail: `$${listing.price.toLocaleString()}`,
            subDetail: `${listing.daysOnMarket} Days on Market`,
            price: listing.price,
            metadata: listing
          });
        });
      }

      if (leads) {
        leads.filter(l => l.score > 40).forEach((lead, i) => {
          const coords = generateCoords(i + 100);
          items.push({
            id: lead.id,
            type: 'lead',
            lat: coords.lat,
            lng: coords.lng,
            title: lead.name,
            status: lead.status,
            detail: `Engagement: ${lead.score}%`,
            subDetail: `Intent: ${lead.intent}`,
            metadata: lead
          });
        });
      }

      const showingTimes = ['Today, 2:00 PM', 'Today, 4:30 PM', 'Tomorrow, 10:00 AM', 'Tomorrow, 1:00 PM'];
      showingTimes.forEach((time, i) => {
          const coords = generateCoords(i + 200);
          items.push({
              id: `show_${i}`,
              type: 'showing',
              lat: coords.lat,
              lng: coords.lng,
              title: `Showing: 456 Oak Ave`,
              status: 'Confirmed',
              detail: time,
              subDetail: 'Client: Michael Scott'
          });
      });

      setMapPins(items);
    } catch (e) {
      console.error("Failed to load map data", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-slate-100 rounded-2xl overflow-hidden relative border border-slate-200 shadow-sm animate-fade-in">
      
      {/* Sidebar Controls */}
      <div className="w-80 bg-white border-r border-slate-200 p-6 flex flex-col z-[1000] shadow-xl relative h-full shrink-0">
        <div className="mb-6">
          <h3 className="font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-2 text-indigo-600 uppercase tracking-widest text-xs"><Layers size={16} /> Intelligence Layers</span>
            <button onClick={fetchMapData} className="text-slate-400 hover:text-indigo-600 transition-colors" title="Refresh Data">
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </h3>
        </div>
        
        <div className="space-y-2 mb-8">
          {[
            { id: 'all', label: 'Global View', icon: MapIcon, count: mapPins.length, color: 'text-slate-600' },
            { id: 'listing', label: 'Active Listings', icon: Home, count: mapPins.filter(p => p.type === 'listing').length, color: 'text-emerald-600' },
            { id: 'lead', label: 'Hot Leads', icon: Users, count: mapPins.filter(p => p.type === 'lead').length, color: 'text-indigo-600' },
            { id: 'showing', label: 'Tours & Showings', icon: Calendar, count: mapPins.filter(p => p.type === 'showing').length, color: 'text-amber-600' },
          ].map(layer => (
            <button 
              key={layer.id}
              onClick={() => setActiveLayer(layer.id as any)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between group ${
                activeLayer === layer.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' 
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <span className="flex items-center gap-3">
                <layer.icon size={18} className={activeLayer === layer.id ? 'text-white' : layer.color} />
                {layer.label}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeLayer === layer.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {layer.count}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-auto space-y-4">
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-inner">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400">
                    <Navigation size={14}/>
                </div>
                <h4 className="font-bold text-xs uppercase tracking-widest">Route Optimizer</h4>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Nexus AI is optimizing your 4 showing routes for fuel efficiency and traffic patterns.</p>
            <button className="w-full py-3 bg-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-95 shadow-lg">
              Generate Route
            </button>
          </div>
          
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Market Pulse</span>
                <TrendingUp size={14} className="text-emerald-600" />
            </div>
            <p className="text-lg font-black text-emerald-800 tracking-tighter">78704 • +4.2%</p>
            <p className="text-[10px] text-emerald-600 font-medium">Inventory Velocity: High</p>
          </div>
        </div>
      </div>

      {/* Map Content Area */}
      <div className="flex-1 relative bg-slate-200 z-0 overflow-hidden">
        {/* Leaflet Container */}
        <div ref={mapContainerRef} className="w-full h-full grayscale-[0.2]" />
        
        {/* Floating Top Bar */}
        <div className="absolute top-6 left-6 right-6 flex justify-between pointer-events-none z-[1000]">
          <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-2xl flex items-center gap-2 w-96 pointer-events-auto border border-white/50 ring-1 ring-black/5">
            <Search size={20} className="text-slate-400 ml-2" />
            <input 
              type="text" 
              placeholder="Analyze territory, zip, or specific lot..." 
              className="bg-transparent outline-none text-sm w-full font-medium text-slate-800 placeholder:text-slate-400 py-2" 
            />
          </div>
          <div className="flex gap-2 pointer-events-auto">
            <button className="bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-xl text-slate-600 hover:text-indigo-600 transition-all border border-white/50 active:scale-90"><Filter size={20} /></button>
          </div>
        </div>

        {/* Selected Pin Card */}
        {selectedPin && (
          <div className="absolute bottom-8 right-8 w-96 bg-white rounded-[2.5rem] shadow-2xl p-8 border border-slate-200 animate-fade-in-up z-[1000] ring-1 ring-black/5 overflow-hidden">
            <button 
              onClick={() => { setSelectedPin(null); setAiInsight(null); }}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition-all"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-start gap-6 mb-8">
              <div className={`p-4 rounded-[1.25rem] shadow-sm ${
                selectedPin.type === 'listing' ? 'bg-emerald-50 text-emerald-600' : 
                selectedPin.type === 'lead' ? 'bg-indigo-50 text-indigo-600' : 
                'bg-amber-50 text-amber-600'
              }`}>
                {selectedPin.type === 'listing' && <Home size={32} />}
                {selectedPin.type === 'lead' && <Users size={32} />}
                {selectedPin.type === 'showing' && <Calendar size={32} />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-slate-900 leading-tight mb-1 truncate uppercase tracking-tight text-xl">{selectedPin.title}</h4>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedPin.status}</span>
                </div>
                <p className="text-2xl font-black text-indigo-600 tracking-tighter">{selectedPin.detail}</p>
                {selectedPin.subDetail && (
                    <p className="text-xs text-slate-500 mt-2 font-medium bg-slate-50 p-2 rounded-xl border border-slate-100 inline-block">{selectedPin.subDetail}</p>
                )}
              </div>
            </div>

            {/* AI INSIGHT SECTION */}
            <div className="mb-8 border-t border-slate-100 pt-8">
              <div className="flex items-center justify-between mb-4">
                <h5 className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">
                  <Sparkles size={16} /> Nexus AI Insight
                </h5>
                {isAnalyzing && <Loader2 className="animate-spin text-indigo-400" size={16} />}
              </div>

              {isAnalyzing ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-20 bg-slate-50 rounded-2xl border border-slate-100" />
                  <div className="h-4 bg-slate-50 w-3/4 rounded" />
                </div>
              ) : aiInsight ? (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <div className="relative flex items-center justify-center">
                       <svg className="w-20 h-20 transform -rotate-90">
                          <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
                          <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={`${aiInsight.score * 2.13}, 213`} className="text-indigo-600" />
                       </svg>
                       <span className="absolute text-xl font-black text-indigo-700">{aiInsight.score}</span>
                    </div>
                    <div className="flex-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{aiInsight.metricLabel}</p>
                       <p className="text-sm font-bold text-slate-800 leading-snug">{aiInsight.summary}</p>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {aiInsight.reasoning.map((reason, i) => (
                      <li key={i} className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="h-32 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
                    <Activity size={24} className="mb-2 opacity-50" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting Analysis</p>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button className="flex-1 bg-slate-100 text-slate-700 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                Full Profile
              </button>
              <button className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2">
                Action <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapIntelligence;
