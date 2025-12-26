
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Wand2, Image as ImageIcon, Video, FileText, Loader2, Download, 
  RefreshCw, Upload, Sparkles, Calendar, Clock, Facebook, Linkedin, 
  Instagram, Mail, PlayCircle, Plus, PieChart, Users, Target, MousePointer,
  Megaphone, Magnet, Share2, Layers, BarChart3, Edit, Link as LinkIcon,
  MousePointerClick, ArrowUpRight, ArrowRight, ExternalLink, Bot, Check, Grid, List, Tag, Search, Trash2, PenTool, Layout,
  Smartphone, Map, Globe, Activity, ShieldCheck, TrendingUp, DollarSign, X, LayoutDashboard, QrCode, AudioLines, Scan, Eye,
  Zap, Settings, Database, Link2, StopCircle, MoreVertical, LayoutList, ClipboardCheck, Palette, FileDown,
  AlertTriangle, MessageSquare, Phone, Ghost, UserX, UserCheck, Star, Heart,
  Send, CheckCircle2, Archive, Filter, SearchCode, FilePlus
} from 'lucide-react';
import { n8nService } from '../../services/n8n';
import { DripCampaign, LeadMagnet, MarketingAsset, BrandTemplate, SocialPost, UserRole, MarketStat, AdCampaign, QRCodeRecord, SocialLeadMapping, CampaignEnrollment, SellerActivity, DripStep, ActiveNurture, ReactivationConfig, ResurrectedLead, ReviewMarketingAsset } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const MarketingStudio: React.FC = () => {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'capture' | 'campaigns' | 'social' | 'social-assets' | 'library' | 'reports' | 'ads' | 'qr' | 'integrations' | 'reactivation'>('analytics');
  const [campaignMode, setCampaignMode] = useState<'Buyer' | 'Seller'>('Buyer');
  
  // Workflow 112 & 144 State
  const [isRegeneratingAssets, setIsRegeneratingAssets] = useState(false);
  const [selectedListingForAssets, setSelectedListingForAssets] = useState('123 Main St');
  const [brandKit, setBrandKit] = useState({ primaryColor: '#4f46e5', font: 'Inter', logo: 'Nexus Logo V2', bannerbearId: 'tpl_882910X' });

  // Workflow 157: Digital Asset Management (DAM)
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [isUploadingAsset, setIsUploadingAsset] = useState(false);
  const [assetFilter, setAssetFilter] = useState<{type: string, category: string}>({ type: 'All', category: 'All' });

  const [marketingAssets, setMarketingAssets] = useState<MarketingAsset[]>([
    { id: 'ga1', listingId: 'l1', name: 'Just Listed Reel', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', type: 'Video', platform: 'Instagram', category: 'Social', aiTags: ['HeyGen', 'Luxury', 'Modern Kitchen'], uploadDate: 'Today', size: '12 MB', status: 'Active' },
    { id: 'ga2', listingId: 'l1', name: 'Main Property Flyer', url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', type: 'PDF', platform: 'Print', category: 'Collateral', aiTags: ['Canva', 'Print-Ready', 'Pool', 'Exterior'], uploadDate: 'Just Now', size: '2.4 MB', status: 'Active' },
    { id: 'ga3', listingId: 'l1', name: 'Facebook Ad Graphic', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', type: 'Image', platform: 'Facebook', category: 'Social', aiTags: ['Bannerbear', 'City View', 'Penthouse'], uploadDate: 'Just Now', size: '1.1 MB', status: 'Active' },
    { id: 'ga4', listingId: 'all', name: 'Winter Maintenance Checklist', url: 'https://images.unsplash.com/photo-1445510861639-5651173bc5d5?w=800&q=80', type: 'PDF', platform: 'Email', category: 'Education', aiTags: ['Seasonal', 'Checklist'], uploadDate: 'Oct 01', size: '3.2 MB', expirationDate: '2024-03-01', status: 'Active' },
    { id: 'ga5', listingId: 'l2', name: 'Backyard Zen Garden', url: 'https://images.unsplash.com/photo-1558904541-efa8c1965f1e?w=800&q=80', type: 'Image', platform: 'Website', category: 'Listing', aiTags: ['Backyard', 'Zen', 'Landscaping'], uploadDate: '2d ago', size: '4.5 MB', status: 'Active' },
  ]);

  const handleUploadAndTag = async (file: File) => {
    setIsUploadingAsset(true);
    
    // Workflow 157 Node 2: Vision Analysis Simulation
    let tags = ['New', 'Analyzed'];
    try {
        if (process.env.API_KEY) {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            // Simulation: In a real scenario, we'd send the image bytes/URL to Gemini Vision
            const prompt = `Act as a Real Estate Digital Asset Manager. Based on the file name "${file.name}", suggest 3-5 AI tags. Return strictly a comma-separated list.`;
            const result = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });
            if (result.text) {
                tags = result.text.split(',').map(t => t.trim());
            }
        }
    } catch (e) { console.error(e); }

    // Workflow 157 Node 3: Update Tags
    await n8nService.uploadMarketingAsset({ name: file.name, category: 'Branding', file });

    setTimeout(() => {
        const newAsset: MarketingAsset = {
            id: Date.now().toString(),
            listingId: 'all',
            name: file.name.split('.')[0],
            url: URL.createObjectURL(file),
            type: file.type.includes('image') ? 'Image' : file.type.includes('video') ? 'Video' : 'PDF',
            platform: 'Nexus Vault',
            category: 'Branding',
            aiTags: tags,
            uploadDate: 'Just Now',
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            status: 'Active'
        };
        setMarketingAssets(prev => [newAsset, ...prev]);
        setIsUploadingAsset(false);
        alert(`AI DAM: File uploaded and indexed with tags: ${tags.join(', ')}`);
    }, 2000);
  };

  const filteredAssets = useMemo(() => {
    return marketingAssets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(assetSearchQuery.toLowerCase()) || 
                             asset.aiTags.some(t => t.toLowerCase().includes(assetSearchQuery.toLowerCase()));
        const matchesType = assetFilter.type === 'All' || asset.type === assetFilter.type;
        const matchesCat = assetFilter.category === 'All' || asset.category === assetFilter.category;
        return matchesSearch && matchesType && matchesCat && asset.status === 'Active';
    });
  }, [marketingAssets, assetSearchQuery, assetFilter]);

  // Workflow 144: Review Assets
  const [reviewAssets, setReviewAssets] = useState<ReviewMarketingAsset[]>([
    { id: 'ra1', reviewText: "Sarah was incredible! She sold our house in 3 days for $20k over asking. The most stress-free experience we've ever had.", reviewerName: "Alice Freeman", imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80", caption: "Another record broken in 78704! 🚀 So happy for Alice and her family. Just Sold for $20k over list! #RealEstate #JustSold #AustinHomes", status: 'Draft', timestamp: '1h ago' },
    { id: 'ra2', reviewText: "I've used many agents, but Nexus is different. Their AI marketing actually works. We had 12 showings in the first weekend.", reviewerName: "Bob Driller", imageUrl: "https://images.unsplash.com/photo-1600596542815-2495db98dada?w=600&q=80", caption: "Strategy meets results. 🤝 Bob saw the power of our Digital Concierge first hand. 12 showings, 1 happy seller. #Sold #NexusOS #Excellence", status: 'Scheduled', timestamp: '4h ago' }
  ]);

  const isAdmin = role === UserRole.ADMIN || role === UserRole.BROKER;

  const handleApproveAndPost = async (id: string) => {
    setIsRegeneratingAssets(true);
    await n8nService.approveSocialPost(id);
    setTimeout(() => {
        setReviewAssets(prev => prev.map(a => a.id === id ? { ...a, status: 'Posted' } : a));
        setIsRegeneratingAssets(false);
        alert("Social Blitz: Review asset dispatched to Buffer/Instagram queue.");
    }, 1500);
  };

  // --- Workflow 118: Smart Drips Data ---
  const [smartDrips] = useState<DripCampaign[]>([
    { id: 'sd1', name: 'Non-Linear Buyer Onboarding', status: 'Active', steps: 5, openRate: 68, replyRate: 22, goalType: 'Appointment' },
    { id: 'sd2', name: 'Acreage/Ranch Protocol', status: 'Active', steps: 4, openRate: 45, replyRate: 15, goalType: 'Reply' },
  ]);

  const [activeNurtures, setActiveNurtures] = useState<ActiveNurture[]>([
    { id: 'an1', leadName: 'Alice Freeman', currentStep: 'Email #3: Interest Rate Drop', aiSentiment: 'Positive', nextAction: 'SMS if no reply', status: 'Active', lastActivity: '2 mins ago' },
    { id: 'an2', leadName: 'Bob Driller', currentStep: 'SMS: Browsing Alert', aiSentiment: 'Neutral', nextAction: 'Wait 48h', status: 'Active', lastActivity: '1h ago' },
    { id: 'an3', leadName: 'Charlie Day', currentStep: 'Email #1: Market Report', aiSentiment: 'Urgent', nextAction: 'Call Handover', status: 'Paused', lastActivity: '1d ago' },
  ]);

  // --- Workflow 121: Reactivation Data ---
  const [reactivationConfig, setReactivationConfig] = useState<ReactivationConfig>({
      zombieThresholdDays: 30,
      isAutoSendEnabled: true,
      lastScanDate: 'Today, 10:00 AM'
  });

  const [resurrectedLeads] = useState<ResurrectedLead[]>([
      { id: 'res1', leadId: 'l101', name: 'Tom Hardy', ghostedDays: 45, recallProperty: '123 Main St (Modern)', hookProperty: '456 Tech Ln (Modern)', aiMessage: 'Hey Tom, that Modern on Main St sold, but this new one at 456 Tech Ln just hit. Want the link?', replyText: 'Yes please! Didn’t think I’d see another like that.', sentiment: 'Positive', timestamp: '20 mins ago' },
      { id: 'res2', leadId: 'l102', name: 'Emma Stone', ghostedDays: 92, recallProperty: '88 Oak (Fixer)', hookProperty: '12 Fixer Way (Fixer)', aiMessage: 'Hi Emma, I found a new Fixer-Upper near Oak Ave that fits your ROI goals. Check it out?', replyText: 'Still looking for the right project. Send it over.', sentiment: 'Neutral', timestamp: '1h ago' }
  ]);

  const [isScanningZombies, setIsScanningZombies] = useState(false);

  // --- Workflow 112: Admin View A Data ---
  const [masterTemplates] = useState<BrandTemplate[]>([
      { id: 'bt1', name: 'Luxury Instagram Post', platform: 'Instagram', previewUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&q=80' },
      { id: 'bt2', name: 'Open House Flyer (8.5x11)', platform: 'Print', previewUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&q=80' },
      { id: 'bt3', name: 'Story Reel - Dynamic', platform: 'Instagram', previewUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=300&q=80' },
  ]);

  const [generatedPosts] = useState<SocialPost[]>([
    { id: 'sp1', platform: 'Instagram', content: 'Experience modern elegance at 123 Main St. #AustinRealEstate', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80', scheduledDate: 'Oct 31', status: 'Scheduled' },
    { id: 'sp2', platform: 'Facebook', content: 'Just listed! A stunning luxury farmhouse in the heart of 78704.', image: 'https://images.unsplash.com/photo-1600596542815-2495db98dada?w=600&q=80', scheduledDate: 'Nov 1', status: 'Draft' },
  ]);

  // --- Original Studio State ---
  const attributionStats = {
    spend: 4200, gci: 58000, roas: '13.8x', leads: 145, footer: 28.96,
    channels: [
      { name: 'Facebook Ads', leads: 85, spend: 2000, gci: 25000, roas: '12.5x', roasVal: 85 },
      { name: 'Google PPC', leads: 40, spend: 1800, gci: 20000, roas: '11.1x', roasVal: 72 },
      { name: 'Organic Social', leads: 20, spend: 0, gci: 13000, roas: '∞', roasVal: 100 },
    ],
    formStats: [
        { name: 'Home Valuation', count: 62, color: 'bg-indigo-500' },
        { name: 'Contact Form', count: 45, color: 'bg-emerald-500' },
        { name: 'Listing Inquiries', count: 38, countPercent: 12, color: 'bg-blue-500' },
        { name: 'Social Lead Ads', count: 54, color: 'bg-pink-500' }
    ]
  };

  const [socialMappings] = useState<SocialLeadMapping[]>([
    { id: 'sm1', formId: 'f_882910', campaignName: 'Luxury Waterfront - Oct', targetWorkflowTag: 'luxury-buyer-track', lastSynced: '2h ago' },
    { id: 'sm2', formId: 'f_441029', campaignName: 'Downsizing Seminar RSVP', targetWorkflowTag: 'seller-nurture-track', lastSynced: '1d ago' },
  ]);

  const [qrCodes] = useState<QRCodeRecord[]>([
    { id: 'qr1', listingId: 'l1', listingAddress: '123 Main St', targetUrl: '/listing/l1', scanCount: 42, slug: '/qr/123-main', qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://nexus-os.com/listing/l1?source=qr' },
    { id: 'qr2', listingId: 'l2', listingAddress: '456 Oak Ave', targetUrl: '/listing/l2', scanCount: 15, slug: '/qr/456-oak', qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://nexus-os.com/listing/l2?source=qr' }
  ]);

  const [marketStats] = useState<MarketStat[]>([
    { id: '1', zipCode: '78704', monthYear: 'Oct 2023', medianPrice: 850000, domAverage: 24, inventoryLevel: 1.8, soldCountLast7Days: 3, aiExecutiveSummary: '78704 remains a micro-pocket of high demand.' },
  ]);

  const [adCampaigns] = useState<AdCampaign[]>([
    { id: 'ad1', campaignId: 'FB_CONV_001', platform: 'FB', spendCurrent: 200, leadsGenerated: 14, costPerLead: 14.28, aiAuditStatus: 'Performing Well', aiRecommendation: 'Increase budget by 20%.', ctr: 2.4 },
  ]);

  const [magnets] = useState<LeadMagnet[]>([
    { id: 'm1', name: 'Downtown Market Report', type: 'PDF Guide', url: 'nexus.com/dl/downtown-report', visitors: 450, leads: 82, conversionRate: 18.2, status: 'Active' },
    { id: 'm2', name: 'Instant Home Valuation', type: 'Instant Valuation', url: 'nexus.com/value/78704', visitors: 1200, leads: 105, conversionRate: 8.7, status: 'Active' },
  ]);

  const handleIntervene = (nurtureId: string) => {
    alert(`Nexus Assistant: Pausing AI automation for ${nurtureId}. Routing to agent for personal manual response.`);
    setActiveNurtures(prev => prev.map(n => n.id === nurtureId ? { ...n, status: 'Paused' } : n));
  };

  const handleRegenerateVibe = async () => {
      setIsRegeneratingAssets(true);
      await n8nService.triggerCreativePipeline(selectedListingForAssets, ['photo_1.jpg', 'photo_2.jpg']);
      setTimeout(() => {
          setIsRegeneratingAssets(false);
          alert("Creative Studio: Marketing assets are being recalculated with a 'Vibrant' vibe.");
      }, 2000);
  };

  const handleReactivationScan = async () => {
      setIsScanningZombies(true);
      await n8nService.triggerReactivationScan(reactivationConfig.zombieThresholdDays, reactivationConfig.isAutoSendEnabled);
      setTimeout(() => {
          setIsScanningZombies(false);
          alert("Reactivation Logic: Scan complete. Identified 42 zombie leads. Dispatched 12 specific recall hooks.");
      }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Marketing Studio.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Growth Engine & Asset Management</p>
        </div>
        <div className="flex bg-white rounded-xl p-1 border border-slate-200 overflow-x-auto max-w-full scrollbar-hide">
          {[
            { id: 'analytics', icon: BarChart3, label: 'Analytics' },
            { id: 'reports', icon: Globe, label: 'Market' },
            { id: 'ads', icon: Megaphone, label: 'Ads' },
            { id: 'integrations', icon: Link2, label: 'Social Sync' },
            { id: 'qr', icon: QrCode, label: 'Smart QR' },
            { id: 'capture', icon: Magnet, label: 'Leads' },
            { id: 'campaigns', icon: Layers, label: 'Drip' },
            { id: 'reactivation', icon: Ghost, label: 'Reactivation' },
            { id: 'social', icon: Share2, label: 'Social' },
            { id: 'social-assets', icon: ImageIcon, label: 'Review Assets' }, // Workflow 144
            { id: 'library', icon: Grid, label: 'Asset Library' },
          ].map(tab => (
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

      {/* --- TAB: ASSET LIBRARY (Workflow 157 - Digital Asset Management) --- */}
      {activeTab === 'library' && (
          <div className="space-y-6 animate-fade-in-up pb-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Controls & Upload */}
                  <div className="lg:col-span-3 space-y-6">
                      {isAdmin && (
                          <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden group">
                              <div className="absolute right-[-20px] top-[-20px] p-2 opacity-10 group-hover:rotate-12 transition-transform duration-1000"><FilePlus size={120}/></div>
                              <h3 className="font-black text-xs uppercase tracking-[0.3em] text-indigo-400 mb-4">Ingest Protocol</h3>
                              <label className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/20 rounded-[1.5rem] hover:border-indigo-500 hover:bg-white/5 transition-all cursor-pointer group/upload">
                                  {isUploadingAsset ? <Loader2 size={32} className="text-indigo-400 animate-spin" /> : <Upload size={32} className="text-white/20 group-hover/upload:text-indigo-400" />}
                                  <span className="mt-4 text-[10px] font-black uppercase tracking-widest text-white/50 group-hover/upload:text-white">Bulk Upload & AI Tag</span>
                                  <input type="file" className="hidden" multiple onChange={e => e.target.files && handleUploadAndTag(e.target.files[0])} />
                              </label>
                          </div>
                      )}

                      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
                          <h4 className="font-black text-[10px] text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                              <Filter size={16} className="text-indigo-600"/> Refinement
                          </h4>
                          <div className="space-y-6">
                              <div className="space-y-2">
                                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Media Class</label>
                                  <select 
                                    value={assetFilter.type}
                                    onChange={e => setAssetFilter({...assetFilter, type: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500"
                                  >
                                      <option>All</option>
                                      <option>Image</option>
                                      <option>Video</option>
                                      <option>PDF</option>
                                  </select>
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Asset Category</label>
                                  <select 
                                    value={assetFilter.category}
                                    onChange={e => setAssetFilter({...assetFilter, category: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500"
                                  >
                                      <option>All</option>
                                      <option>Listing</option>
                                      <option>Branding</option>
                                      <option>Education</option>
                                      <option>Social</option>
                                  </select>
                              </div>
                          </div>
                      </div>

                      <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-6 shadow-sm">
                          <h4 className="font-black text-[10px] text-indigo-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <Bot size={16}/> Seasonal Cleanup
                          </h4>
                          <p className="text-[10px] text-indigo-900 leading-relaxed font-medium italic mb-4">
                              "Logic Sentinel is archiving 3 'Winter Home Maintenance' flyers today. Expiration protocol 157 enforced."
                          </p>
                          <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg">Manual Scrub</button>
                      </div>
                  </div>

                  {/* Main Pinterest Grid */}
                  <div className="lg:col-span-9 space-y-6">
                      <div className="bg-white rounded-[2rem] border border-slate-200 p-4 shadow-sm flex items-center gap-4">
                          <div className="relative flex-1 group">
                              <SearchCode size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                              <input 
                                type="text"
                                placeholder='Try "Modern Kitchen", "Pool exterior", or "Checklist"...'
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
                                value={assetSearchQuery}
                                onChange={e => setAssetSearchQuery(e.target.value)}
                              />
                          </div>
                      </div>

                      {/* Pinterest-Style Grid (Workflow 157 Component) */}
                      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                          {filteredAssets.map(asset => (
                              <div key={asset.id} className="break-inside-avoid bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden group hover:border-indigo-400 hover:shadow-xl transition-all flex flex-col relative">
                                  {asset.expirationDate && (
                                      <div className="absolute top-4 right-4 z-20">
                                          <div className="bg-orange-500 text-white text-[7px] font-black uppercase px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                                              <Clock size={10}/> Expires {asset.expirationDate}
                                          </div>
                                      </div>
                                  )}
                                  
                                  <div className="relative overflow-hidden group">
                                      <img src={asset.url} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" />
                                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-3">
                                          <button className="p-3 bg-white rounded-xl text-slate-900 hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95"><Eye size={18}/></button>
                                          <button className="p-3 bg-white rounded-xl text-slate-900 hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95"><Download size={18}/></button>
                                      </div>
                                      <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                                          <span className="bg-indigo-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-lg">{asset.type}</span>
                                          <span className="bg-black/40 backdrop-blur-md text-white text-[8px] font-black uppercase px-2 py-0.5 rounded border border-white/20">{asset.category}</span>
                                      </div>
                                  </div>
                                  
                                  <div className="p-5 flex flex-col flex-1">
                                      <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-3 truncate">{asset.name}</h4>
                                      <div className="flex flex-wrap gap-1 mb-4">
                                          {asset.aiTags.map(tag => (
                                              <span key={tag} className="bg-slate-50 text-slate-500 text-[8px] font-bold px-1.5 py-0.5 rounded border border-slate-100 uppercase flex items-center gap-1">
                                                  <Bot size={8}/> {tag}
                                              </span>
                                          ))}
                                      </div>
                                      <div className="mt-auto flex justify-between items-center pt-4 border-t border-slate-50">
                                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{asset.uploadDate} • {asset.size}</p>
                                          <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                                              Send to Lead <ArrowRight size={10}/>
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          ))}
                          {filteredAssets.length === 0 && (
                              <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                                  <ImageIcon size={48} className="mx-auto text-slate-200 mb-4" />
                                  <h4 className="text-xl font-black text-slate-400 uppercase italic tracking-tighter">Zero Assets Found.</h4>
                                  <p className="text-xs text-slate-400 font-bold uppercase mt-2">Adjust your filters or query to explore the repository.</p>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- TAB: SOCIAL ASSETS / REVIEWS (Workflow 144) --- */}
      {activeTab === 'social-assets' && (
          <div className="space-y-8 animate-fade-in-up">
              {isAdmin ? (
                  /* View A: Admin - Brand Template Manager */
                  <div className="space-y-8">
                      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                          <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Palette size={180}/></div>
                          <div className="relative z-10 max-xl">
                              <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-4">Branded Review Engine.</h3>
                              <p className="text-indigo-100 text-lg font-medium opacity-90 leading-relaxed mb-8">
                                  Define the Bannerbear and Placid templates used to turn 5-star Google Reviews into luxury social assets. AI automatically merges the review text with the subject property photo.
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Bannerbear Template ID</p>
                                      <input 
                                        type="text" 
                                        value={brandKit.bannerbearId}
                                        onChange={e => setBrandKit({...brandKit, bannerbearId: e.target.value})}
                                        className="bg-transparent border-none p-0 text-sm font-bold text-white outline-none w-full"
                                      />
                                  </div>
                                  <button onClick={() => alert("Global brand styles recalculated across design clusters.")} className="bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-50 transition-all border-b-4 border-indigo-800">Update Brand Colors</button>
                              </div>
                          </div>
                      </div>
                  </div>
              ) : (
                  /* View B: Agent - Asset Library Gallery */
                  <div className="space-y-6 animate-fade-in-up">
                      <div className="flex justify-between items-end">
                          <div>
                              <h3 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">Social Proof Factory.</h3>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Workflow 144: Automated Review-to-Asset Pipeline</p>
                          </div>
                          <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-black transition-all">
                              <RefreshCw size={14}/> Scrape Google Reviews
                          </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {reviewAssets.map(asset => (
                              <div key={asset.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden group hover:border-indigo-400 transition-all flex flex-col md:flex-row">
                                  <div className="md:w-[280px] bg-slate-900 relative overflow-hidden shrink-0 aspect-square md:aspect-auto">
                                      <img src={asset.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                                      {/* Bannerbear Overlay Simulation */}
                                      <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black/90 to-transparent">
                                          <div className="flex text-yellow-400 gap-1 mb-2">
                                              {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                          </div>
                                          <p className="text-white text-[10px] font-bold leading-relaxed mb-2 line-clamp-3 italic">"{asset.reviewText}"</p>
                                          <p className="text-indigo-400 font-black uppercase text-[9px] tracking-widest">- {asset.reviewerName}</p>
                                      </div>
                                      <div className="absolute top-4 left-4 bg-indigo-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-lg">AI Generated</div>
                                  </div>
                                  <div className="p-8 flex flex-col justify-between flex-1">
                                      <div>
                                          <div className="flex justify-between items-start mb-6">
                                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                  <Bot size={12} className="text-indigo-500"/> AI Drafted Caption
                                              </p>
                                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                                                  asset.status === 'Posted' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                  asset.status === 'Scheduled' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                  'bg-orange-50 text-orange-700 border-orange-100'
                                              }`}>{asset.status}</span>
                                          </div>
                                          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl italic text-xs text-slate-600 leading-relaxed mb-6">
                                              "{asset.caption}"
                                          </div>
                                      </div>
                                      <div className="flex gap-3">
                                          {asset.status === 'Draft' ? (
                                              <button 
                                                onClick={() => handleApproveAndPost(asset.id)}
                                                disabled={isRegeneratingAssets}
                                                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                              >
                                                  {isRegeneratingAssets ? <Loader2 size={14} className="animate-spin"/> : <Send size={14}/>}
                                                  Approve & Post
                                              </button>
                                          ) : (
                                              <div className="flex-1 bg-slate-50 border border-slate-100 py-3 rounded-xl flex items-center justify-center gap-2 text-slate-400 font-black uppercase text-[10px] tracking-widest">
                                                  <CheckCircle2 size={14} className="text-emerald-500"/> Post {asset.status}
                                              </div>
                                          )}
                                          <button className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl shadow-inner"><Download size={16}/></button>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* --- TAB: REACTIVATION (Workflow 121) --- */}
      {activeTab === 'reactivation' && (
          <div className="space-y-8 animate-fade-in-up">
              {isAdmin ? (
                  /* VIEW A: Admin - Reactivation Settings */
                  <div className="space-y-8">
                      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                          <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Ghost size={180}/></div>
                          <div className="relative z-10">
                              <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-4">Zombie Lead Resurrector.</h3>
                              <p className="text-indigo-100 text-lg font-medium opacity-90 leading-relaxed mb-8 max-w-2xl">
                                  Stop losing leads to inactivity. The AI monitors digital silence, looks back at the specific properties they liked months ago, and hits them with a hyper-specific "Recall Hook" when a similar listing appears.
                              </p>
                              <div className="flex flex-wrap gap-4">
                                  <button 
                                      onClick={handleReactivationScan}
                                      disabled={isScanningZombies}
                                      className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-50 transition-all flex items-center gap-3 active:scale-95"
                                  >
                                      {isScanningZombies ? <Loader2 className="animate-spin" size={18}/> : <RefreshCw size={18}/>}
                                      Execute Global Inactivity Scan
                                  </button>
                                  <div className="bg-white/10 px-6 py-4 rounded-2xl border border-white/10 flex items-center gap-4">
                                      <span className="text-[10px] font-black uppercase text-indigo-300">Next Scheduled Scan:</span>
                                      <span className="text-xs font-bold text-white">Tomorrow, 10:00 AM</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                              <h4 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                  <Settings size={18} className="text-indigo-600"/> Resurrector Logic Config
                              </h4>
                              <div className="space-y-6">
                                  <div className="space-y-2">
                                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Zombie Threshold (Days of Silence)</label>
                                      <div className="flex items-center gap-4">
                                          <input 
                                            type="range" min="30" max="180" step="30"
                                            value={reactivationConfig.zombieThresholdDays}
                                            onChange={e => setReactivationConfig({...reactivationConfig, zombieThresholdDays: parseInt(e.target.value)})}
                                            className="flex-1 accent-indigo-600" 
                                          />
                                          <span className="font-black text-indigo-600 text-lg tabular-nums">{reactivationConfig.zombieThresholdDays}d</span>
                                      </div>
                                  </div>
                                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                      <div>
                                          <p className="font-black text-[10px] text-slate-800 uppercase tracking-tight">Auto-Dispatch Hooks</p>
                                          <p className="text-[9px] text-slate-400 font-bold">AI sends SMS immediately upon match</p>
                                      </div>
                                      <button 
                                        onClick={() => setReactivationConfig({...reactivationConfig, isAutoSendEnabled: !reactivationConfig.isAutoSendEnabled})}
                                        className={`w-12 h-6 rounded-full transition-all relative ${reactivationConfig.isAutoSendEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                      >
                                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${reactivationConfig.isAutoSendEnabled ? 'left-7' : 'left-1'}`} />
                                      </button>
                                  </div>
                              </div>
                          </div>
                          <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-8 shadow-sm">
                              <h4 className="font-black text-[10px] text-indigo-800 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                  <Bot size={18}/> Logic Preview
                              </h4>
                              <div className="bg-white p-6 rounded-2xl border border-indigo-100 italic text-slate-600 text-sm font-medium leading-relaxed">
                                  "Hey [Name], I remember you were looking for <strong>[Last_Property_Style]</strong> homes in [Zip]. I just found one at <strong>[New_Listing_Address]</strong> that hasn't hit the major portals yet. Interested?"
                              </div>
                              <p className="text-[8px] text-indigo-400 font-black uppercase mt-4 text-center">92% Engagement Rate vs Standard Drips</p>
                          </div>
                      </div>
                  </div>
              ) : (
                  /* VIEW B: Agent - Resurrected Leads Tracker */
                  <div className="space-y-6 animate-fade-in-up">
                      <div className="flex justify-between items-end">
                          <div>
                              <h3 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">Resurrected Leads.</h3>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Zombie leads who replied to specific AI recall hooks</p>
                          </div>
                      </div>

                      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                          <table className="w-full text-left">
                              <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                  <tr>
                                      <th className="p-8">Contact Identity</th>
                                      <th className="p-8">AI Resurrection Logic</th>
                                      <th className="p-8">Client Reply (Context)</th>
                                      <th className="p-8 text-center">Sentiment</th>
                                      <th className="p-8 text-right">Intervention</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                                  {resurrectedLeads.map(lead => (
                                      <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                                          <td className="p-8">
                                              <div className="font-black text-slate-900 uppercase tracking-tight">{lead.name}</div>
                                              <div className="text-[8px] text-red-500 uppercase tracking-widest mt-1 italic flex items-center gap-1">
                                                  <UserX size={10}/> Ghosted for {lead.ghostedDays} days
                                              </div>
                                          </td>
                                          <td className="p-8">
                                              <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl max-w-xs">
                                                  <p className="text-[9px] text-indigo-700 leading-relaxed italic line-clamp-2">"{lead.aiMessage}"</p>
                                              </div>
                                          </td>
                                          <td className="p-8">
                                              <div className="flex items-center gap-2">
                                                  <MessageSquare size={12} className="text-slate-400"/>
                                                  <span className="text-slate-700 italic">"{lead.replyText}"</span>
                                              </div>
                                              <div className="text-[8px] text-slate-400 uppercase mt-1">{lead.timestamp}</div>
                                          </td>
                                          <td className="p-8 text-center">
                                              <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${
                                                  lead.sentiment === 'Positive' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                  lead.sentiment === 'Neutral' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                  'bg-slate-50 text-slate-500 border-slate-200'
                                              }`}>
                                                  {lead.sentiment}
                                              </span>
                                          </td>
                                          <td className="p-8 text-right">
                                              <button 
                                                onClick={() => alert(`Nexus Assistant: Manual intervention requested for ${lead.name}. Routing to Unified Inbox.`)}
                                                className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2 ml-auto"
                                              >
                                                  <UserCheck size={12}/> Intervene
                                              </button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* --- TAB: CAMPAIGNS / DRIP (Workflow 118) --- */}
      {activeTab === 'campaigns' && (
        <div className="space-y-8 animate-fade-in-up">
           {isAdmin ? (
               /* VIEW A: Admin - Campaign Orchestrator */
               <div className="space-y-8">
                   <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                       <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Layers size={180}/></div>
                       <div className="relative z-10">
                           <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-4 leading-none">Non-Linear Drip Orchestrator.</h3>
                           <p className="text-indigo-100 text-lg font-medium opacity-90 leading-relaxed mb-8 max-w-2xl">
                               Define dynamic goals that stop the sequence. The AI calculates behavioral branching in real-time, generating unique content at the moment of dispatch.
                           </p>
                           <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-50 transition-all flex items-center gap-3">
                               <Plus size={18}/> Construct New Smart Drip
                           </button>
                       </div>
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                       <div className="lg:col-span-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                           <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                               <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                                   <Settings size={18} className="text-indigo-600" /> Active Smart Protocols
                               </h3>
                           </div>
                           <div className="divide-y divide-slate-100">
                               {smartDrips.map(drip => (
                                   <div key={drip.id} className="p-8 hover:bg-slate-50 transition-colors group">
                                       <div className="flex justify-between items-start mb-6">
                                           <div>
                                               <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight italic mb-1">{drip.name}</h4>
                                               <div className="flex items-center gap-3">
                                                   <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-emerald-100">{drip.status}</span>
                                                   <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{drip.steps} Conditional Steps</span>
                                               </div>
                                           </div>
                                           <div className="text-right">
                                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Stop Goal</p>
                                               <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-indigo-100">{drip.goalType}</span>
                                           </div>
                                       </div>
                                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                           <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
                                               <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Open Rate</p>
                                               <p className="text-lg font-black text-slate-900">{drip.openRate}%</p>
                                           </div>
                                           <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
                                               <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Reply Rate</p>
                                               <p className="text-lg font-black text-indigo-600">{drip.replyRate}%</p>
                                           </div>
                                           <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-center col-span-2 flex items-center justify-center gap-2">
                                               <button className="text-[9px] font-black text-indigo-600 uppercase hover:underline">Edit Logic</button>
                                               <div className="w-px h-3 bg-slate-200" />
                                               <button className="text-[9px] font-black text-slate-400 hover:text-slate-600 uppercase">View Flow</button>
                                           </div>
                                       </div>
                                   </div>
                               ))}
                           </div>
                       </div>

                       <div className="lg:col-span-4 space-y-6">
                           <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-8 shadow-sm">
                               <h4 className="font-black text-[10px] text-indigo-800 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                   <Bot size={16}/> Logic Sentinel
                               </h4>
                               <p className="text-sm font-medium text-indigo-900 leading-relaxed italic mb-8">
                                   "The 'Buyer Onboarding' drip is currently 22% more efficient when the Step 2 SMS is triggered 15 mins after a website visit vs a standard 24h wait."
                               </p>
                               <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-xl">Apply AI Auto-Optimization</button>
                           </div>
                       </div>
                   </div>
               </div>
           ) : (
               /* VIEW B: Agent - Active Nurtures */
               <div className="space-y-6 animate-fade-in-up">
                   <div className="flex justify-between items-end">
                       <div>
                           <h3 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">Behavioral Nurture Tracker.</h3>
                           <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Real-time non-linear sequence monitoring</p>
                       </div>
                       <div className="flex gap-2">
                           <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"><RefreshCw size={18}/></button>
                       </div>
                   </div>

                   <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                       <table className="w-full text-left">
                           <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                               <tr>
                                   <th className="p-8">Lead Professional</th>
                                   <th className="p-8">Dynamic current step</th>
                                   <th className="p-8 text-center">AI Sentiment</th>
                                   <th className="p-8">Awaiting Logic</th>
                                   <th className="p-8 text-right">Intervention</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                               {activeNurtures.map(nurture => (
                                   <tr key={nurture.id} className="hover:bg-slate-50 transition-colors">
                                       <td className="p-8">
                                           <div className="font-black text-slate-900 uppercase tracking-tight">{nurture.leadName}</div>
                                           <div className="text-[8px] text-slate-400 uppercase tracking-widest mt-1 italic">Active: {nurture.lastActivity}</div>
                                       </td>
                                       <td className="p-8">
                                           <div className="flex items-center gap-2">
                                               {nurture.currentStep.includes('Email') ? <Mail size={12} className="text-indigo-500"/> : <MessageSquare size={12} className="text-emerald-500"/>}
                                               <span className="text-slate-700 uppercase tracking-tight">{nurture.currentStep}</span>
                                           </div>
                                       </td>
                                       <td className="p-8 text-center">
                                           <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${
                                               nurture.aiSentiment === 'Urgent' ? 'bg-red-50 text-red-700 border-red-100 animate-pulse' :
                                               nurture.aiSentiment === 'Positive' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                               'bg-slate-50 text-slate-500 border-slate-200'
                                           }`}>
                                               {nurture.aiSentiment}
                                           </span>
                                       </td>
                                       <td className="p-8">
                                           <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                                               <p className="text-[9px] text-slate-500 italic leading-none">{nurture.nextAction}</p>
                                           </div>
                                       </td>
                                       <td className="p-8 text-right">
                                           <div className="flex justify-end gap-2">
                                               {nurture.status === 'Paused' ? (
                                                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-100 rounded-lg">Paused</span>
                                               ) : (
                                                   <button 
                                                        onClick={() => handleIntervene(nurture.id)}
                                                        className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-2"
                                                   >
                                                       <PenTool size={12}/> Intervene Now
                                                   </button>
                                               )}
                                           </div>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
               </div>
           )}
        </div>
      )}

      {/* --- ANALYTICS TAB --- */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in-up">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Spend (MTD)</p>
                 <h3 className="text-xl font-black text-slate-800">${attributionStats.spend.toLocaleString()}</h3>
              </div>
              <div className="bg-indigo-600 text-white p-5 rounded-2xl shadow-xl relative overflow-hidden">
                 <p className="text-indigo-200 text-[9px] font-black uppercase tracking-widest mb-1">ROAS</p>
                 <h3 className="text-2xl font-black tracking-tighter">{attributionStats.roas}</h3>
                 <div className="absolute right-[-10px] bottom-[-10px] opacity-10"><TrendingUp size={60}/></div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Leads</p>
                 <h3 className="text-xl font-black text-slate-800">{attributionStats.leads}</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">CPL</p>
                 <h3 className="text-xl font-black text-slate-800">${attributionStats.footer}</h3>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                    <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                        <PieChart size={18} className="text-indigo-600" /> Leads by Form
                    </h3>
                    <div className="space-y-6">
                        {attributionStats.formStats.map(stat => (
                            <div key={stat.name}>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase mb-2">
                                    <span className="text-slate-500">{stat.name}</span>
                                    <span className="text-slate-900">{stat.count}</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${stat.color} rounded-full`} style={{ width: `${(stat.count / attributionStats.leads) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl flex flex-col">
                    <h3 className="font-black text-[10px] text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <Sparkles size={18} /> Channel Performance
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-[8px] font-black text-slate-500 uppercase tracking-widest border-b border-white/10">
                                <tr><th>Channel</th><th className="text-center">ROI</th><th className="text-right">GCI</th></tr>
                            </thead>
                            <tbody className="text-[11px] font-bold">
                                {attributionStats.channels.map(c => (
                                    <tr key={c.name} className="border-b border-white/5 group">
                                        <td className="py-4 font-black uppercase text-white">{c.name}</td>
                                        <td className="py-4 text-center text-emerald-400">{c.roas}</td>
                                        <td className="py-4 text-right text-slate-200">${c.gci.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
           </div>
        </div>
      )}

      {/* --- CAPTURE TAB --- */}
      {activeTab === 'capture' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
              <button className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl hover:bg-indigo-700 flex flex-col items-center justify-center gap-3 transition-all active:scale-95 group">
                  <div className="p-3 bg-white/20 rounded-xl group-hover:rotate-12 transition-transform"><Magnet size={24}/></div>
                  <span className="font-black uppercase tracking-widest text-xs">New Lead Magnet</span>
              </button>
              {magnets.map(magnet => (
                  <div key={magnet.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                      <div>
                          <h4 className="font-black text-slate-900 uppercase tracking-tight mb-1">{magnet.name}</h4>
                          <p className="text-[10px] text-indigo-600 font-bold uppercase mb-4">{magnet.type}</p>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="bg-slate-50 p-2 rounded-xl text-center">
                                  <p className="text-[8px] font-black text-slate-400 uppercase">Leads</p>
                                  <p className="text-lg font-black">{magnet.leads}</p>
                              </div>
                              <div className="bg-emerald-50 p-2 rounded-xl text-center">
                                  <p className="text-[8px] font-black text-emerald-400 uppercase">Conv.</p>
                                  <p className="text-lg font-black text-emerald-600">{magnet.conversionRate}%</p>
                              </div>
                          </div>
                      </div>
                      <button className="w-full py-2 bg-slate-900 text-white rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 hover:bg-black">
                          <LinkIcon size={12}/> Copy Link
                      </button>
                  </div>
              ))}
          </div>
      )}

      {/* --- SOCIAL TAB --- */}
      {activeTab === 'social' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                  <div className="absolute right-0 top-0 p-4 opacity-5 rotate-12"><Share2 size={120}/></div>
                  <h4 className="font-black text-xs uppercase tracking-widest text-indigo-400 mb-6 flex items-center gap-2"><Sparkles size={16}/> Post Scheduler</h4>
                  <div className="flex gap-4">
                      <button className="flex-1 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"><ImageIcon size={16}/> New Image Post</button>
                      <button className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/20 transition-all border border-white/10 flex items-center justify-center gap-2"><Video size={16}/> New Reel</button>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {generatedPosts.map(post => (
                      <div key={post.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm group">
                          <div className="relative aspect-square overflow-hidden">
                              <img src={post.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur text-white p-2 rounded-xl"><Instagram size={16}/></div>
                          </div>
                          <div className="p-4">
                              <p className="text-xs text-slate-600 font-medium mb-4 line-clamp-2 italic">"{post.content}"</p>
                              <div className="flex gap-2">
                                  <button className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg">Schedule</button>
                                  <button className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600"><Edit size={14}/></button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* --- REPORTS TAB --- */}
      {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
              <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-xl border-b-8 border-indigo-900 flex flex-col justify-between">
                  <div>
                      <Globe size={48} className="mb-6 opacity-20"/>
                      <h3 className="text-3xl font-black tracking-tighter uppercase italic leading-none mb-4">Local Market <br/> Analyst.</h3>
                      <p className="text-indigo-100 font-medium mb-8">Generate neighborhood infographics with live MLS stats and AI executive summaries.</p>
                  </div>
                  <button className="w-full py-4 bg-white text-indigo-900 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                      <RefreshCw size={16}/> Build New Report
                  </button>
              </div>
              {marketStats.map(stat => (
                  <div key={stat.id} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                      <div className="flex justify-between items-start mb-6">
                          <div>
                              <h4 className="text-2xl font-black text-slate-900 italic tracking-tighter">ZIP {stat.zipCode}</h4>
                              <p className="text-[10px] text-slate-400 font-black uppercase mt-1">{stat.monthYear}</p>
                          </div>
                          <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><MoreVertical size={20}/></button>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="text-center"><p className="text-[9px] font-black text-slate-400 uppercase">Median</p><p className="text-base font-black">${(stat.medianPrice/1000).toFixed(0)}k</p></div>
                          <div className="text-center"><p className="text-[9px] font-black text-slate-400 uppercase">DOM</p><p className="text-base font-black">{stat.domAverage}</p></div>
                          <div className="text-center"><p className="text-[9px] font-black text-slate-400 uppercase">Inv.</p><p className="text-base font-black">{stat.inventoryLevel}</p></div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                          <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Bot size={12}/> AI Insight</p>
                          <p className="text-[11px] text-slate-600 italic leading-relaxed">"{stat.aiExecutiveSummary}"</p>
                      </div>
                      <div className="flex gap-2">
                          <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest">Post to Social</button>
                          <button className="p-3 border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600"><Mail size={16}/></button>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* --- ADS TAB --- */}
      {activeTab === 'ads' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {adCampaigns.map(ad => (
                      <div key={ad.id} className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm group hover:border-indigo-400 transition-all">
                          <div className="flex justify-between items-center mb-8">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Facebook size={20}/></div>
                                  <div>
                                      <h4 className="font-black text-slate-900 uppercase tracking-tight">{ad.campaignId}</h4>
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Campaign</p>
                                  </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${ad.aiAuditStatus === 'Performing Well' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>{ad.aiAuditStatus}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mb-8">
                              <div className="text-center"><p className="text-[8px] font-black text-slate-400 uppercase mb-1">Leads</p><p className="text-xl font-black">{ad.leadsGenerated}</p></div>
                              <div className="text-center"><p className="text-[8px] font-black text-slate-400 uppercase mb-1">CPL</p><p className="text-xl font-black">${ad.costPerLead}</p></div>
                              <div className="text-center"><p className="text-[8px] font-black text-slate-400 uppercase mb-1">CTR</p><p className="text-xl font-black">{ad.ctr}%</p></div>
                          </div>
                          <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl">
                               <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Bot size={12}/> AI Recommendation</p>
                               <p className="text-[11px] text-indigo-900 italic font-medium leading-relaxed">"{ad.aiRecommendation}"</p>
                          </div>
                          <button className="w-full mt-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all">Adjust Strategy</button>
                      </div>
                  ))}
                  <button className="border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-3 p-12 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all">
                      <Plus size={32}/>
                      <span className="font-black uppercase tracking-widest text-xs">Initialize Campaign</span>
                  </button>
              </div>
          </div>
      )}

      {/* --- QR TAB --- */}
      {activeTab === 'qr' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
              <button className="bg-indigo-600 rounded-[2rem] p-10 text-white shadow-xl hover:bg-indigo-700 flex flex-col items-center justify-center gap-4 transition-all active:scale-95 group">
                  <div className="p-4 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform"><QrCode size={32}/></div>
                  <span className="font-black uppercase tracking-[0.2em] text-xs">New Smart QR</span>
              </button>
              {qrCodes.map(qr => (
                  <div key={qr.id} className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm flex flex-col items-center text-center group hover:border-indigo-400 transition-all">
                      <div className="w-32 h-32 bg-slate-50 border border-slate-100 rounded-2xl mb-6 p-2 relative group-hover:scale-105 transition-transform">
                          <img src={qr.qrImageUrl} className="w-full h-full object-contain mix-blend-multiply" />
                          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 flex items-center justify-center transition-opacity" />
                      </div>
                      <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">{qr.listingAddress}</h4>
                      <div className="flex items-center gap-2 mb-6">
                          <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-100">{qr.scanCount} Scans</span>
                          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{qr.slug}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 w-full">
                          <button className="py-2 bg-slate-50 text-slate-700 rounded-xl font-black uppercase text-[8px] tracking-widest hover:bg-slate-100 transition-colors">Download</button>
                          <button className="py-2 bg-slate-900 text-white rounded-xl font-black uppercase text-[8px] tracking-widest hover:bg-black transition-colors">Print Sheet</button>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* --- INTEGRATIONS TAB --- */}
      {activeTab === 'integrations' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                      <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2"><Link2 size={18} className="text-indigo-600" /> Active Webhook Mappings</h3>
                      <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 shadow-sm"><RefreshCw size={14}/></button>
                  </div>
                  <div className="divide-y divide-slate-100">
                      {socialMappings.map(mapping => (
                          <div key={mapping.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                              <div className="flex items-center gap-6">
                                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 text-indigo-600"><Facebook size={24}/></div>
                                  <div>
                                      <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">{mapping.campaignName}</h4>
                                      <div className="flex items-center gap-2">
                                          <span className="text-slate-400 font-mono text-[9px] uppercase">{mapping.formId}</span>
                                          <ArrowRight size={12} className="text-slate-300"/>
                                          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[8px] font-black uppercase">{mapping.targetWorkflowTag}</span>
                                      </div>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Last Sync: {mapping.lastSynced}</p>
                                  <button className="text-[9px] font-black text-indigo-600 uppercase hover:underline">Re-Map Logic</button>
                              </div>
                          </div>
                      ))}
                      <div className="p-8 border-2 border-dashed border-slate-100 rounded-[1.5rem] m-6 flex flex-col items-center justify-center text-center group hover:bg-slate-50 transition-all cursor-pointer">
                          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-indigo-400 transition-colors mb-4"><Database size={24}/></div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connect New Social Lead Form</p>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default MarketingStudio;
