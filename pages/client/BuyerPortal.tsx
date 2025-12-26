
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowRight, Zap, BookOpen, Activity, CheckCircle2, 
  ChevronRight, RefreshCw, Sparkles, Bot, MessageSquare, 
  Phone, Send, X, Home, Target, TrendingUp, Calculator, 
  MapPin, Eye, Star, Users, Briefcase, DollarSign, Clock,
  FileText, Download, ShieldCheck, Heart, Search, Settings,
  Play, Book, FileQuestion, Lightbulb, Lock, User, Mail,
  Edit2, CalendarX, Hammer, FileUp, Loader2, File, PlayCircle,
  ExternalLink, FileCheck, Tag, ShoppingBag, ShieldAlert, Gauge, Landmark,
  PenTool, AlertCircle, Calendar, Globe, Map as MapIcon, Link as LinkIcon,
  Navigation, Trash2, Pen, Plus, Upload, PenSquare, Share2, Award, Wallet, XCircle, TrendingDown, Split,
  Check, Info, LayoutGrid, Circle,
  // Added PhoneCall, MapPin, Navigation to fix name errors
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import SmartMatches from './SmartMatches';
import { UserRole, DetectedDefect, MarketplaceVendor, ResourceGuide, Showing, CalendarSlot, ComplianceChecklistItem, ESignEnvelope, ClientReferral, NegotiationRound, TransactionTask, LoanStage, Tour } from '../../types';
import { n8nService } from '../../services/n8n';

// Shared Playbook Data
const PLAYBOOK_TEMPLATES: any = {
  'buyer_first_time': {
    name: "Home Buying Master Plan",
    theme: "Standard",
    steps: [
      { id: 's1', title: 'Financial Health', status: 'complete', date: 'Oct 15' },
      { id: 's2', title: 'Pre-Approval', status: 'complete', date: 'Oct 20' },
      { id: 's3', title: 'Touring Strategy', status: 'complete', date: 'Oct 25' },
      { id: 's4', title: 'Winning Offer', status: 'complete', date: 'Oct 28' },
      { id: 's5', title: 'Due Diligence', status: 'active', date: 'Active' },
      { id: 's6', title: 'Closing Day', status: 'locked', date: '--' }
    ]
  },
  'seller_journey': {
    name: "Home Selling Roadmap",
    theme: "Seller",
    steps: [
      { id: 's1', title: 'Listing Prep', status: 'complete', date: 'Oct 10' },
      { id: 's2', title: 'Disclosures', status: 'complete', date: 'Oct 12' },
      { id: 's3', title: 'Active Marketing', status: 'active', date: 'Active' },
      { id: 's4', title: 'Negotiation', status: 'locked', date: '--' },
      { id: 's5', title: 'Closing & Move', status: 'locked', date: '--' }
    ]
  },
  'investor_protocol': {
    name: "Investor Wealth Protocol",
    theme: "Investor",
    steps: [
      { id: 's1', title: 'Strategy Session', status: 'complete', date: 'Oct 05' },
      { id: 's2', title: 'Property Analysis', status: 'active', date: 'Active' },
      { id: 's3', title: 'Proof of Funds', status: 'locked', date: '--' },
      { id: 's4', title: 'Off-Market Access', status: 'locked', date: '--' }
    ]
  },
  'relocation_guide': {
    name: "City Relocation Guide",
    theme: "Relocation",
    steps: [
      { id: 's1', title: 'Neighborhood Quiz', status: 'complete', date: 'Oct 22' },
      { id: 's2', title: 'School District Deep Dive', status: 'complete', date: 'Oct 24' },
      { id: 's3', title: 'Commute Analysis', status: 'active', date: 'Active' },
      { id: 's4', title: 'Virtual Tours', status: 'locked', date: '--' },
      { id: 's5', title: 'Utility & Moving Concierge', status: 'locked', date: '--' }
    ]
  }
};

interface BuyerPortalProps {
  onNavigate?: (page: string) => void;
  isMobile?: boolean;
}

const BuyerPortal: React.FC<BuyerPortalProps> = ({ onNavigate, isMobile }) => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'analysis' | 'knowledge' | 'services' | 'tours' | 'vault' | 'rewards' | 'timeline'>('overview');
  const [isBooking, setIsBooking] = useState(false);

  // Workflow 151: Client Loan Milestone State
  const [loanStage, setLoanStage] = useState<LoanStage>('Underwriting');
  const loanMilestones: LoanStage[] = ['Application', 'Processing', 'Underwriting', 'Appraisal', 'Approved', 'CTC'];

  // WF-SHOW-01: Upcoming Tour State
  const [upcomingTour] = useState<Tour | null>({
    id: 'tour_1',
    buyerId: 'client_1',
    buyerName: user?.name || 'You',
    agentId: 'agent_1',
    tourDate: 'Saturday, Nov 11',
    startLocation: 'Nexus Office',
    startTime: '1:00 PM',
    status: 'SentToBuyer',
    stops: [
        { id: 's1', tourId: 'tour_1', propertyId: 'l1', address: '742 Evergreen Terrace', lat: 0, lng: 0, showDurationMinutes: 30, order: 1, arrivalTime: '1:15 PM', imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400' },
        { id: 's2', tourId: 'tour_1', propertyId: 'l2', address: '12 Grimmauld Place', lat: 0, lng: 0, showDurationMinutes: 30, order: 2, arrivalTime: '2:10 PM', imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400' },
        { id: 's3', tourId: 'tour_1', propertyId: 'l3', address: '1313 Mockingbird Lane', lat: 0, lng: 0, showDurationMinutes: 30, order: 3, arrivalTime: '3:05 PM', imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400' }
    ]
  });

  // Workflow 148: Client Timeline state
  const [clientTasks] = useState<TransactionTask[]>([
      { id: 'ct1', dealId: '1', title: 'Schedule Professional Movers', status: 'To Do', priority: 'Med', category: 'Logistics', due: '2024-11-20', phase: 'Closing', assignedTo: 'Client', description: 'Agent suggests booking at least 14 days before close.' },
      { id: 'ct2', dealId: '1', title: 'Confirm Homeowners Insurance Binder', status: 'To Do', priority: 'High', category: 'Financing', due: '2024-11-10', phase: 'Financing', assignedTo: 'Client', description: 'Send your binder to the lender to hit your CTC milestone.' },
      { id: 'ct3', dealId: '1', title: 'Review HOA Resale Certificate', status: 'In Progress', priority: 'Critical', category: 'Due Diligence', due: '2024-11-07', phase: 'Inspection', assignedTo: 'Client' },
      { id: 'ct4', dealId: '1', title: 'Sign E-Consent Form', status: 'Done', priority: 'Med', category: 'Compliance', due: '2024-11-01', phase: 'Inspection', assignedTo: 'Client' },
  ]);

  // Workflow 147: Negotiation View C
  const [activeCounter, setActiveCounter] = useState<NegotiationRound | null>({
      id: 'r2', dealId: '1', roundNumber: 2, offerPrice: 515000, concessions: 'No appliances, $5k repair credit', closingDate: '2024-12-01', status: 'Received', timestamp: 'Just Now', source: 'Other Side'
  });

  const handleNegotiationDecision = async (decision: 'Accept' | 'Reject' | 'Counter') => {
      setIsBooking(true);
      await n8nService.logNegotiationDecision('r2', decision);
      setTimeout(() => {
          setIsBooking(false);
          setActiveCounter(null);
          alert(`Decision: "${decision}" has been logged. Your agent has been notified to draft the paperwork.`);
      }, 1500);
  };

  // Workflow 142: Referral Engine State (View C)
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralForm, setReferralForm] = useState({ friendName: '', friendPhone: '', notes: '' });
  const [myReferrals, setMyReferrals] = useState<ClientReferral[]>([
      { id: 'r1', referrerId: 'current', referrerName: user?.name || '', friendName: 'David Wood', friendPhone: '512-555-0810', status: 'Contacted', rewardStatus: 'Sent', rewardType: '$100 Amazon Card', timestamp: 'Oct 15' },
      { id: 'r2', referrerId: 'current', referrerName: user?.name || '', friendName: 'Sarah Jenkins', friendPhone: '512-555-0911', status: 'Closed Deal', rewardStatus: 'Pending', rewardType: '$500 Closing Credit', timestamp: 'Today' },
  ]);

  // Workflow 137: Compliance Checklist State
  const [complianceChecklist] = useState<ComplianceChecklistItem[]>([
    { id: 'ci1', dealId: '1', documentName: 'Buyer Agency Agreement', status: 'Approved', sourceRule: 'Base Protocol' },
    { id: 'ci2', dealId: '1', documentName: 'Pre-Approval Letter', status: 'Approved', sourceRule: 'Base Protocol' },
    { id: 'ci3', dealId: '1', documentName: 'Lead-Based Paint Disclosure', status: 'Missing', sourceRule: 'AI (Built < 1978)' },
    { id: 'ci4', dealId: '1', documentName: 'Earnest Money Receipt', status: 'Pending Review', sourceRule: 'Contract Term' },
  ]);

  const handleReferSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsBooking(true);
      await n8nService.submitReferral({ ...referralForm, referrerEmail: user?.email });
      setTimeout(() => {
          setMyReferrals([
              { id: Date.now().toString(), referrerId: 'current', referrerName: user?.name || '', friendName: referralForm.friendName, friendPhone: referralForm.friendPhone, status: 'New', rewardStatus: 'Pending', rewardType: 'Processing...', timestamp: 'Just Now' },
              ...myReferrals
          ]);
          setIsBooking(false);
          setShowReferralModal(false);
          alert("Referral Logged! I'll reach out to them personally and update you once the gift is triggered.");
      }, 1500);
  };

  // Workflow 141: Review Interaction
  const [showClosingSurvey, setShowClosingSurvey] = useState(false);
  const [clientRating, setClientRating] = useState(0);
  const [internalFeedback, setInternalFeedback] = useState('');
  const [surveyStep, setSurveyStep] = useState(1); // 1: Stars, 2: Feedback/Redirect

  // Mock checking if transaction is closed to trigger survey
  useEffect(() => {
      if (role === UserRole.BUYER && user?.email === 'buyer@gmail.com') {
          const timer = setTimeout(() => setShowClosingSurvey(true), 3000);
          return () => clearTimeout(timer);
      }
  }, [role, user]);

  const handleSurveySubmit = () => {
    if (clientRating === 5) {
        window.open('https://g.page/nexus-real-estate/review', '_blank');
        setShowClosingSurvey(false);
    } else {
        setSurveyStep(2);
    }
  };

  const handleFinalInternalSubmit = async () => {
      setIsBooking(true);
      await n8nService.triggerReviewCampaign('deal_1', clientRating < 4 ? 'Rocky' : 'Neutral');
      setTimeout(() => {
          setIsBooking(false);
          setShowClosingSurvey(false);
          alert("Thank you for your feedback. Our quality control team will review this internally.");
      }, 1500);
  };

  // Workflow 122/123/124/126: Client Tour Data
  const [myTours, setMyTours] = useState<Showing[]>([
    { 
        id: 'sh1', propertyId: 'l1', leadId: 'current', address: '123 Main St', 
        leadName: user?.name || 'You', requestedTime: 'Pending Slot Pick', status: 'Picking Slots', 
        isPreQualified: true,
        proposedSlots: [
            { id: 'ps1', showingId: 'sh1', start: 'Tue, Nov 5 @ 2:00 PM', end: '3:00 PM', selected: false },
            { id: 'ps2', showingId: 'sh1', start: 'Tue, Nov 5 @ 4:00 PM', end: '5:00 PM', selected: false },
            { id: 'ps3', showingId: 'sh1', start: 'Wed, Nov 6 @ 10:00 AM', end: '11:00 AM', selected: false },
        ]
    },
    { id: 'sh3', propertyId: 'l2', leadId: 'current', address: '456 Oak Ave', leadName: user?.name || 'You', requestedTime: 'Sunday, 1:00 PM', status: 'Confirmed', isPreQualified: true, lockboxCode: '1992', clientBriefingLink: '#' },
    { id: 'sh4', propertyId: 'l3', leadId: 'current', address: '789 Skyline Dr', leadName: user?.name || 'You', requestedTime: 'Oct 28, 4:00 PM', status: 'Completed', isPreQualified: true, clientPrivateNotes: 'Really liked the rooftop view. Master closet is smaller than expected.' },
  ]);

  const [savingNote, setSavingNote] = useState<string | null>(null);

  const handlePickSlot = async (showingId: string, slotId: string) => {
      setIsBooking(true);
      const showing = myTours.find(s => s.id === showingId);
      const slot = showing?.proposedSlots?.find(s => s.id === slotId);
      await n8nService.finalizeShowingBooking(showingId, slotId);
      setTimeout(() => {
          setMyTours(prev => prev.map(s => {
              if (s.id === showingId) {
                  return { ...s, status: 'Confirmed', requestedTime: slot!.start, proposedSlots: [] };
              }
              return s;
          }));
          setIsBooking(false);
          alert(`Success! Your tour for ${showing?.address} is confirmed for ${slot?.start}. Calendar invite sent.`);
      }, 1500);
  };

  const handleSavePrivateNote = async (showingId: string, note: string) => {
      setSavingNote(showingId);
      await n8nService.saveClientPrivateNote(showingId, note);
      setTimeout(() => {
          setMyTours(prev => prev.map(s => s.id === showingId ? { ...s, clientPrivateNotes: note } : s));
          setSavingNote(null);
      }, 800);
  };

  const [unlockedGuides] = useState<ResourceGuide[]>([
    { id: 'g1', title: '78704 Neighborhood Spotlight', description: 'Deep dive into why Bouldin and Zilker remain Austin hot spots.', category: 'Market', unlockedAt: 'Today', isNew: true },
    { id: 'g2', title: 'Luxury Condo Wealth Strategy', description: 'How high-rise equity differs from single family residential.', category: 'Expertise', unlockedAt: 'Yesterday' },
    { id: 'g3', title: 'The Closing Checklist', description: 'Everything you need for a smooth handoff.', category: 'Process', unlockedAt: '2 days ago' }
  ]);

  const [selectedGuide, setSelectedGuide] = useState<ResourceGuide | null>(null);

  const [defects] = useState<DetectedDefect[]>([
    { id: 'def1', transactionId: 'deal1', description: 'HVAC system requires immediate servicing. Filter dirty and condenser fan sluggish.', severity: 'Med', category: 'HVAC', matchedCategory: 'HVAC', matchedOffer: 'CoolAir Inc - 15% Off Tune-up' },
    { id: 'def2', transactionId: 'deal1', description: 'Double pane seal failure on master bedroom window.', severity: 'Low', category: 'Glass', matchedCategory: 'Glass', matchedOffer: 'GlassPro - $50 Credit for Nexus Clients' }
  ]);

  const activePlaybook = useMemo(() => {
    let templateId = 'buyer_first_time';
    if (role === UserRole.SELLER) {
        templateId = 'seller_journey';
    } else if (user?.email?.includes('investor')) {
        templateId = 'investor_protocol';
    } else if (user?.email?.includes('relo')) {
        templateId = 'relocation_guide';
    }
    return PLAYBOOK_TEMPLATES[templateId];
  }, [role, user]);

  const stats = useMemo(() => {
    const completed = activePlaybook.steps.filter((s: any) => s.status === 'complete').length;
    const total = activePlaybook.steps.length;
    const progress = Math.round((completed / total) * 100);
    const currentStep = activePlaybook.steps.find((s: any) => s.status === 'active') || activePlaybook.steps[activePlaybook.steps.length - 1];
    
    return {
        progress,
        currentStepTitle: currentStep.title,
        completedCount: completed,
        totalCount: total,
        daysActive: 12 + (completed * 2)
    };
  }, [activePlaybook]);

  return (
    <div className={`space-y-6 animate-fade-in ${isMobile ? 'pb-24' : 'pb-20'}`}>
      
      {/* Workflow 147: Decision Card (Incoming Counter) */}
      {activeCounter && (
          <div className="bg-white rounded-[2rem] border-2 border-indigo-200 shadow-2xl overflow-hidden animate-fade-in-up relative ring-4 ring-indigo-50">
              <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl"><Split size={20}/></div>
                      <h3 className="font-black text-sm uppercase tracking-widest leading-none">Decision Required: Counter Offer</h3>
                  </div>
                  <button onClick={() => setActiveCounter(null)} className="text-white/50 hover:text-white transition-colors"><X size={18}/></button>
              </div>
              <div className="p-8 flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1 text-center md:text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SELLER COUNTERED AT</p>
                      <h4 className="text-4xl font-black text-slate-900 tracking-tighter italic">${activeCounter.offerPrice.toLocaleString()}</h4>
                      <p className="text-sm font-bold text-indigo-600 mt-2 flex items-center gap-1.5">
                        <Calendar size={14}/> Proposed Closing: {new Date(activeCounter.closingDate).toLocaleDateString()}
                      </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                      <button 
                        onClick={() => handleNegotiationDecision('Accept')}
                        disabled={isBooking}
                        className="flex-1 sm:flex-none px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                          {isBooking ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>} Accept
                      </button>
                      <button 
                        onClick={() => handleNegotiationDecision('Counter')}
                        disabled={isBooking}
                        className="flex-1 sm:flex-none px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                          <RefreshCw size={14}/> Counter
                      </button>
                      <button 
                        onClick={() => handleNegotiationDecision('Reject')}
                        disabled={isBooking}
                        className="flex-1 sm:flex-none px-8 py-4 bg-white border-2 border-red-100 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-50 active:scale-95 transition-all"
                      >
                          Reject
                      </button>
                  </div>
              </div>
              <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center gap-3">
                  <Info size={14} className="text-indigo-400"/>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Consult with your agent before accepting. This counter expires in 24 hours.</p>
              </div>
          </div>
      )}

      {/* Hero Section with Loan Progress */}
      <div className={`bg-slate-900 ${isMobile ? 'rounded-2xl' : 'rounded-[1.5rem]'} overflow-hidden shadow-xl relative border-b-4 border-indigo-600`}>
        <div className="absolute inset-0 opacity-15">
            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3" alt="Background" className="w-full h-full object-cover blur-[2px]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/60" />
        
        <div className={`relative z-10 ${isMobile ? 'p-6' : 'p-8'}`}>
            <div className={`flex flex-col ${isMobile ? 'items-center text-center' : 'md:flex-row justify-between items-start md:items-end'} gap-6 mb-8`}>
                <div>
                    <div className={`flex items-center gap-3 mb-4 ${isMobile ? 'justify-center' : ''}`}>
                        <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border border-indigo-400/30">
                            {role === UserRole.SELLER ? 'Listing Phase' : activePlaybook.theme + ' Phase'}
                        </span>
                        <span className="text-slate-400 text-[10px] flex items-center gap-1 font-black uppercase tracking-widest">
                            <Clock size={12} className="text-emerald-400" /> {stats.daysActive} Days Active
                        </span>
                    </div>
                    <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl md:text-4xl'} font-black text-white mb-2 italic tracking-tighter uppercase leading-none`}>
                        {activePlaybook.name}.
                    </h1>
                </div>
                {role === UserRole.BUYER && (
                  <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-4">
                      <div className="text-right">
                          <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest">Loan Status</p>
                          <p className="text-sm font-black text-white">{loanStage}</p>
                      </div>
                      <div className="flex gap-1">
                          {loanMilestones.map((m, i) => (
                              <div key={i} className={`w-1.5 h-1.5 rounded-full ${loanMilestones.indexOf(loanStage) >= i ? 'bg-indigo-500' : 'bg-white/20'}`} />
                          ))}
                      </div>
                  </div>
                )}
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 max-w-4xl">
                <div className="flex justify-between items-end mb-4 text-white">
                    <div>
                        <h4 className="font-black text-[9px] uppercase tracking-[0.3em] text-indigo-300 mb-1">JOURNEY PROGRESS</h4>
                        <p className={`text-sm text-slate-200 font-bold italic ${isMobile ? 'line-clamp-1' : ''}`}>Next: "{stats.currentStepTitle}"</p>
                    </div>
                    <div className="text-right">
                        <span className="font-black text-3xl tracking-tighter">{stats.progress}%</span>
                    </div>
                </div>
                <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.3)] rounded-full" style={{ width: `${stats.progress}%` }} />
                </div>
            </div>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex bg-white rounded-xl p-1 border border-slate-200 w-fit shadow-md overflow-x-auto max-w-full scrollbar-hide">
          {[
              { id: 'overview', label: 'Timeline' },
              { id: 'timeline', label: "What's Next" },
              { id: 'matches', label: 'Matches' },
              { id: 'tours', label: 'My Tours' },
              { id: 'rewards', label: 'Rewards Hub' },
              { id: 'vault', label: 'Vault' },
              { id: 'knowledge', label: 'Library' },
              { id: 'services', label: 'Services' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>{tab.label}</button>
          ))}
      </div>

      {/* --- TAB: OVERVIEW (Timeline & Upcoming Tour) --- */}
      {activeTab === 'overview' && (
          <div className="animate-fade-in space-y-6">
              {/* WF-SHOW-01: Upcoming Tour Itinerary */}
              {upcomingTour && (
                  <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group hover:border-white transition-all duration-500 border-4 border-transparent">
                      <div className="absolute right-0 top-0 p-12 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000"><Navigation size={200}/></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md border border-white/30">
                                <Sparkles size={20}/>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-100">Smart Tour Ready</span>
                        </div>
                        <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-2 leading-none">Tour Itinerary.</h3>
                        <p className="text-xl font-black text-indigo-200 uppercase tracking-tight mb-8">
                            {upcomingTour.tourDate} • Starts {upcomingTour.startTime}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="space-y-4">
                                {upcomingTour.stops.map((stop, i) => (
                                    <div key={stop.id} className="bg-white/10 p-4 rounded-2xl border border-white/20 flex items-center gap-4 group/stop hover:bg-white/20 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-white text-indigo-600 flex items-center justify-center font-black italic shadow-lg shadow-indigo-900/40 shrink-0">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white leading-none mb-1">{stop.address.split(',')[0]}</p>
                                            <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Arrival: {stop.arrivalTime}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-black/20 p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
                                <div>
                                    <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-3">Your Showing Agent</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500 border border-white/20 flex items-center justify-center font-black text-xl italic shadow-lg">SS</div>
                                        <div>
                                            <p className="text-base font-black text-white uppercase tracking-tight leading-none">Sarah Smith</p>
                                            <p className="text-[10px] font-bold text-indigo-300 uppercase mt-1">Primary Contact</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-8">
                                    <button className="flex-1 py-3 bg-white text-indigo-900 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all"><Phone size={14}/> Call</button>
                                    <button className="flex-1 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2"><Navigation size={14}/> Map</button>
                                </div>
                            </div>
                        </div>
                      </div>
                  </div>
              )}

              <div className={`bg-white rounded-[2rem] border border-slate-200 shadow-sm ${isMobile ? 'p-6' : 'p-8'} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Zap size={120} /></div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Playbook Stream</h3>
                <div className="space-y-8">
                    {activePlaybook.steps.map((step: any, idx: number) => (
                        <div key={step.id} className="flex items-center gap-6 relative group">
                            <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center transition-all duration-700 z-10 shrink-0 ${
                                step.status === 'complete' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-inner' :
                                step.status === 'active' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-110 ring-4 ring-indigo-50' : 'bg-slate-50 text-slate-300'
                            }`}>
                                {step.status === 'complete' ? <CheckCircle2 size={24}/> : step.status === 'locked' ? <Lock size={18}/> : <span className="font-black text-lg">{idx + 1}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-lg font-black uppercase tracking-tight truncate ${step.status === 'locked' ? 'text-slate-300' : 'text-slate-900'}`}>{step.title}</p>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5 italic">{step.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
      )}

      {/* --- TAB: WHAT'S NEXT (Timeline Tab) --- */}
      {activeTab === 'timeline' && (
          <div className="animate-fade-in space-y-6">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                      <div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Your To-Do List.</h3>
                        <p className="text-sm text-slate-400 font-bold uppercase mt-1">Action Required from You</p>
                      </div>
                      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center gap-4">
                          <Bot size={24} className="text-indigo-600"/>
                          <p className="text-[10px] text-indigo-900 leading-relaxed font-bold italic">"I've updated your timeline based on the accepted contract. These are the critical steps for your success."</p>
                      </div>
                  </div>

                  <div className="space-y-6">
                      {clientTasks.filter(t => t.assignedTo === 'Client' && t.status !== 'Done').map(task => (
                          <div key={task.id} className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-indigo-400 transition-all">
                              <div className="flex items-center gap-5 flex-1">
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                      task.priority === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-white border border-slate-200 text-slate-400'
                                  }`}>
                                      <LayoutGrid size={24}/>
                                  </div>
                                  <div>
                                      <h4 className="font-black text-slate-900 uppercase tracking-tight text-base mb-1">{task.title}</h4>
                                      <div className="flex items-center gap-2">
                                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                                              task.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-200 text-slate-600 border-slate-300'
                                          }`}>{task.priority} Priority</span>
                                          <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest italic flex items-center gap-1">
                                              <Clock size={10}/> Due {new Date(task.due).toLocaleDateString()}
                                          </span>
                                      </div>
                                      {task.description && (
                                          <p className="text-[11px] text-slate-500 font-medium mt-3 italic leading-relaxed">"{task.description}"</p>
                                      )}
                                  </div>
                              </div>
                              <button className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2" onClick={() => handleFinalInternalSubmit()}>
                                  Mark as Done
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* --- TAB: MATCHES --- */}
      {activeTab === 'matches' && <SmartMatches isMobile={isMobile} />}

      {/* --- TAB: TOURS --- */}
      {activeTab === 'tours' && (
          <div className="animate-fade-in space-y-6">
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden p-8">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Tour Request Monitor</h3>
                      <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                          <Calendar size={14}/> Request New Tour
                      </button>
                  </div>
                  <div className="space-y-6">
                      {myTours.map(tour => (
                          <div key={tour.id} className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 flex flex-col gap-6 group hover:border-indigo-200 transition-all relative overflow-hidden">
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                  <div className="flex items-center gap-6 flex-1">
                                      <div className="w-16 h-16 rounded-[1.5rem] bg-white flex items-center justify-center text-indigo-600 shadow-xl border border-slate-200 shrink-0">
                                          <Home size={32}/>
                                      </div>
                                      <div>
                                          <h4 className="font-black text-slate-900 uppercase tracking-tight text-xl leading-none mb-1">{tour.address}</h4>
                                          <div className="flex items-center gap-2">
                                              <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${
                                                  tour.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                                  tour.status === 'Completed' ? 'bg-slate-200 text-slate-600 border-slate-300' :
                                                  'bg-indigo-50 text-indigo-700 border-indigo-100'
                                              }`}>
                                                  {tour.status}
                                              </span>
                                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time: {tour.requestedTime}</p>
                                          </div>
                                      </div>
                                  </div>
                                  {tour.status === 'Confirmed' && (
                                      <button className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all">
                                          <Navigation size={18}/>
                                      </button>
                                  )}
                              </div>

                              {tour.status === 'Completed' && (
                                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-inner space-y-4">
                                      <div className="flex items-center justify-between">
                                          <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Pen size={12} className="text-indigo-600"/> Private Tour Notes</h4>
                                          {savingNote === tour.id && <Loader2 size={12} className="animate-spin text-indigo-400"/>}
                                      </div>
                                      <textarea 
                                          defaultValue={tour.clientPrivateNotes}
                                          onBlur={(e) => handleSavePrivateNote(tour.id, e.target.value)}
                                          placeholder="What did you think? These notes are only for you..."
                                          className="w-full h-24 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-all"
                                      />
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* --- TAB: REWARDS HUB --- */}
      {activeTab === 'rewards' && (
          <div className="animate-fade-in space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl flex flex-col justify-center text-center relative overflow-hidden border-b-8 border-indigo-600">
                    <div className="absolute right-0 top-0 p-4 opacity-5"><Users size={100}/></div>
                    <p className="text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-2">Friends Referred</p>
                    <h3 className="text-5xl font-black italic tracking-tighter tabular-nums">{myReferrals.length}</h3>
                  </div>
                  <div className="bg-white rounded-[2rem] p-8 border-2 border-slate-200 shadow-sm flex flex-col justify-center text-center group hover:border-indigo-400 transition-all">
                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-2">Earnings Balance</p>
                    <h3 className="text-4xl font-black text-slate-800 tracking-tighter italic tabular-nums">$600</h3>
                    <p className="text-[8px] text-emerald-600 font-black uppercase mt-2">Available for Closing Credit</p>
                  </div>
                  <button 
                    onClick={() => setShowReferralModal(true)}
                    className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl flex flex-col items-center justify-center text-center hover:bg-indigo-700 active:scale-95 transition-all group"
                  >
                    <div className="p-4 bg-white/20 rounded-2xl mb-4 group-hover:rotate-12 transition-transform"><Plus size={32}/></div>
                    <span className="font-black uppercase tracking-[0.25em] text-sm">Refer a Friend</span>
                  </button>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Award size={18} className="text-indigo-600" /> Reward & Referral Ledger
                      </h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                      {myReferrals.map(ref => (
                          <div key={ref.id} className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 group hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-6">
                                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black italic text-slate-400 shadow-sm">
                                      {ref.friendName[0]}
                                  </div>
                                  <div>
                                      <h4 className="font-black text-slate-900 uppercase tracking-tight text-base leading-none mb-1">{ref.friendName}</h4>
                                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Added {ref.timestamp}</p>
                                  </div>
                              </div>
                              <div className="flex items-center gap-10">
                                  <div className="text-center">
                                      <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Status</p>
                                      <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${
                                          ref.status === 'Closed Deal' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                      }`}>{ref.status}</span>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Your Reward</p>
                                      <div className="flex items-center gap-2">
                                          <span className="font-black text-slate-800 uppercase text-xs tracking-tight">{ref.rewardType}</span>
                                          {ref.rewardStatus === 'Sent' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Clock size={16} className="text-orange-400" />}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* --- TAB: VAULT --- */}
      {activeTab === 'vault' && (
          <div className="animate-fade-in space-y-8">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                      <div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Transaction Vault.</h3>
                        <p className="text-sm text-slate-400 font-bold uppercase mt-1">Compliance Checklist</p>
                      </div>
                      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center gap-4">
                          <Bot size={24} className="text-indigo-600"/>
                          <p className="text-[10px] text-indigo-900 leading-relaxed font-bold italic">"Upload your required documents here. AI will scan them for completion instantly."</p>
                      </div>
                  </div>

                  <div className="space-y-4">
                      {complianceChecklist.map(item => (
                          <div key={item.id} className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-indigo-400 transition-all">
                              <div className="flex items-center gap-5 flex-1">
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                      item.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' :
                                      item.status === 'Pending Review' ? 'bg-amber-100 text-amber-600' :
                                      'bg-white border border-slate-200 text-slate-300'
                                  }`}>
                                      {item.status === 'Approved' ? <ShieldCheck size={28}/> : <FileUp size={24}/>}
                                  </div>
                                  <div>
                                      <h4 className="font-black text-slate-900 uppercase tracking-tight text-base mb-1">{item.documentName}</h4>
                                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                                          item.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                          item.status === 'Pending Review' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                          'bg-white text-slate-400 border-slate-200'
                                      }`}>{item.status}</span>
                                  </div>
                              </div>
                              <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">
                                  {item.status === 'Missing' ? 'Upload Doc' : 'View File'}
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* --- TAB: LIBRARY --- */}
      {activeTab === 'knowledge' && (
          <div className="space-y-8 animate-fade-in-up">
              <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-900">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Bot size={180}/></div>
                  <div className="relative z-10 max-w-2xl">
                      <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Resource Library.</h3>
                      <p className="text-indigo-100 text-sm font-medium">Unlocked guides based on your search behavior.</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {unlockedGuides.map(guide => (
                      <div key={guide.id} className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:border-indigo-400 hover:shadow-xl transition-all group flex flex-col justify-between relative overflow-hidden">
                          {guide.isNew && <div className="absolute top-0 right-0 bg-emerald-500 text-white px-3 py-1 rounded-bl-2xl text-[8px] font-black uppercase tracking-widest animate-pulse">New</div>}
                          <div>
                              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                                  <BookOpen size={24}/>
                              </div>
                              <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg leading-tight italic mb-3">{guide.title}</h4>
                              <p className="text-xs text-slate-500 leading-relaxed font-medium mb-8">"{guide.description}"</p>
                          </div>
                          <button onClick={() => setSelectedGuide(guide)} className="text-indigo-600 hover:underline text-[9px] font-black uppercase tracking-widest flex items-center gap-1">Open Guide <ChevronRight size={10}/></button>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* --- TAB: SERVICES --- */}
      {activeTab === 'services' && (
        <div className="animate-fade-in space-y-8">
            <div className="bg-indigo-50 border border-indigo-100 rounded-[2.5rem] p-8 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-xl border border-indigo-50"><ShieldCheck size={32}/></div>
                    <div>
                        <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Vetted Partners.</h4>
                        <p className="text-sm text-slate-600 font-medium">Contractors and service providers verified for your current phase.</p>
                    </div>
                </div>
                <button onClick={() => onNavigate && onNavigate('marketplace')} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-700 transition-all">
                    Explore Marketplace
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {defects.map(defect => (
                    <div key={defect.id} className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-md flex flex-col group hover:border-red-200 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-red-50 text-red-600 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-red-100">Issue Detected</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{defect.matchedCategory}</span>
                        </div>
                        <p className="text-slate-800 font-bold italic mb-6 leading-relaxed">"{defect.description}"</p>
                        <div className="mt-auto bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between">
                            <div>
                                <p className="text-[8px] font-black text-indigo-400 uppercase mb-0.5">Exclusive Offer</p>
                                <p className="text-[10px] font-black text-indigo-900 uppercase">{defect.matchedOffer}</p>
                            </div>
                            <ArrowRight size={16} className="text-indigo-600"/>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default BuyerPortal;
