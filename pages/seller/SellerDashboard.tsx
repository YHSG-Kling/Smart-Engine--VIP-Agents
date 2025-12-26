
import React, { useState, useEffect } from 'react';
import { 
  Eye, Users, FileText, TrendingUp, Calendar, 
  MessageCircle, ThumbsUp, ThumbsDown, DollarSign,
  ArrowRight, Mail, Download, Clock, Image as ImageIcon, Wand2, Calculator, Loader2, Home, MapPin, Activity,
  CheckCircle2, AlertTriangle, ShieldCheck, ListTodo, ChevronRight, Upload, ShoppingBag, PieChart, Info,
  Phone, MessageSquare as MessageIcon, User, Sparkles, Send,
  RefreshCw, Bot, Landmark, Gauge, Globe, PlayCircle, Share2, Megaphone,
  MoreVertical, TrendingDown, ExternalLink, Ticket, Zap
} from 'lucide-react';
import { n8nService } from '../../services/n8n';
import { airtableService } from '../../services/airtable';
import { Listing, SellerReport, MarketStat, MarketingAsset, OpenHouse } from '../../types';

interface SellerDashboardProps {
  onNavigate?: (page: string) => void;
  initialAction?: string;
}

const SellerDashboard: React.FC<SellerDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'offers' | 'showcase'>('overview');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Workflow 63: Reports State
  const [pastReports] = useState<SellerReport[]>([
    { id: 'rep_1', listingId: '1', address: '1234 Skyline Dr', weekEnding: 'Oct 27, 2023', viewsZillow: 450, showingsCount: 4, status: 'Sent', feedbackSummaryAI: 'High interest in kitchen. One objection on master bath color.', pdfUrl: '#' },
    { id: 'rep_2', listingId: '1', address: '1234 Skyline Dr', weekEnding: 'Oct 20, 2023', viewsZillow: 795, showingsCount: 8, status: 'Sent', feedbackSummaryAI: 'Initial launch velocity very high. Recommended open house strategy.', pdfUrl: '#' }
  ]);

  // Workflow 112: Marketing Assets (Client View C)
  const [marketingAssets] = useState<MarketingAsset[]>([
    { id: 'ma1', listingId: '1', name: 'Premium Listing Reel', url: '#', type: 'Video', platform: 'Instagram', category: 'Social', aiTags: ['Featured', 'AI Tour'], uploadDate: 'Today', size: '15MB' },
    { id: 'ma2', listingId: '1', name: 'Digital Property Flyer', url: '#', type: 'PDF', platform: 'Print', category: 'Flyer', aiTags: ['Print-Ready'], uploadDate: 'Yesterday', size: '2.5MB' },
    { id: 'ma3', listingId: '1', name: 'Facebook Ad Suite', url: '#', type: 'Image', platform: 'Facebook', category: 'Social', aiTags: ['Paid Media'], uploadDate: 'Yesterday', size: '4MB' },
  ]);

  // Workflow 114: Syndication Status (Client View C)
  const syndicationChannels = [
    { name: 'Zillow', logo: 'https://cdn.iconscout.com/icon/free/png-256/free-zillow-3629168-3030275.png', status: 'Active' },
    { name: 'Realtor.com', logo: 'https://static.rdc.moveaws.com/images/logos/rdc-logo-default.svg', status: 'Active' },
    { name: 'Redfin', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Redfin_logo.svg', status: 'Active' },
    { name: 'Trulia', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Trulia_logo.svg/2560px-Trulia_logo.svg.png', status: 'Active' },
  ];

  // Workflow 115: Open House Tracker (Client View C)
  const [openHouse] = useState<OpenHouse | null>({
    id: 'oh1', listingId: '1', address: '1234 Skyline Dr', startTime: 'Saturday, 1:00 PM', endTime: '3:00 PM', theme: 'Sunset Sip & See', status: 'Active', rsvpCount: 12, qrCodeUrl: ''
  });

  // Net Sheet State
  const [selectedOfferForNet, setSelectedOfferForNet] = useState<any>(null);
  const [netSheetAdjustments] = useState({
      mortgagePayoff: 385000,
      brokerageFeeRate: 6,
      closingCostsRate: 1,
      proratedTaxes: 3200,
      repairCredit: 0
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
            stats: { views: 1245, saves: 84, showings: 12, offers: 3 },
            benchmarks: { views: '+15%', saves: '+5%', showings: '-10%' },
            propertyData: { estimatedValue: 850000, mortgageBalance: 385000, equityPercent: 54, lastSaleDate: '2018-05-20', ownerStatus: 'Owner Occupied', aiPrediction: 'High', aiReason: '', lastEnriched: 'Today' }
        } as any);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const offers = [
    { id: 1, from: 'Buyer A', amount: 840000, type: 'Conventional', closeDate: '30 Days', net: 795000, status: 'Active', analysis: 'Highest Net' },
    { id: 2, from: 'Buyer B', amount: 825000, type: 'Cash', closeDate: '10 Days', net: 782000, status: 'Active', analysis: 'Fastest Close' },
  ];

  const calculateNet = () => {
    if (!selectedOfferForNet) return 0;
    const amount = selectedOfferForNet.amount;
    const commission = amount * (netSheetAdjustments.brokerageFeeRate / 100);
    const closingCosts = amount * (netSheetAdjustments.closingCostsRate / 100);
    return amount - netSheetAdjustments.mortgagePayoff - commission - closingCosts - netSheetAdjustments.proratedTaxes - netSheetAdjustments.repairCredit;
  };

  if (isLoading || !listing) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      
      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative border-b-4 border-indigo-600">
        <div className="absolute inset-0 opacity-30">
            <img src={listing.images[0]} alt="Background" className="w-full h-full object-cover blur-md" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/50" />
        <div className="relative z-10 p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg">
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
                    { l: 'Offers', v: listing.stats.offers, b: 'Action' },
                ].map(s => (
                    <div key={s.l}>
                        <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">{s.l}</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-white">{s.v}</span>
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${s.b?.includes('-') ? 'bg-red-400/20 text-red-400' : 'bg-emerald-400/20 text-emerald-400'}`}>{s.b}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="flex bg-white rounded-xl p-1 border border-slate-200 w-fit shadow-sm overflow-x-auto max-w-full scrollbar-hide">
          {[
              { id: 'overview', label: 'Market Pulse', icon: Activity },
              { id: 'showcase', label: 'Marketing Showcase', icon: Megaphone },
              { id: 'reports', label: 'Performance', icon: FileText },
              { id: 'offers', label: 'Net Sheet', icon: Calculator }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                <tab.icon size={14} /> {tab.label}
            </button>
          ))}
      </div>

      {activeTab === 'showcase' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Megaphone size={180}/></div>
                  <div className="relative z-10">
                      <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.3em] mb-4">Omnichannel Promotion</p>
                      <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-4 leading-none">We are promoting your home everywhere.</h3>
                      <p className="text-indigo-100 text-lg font-medium opacity-90 leading-relaxed mb-8 max-w-xl">Our Creative Studio pipeline automatically generated luxury reels, graphics, and flyers the moment your home was listed.</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {marketingAssets.map(asset => (
                      <div key={asset.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-lg overflow-hidden group hover:border-indigo-400 transition-all flex flex-col h-full">
                          <div className="aspect-video bg-slate-900 relative overflow-hidden flex flex-col items-center justify-center">
                              <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" />
                              <div className="relative z-10">
                                  {asset.type === 'Video' ? <PlayCircle size={48} className="text-white drop-shadow-xl"/> : <ImageIcon size={48} className="text-white drop-shadow-xl"/>}
                              </div>
                              <div className="absolute top-4 left-4">
                                  <span className="bg-indigo-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-lg">{asset.platform}</span>
                              </div>
                          </div>
                          <div className="p-6 flex flex-col flex-1">
                              <div className="flex justify-between items-start mb-4">
                                  <h4 className="font-black text-slate-900 uppercase tracking-tight text-base leading-none">{asset.name}</h4>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mb-6">
                                  {asset.aiTags.map(tag => <span key={tag} className="text-[7px] font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 uppercase">{tag}</span>)}
                              </div>
                              <button className="mt-auto w-full py-2.5 bg-slate-50 text-slate-700 rounded-xl font-black uppercase text-[8px] tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2">
                                  <Share2 size={12}/> Share Listing
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
              <div className="lg:col-span-8 space-y-6">
                  {/* Workflow 115: Open House Tracker (Client View C) */}
                  {openHouse && (
                      <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group hover:border-white transition-all duration-500 border-4 border-transparent">
                          <div className="absolute right-0 top-0 p-12 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000"><Ticket size={200}/></div>
                          <div className="relative z-10">
                              <div className="flex items-center gap-3 mb-6">
                                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md border border-white/30">
                                      <Zap className="text-white animate-pulse" size={20}/>
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-100">Live Event Hub</span>
                              </div>
                              <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-2 leading-none">Open House Scheduled.</h3>
                              <p className="text-2xl font-black text-indigo-200 uppercase tracking-tight mb-8">
                                  {openHouse.startTime} • {openHouse.theme}
                              </p>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                                  <div className="bg-black/20 p-5 rounded-3xl border border-white/10 backdrop-blur-xl flex items-center gap-5">
                                      <div className="text-4xl font-black tracking-tighter tabular-nums">{openHouse.rsvpCount}</div>
                                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-200">Total <br/> RSVPs</div>
                                  </div>
                                  <div className="bg-black/20 p-5 rounded-3xl border border-white/10 backdrop-blur-xl flex flex-col justify-center">
                                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-200 mb-1">Status</p>
                                      <p className="text-xl font-black uppercase italic tracking-tight">Marketing Blitz Active</p>
                                  </div>
                              </div>

                              <div className="flex flex-wrap gap-4">
                                  <button className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-50 active:scale-95 transition-all flex items-center gap-3">
                                      <Share2 size={18}/> Share Event Link
                                  </button>
                                  <button className="bg-white/10 border border-white/30 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/20 transition-all flex items-center gap-3">
                                      <Download size={18}/> Marketing Assets
                                  </button>
                              </div>
                          </div>
                      </div>
                  )}

                  {/* Workflow 114: Where is my Home? (Client View C) */}
                  <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <Globe size={18} className="text-indigo-600" /> Where is my home?
                        </h3>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Live Syndication Monitor</p>
                      </div>
                      <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                          {syndicationChannels.map(channel => (
                              <div key={channel.name} className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-indigo-200 transition-all group">
                                  <div className="w-16 h-12 flex items-center justify-center mb-4 grayscale group-hover:grayscale-0 transition-all">
                                      <img src={channel.logo} alt={channel.name} className="max-h-full max-w-full object-contain" />
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                      <div className={`w-1.5 h-1.5 rounded-full ${channel.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{channel.status}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <Activity size={18} className="text-indigo-600" /> Showing Sentiment Log
                        </h3>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live MLS Feed</span>
                      </div>
                      <div className="divide-y divide-slate-100">
                          {[
                              { date: 'Oct 28', time: '2:00 PM', sentiment: 'Positive', comment: 'Loved the kitchen reno. Worried about backyard size.' },
                              { date: 'Oct 27', time: '10:30 AM', sentiment: 'Critical', comment: 'Master bathroom color is too bold. Potential credit requested.' },
                              { date: 'Oct 25', time: '4:15 PM', sentiment: 'Positive', comment: 'Second tour. Bringing parents tomorrow.' }
                          ].map((s, i) => (
                              <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                  <div className="flex items-center gap-6">
                                      <div className="text-center min-w-[60px]">
                                          <p className="text-sm font-black text-slate-900 leading-none">{s.date}</p>
                                          <p className="text-[9px] font-bold text-slate-400 mt-1">{s.time}</p>
                                      </div>
                                      <div>
                                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border mb-2 inline-block ${
                                              s.sentiment === 'Positive' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                                          }`}>
                                              {s.sentiment} Sentiment
                                          </span>
                                          <p className="text-sm font-bold text-slate-700 italic leading-relaxed">"{s.comment}"</p>
                                      </div>
                                  </div>
                                  <ChevronRight size={18} className="text-slate-200" />
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                  <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                      <div className="absolute right-0 top-0 p-4 opacity-5"><Bot size={120} /></div>
                      <h4 className="font-black text-[10px] text-indigo-400 uppercase tracking-[0.3em] mb-6">AI Strategy Bot</h4>
                      <p className="text-sm font-medium leading-relaxed italic mb-8 text-slate-200">
                          "Traffic is 15% above benchmark. Based on sentiment patterns, a $2,000 paint credit for the master suite could trigger an offer this weekend."
                      </p>
                      <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-indigo-50 transition-all active:scale-95">
                          View Detailed Analysis
                      </button>
                  </div>
                  
                  <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                      <h4 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <MapPin size={18} className="text-indigo-600" /> Comp Monitoring
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
                                      <p className="font-black text-sm text-indigo-600">{c.price}</p>
                                      {c.trend === 'Up' ? <TrendingUp size={12} className="text-emerald-500 ml-auto" /> : <RefreshCw size={12} className="text-slate-300 ml-auto" />}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'reports' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastReports.map(report => (
                      <div key={report.id} className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm flex flex-col group hover:border-indigo-400 transition-all">
                          <div className="flex justify-between items-start mb-6">
                              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                                  <FileText size={24}/>
                              </div>
                              <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-emerald-100">{report.status}</span>
                          </div>
                          <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg italic mb-1">{report.weekEnding}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">{report.viewsZillow} Views • {report.showingsCount} Showings</p>
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8 flex-1">
                              <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Bot size={12}/> AI Insight</p>
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

      {activeTab === 'offers' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {offers.map(offer => (
                      <div key={offer.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-lg overflow-hidden flex flex-col group hover:border-indigo-400 transition-all">
                          <div className="p-8 border-b border-slate-50">
                              <div className="flex justify-between items-start mb-6">
                                  <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl italic">{offer.from[offer.from.length-1]}</div>
                                      <div>
                                          <h4 className="font-black text-slate-900 uppercase tracking-tight text-xl italic">{offer.from}</h4>
                                          <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-emerald-100">{offer.analysis}</span>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Offer Amount</p>
                                      <p className="text-3xl font-black text-slate-900 tracking-tighter">${(offer.amount/1000).toFixed(0)}k</p>
                                  </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Landmark size={10}/> Financing</p>
                                      <p className="text-sm font-black text-slate-800 uppercase">{offer.type}</p>
                                  </div>
                                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Clock size={10}/> Close</p>
                                      <p className="text-sm font-black text-slate-800 uppercase">{offer.closeDate}</p>
                                  </div>
                              </div>
                          </div>
                          <div className="p-6 bg-slate-50 flex gap-4">
                              <button 
                                onClick={() => { setSelectedOfferForNet(offer); }}
                                className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                              >
                                  <Calculator size={16}/> Calculate Net
                              </button>
                              <button className="bg-white border-2 border-indigo-600 text-indigo-600 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-50 transition-all">Accept</button>
                          </div>
                      </div>
                  ))}
              </div>

              {selectedOfferForNet && (
                  <div className="bg-white rounded-[2.5rem] border border-indigo-400 p-10 shadow-2xl animate-fade-in-up relative overflow-hidden">
                      <div className="absolute right-0 top-0 p-12 opacity-5"><DollarSign size={200}/></div>
                      <div className="relative z-10">
                          <div className="flex justify-between items-center mb-10">
                              <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Net Proceeds <br/> Analysis: {selectedOfferForNet.from}.</h3>
                              <button onClick={() => setSelectedOfferForNet(null)} className="p-2 bg-slate-100 rounded-full"><XCircle size={24}/></button>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                              <div className="lg:col-span-2 space-y-6">
                                  <div className="grid grid-cols-2 gap-8">
                                      {[
                                          { label: 'Mortgage Payoff', val: `$${netSheetAdjustments.mortgagePayoff.toLocaleString()}` },
                                          { label: 'Commission (6%)', val: `$${(selectedOfferForNet.amount * 0.06).toLocaleString()}` },
                                          { label: 'Closing Costs (1%)', val: `$${(selectedOfferForNet.amount * 0.01).toLocaleString()}` },
                                          { label: 'Prorated Taxes', val: `$${netSheetAdjustments.proratedTaxes.toLocaleString()}` }
                                      ].map(item => (
                                          <div key={item.label} className="border-b border-slate-100 pb-4">
                                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                                              <p className="text-xl font-black text-slate-800 tracking-tight">{item.val}</p>
                                          </div>
                                      ))}
                                  </div>
                                  <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                                      <p className="text-xs text-indigo-700 font-medium leading-relaxed italic">
                                          "This calculation includes the standard brokerage splits and estimated title/escrow fees for Travis County. Final figures determined by settlement statement."
                                      </p>
                                  </div>
                              </div>
                              <div className="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col justify-center text-center border-b-8 border-indigo-900 shadow-2xl">
                                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em] mb-2">Estimated Net Check</p>
                                  <h4 className="text-5xl font-black tracking-tighter tabular-nums mb-4">${calculateNet().toLocaleString()}</h4>
                                  <button className="w-full py-4 bg-white text-indigo-900 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                                      <Download size={16}/> Export Net Sheet
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-5"><Bot size={120} /></div>
          <h4 className="font-black text-[10px] text-indigo-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-2"><Bot size={16}/> Smart Engine AI Strategy</h4>
          <p className="text-sm font-medium leading-relaxed italic text-slate-600">
              "Smart Engine AI is monitoring buyer sentiment for ${listing.address} across all channels. We are currently seeing high engagement but price resistance at the current level. Recommendation: Stay the course through the weekend tours."
          </p>
      </div>
    </div>
  );
};

// Internal icon component for cleaner UI
const XCircle = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
);

export default SellerDashboard;
