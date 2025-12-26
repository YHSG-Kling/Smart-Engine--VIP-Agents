
import React, { useState } from 'react';
import { 
    Activity, ShieldCheck, ShieldAlert, Trash2, RefreshCw, 
    Search, Filter, CheckCircle2, XCircle, AlertTriangle,
    Database, Mail, Phone, Clock, ArrowRight, Zap, Loader2,
    Check
} from 'lucide-react';
import { n8nService } from '../../services/n8n';

const DataHealth: React.FC = () => {
    const [isValidating, setIsValidating] = useState(false);
    const [filter, setFilter] = useState<'All' | 'Invalid' | 'Risky'>('All');

    const [logs, setLogs] = useState([
        { id: '1', name: 'Fake Lead', contact: 'fake@example.com', type: 'Email', status: 'Invalid', reason: 'Bounce (Hard)', detected: '2h ago' },
        { id: '2', name: 'Web Scrape 42', contact: '555-0199', type: 'Phone', status: 'Risky', reason: 'VOIP / Prepaid', detected: '1d ago' },
        { id: '3', name: 'Spam Bot', contact: 'bot@spam.ru', type: 'Email', status: 'Invalid', reason: 'Disposable Domain', detected: '2d ago' },
        { id: '4', name: 'John Unknown', contact: '555-0100', type: 'Phone', status: 'Invalid', reason: 'Disconnected', detected: '1h ago' }
    ]);

    const stats = {
        totalLeads: 1245,
        healthy: 1180,
        risky: 42,
        invalid: 23,
        lastGlobalScan: 'Oct 29, 2023'
    };

    const runGlobalScan = async () => {
        setIsValidating(true);
        await n8nService.triggerWorkflow('global-data-hygiene-scan', {});
        setTimeout(() => {
            setIsValidating(false);
            alert("Database Hygiene Scan Complete. Identified 4 new invalid entries.");
        }, 2000);
    };

    const purgeInvalid = () => {
        if (confirm("Are you sure you want to delete all contacts marked as 'Invalid'? This action cannot be undone.")) {
            setLogs(prev => prev.filter(l => l.status !== 'Invalid'));
            alert("Hygiene Protocol Executed: All invalid records purged.");
        }
    };

    const filteredLogs = filter === 'All' ? logs : logs.filter(l => l.status === filter);

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
                <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Data Health.</h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Workflow 97: Twilio & Abstract API Hygiene</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={runGlobalScan}
                        disabled={isValidating}
                        className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                        {isValidating ? <Loader2 className="animate-spin" size={14}/> : <RefreshCw size={14}/>}
                        Run Global Scan
                    </button>
                    <button 
                        onClick={purgeInvalid}
                        className="bg-red-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-red-700 active:scale-95 transition-all"
                    >
                        <Trash2 size={14}/> Purge Invalid Records
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Database Score</p>
                    <h3 className="text-2xl font-black text-emerald-600 tracking-tighter">94%</h3>
                    <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">HIGH QUALITY</p>
                    <ShieldCheck className="absolute right-[-10px] bottom-[-10px] opacity-5 text-emerald-600 group-hover:scale-110 transition-transform" size={80}/>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Healthy Leads</p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stats.healthy}</h3>
                    <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{width: '94%'}}/>
                    </div>
                </div>
                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 shadow-sm">
                    <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1">Risky (VOIP/Prepaid)</p>
                    <h3 className="text-2xl font-black text-amber-700 tracking-tight">{stats.risky}</h3>
                    <p className="text-[8px] text-amber-500 font-black uppercase mt-1">SOFT PING REQUIRED</p>
                </div>
                <div className="bg-red-50 p-5 rounded-2xl border border-red-100 shadow-sm">
                    <p className="text-[8px] font-black text-red-600 uppercase tracking-widest mb-1">Dead Leads</p>
                    <h3 className="text-2xl font-black text-red-700 tracking-tight">{stats.invalid}</h3>
                    <p className="text-[8px] text-red-400 font-black uppercase mt-1">BOUNCED / DISCONNECTED</p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center px-8 gap-4">
                    <div className="flex items-center gap-4">
                        <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Activity size={18} className="text-indigo-600" /> Validation Log
                        </h3>
                        <div className="flex bg-white rounded-lg p-0.5 border border-slate-200">
                            {['All', 'Invalid', 'Risky'].map(f => (
                                <button 
                                    key={f} 
                                    onClick={() => setFilter(f as any)}
                                    className={`px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-3 h-3" />
                        <input type="text" placeholder="SEARCH LOGS..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest focus:ring-1 focus:ring-indigo-500 outline-none shadow-inner" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-8">Lead Entity</th>
                                <th className="p-8">Contact Point</th>
                                <th className="p-8">Risk/Issue</th>
                                <th className="p-8">Detected</th>
                                <th className="p-8 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                            {filteredLogs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-8">
                                        <div className="font-black text-slate-900 uppercase tracking-tight">{log.name}</div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-2">
                                            {log.type === 'Email' ? <Mail size={12} className="text-slate-400"/> : <Phone size={12} className="text-slate-400"/>}
                                            <span className="font-mono text-slate-500">{log.contact}</span>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${log.status === 'Risky' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                {log.reason}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-8 text-slate-400 uppercase font-black text-[9px]">{log.detected}</td>
                                    <td className="p-8 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm"><ArrowRight size={14}/></button>
                                            <button className="p-2 text-slate-300 hover:text-red-600 hover:bg-white rounded-lg transition-all shadow-sm"><Trash2 size={14}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DataHealth;
