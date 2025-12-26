
import React, { useState } from 'react';
import { 
  Globe, Share2, Facebook, Instagram, Linkedin, 
  ExternalLink, Copy, CheckCircle2, XCircle, 
  AlertTriangle, RefreshCw, BarChart3, PieChart,
  Loader2, MousePointerClick, TrendingUp, Info,
  Search, Filter, ChevronRight, LayoutList
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, SyndicationLink, SyndicationError } from '../../types';

const ListingDistribution: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === UserRole.ADMIN || role === UserRole.BROKER;
  
  const [links] = useState<SyndicationLink[]>([
    { id: 'l1', listingId: '1', platform: 'Zillow', url: 'https://zillow.com/homedetails/123-main', status: 'Active', clicks: 450 },
    { id: 'l2', listingId: '1', platform: 'Realtor', url: 'https://realtor.com/realestateandhomes-detail/123-main', status: 'Active', clicks: 280 },
    { id: 'l3', listingId: '1', platform: 'Website', url: 'https://nexus-os.com/listings/123-main', status: 'Active', clicks: 1240 },
    { id: 'l4', listingId: '1', platform: 'Facebook', url: 'https://facebook.com/nexus/posts/99281', status: 'Active', clicks: 84 },
    { id: 'l5', listingId: '1', platform: 'Instagram', url: 'https://instagram.com/p/88291', status: 'Processing', clicks: 0 },
  ]);

  const [errors] = useState<SyndicationError[]>([
    { id: 'e1', listingId: '1', address: '123 Main St', platform: 'Zillow', error: 'Zillow API Timeout (Error 504)', timestamp: '10 mins ago' },
    { id: 'e2', listingId: '2', address: '456 Oak Ave', platform: 'Instagram', error: 'OAuth Token Expired for Buffer', timestamp: '2h ago' },
  ]);

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("URL copied to clipboard.");
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Listing Distribution.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Workflow 114: Multi-Channel AI Morph active</p>
        </div>
        <button onClick={() => window.location.reload()} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 shadow-sm">
            <RefreshCw size={18}/>
        </button>
      </div>

      {isAdmin ? (
          /* View A: Admin - Syndication Health */
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Global Health</p>
                      <div className="flex items-center gap-3">
                          <h3 className="text-3xl font-black text-emerald-600 tracking-tighter">98.2%</h3>
                          <TrendingUp size={20} className="text-emerald-500" />
                      </div>
                  </div>
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Failed Syncs</p>
                      <h3 className="text-3xl font-black text-red-600 tracking-tighter">{errors.length} Units</h3>
                  </div>
                  <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-xl text-white flex flex-col justify-center border-b-8 border-indigo-900">
                      <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">AI Morph Volume</p>
                      <h3 className="text-3xl font-black tracking-tighter">142 Posts</h3>
                  </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-red-50/20 flex justify-between items-center px-8">
                      <h3 className="font-black text-[10px] text-red-900 uppercase tracking-[0.3em] flex items-center gap-2">
                        <AlertTriangle size={18} className="text-red-600" /> Critical Syndication Errors
                      </h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                      {errors.map(err => (
                          <div key={err.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                              <div className="flex items-center gap-6">
                                  <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 border border-red-100">
                                      <Globe size={24}/>
                                  </div>
                                  <div>
                                      <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">{err.address} • {err.platform}</h4>
                                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1 italic">"{err.error}"</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <p className="text-[9px] font-black text-slate-300 uppercase mb-2">{err.timestamp}</p>
                                  <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all">Retry Link</button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      ) : (
          /* View B: Agent - Live Links Dashboard */
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
                  <h3 className="font-black text-[10px] text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Share2 size={18} className="text-indigo-600" /> Omni-Channel Syndication Desk
                  </h3>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-white border-b border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          <tr>
                              <th className="p-8">Platform</th>
                              <th className="p-8">Status</th>
                              <th className="p-8 text-center">Inbound Clicks</th>
                              <th className="p-8 text-right">Syndication Control</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                          {links.map(link => (
                              <tr key={link.id} className="hover:bg-slate-50 transition-colors group">
                                  <td className="p-8">
                                      <div className="flex items-center gap-4">
                                          <div className={`p-3 rounded-xl bg-slate-50 text-slate-400 group-hover:text-indigo-600 transition-colors`}>
                                              {link.platform === 'Facebook' ? <Facebook size={18}/> : 
                                               link.platform === 'Instagram' ? <Instagram size={18}/> :
                                               link.platform === 'LinkedIn' ? <Linkedin size={18}/> :
                                               <Globe size={18}/>}
                                          </div>
                                          <span className="font-black text-slate-900 uppercase tracking-tight">{link.platform}</span>
                                      </div>
                                  </td>
                                  <td className="p-8">
                                      <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${
                                          link.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                          link.status === 'Processing' ? 'bg-indigo-50 text-indigo-700 border-indigo-100 animate-pulse' :
                                          'bg-red-50 text-red-700 border-red-100'
                                      }`}>
                                          {link.status}
                                      </span>
                                  </td>
                                  <td className="p-8 text-center">
                                      <div className="text-lg font-black text-slate-900 tracking-tighter">{link.clicks}</div>
                                  </td>
                                  <td className="p-8 text-right">
                                      <div className="flex justify-end gap-2">
                                          <button 
                                            onClick={() => window.open(link.url, '_blank')}
                                            className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:text-indigo-600 transition-all shadow-sm"
                                          >
                                              <ExternalLink size={14}/>
                                          </button>
                                          <button 
                                            onClick={() => copyToClipboard(link.url)}
                                            className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-2"
                                          >
                                              <Copy size={12}/> Copy Link
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

export default ListingDistribution;
