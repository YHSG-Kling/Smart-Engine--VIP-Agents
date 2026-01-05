
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, PieChart, 
  Download, Calendar, ArrowUpRight, Calculator, 
  FileText, Layers, CreditCard, RefreshCw, 
  ChevronRight, ShieldCheck, Loader2, Zap, 
  AlertTriangle, ArrowRight, Navigation, Plus, X,
  // Added missing icon imports
  Eye, Landmark, Bot
} from 'lucide-react';
import { airtableService } from '../../services/airtable';
import { n8nService } from '../../services/n8n';
import { useAuth } from '../../contexts/AuthContext';
import { CommissionCalculation, BusinessExpense, TaxProjection } from '../../types';

const FinancialsView: React.FC = () => {
  const { user } = useAuth();
  const currentUserId = user?.id || 'demo-user';
  
  const [activeTab, setActiveTab] = useState<'commissions' | 'expenses' | 'taxes'>('commissions');
  const [calculations, setCalculations] = useState<CommissionCalculation[]>([]);
  const [expenses, setExpenses] = useState<BusinessExpense[]>([]);
  const [taxProjection, setTaxProjection] = useState<TaxProjection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    ytdGrossCommission: 0,
    ytdNetCommission: 0,
    ytdExpenses: 0,
    ytdTaxesOwed: 0
  });

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    setIsLoading(true);
    try {
      const [calcs, exps] = await Promise.all([
        airtableService.getCommissionCalculations(),
        airtableService.getBusinessExpenses()
      ]);

      const myCalcs = calcs.filter(c => c.agentUserId === currentUserId);
      setCalculations(myCalcs);

      const myExps = exps.filter(e => e.userId === currentUserId);
      setExpenses(myExps);

      const currentYear = new Date().getFullYear();
      const ytdCalcs = myCalcs.filter(c => new Date(c.createdAt).getFullYear() === currentYear);
      const ytdExps = myExps.filter(e => new Date(e.expenseDate).getFullYear() === currentYear);

      const ytdGross = ytdCalcs.reduce((sum, c) => sum + (c.grossCommission || 0), 0);
      const ytdNet = ytdCalcs.reduce((sum, c) => sum + (c.netCommission || 0), 0);
      const ytdExpTotal = ytdExps.reduce((sum, e) => sum + (e.amount || 0), 0);

      setStats({
        ytdGrossCommission: ytdGross,
        ytdNetCommission: ytdNet,
        ytdExpenses: ytdExpTotal,
        ytdTaxesOwed: (ytdNet - ytdExpTotal) * 0.393 // Weighted effective rate estimate
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Financial Ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20 max-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">Financial Intelligence.</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Real-time Commission & Tax Governance</p>
        </div>
        <button onClick={loadFinancialData} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm">
          <RefreshCw size={20} />
        </button>
      </div>

      {/* YTD Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="YTD Gross Commission" value={stats.ytdGrossCommission} color="text-emerald-600" icon={DollarSign} />
        <SummaryCard label="YTD Net Take-Home" value={stats.ytdNetCommission} color="text-indigo-600" icon={TrendingUp} />
        <SummaryCard label="YTD Business Expenses" value={stats.ytdExpenses} color="text-orange-600" icon={Layers} />
        <SummaryCard label="Estimated Taxes Owed" value={stats.ytdTaxesOwed} color="text-red-600" icon={ShieldCheck} />
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white rounded-xl p-1 border border-slate-200 w-fit shadow-sm overflow-x-auto max-w-full scrollbar-hide">
        {[
          { id: 'commissions', label: 'Commission Matrix', icon: Calculator },
          { id: 'expenses', label: 'Expense Ledger', icon: FileText },
          { id: 'taxes', label: 'Tax Projections', icon: PieChart }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-indigo-700 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in-up">
        {activeTab === 'commissions' && (
          <CommissionsTab calculations={calculations} onRefresh={loadFinancialData} />
        )}
        {activeTab === 'expenses' && (
          <ExpensesTab expenses={expenses} onRefresh={loadFinancialData} userId={currentUserId} />
        )}
        {activeTab === 'taxes' && (
          <TaxProjectionsTab stats={stats} />
        )}
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{ label: string; value: number; color: string; icon: any }> = ({ label, value, color, icon: Icon }) => (
  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm group hover:border-indigo-400 transition-all">
    <div className="flex items-center gap-4 mb-4">
      <div className={`p-3 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform shadow-inner ${color}`}>
        <Icon size={20} />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
    <p className={`text-3xl font-black italic tracking-tighter tabular-nums ${color}`}>
      ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
    </p>
  </div>
);

function CommissionsTab({ calculations, onRefresh }: { calculations: CommissionCalculation[]; onRefresh: () => void }) {
  const [selectedCalc, setSelectedCalc] = useState<CommissionCalculation | null>(null);

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-10">
        <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
          <Calculator size={18} className="text-indigo-600" /> Waterfall Ledger
        </h3>
        <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 flex items-center gap-2 transition-all">
          <Download size={14}/> Export Settlement Pack
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="p-8">Property Entity</th>
              <th className="p-8 text-right">Sale Price</th>
              <th className="p-8 text-right">Gross Comm.</th>
              <th className="p-8 text-right">Total Splits</th>
              <th className="p-8 text-right">Net Take-Home</th>
              <th className="p-8">Audit State</th>
              <th className="p-8 text-right">Protocol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
            {calculations.map(calc => {
              const totalDeductions = calc.agentGrossCommission - calc.netCommission;
              return (
                <tr key={calc.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-8">
                    <div className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1 italic">123 Main St</div>
                    <div className="text-[9px] text-slate-400 uppercase font-black tracking-widest">
                      {new Date(calc.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-8 text-right text-slate-600 tabular-nums font-black text-xs">
                    ${calc.salePrice?.toLocaleString()}
                  </td>
                  <td className="p-8 text-right text-emerald-600 tabular-nums font-black text-xs">
                    ${calc.grossCommission?.toLocaleString()}
                  </td>
                  <td className="p-8 text-right text-red-500 tabular-nums font-black text-xs">
                    -${totalDeductions.toLocaleString()}
                  </td>
                  <td className="p-8 text-right text-indigo-700 tabular-nums font-black text-sm italic">
                    ${calc.netCommission?.toLocaleString()}
                  </td>
                  <td className="p-8">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit ${
                      calc.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      calc.status === 'discrepancy' ? 'bg-red-50 text-red-700 border-red-100 animate-pulse' :
                      'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {calc.status === 'discrepancy' && <AlertTriangle size={10} />}
                      {calc.status}
                    </span>
                  </td>
                  <td className="p-8 text-right">
                    <button
                      onClick={() => setSelectedCalc(calc)}
                      className="p-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              );
            })}
            {calculations.length === 0 && (
              <tr>
                <td colSpan={7} className="p-20 text-center text-slate-300 italic font-black uppercase text-xs">No transaction records detected in ledger.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedCalc && (
        <CommissionBreakdownModal calculation={selectedCalc} onClose={() => setSelectedCalc(null)} />
      )}
    </div>
  );
}

function CommissionBreakdownModal({ calculation, onClose }: { calculation: CommissionCalculation; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[2000] flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-white/20 overflow-hidden animate-scale-in">
        <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0 border-b-8 border-indigo-600">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl"><Calculator size={24}/></div>
            <div>
              <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none">Waterfall Audit.</h3>
              <p className="text-indigo-400 font-bold text-[10px] uppercase tracking-widest mt-1.5">ID: {calculation.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X size={20}/></button>
        </div>
        
        <div className="p-10 space-y-8">
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-200 shadow-inner">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Contract Price</p>
              <p className="text-2xl font-black text-slate-900 italic tracking-tighter">${calculation.salePrice?.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Comm. Rate</p>
              <p className="text-2xl font-black text-indigo-600 italic tracking-tighter">{(calculation.commissionRate * 100).toFixed(1)}%</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100">
              <span className="text-[10px] font-black uppercase tracking-widest">Gross GCI</span>
              <span className="text-lg font-black italic tracking-tighter">${calculation.grossCommission?.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-blue-50 text-blue-800 rounded-2xl border border-blue-100">
              <span className="text-[10px] font-black uppercase tracking-widest">Broker Split ({(calculation.brokerageSplitPercentage * 100)}%)</span>
              <span className="text-lg font-black italic tracking-tighter">${calculation.agentGrossCommission?.toLocaleString()}</span>
            </div>
            
            <div className="pl-6 space-y-2 py-4 border-l-2 border-slate-100">
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Post-Split Deductions</p>
               {calculation.teamLeadSplit && (
                 <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span className="uppercase tracking-tight">Team Lead Override</span>
                    <span className="text-red-500">-${calculation.teamLeadSplit.toLocaleString()}</span>
                 </div>
               )}
               {calculation.referralFeeOut && (
                 <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span className="uppercase tracking-tight">Referral Fee</span>
                    <span className="text-red-500">-${calculation.referralFeeOut.toLocaleString()}</span>
                 </div>
               )}
               {calculation.tcFee && (
                 <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span className="uppercase tracking-tight">TC Transaction Fee</span>
                    <span className="text-red-500">-${calculation.tcFee.toLocaleString()}</span>
                 </div>
               )}
               <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span className="uppercase tracking-tight">E&O Insurance / Risk</span>
                  <span className="text-red-500">-$150.00</span>
               </div>
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-[2rem] flex justify-between items-center shadow-2xl border-b-8 border-indigo-600 group">
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">Final Net Settlement</p>
                    <p className="text-5xl font-black italic tracking-tighter tabular-nums group-hover:scale-105 transition-transform duration-700">${calculation.netCommission?.toLocaleString()}</p>
                </div>
                <div className="opacity-10 shrink-0"><DollarSign size={80}/></div>
            </div>
          </div>

          {calculation.actualDepositAmount && (
            <div className={`p-6 rounded-[2rem] border-2 animate-fade-in-up ${
              Math.abs(calculation.depositVariance) < 50 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-xl shrink-0 ${Math.abs(calculation.depositVariance) < 50 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {Math.abs(calculation.depositVariance) < 50 ? <ShieldCheck size={24}/> : <AlertTriangle size={24}/>}
                  </div>
                  <div className="flex-1">
                      <h4 className="font-black uppercase tracking-widest text-[11px] mb-2 leading-none">
                          {Math.abs(calculation.depositVariance) < 50 ? 'Commission Integrity Verified' : 'Deposit Variance Alert'}
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-[10px] font-bold">
                          <p className="uppercase text-slate-500">Expected: <span className="text-slate-900 tabular-nums">${calculation.expectedDepositAmount?.toLocaleString()}</span></p>
                          <p className="uppercase text-slate-500">Actual: <span className="text-slate-900 tabular-nums">${calculation.actualDepositAmount?.toLocaleString()}</span></p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-black/5 flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase">Variance Delta</span>
                          <span className={`text-sm font-black ${calculation.depositVariance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                              {calculation.depositVariance > 0 ? '+' : ''}${calculation.depositVariance?.toLocaleString()}
                          </span>
                      </div>
                  </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
             <button className="flex-1 py-4 bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 active:scale-95 transition-all">Report Discrepancy</button>
             <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2"><FileText size={14}/> Download Voucher</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpensesTab({ expenses, onRefresh, userId }: { expenses: BusinessExpense[]; onRefresh: () => void; userId: string }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuickMileage = async () => {
    const milesStr = prompt('Distance driven (miles)?');
    const purpose = prompt('Business purpose?');
    
    if (milesStr && purpose) {
      const miles = parseFloat(milesStr);
      await airtableService.logMileage(userId, 'Current Location', 'Client Meeting', miles, purpose);
      onRefresh();
      alert(`Mileage Logged: ${miles} miles = $${(miles * 0.67).toFixed(2)} deduction saved.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex gap-3">
          <button
            onClick={handleQuickMileage}
            className="px-6 py-3 bg-indigo-600 text-white rounded-[1.25rem] font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95 border-b-4 border-indigo-950"
          >
            <Navigation size={14} fill="currentColor" /> Quick Log Mileage
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-slate-900 text-white rounded-[1.25rem] font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-2 active:scale-95 border-b-4 border-slate-700"
          >
            <Plus size={16} /> Add Expense
          </button>
        </div>
        
        <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
           {['Advertising', 'Auto', 'Meals', 'Office'].map(tag => (
             <button key={tag} className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-all">{tag}</button>
           ))}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                <tr><th className="p-8">Merchant / Description</th><th className="p-8">Category</th><th className="p-8 text-right">Amount</th><th className="p-8 text-right">Audit</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                {expenses.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="p-8">
                            <p className="font-black text-slate-900 uppercase tracking-tight text-sm leading-none mb-1">{e.merchant || 'Generic Expense'}</p>
                            <p className="text-[10px] text-slate-400 font-medium italic">"{e.description}"</p>
                        </td>
                        <td className="p-8">
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[8px] font-black uppercase border border-slate-200">{e.category.replace('_', ' ')}</span>
                        </td>
                        <td className="p-8 text-right font-black text-slate-900 text-sm tabular-nums">${e.amount.toLocaleString()}</td>
                        <td className="p-8 text-right">
                            <button className="p-2 bg-slate-50 text-slate-300 hover:text-indigo-600 rounded-lg transition-all"><Eye size={16}/></button>
                        </td>
                    </tr>
                ))}
            </tbody>
          </table>
      </div>
    </div>
  );
}

function TaxProjectionsTab({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
        <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-lg p-10 relative overflow-hidden">
                <div className="absolute right-0 top-0 p-8 opacity-5 rotate-12"><Landmark size={200}/></div>
                <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Q4 Tax Projection.</h3>
                <p className="text-slate-500 text-sm font-medium mb-10 max-w-md">Estimated based on net settlement logic and active business deductions.</p>
                
                <div className="space-y-6 mb-12">
                    <div className="flex justify-between items-center py-4 border-b border-slate-50">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Realized Income</span>
                        <span className="text-xl font-black text-slate-900 tabular-nums">${stats.ytdNetCommission.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-slate-50">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deductible OpEx</span>
                        <span className="text-xl font-black text-red-500 tabular-nums">-${stats.ytdExpenses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.25em]">Taxable Baseline</span>
                        <span className="text-2xl font-black text-slate-900 tabular-nums">${(stats.ytdNetCommission - stats.ytdExpenses).toLocaleString()}</span>
                    </div>
                </div>

                <div className="bg-indigo-900 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden border-b-8 border-indigo-950 flex flex-col items-center text-center">
                    <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Estimated Quarterly Payout Due</p>
                    <h4 className="text-6xl font-black italic tracking-tighter tabular-nums mb-4">${(stats.ytdTaxesOwed / 4).toLocaleString()}</h4>
                    <p className="text-indigo-400 text-[11px] font-black uppercase tracking-widest">Deadline: Jan 15, 2025</p>
                </div>
            </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md p-8">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2"><AlertTriangle size={14} className="text-orange-500"/> Tax Planning Protocol</h4>
                <div className="space-y-6">
                    <div className="p-5 bg-orange-50 rounded-2xl border border-orange-100">
                        <p className="text-[10px] text-orange-900 leading-relaxed font-bold italic">
                            "System indicates you have hit 90% of your brokerage cap. Future closings this year will have a <strong className="underline">0% split</strong>, increasing your Q1 taxable baseline."
                        </p>
                    </div>
                    <div className="space-y-3">
                        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2">
                            <FileText size={16}/> Schedule C Report (PDF)
                        </button>
                        <button className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all">
                            View Historical Payouts
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-8 shadow-inner">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2"><Bot size={16}/> Tax Bot Logic</p>
                <p className="text-xs text-indigo-900 leading-relaxed font-bold italic">
                    "I am auto-categorizing your marketing spend under IRS Code 1.162-1. Ensure all receipts are uploaded to the Vault to guarantee audit protection."
                </p>
            </div>
        </div>
    </div>
  );
}

export default FinancialsView;
