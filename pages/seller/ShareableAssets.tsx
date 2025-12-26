
import React from 'react';
import { 
  Share2, Download, Instagram, Facebook, 
  Linkedin, Heart, Star, Sparkles, Smartphone,
  ImageIcon, ArrowRight, Bot, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ShareableAssets: React.FC = () => {
  const { user } = useAuth();

  const assets = [
    { id: 'a1', name: 'Just Sold Story', size: '1080x1920', platform: 'Instagram', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', label: 'Story Format' },
    { id: 'a2', name: 'Just Sold Post', size: '1080x1080', platform: 'Facebook', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', label: 'Square Post' },
    { id: 'a3', name: 'Success Banner', size: '1200x628', platform: 'LinkedIn', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', label: 'Wide Format' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="absolute right-0 top-0 p-12 opacity-5 rotate-12"><Share2 size={200}/></div>
          <div className="relative z-10 max-w-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-600 rounded-xl shadow-lg">
                    <Sparkles size={20} className="text-white"/>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Ambassador Portal</span>
              </div>
              <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-4 leading-none">Share Your <br/> Success.</h1>
              <p className="text-indigo-100 text-lg font-medium opacity-90 leading-relaxed mb-8">
                  Congratulations on the successful sale of your home! We've prepared branded graphics for you to share with your friends and network.
              </p>
              <div className="flex gap-4">
                 <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center">
                    <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">ASSETS READY</p>
                    <p className="text-2xl font-black">3 PACKS</p>
                 </div>
                 <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center">
                    <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">BRANDING</p>
                    <p className="text-2xl font-black italic">VERIFIED</p>
                 </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {assets.map(asset => (
              <div key={asset.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-lg overflow-hidden group hover:border-indigo-400 transition-all flex flex-col">
                  <div className={`relative overflow-hidden ${asset.size.includes('1920') ? 'aspect-[9/16]' : asset.size.includes('1080') ? 'aspect-square' : 'aspect-video'} bg-slate-900`}>
                      <img src={asset.imageUrl} className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" />
                      
                      {/* Branded Overlay Simulation */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 pointer-events-none">
                          <div className="bg-indigo-600/90 text-white px-6 py-2 rounded-xl font-black uppercase text-2xl tracking-tighter italic mb-4 shadow-2xl ring-4 ring-white/20">JUST SOLD</div>
                          <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-lg border border-white/20">
                              <p className="text-white font-bold text-xs uppercase tracking-widest text-center">Nexus Real Estate OS</p>
                          </div>
                      </div>

                      <div className="absolute top-6 left-6 flex flex-col gap-2">
                          <span className="bg-indigo-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-lg">{asset.platform} Format</span>
                          <span className="bg-white/20 backdrop-blur-md text-white text-[8px] font-black uppercase px-2 py-0.5 rounded border border-white/20">{asset.size} PX</span>
                      </div>
                  </div>
                  <div className="p-8 flex flex-col justify-between flex-1">
                      <div>
                          <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight italic mb-1">{asset.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">{asset.label}</p>
                      </div>
                      <div className="flex flex-col gap-3">
                        <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                            <Download size={16}/> Download to Device
                        </button>
                        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2">
                            <Share2 size={16}/> One-Tap Share
                        </button>
                      </div>
                  </div>
              </div>
          ))}
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-xl border border-indigo-50"><Bot size={32}/></div>
              <div>
                  <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">AI: Personal Narrative</h4>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed italic max-w-xl">
                      "I've drafted a personalized post for your Facebook. Tap 'Copy Narrative' and paste it with your Just Sold graphic for a story-based experience."
                  </p>
              </div>
          </div>
          <button className="bg-white border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-50 transition-all whitespace-nowrap shadow-xl">
              Copy AI Narrative
          </button>
      </div>
    </div>
  );
};

export default ShareableAssets;
