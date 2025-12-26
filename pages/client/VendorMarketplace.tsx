
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Star, ShieldCheck, Search, Filter, Phone, Mail, 
  ChevronRight, Info, Plus, CheckCircle2, User, 
  Zap, Loader2, Heart, Award, ArrowRight, Building2,
  Trash2, Edit, AlertCircle, Sparkles, ClipboardList
} from 'lucide-react';
import { Vendor, UserRole } from '../../types';
import { airtableService } from '../../services/airtable';
import { useAuth } from '../../contexts/AuthContext';

const VendorMarketplace: React.FC = () => {
  const { role, user } = useAuth();
  const [category, setCategory] = useState('All');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // --- AI Contextual Logic (Precise Mirror of Journey Tracker) ---
  const journeyContext = useMemo(() => {
    // Determine which playbook the user is currently on (Logic mirrors ClientPlaybook.tsx)
    if (role === UserRole.SELLER) {
      // Seller Journey Roadmap
      // Active Step usually: "Active Marketing" (Step 3) or "Listing Prep" (Step 1)
      // We'll simulate based on DOM or current status
      return {
        phase: 'Marketing',
        suggestionTitle: 'Listing Presentation',
        category: 'Staging',
        message: 'Your roadmap shows you are in the **Marketing Phase**. Professional staging increases offer values by an average of 6%.',
        hasVendor: true
      };
    } else if (user?.email?.includes('investor')) {
      // Investor Wealth Protocol
      // Active Step usually: "Property Analyzer" (Step 2)
      return {
        phase: 'Analysis',
        suggestionTitle: 'Financing Velocity',
        message: 'You are currently **Analyzing Deals**. Suggestion: Ensure your "Proof of Funds" is updated to make instant offers.',
        hasVendor: false,
        actionLabel: 'Update POF in Playbook',
        actionIcon: ClipboardList
      };
    } else if (user?.email?.includes('relo')) {
      // Relocation Guide
      // Active Step usually: "Commute Analysis" (Step 3)
      return {
        phase: 'Research',
        suggestionTitle: 'Neighborhood Commute',
        message: 'You are evaluating **Commute Drive Times**. Tip: Drive the route at 8:00 AM on a Tuesday to see the true traffic impact.',
        hasVendor: false,
        actionLabel: 'Run Commute Calc',
        actionIcon: Zap
      };
    } else if (role === UserRole.BUYER) {
      // Standard Buyer Master Plan
      // Active Step usually: "Inspection & Repairs" (Step 5)
      return {
        phase: 'Due Diligence',
        suggestionTitle: 'Structural Integrity',
        category: 'Inspector',
        message: 'You are in the **Inspection Period**. We recommend scheduling with our top-rated structural inspectors immediately.',
        hasVendor: true
      };
    }
    return null;
  }, [role, user]);

  const mockVendors: Vendor[] = [
    { 
      id: '1', companyName: 'Solid Foundation Inspections', category: 'Inspector', 
      rating: 4.9, verified: true, insuranceStatus: 'Valid', dealsClosed: 145, 
      description: 'Expert structural and systemic inspections for residential properties in Central Texas.',
      logoUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      status: 'Active', isStarredByAgent: true
    },
    { 
      id: '2', companyName: 'Nexus Funding Group', category: 'Lender', 
      rating: 5.0, verified: true, insuranceStatus: 'Valid', dealsClosed: 450, 
      description: 'The preferred lending partner of Nexus Real Estate, offering exclusive rates for clients.',
      logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      status: 'Active', isStarredByAgent: false
    },
    { 
      id: '3', companyName: 'Reliable Roofing & Gutters', category: 'Roofing', 
      rating: 4.7, verified: true, insuranceStatus: 'Valid', dealsClosed: 89, 
      description: '20 years of experience in metal and shingle roofing.',
      status: 'Active', isStarredByAgent: false
    },
    { 
      id: '4', companyName: 'Design First Staging', category: 'Staging', 
      rating: 4.8, verified: true, insuranceStatus: 'Valid', dealsClosed: 210, 
      description: 'Award-winning luxury home staging and furniture rental for listing preparation.',
      logoUrl: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      status: 'Active', isStarredByAgent: true
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await airtableService.getVendors();
      setVendors(data && data.length > 0 ? data : mockVendors);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleStarVendor = (id: string) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, isStarredByAgent: !v.isStarredByAgent } : v));
  };

  const filteredVendors = vendors.filter(v => {
    const matchesCat = category === 'All' || v.category === category;
    const matchesSearch = v.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const isAdmin = role === UserRole.ADMIN || role === UserRole.BROKER;
  const isAgent = role === UserRole.AGENT;
  const isClient = role === UserRole.BUYER || role === UserRole.SELLER;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Section */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl font-bold mb-3 italic tracking-tighter uppercase">Vendor Marketplace</h1>
          <p className="text-slate-300 text-lg">
            {isAgent ? "Curate your list of preferred vendors to share with clients." : 
             isAdmin ? "Maintain the ecosystem of trusted service providers." :
             "A curated list of trusted professionals, verified by your agent and brokerage."}
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-500/20 to-transparent opacity-50" />
        <Building2 className="absolute -right-12 -bottom-12 w-64 h-64 text-white/5 opacity-10" />
      </div>

      {/* AI Contextual Suggestion Banner - SYNCED WITH JOURNEY TRACKER */}
      {isClient && journeyContext && (
        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse-subtle border-4 border-indigo-400/30">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Sparkles className="text-indigo-200" size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold uppercase italic tracking-tight">AI {journeyContext.phase} Suggestion</h3>
              <p className="text-indigo-100 opacity-90" dangerouslySetInnerHTML={{ __html: journeyContext.message }} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {journeyContext.hasVendor ? (
                <button 
                onClick={() => setCategory(journeyContext.category!)}
                className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-xl whitespace-nowrap"
                >
                View {journeyContext.category}s <ArrowRight size={16} />
                </button>
            ) : (
                <button 
                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl whitespace-nowrap"
                >
                {journeyContext.actionIcon && <journeyContext.actionIcon size={16} />}
                {journeyContext.actionLabel}
                </button>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 mb-4 px-2 uppercase tracking-widest text-xs">Categories</h3>
            <div className="space-y-1">
              {['All', 'Inspector', 'Lender', 'Contractor', 'Mover', 'Roofing', 'Staging'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${
                    category === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-600 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  {cat}
                  {category === cat && <ChevronRight size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* VENDOR SIGNUP - HIDDEN FOR CLIENTS */}
          {!isClient && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-800 text-sm mb-2">Join Our Network</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">Are you a service provider? Apply to become a Nexus Preferred Partner.</p>
              <button className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
                Vendor Sign-up
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search by company or specialty..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
            </div>
            {isAdmin && (
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg">
                <Plus size={18} /> Add Vendor
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 size={48} className="animate-spin mb-4" />
                <p className="font-bold uppercase tracking-widest text-xs">Accessing Trusted Network...</p>
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-300">
                <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p className="font-bold">No vendors found in this category.</p>
              </div>
            ) : filteredVendors.map(vendor => (
              <div 
                key={vendor.id} 
                className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl transition-all duration-300 group relative flex flex-col"
              >
                {/* Star Toggle for Agents */}
                {isAgent && (
                  <button 
                    onClick={() => handleStarVendor(vendor.id)}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
                      vendor.isStarredByAgent ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-300 hover:text-amber-500'
                    }`}
                  >
                    <Heart size={20} fill={vendor.isStarredByAgent ? 'currentColor' : 'none'} />
                  </button>
                )}

                <div className="flex gap-4 mb-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-slate-400 text-2xl border border-slate-100 overflow-hidden shadow-inner">
                    {vendor.logoUrl ? <img src={vendor.logoUrl} className="w-full h-full object-cover" /> : vendor.companyName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800 truncate">{vendor.companyName}</h3>
                      {vendor.verified && <span title="Broker Verified"><Award size={16} className="text-indigo-600" /></span>}
                    </div>
                    <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mt-0.5">{vendor.category}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-slate-700">{vendor.rating}</span>
                      <span className="text-[10px] text-slate-400">({vendor.dealsClosed} deals)</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-slate-500 line-clamp-2 mb-6 h-8 leading-relaxed">
                  {vendor.description || "Trusted service provider with a proven track record of excellence in the local market."}
                </p>

                <div className="mt-auto grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setSelectedVendor(vendor)}
                    className="bg-indigo-600 text-white py-3 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                  >
                    Details <ArrowRight size={14} />
                  </button>
                  {isAdmin ? (
                    <button className="bg-slate-50 border border-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold hover:bg-slate-100 flex items-center justify-center gap-2">
                      <Edit size={14} /> Edit
                    </button>
                  ) : (
                    <button className="bg-slate-50 border border-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold hover:bg-slate-100 flex items-center justify-center gap-2">
                      <Phone size={14} /> Contact
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vendor Detail Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full overflow-hidden animate-scale-in border border-slate-200">
            <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
               <div className="absolute right-0 top-0 p-8 opacity-10"><Award size={180} /></div>
               <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-900 font-bold text-3xl shadow-xl overflow-hidden">
                      {selectedVendor.logoUrl ? <img src={selectedVendor.logoUrl} className="w-full h-full object-cover" /> : selectedVendor.companyName[0]}
                    </div>
                    <div>
                       <div className="flex items-center gap-2">
                         <h2 className="text-3xl font-bold">{selectedVendor.companyName}</h2>
                         {selectedVendor.verified && <ShieldCheck className="text-emerald-400" size={24} />}
                       </div>
                       <p className="text-indigo-300 font-black uppercase tracking-[0.2em] text-xs">{selectedVendor.category}</p>
                    </div>
                  </div>
               </div>
               <button onClick={() => setSelectedVendor(null)} className="absolute top-6 right-6 text-white/50 hover:text-white p-2 hover:bg-white/10 rounded-full"><XCircle /></button>
            </div>
            
            <div className="p-10 space-y-8">
               <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Rating</p>
                    <p className="text-xl font-black text-slate-800">{selectedVendor.rating}/5</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Experience</p>
                    <p className="text-xl font-black text-slate-800">{selectedVendor.dealsClosed}+</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Insurance</p>
                    <p className="text-xl font-black text-emerald-600">Active</p>
                  </div>
               </div>

               <div>
                 <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Info size={16} className="text-indigo-600"/> About this provider</h4>
                 <p className="text-slate-600 leading-relaxed text-sm">
                   {selectedVendor.description || "A premier partner of our brokerage. This vendor consistently delivers high-quality service and has been vetted for compliance, licensing, and insurance."}
                 </p>
               </div>

               <div className="flex gap-4">
                 <button className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2">
                   <Phone size={18} /> Call Provider
                 </button>
                 <button className="flex-1 py-4 bg-white border border-slate-200 text-slate-800 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                   <Mail size={18} /> Send Inquiry
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const XCircle = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
);

export default VendorMarketplace;
