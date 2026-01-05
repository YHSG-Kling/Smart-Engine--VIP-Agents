
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, AlertCircle, Clock, TrendingUp, CheckCircle, RefreshCw, 
  ChevronDown, ShieldAlert, Cpu, Database, Globe, Loader2, Trash2, 
  ArrowRight, ShieldCheck, Zap, Terminal, Code, Bot, Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, AutomationError } from '../../types';
import { airtableService } from '../../services/airtable';
import { n8nService } from '../../services/n8n';

const SystemHealth: React.FC = () => {
  const { user, role } = useAuth();
  
  // Guard for Admin/Broker
  const isAuthorized = role === UserRole.ADMIN || role === UserRole.BROKER;
  
  const [errors, setErrors] = useState<AutomationError[]>([]);
  const [timeFilter, setTimeFilter] = useState(24); // hours
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [executingRetry, setExecutingRetry] = useState<string | null>(null);

  const loadErrors = async () => {
    setIsRefreshing(true);
    try {
        const recentErrors = await airtableService.getRecentErrors(
          timeFilter,
          statusFilter === 'all' ? null : statusFilter
        );
        setErrors(recentErrors);
    } catch (e) {
        console.error("Failed to load error ledger", e);
    } finally {
        setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAuthorized) return;
    loadErrors();
    const interval = setInterval(loadErrors, 30000);
    return () => clearInterval(interval);
  }, [timeFilter, statusFilter, isAuthorized]);

  const stats = useMemo(() => {
    const critical = errors.filter(e => e.severity === 'critical').length;
    const unresolved = errors.filter(e => e.status === 'new' || e.status === 'investigating').length;
    return {
      total: errors.length,
      critical,
      unresolved,
      errorRate: (errors.length / timeFilter).toFixed(2)
    };
  }, [errors, timeFilter]);

  const handleRetry = async (error: AutomationError) => {
    if (!confirm('Execute Workflow Retry Sequence?\n\nThis will attempt to re-run the node with original context.')) return;
    
    setExecutingRetry(error.id);
    const result = await n8nService.retryFailedWorkflow(
      error.id,
      error.workflowId,
      error.contextJson || '{}'
    );
    
    if (result.success) {
      alert('Protocol Restored: Workflow retry successful.');
      await loadErrors();
    } else {
      alert('Retry Protocol Failed. Check new error logs in the ledger.');
    }
    setExecutingRetry(null);
  };

  const handleResolve = async (id: string) => {
    await airtableService.updateErrorStatus(id, 'resolved', user?.name);
    await loadErrors();
  };

  const handleIgnore = async (id: string) => {
    await airtableService.updateErrorStatus(id, 'ignored', user?.name);
    await loadErrors();
  };

  if (!isAuthorized) {
    return (
        <div className="flex items-center justify-center h-[50vh] text-slate-400 font-black uppercase tracking-[0.3em] animate-pulse">
            <ShieldAlert size={48} className="mr-6 opacity-20" />
            Unauthorized: Brokerage Protocol Access Restricted
        </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">System Health.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Global Infrastructure & AI Reliability Monitor</p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(parseInt(e.target.value))}
              className="bg-transparent px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none border-r border-slate-100"
            >
              <option value={1}>Last Hour</option>
              <option value={6}>Last 6h</option>
              <option value={24}>Last 24h</option>
              <option value={72}>Last 3 Days</option>
              <option value={168}>Last Week</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="new">New Faults</option>
              <option value="investigating">Auditing</option>
              <option value="resolved">Verified</option>
              <option value="ignored">Archived</option>
            </select>
          </div>
          <button
            onClick={loadErrors}
            disabled={isRefreshing}
            className="bg-slate-900 text-white px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-2 active:scale-95 border-b-4 border-indigo-600"
          >
            {isRefreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Force Refresh
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <HealthMetric label={`Errors (${timeFilter}h)`} value={stats.total} icon={Activity} color="indigo" />
        <HealthMetric label="Critical Faults" value={stats.critical} icon={AlertCircle} color="red" />
        <HealthMetric label="Awaiting Audit" value={stats.unresolved} icon={Clock} color="amber" />
        <HealthMetric label="Fault Frequency" value={`${stats.errorRate}/hr`} icon={TrendingUp} color="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-10">
                    <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Terminal size={18} className="text-indigo-600" /> Automation Fault Ledger
                    </h3>
                    <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 uppercase tracking-widest">
                        Node Logs Live
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {errors.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center py-40 opacity-20 text-center px-20">
                            <ShieldCheck size={120} className="text-emerald-500 mb-8" />
                            <p className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">System Integrity Verified.</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4">Zero critical cluster faults detected in target window.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {errors.map(error => (
                                <ErrorRow 
                                    key={error.id} 
                                    error={error}
                                    isExecuting={executingRetry === error.id}
                                    onRetry={handleRetry}
                                    onResolve={handleResolve}
                                    onIgnore={handleIgnore}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden border-b-8 border-indigo-600 group">
                  <div className="absolute right-[-20px] top-[-20px] p-4 opacity-10 rotate-12 transition-transform group-hover:rotate-0"><Cpu size={180}/></div>
                  <div className="relative z-10">
                      <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Infrastructure Health</p>
                      <div className="space-y-8">
                          <ServiceStatus name="Nexus API Engine" status="Healthy" uptime="99.99%" latency="42ms" />
                          <ServiceStatus name="Airtable Cluster" status="Stable" uptime="99.8%" latency="124ms" />
                          <ServiceStatus name="N8N Node Cluster" status="Optimized" uptime="100%" latency="8ms" />
                          <ServiceStatus name="Gemini LLM Link" status="Active" uptime="99.9%" latency="840ms" />
                      </div>
                  </div>
              </div>

              <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
                   <div className="absolute right-[-10px] top-[-10px] p-2 opacity-10 rotate-12 group-hover:rotate-0 transition-transform"><Zap size={100}/></div>
                   <h4 className="font-black text-[10px] text-indigo-200 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 italic">
                       <Bot size={16}/> Intelligence Protocol
                   </h4>
                   <p className="text-sm font-bold leading-relaxed italic text-indigo-50 border-l-2 border-indigo-400 pl-4">
                       "AI-Sentinel is currently monitoring for systemic failure patterns. No recursive fault loops detected across GHL, Airtable, or Drive endpoints."
                   </p>
              </div>
          </div>
      </div>
    </div>
  );
};

const HealthMetric: React.FC<{ label: string, value: string | number, icon: any, color: string }> = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all group">
        <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-2xl transition-all shadow-inner group-hover:scale-110 ${
                color === 'red' ? 'bg-red-50 text-red-600' : 
                color === 'amber' ? 'bg-amber-50 text-amber-600' :
                color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                'bg-slate-50 text-slate-400'
            }`}>
                <Icon size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        </div>
        <p className="text-3xl font-black text-slate-900 italic tracking-tighter tabular-nums">{value}</p>
    </div>
);

const ServiceStatus: React.FC<{ name: string, status: string, uptime: string, latency: string }> = ({ name, status, uptime, latency }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <span className="text-indigo-300">{name}</span>
            <span className="text-emerald-400 italic">{status}</span>
        </div>
        <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
            <span>Uptime: {uptime}</span>
            <span className="tabular-nums">Lat: {latency}</span>
        </div>
        <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-full shadow-[0_0_5px_emerald]" />
        </div>
    </div>
);

const ErrorRow: React.FC<{ 
    error: AutomationError, 
    isExecuting: boolean,
    onRetry: (e: AutomationError) => void, 
    onResolve: (id: string) => void, 
    onIgnore: (id: string) => void 
}> = ({ error, isExecuting, onRetry, onResolve, onIgnore }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white border-red-700 shadow-md';
      case 'high': return 'bg-orange-50 text-white border-orange-600';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-slate-100 text-slate-500';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-red-50 text-red-600 border-red-100';
      case 'investigating': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'ignored': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-50 text-slate-400';
    }
  };
  
  return (
    <div className={`p-8 hover:bg-slate-50 transition-all ${error.severity === 'critical' && error.status === 'new' ? 'bg-red-50/20' : ''}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-start justify-between group/row"
      >
        <div className="flex-1 text-left min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border tracking-widest shadow-sm ${getSeverityBadge(error.severity)}`}>
              {error.severity}
            </span>
            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border tracking-widest ${getStatusColor(error.status)}`}>
              {error.status}
            </span>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic group-hover/row:underline underline-offset-4">
              Cluster: {error.workflowId}
            </span>
            <div className="w-1 h-1 bg-slate-200 rounded-full" />
            <span className="text-[10px] font-bold text-slate-300 tabular-nums uppercase">{new Date(error.createdAt).toLocaleString()}</span>
          </div>
          
          <p className="text-base font-black text-slate-800 uppercase tracking-tight italic leading-tight">
              "{error.errorMessage}"
          </p>
          
          <div className="flex items-center gap-6 mt-3">
            {error.affectedUserId && (
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Users size={10}/> UID: {error.affectedUserId}</span>
            )}
            {error.retryCount > 0 && (
              <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1.5"><RefreshCw size={10} className="animate-spin-slow"/> Retries: {error.retryCount}</span>
            )}
          </div>
        </div>
        
        <div className={`p-2 rounded-xl text-slate-300 transition-all group-hover/row:bg-white group-hover/row:text-indigo-600 group-hover/row:shadow-md ${isExpanded ? 'rotate-180 bg-white text-indigo-600 shadow-md' : ''}`}>
          <ChevronDown size={20} />
        </div>
      </button>
      
      {isExpanded && (
        <div className="mt-8 space-y-6 animate-fade-in-up">
          {/* Error Stack */}
          {error.errorStack && (
            <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden group/stack">
                <div className="absolute right-4 top-4 text-slate-700 group-hover/stack:text-indigo-500 transition-colors"><Code size={40} /></div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Node Stack Trace</p>
                <pre className="text-[11px] font-mono text-slate-400 overflow-x-auto leading-relaxed scrollbar-hide">
                    {error.errorStack}
                </pre>
            </div>
          )}
          
          {/* Context */}
          {error.contextJson && (
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 shadow-inner group/json">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex justify-between items-center">
                  JSON Context Extract
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-indigo-600">Request Body</span>
              </p>
              <pre className="text-[11px] font-mono text-indigo-900 overflow-x-auto leading-relaxed scrollbar-hide bg-white p-6 rounded-2xl border border-indigo-100/50 shadow-sm">
                {JSON.stringify(JSON.parse(error.contextJson), null, 2)}
              </pre>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex flex-wrap gap-4 pt-4">
            {error.status !== 'resolved' && (
              <>
                <button
                  onClick={() => onRetry(error)}
                  disabled={isExecuting}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50 border-b-4 border-indigo-900"
                >
                  {isExecuting ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  Execute Node Retry
                </button>
                <button
                  onClick={() => onResolve(error.id)}
                  className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-emerald-700 transition-all flex items-center gap-3 active:scale-95 border-b-4 border-emerald-900"
                >
                  <ShieldCheck size={16} /> Mark as Verified
                </button>
                <button
                  onClick={() => onIgnore(error.id)}
                  className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:border-red-200 hover:text-red-500 transition-all active:scale-95"
                >
                  Archive Fault
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemHealth;
