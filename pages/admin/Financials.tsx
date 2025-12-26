
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Users, 
  PieChart, Download, Calendar, ArrowUpRight, 
  Calculator, AlertOctagon, FileText, Target, 
  Layers, CreditCard, RefreshCw, ChevronRight, BarChart3,
  Link2, Check, ShieldCheck, Loader2, Zap, AlertTriangle, ArrowRight,
  Filter, Search, Clock
} from 'lucide-react';
import { n8nService } from '../../services/n8n';
import { airtableService } from '../../services/airtable';
import { CommissionRecord, MarketingChannel, Payout } from '../../types';

const Financials: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'commissions' | 'expenses' | 'marketing' | 'payouts'>('overview');
  const [isSyncingQB, setIsSyncingQB] = useState(false);
  const [qbLastSync, setQbLastSync] = useState('Today, 9:00 AM');
  
  const [commissionLedger, setCommissionLedger] = useState<CommissionRecord[]>([]);
  const [marketingChannels, setMarketingChannels] = useState<MarketingChannel[]>([]);
  
  // Workflow 53: Payouts State
  const [payouts, setPayouts] = useState<Payout[]>([
      { id: 'p1', agentStripeId: 'acct_123', agentName: 'Sarah Smith', amount: 12000, currency: 'USD', referenceDeal: '123 Main St', status: 'Ready' },
      { id: 'p2', agentStripeId: 'acct_456', agentName: 'Mike Ross', amount: 8400, currency: 'USD', referenceDeal: '456 Oak Ave', status: 'Ready' },
      { id: 'p3', agentStripeId: 'acct_789', agentName: 'Jessica Pearson', amount: 22500, currency: 'USD', referenceDeal: '789 Pine Ln', status: 'Paid', executedAt: 'Oct 22', stripeTransferId: 'tr_ABC123' },
  ]);
  const [isExecutingBatch, setIsExecutingBatch] = useState(false);

  // Commission Calculator State
  const [calcPrice, setCalcPrice] = useState(500000);
  const [calcRate, setCalcRate] = useState(3.0);
  const [calcSplit, setCalcSplit] = useState(80); // 80/20
  const [calcCap, setCalcCap] = useState(20000);
  const [calcCapPaid, setCalcCapPaid] = useState(15000);

  // Mock Data
  const mockCommissions: CommissionRecord[] = [
    { id: 'c1', date: 'Oct 28', address: '123 Main St', agentName: 'Sarah Smith', gci: 15000, split: 0.80, agentNet: 12000, brokerNet: 3000, status: 'Paid' },
    { id: 'c2', date: 'Oct 25', address: '456 Oak Ave', agentName: 'Mike Ross', gci: 12000, split: 0.70, agentNet: 8400, brokerNet: 3600, status: 'Pending' },
    { id: 'c3', date: 'Oct 22', address: '789 Pine Ln', agentName: 'Jessica Pearson', gci: 25000, split: 0.90, agentNet: 22500, brokerNet: 2500, status: 'Dispute' },
  ];

  const mockMarketing: MarketingChannel[] = [
    { channel: 'Google PPC', spend: 4500, leads: 120, deals: 3, gci: 45000, cac: 37.50, roas: '10x' },
    { channel: 'Facebook Ads', spend: 2200, leads: 250, deals: 1, gci: 12000, cac: 8.80, roas: '5.4x' },
    { channel: 'Zillow Premier', spend: 5000, leads: 15, deals: 2, gci: 28000, cac: 333.00, roas: '5.6x' },
  ];

  const expenses = [
    { id: 1, category: 'Office Lease', amount: 4500, status: 'Paid', date: 'Oct 01' },
    { id: 2, category: 'Software (SaaS)', amount: 1200, status: 'Paid', date: 'Oct 05' },
    { id: 3, category: 'Marketing Retainer', amount: 2500, status: 'Pending', date: 'Oct 15' },
    { id: 4, category: 'Brokerage Insurance', amount: 800, status: 'Paid', date: 'Oct 01' },
  ];

  const metrics = {
    revenue: 142500,
    expenses: 45200,
    netIncome: 97300,
    growth: 12.5,
    forecastLower: 130000,
    forecastUpper: 165000,
    liquidityForecast: 84000 
  };

  useEffect(() => {
    const loadData = async () => {
      const comms = await airtableService.getCommissions();
      setCommissionLedger(comms && comms.length > 0 ? comms : mockCommissions);
      const marketing = await airtableService.getMarketingStats();
      setMarketingChannels(marketing && marketing.length > 0 ? marketing : mockMarketing);
    };
    loadData();
  }, []);

  const handleExecuteBatch = async () => {
    const readyPayouts = payouts.filter(p => p.status === 'Ready');
    if (readyPayouts.length === 0) return;

    setIsExecutingBatch(true);
    await n8nService.executePayoutBatch(readyPayouts.map(p => p.id));
    
    setTimeout(() => {
        setPayouts(prev => prev.map(p => 
            p.status === 'Ready' ? { ...p, status: 'Paid', executedAt: 'Just Now', stripeTransferId: 'tr_' + Math.random().toString(36).substr(2, 9) } : p
        ));
        setIsExecutingBatch(false);
    }, 2000);
  };

  const calculateCommission = () => {
    const gci = calcPrice * (calcRate / 100);
    const brokerTakeRaw = gci * ((100 - calcSplit) / 100);
    const remainingCap = Math.max(0, calcCap - calcCapPaid);
    const brokerTake = Math.min(brokerTakeRaw, remainingCap);
    const agentTake = gci - brokerTake;
    return { gci, brokerTake, agentTake, capped: brokerTake < brokerTakeRaw };
  };

  const calcResult = calculateCommission();

  return (
    <div className="space-y-5 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">Finance Hub.</h2>
          <div className="flex items-center gap-2 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isSyncingQB ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">QuickBooks Synced: {qbLastSync}</span>
          </div>
        </div>
        
        <div className="flex bg-white rounded-xl p-0.5 border border-slate-200 shadow-sm overflow-x-auto max-w-full">
            {['overview', 'commissions', 'payouts', 'expenses', 'marketing'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-600 hover:bg-slate-50'}`}
              >
                {tab}
              </button>
            ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-5 animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl relative overflow-hidden border-b-4 border-indigo-600">
              <div className="relative z-10">
                 <p className="text-indigo-400 text-[8px] font-black uppercase tracking-widest mb-0.5">Total GCI (MTD)</p>
                 <h3 className="text-2xl font-black tracking-tighter">${metrics.revenue.toLocaleString()}</h3>
                 <div className="flex items-center gap-1 mt-1 text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                   <ArrowUpRight size={12} /> +{metrics.growth}% TREND
                 </div>
              </div>
              <div className="absolute right-[-10px] bottom-[-10px] opacity-10"><DollarSign size={80} /></div>
            </div>
            {[
              { label: 'OpEx (Gross)', val: metrics.expenses, sub: '+5% MARKETING', color: 'text-slate-800' },
              { label: 'Net Company $', val: metrics.netIncome, sub: '32% PROFIT MARGIN', color: 'text-emerald-600' },
              { label: 'AI Forecast (30d)', val: metrics.liquidityForecast, sub: 'BASED ON 14 DEALS', color: 'text-indigo-600' }
            ].map((m, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{m.label}</p>
                   <h3 className={`text-xl font-black tracking-tight ${m.color}`}>${m.val.toLocaleString()}</h3>
                   <p className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-widest">{m.sub}</p>
                </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'payouts' && (
          <div className="space-y-5 animate-fade-in-up">
              <div className="bg-indigo-600 rounded-[1.5rem] p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="relative z-10 max-w-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md"><Zap size={16} /></div>
                        <h4 className="font-black text-base uppercase tracking-tighter italic">AI Cashflow Sentinel.</h4>
                      </div>
                      <p className="text-indigo-100 text-[11px] leading-relaxed font-medium">
                          "Predicted Payout Velocity: <strong className="text-white">$42k / week</strong>. Liquidity is projected to remain healthy through next quarter."
                      </p>
                  </div>
                  <div className="relative z-10 flex items-center gap-4 bg-black/20 p-4 rounded-2xl backdrop-blur-xl border border-white/10">
                      <div className="text-right">
                          <p className="text-[8px] text-indigo-200 font-black uppercase tracking-widest mb-0.5">SAFE FLOOR</p>
                          <p className="text-xl font-black tracking-tighter">$25,000</p>
                      </div>
                      <button 
                        onClick={handleExecuteBatch}
                        disabled={isExecutingBatch || payouts.filter(p => p.status === 'Ready').length === 0}
                        className="bg-white text-indigo-600 px-4 py-2 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-indigo-50 transition-all shadow-lg flex items-center gap-2 active:scale-95 disabled:opacity-50"
                      >
                          {isExecutingBatch ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                          Batch Transfer
                      </button>
                  </div>
              </div>

              <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-md overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-6">
                      <h3 className="font-black text-[9px] text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                          <CreditCard size={12} /> Payout Ledger
                      </h3>
                      <div className="flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Stripe Sync</span>
                      </div>
                  </div>

                  <table className="w-full text-left">
                      <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          <tr><th className="p-4">Professional</th><th className="p-4">Deal</th><th className="p-4">Audit Status</th><th className="p-4 text-right">Amount</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {payouts.map(p => (
                              <tr key={p.id} className="hover:bg-slate-50 transition-colors text-xs font-bold">
                                  <td className="p-4">
                                      <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-400 text-[10px]">{p.agentName[0]}</div>
                                          <span className="font-black text-slate-800 uppercase tracking-tight">{p.agentName}</span>
                                      </div>
                                  </td>
                                  <td className="p-4 text-slate-500 uppercase tracking-wide text-[10px]">{p.referenceDeal}</td>
                                  <td className="p-4">
                                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                          p.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                          p.status === 'Ready' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                          'bg-slate-50 text-slate-500 border-slate-200'
                                      }`}>
                                          {p.status}
                                      </span>
                                  </td>
                                  <td className="p-4 text-right font-black text-slate-900 tracking-tighter text-sm">${p.amount.toLocaleString()}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {activeTab === 'commissions' && (
        <div className="space-y-5 animate-fade-in-up">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 bg-white rounded-[1.5rem] border border-slate-200 shadow-md overflow-hidden">
                 <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-6">
                    <h3 className="font-black text-[9px] text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2"><Calculator size={12} /> Global Ledger</h3>
                    <button className="text-[8px] font-black uppercase tracking-widest bg-white border border-slate-200 px-2 py-1 rounded-lg hover:bg-slate-50 shadow-sm flex items-center gap-1.5"><FileText size={10}/> 1099s</button>
                 </div>
                 <table className="w-full text-left text-[10px] font-bold">
                    <thead className="bg-white text-slate-400 text-[8px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
                        <tr><th className="p-4">Property</th><th className="p-4">Agent</th><th className="p-4">GCI</th><th className="p-4">Split</th><th className="p-4 text-right">Net</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {commissionLedger.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4"><div className="font-black text-slate-900 uppercase tracking-tight">{item.address}</div><div className="text-[8px] text-slate-400 mt-0.5">{item.date}</div></td>
                                <td className="p-4 text-slate-600 font-bold uppercase">{item.agentName}</td>
                                <td className="p-4 font-black text-slate-800">${item.gci.toLocaleString()}</td>
                                <td className="p-4"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[8px] font-black uppercase">{(item.split * 100)}%</span></td>
                                <td className="p-4 text-right font-black text-emerald-600 tracking-tight">${item.agentNet.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
              </div>
              <div className="lg:col-span-1 bg-slate-900 text-white rounded-[1.5rem] shadow-xl p-6 border-b-4 border-emerald-600">
                 <h3 className="font-black text-base mb-6 flex items-center gap-2 italic uppercase tracking-tighter"><Calculator size={18} className="text-emerald-400" /> Split Simulator.</h3>
                 <div className="space-y-4">
                    <div><label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Sale Price</label><input type="number" value={calcPrice} onChange={(e) => setCalcPrice(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none font-bold"/></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Comm %</label><input type="number" value={calcRate} onChange={(e) => setCalcRate(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none font-bold"/></div>
                      <div><label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Split %</label><input type="number" value={calcSplit} onChange={(e) => setCalcSplit(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none font-bold"/></div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-3">
                       <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-500"><span>Gross Comm</span><span className="text-white">${calcResult.gci.toLocaleString()}</span></div>
                       <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-red-400"><span>Broker Take</span><span className="font-black">-${calcResult.brokerTake.toLocaleString()}</span></div>
                       <div className="flex justify-between items-end pt-3 border-t border-slate-700/30">
                          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-emerald-400">Agent Net</span>
                          <span className="text-2xl font-black text-white tracking-tighter">${calcResult.agentTake.toLocaleString()}</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="animate-fade-in-up">
          <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-[9px] text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                <Layers size={12} className="text-indigo-600" /> Operational Outlay
              </h3>
              <button className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-md active:scale-95 flex items-center gap-1.5">
                <DollarSign size={10} /> Add Expense
              </button>
            </div>
            <table className="w-full text-left text-[10px] font-bold">
              <thead className="bg-white text-[8px] font-black text-slate-400 uppercase tracking-[0.25em] border-b border-slate-100">
                <tr><th className="p-4">Date</th><th className="p-4">Category</th><th className="p-4">Description</th><th className="p-4">Status</th><th className="p-4 text-right">Amount</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-400 uppercase">{expense.date}</td>
                    <td className="p-4 text-slate-900 uppercase font-black tracking-tight">{expense.category}</td>
                    <td className="p-4 text-slate-500 font-medium truncate max-w-[200px]">Monthly Cycle</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        expense.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                      }`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-black text-slate-900 text-sm tracking-tighter">${expense.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'marketing' && (
        <div className="space-y-5 animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-[1.5rem] border border-slate-200 shadow-md overflow-hidden h-fit">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-black text-[9px] text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                  <Target size={12} className="text-indigo-600" /> Performance Logic
                </h3>
              </div>
              <table className="w-full text-left text-[10px] font-bold">
                <thead className="bg-white text-slate-400 text-[8px] font-black uppercase tracking-[0.25em] border-b border-slate-100">
                  <tr><th className="p-4">Channel</th><th className="p-4">Spend</th><th className="p-4 text-center">Leads</th><th className="p-4 text-center">Deals</th><th className="p-4 text-right">ROAS</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {marketingChannels.map((channel, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-black text-slate-900 uppercase tracking-tight">{channel.channel}</td>
                      <td className="p-4 text-slate-500">${channel.spend.toLocaleString()}</td>
                      <td className="p-4 text-center font-black text-indigo-600">{channel.leads}</td>
                      <td className="p-4 text-center font-black text-slate-800">{channel.deals}</td>
                      <td className="p-4 text-right font-black text-emerald-600 text-sm tracking-tighter">{channel.roas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="lg:col-span-1 space-y-5">
              <div className="bg-indigo-900 text-white rounded-[1.5rem] p-6 shadow-xl relative overflow-hidden">
                <div className="absolute right-[-20px] top-[-20px] p-4 opacity-5 pointer-events-none"><PieChart size={140} /></div>
                <div className="relative z-10">
                    <h3 className="font-black text-base mb-6 italic uppercase tracking-tighter">Budget Mix.</h3>
                    <div className="space-y-5">
                    {[
                        { label: 'Google Search', percent: 45, color: 'bg-indigo-500' },
                        { label: 'Zillow Portal', percent: 35, color: 'bg-blue-500' },
                        { label: 'Social Sync', percent: 20, color: 'bg-emerald-500' }
                    ].map(item => (
                        <div key={item.label}>
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.2em] mb-1.5 text-indigo-300">
                                <span>{item.label}</span>
                                <span className="text-white">{item.percent}%</span>
                            </div>
                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className={`h-full ${item.color} rounded-full transition-all duration-1000 shadow-[0_0_5px_rgba(255,255,255,0.1)]`} style={{ width: `${item.percent}%` }} />
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financials;
