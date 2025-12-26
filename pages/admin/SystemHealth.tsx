
import React from 'react';
import { Activity, Server, Database, Globe, CheckCircle2, AlertCircle, RefreshCw, Cpu, MessageSquare, TrendingUp, ThumbsUp } from 'lucide-react';
import { n8nService } from '../../services/n8n';

const SystemHealth: React.FC = () => {
  const services = [
    { name: 'Google Gemini AI', status: 'Operational', latency: 45, uptime: 99.9, icon: Cpu },
    { name: 'Airtable Database', status: 'Operational', latency: 120, uptime: 99.8, icon: Database },
    { name: 'GoHighLevel CRM', status: 'Degraded', latency: 450, uptime: 98.5, icon: Globe },
    { name: 'N8N Automation', status: 'Operational', latency: 80, uptime: 99.9, icon: Activity },
    { name: 'SendGrid Email', status: 'Operational', latency: 20, uptime: 100, icon: Server },
  ];

  const runDiagnostics = () => {
    alert("Running system-wide diagnostics via Workflow 99...");
    n8nService.checkSystemHealth();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">System Health & Analytics</h2>
          <p className="text-slate-500">Infrastructure & AI Performance Monitor</p>
        </div>
        <button 
          onClick={runDiagnostics}
          className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 flex items-center gap-2"
        >
          <RefreshCw size={16} /> Run Diagnostics
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <div key={service.name} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-lg text-slate-600">
                  <Icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                  service.status === 'Operational' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {service.status === 'Operational' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  {service.status}
                </div>
              </div>
              
              <h3 className="font-bold text-lg text-slate-800 mb-1">{service.name}</h3>
              
              <div className="space-y-3 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Latency</span>
                  <span className={`font-mono font-bold ${service.latency > 300 ? 'text-orange-500' : 'text-slate-700'}`}>
                    {service.latency}ms
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${service.latency > 300 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${Math.min(100, (service.latency / 500) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-slate-500">Uptime (30d)</span>
                  <span className="font-bold text-slate-700">{service.uptime}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workflow 20: Conversation Quality Logs */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-lg">
        <h3 className="font-bold mb-4 text-lg flex items-center gap-2">
            <MessageSquare size={20} className="text-indigo-400" /> AI Conversation Quality (Workflow 20)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
                <p className="text-xs text-indigo-300 font-bold uppercase mb-1">Total Conversations (24h)</p>
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold">142</span>
                    <span className="text-emerald-400 text-xs font-bold flex items-center gap-1 mb-1"><TrendingUp size={12}/> +12%</span>
                </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
                <p className="text-xs text-indigo-300 font-bold uppercase mb-1">Sentiment Improvement</p>
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold">68%</span>
                    <span className="text-slate-400 text-xs mb-1">ended happier than started</span>
                </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
                <p className="text-xs text-indigo-300 font-bold uppercase mb-1">Avg. AI Confidence</p>
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold">0.92</span>
                    <span className="text-emerald-400 text-xs font-bold flex items-center gap-1 mb-1"><ThumbsUp size={12}/> High</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
