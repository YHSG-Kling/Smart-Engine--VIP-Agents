
import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, Clock, Search, Filter, 
  FileText, ArrowRight, Zap, Loader2, Sparkles, Building2, 
  Check, X, Eye, DollarSign, Calendar, Upload
} from 'lucide-react';
import { VendorApplication, UserRole } from '../../types';
import { n8nService } from '../../services/n8n';

const VendorCompliance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'kanban' | 'verification'>('kanban');
  const [isVerifying, setIsVerifying] = useState<string | null>(null);

  // Mock Applications (Workflow 48)
  const [applications, setApplications] = useState<VendorApplication[]>([
    {
      id: 'app_1',
      businessName: 'Austin Pro Roofing',
      contactEmail: 'contact@austinproroof.com',
      description: 'Full service roofing repair and gutters installation for residential homes.',
      category: 'Roofing',
      status: 'AI Review',
      aiSuggestedTags: ['Roofing', 'Gutters'],
      licenseUrl: '#',
      submittedDate: 'Oct 28',
    },
    {
      id: 'app_2',
      businessName: 'Sparky Electric',
      contactEmail: 'jim@sparky.co',
      description: 'Licensed electricians for panel upgrades and EV chargers.',
      category: 'Electrician',
      status: 'New',
      aiSuggestedTags: [],
      licenseUrl: '#',
      submittedDate: 'Oct 29',
    }
  ]);

  // Verification Queue (Workflow 49)
  const [verificationQueue, setVerificationQueue] = useState<any[]>([
    {
      id: 'v1',
      vendorName: 'Solid Foundation Inspections',
      complianceScore: 100,
      insuranceData: {
        expiration: '2025-06-15',
        coverage: '$2,000,000',
        status: 'Compliant'
      },
      missingDocs: false
    },
    {
      id: 'v2',
      vendorName: 'MoveIt Pros',
      complianceScore: 45,
      insuranceData: {
        expiration: '2023-11-01',
        coverage: '$500,000',
        status: 'Expired/Low'
      },
      missingDocs: true
    }
  ]);

  const handleVerify = async (id: string) => {
    setIsVerifying(id);
    const result = await n8nService.verifyVendorInsurance('http://mock.pdf');
    
    setVerificationQueue(prev => prev.map(v => v.id === id ? {
      ...v,
      complianceScore: result.complianceScore,
      insuranceData: {
        expiration: result.expiration,
        coverage: `$${result.coverageAmount.toLocaleString()}`,
        status: result.isCompliant ? 'Compliant' : 'Insufficient'
      }
    } : v));
    
    setIsVerifying(null);
  };

  const handleAppAction = (id: string, newStatus: any) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Vendor Compliance Hub</h2>
          <p className="text-slate-500">Intake, AI Review, and Verification Automation</p>
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-slate-200">
          <button 
            onClick={() => setActiveTab('kanban')}
            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 ${activeTab === 'kanban' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
          >
            <Building2 size={16} /> Applications
          </button>
          <button 
            onClick={() => setActiveTab('verification')}
            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 ${activeTab === 'verification' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
          >
            <ShieldCheck size={16} /> Verification Queue
          </button>
        </div>
      </div>

      {/* VIEW A: Application Kanban (Workflow 48) */}
      {activeTab === 'kanban' && (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 overflow-x-auto pb-6">
          {['New', 'AI Review', 'Approved', 'Rejected'].map(stage => (
            <div key={stage} className="bg-slate-100 rounded-2xl p-4 flex flex-col h-full min-w-[300px]">
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-widest">{stage}</h3>
                <span className="bg-white px-2 py-0.5 rounded text-[10px] font-black text-slate-400">
                  {applications.filter(a => a.status === stage).length}
                </span>
              </div>
              <div className="space-y-4 overflow-y-auto flex-1 scrollbar-hide">
                {applications.filter(a => a.status === stage).map(app => (
                  <div key={app.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{app.businessName}</h4>
                    <p className="text-[10px] text-indigo-600 font-black uppercase tracking-wider mb-3">{app.category}</p>
                    
                    {app.aiSuggestedTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {app.aiSuggestedTags.map(tag => (
                          <span key={tag} className="bg-emerald-50 text-emerald-600 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                            <Check size={8} /> {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t border-slate-50">
                      <button className="p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"><Eye size={16}/></button>
                      <button 
                        onClick={() => handleAppAction(app.id, 'Approved')}
                        className="flex-1 bg-slate-50 text-slate-700 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleAppAction(app.id, 'Rejected')}
                        className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <X size={16}/>
                      </button>
                    </div>
                  </div>
                ))}
                {applications.filter(a => a.status === stage).length === 0 && (
                  <div className="h-32 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 text-xs font-bold italic">
                    Empty
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW B: Verification Queue (Workflow 49) */}
      {activeTab === 'verification' && (
        <div className="flex-1 overflow-auto animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="p-6">Vendor Name</th>
                  <th className="p-6">AI Compliance Score</th>
                  <th className="p-6">Insurance Data</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {verificationQueue.map(v => (
                  <tr key={v.id} className="hover:bg-indigo-50/20 transition-colors">
                    <td className="p-6">
                      <div className="font-bold text-slate-800">{v.vendorName}</div>
                      {v.missingDocs && (
                        <span className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1 mt-1">
                          <AlertTriangle size={10} /> Missing Docs
                        </span>
                      )}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden max-w-[100px]">
                          <div 
                            className={`h-full transition-all duration-1000 ${v.complianceScore === 100 ? 'bg-emerald-500' : 'bg-orange-500'}`} 
                            style={{ width: `${v.complianceScore}%` }} 
                          />
                        </div>
                        <span className="font-black text-slate-700">{v.complianceScore}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar size={12} className="text-slate-400" />
                          <span className="text-slate-500">Expires:</span>
                          <span className={`font-bold ${v.insuranceData.status.includes('Expired') ? 'text-red-600' : 'text-slate-800'}`}>
                            {v.insuranceData.expiration}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <DollarSign size={12} className="text-slate-400" />
                          <span className="text-slate-500">Coverage:</span>
                          <span className="font-bold text-slate-800">{v.insuranceData.coverage}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        v.insuranceData.status === 'Compliant' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {v.insuranceData.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleVerify(v.id)}
                          disabled={isVerifying === v.id}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center gap-2"
                        >
                          {isVerifying === v.id ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                          Run AI Audit
                        </button>
                        <button 
                          disabled={v.complianceScore < 100}
                          className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          One-Click Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const RefreshCw = ({ size, className }: { size: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);

export default VendorCompliance;
