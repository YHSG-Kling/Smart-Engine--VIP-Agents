
import React, { useState, useEffect } from 'react';
// Added Bot and Globe icons to lucide-react imports
import { 
  BookOpen, Search, Plus, Edit2, Trash2, Save, 
  BrainCircuit, MessageSquare, Check, RefreshCw,
  FileText, CheckCircle2, AlertTriangle, Clock, 
  Eye, ShieldCheck, X, Loader2, ChevronRight, User,
  Send, PlayCircle, Download, Monitor, Smartphone, Video,
  Sparkles, Filter, List, Trash, Bot, Globe
} from 'lucide-react';
import { airtableService, airtableMediaService } from '../../services/airtable';
import { Script, ScriptStatus, TargetPersona, VideoMode, UserRole, VideoAssetLibraryRecord, TransparencyVideo } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { n8nService } from '../../services/n8n';

const KnowledgeBase: React.FC = () => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'my' | 'pending' | 'approved' | 'transparency'>('my');
  const [scripts, setScripts] = useState<Script[]>([]);
  const [videoAssets, setVideoAssets] = useState<VideoAssetLibraryRecord[]>([]);
  const [transparencyVideos, setTransparencyVideos] = useState<TransparencyVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Transparency Filters
  const [stageFilter, setStageFilter] = useState('all');
  const [personaFilter, setPersonaFilter] = useState('all');
  const [activeOnly, setActiveOnly] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'preview' | 'reject' | 'player' | 'create_transparency'>('create');
  const [currentScript, setCurrentScript] = useState<Partial<Script>>({});
  const [currentVideoAsset, setCurrentVideoAsset] = useState<VideoAssetLibraryRecord | null>(null);
  const [currentTransparencyVideo, setCurrentTransparencyVideo] = useState<Partial<TransparencyVideo>>({});
  const [rejectionReason, setRejectionReason] = useState('');

  const canApproveScripts = role === UserRole.BROKER || role === UserRole.ADMIN;
  const isBrokerAdmin = role === UserRole.BROKER || role === UserRole.ADMIN;

  useEffect(() => {
    loadData();
  }, []);

  // Polling Logic for video generation status
  useEffect(() => {
    const hasGenerating = videoAssets.some(a => 
      a.status === 'Queued' || a.status === 'Generating'
    );
    
    if (hasGenerating) {
      const interval = setInterval(async () => {
        const assets = await airtableMediaService.getVideoAssets();
        setVideoAssets(assets || []);
      }, 10000); // 10 seconds
      return () => clearInterval(interval);
    }
  }, [videoAssets]);

  const loadData = async () => {
    setIsLoading(true);
    const [scriptsData, assetsData, transparencyData] = await Promise.all([
        airtableService.getScripts(),
        airtableMediaService.getVideoAssets(),
        airtableService.getTransparencyVideos()
    ]);
    setScripts(scriptsData);
    setVideoAssets(assetsData || []);
    setTransparencyVideos(transparencyData || []);
    setIsLoading(false);
  };

  const loadScripts = async () => {
    const data = await airtableService.getScripts();
    setScripts(data);
  };

  const loadTransparencyVideos = async () => {
    const data = await airtableService.getTransparencyVideos();
    setTransparencyVideos(data || []);
  };

  const handleOpenCreateModal = () => {
    setCurrentScript({
      title: '',
      body: '',
      targetPersona: 'Buyer',
      videoMode: 'Avatar',
      heygenAvatarId: '',
      heygenVoiceId: '',
      createdByUserId: user?.id || 'unknown'
    });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenCreateTransparencyModal = () => {
    setCurrentTransparencyVideo({
      title: '',
      description: '',
      stage: 'inspection',
      persona: 'buyer',
      defaultEnabled: true,
      durationSeconds: 0,
      videoUrl: '',
      thumbnailUrl: ''
    });
    setModalMode('create_transparency');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (script: Script) => {
    if (script.status !== 'Draft') return;
    setCurrentScript(script);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleOpenPreviewModal = (script: Script) => {
    setCurrentScript(script);
    setModalMode('preview');
    setIsModalOpen(true);
  };

  const handleOpenPlayerModal = (asset: VideoAssetLibraryRecord) => {
    setCurrentVideoAsset(asset);
    setModalMode('player');
    setIsModalOpen(true);
  };

  const handleOpenTransparencyPreview = (video: TransparencyVideo) => {
    // Reuse the player modal by wrapping the transparency video as an asset
    setCurrentVideoAsset({
      id: video.id,
      scriptId: video.scriptId || '',
      status: 'Ready',
      outputUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      durationSeconds: video.durationSeconds,
      createdAt: video.createdAt
    } as VideoAssetLibraryRecord);
    setModalMode('player');
    setIsModalOpen(true);
  };

  const handleOpenTransparencyPreviewById = (id: string) => {
    const video = transparencyVideos.find(v => v.id === id);
    if (video) handleOpenTransparencyPreview(video);
  };

  const handleOpenRejectModal = (script: Script) => {
    setCurrentScript(script);
    setRejectionReason('');
    setModalMode('reject');
    setIsModalOpen(true);
  };

  const handleSaveScript = async () => {
    if (!currentScript.title || !currentScript.body) return;
    setIsLoading(true);
    if (modalMode === 'create') {
      await airtableService.createScript(currentScript);
    } else {
      await airtableService.updateScript(currentScript.id!, currentScript);
    }
    await loadData();
    setIsModalOpen(false);
    setIsLoading(false);
  };

  const handleSaveTransparencyVideo = async (videoData: any) => {
    setIsLoading(true);
    await airtableService.createRecord('TransparencyVideo', videoData);
    await loadTransparencyVideos();
    setIsModalOpen(false);
    setIsLoading(false);
    alert('Transparency video successfully created and linked to stage logic.');
  };

  const handleSubmitForApproval = async (id: string) => {
    setIsLoading(true);
    await airtableService.updateScriptStatus(id, 'PendingApproval');
    await loadScripts();
    setIsLoading(false);
  };

  const handleApprove = async (id: string) => {
    setIsLoading(true);
    await airtableService.updateScriptStatus(id, 'Approved', user?.id);
    await loadScripts();
    setIsLoading(false);
    setIsModalOpen(false);
  };

  const handleReject = async () => {
    if (!rejectionReason) return;
    setIsLoading(true);
    await airtableService.updateScriptStatus(currentScript.id!, 'Rejected', user?.id, rejectionReason);
    await loadScripts();
    setIsLoading(false);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this script?")) {
      setIsLoading(true);
      await airtableService.deleteScript(id);
      await loadData();
      setIsLoading(false);
    }
  };

  const handleToggleTransparency = async (videoId: string, enabled: boolean) => {
    setIsLoading(true);
    await airtableService.updateRecord('TransparencyVideo', videoId, {
      'default_enabled': enabled
    });
    await loadTransparencyVideos();
    setIsLoading(false);
  };

  const handleGenerateVideo = async (script: Script) => {
    try {
        const res = await airtableMediaService.createVideoAsset({
            scriptId: script.id,
            persona: script.targetPersona,
            stage: 'manual_generation'
        });
        
        if (res?.records?.[0]?.id) {
            const assetId = res.records[0].id;
            await n8nService.triggerScriptApprovedToVideo(script.id, assetId);
            
            // Refresh to show Queued state
            const assets = await airtableMediaService.getVideoAssets();
            setVideoAssets(assets || []);
            
            alert("Video generation started. This may take 2-5 minutes.");
        }
    } catch (e) {
        console.error(e);
        alert("Failed to start video generation.");
    }
  };

  const filteredScripts = scripts.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.body.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'my') return s.createdByUserId === user?.id && matchesSearch;
    if (activeTab === 'pending') return s.status === 'PendingApproval' && matchesSearch;
    if (activeTab === 'approved') return s.status === 'Approved' && matchesSearch;
    return matchesSearch;
  });

  const filteredTransparencyVideos = transparencyVideos.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || (v.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'all' || v.stage === stageFilter;
    const matchesPersona = personaFilter === 'all' || v.persona === personaFilter || v.persona === 'both';
    const matchesActive = !activeOnly || v.defaultEnabled;
    return matchesSearch && matchesStage && matchesPersona && matchesActive;
  });

  const getStatusBadge = (status: ScriptStatus) => {
    switch (status) {
      case 'Draft': return <span className="px-2 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase border border-slate-200">Draft</span>;
      case 'PendingApproval': return <span className="px-2 py-1 rounded text-[10px] font-bold bg-yellow-50 text-yellow-700 uppercase border border-yellow-200">Pending Approval</span>;
      case 'Approved': return <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 uppercase border border-emerald-200">Approved</span>;
      case 'Rejected': return <span className="px-2 py-1 rounded text-[10px] font-bold bg-red-50 text-red-700 uppercase border border-red-200">Rejected</span>;
      default: return null;
    }
  };

  const getVideoStatusBadge = (scriptId: string) => {
    const asset = videoAssets.find(a => a.scriptId === scriptId);
    if (!asset) return <span className="px-2 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-400 uppercase border border-slate-200">No Video</span>;

    switch (asset.status) {
      case 'Queued': 
        return (
          <span className="px-2 py-1 rounded text-[10px] font-bold bg-blue-50 text-blue-600 uppercase border border-blue-200 flex items-center gap-1.5">
            <Loader2 size={10} className="animate-spin" /> Queued
          </span>
        );
      case 'Generating': 
        return (
          <span className="px-2 py-1 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase border border-blue-300 flex items-center gap-1.5">
            <RefreshCw size={10} className="animate-spin" /> Generating...
          </span>
        );
      case 'Ready': 
        return (
          <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 uppercase border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 size={10} /> Ready
          </span>
        );
      case 'Failed': 
        return (
          <span className="px-2 py-1 rounded text-[10px] font-bold bg-red-50 text-red-700 uppercase border border-red-200 flex items-center gap-1">
            <AlertTriangle size={10} /> Failed
          </span>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 uppercase italic tracking-tighter">Knowledge Base.</h2>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">Scripts, Transparency Videos & Training Assets</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={loadData}
            disabled={isLoading}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-700 shadow-sm transition-all"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
          </button>
          {activeTab === 'transparency' ? (
             <button 
                onClick={handleOpenCreateTransparencyModal}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 flex items-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <Plus size={18} /> New Transparency Video
              </button>
          ) : (
            <button 
              onClick={handleOpenCreateModal}
              className="bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-800 flex items-center gap-2 shadow-lg active:scale-95 transition-all"
            >
              <Plus size={18} /> New Script
            </button>
          )}
        </div>
      </div>

      <div className="flex bg-white rounded-xl p-1 border border-slate-200 w-fit shadow-sm mb-6 overflow-x-auto max-w-full">
        <button 
          onClick={() => setActiveTab('my')}
          className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'my' ? 'bg-blue-700 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <User size={14} /> My Scripts
        </button>
        {canApproveScripts && (
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'pending' ? 'bg-blue-700 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <ShieldCheck size={14} /> Pending Approval
          </button>
        )}
        <button 
          onClick={() => setActiveTab('approved')}
          className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'approved' ? 'bg-blue-700 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <CheckCircle2 size={14} /> Approved Scripts
        </button>
        {isBrokerAdmin && (
          <button 
            onClick={() => setActiveTab('transparency')}
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'transparency' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Video size={14} /> Transparency Videos
          </button>
        )}
      </div>

      {activeTab === 'transparency' ? (
        <div className="space-y-6 animate-fade-in">
           {/* Transparency Filters */}
           <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="Search video library..." 
                    className="w-full pl-10 pr-4 py-2 border border-slate-100 bg-slate-50 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <select
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-100 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none"
                >
                    <option value="all">All Stages</option>
                    <option value="lead">Lead</option>
                    <option value="qualifying">Qualifying</option>
                    <option value="active">Active</option>
                    <option value="inspection">Inspection</option>
                    <option value="appraisal">Appraisal</option>
                    <option value="under_contract">Under Contract</option>
                    <option value="closing">Closing</option>
                    <option value="post_close">Post-Close</option>
                </select>
                
                <select
                    value={personaFilter}
                    onChange={(e) => setPersonaFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-100 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none"
                >
                    <option value="all">All Personas</option>
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="both">Both</option>
                </select>
                
                <label className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={activeOnly}
                        onChange={(e) => setActiveOnly(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Only</span>
                </label>
              </div>
           </div>

           {/* Transparency List */}
           <div className="grid grid-cols-1 gap-4">
              {filteredTransparencyVideos.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                    <Video size={48} className="mx-auto text-slate-100 mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No transparency videos found matching filters.</p>
                </div>
              ) : (
                filteredTransparencyVideos.map(video => (
                    <div key={video.id} className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm hover:border-indigo-400 transition-all group flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6 flex-1 min-w-0">
                            <div className="w-16 h-16 rounded-2xl bg-slate-900 overflow-hidden relative group/play cursor-pointer shrink-0" onClick={() => handleOpenTransparencyPreview(video)}>
                                <img src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200'} className="w-full h-full object-cover opacity-60 group-hover/play:scale-110 transition-transform" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <PlayCircle size={24} className="text-white fill-white/20"/>
                                </div>
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg italic leading-none">{video.title}</h3>
                                    {video.defaultEnabled ? (
                                        <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest">Active</span>
                                    ) : (
                                        <span className="bg-slate-50 text-slate-500 text-[8px] font-black px-2 py-0.5 rounded-full border border-slate-200 uppercase tracking-widest">Disabled</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    <span className="flex items-center gap-1"><RefreshCw size={10} className="text-indigo-500"/> {video.stage.replace('_', ' ')}</span>
                                    <span className="flex items-center gap-1"><User size={10} className="text-indigo-500"/> {video.persona}</span>
                                    <span className="flex items-center gap-1"><Clock size={10} className="text-indigo-500"/> {video.durationSeconds}s</span>
                                    <span className="flex items-center gap-1"><Eye size={10} className="text-indigo-500"/> {video.viewCount} views</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                            <button 
                                onClick={() => handleOpenTransparencyPreview(video)}
                                className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-sm"
                            >
                                Preview
                            </button>
                            <button 
                                onClick={() => {/* Handle Edit */}}
                                className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-sm"
                            >
                                Edit
                            </button>
                            {video.defaultEnabled ? (
                                <button 
                                    onClick={() => handleToggleTransparency(video.id, false)}
                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100"
                                >
                                    Disable
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleToggleTransparency(video.id, true)}
                                    className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
                                >
                                    Enable
                                </button>
                            )}
                            {video.scriptId && (
                                <button 
                                    onClick={() => { setActiveTab('approved'); setSearchQuery(video.title); }}
                                    className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                                    title="View Linked Script"
                                >
                                    <FileText size={18}/>
                                </button>
                            )}
                        </div>
                    </div>
                ))
              )}
           </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search library..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {filteredScripts.length} Results
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <tr>
                  <th className="p-6">Script Title</th>
                  <th className="p-6">Target</th>
                  <th className="p-6">Status</th>
                  {activeTab === 'approved' && <th className="p-6">Video Status</th>}
                  <th className="p-6">Date</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredScripts.map(script => {
                  const videoAsset = videoAssets.find(a => a.scriptId === script.id);
                  return (
                    <tr key={script.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-6">
                        <div className="font-bold text-slate-800 text-sm">{script.title}</div>
                        <div className="text-xs text-slate-400 mt-1 line-clamp-1 italic">{script.body}</div>
                      </td>
                      <td className="p-6">
                        <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded font-black uppercase border border-blue-100">{script.targetPersona}</span>
                      </td>
                      <td className="p-6">
                        {getStatusBadge(script.status)}
                      </td>
                      {activeTab === 'approved' && (
                          <td className="p-6">
                              {getVideoStatusBadge(script.id)}
                          </td>
                      )}
                      <td className="p-6">
                        <div className="text-xs text-slate-500 font-bold uppercase">{new Date(script.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenPreviewModal(script)}
                            className="p-2 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all"
                            title="Preview Script"
                          >
                            <FileText size={18} />
                          </button>

                          {activeTab === 'approved' && (
                              <>
                                  {(!videoAsset || videoAsset.status === 'Failed') && (
                                      <button 
                                          onClick={() => handleGenerateVideo(script)}
                                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                          title={videoAsset?.status === 'Failed' ? "Retry Generation" : "Generate Video"}
                                      >
                                          <PlayCircle size={18} />
                                      </button>
                                  )}
                                  {videoAsset?.status === 'Ready' && (
                                      <button 
                                          onClick={() => handleOpenPlayerModal(videoAsset)}
                                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                          title="Play Video"
                                      >
                                          <PlayCircle size={18} fill="currentColor" fillOpacity={0.1} />
                                      </button>
                                  )}
                              </>
                          )}
                          
                          {activeTab === 'my' && script.status === 'Draft' && (
                            <>
                              <button 
                                onClick={() => handleOpenEditModal(script)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                title="Edit"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={() => handleSubmitForApproval(script.id)}
                                className="p-2 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all"
                                title="Submit for Approval"
                              >
                                <Send size={18} />
                              </button>
                              <button 
                                onClick={() => handleDelete(script.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}

                          {activeTab === 'pending' && canApproveScripts && (
                            <>
                              <button 
                                onClick={() => handleApprove(script.id)}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                title="Approve"
                              >
                                <CheckCircle2 size={18} />
                              </button>
                              <button 
                                onClick={() => handleOpenRejectModal(script)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                title="Reject"
                              >
                                <X size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredScripts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-20 text-center text-slate-300 italic font-bold uppercase text-sm">
                      No scripts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SCRIPT EDITOR MODAL */}
      {isModalOpen && (modalMode === 'create' || modalMode === 'edit') && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0 border-b-8 border-blue-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-xl"><FileText size={24}/></div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight italic">{modalMode === 'create' ? 'Create' : 'Edit'} Script</h3>
                  <p className="text-blue-400 font-bold text-[10px] uppercase tracking-widest mt-1">Compliance Ready Architecture</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X size={20}/></button>
            </div>
            
            <div className="p-10 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Script Title</label>
                  <input 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-700 outline-none transition-all" 
                    value={currentScript.title}
                    onChange={e => setCurrentScript({...currentScript, title: e.target.value})}
                    placeholder="Enter script title..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Target Persona</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none cursor-pointer"
                    value={currentScript.targetPersona}
                    onChange={e => setCurrentScript({...currentScript, targetPersona: e.target.value as TargetPersona})}
                  >
                    <option value="Agent">Agent</option>
                    <option value="Buyer">Buyer</option>
                    <option value="Seller">Seller</option>
                    <option value="PastClient">Past Client</option>
                    <option value="Partner">Partner</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Script Body</label>
                <textarea 
                  className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] font-medium text-sm focus:ring-2 focus:ring-blue-700 outline-none h-48 resize-none shadow-inner" 
                  value={currentScript.body}
                  onChange={e => setCurrentScript({...currentScript, body: e.target.value})}
                  placeholder="Write your high-impact script here..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Video Mode</label>
                  <div className="flex bg-slate-100 p-1 rounded-2xl">
                    <button 
                      onClick={() => setCurrentScript({...currentScript, videoMode: 'Avatar'})}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${currentScript.videoMode === 'Avatar' ? 'bg-white shadow-md text-blue-700' : 'text-slate-50'}`}
                    >
                      Avatar
                    </button>
                    <button 
                      onClick={() => setCurrentScript({...currentScript, videoMode: 'Faceless'})}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${currentScript.videoMode === 'Faceless' ? 'bg-white shadow-md text-blue-700' : 'text-slate-50'}`}
                    >
                      Faceless
                    </button>
                  </div>
                </div>
                {currentScript.videoMode === 'Avatar' && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Custom HeyGen IDs (Optional)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold" 
                        value={currentScript.heygenAvatarId}
                        onChange={e => setCurrentScript({...currentScript, heygenAvatarId: e.target.value})}
                        placeholder="Avatar ID"
                      />
                      <input 
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold" 
                        value={currentScript.heygenVoiceId}
                        onChange={e => setCurrentScript({...currentScript, heygenVoiceId: e.target.value})}
                        placeholder="Voice ID"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveScript}
                  disabled={!currentScript.title || !currentScript.body}
                  className="flex-[2] bg-blue-700 text-white py-4 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-blue-800 transition-all active:scale-95 border-b-4 border-blue-900 disabled:opacity-50"
                >
                  Save as Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TRANSPARENCY VIDEO MODAL */}
      {isModalOpen && modalMode === 'create_transparency' && (
        <CreateTransparencyVideoModal 
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveTransparencyVideo}
            scripts={scripts.filter(s => s.status === 'Approved')}
        />
      )}

      {/* REJECTION MODAL */}
      {isModalOpen && modalMode === 'reject' && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl border border-slate-200">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-red-600 mb-4">Reject Script</h3>
            <p className="text-sm text-slate-500 mb-6 font-bold uppercase tracking-widest">State the compliance or quality issue:</p>
            <textarea 
              className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-sm focus:ring-2 focus:ring-red-600 outline-none h-32 resize-none mb-8"
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="e.g. Fair Housing violation on line 3..."
            />
            <div className="flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 text-[10px] font-black uppercase text-slate-400">Cancel</button>
              <button 
                onClick={handleReject}
                disabled={!rejectionReason}
                className="flex-[2] bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all border-b-4 border-red-900 disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {isModalOpen && modalMode === 'preview' && currentScript && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0 border-b-8 border-blue-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-xl"><Eye size={24}/></div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight italic">{currentScript.title}</h3>
                  <p className="text-blue-400 font-bold text-[10px] uppercase tracking-widest mt-1">Script Preview & Audit</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X size={20}/></button>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="bg-slate-50 p-8 rounded-[2rem] shadow-inner">
                <p className="text-lg font-medium text-slate-700 leading-relaxed italic">
                  "{currentScript.body}"
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Target</p>
                   <p className="text-xs font-black text-blue-700 uppercase">{currentScript.targetPersona}</p>
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mode</p>
                   <p className="text-xs font-black text-indigo-700 uppercase">{currentScript.videoMode}</p>
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                   <div className="flex justify-center">{getStatusBadge(currentScript.status as ScriptStatus)}</div>
                </div>
              </div>

              {currentScript.status === 'Rejected' && (
                <div className="bg-red-50 border-2 border-red-100 p-6 rounded-3xl animate-fade-in flex items-start gap-4">
                  <AlertTriangle className="text-red-600 shrink-0" size={24} />
                  <div>
                    <p className="text-red-900 font-black uppercase text-[10px] tracking-widest mb-1">Rejection Reason</p>
                    <p className="text-red-700 text-sm font-bold italic leading-relaxed">"{currentScript.rejectedReason}"</p>
                  </div>
                </div>
              )}

              {canApproveScripts && currentScript.status === 'PendingApproval' ? (
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleOpenRejectModal(currentScript as Script)}
                    className="flex-1 py-4 bg-white border-2 border-red-100 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-50 transition-all active:scale-95"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleApprove(currentScript.id!)}
                    className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-emerald-700 transition-all active:scale-95 border-b-4 border-emerald-900"
                  >
                    Approve Script
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all"
                >
                  Close Preview
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIDEO PLAYER MODAL */}
      {isModalOpen && modalMode === 'player' && currentVideoAsset && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/70 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row">
            <div className="flex-1 bg-slate-900 relative flex items-center justify-center min-h-[400px]">
                <video 
                    controls 
                    className="w-full h-full max-h-[70vh] object-contain" 
                    src={currentVideoAsset.outputUrl}
                    poster={currentVideoAsset.thumbnailUrl}
                />
                <button onClick={() => setIsModalOpen(false)} className="absolute top-6 left-6 p-3 bg-black/40 text-white rounded-full hover:bg-black/60 transition-all z-10"><X size={20}/></button>
            </div>
            <div className="w-full md:w-80 p-8 flex flex-col shrink-0 bg-white">
                <div className="flex-1 space-y-8">
                    <div>
                        <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-indigo-100">Video Asset</span>
                        <h3 className="text-xl font-black text-slate-900 mt-2 uppercase tracking-tight italic">
                            {scripts.find(s => s.id === currentVideoAsset.scriptId)?.title || 'Untitled Video'}
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs font-bold border-b border-slate-50 pb-3">
                            <span className="text-slate-400 uppercase tracking-widest">Duration</span>
                            <span className="text-slate-800 tabular-nums">{currentVideoAsset.durationSeconds || '--'}s</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold border-b border-slate-50 pb-3">
                            <span className="text-slate-400 uppercase tracking-widest">Persona</span>
                            <span className="text-indigo-600 uppercase italic">{currentVideoAsset.persona || 'Agent'}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold border-b border-slate-50 pb-3">
                            <span className="text-slate-400 uppercase tracking-widest">Targets</span>
                            <div className="flex gap-1.5">
                                {currentVideoAsset.deliveryChannelTargets?.map(t => (
                                    <span key={t} className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[8px] font-black uppercase">{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl shadow-inner">
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <Sparkles size={12}/> AI Insight
                        </p>
                        <p className="text-[11px] text-indigo-900 leading-relaxed italic font-medium">
                            "This video is optimized for {currentVideoAsset.persona} engagement with calibrated high-velocity delivery."
                        </p>
                    </div>
                </div>

                <div className="mt-8 space-y-3">
                    <button className="w-full bg-blue-700 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-blue-800 active:scale-95 transition-all flex items-center justify-center gap-2 border-b-4 border-blue-900">
                        <Send size={16}/> Push to Campaign
                    </button>
                    <button className="w-full bg-slate-900 text-white py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg">
                        <Download size={16}/> Download MP4
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUBCOMPONENTS ---

function CreateTransparencyVideoModal({ onClose, onSave, scripts }: { onClose: () => void, onSave: (data: any) => Promise<void>, scripts: Script[] }) {
  const [stage, setStage] = useState('inspection');
  const [persona, setPersona] = useState<'buyer' | 'seller' | 'both'>('buyer');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoSource, setVideoSource] = useState<'script' | 'url'>('script');
  const [selectedScriptId, setSelectedScriptId] = useState('');
  const [directUrl, setDirectUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [defaultEnabled, setDefaultEnabled] = useState(true);
  
  const handleSave = async () => {
    let videoData: any = {
      'stage': stage,
      'persona': persona,
      'title': title,
      'description': description,
      'default_enabled': defaultEnabled,
      'view_count': 0
    };
    
    if (videoSource === 'script' && selectedScriptId) {
      videoData['script_id'] = [selectedScriptId];
      // Note: In a real app, we'd fetch the specific VideoAssetLibrary record here
      videoData['video_url'] = 'https://assets.nexus.com/v/placeholder.mp4';
      videoData['duration_seconds'] = 60;
    } else if (videoSource === 'url') {
      videoData['video_url'] = directUrl;
      videoData['thumbnail_url'] = thumbnailUrl;
      videoData['duration_seconds'] = parseInt(duration) || 0;
    }
    
    await onSave(videoData);
  };
  
  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-[1000] p-6 animate-fade-in">
      <div className="bg-white rounded-[2.5rem] p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 scrollbar-hide">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">New Transparency Asset.</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Automated Client Education Module</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100">
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Target Stage</label>
                <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none cursor-pointer focus:ring-2 focus:ring-indigo-600 transition-all"
                >
                <option value="lead">Lead</option>
                <option value="qualifying">Qualifying</option>
                <option value="active">Active</option>
                <option value="inspection">Inspection</option>
                <option value="appraisal">Appraisal</option>
                <option value="under_contract">Under Contract</option>
                <option value="closing">Closing</option>
                <option value="post_close">Post-Close</option>
                </select>
            </div>
            
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Recipient Persona</label>
                <select
                value={persona}
                onChange={(e) => setPersona(e.target.value as any)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none cursor-pointer focus:ring-2 focus:ring-indigo-600 transition-all"
                >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="both">Both</option>
                </select>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Public Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
              placeholder="e.g. What Happens During the Home Inspection"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Admin Internal Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-sm focus:ring-2 focus:ring-indigo-600 outline-none h-24 resize-none shadow-inner"
              placeholder="Brief summary of video coverage..."
            />
          </div>
          
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Video Fulfillment Strategy</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setVideoSource('script')}
                className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${videoSource === 'script' ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
              >
                <Bot size={24}/>
                <span className="text-[10px] font-black uppercase tracking-widest">Link Approved Script</span>
              </button>
              
              <button
                type="button"
                onClick={() => setVideoSource('url')}
                className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${videoSource === 'url' ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
              >
                <Globe size={24}/>
                <span className="text-[10px] font-black uppercase tracking-widest">Direct CDN / URL</span>
              </button>
            </div>
            
            <div className="animate-fade-in pt-2">
                {videoSource === 'script' ? (
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block px-1">Select Script (V2 Production)</label>
                        <div className="relative">
                            <select
                                value={selectedScriptId}
                                onChange={(e) => setSelectedScriptId(e.target.value)}
                                className="w-full p-4 pl-12 bg-slate-50 border border-indigo-100 rounded-2xl font-bold outline-none appearance-none cursor-pointer"
                            >
                                <option value="">Select a verified script...</option>
                                {scripts.map(script => (
                                    <option key={script.id} value={script.id}>
                                    {script.title}
                                    </option>
                                ))}
                            </select>
                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18}/>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
                                <ChevronRight className="rotate-90" size={16}/>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Video Stream URL</label>
                            <input
                                type="url"
                                value={directUrl}
                                onChange={(e) => setDirectUrl(e.target.value)}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                                placeholder="https://storage.nexus.com/v/..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Thumbnail</label>
                                <input
                                    type="url"
                                    value={thumbnailUrl}
                                    onChange={(e) => setThumbnailUrl(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Length (Sec)</label>
                                <input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                                    placeholder="60"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
          </div>
          
          <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${defaultEnabled ? 'bg-indigo-600 border-indigo-700 shadow-lg text-white' : 'bg-white border-slate-200 text-slate-300'}`}>
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <p className="font-black text-[10px] text-indigo-900 uppercase tracking-tight">Auto-Attach Active</p>
                        <p className="text-[8px] text-indigo-400 font-bold uppercase tracking-widest">Attach to Transparency Feed</p>
                    </div>
                </div>
                <button 
                    onClick={() => setDefaultEnabled(!defaultEnabled)}
                    className={`w-12 h-6 rounded-full transition-all relative ${defaultEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${defaultEnabled ? 'left-7' : 'left-1'}`} />
                </button>
            </div>
            <p className="text-[9px] text-indigo-600 leading-relaxed font-bold italic">
                When active, this video is automatically synthesized into the "What's Happening Now" updates for the {stage} phase.
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 mt-10">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
          >
            Abort
          </button>
          <button
            onClick={handleSave}
            disabled={!title || (videoSource === 'script' && !selectedScriptId) || (videoSource === 'url' && !directUrl)}
            className="flex-[2] bg-indigo-600 text-white py-4 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-indigo-700 disabled:opacity-50 transition-all border-b-4 border-indigo-900 active:scale-95"
          >
            Commit Video to Library
          </button>
        </div>
      </div>
    </div>
  );
}

export default KnowledgeBase;
