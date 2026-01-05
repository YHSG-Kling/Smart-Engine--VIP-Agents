
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, Flame, Clock, 
  MessageCircle, Phone, Mail, 
  ChevronRight, BrainCircuit, Sparkles, RefreshCw,
  Zap, CheckCircle2, AlertCircle, Plus, X, ArrowRightLeft, UserPlus,
  Linkedin, ShieldCheck, Database, Globe, Download, Loader2, Building2, TrendingUp, Wallet, ArrowRight, Home,
  HeartPulse, Briefcase, Tag, Target, DollarSign, ThumbsDown, MessageSquare, ExternalLink, Bot, MousePointerClick, User, Info, Send,
  Facebook, Instagram, Megaphone, Check, XCircle, Gauge, Calendar, Landmark,
  FileText, Activity, Layout, Key, Gift, Cake, Award, PartyPopper, Ban, Wand2,
  MapPin, Ticket, Droplets, ChevronDown, Video, Building
} from 'lucide-react';
import { Lead, PastClient, RelationshipPlan, PlanTask, CreditConversationLog, CreditPartnerReferral, VideoEngagementEvent, UserRole } from '../../types';
import { airtableService } from '../../services/airtable';
import { n8nService } from '../../services/n8n';
import { useAuth } from '../../contexts/AuthContext';

// --- CHILD COMPONENTS (PANELS) ---

const CreditStatusPanel: React.FC<{ leadId: string }> = ({ leadId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [lead, setLead] = useState<Lead | null>(null);
  const [creditLog, setCreditLog] = useState<CreditConversationLog[]>([]);
  const [referral, setReferral] = useState<CreditPartnerReferral | null>(null);
  
  useEffect(() => {
    if (isExpanded) {
      loadCreditData();
    }
  }, [isExpanded, leadId]);
  
  const loadCreditData = async () => {
    const leads = await airtableService.getLeads();
    const currentLead = leads?.find(l => l.id === leadId);
    if (currentLead) setLead(currentLead);
    
    const logs = await airtableService.getCreditConversationLog();
    setCreditLog(logs.filter(l => l.contactId === leadId));
    
    const referrals = await airtableService.getCreditPartnerReferrals();
    const activeReferral = referrals.find(r => r.contactId === leadId && r.status !== 'completed');
    if (activeReferral) setReferral(activeReferral);
  };
  
  const startCreditPath = async () => {
    await n8nService.triggerWorkflow('wf-credit-intake', { contactId: leadId });
    alert('Credit assessment started');
    await loadCreditData();
  };
  
  const referToPartner = async () => {
    await n8nService.triggerWorkflow('wf-credit-refer', { contactId: leadId });
    alert('Referred to credit partner');
    await loadCreditData();
  };
  
  if (!lead || (lead.creditStatus === 'good' || lead.creditStatus === 'unknown' || !lead.creditStatus)) {
    return null;
  }
  
  return (
    <div className="border-t border-slate-200 mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <span className="font-semibold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-widest">
          <TrendingUp size={18} className="text-orange-600" />
          Credit Status
          {lead.creditPipelineStage !== 'none' && lead.creditPipelineStage && (
            <span className="text-[9px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-black uppercase">
              Active
            </span>
          )}
        </span>
        <ChevronDown 
          size={18} 
          className={`transform transition-transform text-slate-400 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      
      {isExpanded && (
        <div className="px-4 py-4 bg-slate-50">
          <div className="bg-white rounded-xl p-4 mb-4 border border-slate-200 shadow-sm">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 font-black uppercase text-[8px] tracking-widest mb-1">Status</p>
                <p className="font-bold text-slate-700 capitalize">
                  {lead.creditStatus}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-black uppercase text-[8px] tracking-widest mb-1">Score Band</p>
                <p className="font-bold text-slate-700">
                  {lead.creditScoreBand || 'Not assessed'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-black uppercase text-[8px] tracking-widest mb-1">Pipeline Stage</p>
                <p className="font-bold text-slate-700 capitalize">
                  {lead.creditPipelineStage?.replace('_', ' ') || 'None'}
                </p>
              </div>
              {referral && (
                <div>
                  <p className="text-slate-400 font-black uppercase text-[8px] tracking-widest mb-1">Partner Status</p>
                  <p className="font-bold text-slate-700 capitalize">
                    {referral.status}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            {(lead.creditPipelineStage === 'none' || !lead.creditPipelineStage) && (
              <button
                onClick={startCreditPath}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-700 transition-all shadow-md"
              >
                Start Credit Path
              </button>
            )}
            
            {lead.creditPipelineStage === 'intake' && (
              <button
                onClick={referToPartner}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all shadow-md"
              >
                Refer to Credit Partner
              </button>
            )}
          </div>
          
          {creditLog.length > 0 && (
            <div className="mt-4">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Recent Activity</p>
              <div className="space-y-2">
                {creditLog.slice(0, 3).map(log => (
                  <div key={log.id} className="text-[10px] bg-white rounded-lg p-3 border border-slate-100 shadow-sm">
                    <p className="text-slate-700 font-medium leading-relaxed italic">"{log.summary}"</p>
                    <p className="text-slate-300 font-black uppercase text-[7px] mt-2 tracking-widest">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const VideoEngagementPanel: React.FC<{ leadId: string }> = ({ leadId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [lead, setLead] = useState<Lead | null>(null);
  const [engagementEvents, setEngagementEvents] = useState<VideoEngagementEvent[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  
  useEffect(() => {
    if (isExpanded) {
      loadVideoData();
    }
  }, [isExpanded, leadId]);
  
  const loadVideoData = async () => {
    const leads = await airtableService.getLeads();
    const currentLead = leads?.find(l => l.id === leadId);
    if (currentLead) setLead(currentLead);
    
    const events = await airtableService.getVideoEngagementByContactId(leadId);
    setEngagementEvents(events);
    
    const allVideos = await airtableService.getVideoAssets();
    const watchedVideoIds = [...new Set(events.map(e => e.videoAssetId))];
    const watchedVideos = allVideos.filter(v => watchedVideoIds.includes(v.id));
    setVideos(watchedVideos);
  };
  
  return (
    <div className="border-t border-slate-200 mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <span className="font-semibold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-widest">
          <Video size={18} className="text-purple-600" />
          Video Engagement
          {(lead?.videoEngagementScore || 0) > 0 && (
            <span className="text-[9px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-black uppercase">
              Score: {lead?.videoEngagementScore}
            </span>
          )}
        </span>
        <ChevronDown 
          size={18} 
          className={`transform transition-transform text-slate-400 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      
      {isExpanded && (
        <div className="px-4 py-4 bg-slate-50">
          {engagementEvents.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-slate-200">
              <Video size={32} className="mx-auto text-slate-200 mb-2" />
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">
                No video engagement yet.
              </p>
              <button
                className="bg-purple-600 text-white px-6 py-2 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-md hover:bg-purple-700 transition-all active:scale-95"
              >
                Send Video Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Sent</p>
                    <p className="font-black text-lg text-slate-800 tabular-nums">{videos.length}</p>
                  </div>
                  <div className="border-x border-slate-100">
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Views</p>
                    <p className="font-black text-lg text-slate-800 tabular-nums">
                      {engagementEvents.filter(e => e.eventType === 'viewed').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Comp.</p>
                    <p className="font-black text-lg text-emerald-600 tabular-nums">
                      {engagementEvents.filter(e => e.eventType === 'completed').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Engagement History</p>
              <div className="space-y-2">
                {videos.slice(0, 5).map(video => {
                  const videoEvents = engagementEvents.filter(e => e.videoAssetId === video.id);
                  const lastEvent = videoEvents[videoEvents.length - 1];
                  
                  return (
                    <div key={video.id} className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm flex items-center justify-between group hover:border-purple-300 transition-all">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight truncate leading-none">
                          {video.persona} - {video.stage || 'General'}
                        </p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                          {videoEvents.length} view{videoEvents.length !== 1 ? 's' : ''}
                          {lastEvent && ` • ${new Date(lastEvent.createdAt).toLocaleDateString()}`}
                        </p>
                      </div>
                      {lastEvent?.eventType === 'completed' && (
                        <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg shadow-sm">
                           <Check size={14} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <button
                className="w-full mt-2 py-3 bg-slate-100 text-slate-500 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-slate-200 transition-all active:scale-95"
              >
                Send Discovery Video
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const QuickActionsPanel: React.FC<{ leadId: string, onNavigate?: (view: string) => void }> = ({ leadId, onNavigate }) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [lead, setLead] = useState<Lead | null>(null);
  
  useEffect(() => {
    if (isExpanded) {
      loadLead();
    }
  }, [isExpanded, leadId]);
  
  const loadLead = async () => {
    const leads = await airtableService.getLeads();
    const match = leads?.find(l => l.id === leadId);
    if (match) setLead(match);
  };
  
  const handleAction = async (action: string) => {
    if (!lead) return;
    switch (action) {
      case 'newsletter':
        if (onNavigate) onNavigate('marketing');
        alert(`Initializing newsletter for ${lead.name}`);
        break;
        
      case 'directMail':
        if (onNavigate) onNavigate('marketing');
        alert(`Initializing direct mail piece for ${lead.name}`);
        break;
        
      case 'enrichProperty':
        await n8nService.triggerPropertyEnrichment(leadId, lead.propertyAddress || '');
        alert('BatchData enrichment triggered');
        break;
        
      case 'referLender':
        await n8nService.triggerLenderReferral(
          leadId,
          lead.name,
          lead.email || '',
          lead.budget || 0,
          'Manual trigger from lead card'
        );
        alert('Lender intro dispatched');
        break;
        
      case 'startDrip':
        const type = lead.intent === 'Seller' ? 'Seller' : 'Buyer';
        await n8nService.startSmartDrip(leadId, type, user?.id || 'agent_1');
        alert(`WF-SMART-DRIP: ${type} sequence initiated`);
        break;
        
      default:
        break;
    }
  };
  
  return (
    <div className="border-t border-slate-200 mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <span className="font-semibold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-widest">
          <Zap size={18} className="text-yellow-500" />
          Quick Actions
        </span>
        <ChevronDown 
          size={18} 
          className={`transform transition-transform text-slate-400 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      
      {isExpanded && (
        <div className="px-4 py-4 bg-slate-50">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAction('newsletter')}
              className="px-4 py-3 bg-white border border-slate-200 rounded-2xl hover:border-indigo-400 text-[10px] font-black uppercase text-slate-700 flex items-center gap-3 shadow-sm transition-all active:scale-95 group"
            >
              <Mail size={16} className="text-indigo-600 group-hover:scale-110 transition-transform" />
              Newsletter
            </button>
            
            <button
              onClick={() => handleAction('directMail')}
              className="px-4 py-3 bg-white border border-slate-200 rounded-2xl hover:border-purple-400 text-[10px] font-black uppercase text-slate-700 flex items-center gap-3 shadow-sm transition-all active:scale-95 group"
            >
              <Ticket size={16} className="text-purple-600 group-hover:scale-110 transition-transform" />
              Direct Mail
            </button>
            
            <button
              onClick={() => handleAction('startDrip')}
              className="px-4 py-3 bg-white border border-slate-200 rounded-2xl hover:border-emerald-400 text-[10px] font-black uppercase text-slate-700 flex items-center gap-3 shadow-sm transition-all active:scale-95 group"
            >
              <Droplets size={16} className="text-emerald-600 group-hover:scale-110 transition-transform" />
              Smart Drip
            </button>
            
            <button
              onClick={() => handleAction('enrichProperty')}
              className="px-4 py-3 bg-white border border-slate-200 rounded-2xl hover:border-blue-400 text-[10px] font-black uppercase text-slate-700 flex items-center gap-3 shadow-sm transition-all active:scale-95 group"
            >
              <Database size={16} className="text-blue-600 group-hover:scale-110 transition-transform" />
              Enrich Data
            </button>
            
            <button
              onClick={() => handleAction('referLender')}
              className="px-4 py-3 bg-white border border-slate-200 rounded-2xl hover:border-indigo-600 text-[10px] font-black uppercase text-slate-700 flex items-center gap-3 col-span-2 shadow-sm transition-all active:scale-95 group"
            >
              <Building size={16} className="text-indigo-600 group-hover:scale-110 transition-transform" />
              Bridge to Lending Partner
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const CopilotPlanPanel: React.FC<{ leadId: string }> = ({ leadId }) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [plan, setPlan] = useState<RelationshipPlan | null>(null);
  const [tasks, setTasks] = useState<PlanTask[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    if (isExpanded && !plan) {
      loadPlan();
    }
  }, [isExpanded, leadId]);
  
  const loadPlan = async () => {
    const plans = await airtableService.getPlanByContactId(leadId);
    if (plans.length > 0) {
      setPlan(plans[0]);
      const planTasks = await airtableService.getTasksByPlanId(plans[0].id);
      setTasks(planTasks.filter(t => t.roleView === 'agent'));
    }
  };
  
  const generatePlan = async () => {
    setIsGenerating(true);
    const result = await n8nService.generateCopilotPlan(leadId, user?.id || 'agent_1');
    if (result.success) {
      await loadPlan();
      alert('7-day plan generated successfully!');
    } else {
      alert('Failed to generate plan. Please try again.');
    }
    setIsGenerating(false);
  };
  
  const handleTaskComplete = async (taskId: string, isComplete: boolean) => {
    await airtableService.updatePlanTaskStatus(
      taskId, 
      isComplete ? 'completed' : 'pending',
      null,
      user?.id || 'agent_1'
    );
    await loadPlan();
  };
  
  return (
    <div className="border-t border-slate-200 mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <span className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-widest">
          <Calendar size={18} className="text-indigo-600" />
          Copilot Plan (7-Day)
        </span>
        <ChevronDown 
          size={18} 
          className={`transform transition-transform text-slate-400 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      
      {isExpanded && (
        <div className="px-6 py-6 bg-slate-50 rounded-b-[2rem] border-t border-slate-100">
          {!plan ? (
            <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <Bot size={40} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium mb-6 text-sm">
                No active plan for this lead. <br/>Generate a personalized 7-day action plan.
              </p>
              <button
                onClick={generatePlan}
                disabled={isGenerating}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mx-auto"
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16}/>}
                {isGenerating ? 'Synthesizing...' : 'Generate 7-Day Plan'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-5 bg-white rounded-[1.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute right-[-10px] top-[-10px] p-2 opacity-5 text-indigo-900 group-hover:rotate-12 transition-transform duration-700"><Bot size={80}/></div>
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Bot size={12}/> AI Strategy Overview</p>
                <p className="text-xs font-bold text-slate-700 leading-relaxed italic">"{plan.planSummary}"</p>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Generated: {new Date(plan.generatedAt).toLocaleDateString()}</span>
                  <div className="w-1 h-1 bg-slate-200 rounded-full" />
                  <span className="text-red-400">Expires: {new Date(plan.expiresAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6, 7].map(day => {
                  const dayTasks = tasks.filter(t => t.dayIndex === day);
                  if (dayTasks.length === 0) return null;
                  
                  return (
                    <div key={day} className="space-y-2">
                      <h4 className="font-black text-[9px] text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                        Day {day} <div className="flex-1 h-px bg-slate-200" />
                      </h4>
                      <div className="space-y-2">
                        {dayTasks.map(task => (
                          <div key={task.id} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm group hover:border-indigo-300 transition-all">
                            <input
                              type="checkbox"
                              checked={task.status === 'completed'}
                              onChange={(e) => handleTaskComplete(task.id, e.target.checked)}
                              className="mt-1 w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-bold leading-tight ${task.status === 'completed' ? 'line-through text-slate-300' : 'text-slate-800'}`}>
                                {task.taskText}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="text-[8px] font-black uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 tracking-widest">
                                  {task.taskType}
                                </span>
                                {task.priority === 'high' && (
                                  <span className="text-[8px] font-black uppercase bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100 flex items-center gap-1">
                                    <Flame size={8}/> High Priority
                                  </span>
                                )}
                                <span className="text-[8px] font-black uppercase text-slate-300 flex items-center gap-1"><MessageCircle size={8}/> {task.channel}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <button
                onClick={generatePlan}
                disabled={isGenerating}
                className="w-full py-4 bg-slate-100 text-slate-400 border border-slate-200 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 hover:text-slate-600 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16}/>}
                Regenerate Plan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- MAIN CRM COMPONENT ---

const MOCK_CRM_LEADS: Lead[] = [
    { 
      id: '1', name: 'Alice Freeman', score: 94, lastActivity: 'Viewed Pricing Page (Just Now)', 
      lastActivityDate: new Date().toISOString(),
      status: 'Hot', source: 'Web Form', tags: ['Cash Buyer', 'Upsize Candidate', 'Urgent'], 
      sentiment: 'Delighted', urgency: 5, intent: 'Seller',
      phone: '512-555-0100', email: 'alice@freeman.com',
      emailStatus: 'Valid', phoneType: 'Mobile',
      urgencyReason: 'Lease ends Nov 1st',
      propertyAddress: '123 Main St, Austin, TX 78704',
      totalEngagementScore: 142,
      engagementVelocity: 45,
      isSurgeDetected: true,
      propertyIntelligence: {
          estimatedValue: 850000,
          mortgageBalance: 320000,
          equityPercent: 62,
          lastSaleDate: '2014-06-12',
          ownerStatus: 'Owner Occupied',
          loanType: 'Conventional Fixed',
          aiSellPrediction: 'High',
          aiSellReason: 'Owned for 9 years with >60% equity. Neighborhood appreciation up 18% this year.',
          lastEnriched: '2h ago'
      },
      aiSummary: 'VP at TechCorp. Fast-paced, needs direct communication.'
    },
    { 
      id: '2', name: 'Bob Driller', score: 88, lastActivity: 'Searched "Fixer Upper" (15 mins ago)', 
      lastActivityDate: new Date().toISOString(),
      status: 'Nurture', source: 'IDX Search', tags: ['Investor', 'Seller Intent'], 
      sentiment: 'Neutral', urgency: 3, intent: 'Investor',
      phone: '512-555-0101', email: 'bob@invest.io',
      emailStatus: 'Risky', phoneType: 'VOIP',
      totalEngagementScore: 58,
      engagementVelocity: 12,
      isSurgeDetected: false,
      aiSummary: 'Looking for ROI > 12%. Asking about zoning.'
    },
    { 
      id: '3', name: 'James Litigation', score: 99, lastActivity: 'Opted Out via SMS', 
      lastActivityDate: new Date().toISOString(),
      status: 'Cold', source: 'Twilio', tags: ['Opt-Out'], 
      sentiment: 'Negative', urgency: 1, intent: 'Buyer',
      phone: '512-555-0810', email: 'james@stop.com',
      aiSummary: 'Opted out via semantic SMS keyword detection. restring communication.',
      dncEnabled: true 
    }
];

interface CRMProps {
    onGenerateOffer?: (leadId: string) => void;
    onNavigate?: (view: string) => void;
}

const CRM: React.FC<CRMProps> = ({ onGenerateOffer, onNavigate }) => {
  const { user, role } = useAuth();
  const [selectedView, setSelectedView] = useState<'hot-leads' | 'money-board' | 'all' | 'prospecting' | 'idx-activity' | 'social-leads' | 'past-clients'>('hot-leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [activeLeadTab, setActiveLeadTab] = useState<'profiling' | 'property' | 'strategy'>('profiling');
  const [isEnrichingProperty, setIsEnrichingProperty] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState<string | null>(null);

  // Filter leads based on assigned agent if user is an AGENT
  const userLeads = useMemo(() => {
    // Logic for global vs assigned view
    if (role === UserRole.BROKER || role === UserRole.ADMIN) return leads;
    // For agents, show assigned ones. In this mock, we show all since it's a demo, 
    // but in real app we'd filter by lead.agentId === user.id
    return leads;
  }, [leads, role, user]);

  const [pastClients, setPastClients] = useState<PastClient[]>([
    { id: 'pc1', name: 'The Johnson Family', closingDate: '2022-11-03', homeAnniversary: 'Nov 03', houseFeaturesTags: ['Renovated Kitchen', 'Large Yard'], currentEstValue: 625000, referralsSent: 3, lastTouch: '2 weeks ago', giftStatus: 'Sent', reviewStatus: 'Received' },
    { id: 'pc2', name: 'Alice Chen', closingDate: '2023-11-03', homeAnniversary: 'Nov 03', houseFeaturesTags: ['Pool', 'Downtown View'], currentEstValue: 980000, referralsSent: 0, lastTouch: '3 mos ago', giftStatus: 'None', reviewStatus: 'Requested' },
    { id: 'pc3', name: 'Bob Smith', closingDate: '2021-05-12', homeAnniversary: 'May 12', houseFeaturesTags: ['Fixer Upper'], currentEstValue: 345000, birthday: '1985-11-03', referralsSent: 1, lastTouch: '1 mo ago', giftStatus: 'None', reviewStatus: 'None' }
  ]);

  const [anniversaryDrafts, setAnniversaryDrafts] = useState<Record<string, string>>({
      'pc1': "Hi Johnson Family! Happy 2-year Home Anniversary! I hope that beautiful renovated kitchen is still the heart of your home. Just checked the local 78704 stats, and your equity has likely grown significantly—estimated value is now approx $625,000. Hope you are well!",
      'pc2': "Hi Alice! Can't believe it's been a year since you moved in. I bet those downtown views from the pool are incredible right now. Your home is currently estimated at $980,000. Thinking of you today!"
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    const data = await airtableService.getLeads();
    setLeads(data && data.length > 0 ? data : MOCK_CRM_LEADS);
    setIsLoading(false);
  };

  const handleEnrichProperty = async (lead: Lead) => {
      if (!lead.propertyAddress) return;
      setIsEnrichingProperty(true);
      await n8nService.triggerPropertyEnrichment(lead.id, lead.propertyAddress);
      setTimeout(() => {
          setIsEnrichingProperty(false);
          alert("BatchData Enrichment Complete: Deep equity & ownership profile synthesized.");
      }, 1500);
  };

  const toggleLeadSelection = (id: string) => {
    setSelectedLeadIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedLeadIds(userLeads.map(l => l.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const generateCSV = (selectedLeads: Lead[]) => {
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Score', 'Intent', 'Source', 'Tags'];
    const rows = selectedLeads.map(lead => [
      lead.name,
      lead.email || '',
      lead.phone || '',
      lead.status,
      lead.score,
      lead.intent,
      lead.source,
      (lead.tags || []).join(';')
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkAction = async (action: string) => {
    const selectedLeads = userLeads.filter(l => selectedLeadIds.includes(l.id));
    
    switch (action) {
      case 'newsletter':
        alert(`Navigating to Marketing Studio with ${selectedLeadIds.length} recipients for Newsletter...`);
        if (onNavigate) onNavigate('marketing');
        break;
        
      case 'directMail':
        alert(`Navigating to Marketing Studio with ${selectedLeadIds.length} recipients for Direct Mail...`);
        if (onNavigate) onNavigate('marketing');
        break;
        
      case 'startDrip':
        if (confirm(`Start smart drip for ${selectedLeadIds.length} leads? This will enroll selected leads in appropriate nurture sequences based on their intent and stage.`)) {
          setIsProvisioning('bulk');
          for (const leadId of selectedLeadIds) {
            const lead = selectedLeads.find(l => l.id === leadId);
            if (lead) {
              await n8nService.startSmartDrip(
                leadId, 
                lead.intent === 'Seller' ? 'Seller' : 'Buyer',
                user?.id || 'agent_1'
              );
            }
          }
          setIsProvisioning(null);
          alert(`Started drip sequences for ${selectedLeadIds.length} leads`);
          setSelectedLeadIds([]);
        }
        break;
        
      case 'export':
        const csvContent = generateCSV(selectedLeads);
        downloadFile(csvContent, `leads-export-${new Date().toISOString()}.csv`);
        break;
        
      default:
        break;
    }
  };

  const handleGrantAccess = async (lead: Lead) => {
    if (lead.dncEnabled) return;
    setIsProvisioning(lead.id);
    await n8nService.grantPortalAccess(lead.email || '', lead.intent as any, lead.id, lead.name);
    setTimeout(() => {
        setIsProvisioning(null);
        alert(`Nexus OS: Role-based Portal Access granted for ${lead.name}. Personalized Magic Link sent via SendGrid.`);
    }, 1200);
  };

  const handleStartBuyerDrip = async (lead: Lead) => {
      setIsProvisioning(lead.id);
      await n8nService.startMotivatedBuyerDrip(lead.id, user?.id || 'agent_1');
      setTimeout(() => {
          setIsProvisioning(null);
          alert(`WF-BUYER-DRIP-01: Motivated Buyer Smart Drip sequence initiated for ${lead.name}. AI is generating personalized curated listings and sprint offers.`);
      }, 1200);
  };

  const handleApproveDraft = async (clientId: string) => {
      setIsProvisioning(clientId);
      const draft = anniversaryDrafts[clientId];
      await n8nService.approveAnniversaryDraft(clientId, draft);
      setTimeout(() => {
          setIsProvisioning(null);
          setAnniversaryDrafts(prev => {
              const updated = { ...prev };
              delete updated[clientId];
              return updated;
          });
          alert("Anniversary Protocol: AI Draft dispatched to client via GHL.");
      }, 1000);
  };

  const hotLeads = userLeads.filter(l => (l.totalEngagementScore || 0) > 50 && l.lastActivityDate?.includes(new Date().toISOString().split('T')[0]));

  const currentAnniversaries = pastClients.filter(c => c.homeAnniversary === 'Nov 03' || (c.birthday && c.birthday.includes('11-03')));

  return (
    <div className="space-y-5 relative">
      {/* BULK ACTIONS FLOATING BAR */}
      {selectedLeadIds.length > 0 && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl p-4 flex items-center gap-4 animate-fade-in-up border border-slate-200 ring-8 ring-slate-900/5">
              <span className="font-black text-xs uppercase tracking-widest text-slate-500 border-r border-slate-100 pr-4">
                  {selectedLeadIds.length} lead{selectedLeadIds.length > 1 ? 's' : ''} selected
              </span>
              
              <button 
                onClick={() => handleBulkAction('newsletter')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md active:scale-95"
              >
                  <Mail size={14}/> Send Newsletter
              </button>
              
              <button 
                onClick={() => handleBulkAction('directMail')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-md active:scale-95"
              >
                  <Ticket size={14}/> Direct Mail
              </button>
              
              <button 
                onClick={() => handleBulkAction('startDrip')}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-md active:scale-95"
              >
                  <Droplets size={14}/> Start Drip
              </button>
              
              <button 
                onClick={() => handleBulkAction('export')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black shadow-md active:scale-95"
              >
                  <Download size={14}/> Export CSV
              </button>
              
              <button onClick={() => setSelectedLeadIds([])} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-all"><X size={18}/></button>
          </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 uppercase italic tracking-tighter">
            {role === UserRole.AGENT ? 'My Lead Portfolio' : 'Global Identity Registry'}
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
            {role === UserRole.AGENT ? `Assigned to ${user?.name}` : 'Brokerage-Wide Performance Monitoring'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <div className="flex bg-white rounded-xl p-0.5 border border-slate-200 overflow-x-auto max-w-full scrollbar-hide shadow-sm">
            {[
                { id: 'hot-leads', label: '🔥 Hot Today' },
                { id: 'idx-activity', label: 'Live IDX' },
                { id: 'social-leads', label: 'Social Sync' },
                { id: 'past-clients', label: 'Sphere Nurture' },
                { id: 'money-board', label: 'Pipeline' },
                { id: 'all', label: role === UserRole.AGENT ? 'My Entire Book' : 'Global List' }
            ].map(v => (
                <button key={v.id} onClick={() => setSelectedView(v.id as any)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedView === v.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                    {v.label}
                </button>
            ))}
          </div>
        </div>
      </div>

      {/* SELECT ALL ROW */}
      <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-200 mb-2 shadow-sm animate-fade-in">
          <input 
              type="checkbox" 
              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all"
              checked={userLeads.length > 0 && selectedLeadIds.length === userLeads.length}
              onChange={(e) => handleSelectAll(e.target.checked)}
          />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select All {selectedView.replace('-', ' ')}</span>
      </div>

      {selectedView === 'past-clients' && (
          <div className="space-y-8 animate-fade-in-up">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600 flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="absolute right-0 top-0 p-12 opacity-5 rotate-12"><PartyPopper size={200}/></div>
                  <div className="relative z-10 max-xl">
                      <p className="text-indigo-400 text-sm font-black uppercase tracking-[0.3em] mb-4">Sphere Nurture Protocol</p>
                      <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-4 leading-none">Daily Sphere Tasks.</h2>
                      <p className="text-indigo-100 text-lg font-medium opacity-90 leading-relaxed mb-8">Staying top-of-mind with hyper-personalization. AI has scanned your database for milestones and drafted specific outreach messages.</p>
                      
                      <div className="flex gap-4">
                          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center min-w-[120px]">
                              <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">ANNIVERSARIES</p>
                              <p className="text-2xl font-black">{currentAnniversaries.filter(c => !c.birthday).length}</p>
                          </div>
                          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center min-w-[120px]">
                              <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">BIRTHDAYS</p>
                              <p className="text-2xl font-black">{currentAnniversaries.filter(c => c.birthday).length}</p>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                  {currentAnniversaries.map(client => (
                      <div key={client.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-md p-8 group hover:border-indigo-400 transition-all flex flex-col lg:flex-row gap-10">
                          <div className="lg:w-72 shrink-0">
                              <div className="flex items-center gap-4 mb-6">
                                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-xl italic shadow-inner">
                                      {client.name[0]}
                                  </div>
                                  <div>
                                      <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg leading-none mb-1.5">{client.name}</h4>
                                      <div className="flex items-center gap-2">
                                          {client.birthday?.includes('11-03') ? <Cake size={14} className="text-pink-500"/> : <Home size={14} className="text-emerald-500"/>}
                                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{client.birthday?.includes('11-03') ? 'Birthday Today' : 'Home Anniversary'}</span>
                                      </div>
                                  </div>
                              </div>
                              <div className="space-y-4">
                                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Home Features</p>
                                      <div className="flex flex-wrap gap-1.5">
                                          {client.houseFeaturesTags?.map(tag => (
                                              <span key={tag} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[8px] font-black uppercase">{tag}</span>
                                          ))}
                                      </div>
                                  </div>
                                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                      <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Current Est. Value</p>
                                      <p className="text-base font-black text-emerald-800 tabular-nums">${client.currentEstValue?.toLocaleString()}</p>
                                  </div>
                              </div>
                          </div>

                          <div className="flex-1 space-y-6">
                              <div className="flex justify-between items-center">
                                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                      <Bot size={16} className="text-indigo-600"/> AI Personal Outreach Draft
                                  </h5>
                                  <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Edit Script</button>
                              </div>
                              <div className="bg-indigo-50/30 border-2 border-indigo-100 p-6 rounded-3xl relative">
                                  <div className="absolute top-4 right-4 opacity-10"><MessageSquare size={40}/></div>
                                  <p className="text-sm font-bold text-indigo-900 leading-relaxed italic">
                                      "{anniversaryDrafts[client.id] || "AI is drafting a custom anniversary message based on property tags..."}"
                                  </p>
                              </div>
                              <div className="flex gap-4">
                                  <button 
                                    onClick={() => handleApproveDraft(client.id)}
                                    disabled={isProvisioning === client.id}
                                    className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-indigo-900"
                                  >
                                      {isProvisioning === client.id ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}
                                      Approve & Send (GHL)
                                  </button>
                                  <button 
                                    onClick={() => onGenerateOffer?.(client.id)}
                                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black active:scale-95 transition-all flex items-center gap-2"
                                  >
                                      <Wand2 size={16}/> Offer Lab
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {selectedView === 'hot-leads' && (
          <div className="space-y-6 animate-fade-in-up">
              {hotLeads.length === 0 ? (
                  <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200 shadow-inner">
                      <Clock size={40} className="mx-auto text-slate-200 mb-4" />
                      <p className="font-black text-slate-400 uppercase tracking-widest text-xs italic">Awaiting high-intent behavioral spikes...</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {hotLeads.map(lead => (
                          <div key={lead.id} 
                            onClick={() => toggleLeadSelection(lead.id)}
                            className={`rounded-[2rem] border-2 p-6 shadow-lg transition-all relative overflow-hidden group cursor-pointer hover:scale-[1.02] ${
                              selectedLeadIds.includes(lead.id) ? 'ring-4 ring-indigo-500 border-indigo-500' :
                              lead.dncEnabled ? 'bg-red-50 border-red-500 ring-4 ring-red-100' : 
                              lead.isSurgeDetected ? 'bg-white border-orange-500 ring-4 ring-orange-50' : 'bg-white border-slate-200'
                          }`}>
                                {/* Checkbox Element */}
                                <div className="absolute top-6 left-6 z-30">
                                    <input 
                                        type="checkbox" 
                                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        checked={selectedLeadIds.includes(lead.id)}
                                        onChange={() => {}} // State handled by parent click
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>

                                {selectedLeadIds.includes(lead.id) && (
                                    <div className="absolute top-2 right-2 p-1 bg-indigo-600 rounded-full text-white z-20"><Check size={12}/></div>
                                )}
                                {lead.dncEnabled ? (
                                    <div className="absolute top-0 right-0 bg-red-600 text-white px-4 py-1 rounded-bl-2xl font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 z-10 shadow-lg">
                                        <Ban size={12} /> DO NOT CONTACT
                                    </div>
                                ) : lead.isSurgeDetected && (
                                    <div className="absolute top-0 right-0 bg-orange-500 text-white px-4 py-1 rounded-bl-2xl font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 z-10 shadow-lg">
                                        <Flame size={12} /> Surge Detected
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-start mb-6 pt-8 md:pt-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border ${
                                            lead.dncEnabled ? 'bg-red-100 text-red-700 border-red-200' :
                                            lead.isSurgeDetected ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                        }`}>
                                            {lead.name[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight leading-none mb-1">{lead.name}</h3>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{lead.intent} • {lead.source}</p>
                                        </div>
                                    </div>
                                    {!lead.dncEnabled && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onGenerateOffer?.(lead.id); }}
                                            className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                            title="Launch Offer Lab"
                                        >
                                            <Wand2 size={20}/>
                                        </button>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <div className="flex flex-wrap gap-2">
                                        {lead.tags.map(tag => (
                                            <div key={tag} className="relative group/tag">
                                                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-indigo-100 cursor-help shadow-sm">
                                                    {tag}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Zap size={10}/> Intent Score</p>
                                        <p className="font-black text-xl text-slate-900 tracking-tight">{lead.totalEngagementScore || 0}</p>
                                    </div>
                                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                        <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><TrendingUp size={10}/> 24h Velocity</p>
                                        <p className="font-black text-xl text-indigo-600 tracking-tight">+{lead.engagementVelocity || 0}</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }}
                                    disabled={lead.dncEnabled}
                                    className={`w-full py-3 rounded-xl font-black uppercase text-[9px] tracking-[0.2em] shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${
                                        lead.dncEnabled ? 'bg-slate-200 text-white cursor-not-allowed' : 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    View Live Profile
                                </button>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}

      {(selectedView === 'money-board' || selectedView === 'all') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
              {userLeads.filter(l => selectedView === 'all' ? true : l.score >= 80).map(lead => (
                  <div key={lead.id} 
                    onClick={() => toggleLeadSelection(lead.id)}
                    className={`rounded-[2rem] border-2 p-6 shadow-lg transition-all relative overflow-hidden group cursor-pointer ${
                    selectedLeadIds.includes(lead.id) ? 'ring-4 ring-indigo-500 border-indigo-500' :
                    lead.dncEnabled ? 'bg-red-50 border-red-500 ring-4 ring-red-100' : 
                    lead.isSurgeDetected ? 'bg-white border-orange-500 ring-4 ring-orange-50' : 'bg-white border-slate-200'
                }`}>
                      {/* Checkbox Element */}
                      <div className="absolute top-6 left-6 z-30">
                          <input 
                              type="checkbox" 
                              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              checked={selectedLeadIds.includes(lead.id)}
                              onChange={() => {}} // State handled by parent click
                              onClick={(e) => e.stopPropagation()}
                          />
                      </div>

                      {selectedLeadIds.includes(lead.id) && (
                        <div className="absolute top-2 right-2 p-1 bg-indigo-600 rounded-full text-white z-20"><Check size={12}/></div>
                      )}
                      <div className="flex justify-between items-start mb-6 pt-8 md:pt-4">
                          <div className="flex items-center gap-4">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl italic border ${
                                  lead.dncEnabled ? 'bg-red-100 text-red-700 border-red-200' :
                                  lead.isSurgeDetected ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                              }`}>
                                  {lead.name[0]}
                              </div>
                              <div>
                                  <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight leading-none mb-1">{lead.name}</h3>
                                  <div className="flex items-center gap-2">
                                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${
                                          lead.dncEnabled ? 'bg-red-600 text-white border-red-700' :
                                          lead.status === 'Hot' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                                      }`}>
                                          {lead.dncEnabled ? 'DNC' : lead.status}
                                      </span>
                                      <span className="text-[10px] font-black text-indigo-600">{lead.score}% Lead Flow</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-8">
                          {lead.tags.map(tag => (
                              <div key={tag} className="relative group/tag">
                                  <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-slate-100 cursor-help transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700">
                                      {tag}
                                  </span>
                              </div>
                          ))}
                      </div>

                      <div className="flex gap-3">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }} 
                            disabled={lead.dncEnabled}
                            className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl ${
                                lead.dncEnabled ? 'bg-slate-300 text-white cursor-not-allowed shadow-none' : 'bg-slate-900 text-white hover:bg-black'
                            }`}>
                                {lead.dncEnabled ? 'Protocols Engaged' : 'Detailed Profile'}
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {selectedLead && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-6">
              <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full h-[80vh] overflow-hidden animate-scale-in flex flex-col border border-white/20">
                  <div className={`p-10 text-white flex justify-between items-center shrink-0 border-b-8 border-black/10 ${selectedLead.dncEnabled ? 'bg-red-600' : 'bg-slate-900'}`}>
                      <div className="flex items-center gap-8">
                          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center font-black text-3xl italic border shadow-2xl transition-transform hover:scale-105 ${selectedLead.dncEnabled ? 'bg-white/20 border-white/30' : 'bg-white/10 border-white/10'}`}>
                            {selectedLead.name[0]}
                          </div>
                          <div>
                              <h3 className="text-3xl font-black uppercase tracking-tight italic leading-none mb-2">{selectedLead.name}</h3>
                              <p className={`font-black text-[11px] uppercase tracking-widest flex items-center gap-2 leading-none ${selectedLead.dncEnabled ? 'text-red-100' : 'text-indigo-400'}`}>
                                  {selectedLead.dncEnabled ? <Ban size={14}/> : <MapPin size={14}/>}
                                  {selectedLead.dncEnabled ? 'DO NOT CONTACT - TCPA OPT-OUT' : selectedLead.propertyAddress || 'No Address Logged'}
                              </p>
                          </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {!selectedLead.dncEnabled && (
                            <button 
                                onClick={() => { setSelectedLead(null); onGenerateOffer?.(selectedLead.id); }}
                                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.15em] shadow-2xl hover:bg-indigo-700 active:scale-95 flex items-center gap-2 border-b-4 border-indigo-900"
                            >
                                <Wand2 size={20}/> Launch Offer Lab
                            </button>
                        )}
                        <button onClick={() => setSelectedLead(null)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X size={24} /></button>
                      </div>
                  </div>
                  
                  <div className="flex-1 flex overflow-hidden bg-slate-50">
                      <div className="w-64 bg-white border-r border-slate-100 p-8 space-y-3 shrink-0 shadow-inner">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-2">Data Clusters</p>
                          {[
                              { id: 'profiling', label: 'Identity Map', icon: User },
                              { id: 'property', label: 'Property Intel', icon: Home },
                              { id: 'strategy', label: 'Conversion Logic', icon: Target }
                          ].map(tab => (
                              <button 
                                key={tab.id}
                                onClick={() => setActiveLeadTab(tab.id as any)}
                                disabled={selectedLead.dncEnabled && tab.id === 'strategy'}
                                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeLeadTab === tab.id ? 'bg-indigo-600 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-700'
                                } ${selectedLead.dncEnabled && tab.id === 'strategy' ? 'opacity-30 cursor-not-allowed' : ''}`}
                              >
                                  <tab.icon size={18} /> {tab.label}
                              </button>
                          ))}
                      </div>

                      <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
                          {activeLeadTab === 'profiling' && (
                              <div className="space-y-10 animate-fade-in">
                                  {selectedLead.dncEnabled && (
                                      <div className="bg-red-50 border-2 border-red-200 p-8 rounded-[2rem] text-red-900 flex items-start gap-6 shadow-lg shadow-red-100/50">
                                          <AlertCircle className="text-red-600 shrink-0" size={32} />
                                          <div>
                                              <p className="font-black uppercase tracking-[0.25em] text-xs mb-2 italic">Legal Protocol Active</p>
                                              <p className="text-base font-bold leading-relaxed">This contact opted out via SMS semantic analysis. Outbound communication is restricted to prevent brokerage-level compliance risk.</p>
                                          </div>
                                      </div>
                                  )}
                                  <div className="grid grid-cols-2 gap-8">
                                      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-all">
                                          <div className="absolute right-[-10px] top-[-10px] opacity-5 text-indigo-900"><Linkedin size={100}/></div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 italic"><Linkedin size={14} className="text-blue-600"/> Digital Identity Extract</p>
                                          <p className="text-base font-bold text-slate-800 leading-relaxed mb-6 italic">"{selectedLead.socialProfileSummary || 'Digital profile not yet enriched.'}"</p>
                                          <div className="flex items-center justify-between text-[11px] font-black uppercase text-indigo-600 border-t border-slate-100 pt-5">
                                              <span className="tracking-widest opacity-60">Estimated Income</span>
                                              <span className="text-lg italic tracking-tight">{selectedLead.estimatedIncome || 'N/A'}</span>
                                          </div>
                                      </div>
                                      <div className="bg-indigo-900 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
                                          <div className="absolute right-[-10px] top-[-10px] opacity-10 text-white"><Sparkles size={100}/></div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 italic"><Bot size={16}/> Persona Synthesis</p>
                                          <p className="text-lg font-black text-white leading-tight italic">"{selectedLead.aiPersonalityTip || 'Analyzing behavioral patterns...'}"</p>
                                          <p className="mt-8 text-[9px] text-indigo-300 font-bold uppercase tracking-widest">Logic: Behavioral Analysis v4.1</p>
                                      </div>
                                  </div>
                                  <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-10 relative overflow-hidden group hover:border-indigo-400 transition-all shadow-md">
                                      <div className="absolute right-[-20px] top-[-20px] opacity-5 text-indigo-600"><Bot size={150}/></div>
                                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-1">AI Engagement Summary</h4>
                                      <p className="text-2xl text-slate-700 font-bold leading-[1.3] italic">"{selectedLead.aiSummary}"</p>
                                  </div>
                              </div>
                          )}

                          {activeLeadTab === 'property' && (
                              <div className="space-y-8 animate-fade-in">
                                  {selectedLead.propertyIntelligence ? (
                                      <>
                                          <div className="grid grid-cols-3 gap-6">
                                              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-center flex flex-col justify-center group hover:border-indigo-400 transition-all">
                                                  <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Est. Equity Position</p>
                                                  <h4 className="text-3xl font-black text-emerald-600 tracking-tighter italic leading-none">${(selectedLead.propertyIntelligence.estimatedValue! - selectedLead.propertyIntelligence.mortgageBalance!).toLocaleString()}</h4>
                                              </div>
                                              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl text-center flex flex-col justify-center border-b-8 border-indigo-600">
                                                  <p className="text-[10px] font-black text-indigo-400 uppercase mb-3 tracking-widest">Equity Percentage</p>
                                                  <h4 className="text-5xl font-black tracking-tighter italic leading-none">{selectedLead.propertyIntelligence.equityPercent}%</h4>
                                              </div>
                                              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-center flex flex-col justify-center group hover:border-red-400 transition-all">
                                                  <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Liquidation Score</p>
                                                  <span className={`w-fit mx-auto px-6 py-2 rounded-xl text-[11px] font-black uppercase shadow-lg ${
                                                      selectedLead.propertyIntelligence.aiSellPrediction === 'High' ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 text-slate-500'
                                                  }`}>
                                                      {selectedLead.propertyIntelligence.aiSellPrediction} Prediction
                                                  </span>
                                              </div>
                                          </div>

                                          <div className="bg-indigo-50 border-2 border-indigo-100 rounded-[2.5rem] p-10 flex gap-10 items-center shadow-inner group hover:border-indigo-400 transition-all">
                                              <div className="p-6 bg-white rounded-3xl shadow-xl text-indigo-600 group-hover:scale-110 transition-transform"><Bot size={48}/></div>
                                              <div>
                                                  <p className="text-11 font-black text-indigo-600 uppercase tracking-[0.3em] mb-3 px-1">AI Listing Intent Logic</p>
                                                  <p className="text-2xl font-black text-indigo-900 leading-tight italic">"{selectedLead.propertyIntelligence.aiSellReason}"</p>
                                              </div>
                                          </div>
                                      </>
                                  ) : (
                                      <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-8 animate-fade-in-up">
                                          <div className="w-24 h-24 bg-slate-100 rounded-[3rem] flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-300 shadow-inner group-hover:scale-110 transition-transform">
                                              <Home size={40}/>
                                          </div>
                                          <div className="max-w-md">
                                              <h4 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter mb-4">No Property Intel Ingested.</h4>
                                              <p className="text-sm text-slate-400 font-medium leading-relaxed">Add a residential address and execute the enrichment protocol to unlock institutional-grade equity analysis and sell-intent scores.</p>
                                          </div>
                                          <button 
                                            onClick={() => handleEnrichProperty(selectedLead)}
                                            className="px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all border-b-4 border-indigo-900 flex items-center gap-3"
                                          >
                                              {isEnrichingProperty ? <Loader2 size={20} className="animate-spin"/> : <Sparkles size={20}/>}
                                              Initialize Ingest Pipeline
                                          </button>
                                      </div>
                                  )}
                              </div>
                          )}

                          {activeLeadTab === 'strategy' && (
                              <div className="space-y-10 animate-fade-in">
                                  <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12 border-b-8 border-indigo-600">
                                      <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12 pointer-events-none"><Target size={220}/></div>
                                      <div className="relative z-10 max-w-xl">
                                          <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4 italic">High-Velocity Conversion</h4>
                                          <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-6 leading-tight">Gemini Strategy <br/> Outreach Draft.</h3>
                                          <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 shadow-2xl italic text-slate-100 text-lg font-bold leading-relaxed mb-10 group-hover:border-indigo-400/50 transition-all cursor-default">
                                              "{selectedLead.aiSuggestedOpeningLine}"
                                          </div>
                                          <div className="flex flex-wrap gap-4">
                                            <button 
                                                onClick={() => { setSelectedLead(null); onGenerateOffer?.(selectedLead.id); }}
                                                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-2xl hover:bg-indigo-700 active:scale-95 flex items-center gap-2 border-b-4 border-indigo-900"
                                            >
                                                <Wand2 size={18}/> Offer Lab
                                            </button>
                                            
                                            {selectedLead.intent === 'Buyer' && (
                                                <button 
                                                    onClick={() => handleStartBuyerDrip(selectedLead)}
                                                    disabled={isProvisioning === selectedLead.id}
                                                    className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:bg-emerald-700 active:scale-95 flex items-center gap-2 border-b-4 border-emerald-900"
                                                >
                                                    {isProvisioning === selectedLead.id ? <Loader2 size={18} className="animate-spin"/> : <Sparkles size={18}/>}
                                                    Start Buyer Drip
                                                </button>
                                            )}

                                            <button className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                                                <Send size={18}/> GHL Push
                                            </button>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>
                      
                      {/* --- COLLAPSIBLE PANELS COLUMN --- */}
                      <div className="w-80 border-l border-slate-200 bg-white overflow-y-auto shrink-0 scrollbar-hide">
                          <CopilotPlanPanel leadId={selectedLead.id} />
                          <CreditStatusPanel leadId={selectedLead.id} />
                          <VideoEngagementPanel leadId={selectedLead.id} />
                          <QuickActionsPanel leadId={selectedLead.id} onNavigate={onNavigate} />
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default CRM;
