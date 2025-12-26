import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Share2, ImageIcon, Layout, Settings, Plus, RefreshCw, 
  Loader2, CheckCircle2, Download, Send, Edit3, 
  Instagram, Facebook, Linkedin, Bot, Sparkles, 
  Eye, Monitor, Smartphone, Trash2, Palette, ShieldCheck,
  // Fix: Added missing icon imports
  Clock, Heart, MessageSquare
} from 'lucide-react';
import { n8nService } from '../../services/n8n';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, SocialContent, SocialPlatform, PostStatus } from '../../types';

const SocialScheduler: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === UserRole.ADMIN || role === UserRole.BROKER;
  const isAgent = role === UserRole.AGENT;

  const [activeTab, setActiveTab] = useState<'feed' | 'templates' | 'brand'>('feed');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [previewPlatform, setPreviewPlatform] = useState<SocialPlatform>('Instagram');

  // Workflow 156 State: Content Feed
  const [socialFeed, setSocialFeed] = useState<SocialContent[]>([
    { id: 'sc1', dealId: 'd1', platform: 'Instagram', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', captionText: "JUST SOLD! 🚀 This stunning modern residence in 78704 is officially off the market. Congrats to my amazing clients! #JustSold #AustinRealEstate #NexusOS", status: 'Draft' },
    { id: 'sc2', dealId: 'd1', platform: 'LinkedIn', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', captionText: "Market Efficiency Analysis: 123 Main St. sold in 4 days at 102% of list price. The 78704 submarket continues to show high velocity for luxury inventory. Proud to represent our clients in this successful transaction.", status: 'Draft' },
    { id: 'sc3', dealId: 'd1', platform: 'Facebook', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', captionText: "So happy for the Miller family on the sale of their beautiful home! 🏠 We were able to secure multiple offers within the first 48 hours. If you're thinking about selling in this neighborhood, let's chat!", status: 'Scheduled', scheduledDate: 'Tomorrow, 9:00 AM' },
  ]);

  // Workflow 156 State: Admin Templates
  const [templates] = useState([
    { id: 'tpl1', name: 'Just Sold - Minimalist', platform: 'IG/FB', previewUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80' },
    { id: 'tpl2', name: 'Under Contract - Banner', platform: 'LinkedIn', previewUrl: 'https://images.unsplash.com/photo-1554230505-919a13968970?w=400&q=80' },
  ]);

  const [brandSettings, setBrandSettings] = useState({
      primaryColor: '#4f46e5',
      accentColor: '#10b981',
      logoUrl: 'Nexus_Logo_V2.svg',
      bannerbearTemplate: 'tpl_882910X'
  });

  const handlePostNow = async (id: string) => {
    setIsProcessing(id);
    await n8nService.triggerWorkflow('social-publish-now', { contentId: id });
    setTimeout(() => {
        setSocialFeed(prev => prev.map(item => item.id === id ? { ...item, status: 'Published' } : item));
        setIsProcessing(null);
        alert("Success: Post dispatched to Buffer API and live across selected channels.");
    }, 1500);
  };

  const handleUpdateBrand = async () => {
      setIsProcessing('brand');
      await new Promise(r => setTimeout(r, 1000));
      setIsProcessing(null);
      alert("Brand Kit Sync: Bannerbear layers updated with new brokerage assets.");
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">Social Scheduler.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Workflow 156: Auto-Content Studio active</p>
        </div>
        <div className="flex gap-2">
            <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm overflow-x-auto scrollbar-hide max-w-full">
                <button onClick={() => setActiveTab('feed')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'feed' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <Layout size={14}/> Content Feed
                </button>
                {isAdmin && (
                  <>
                    <button onClick={() => setActiveTab('templates')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'templates' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                        <ImageIcon size={14}/> Template Manager
                    </button>
                    <button onClick={() => setActiveTab('brand')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'brand' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                        <Palette size={14}/> Brand Kit
                    </button>
                  </>
                )}
            </div>
        </div>
      </div>

      {activeTab === 'brand' && isAdmin && (
          <div className="space-y-8 animate-fade-in-up max-w-2xl">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Palette size={180}/></div>
                  <div className="relative z-10">
                      <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Visual Identity.</h3>
                      <p className="text-indigo-100 text-sm font-medium opacity-90 leading-relaxed mb-8">
                          Define the global aesthetics for generated social assets. AI automatically applies these hex codes and assets to every Bannerbear template modification.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block px-1">Primary Brand Hex</label>
                              <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/10">
                                  <div className="w-6 h-6 rounded-lg bg-indigo-600 border border-white/20" />
                                  <input type="text" value={brandSettings.primaryColor} onChange={e => setBrandSettings({...brandSettings, primaryColor: e.target.value})} className="bg-transparent border-none p-0 text-sm font-bold text-white outline-none w-full" />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block px-1">Bannerbear Template ID</label>
                              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                                  <input type="text" value={brandSettings.bannerbearTemplate} onChange={e => setBrandSettings({...brandSettings, bannerbearTemplate: e.target.value})} className="bg-transparent border-none p-0 text-sm font-bold text-white outline-none w-full" />
                              </div>
                          </div>
                      </div>

                      <button 
                        onClick={handleUpdateBrand}
                        disabled={isProcessing === 'brand'}
                        className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-indigo-800 disabled:opacity-50"
                      >
                          {isProcessing === 'brand' ? <Loader2 size={18} className="animate-spin"/> : <ShieldCheck size={18}/>}
                          Sync Global Brand Styles
                      </button>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'templates' && isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
              {templates.map(tpl => (
                  <div key={tpl.id} className="bg-white rounded-[2rem] border-2 border-slate-200 p-6 shadow-sm hover:border-indigo-400 transition-all flex flex-col group">
                      <div className="aspect-video bg-slate-900 rounded-2xl mb-6 overflow-hidden relative group">
                          <img src={tpl.previewUrl} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <button className="bg-white text-slate-900 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl">Edit Layout</button>
                          </div>
                          <div className="absolute top-4 left-4 bg-indigo-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-lg">Bannerbear</div>
                      </div>
                      <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg mb-1 italic">{tpl.name}</h4>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{tpl.platform} Architecture</p>
                  </div>
              ))}
              <button className="border-4 border-dashed border-slate-100 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center gap-3 group hover:border-indigo-200 transition-all">
                    <Plus size={32} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Import Template JSON</span>
              </button>
          </div>
      )}

      {activeTab === 'feed' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
              {/* Main Feed Content */}
              <div className="lg:col-span-8 space-y-6">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600"><Bot size={24}/></div>
                          <div>
                              <h4 className="font-black text-xs uppercase text-indigo-900 tracking-tight">AI Content Strategist</h4>
                              <p className="text-[10px] text-indigo-500 font-bold leading-relaxed">Generated 3 variants for 123 Main St based on "Sold" status trigger.</p>
                          </div>
                      </div>
                      <button className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">Refresh Feed</button>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                      {socialFeed.map(post => (
                          <div key={post.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col md:flex-row group hover:border-indigo-400 transition-all">
                              <div className="md:w-[320px] bg-slate-900 relative overflow-hidden shrink-0">
                                  <img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                                      <div className="flex items-center gap-2 mb-2">
                                          {post.platform === 'Instagram' ? <Instagram size={14} className="text-white"/> : post.platform === 'LinkedIn' ? <Linkedin size={14} className="text-white"/> : <Facebook size={14} className="text-white"/>}
                                          <span className="text-[9px] font-black text-white uppercase tracking-widest">{post.platform} Preview</span>
                                      </div>
                                  </div>
                              </div>
                              <div className="flex-1 p-8 flex flex-col justify-between">
                                  <div>
                                      <div className="flex justify-between items-center mb-6">
                                          <span className={`px-2.5 py-1 rounded text-[8px] font-black uppercase border ${
                                              post.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                              post.status === 'Scheduled' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                              'bg-orange-50 text-orange-700 border-orange-100'
                                          }`}>{post.status}</span>
                                          {post.scheduledDate && <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Clock size={12}/> {post.scheduledDate}</p>}
                                      </div>
                                      <p className="text-sm font-medium text-slate-700 leading-relaxed mb-8 italic">"{post.captionText}"</p>
                                  </div>
                                  <div className="flex gap-3">
                                      {post.status === 'Draft' ? (
                                          <button 
                                            onClick={() => handlePostNow(post.id)}
                                            disabled={isProcessing === post.id}
                                            className="flex-1 bg-indigo-600 text-white py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                          >
                                              {isProcessing === post.id ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}
                                              Post Now
                                          </button>
                                      ) : (
                                          <div className="flex-1 bg-slate-50 border border-slate-100 py-3.5 rounded-2xl text-[10px] font-black uppercase text-slate-400 flex items-center justify-center gap-2">
                                              <CheckCircle2 size={16} className="text-emerald-500"/> Post {post.status}
                                          </div>
                                      )}
                                      <button className="p-3.5 border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all"><Edit3 size={18}/></button>
                                      <button className="p-3.5 border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Visual Preview Console */}
              <div className="lg:col-span-4 space-y-6">
                  <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl border-b-8 border-indigo-600">
                      <h4 className="font-black text-[10px] text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><Monitor size={16}/> Rendering Console</h4>
                      
                      <div className="flex bg-white/10 p-1 rounded-xl mb-8">
                          {(['Instagram', 'LinkedIn', 'Facebook'] as SocialPlatform[]).map(p => (
                              <button key={p} onClick={() => setPreviewPlatform(p)} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${previewPlatform === p ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{p}</button>
                          ))}
                      </div>

                      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] relative">
                          <div className="p-4 flex items-center gap-3 border-b border-slate-100">
                              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-black text-[10px]">NX</div>
                              <div>
                                  <p className="text-slate-900 font-black text-[10px] leading-none">nexus_realty</p>
                                  <p className="text-slate-400 text-[8px] mt-0.5 uppercase tracking-widest">Austin, TX</p>
                              </div>
                          </div>
                          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80" className="w-full aspect-square object-cover" />
                          <div className="p-4 space-y-2">
                              <div className="flex gap-3 text-slate-900 mb-2">
                                  <Heart size={20}/> <MessageSquare size={20}/> <Send size={20}/>
                              </div>
                              <p className="text-slate-800 text-[10px] leading-relaxed line-clamp-3">
                                  <span className="font-black mr-2">nexus_realty</span>
                                  {socialFeed.find(p => p.platform === previewPlatform)?.captionText || socialFeed[0].captionText}
                              </p>
                          </div>
                      </div>
                  </div>

                  <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                      <h4 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><Sparkles size={16} className="text-indigo-600"/> Creative Health</h4>
                      <div className="space-y-6">
                          <div>
                              <div className="flex justify-between items-baseline mb-2">
                                  <span className="text-[9px] font-black text-slate-400 uppercase">Bannerbear Uptime</span>
                                  <span className="text-emerald-600 font-black text-[10px]">100%</span>
                              </div>
                              <div className="h-1 bg-emerald-500 rounded-full" />
                          </div>
                          <div>
                              <div className="flex justify-between items-baseline mb-2">
                                  <span className="text-[9px] font-black text-slate-400 uppercase">Buffer Queue Load</span>
                                  <span className="text-indigo-600 font-black text-[10px]">Normal</span>
                              </div>
                              <div className="h-1 bg-indigo-600 rounded-full w-2/3" />
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default SocialScheduler;
