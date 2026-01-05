
import React, { useState, useEffect, useRef } from 'react';
import { 
  PlayCircle, RefreshCw, Wand2, Plus, Target, 
  Bot, Share2, Mail, Ticket, Globe, Layers, 
  TrendingUp, Activity, Smartphone, Monitor, 
  LayoutGrid, Trash2, Edit3, Download, Loader2,
  FileText, SearchCode, Instagram, Linkedin, 
  AlertTriangle, CheckCircle2, CloudRain,
  ChevronRight, ArrowRight, Sparkles, DatabaseZap,
  ImageIcon, Music, Twitter, Palette,
  ShieldCheck, Send, Archive, Search, PieChart,
  Film, MousePointerClick, Volume2, ListChecks,
  MoreVertical, QrCode, ClipboardList,
  Flame, Zap, History, Layout, Eye,
  BarChart3, Video, Upload, Clock, Scissors,
  Calendar, Play, X, SlidersHorizontal, ArrowLeft,
  ChevronLeft, FileSearch, AlignLeft, AtSign,
  Check, Filter, Facebook, Pin,
  // Added Home, Users, Save to fix "Cannot find name" errors
  Home, Users, Save
} from 'lucide-react';
import { n8nService } from '../../services/n8n';
import { airtableMediaService, airtableService } from '../../services/airtable';
import { 
  FEATURE_FLAGS, VideoAsset, ContentIdea, CompetitorSnapshot, 
  Keyword, ContentIdeaType, ContentIdeaPlatform, SocialTone, 
  LongFormVideo, ShortClip, SourceType, ClipPlatform, ClipDimensions,
  KeywordIntent, KeywordCategory, SocialPlatform,
  NewsletterCampaign, DirectMailCampaign,
  // Added UserRole to fix "Cannot find name 'UserRole'" when defining isAdmin
  UserRole
} from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const MediaStudio: React.FC = () => {
  const { user, role } = useAuth();
  // Defined isAdmin to fix "Cannot find name 'isAdmin'" error
  const isAdmin = role === UserRole.BROKER || role === UserRole.ADMIN;
  const [activeTab, setActiveTab] = useState<'repurpose' | 'repurpose_video' | 'keywords' | 'spy' | 'newsletter' | 'mail' | 'vault'>('repurpose');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  // Newsletters
  const [newsletters, setNewsletters] = useState<NewsletterCampaign[]>([]);
  const [isCreatingNewsletter, setIsCreatingNewsletter] = useState(false);
  const [newNewsletter, setNewNewsletter] = useState<Partial<NewsletterCampaign>>({
    title: '', subjectLine: '', previewText: '', templateStyle: 'modern', status: 'draft', 
    includeVideoIds: [], includeListingIds: [], includeContentIdeaIds: []
  });

  // Direct Mail
  const [directMail, setDirectMail] = useState<DirectMailCampaign[]>([]);
  const [isCreatingMail, setIsCreatingMail] = useState(false);
  const [newMail, setNewMail] = useState<Partial<DirectMailCampaign>>({
    title: '', mailType: 'postcard', templateId: 'listing_announce', 
    contentHeadline: '', contentBody: '', contentCta: '', status: 'draft'
  });

  const [assets, setAssets] = useState<VideoAsset[]>([]);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [longVideos, setLongVideos] = useState<LongFormVideo[]>([]);
  const [selectedLongVideo, setSelectedLongVideo] = useState<LongFormVideo | null>(null);
  const [clips, setClips] = useState<ShortClip[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoSourceType, setNewVideoSourceType] = useState<SourceType>('listing_tour');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingClip, setEditingClip] = useState<ShortClip | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    const [assetsData, ideasData, keywordsData, longVideosData, newslettersData, mailData] = await Promise.all([
        airtableMediaService.getAssetLibrary(user?.id || 'agent_1'),
        airtableService.getContentIdeas(),
        airtableService.getKeywords(),
        airtableService.getLongFormVideos(),
        airtableService.getNewsletterCampaigns(),
        airtableService.getDirectMailCampaigns()
    ]);
    setAssets(assetsData || []);
    setIdeas(ideasData || []);
    setLongVideos(longVideosData || []);
    setNewsletters(newslettersData || []);
    setDirectMail(mailData || []);
  };

  const handleWorkflow = async (workflowId: string, data: any) => {
    setIsProcessing(workflowId);
    await n8nService.triggerWorkflow(workflowId, data);
    setTimeout(() => {
        setIsProcessing(null);
        alert(`Nexus OS: ${workflowId} protocol initialized.`);
    }, 1000);
  };

  const handleSendNewsletter = async (id: string) => {
    setIsProcessing(id);
    await n8nService.sendNewsletterCampaign(id);
    setTimeout(() => {
      loadData();
      setIsProcessing(null);
      alert("Newsletter campaign dispatched to CRM segment.");
    }, 2000);
  };

  const handleSendMail = async (id: string) => {
    setIsProcessing(id);
    await n8nService.sendDirectMailCampaign(id);
    setTimeout(() => {
      loadData();
      setIsProcessing(null);
      alert("Direct mail campaign sent to provider.");
    }, 2000);
  };

  const handleCreateNewsletter = async () => {
    setIsProcessing('create-newsletter');
    await airtableService.createNewsletterCampaign({
      ...newNewsletter,
      createdByUserId: user?.id || 'agent_1',
      createdAt: new Date().toISOString(),
      audienceCount: 245 // Mock
    });
    setIsCreatingNewsletter(false);
    loadData();
    setIsProcessing(null);
  };

  const handleCreateMail = async () => {
    setIsProcessing('create-mail');
    await airtableService.createDirectMailCampaign({
      ...newMail,
      createdByUserId: user?.id || 'agent_1',
      createdAt: new Date().toISOString(),
      audienceCount: 150, // Mock
      costPerPiece: 1.00,
      totalCost: 150.00,
      provider: 'lob'
    });
    setIsCreatingMail(false);
    loadData();
    setIsProcessing(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !newVideoTitle) return;
    setIsUploading(true);
    setUploadProgress(10);
    setTimeout(async () => {
      const res = await airtableService.createLongFormVideo({
        title: newVideoTitle,
        originalUrl: `https://storage.nexus-os.com/uploads/${file.name}`,
        durationSeconds: 120,
        uploadedByUserId: user?.id || 'agent_1',
        sourceType: newVideoSourceType
      });
      if (res?.records?.[0]?.id) {
        await n8nService.repurposeLongFormVideo(res.records[0].id);
        setUploadProgress(100);
        setIsUploading(false);
        setNewVideoTitle('');
        loadData();
      }
    }, 1500);
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  return (
    <div className="space-y-6 animate-fade-in pb-20 max-w-full overflow-hidden px-1">
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-200 pb-6 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">Media Studio.</h2>
          <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.4em] mt-2">The Nexus Content Infrastructure</p>
        </div>
        <div className="flex bg-white rounded-2xl p-1 border border-slate-200 shadow-sm overflow-x-auto max-w-full scrollbar-hide">
            {[
                { id: 'repurpose', label: 'L→S Pipeline', icon: Film },
                { id: 'keywords', label: 'Keyword Engine', icon: SearchCode },
                { id: 'newsletter', label: 'Newsletter', icon: Mail },
                { id: 'mail', label: 'Direct Mail', icon: Ticket },
                { id: 'vault', label: 'Asset Vault', icon: Archive },
            ].map(tab => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <tab.icon size={14}/> {tab.label}
                </button>
            ))}
        </div>
      </div>

      <div className="min-h-[600px]">
          {/* TAB: NEWSLETTER BUILDER */}
          {activeTab === 'newsletter' && (
              <div className="space-y-8 animate-fade-in">
                  {!isCreatingNewsletter ? (
                      <div className="space-y-6">
                          <div className="flex justify-between items-center">
                              <h3 className="text-xl font-black italic tracking-tighter uppercase">Newsletter Campaigns</h3>
                              <button onClick={() => setIsCreatingNewsletter(true)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2">
                                  <Plus size={16}/> New Newsletter
                              </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {newsletters.map(campaign => (
                                  <div key={campaign.id} className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm flex flex-col group hover:border-indigo-400 transition-all">
                                      <div className="flex justify-between items-start mb-6">
                                          <div>
                                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${campaign.status === 'sent' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{campaign.status}</span>
                                              <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight italic mt-2">{campaign.title}</h4>
                                          </div>
                                          <button className="p-2 text-slate-300 hover:text-indigo-600"><MoreVertical size={20}/></button>
                                      </div>
                                      <div className="space-y-4 mb-8 flex-1">
                                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-[11px] text-slate-600">
                                              "Subject: {campaign.subjectLine}"
                                          </div>
                                          <div className="grid grid-cols-3 gap-4">
                                              <div className="text-center">
                                                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Reach</p>
                                                  <p className="text-sm font-black text-slate-800">{campaign.sentToCount || campaign.audienceCount}</p>
                                              </div>
                                              <div className="text-center">
                                                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Open Rate</p>
                                                  <p className="text-sm font-black text-indigo-600">{campaign.openRate || '0'}%</p>
                                              </div>
                                              <div className="text-center">
                                                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Clicks</p>
                                                  <p className="text-sm font-black text-indigo-600">{campaign.clickRate || '0'}%</p>
                                              </div>
                                          </div>
                                      </div>
                                      <div className="flex gap-3">
                                          {campaign.status === 'sent' ? (
                                              <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg">View Report</button>
                                          ) : (
                                              <>
                                                  <button onClick={() => handleSendNewsletter(campaign.id)} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2">
                                                      <Send size={14}/> Send Now
                                                  </button>
                                                  <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600"><Edit3 size={18}/></button>
                                              </>
                                          )}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  ) : (
                      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden animate-fade-in">
                          <div className="bg-slate-900 p-8 text-white flex justify-between items-center border-b-8 border-indigo-600">
                              <h3 className="text-2xl font-black italic tracking-tighter uppercase">Newsletter Architect</h3>
                              <button onClick={() => setIsCreatingNewsletter(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X size={24}/></button>
                          </div>
                          <div className="p-10 space-y-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-1.5">
                                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Campaign Title</label>
                                      <input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={newNewsletter.title} onChange={e => setNewNewsletter({...newNewsletter, title: e.target.value})} placeholder="Internal reference name" />
                                  </div>
                                  <div className="space-y-1.5">
                                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Template Style</label>
                                      <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" value={newNewsletter.templateStyle} onChange={e => setNewNewsletter({...newNewsletter, templateStyle: e.target.value as any})}>
                                          <option value="modern">Modern Professional</option>
                                          <option value="bold">Bold & High Contrast</option>
                                          <option value="minimal">Minimalist Canvas</option>
                                      </select>
                                  </div>
                              </div>
                              <div className="space-y-1.5">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Subject Line</label>
                                  <input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={newNewsletter.subjectLine} onChange={e => setNewNewsletter({...newNewsletter, subjectLine: e.target.value})} placeholder="What recipients see in inbox" />
                              </div>

                              <div className="space-y-6">
                                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-2"><LayoutGrid size={16} className="text-indigo-600"/> Content Block Ingestion</h4>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                      <button className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center gap-3 hover:border-indigo-400 hover:bg-indigo-50 transition-all group">
                                          <TrendingUp size={24} className="text-slate-300 group-hover:text-indigo-600"/>
                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-900">Market Data</span>
                                      </button>
                                      <button className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center gap-3 hover:border-indigo-400 hover:bg-indigo-50 transition-all group">
                                          <Home size={24} className="text-slate-300 group-hover:text-indigo-600"/>
                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-900">Featured Listing</span>
                                      </button>
                                      <button className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center gap-3 hover:border-indigo-400 hover:bg-indigo-50 transition-all group">
                                          <Video size={24} className="text-slate-300 group-hover:text-indigo-600"/>
                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-900">Video Studio Clip</span>
                                      </button>
                                  </div>
                              </div>

                              <div className="p-8 bg-indigo-50 rounded-[2rem] border border-indigo-100">
                                  <div className="flex justify-between items-center mb-6">
                                      <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2"><Users size={16}/> Audience Logic</h4>
                                      <span className="text-[10px] font-black text-indigo-900 uppercase">Est. Reach: 245 Contacts</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                      <button className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-xl text-[9px] font-black uppercase">All Contacts</button>
                                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase shadow-lg">Past Clients Only</button>
                                      <button className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-xl text-[9px] font-black uppercase">Custom Filter</button>
                                  </div>
                              </div>

                              <div className="flex gap-4">
                                  <button onClick={() => setIsCreatingNewsletter(false)} className="flex-1 py-5 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">Cancel Draft</button>
                                  <button onClick={handleCreateNewsletter} disabled={isProcessing !== null} className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl border-b-4 border-indigo-900 flex items-center justify-center gap-3 active:scale-95 transition-all">
                                      {isProcessing === 'create-newsletter' ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>} Commit Campaign Draft
                                  </button>
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          )}

          {/* TAB: DIRECT MAIL */}
          {activeTab === 'mail' && (
              <div className="space-y-8 animate-fade-in">
                  {!isCreatingMail ? (
                      <div className="space-y-6">
                          <div className="flex justify-between items-center">
                              <h3 className="text-xl font-black italic tracking-tighter uppercase">Physical Mail Monitor</h3>
                              <button onClick={() => setIsCreatingMail(true)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2">
                                  <Plus size={16}/> New Mail Campaign
                              </button>
                          </div>
                          
                          {/* Approval Queue for Admins */}
                          {isAdmin && directMail.filter(m => m.status === 'draft').length > 0 && (
                              <div className="bg-amber-50 border-2 border-amber-200 p-8 rounded-[2rem] space-y-6 shadow-xl shadow-amber-900/5">
                                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-[0.3em] flex items-center gap-2"><ShieldCheck size={18}/> Pending Approval Queue</h4>
                                  <div className="grid grid-cols-1 gap-4">
                                      {directMail.filter(m => m.status === 'draft').map(campaign => (
                                          <div key={campaign.id} className="bg-white p-6 rounded-2xl border border-amber-200 flex flex-col md:flex-row justify-between items-center gap-6">
                                              <div className="flex items-center gap-4">
                                                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-black"><Ticket size={24}/></div>
                                                  <div>
                                                      <h5 className="font-black text-slate-900 uppercase tracking-tight italic">{campaign.title}</h5>
                                                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Recipients: {campaign.audienceCount} • Est. Cost: ${campaign.totalCost.toLocaleString()}</p>
                                                  </div>
                                              </div>
                                              <div className="flex gap-3">
                                                  <button onClick={() => handleSendMail(campaign.id)} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg active:scale-95 transition-all">Approve & Send</button>
                                                  <button className="px-6 py-2 bg-white border border-slate-200 text-slate-400 rounded-xl font-black uppercase text-[9px] tracking-widest hover:text-red-500">Reject</button>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {directMail.map(campaign => (
                                  <div key={campaign.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-lg overflow-hidden flex flex-col group hover:border-indigo-400 transition-all">
                                      <div className="h-40 bg-slate-900 relative">
                                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                                          <div className="absolute bottom-4 left-6">
                                              <span className="bg-indigo-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-lg mb-2 inline-block">{campaign.mailType}</span>
                                              <h4 className="text-xl font-black text-white uppercase italic leading-none">{campaign.title}</h4>
                                          </div>
                                          <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10 text-white"><QrCode size={20}/></div>
                                      </div>
                                      <div className="p-8 flex flex-col flex-1">
                                          <div className="flex justify-between items-center mb-6">
                                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${campaign.status === 'sent' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400'}`}>{campaign.status}</span>
                                              <p className="text-[11px] font-black text-slate-900 tabular-nums">${campaign.totalCost.toLocaleString()}</p>
                                          </div>
                                          <p className="text-[10px] text-slate-500 leading-relaxed font-medium mb-8 flex-1 italic">"{campaign.contentHeadline}"</p>
                                          <div className="flex gap-2">
                                              <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all">View Proof</button>
                                              <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600"><History size={18}/></button>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  ) : (
                      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden animate-fade-in">
                          <div className="bg-slate-900 p-8 text-white flex justify-between items-center border-b-8 border-indigo-600">
                              <h3 className="text-2xl font-black italic tracking-tighter uppercase">Physical Mail Creator</h3>
                              <button onClick={() => setIsCreatingMail(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X size={24}/></button>
                          </div>
                          <div className="p-10 space-y-10">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="space-y-6">
                                      <div className="space-y-1.5">
                                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Campaign Title</label>
                                          <input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" value={newMail.title} onChange={e => setNewMail({...newMail, title: e.target.value})} placeholder="E.g. Austin Farm 78704 Q4" />
                                      </div>
                                      <div className="space-y-1.5">
                                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Mail Format</label>
                                          <div className="grid grid-cols-3 gap-2">
                                              {['postcard', 'letter', 'flyer'].map(t => (
                                                  <button key={t} onClick={() => setNewMail({...newMail, mailType: t as any})} className={`py-3 rounded-xl text-[9px] font-black uppercase border-2 transition-all ${newMail.mailType === t ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>{t}</button>
                                              ))}
                                          </div>
                                      </div>
                                  </div>
                                  <div className="bg-slate-50 rounded-3xl border border-slate-200 p-8 flex flex-col justify-center text-center space-y-4 shadow-inner relative overflow-hidden">
                                      <div className="absolute right-0 top-0 p-4 opacity-5"><ImageIcon size={100}/></div>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Template</p>
                                      <div className="w-full aspect-[4/3] bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-100 group cursor-pointer hover:border-indigo-400 transition-all">
                                          <Bot size={40} className="text-indigo-100 group-hover:text-indigo-600 transition-colors"/>
                                      </div>
                                      <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Browse Designs</button>
                                  </div>
                              </div>

                              <div className="space-y-6">
                                  <div className="space-y-1.5">
                                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Headline Content</label>
                                      <input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold italic text-lg" value={newMail.contentHeadline} onChange={e => setNewMail({...newMail, contentHeadline: e.target.value})} placeholder="THE 78704 MARKET IS MOVING..." />
                                  </div>
                                  <div className="space-y-1.5">
                                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Body Text (150 Chars Max)</label>
                                      <textarea maxLength={150} className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] font-medium text-sm h-32 outline-none focus:ring-2 focus:ring-indigo-500" value={newMail.contentBody} onChange={e => setNewMail({...newMail, contentBody: e.target.value})} placeholder="Brief value proposition for the physical mailer..." />
                                  </div>
                              </div>

                              <div className="p-8 bg-slate-900 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 border-b-8 border-indigo-600">
                                  <div className="flex items-center gap-6">
                                      <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-900/50"><QrCode size={32}/></div>
                                      <div>
                                          <h4 className="text-xl font-black italic tracking-tighter uppercase">Smart Link Integration</h4>
                                          <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mt-1">AI generates a dynamic tracking QR</p>
                                      </div>
                                  </div>
                                  <select className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none focus:bg-white/20">
                                      <option>Link to Video Strategy</option>
                                      <option>Link to Listing Landing</option>
                                      <option>Link to Property Value Portal</option>
                                  </select>
                              </div>

                              <div className="flex gap-4">
                                  <button onClick={() => setIsCreatingMail(false)} className="flex-1 py-5 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">Discard</button>
                                  <button onClick={handleCreateMail} disabled={isProcessing !== null} className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl border-b-4 border-indigo-900 flex items-center justify-center gap-3 active:scale-95 transition-all">
                                      {isProcessing === 'create-mail' ? <Loader2 size={18} className="animate-spin"/> : <ShieldCheck size={18}/>} Submit for Broker Approval
                                  </button>
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          )}

          {/* TAB 1: REPURPOSE (Mock placeholder kept) */}
          {activeTab === 'repurpose' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                  <div className="lg:col-span-7 space-y-6">
                      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-10 relative overflow-hidden group">
                           <div className="absolute right-[-20px] top-[-20px] p-4 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000"><Film size={180}/></div>
                           <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Multiplex Repurposer.</h3>
                           <p className="text-slate-500 text-sm font-medium mb-10 max-w-md leading-relaxed">Repurpose one master recording into 12 platform-native hooks. AI transcribes, detects viral segments, and applies platform tone variants.</p>
                           
                           <div className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center gap-4 group hover:bg-slate-50 hover:border-indigo-200 transition-all cursor-pointer">
                                <div className="p-5 bg-white rounded-[2rem] shadow-2xl group-hover:scale-110 transition-transform"><Plus size={32} className="text-indigo-600"/></div>
                                <div>
                                    <p className="font-black uppercase tracking-widest text-[11px] text-slate-800">Initialize Long-Form Stream</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Upload MP4 / MOV (Up to 2GB)</p>
                                </div>
                           </div>
                           
                           <div className="mt-10 flex gap-4">
                               <button 
                                 // Defined handleWorkflow function above
                                 onClick={() => handleWorkflow('wf-repurpose-long-video', {})}
                                 disabled={isProcessing === 'wf-repurpose-long-video'}
                                 className="flex-1 bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3 border-b-4 border-indigo-950"
                               >
                                   {isProcessing === 'wf-repurpose-long-video' ? <Loader2 className="animate-spin" size={18}/> : <RefreshCw size={18}/>}
                                   Split & Generate Clips
                               </button>
                           </div>
                      </div>
                  </div>
                  <div className="lg:col-span-5 space-y-6">
                      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl h-fit border-b-8 border-indigo-600">
                          <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><Smartphone size={16}/> Render Queue</h4>
                          <div className="space-y-4">
                              {[
                                  { n: 'Modern Kitchen Tour (Clip A)', p: 'Instagram', s: 'Rendering' },
                                  { n: 'Modern Kitchen Tour (Clip B)', p: 'TikTok', s: 'Queued' }
                              ].map((item, i) => (
                                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center group">
                                      <div>
                                          <p className="text-xs font-black text-white italic">{item.n}</p>
                                          <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-1">{item.p}</p>
                                      </div>
                                      <span className="text-[9px] font-black text-indigo-300 animate-pulse">{item.s}...</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* TAB 2: KEYWORD ENGINE */}
          {activeTab === 'keywords' && (
               <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-7 space-y-6">
                            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm space-y-8">
                                <div>
                                    <h3 className="text-xl font-black italic tracking-tighter uppercase mb-2">1. Select Preferences</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Market Context</label>
                                            <div className="flex gap-2">
                                                <select className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold outline-none">
                                                    <option>Austin, TX</option>
                                                    <option>Dallas, TX</option>
                                                </select>
                                                <select className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold outline-none">
                                                    <option>Balanced Market</option>
                                                    <option>Hot Market</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Your Voice/Tone</label>
                                            <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold outline-none">
                                                <option value="professional">Professional & Approachable</option>
                                                <option value="expert">Expert & Technical</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none">2. Target Keywords</h3>
                                        <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All 200+</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                                        {keywords.slice(0, 10).map(k => (
                                            <div key={k.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between group hover:border-indigo-400 transition-all cursor-pointer">
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-black uppercase text-slate-900 truncate">"{k.keyword}"</p>
                                                    <span className="text-[7px] font-black uppercase bg-white border border-slate-100 px-1.5 py-0.5 rounded mt-1 inline-block">{k.intent}</span>
                                                </div>
                                                <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-indigo-600 transition-all"><Check size={10} className="text-indigo-600 opacity-0 group-hover:opacity-100"/></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-5 space-y-6">
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl h-fit border-b-8 border-indigo-600">
                                <h3 className="text-xl font-black italic tracking-tighter uppercase mb-8">3. Package Synthesis</h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Social Posts', 'Video Scripts', 'Email Templates', 'Blog Outlines'].map(opt => (
                                            <button key={opt} className="p-3 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase text-slate-400 hover:text-white hover:border-white/30 transition-all text-left flex items-center justify-between">
                                                {opt} <Check size={10} className="opacity-0"/>
                                            </button>
                                        ))}
                                    </div>
                                    <button className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-indigo-950">
                                        <Sparkles size={20}/> Generate Content Pack
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
               </div>
          )}

          {/* TAB 6: VAULT */}
          {activeTab === 'vault' && (
              <div className="space-y-8 animate-fade-in-up">
                  <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm">
                      <div className="relative flex-1">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                          <input type="text" placeholder="SEARCH ASSETS OR TAGS..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner" />
                      </div>
                      <div className="flex gap-2">
                          <button className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl">All Types</button>
                          <button className="px-6 py-2 bg-slate-100 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest">Video Only</button>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {assets.map(asset => (
                          <div key={asset.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-lg overflow-hidden group hover:border-indigo-400 transition-all flex flex-col h-[400px]">
                              <div className="h-48 bg-slate-900 relative overflow-hidden flex flex-col items-center justify-center">
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
                                  {asset.type === 'image' ? <ImageIcon size={48} className="text-white/20"/> : <PlayCircle size={48} className="text-white/20" />}
                                  <div className="absolute top-4 left-4 z-20"><span className="bg-indigo-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-lg">{asset.type}</span></div>
                              </div>
                              <div className="p-6 flex flex-col flex-1">
                                  <h4 className="font-black text-slate-900 uppercase tracking-tight text-xs mb-4 leading-tight truncate">Nexus Asset: {asset.id}</h4>
                                  <div className="flex flex-wrap gap-1.5 mb-8">
                                      <span className="text-[7px] font-black bg-slate-50 text-slate-400 px-2 py-0.5 rounded border border-slate-100 uppercase tracking-widest">PROCESSED</span>
                                      <span className="text-[7px] font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-widest">V2</span>
                                  </div>
                                  <div className="mt-auto grid grid-cols-2 gap-2">
                                      <button className="py-2.5 bg-slate-900 text-white rounded-xl font-black uppercase text-[8px] tracking-widest shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2"><Download size={12}/> Get</button>
                                      <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 transition-all shadow-sm"><Share2 size={16}/></button>
                                  </div>
                              </div>
                          </div>
                      ))}
                      <button className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center gap-3 group hover:border-indigo-200 transition-all opacity-40 hover:opacity-100">
                          <Plus size={32} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Import Creative</span>
                      </button>
                  </div>
              </div>
          )}
      </div>

      {/* EDIT CLIP MODAL */}
      {editingClip && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[2000] flex items-center justify-center p-6 animate-fade-in">
              <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full h-[85vh] overflow-hidden animate-scale-in flex flex-col border border-white/10">
                  <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0 border-b-8 border-indigo-600">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl"><Scissors size={24}/></div>
                          <div>
                            <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none">Refine Short Clip.</h3>
                            <p className="text-indigo-400 text-[9px] font-black uppercase tracking-widest mt-1">Source: {selectedLongVideo?.title}</p>
                          </div>
                      </div>
                      <button onClick={() => setEditingClip(null)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X size={28} /></button>
                  </div>
                  <div className="flex-1 flex overflow-hidden bg-slate-50">
                      <div className="flex-1 p-10 overflow-y-auto space-y-8 scrollbar-hide">
                          <div className="relative rounded-[2rem] overflow-hidden border-4 border-white shadow-xl aspect-[9/16] bg-slate-900 max-w-sm mx-auto">
                              <img src={editingClip.thumbnailUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80'} className="w-full h-full object-cover opacity-80" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                  <PlayCircle size={64} className="text-white opacity-50"/>
                              </div>
                          </div>
                          
                          <div className="space-y-6">
                              <div className="space-y-1.5">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Clip Title</label>
                                  <input 
                                      type="text" 
                                      value={editingClip.title}
                                      onChange={e => setEditingClip({...editingClip, title: e.target.value})}
                                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                                  />
                              </div>
                              <div className="space-y-1.5">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1 flex justify-between">
                                      <span>Attention Hook (Text Overlay)</span>
                                      <span className={editingClip.hook.length > 50 ? 'text-red-500' : 'text-slate-400'}>{editingClip.hook.length}/50</span>
                                  </label>
                                  <input 
                                      type="text" 
                                      maxLength={50}
                                      value={editingClip.hook}
                                      onChange={e => setEditingClip({...editingClip, hook: e.target.value})}
                                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                                  />
                              </div>
                              <div className="space-y-1.5">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Social Caption</label>
                                  <textarea 
                                      value={editingClip.caption}
                                      onChange={e => setEditingClip({...editingClip, caption: e.target.value})}
                                      className="w-full p-6 bg-white border border-slate-200 rounded-[2rem] text-xs font-medium text-slate-700 h-32 shadow-inner outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
                                  />
                              </div>
                          </div>
                      </div>
                      <div className="w-80 bg-white border-l border-slate-100 p-8 flex flex-col space-y-8">
                          <div className="space-y-6">
                              <div className="space-y-1.5">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Target Platform</label>
                                  <select 
                                      value={editingClip.platform}
                                      onChange={e => setEditingClip({...editingClip, platform: e.target.value as ClipPlatform})}
                                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-indigo-500"
                                  >
                                      <option value="instagram_reel">Instagram Reel</option>
                                      <option value="tiktok">TikTok</option>
                                      <option value="youtube_short">YouTube Short</option>
                                      <option value="facebook_reel">Facebook Reel</option>
                                      <option value="all">All Channels</option>
                                  </select>
                              </div>
                              <div className="space-y-1.5">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Ratio / Layout</label>
                                  <select 
                                      value={editingClip.dimensions}
                                      onChange={e => setEditingClip({...editingClip, dimensions: e.target.value as ClipDimensions})}
                                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-indigo-500"
                                  >
                                      <option value="9:16_vertical">9:16 Vertical</option>
                                      <option value="1:1_square">1:1 Square</option>
                                      <option value="16:9_horizontal">16:9 Horizontal</option>
                                  </select>
                              </div>
                          </div>

                          <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Zap size={12}/> AI Insight</p>
                              <p className="text-[11px] text-indigo-900 leading-relaxed italic font-medium">"9:16 Vertical format is currently driving 2.4x more engagement for {selectedLongVideo?.sourceType.replace('_', ' ')} content in Austin."</p>
                          </div>

                          <div className="mt-auto space-y-3">
                              <button onClick={() => {
                                  if (!editingClip) return;
                                  setClips(prev => prev.map(c => c.id === editingClip.id ? editingClip : c));
                                  setEditingClip(null);
                                  alert("Clip adjustments saved.");
                              }} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl border-b-4 border-indigo-950 active:scale-95 transition-all">Save Adjustments</button>
                              <button className="w-full py-3 text-[10px] font-black uppercase text-red-50 hover:bg-red-50 rounded-xl transition-all">Delete Clip</button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

function getPlatformIcon(p: SocialPlatform) {
    switch(p) {
        case 'Instagram': return <Instagram size={14}/>;
        case 'Facebook': return <Facebook size={14}/>;
        case 'Pinterest': return <Pin size={14}/>;
        case 'X': return <Twitter size={14}/>;
        case 'LinkedIn': return <Linkedin size={14}/>;
        case 'TikTok': return <Music size={14}/>;
        case 'YouTube': return <Play size={14}/>;
        default: return <Share2 size={14}/>;
    }
}

export default MediaStudio;
