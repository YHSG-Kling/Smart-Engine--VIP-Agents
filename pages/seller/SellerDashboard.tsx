
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Eye, Users, FileText, TrendingUp, Calendar, 
  MessageCircle, ThumbsUp, ThumbsDown, DollarSign,
  ArrowRight, Mail, Download, Clock, Image as ImageIcon, Wand2, Calculator, Loader2, Home, MapPin, Activity,
  CheckCircle2, AlertTriangle, ShieldCheck, ListTodo, ChevronRight, Upload, ShoppingBag, PieChart, Info,
  Phone, MessageSquare as MessageIcon, User, Sparkles, Send,
  RefreshCw, Bot, Landmark, Gauge, Globe, PlayCircle, Share2, Megaphone,
  MoreVertical, TrendingDown, ExternalLink, Ticket, Zap, X, Save,
  Plus, Minus, Percent, ArrowUpRight, BellRing, Gavel, Check, Ban
} from 'lucide-react';
import { n8nService } from '../../services/n8n';
import { airtableService } from '../../services/airtable';
import { Listing, SellerReport, MarketStat, MarketingAsset, OpenHouse, NetSheetScenario } from '../../types';

interface SellerDashboardProps {
  onNavigate?: (page: string) => void;
  initialAction?: string;
}

const SellerDashboard: React.FC<SellerDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'offers' | 'showcase'>('overview');
  const [offerSubTab, setOfferSubTab] = useState<'comparison' | 'net-sheet'>('comparison');
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingScenario, setIsSavingScenario] = useState(false);
  
  // Workflow 63: Reports State
  const [pastReports] = useState<SellerReport[]>([
    { id: 'rep_1', listingId: '1', address: '1234 Skyline Dr', weekEnding: 'Oct 27, 2023', viewsZillow: 450, showingsCount: 4, status: 'Sent', feedbackSummaryAI: 'High interest in kitchen. One objection on master bath color.', pdfUrl: '#' },
    { id: 'rep_2', listingId: '1', address: '1234 Skyline Dr', weekEnding: 'Oct 20, 2023', viewsZillow: 795, showingsCount: 8, status: 'Sent', feedbackSummaryAI: 'Initial launch velocity very high. Recommended open house strategy.', pdfUrl: '#' }
  ]);

  // Workflow 112: Marketing Assets
  const [marketingAssets] = useState<MarketingAsset[]>([
    { id: 'ma1', listingId: '1', name: 'Premium Listing Reel', url: '#', type: 'Video', platform: 'Instagram', category: 'Social', aiTags: ['Featured', 'AI Tour'], uploadDate: 'Today', size: '15MB' },
    { id: 'ma2', listingId: '1', name: 'Digital Property Flyer', url: '#', type: 'PDF', platform: 'Print', category: 'Flyer', aiTags: ['Print-Ready'], uploadDate: 'Yesterday', size: '2.5MB' },
    { id: 'ma3', listingId: '1', name: 'Facebook Ad Suite', url: '#', type: 'Image', platform: 'Facebook', category: 'Social', aiTags: ['Paid Media'], uploadDate: 'Yesterday', size: '4MB' },
  ]);

  // Real-world Offers Array (Simulated Backend Data)
  const [offers] = useState([
    { id: 'o1', from: 'The Henderson Family', amount: 865000, type: 'Conventional', closeDate: '30 Days', status: 'New', analysis: 'Highest Net', earnestMoney: 8650, inspectionDays: 7, isNew: true },
    { id: 'o2', from: 'Dr. John Arbuckle', amount: 840000, type: 'Cash', closeDate: '10 Days', status: 'Active', analysis: 'Fastest Close', earnestMoney: 10000, inspectionDays: 3, isNew: false },
  ]);

  // Net Sheet State
  const [selectedOfferForNet, setSelectedOfferForNet] = useState<any>(offers[0]);
  const [netSheetAdjustments, setNetSheetAdjustments] = useState<NetSheetScenario>({
      id: 'custom_1',
      offerPrice: 850000,
      mortgagePayoff: 385000,
      brokerageFeePercent: 6,
      closingCostsPercent: 1.2,
      propertyTaxProration: 3200,
      repairCredits: 0,
      otherFees: 450
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await airtableService.getListings();
      if (data && data.length > 0) {
        setListing(data[0]);
      } else {
        setListing({
            id: '1', address: '1234 Skyline Dr, Austin, TX', price: 850000, status: 'Active',
            daysOnMarket: 14, images: ["https://images.unsplash.com/photo-1600596542815-2495db98dada?ixlib=rb-4.0.3"],
            stats: { views: 1245, saves: 84, showings: 12, offers: offers.length },
            benchmarks: { views: '+15%', saves: '+5%', showings: '-10%' },
        } as any);
      }
      setIsLoading(false);
    };
    loadData();
  }, [offers.length]);

  const netCalculation = useMemo(() => {
    const price = selectedOfferForNet ? selectedOfferForNet.amount : netSheetAdjustments.offerPrice;
    const commission = price * (netSheetAdjustments.brokerageFeePercent / 100);
    const closingCosts = price * (netSheetAdjustments.closingCostsPercent / 100);
    const totalDeductions = netSheetAdjustments.mortgagePayoff + commission + closingCosts + netSheetAdjustments.propertyTaxProration + netSheetAdjustments.repairCredits + netSheetAdjustments.otherFees;
    return {
        grossPrice: price,
        commission,
        closingCosts,
        totalDeductions,
        netProceeds: price - totalDeductions
    };
  }, [selectedOfferForNet, netSheetAdjustments]);

  const handleSaveScenario = async () => {
      if (!listing) return;
      setIsSavingScenario(true);
      await n8nService.saveNetSheetScenario(listing.id, netSheetAdjustments);
      setTimeout(() => {
          setIsSavingScenario(false);
          alert("Net Sheet Protocol: Your updated financial scenario has been synced with the brokerage database. Your agent has been notified of your adjustments.");
      }, 1200);
  };

  const handleReset = () => {
      setNetSheetAdjustments({
          id: 'custom_1',
          offerPrice: listing?.price || 850000,
          mortgagePayoff: 385000,
          brokerageFeePercent: 6,
          closingCostsPercent: 1.2,
          propertyTaxProration: 3200,
          repairCredits: 0,
          otherFees: 450
      });
  };

  if (isLoading || !listing) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      
      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative border-b-4 border-blue-700">
        <div className="absolute inset-0 opacity-30">
            <img src={listing.images[0]} alt="Background" className="w-full h-full object-cover blur-md" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/50" />
        <div className="relative z-10 p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <span className="bg-blue-700 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg">
                            <Activity size={12} /> {listing.status}
                        </span>
                        <span className="text-slate-300 text-xs flex items-center gap-1 font-black uppercase tracking-widest">
                            <Clock size={14} className="text-emerald-400" /> {listing.daysOnMarket} Days Active
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{listing.address}</h1>
                </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                    { l: 'Views', v: listing.stats.views, b: listing.benchmarks?.views },
                    { l: 'Saves', v: listing.stats.saves, b: listing.benchmarks?.saves },
                    { l: 'Tours', v: listing.stats.showings, b: listing.benchmarks?.showings },
                    { l: 'Offers', v: listing.stats.offers, b: 'Action', notify: offers.some(o => o.isNew) },
                ].map(s => (
                    <div key={s.l} className="relative">
                        {s.notify && (
                            <span className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full animate-ping border-2 border-slate-900 z-20" />
                        )}
                        <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-1">{s.l}</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-white">{s.v}</span>
                            <button 
                                onClick={() => s.l === 'Offers' && setActiveTab('offers')}
                                className={`text-[10px] font-black px-1.5 py-0.5 rounded transition-all ${
                                    s.b === 'Action' ? 'bg-blue-700 text-white hover:bg-blue-600 shadow-md active:scale-95' :
                                    s.b?.includes('-') ? 'bg-red-400/20 text-red-400' : 'bg-emerald-400/20 text-emerald-400'
                                }`}
                            >
                                {s.b}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="flex bg-white rounded-xl p-1 border border-slate-200 w-fit shadow-sm overflow-x-auto max-w-full scrollbar-hide">
          {[
              { id: 'overview', label: 'Equity Pulse', icon: Activity },
              { id: 'offers', label: 'Offer Board', icon: Gavel, notify: offers.some(o => o.isNew) },
              { id: 'reports', label: 'Market Velocity', icon: FileText },
              { id: 'showcase', label: 'Creative Showcase', icon: Megaphone },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap relative ${activeTab === tab.id ? 'bg-blue-700 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                <tab.icon size={14} /> 
                {tab.label}
                {tab.notify && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm" />
                )}
            </button>
          ))}
      </div>

      {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-10 relative overflow-hidden group">
                  <div className="absolute right-[-20px] top-[-20px] p-8 opacity-5 text-blue-900 group-hover:rotate-12 transition-transform duration-1000"><TrendingUp size={200}/></div>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="text-center md:text-left space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Total Estimated Equity</p>
                      <h3 className="text-5xl font-black text-slate-900 italic tracking-tighter leading-none">${(850000 - 385000).toLocaleString()}</h3>
                      <div className="flex items-center justify-center md:justify-start gap-3">
                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs font-black border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                          <ArrowUpRight size={14}/> +12.4% THIS YEAR
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Zip 78704 Benchmark</span>
                      </div>
                    </div>
                    <div className="bg-blue-50 border-2 border-blue-100 p-8 rounded-[3rem] shadow-inner text-center min-w-[240px]">
                        <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white" />
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray="364.4" strokeDashoffset={364.4 - (364.4 * 0.54)} className="text-blue-700" strokeLinecap="round" />
                            </svg>
                            <span className="absolute text-2xl font-black text-blue-800 italic">54%</span>
                        </div>
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Equity Percentage</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-slate-100">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mortgage Balance</p>
                      <p className="text-lg font-black text-slate-800 tabular-nums">$385,000</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">LTV Ratio</p>
                      <p className="text-lg font-black text-slate-800 tabular-nums">46.2%</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Re-Valuation</p>
                      <p className="text-lg font-black text-blue-700">Today, 2:14 PM</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                        <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <Activity size={18} className="text-blue-700" /> Sentiment Matrix
                        </h3>
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Pricing Feedback</span>
                                        <span className="text-[10px] font-black text-slate-800">7.2/10</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 w-[72%]" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Condition Feedback</span>
                                        <span className="text-[10px] font-black text-slate-800">9.4/10</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[94%]" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Bot size={12}/> Executive Synthesis</p>
                                <p className="text-xs text-blue-900 leading-relaxed font-bold italic">"Market resistance detected at current list price. Buyers are enthusiastic about the finish out but mentioning the high monthly carrying cost relative to current rates."</p>
                            </div>
                        </div>
                    </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                  <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden border-b-8 border-blue-700">
                      <div className="absolute right-0 top-0 p-4 opacity-5"><Bot size={120} /></div>
                      <h4 className="font-black text-[10px] text-blue-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><Sparkles size={16}/> Opportunity Alert</h4>
                      <p className="text-sm font-medium leading-relaxed italic mb-8 text-slate-200">
                          "Your current equity position of <strong className="text-white">$465,000</strong> qualifies you for our 'Instant Upgrade' program—allowing you to buy your next home before this one closes."
                      </p>
                      <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-slate-50 transition-all active:scale-95">
                          Analyze Next Move
                      </button>
                  </div>
                  
                  <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                      <h4 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <MapPin size={18} className="text-blue-700" /> Active Comps
                      </h4>
                      <div className="space-y-4">
                          {[
                              { address: '124 Maple Dr', price: '$860k', status: 'Pending', trend: 'Up' },
                              { address: '890 Oak Ln', price: '$890k', status: 'Active', trend: 'Stable' }
                          ].map((c, i) => (
                              <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                  <div>
                                      <p className="font-black text-[10px] text-slate-800 uppercase">{c.address}</p>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{c.status}</p>
                                  </div>
                                  <div className="text-right">
                                      <p className="font-black text-sm text-blue-700">{c.price}</p>
                                      {c.trend === 'Up' ? <TrendingUp size={12} className="text-emerald-500 ml-auto" /> : <RefreshCw size={12} className="text-slate-300 ml-auto" />}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'offers' && (
          <div className="space-y-8 animate-fade-in-up">
              <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200 w-fit">
                  <button 
                    onClick={() => setOfferSubTab('comparison')}
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${offerSubTab === 'comparison' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                      Offer Comparison
                  </button>
                  <button 
                    onClick={() => setOfferSubTab('net-sheet')}
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${offerSubTab === 'net-sheet' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                      Net Sheet Lab
                  </button>
              </div>

              {offerSubTab === 'comparison' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-8 space-y-6">
                        {offers.map(offer => (
                            <div key={offer.id} className={`bg-white rounded-[2.5rem] border-2 p-8 shadow-xl transition-all relative overflow-hidden group ${offer.isNew ? 'border-blue-600 ring-4 ring-blue-50' : 'border-slate-200'}`}>
                                {offer.isNew && (
                                    <div className="absolute top-0 right-0 bg-blue-700 text-white px-6 py-1.5 rounded-bl-3xl font-black text-[9px] uppercase tracking-widest animate-pulse z-10 shadow-lg">
                                        Action Required: New Offer
                                    </div>
                                )}
                                
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-center font-black text-2xl italic shadow-2xl">
                                            {offer.from[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-2">{offer.from}</h3>
                                            <div className="flex items-center gap-3">
                                                <span className="bg-blue-50 text-blue-800 text-[9px] font-black px-2 py-0.5 rounded border border-blue-100 uppercase tracking-widest">{offer.type} Finance</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Clock size={10}/> {offer.closeDate} Close</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">OFFER PRICE</p>
                                        <p className="text-4xl font-black text-blue-700 tracking-tighter tabular-nums">${offer.amount.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Earnest Money</p>
                                        <p className="text-base font-black text-slate-800">${offer.earnestMoney.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Inspection Period</p>
                                        <p className="text-base font-black text-slate-800">{offer.inspectionDays} Days</p>
                                    </div>
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                        <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Bot size={10}/> AI Context</p>
                                        <p className="text-[10px] font-bold text-blue-900 italic leading-snug">{offer.analysis}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => { setSelectedOfferForNet(offer); setOfferSubTab('net-sheet'); }}
                                        className="flex-1 bg-white border-2 border-slate-200 text-slate-700 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Calculator size={16}/> Calculate Net
                                    </button>
                                    <button className="flex-1 bg-blue-700 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-blue-800 active:scale-95 transition-all border-b-4 border-blue-900 flex items-center justify-center gap-2">
                                        <Gavel size={16}/> Accept or Counter
                                    </button>
                                </div>
                            </div>
                        ))}
                      </div>

                      <div className="lg:col-span-4 space-y-6">
                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden border-b-8 border-blue-700">
                            <div className="absolute right-0 top-0 p-4 opacity-5"><BellRing size={120}/></div>
                            <h4 className="font-black text-[10px] text-blue-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><Sparkles size={16}/> Offer Intelligence</h4>
                            <p className="text-sm font-medium leading-relaxed italic mb-8 text-slate-200">
                                "The Henderson offer is currently the <strong className="text-white">strongest based on net proceeds</strong>. However, Dr. Arbuckle's cash offer represents 0% appraisal risk."
                            </p>
                            <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-slate-50">
                                Request Comparison PDF
                            </button>
                        </div>
                      </div>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
                        <div className="bg-slate-900 p-8 text-white flex justify-between items-center border-b-8 border-blue-700">
                            <div>
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Net Sheet Lab.</h3>
                            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2"><Calculator size={14}/> Dynamic Projections</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleReset} className="p-3 bg-white/10 rounded-xl hover:bg-white/20 text-white transition-all" title="Reset to Defaults">
                                    <RefreshCw size={20}/>
                                </button>
                                <button onClick={handleSaveScenario} disabled={isSavingScenario} className="p-3 bg-blue-600 rounded-xl hover:bg-blue-500 text-white transition-all shadow-xl" title="Save Adjustment Scenario">
                                    {isSavingScenario ? <Loader2 size={20} className="animate-spin" /> : <Save size={20}/>}
                                </button>
                            </div>
                        </div>

                        <div className="p-8 space-y-8 overflow-y-auto max-h-[600px] scrollbar-hide">
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Offer Price</label>
                                    <div className="relative group">
                                        <input 
                                        type="number" 
                                        value={netSheetAdjustments.offerPrice}
                                        onChange={e => setNetSheetAdjustments({...netSheetAdjustments, offerPrice: parseInt(e.target.value) || 0})}
                                        className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner" 
                                        />
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-700" size={18}/>
                                    </div>
                                    </div>
                                    <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Mortgage Payoff</label>
                                    <div className="relative group">
                                        <input 
                                        type="number" 
                                        value={netSheetAdjustments.mortgagePayoff}
                                        onChange={e => setNetSheetAdjustments({...netSheetAdjustments, mortgagePayoff: parseInt(e.target.value) || 0})}
                                        className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner" 
                                        />
                                        <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-700" size={18}/>
                                    </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Brokerage Fee (%)</label>
                                    <div className="relative group">
                                        <input 
                                        type="number" step="0.5"
                                        value={netSheetAdjustments.brokerageFeePercent}
                                        onChange={e => setNetSheetAdjustments({...netSheetAdjustments, brokerageFeePercent: parseFloat(e.target.value) || 0})}
                                        className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner" 
                                        />
                                        <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-700" size={18}/>
                                    </div>
                                    </div>
                                    <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Closing Costs (%)</label>
                                    <div className="relative group">
                                        <input 
                                        type="number" step="0.1"
                                        value={netSheetAdjustments.closingCostsPercent}
                                        onChange={e => setNetSheetAdjustments({...netSheetAdjustments, closingCostsPercent: parseFloat(e.target.value) || 0})}
                                        className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner" 
                                        />
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-700" size={18}/>
                                    </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Tax Prorations</label>
                                    <div className="relative group">
                                        <input 
                                        type="number" 
                                        value={netSheetAdjustments.propertyTaxProration}
                                        onChange={e => setNetSheetAdjustments({...netSheetAdjustments, propertyTaxProration: parseInt(e.target.value) || 0})}
                                        className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner" 
                                        />
                                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-700" size={18}/>
                                    </div>
                                    </div>
                                    <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Repair Credits</label>
                                    <div className="relative group">
                                        <input 
                                        type="number" 
                                        value={netSheetAdjustments.repairCredits}
                                        onChange={e => setNetSheetAdjustments({...netSheetAdjustments, repairCredits: parseInt(e.target.value) || 0})}
                                        className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner" 
                                        />
                                        <AlertTriangle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-700" size={18}/>
                                    </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                                <div className="flex items-start gap-4">
                                    <Info size={18} className="text-blue-700 mt-0.5 shrink-0" />
                                    <p className="text-[10px] text-blue-800 font-bold leading-relaxed italic">
                                        "Your adjustments are synced with the 'Brokerage Vault'. Projections are based on Travis County settlement standards. Save your scenario to lock in expectations for your agent's closing review."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* ITEMISED BREAKDOWN */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-lg p-8 space-y-6">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                <ListTodo size={14} className="text-blue-700" /> Itemized Settlement Projections
                            </h4>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-slate-50">
                                    <span className="text-sm font-bold text-slate-600">Gross Sale Price</span>
                                    <span className="text-sm font-black text-slate-900 tabular-nums">${netCalculation.grossPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-50 text-red-500">
                                    <span className="text-sm font-bold">Mortgage Payoff (Adjusted)</span>
                                    <span className="text-sm font-black tabular-nums">-${netSheetAdjustments.mortgagePayoff.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-50 text-red-500">
                                    <span className="text-sm font-bold">Brokerage Fee ({netSheetAdjustments.brokerageFeePercent}%)</span>
                                    <span className="text-sm font-black tabular-nums">-${netCalculation.commission.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-50 text-red-500">
                                    <span className="text-sm font-bold">Closing Costs ({netSheetAdjustments.closingCostsPercent}%)</span>
                                    <span className="text-sm font-black tabular-nums">-${netCalculation.closingCosts.toLocaleString()}</span>
                                </div>
                                {netSheetAdjustments.propertyTaxProration > 0 && (
                                    <div className="flex justify-between items-center py-3 border-b border-slate-50 text-red-500">
                                        <span className="text-sm font-bold">Property Tax Proration</span>
                                        <span className="text-sm font-black tabular-nums">-${netSheetAdjustments.propertyTaxProration.toLocaleString()}</span>
                                    </div>
                                )}
                                {netSheetAdjustments.repairCredits > 0 && (
                                    <div className="flex justify-between items-center py-3 border-b border-slate-50 text-red-500">
                                        <span className="text-sm font-bold">Repair Credits to Buyer</span>
                                        <span className="text-sm font-black tabular-nums">-${netSheetAdjustments.repairCredits.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-6">
                                    <span className="text-[10px] font-black uppercase text-slate-400">Total Deductions</span>
                                    <span className="text-lg font-black text-red-600 tabular-nums">-${netCalculation.totalDeductions.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* FINAL NET PROCEEDS DISPLAY */}
                        <div className="bg-blue-700 rounded-[2.5rem] p-10 text-white flex flex-col justify-center text-center border-b-8 border-blue-950 shadow-2xl relative overflow-hidden group">
                            <div className="absolute right-[-20px] top-[-20px] p-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000"><DollarSign size={200}/></div>
                            <div className="relative z-10 space-y-2">
                                <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.3em]">Estimated Final Net Check</p>
                                <h4 className="text-6xl font-black tracking-tighter tabular-nums italic">${netCalculation.netProceeds.toLocaleString()}</h4>
                                <div className="pt-8">
                                    <button className="w-full py-5 bg-white text-blue-900 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-blue-50 transition-all flex items-center justify-center gap-3">
                                        <Download size={18}/> Export Dynamic Projection
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
              )}
          </div>
      )}

      {activeTab === 'reports' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastReports.map(report => (
                      <div key={report.id} className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm flex flex-col group hover:border-blue-500 transition-all">
                          <div className="flex justify-between items-start mb-6">
                              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-700 group-hover:bg-blue-50 transition-all">
                                  <FileText size={24}/>
                              </div>
                              <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-emerald-100">{report.status}</span>
                          </div>
                          <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg italic mb-1">{report.weekEnding}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">{report.viewsZillow} Views • {report.showingsCount} Showings</p>
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8 flex-1">
                              <p className="text-[9px] font-black text-blue-700 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Bot size={12}/> AI Insight</p>
                              <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-3">"{report.feedbackSummaryAI}"</p>
                          </div>
                          <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2">
                              <Download size={14}/> Download PDF
                          </button>
                      </div>
                  ))}
                  <div className="border-4 border-dashed border-slate-100 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center gap-3">
                      <Clock size={48} className="text-slate-100" />
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Next Report Generates in 3 Days</p>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'showcase' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-blue-700">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Megaphone size={180}/></div>
                  <div className="relative z-10">
                      <p className="text-blue-400 text-xs font-black uppercase tracking-[0.3em] mb-4">Omnichannel Promotion</p>
                      <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-4 leading-none">We are promoting your home everywhere.</h3>
                      <p className="text-blue-100 text-lg font-medium opacity-90 leading-relaxed mb-8 max-w-xl">Our Creative Studio pipeline automatically generated luxury reels, graphics, and flyers the moment your home was listed.</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {marketingAssets.map(asset => (
                      <div key={asset.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-lg overflow-hidden group hover:border-blue-500 transition-all flex flex-col h-full">
                          <div className="aspect-video bg-slate-900 relative overflow-hidden flex flex-col items-center justify-center">
                              <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" />
                              <div className="relative z-10">
                                  {asset.type === 'Video' ? <PlayCircle size={48} className="text-white drop-shadow-xl"/> : <ImageIcon size={48} className="text-white drop-shadow-xl"/>}
                              </div>
                              <div className="absolute top-4 left-4">
                                  <span className="bg-blue-700 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-lg">{asset.platform}</span>
                              </div>
                          </div>
                          <div className="p-6 flex flex-col flex-1">
                              <div className="flex justify-between items-start mb-4">
                                  <h4 className="font-black text-slate-900 uppercase tracking-tight text-base leading-none">{asset.name}</h4>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mb-6">
                                  {asset.aiTags.map(tag => <span key={tag} className="text-[7px] font-black bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-widest">{tag}</span>)}
                              </div>
                              <button className="mt-auto w-full py-2.5 bg-slate-50 text-slate-700 rounded-xl font-black uppercase text-[8px] tracking-widest hover:bg-blue-700 hover:text-white transition-all flex items-center justify-center gap-2">
                                  <Share2 size={12}/> Share Listing
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-5"><Bot size={120} /></div>
          <h4 className="font-black text-[10px] text-blue-700 uppercase tracking-[0.3em] mb-4 flex items-center gap-2"><Bot size={16}/> Smart Engine AI Strategy</h4>
          <p className="text-sm font-medium leading-relaxed italic text-slate-600">
              "Smart Engine AI is monitoring buyer sentiment for ${listing.address} across all channels. We are currently seeing high engagement but price resistance at the current level. Recommendation: Stay the course through the weekend tours."
          </p>
      </div>
    </div>
  );
};

export default SellerDashboard;
