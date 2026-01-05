
import React, { useState, useEffect } from 'react';
import { 
  Users, Mail, ShieldCheck, Zap, BarChart3, 
  Landmark, ShoppingBag, Star, TrendingUp, Bot,
  RefreshCw, DollarSign, Clock, Search, ShieldAlert,
  ArrowRight, Shield, Ban, ClipboardList, Activity,
  Phone, Globe, PieChart, Plus, Loader2, Sparkles
} from 'lucide-react';
import { Vendor, Deal, UserRole, MarketplaceVendor, FEATURE_FLAGS, CreditPartnerReferral } from '../../types';
import { airtableService, airtableCreditService } from '../../services/airtable';
import { n8nService } from '../../services/n8n';
import { useAuth } from '../../contexts/AuthContext';

const PartnersManager: React.FC = () => {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<'financing' | 'pipeline' | 'analytics' | 'marketplace' | 'credit'>('financing');
  const [lenders, setLenders] = useState<Vendor[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creditReferrals, setCreditReferrals] = useState<CreditPartnerReferral[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await airtableService.getVendors();
      setLenders(data?.filter(v => v.category === 'Lender') || []);
      const pipeData = await airtableService.getTransactions();
      setDeals(pipeData || []);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleCreditWorkflow = async (id: string, action: string) => {
    await n8nService.triggerWorkflow(action, { contextId: id });
    alert(`Success: Credit ${action} sequence dispatched.`);
  };

  return (
    <div className="space-y-5 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Partners Desk.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] mt-0.5">Financing & Network Performance</p>
        </div>
        
        <div className="flex bg-white rounded-xl p-0.5 border border-slate-200 shadow-sm overflow-x-auto">
          {[
              { id: 'financing', label: 'Financing', icon: Landmark },
              { id: 'pipeline', label: 'Pipeline', icon: Zap },
              { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
              { id: 'credit', label: 'Credit Copilot', icon: Shield, flag: FEATURE_FLAGS.CREDIT_COPILOT },
              { id: 'analytics', label: 'Apex', icon: BarChart3 },
          ].filter(t => !t.flag || t.flag).map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <tab.icon size={12} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'credit' && (
          <div className="space-y-8 animate-fade-in-up">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600">
                  <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Shield size={180}/></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                      <div className="max-w-xl">
                          <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Credit Copilot.</h3>
                          <p className="text-indigo-100 text-sm font-medium leading-relaxed italic">
                            "System detected 3 leads with credit scores below the threshold of 620. Workflow 155 is currently monitoring conversational sentiment for optimal referral windows."
                          </p>
                      </div>
                      <div className="shrink-0 flex flex-col gap-3">
                          <button onClick={() => handleCreditWorkflow('all', 'wf-credit-intake')} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-500 active:scale-95 transition-all border-b-4 border-indigo-900 flex items-center gap-2">
                              <Sparkles size={18}/> Start Credit Path
                          </button>
                          <p className="text-[8px] font-black text-indigo-400 uppercase text-center tracking-widest">FCRA / CROA Compliant Logic</p>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                      { l: 'Refer to Partner', d: 'Bridge handoff to preferred credit restoration partner.', i: Users, a: 'wf-credit-refer' },
                      { l: 'Re-engage', d: 'Dispatch a value-based re-engagement sequence to stalled credit leads.', i: RefreshCw, a: 'wf-credit-reengage' },
                      { l: 'Regulatory Audit', d: 'Review disclosure logs and partner feedback logs.', i: ClipboardList, a: 'wf-credit-audit' },
                  ].map(card => (
                      <div key={card.l} className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm flex flex-col group hover:border-indigo-400 transition-all">
                          <div className="p-4 rounded-3xl bg-indigo-50 text-indigo-600 shadow-inner w-fit mb-6 group-hover:scale-110 transition-transform">
                              <card.i size={24}/>
                          </div>
                          <h4 className="font-black text-slate-900 uppercase tracking-tight text-xl mb-2">{card.l}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium mb-10 flex-1">"{card.d}"</p>
                          <button onClick={() => handleCreditWorkflow('manual', card.a)} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-black transition-all">
                              Initialize Protocol <ArrowRight size={14}/>
                          </button>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default PartnersManager;
