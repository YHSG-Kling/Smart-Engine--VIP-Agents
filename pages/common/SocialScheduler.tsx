
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Share2, ImageIcon, Layout, Settings, Plus, RefreshCw, 
  Loader2, CheckCircle2, Download, Send, Edit3, 
  Instagram, Facebook, Linkedin, Bot, Sparkles, 
  Eye, Monitor, Smartphone, Trash2, Palette, ShieldCheck,
  Clock, Heart, MessageSquare, Calendar, Globe, Zap,
  AlertTriangle, Check, X, Filter, LayoutGrid, ListChecks,
  Target, GraduationCap as GraduationCapIcon, MapPin, Smile, Home, BarChart3,
  DollarSign, TrendingUp, Lightbulb, Play, ArrowRight,
  Pin, Twitter, Music, Wand2, PieChart, Activity
} from 'lucide-react';
import { n8nService } from '../../services/n8n';
import { SocialContent, SocialPlatform, SocialCategory, MediaFormat } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface ContentRecipe {
    id: string;
    pillar: SocialCategory;
    title: string;
    why: string;
    difficulty: 'Easy' | 'Medium' | 'High';
    bestTime: string;
}

interface ComplianceEvent {
    id: string;
    postId: string;
    status: 'PASS' | 'WARN' | 'FAIL';
    reason: string;
    suggestion: string;
    timestamp: string;
}

const SocialScheduler: React.FC = () => {
  const { role, user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'lab' | 'queue' | 'compliance' | 'analytics'>('lab');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [previewPlatform, setPreviewPlatform] = useState<SocialPlatform>('Instagram');
  
  // Editing State
  const [editingPost, setEditingPost] = useState<SocialContent | null>(null);

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState('');

  // Feeds
  const [socialFeed, setSocialFeed] = useState<SocialContent[]>([]);
  const [complianceLog, setComplianceLog] = useState<ComplianceEvent[]>([
      { id: 'ev1', postId: 'draft_1', status: 'PASS', reason: 'Fair Housing Compliant', suggestion: 'None required.', timestamp: '1h ago' },
      { id: 'ev2', postId: 'draft_2', status: 'WARN', reason: 'Vague demographic language', suggestion: 'Avoid "Perfect for young professionals", use "Great for home office needs".', timestamp: '2h ago' }
  ]);

  // Recipes
  const [recipes] = useState<ContentRecipe[]>([
    { id: 'rec_1', pillar: 'Local', title: 'Hidden Coffee Gems', why: 'Neighborhood experts build trust.', difficulty: 'Easy', bestTime: 'Fri 9 AM' },
    { id: 'rec_2', pillar: 'Educational', title: 'Why Wait for Rates?', why: 'Combats common market objections.', difficulty: 'Medium', bestTime: 'Tue 10 AM' },
    { id: 'rec_3', pillar: 'Personal', title: 'A Day in the Life', why: 'Humans hire humans.', difficulty: 'Easy', bestTime: 'Sun 6 PM' },
    { id: 'rec_4', pillar: 'Listing', title: 'Luxury Kitchen Tour', why: 'Staged kitchens drive engagement.', difficulty: 'High', bestTime: 'ASAP' },
  ]);

  const generateVisual = async (ai: any, prompt: string): Promise<string> => {
      try {
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: [{ parts: [{ text: `High-end professional Real Estate Marketing Photo: ${prompt}. Austin Texas vibe.` }] }],
              config: { imageConfig: { aspectRatio: "1:1" } }
          });
          for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
          }
          return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80';
      } catch (e) {
          return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80';
      }
  };

  const handleExecuteRecipe = async (recipe: ContentRecipe) => {
    if (!process.env.API_KEY) return;
    setIsGenerating(true);
    setGenStatus('Synthesizing Omnichannel Strategy...');
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const textPrompt = `Generate a cohesive campaign for 6 platforms (IG, FB, Pin, X, LI, TikTok) for the theme: ${recipe.title}. Return strictly valid JSON. Include "complianceScore" (0-100) and "imagePrompt".`;

        const textResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: textPrompt,
            config: { responseMimeType: 'application/json' }
        });

        if (textResponse.text) {
            const data = JSON.parse(textResponse.text);
            const generatedPosts: SocialContent[] = [];
            for (const p of (data.campaign || [])) {
                setGenStatus(`Generating visual for ${p.platform}...`);
                const imageUrl = await generateVisual(ai, p.imagePrompt);
                generatedPosts.push({
                    id: 'gen_' + Math.random().toString(36).substr(2, 9),
                    platform: p.platform,
                    category: recipe.pillar,
                    imageUrl,
                    captionText: p.caption,
                    format: 'Square',
                    status: 'Draft',
                    complianceScore: p.complianceScore || 100,
                    complianceFlags: p.complianceScore < 100 ? ['Language Refinement Needed'] : [],
                    ghlSyncStatus: 'Pending'
                });
            }
            setSocialFeed([...generatedPosts, ...socialFeed]);
            setActiveTab('queue');
        }
    } catch (e) {
        alert("Synthesis failed.");
    } finally {
        setIsGenerating(false);
        setGenStatus('');
    }
  };

  const handleGHLSync = async (id: string) => {
    setIsProcessing(id);
    await n8nService.syncToGHLPlanner([socialFeed.find(p => p.id === id) as any]);
    setTimeout(() => {
        setSocialFeed(prev => prev.map(item => item.id === id ? { ...item, ghlSyncStatus: 'Synced', status: 'Scheduled' } : item));
        setIsProcessing(null);
    }, 1500);
  };

  const handleSaveEdit = () => {
    if (!editingPost) return;
    setSocialFeed(prev => prev.map(item => item.id === editingPost.id ? editingPost : item));
    setEditingPost(null);
    alert("Post updated in local registry.");
  };

  const getPlatformIcon = (p: SocialPlatform) => {
      switch(p) {
          case 'Instagram': return <Instagram size={20}/>;
          case 'Facebook': return <Facebook size={20}/>;
          case 'Pinterest': return <Pin size={20}/>;
          case 'X': return <Twitter size={20}/>;
          case 'LinkedIn': return <Linkedin size={20}/>;
          case 'TikTok': return <Music size={20}/>;
          default: return <Share2 size={20}/>;
      }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 max-w-full overflow-hidden px-1">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">Social Hub.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Multi-Channel AI Orchestration</p>
        </div>
        <div className="flex bg-white rounded-xl p-1 border border-slate-200 overflow-x-auto max-w-full scrollbar-hide shadow-sm">
          {[
            { id: 'lab', icon: Bot, label: 'Strategy Lab' },
            { id: 'queue', icon: Calendar, label: 'Post Queue' },
            { id: 'compliance', icon: ShieldCheck, label: 'Audit Trail' },
            { id: 'analytics', icon: BarChart3, label: 'Performance' },
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

      {activeTab === 'lab' && (
          <div className="space-y-8 animate-fade-in-up">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Lightbulb size={180}/></div>
                  <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="text-indigo-400" size={24}/>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-300">Intelligent Orchestration</span>
                      </div>
                      <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-4 leading-none">The Content Pilot.</h3>
                      <p className="text-indigo-100 text-lg font-medium opacity-90 leading-relaxed mb-8 max-w-2xl">
                          Decision paralysis kills brands. Pick a high-performing "Recipe" below and I'll generate the visuals, the platform-native copy, and the compliance check for 6 social channels in one click.
                      </p>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recipes.map(recipe => (
                      <div key={recipe.id} className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-lg flex flex-col group hover:border-indigo-500 transition-all hover:scale-[1.02]">
                          <div className="flex justify-between items-start mb-6">
                              <div className={`p-3 rounded-2xl ${recipe.pillar === 'Listing' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'} shadow-inner`}>
                                  {recipe.pillar === 'Listing' ? <Home size={18}/> : recipe.pillar === 'Educational' ? <GraduationCapIcon size={18}/> : <Smile size={18}/>}
                              </div>
                              <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-slate-100 text-slate-500 rounded">{recipe.difficulty} Effort</span>
                          </div>
                          <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-2">{recipe.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed mb-6 flex-1">"{recipe.why}"</p>
                          <button onClick={() => handleExecuteRecipe(recipe)} disabled={isGenerating} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 border-b-4 border-indigo-800 disabled:opacity-50 transition-all active:scale-95">
                              {isGenerating ? <Loader2 size={16} className="animate-spin"/> : <Zap size={16}/>} Execute Recipe
                          </button>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {activeTab === 'queue' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
              <div className="lg:col-span-8 space-y-6">
                  {socialFeed.length === 0 ? (
                      <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                          <Bot size={48} className="text-slate-100 mb-6" />
                          <h4 className="text-xl font-black text-slate-800 uppercase italic">No Content Buffered.</h4>
                          <button onClick={() => setActiveTab('lab')} className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl">Strategy Lab</button>
                      </div>
                  ) : (
                      socialFeed.map(post => (
                          <div key={post.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col md:flex-row group hover:border-indigo-400 transition-all">
                              <div className="md:w-[280px] bg-slate-900 relative overflow-hidden shrink-0">
                                  <img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-90" />
                                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                                      <div className="bg-white/90 backdrop-blur-md text-slate-900 border border-white/20 p-2.5 rounded-2xl shadow-2xl">{getPlatformIcon(post.platform)}</div>
                                      {post.complianceScore < 100 && <div className="bg-red-600 text-white p-2 rounded-xl shadow-lg animate-pulse"><AlertTriangle size={14}/></div>}
                                  </div>
                              </div>
                              <div className="flex-1 p-8 flex flex-col justify-between">
                                  <div>
                                      <div className="flex justify-between items-center mb-6">
                                          <div className="flex items-center gap-2">
                                              <span className={`px-2.5 py-1 rounded text-[8px] font-black uppercase border ${post.status === 'Scheduled' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>{post.status}</span>
                                              <span className={`px-2.5 py-1 rounded text-[8px] font-black uppercase border ${post.ghlSyncStatus === 'Synced' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>GHL: {post.ghlSyncStatus}</span>
                                          </div>
                                      </div>
                                      <p className="text-sm font-bold text-slate-700 leading-relaxed mb-10 line-clamp-4">"{post.captionText}"</p>
                                  </div>
                                  <div className="flex gap-3">
                                      <button onClick={() => handleGHLSync(post.id)} disabled={post.complianceScore < 100 || isProcessing === post.id} className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 border-b-4 ${post.complianceScore < 100 ? 'bg-slate-200 text-slate-400 border-slate-300' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 border-indigo-900'}`}>
                                          {isProcessing === post.id ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16}/>} {post.complianceScore < 100 ? 'Fix Compliance' : 'Sync GHL'}
                                      </button>
                                      <button onClick={() => setEditingPost(post)} className="p-4 border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-400 transition-all shadow-sm"><Edit3 size={18}/></button>
                                  </div>
                              </div>
                          </div>
                      ))
                  )}
              </div>
              <div className="lg:col-span-4 space-y-6">
                  <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl border-b-8 border-indigo-600 sticky top-6">
                      <div className="flex justify-between items-center mb-8">
                        <h4 className="font-black text-[10px] text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2"><Monitor size={16}/> Rendering Console</h4>
                        <div className="flex bg-white/10 p-1 rounded-xl shadow-inner">
                            {(['Instagram', 'X', 'LinkedIn'] as const).map(p => (
                                <button key={p} onClick={() => setPreviewPlatform(p)} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${previewPlatform === p ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>{p[0]}</button>
                            ))}
                        </div>
                      </div>
                      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] relative text-slate-900">
                          <div className="p-4 flex items-center gap-3 border-b border-slate-100">
                              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-[10px]">VA</div>
                              <p className="font-black text-[10px]">vip_agents_nexus</p>
                          </div>
                          <img src={socialFeed.find(p => p.platform === previewPlatform)?.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'} className="w-full aspect-square object-cover" />
                          <p className="p-4 text-[10px] leading-relaxed line-clamp-3">
                              <span className="font-black mr-2">vip_agents_nexus</span>
                              {socialFeed.find(p => p.platform === previewPlatform)?.captionText || 'Generate content to preview.'}
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'compliance' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-md overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                      <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2"><ShieldCheck size={18} className="text-indigo-600" /> Compliance Audit Trail</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                      {complianceLog.map(ev => (
                          <div key={ev.id} className="p-8 hover:bg-slate-50 transition-all flex flex-col md:flex-row justify-between gap-8">
                              <div className="flex items-center gap-6 flex-1">
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs border-2 ${ev.status === 'PASS' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{ev.status}</div>
                                  <div>
                                      <h4 className="font-black text-slate-900 uppercase text-xs mb-1">Issue: {ev.reason}</h4>
                                      <p className="text-sm font-bold text-slate-700 italic leading-relaxed">Suggestion: "{ev.suggestion}"</p>
                                  </div>
                              </div>
                              <div className="text-right shrink-0">
                                  <p className="text-[9px] font-black text-slate-400 uppercase">{ev.timestamp}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                      <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Impressions</p>
                      <h3 className="text-4xl font-black italic tracking-tighter tabular-nums">42,850</h3>
                      <div className="absolute right-[-10px] bottom-[-10px] opacity-10"><Activity size={100}/></div>
                  </div>
                  <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm flex flex-col justify-center">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Engagement Rate</p>
                      <h3 className="text-3xl font-black text-slate-900 tabular-nums">6.4%</h3>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden"><div className="h-full bg-indigo-600" style={{width: '64%'}}/></div>
                  </div>
                  <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm flex flex-col justify-center">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Lead Conversion</p>
                      <h3 className="text-3xl font-black text-emerald-600 tabular-nums">12 Units</h3>
                  </div>
              </div>
              <div className="bg-white rounded-[2rem] border border-slate-200 p-10 h-64 flex items-center justify-center text-slate-300 italic font-black uppercase text-[10px] tracking-widest">
                  <PieChart size={48} className="mr-4 opacity-10" /> Syncing Per-Platform Distribution Logic...
              </div>
          </div>
      )}

      {editingPost && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-6">
              <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full h-[85vh] overflow-hidden animate-scale-in flex flex-col">
                  <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0 border-b-8 border-indigo-600">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl">{getPlatformIcon(editingPost.platform)}</div>
                          <div>
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Refine Content.</h3>
                            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mt-1">Platform: {editingPost.platform}</p>
                          </div>
                      </div>
                      <button onClick={() => setEditingPost(null)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X size={28} /></button>
                  </div>
                  <div className="flex-1 flex overflow-hidden bg-slate-50">
                      <div className="flex-1 p-10 overflow-y-auto space-y-8 scrollbar-hide">
                          <div className="relative rounded-[2rem] overflow-hidden border-2 border-white shadow-xl h-64 bg-slate-900">
                              <img src={editingPost.imageUrl} className="w-full h-full object-cover opacity-80" />
                          </div>
                          <textarea value={editingPost.captionText} onChange={e => setEditingPost({...editingPost, captionText: e.target.value})} className="w-full p-8 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-700 h-64 shadow-inner outline-none focus:ring-2 focus:ring-indigo-600" />
                      </div>
                      <div className="w-80 bg-white border-l border-slate-100 p-8 flex flex-col">
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Compliance Check</h5>
                          <div className={`p-5 rounded-2xl border-2 mb-8 ${editingPost.complianceScore === 100 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                               <span className={`text-lg font-black ${editingPost.complianceScore === 100 ? 'text-emerald-600' : 'text-red-600'}`}>{editingPost.complianceScore}/100</span>
                               <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Audit Status: {editingPost.complianceScore === 100 ? 'PASS' : 'WARN'}</p>
                          </div>
                          <button onClick={handleSaveEdit} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl border-b-4 border-indigo-950 mt-auto">Save & Re-Audit</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {isGenerating && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xl z-[1000] flex items-center justify-center p-6 text-white">
              <div className="text-center space-y-8 animate-scale-in">
                  <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-600/30" />
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-400 border-t-transparent animate-spin" />
                    <Bot size={40} className="absolute inset-0 m-auto text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter">{genStatus}</h3>
              </div>
          </div>
      )}
    </div>
  );
};

const GraduationCap = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
);

export default SocialScheduler;
