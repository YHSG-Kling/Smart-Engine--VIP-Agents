
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, DollarSign, Mail, Settings, ShieldCheck, 
  ArrowRight, CheckCircle2, Clock, 
  ChevronRight, Search, Upload, Star,
  Layers, Zap, FileText, Globe, ExternalLink,
  MessageSquare, UserPlus, Target, BarChart3, AlertTriangle, TrendingDown, TrendingUp, ShieldAlert, Filter, ArrowUpRight,
  Sparkles, MapPin, X, Landmark, ShoppingBag, PieChart, Activity, User, Phone,
  Briefcase, Heart,
  // Added Plus import to fix 'Cannot find name' error
  Plus
} from 'lucide-react';
import { Vendor, Deal, UserRole, VendorStats, MarketplaceVendor } from '../../types';
import { airtableService } from '../../services/airtable';
import { useAuth } from '../../contexts/AuthContext';

const PartnersManager: React.FC = () => {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<'financing' | 'pipeline' | 'analytics' | 'marketplace'>('financing');
  const [lenders, setLenders] = useState<Vendor[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Workflow 151: Lender Performance Metrics
  const [lenderPerformance] = useState([
      { name: 'Luxury Lending Co', avgDaysToClose: 24, commLagHrs: 1.2, missedDeadlines: 0, status: 'Top Performer' },
      { name: 'Standard Mortgage LLC', avgDaysToClose: 32, commLagHrs: 4.8, missedDeadlines: 2, status: 'Average' },
      { name: 'FastTrack Loans', avgDaysToClose: 21, commLagHrs: 0.8, missedDeadlines: 0, status: 'Top Performer' },
      { name: 'BigBank Realty', avgDaysToClose: 45, commLagHrs: 18.5, missedDeadlines: 5, status: 'High Risk' },
  ]);

  // Workflow 85: Marketplace Performance State
  const [marketplaceVendors, setMarketplaceVendors] = useState<MarketplaceVendor[]>([
    { id: 'mv1', companyName: 'CoolAir Inc', category: 'HVAC', rating: 4.8, verified: true, dealsClosed: 42, matchingTags: ['HVAC', 'AC Repair'], insuranceStatus: 'Valid', conversionStats: { clicks: 450, conversions: 12, revenueShare: 1800 }, status: 'Active' },
    { id: 'mv2', companyName: 'GlassPro', category: 'Glass', rating: 4.9, verified: true, dealsClosed: 15, matchingTags: ['Window', 'Glass'], insuranceStatus: 'Valid', conversionStats: { clicks: 120, conversions: 5, revenueShare: 750 }, status: 'Active' },
    { id: 'mv3', companyName: 'PoolKings', category: 'Pool', rating: 4.7, verified: true, dealsClosed: 28, matchingTags: ['Has Pool'], insuranceStatus: 'Valid', conversionStats: { clicks: 800, conversions: 24, revenueShare: 4200 }, status: 'Active' },
  ]);

  const [vendorStats, setVendorStats] = useState<VendorStats[]>([
    { id: 'v1', vendorName: 'Solid Foundation Inspections', totalJobs: 145, averageRating: 4.9, responseTimeAvgHrs: 2, aiHealthScore: 98, status: 'Active', category: 'Inspector', trend: 'Up', recentReviewSentiment: 0.95 },
    { id: 'v2', vendorName: 'Luxury Lending Co', totalJobs: 85, averageRating: 5.0, responseTimeAvgHrs: 1, aiHealthScore: 100, status: 'Active', category: 'Lender', trend: 'Up', recentReviewSentiment: 0.98 },
    { id: 'v3', vendorName: 'MoveIt Pros', totalJobs: 42, averageRating: 3.2, responseTimeAvgHrs: 36, aiHealthScore: 62, status: 'Active', category: 'Mover', trend: 'Down', recentReviewSentiment: 0.45 },
    { id: 'v4', vendorName: 'Reliable Roofing', totalJobs: 28, averageRating: 4.5, responseTimeAvgHrs: 12, aiHealthScore: 88, status: 'Active', category: 'Roofing', trend: 'Stable', recentReviewSentiment: 0.82 },
    { id: 'v5', vendorName: 'Standard Mortgage LLC', totalJobs: 340, averageRating: 4.8, responseTimeAvgHrs: 4, aiHealthScore: 94, status: 'Active', category: 'Lender', trend: 'Stable', recentReviewSentiment: 0.91 },
    { id: 'v6', vendorName: 'Late Movers LLC', totalJobs: 12, averageRating: 2.1, responseTimeAvgHrs: 72, aiHealthScore: 35, status: 'Probation', category: 'Mover', trend: 'Down', recentReviewSentiment: 0.15 },
  ]);

  const mockLenders: Vendor[] = [
    {
      id: 'l1',
      companyName: 'Luxury Lending Co',
      category: 'Lender',
      rating: 5.0,
      verified: true,
      insuranceStatus: 'Valid',
      dealsClosed: 85,
      minCreditScore: 720,
      email: 'vip@luxlending.com',
      logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      introTemplateId: 'High Net Worth',
      catchmentCriteria: 'Jumbo Loans / Portfolio',
      status: 'Active'
    },
    {
      id: 'l2',
      companyName: 'Standard Mortgage LLC',
      category: 'Lender',
      rating: 4.8,
      verified: true,
      insuranceStatus: 'Valid',
      dealsClosed: 340,
      minCreditScore: 620,
      email: 'referrals@standard.com',
      logoUrl: 'https://images.unsplash.com/photo-1554774853-710156d9c1e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      introTemplateId: 'Conventional FHA',
      catchmentCriteria: 'Conventional / FHA / VA',
      status: 'Active'
    }
  ];

  const mockPipeline: Deal[] = [
    {
      id: 'd1', address: '123 Main St', price: 850000, stage: 'Financing',
      clientName: 'Alice Freeman', healthScore: 90, healthStatus: 'Healthy',
      nextTask: 'Follow up on App', missingDocs: 0,
      lenderReferralStatus: 'Sent', assignedLender: 'Luxury Lending Co',
      winProbability: 95
    },
    {
      id: 'd2', address: '456 Oak Ave', price: 420000, stage: 'Financing',
      clientName: 'Bob Driller', healthScore: 75, healthStatus: 'At Risk',
      nextTask: 'Resend Intro', missingDocs: 1,
      lenderReferralStatus: 'Viewed', assignedLender: 'Standard Mortgage LLC',
      winProbability: 75
    }
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setLenders(mockLenders);
      setDeals(mockPipeline);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const isManagement = role === UserRole.ADMIN || role === UserRole.BROKER;

  return (
    <div className="space-y-5 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Partners Desk.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] mt-0.5">Financing & Network Performance</p>
        </div>
        
        <div className="flex bg-white rounded-xl p-0.5 border border-slate-200 shadow-sm overflow-x-auto">
          <button 
            onClick={() => setActiveTab('financing')}
            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'financing' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Landmark size={12} /> Financing
          </button>
          <button 
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'pipeline' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Zap size={12} /> Pipeline
          </button>
          <button 
              onClick={() => setActiveTab('marketplace')}
              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'marketplace' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <ShoppingBag size={12} /> Marketplace
            </button>
          {isManagement && (
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <BarChart3 size={12} /> Apex
            </button>
          )}
        </div>
      </div>

      {activeTab === 'financing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
          {lenders.map(lender => (
            <div key={lender.id} className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:border-indigo-400 transition-all flex flex-col group relative overflow-hidden">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner overflow-hidden">
                    {lender.logoUrl ? <img src={lender.logoUrl} className="w-full h-full object-cover" /> : <Landmark size={32} className="text-slate-400" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">{lender.companyName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-indigo-50 text-indigo-700 text-[8px] font-black px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-widest">{lender.catchmentCriteria}</span>
                      <div className="flex text-amber-400"><Star size={12} fill="currentColor"/> <span className="text-[10px] font-black ml-1">{lender.rating}</span></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Min Credit Score</p>
                    <p className="text-lg font-black text-slate-800 tabular-nums">{lender.minCreditScore}+</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Deals</p>
                    <p className="text-lg font-black text-indigo-600 tabular-nums">{lender.dealsClosed}</p>
                  </div>
                </div>

                <div className="mt-auto flex gap-3">
                  <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-black transition-all">
                    <Mail size={14}/> Contact Partner
                  </button>
                  <button className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all">
                    <Zap size={14}/> AI Nudge
                  </button>
                </div>
            </div>
          ))}
          <button className="border-4 border-dashed border-slate-100 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center gap-3 group hover:border-indigo-200 transition-all">
            <Plus size={32} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Onboard New Lender</span>
          </button>
        </div>
      )}

      {activeTab === 'pipeline' && (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden animate-fade-in-up">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    <tr>
                        <th className="p-8">Active Deal</th>
                        <th className="p-8">Assigned Lender</th>
                        <th className="p-8">Referral State</th>
                        <th className="p-8 text-center">Predictive Close</th>
                        <th className="p-8 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                    {deals.map(deal => (
                        <tr key={deal.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="p-8">
                                <div className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">{deal.address}</div>
                                <div className="text-[8px] text-slate-400 uppercase font-black">Client: {deal.clientName}</div>
                            </td>
                            <td className="p-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-inner">
                                        <Landmark size={16}/>
                                    </div>
                                    <span className="font-black text-slate-800 uppercase">{deal.assignedLender || 'Unassigned'}</span>
                                </div>
                            </td>
                            <td className="p-8">
                                <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${
                                    deal.lenderReferralStatus === 'Sent' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                    deal.lenderReferralStatus === 'Viewed' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                    'bg-slate-50 text-slate-500 border-slate-200'
                                }`}>
                                    {deal.lenderReferralStatus}
                                </span>
                            </td>
                            <td className="p-8 text-center">
                                <div className="font-black text-slate-700 tabular-nums">{deal.predictedClose || 'TBD'}</div>
                                <div className="text-[7px] text-emerald-600 font-black uppercase mt-1">AI Conf: {deal.winProbability}%</div>
                            </td>
                            <td className="p-8 text-right">
                                <button className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm">
                                    <ChevronRight size={18}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}

      {activeTab === 'marketplace' && (
        <div className="space-y-8 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {marketplaceVendors.map(mv => (
                    <div key={mv.id} className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm flex flex-col group hover:border-indigo-400 transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-inner">
                                    <ShoppingBag size={24}/>
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight italic">{mv.companyName}</h4>
                                    <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">{mv.category}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-emerald-600 tracking-tighter tabular-nums">${mv.conversionStats?.revenueShare.toLocaleString()}</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase">Rev Share YTD</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="text-center"><p className="text-[8px] font-black text-slate-400 uppercase">Clicks</p><p className="text-lg font-black">{mv.conversionStats?.clicks}</p></div>
                            <div className="text-center"><p className="text-[8px] font-black text-slate-400 uppercase">Conv.</p><p className="text-lg font-black">{mv.conversionStats?.conversions}</p></div>
                            <div className="text-center"><p className="text-[8px] font-black text-slate-400 uppercase">Rate</p><p className="text-lg font-black">{Math.round((mv.conversionStats?.conversions || 0) / (mv.conversionStats?.clicks || 1) * 100)}%</p></div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-auto">
                            {mv.matchingTags.map(tag => <span key={tag} className="bg-slate-100 text-slate-500 text-[8px] font-black px-2 py-0.5 rounded uppercase">{tag}</span>)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fade-in-up">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-md overflow-hidden">
                  <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
                              <Landmark size={24}/>
                          </div>
                          <div>
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Lender Performance Matrix.</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Workflow 151: Communication & Velocity Benchmarking</p>
                          </div>
                      </div>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                              <tr>
                                  <th className="p-8">Lender Entity</th>
                                  <th className="p-8 text-center">Avg Days to Close</th>
                                  <th className="p-8 text-center">Comm Lag Time</th>
                                  <th className="p-8 text-center">Missed Deadlines</th>
                                  <th className="p-8 text-right">Logic Status</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                              {lenderPerformance.map((lp, i) => (
                                  <tr key={i} className={`hover:bg-slate-50 transition-colors ${lp.status === 'High Risk' ? 'bg-red-50/50' : ''}`}>
                                      <td className="p-8">
                                          <div className="font-black text-slate-900 uppercase tracking-tight italic">{lp.name}</div>
                                      </td>
                                      <td className="p-8 text-center">
                                          <div className={`text-lg font-black ${lp.avgDaysToClose > 35 ? 'text-red-600' : 'text-slate-800'}`}>{lp.avgDaysToClose} Days</div>
                                      </td>
                                      <td className="p-8 text-center">
                                          <div className={`text-lg font-black ${lp.commLagHrs > 10 ? 'text-red-600' : 'text-indigo-600'}`}>{lp.commLagHrs}h</div>
                                      </td>
                                      <td className="p-8 text-center">
                                          <div className={`text-lg font-black ${lp.missedDeadlines > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{lp.missedDeadlines}</div>
                                      </td>
                                      <td className="p-8 text-right">
                                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${
                                              lp.status === 'Top Performer' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                              lp.status === 'High Risk' ? 'bg-red-600 text-white border-red-700 animate-pulse' :
                                              'bg-slate-50 text-slate-500 border-slate-200'
                                          }`}>
                                              {lp.status}
                                          </span>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                    <h4 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><PieChart size={16} className="text-indigo-600"/> Network Retention</h4>
                    <div className="h-64 flex items-center justify-center">
                        <Activity size={100} className="text-slate-100 animate-pulse-subtle" />
                    </div>
                </div>
                <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl flex flex-col justify-center">
                    <h4 className="font-black text-[10px] text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><Star size={16}/> Top Rated Partner</h4>
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center text-slate-900 font-black text-3xl">L</div>
                        <div>
                            <p className="text-2xl font-black italic tracking-tighter uppercase leading-none">Luxury Lending Co</p>
                            <p className="text-sm text-indigo-300 font-bold uppercase mt-2">100% On-Time Delivery</p>
                        </div>
                    </div>
                </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default PartnersManager;
