
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, Bot, TrendingUp, Clock, MapPin, 
  ChevronRight, CheckCircle2, Circle, ArrowRight,
  ShieldCheck, Zap, Home, DollarSign, Activity,
  Info, MessageSquare, LayoutDashboard, Calendar, User, ChevronDown,
  AlertTriangle, FileText, AlertCircle, Loader2, Check, Eye, BarChart3,
  Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { JourneyCardsRenderer } from '../../components/JourneyCardsRenderer';
import { TransparencyFeed } from '../../components/TransparencyFeed';
import { PersonaTools } from '../../components/PersonaTools';
import { DealTeamSection } from '../../components/DealTeamSection';
import { airtableService } from '../../services/airtable';
import { n8nService } from '../../services/n8n';
import { JourneyState, Deal, ShowingFeedback, RealEstateEvent, Listing, ListingEngagement, ListingMetrics } from '../../types';

const ListingJourney: React.FC = () => {
  const { user } = useAuth();
  const [journeyState, setJourneyState] = useState<JourneyState | null>(null);
  const [transaction, setTransaction] = useState<Deal | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [metrics, setMetrics] = useState<ListingMetrics | null>(null);
  const [engagement, setEngagement] = useState<ListingEngagement[]>([]);
  const [showings, setShowings] = useState<RealEstateEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'activity'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllPerformanceData();
  }, [user]);

  const loadAllPerformanceData = async () => {
    if (user?.id) {
        setIsLoading(true);
        const state = await airtableService.getJourneyStateByUserId(user.id);
        setJourneyState(state);
        
        if (state?.dealId) {
            const transactions = await airtableService.getTransactions();
            const deal = transactions?.find(t => t.id === state.dealId);
            if (deal) setTransaction(deal);
        }

        if (state?.listingId) {
          const listings = await airtableService.getListings();
          const currentListing = listings?.find(l => l.id === state.listingId);
          if (currentListing) setListing(currentListing);
          
          const latestMetrics = await airtableService.getLatestMetricsByListingId(state.listingId);
          setMetrics(latestMetrics);
          
          const engagementData = await airtableService.getEngagementByListingId(state.listingId, 30);
          setEngagement(engagementData);
          
          const events = await airtableService.getEvents();
          const listingShowings = events.filter(e => 
            e.listingId === state.listingId && 
            e.type === 'showing'
          );
          setShowings(listingShowings);
        }
        setIsLoading(false);
    }
  };

  const stages = [
    { id: 'prep', title: 'Preparation', status: 'complete', desc: 'Photos & Staging' },
    { id: 'active', title: 'Active Market', status: 'active', desc: 'Showings & Feedback' },
    { id: 'negotiation', title: 'Negotiation', status: 'upcoming', desc: 'Offer Review' },
    { id: 'pending', title: 'Under Contract', status: 'upcoming', desc: 'Due Diligence' },
    { id: 'closing', title: 'Closing', status: 'upcoming', desc: 'Final Handover' }
  ];

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
        </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      {/* Hero Section */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
        <div className="absolute right-0 top-0 p-12 opacity-5 rotate-12"><LayoutDashboard size={200}/></div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-900/40">
              <Sparkles size={20} className="text-white"/>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Seller Dashboard</span>
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-4 leading-none">The Listing <br/> Journey.</h1>
          <p className="text-indigo-100 text-lg font-medium opacity-90 leading-relaxed mb-8">
            Manage your sale from launch to keys. High-fidelity data ensures you are always in control of your equity.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-xl p-1 border border-slate-200 w-fit shadow-md overflow-x-auto max-w-full scrollbar-hide">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
          { id: 'activity', label: 'Activity Feed', icon: Activity }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Progress Track */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4">
                    {stages.map((stage, i) => (
                        <div key={stage.id} className="flex-1 w-full flex flex-col items-center text-center relative group">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-500 z-10 ${
                                stage.status === 'complete' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-inner' :
                                stage.status === 'active' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-110 ring-4 ring-indigo-50' :
                                'bg-slate-50 text-slate-300 border border-slate-100'
                            }`}>
                                {stage.status === 'complete' ? <CheckCircle2 size={24}/> : <span className="font-black text-xs">{i + 1}</span>}
                            </div>
                            <h4 className={`text-[11px] font-black uppercase tracking-widest ${stage.status === 'active' ? 'text-slate-900' : 'text-slate-400'}`}>{stage.title}</h4>
                            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">{stage.desc}</p>
                            {i < stages.length - 1 && (
                                <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-slate-100 -z-0" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <JourneyCardsRenderer userId={user?.id || 'demo-user'} userRole="seller" />
            <TransparencyFeed contactId={user?.id || 'demo-user'} title="What We're Doing For You" />
          </div>
        )}

        {activeTab === 'analytics' && (
          <PerformanceAnalytics 
            listing={listing}
            metrics={metrics}
            engagement={engagement}
            showings={showings}
          />
        )}

        {activeTab === 'activity' && (
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic">
                Activity feed protocol initializing...
            </div>
        )}
      </div>

      {/* Footer widgets */}
      {journeyState && (
        <div className="mt-8">
            <PersonaTools 
                userId={user?.id || 'demo-user'}
                persona={journeyState.persona}
                stage={journeyState.currentStage}
            />
        </div>
      )}

      {(transaction || user?.id) && (
        <div className="mt-8">
            <DealTeamSection 
                dealId={transaction?.id}
                contactId={user?.id}
                showAIActivity={true}
            />
        </div>
      )}
    </div>
  );
};

// --- PERFORMANCE ANALYTICS COMPONENT ---

interface PerformanceAnalyticsProps {
  listing: Listing | null;
  metrics: ListingMetrics | null;
  engagement: ListingEngagement[];
  showings: RealEstateEvent[];
}

const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({ listing, metrics, engagement, showings }) => {
  if (!listing || !metrics) {
    return (
      <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-200">
        <BarChart3 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs italic">Generating Performance Snapshot...</p>
      </div>
    );
  }
  
  // Trending views (Last 30 days or available)
  const viewsTrend = engagement.map(e => ({
    date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    views: e.onlineViews
  }));
  
  // Weekly showing counts
  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
  };

  const showingsTrend = showings.reduce((acc: Record<string, number>, showing) => {
    const week = getWeekNumber(new Date(showing.dateTime));
    acc[week] = (acc[week] || 0) + 1;
    return acc;
  }, {});

  const sourceBreakdown = useMemo(() => {
    const sourceMap: Record<string, number> = {};
    let total = 0;
    engagement.forEach(e => {
        sourceMap[e.source] = (sourceMap[e.source] || 0) + e.onlineViews;
        total += e.onlineViews;
    });
    return Object.entries(sourceMap).map(([name, views]) => ({
        name,
        views,
        percentage: total > 0 ? (views / total * 100).toFixed(1) : '0'
    })).sort((a, b) => b.views - a.views);
  }, [engagement]);

  const insights = useMemo(() => {
      const list = [];
      if (metrics.showingsThisWeek > 3) {
          list.push({ type: 'positive', message: `Strong momentum! ${metrics.showingsThisWeek} tours this week is outperforming neighbor benchmarks.` });
      } else if (metrics.showingsThisWeek === 0 && metrics.daysOnMarket > 14) {
          list.push({ type: 'warning', message: 'Tours have slowed. We recommend an updated marketing refresh or price positioning review.' });
      }
      if (metrics.avgSentimentScore > 75) {
          list.push({ type: 'positive', message: 'Sentiment analysis shows high buyer affinity for your home\'s current condition.' });
      }
      if (metrics.viewsPerDay > 50) {
          list.push({ type: 'positive', message: 'High-velocity online traffic. Marketing syndication is hitting target demographics effectively.' });
      }
      return list;
  }, [metrics]);
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Days on Market"
          value={metrics.daysOnMarket}
          trend={`${metrics.priceReductionCount} Price Changes`}
          icon={Calendar}
          color="indigo"
        />
        <MetricCard
          label="Online Views"
          value={metrics.totalOnlineViews.toLocaleString()}
          trend={`${metrics.viewsPerDay.toFixed(1)}/day`}
          icon={Eye}
          color="blue"
        />
        <MetricCard
          label="Showings"
          value={metrics.showingsThisWeek}
          trend={`${metrics.totalShowings} total`}
          icon={Home}
          color="emerald"
        />
        <MetricCard
          label="Feedback Index"
          value={`${metrics.avgSentimentScore}%`}
          trend={`${metrics.feedbackReceivedCount} responses`}
          icon={MessageSquare}
          color="amber"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Charts */}
        <div className="lg:col-span-8 space-y-6">
            {/* Offer Probability Hero */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                <div className="absolute right-[-20px] top-[-20px] p-4 opacity-5 rotate-12"><Sparkles size={180}/></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="max-w-md">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Offer Probability Index.</h3>
                        <p className="text-indigo-200 text-sm font-medium leading-relaxed italic">
                            "{metrics.reasoning || "Our AI model is calculating the probability of a signed offer in the next 14 days based on current engagement spikes."}"
                        </p>
                    </div>
                    <div className="text-center md:text-right shrink-0">
                        <p className="text-6xl font-black tracking-tighter italic tabular-nums text-white">{metrics.offerProbabilityScore}%</p>
                        {metrics.predictedDaysToOffer && (
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-2">~{metrics.predictedDaysToOffer} Days to Offer</p>
                        )}
                    </div>
                </div>
                <div className="mt-8 w-full bg-white/10 h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
                    <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        style={{ width: `${metrics.offerProbabilityScore}%` }}
                    />
                </div>
            </div>

            {/* Views Chart */}
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                <h3 className="font-black text-xs text-slate-800 uppercase tracking-[0.2em] mb-8">Digital Visibility Pulse (Last 30 Days)</h3>
                <div className="h-48 flex items-end justify-between gap-1 px-2">
                    {viewsTrend.map((point, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center group">
                            <div 
                                className="w-full bg-indigo-600/20 group-hover:bg-indigo-600 rounded-t-lg transition-all duration-500 relative"
                                style={{ height: `${(point.views / Math.max(...viewsTrend.map(d => d.views), 1)) * 100}%` }}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded text-[9px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                                    {point.views}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-4 px-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase">{viewsTrend[0]?.date}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase">{viewsTrend[viewsTrend.length-1]?.date}</span>
                </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                <h3 className="font-black text-xs text-slate-800 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Zap size={16} className="text-indigo-600" /> Strategic Insights
                </h3>
                <div className="space-y-3">
                    {insights.map((insight, idx) => (
                        <div key={idx} className={`p-5 rounded-2xl border flex items-start gap-4 transition-all ${
                            insight.type === 'positive' 
                                ? 'bg-emerald-50 border-emerald-100'
                                : insight.type === 'warning'
                                ? 'bg-amber-50 border-amber-200'
                                : 'bg-indigo-50 border-indigo-200'
                        }`}>
                            <div className={`p-2 rounded-xl shrink-0 ${
                                insight.type === 'positive' ? 'bg-white text-emerald-600' : 
                                insight.type === 'warning' ? 'bg-white text-amber-600' : 
                                'bg-white text-indigo-600'
                            }`}>
                                {insight.type === 'positive' ? <TrendingUp size={16} /> : 
                                 insight.type === 'warning' ? <AlertCircle size={16} /> : 
                                 <Info size={16} />}
                            </div>
                            <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{insight.message}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right: Sources & Small Stats */}
        <div className="lg:col-span-4 space-y-6">
            {/* View Sources */}
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                <h3 className="font-black text-xs text-slate-800 uppercase tracking-[0.2em] mb-8">Traffic Acquisition</h3>
                <div className="space-y-6">
                    {sourceBreakdown.map(source => (
                    <div key={source.name} className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight capitalize">{source.name.replace('_', ' ')}</span>
                            <span className="text-[10px] font-black text-indigo-600 tabular-nums">{source.views} Views</span>
                        </div>
                        <div className="w-full bg-slate-50 rounded-full h-1.5 overflow-hidden">
                            <div 
                                className="bg-indigo-600 h-full transition-all duration-1000"
                                style={{ width: `${source.percentage}%` }}
                            />
                        </div>
                    </div>
                    ))}
                </div>
                <div className="mt-10 pt-8 border-t border-slate-100">
                    <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[9px] tracking-widest shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2">
                        <Download size={14}/> Full Audit PDF
                    </button>
                </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-8 shadow-inner">
                <h4 className="font-black text-[10px] text-indigo-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <Activity size={16}/> System Pulse
                </h4>
                <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-500 uppercase">Weekly Delta</span>
                        <span className="text-emerald-600 font-black">+14% Growth</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-500 uppercase">Avg View Duration</span>
                        <span className="text-slate-800">2m 42s</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-500 uppercase">Saved Rate</span>
                        <span className="text-slate-800">6.8%</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

const MetricCard: React.FC<{ label: string, value: string | number, trend: string, icon: any, color: string }> = ({ label, value, trend, icon: Icon, color }) => {
    const colorClasses: Record<string, string> = {
        indigo: 'bg-indigo-50 text-indigo-600',
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-700',
        amber: 'bg-amber-50 text-amber-600'
    };
    
    return (
      <div className="bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm hover:shadow-lg hover:border-indigo-400 transition-all group">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 ${colorClasses[color]}`}>
            <Icon size={18} />
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        </div>
        <p className="text-3xl font-black text-slate-800 italic tracking-tighter">{value}</p>
        <p className="text-[8px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{trend}</p>
      </div>
    );
};

export default ListingJourney;
