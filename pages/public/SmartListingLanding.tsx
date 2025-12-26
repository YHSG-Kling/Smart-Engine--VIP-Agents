
import React, { useState, useEffect } from 'react';
import { 
  Home, MapPin, AudioLines, Sparkles, Calendar, 
  // Added FileText to fix 'Cannot find name' error
  MessageSquare, ChevronRight, Play, Pause, X, Check,
  Bot, Phone, Mail, Building2, Star, BadgeCheck, FileText
} from 'lucide-react';

const SmartListingLanding: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  // Mock Listing Data for Landing
  const listing = {
      address: '123 Main Street',
      city: 'Austin, TX',
      price: '$850,000',
      beds: 4, baths: 3, sqft: 2800,
      description: 'Stunning modern farmhouse with energy-efficient upgrades and a luxury pool.',
      image: 'https://images.unsplash.com/photo-1600596542815-2495db98dada?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
  };

  useEffect(() => {
    // Workflow 92 Logic: Check if scanned before
    const scanCount = localStorage.getItem('qr_scan_l1') || '0';
    if (parseInt(scanCount) > 0) {
        setIsReturning(true);
    }
    localStorage.setItem('qr_scan_l1', (parseInt(scanCount) + 1).toString());
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col items-center pb-20">
      {/* Hero Section */}
      <div className="w-full h-80 relative overflow-hidden shrink-0">
          <img src={listing.image} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-2 mb-2">
                  <span className="bg-indigo-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-indigo-400">Smart QR Scan</span>
                  <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-white/20">Verified Listing</span>
              </div>
              <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{listing.address}</h1>
              <p className="text-indigo-300 font-bold mt-1">{listing.city}</p>
          </div>
      </div>

      {/* Main Content Card */}
      <div className="w-full max-w-md -mt-6 bg-white rounded-t-[2.5rem] relative z-10 px-8 py-10 shadow-2xl space-y-8 flex-1">
          
          {/* Workflow 92: Dynamic AI Greeting */}
          <div className="bg-indigo-50 rounded-[2rem] p-6 border-2 border-indigo-100 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-5 rotate-12 group-hover:rotate-0 transition-transform">
                  <AudioLines size={100} />
              </div>
              <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
                          <Bot size={20} />
                      </div>
                      <div>
                        <h3 className="font-black text-indigo-900 text-xs uppercase tracking-widest leading-none">
                            {isReturning ? 'Welcome Back!' : 'Digital Concierge'}
                        </h3>
                        <p className="text-[10px] text-indigo-400 font-bold uppercase mt-1">AI Guided Audio Tour</p>
                      </div>
                  </div>
                  
                  <p className="text-indigo-900 text-sm font-medium leading-relaxed italic mb-6">
                      "{isReturning 
                        ? `Great to see you again! Ready to dive into the disclosure docs or lock in your private tour?`
                        : `Welcome to ${listing.address}. I've prepared a brief overview of the luxury upgrades including the solar array and chef's suite.`
                      }"
                  </p>

                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-full bg-white border-2 border-indigo-600 py-3 rounded-2xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all group/btn"
                  >
                      {isPlaying ? (
                          <><Pause className="text-indigo-600" size={18} fill="currentColor"/> <span className="font-black text-indigo-600 uppercase text-[10px] tracking-widest">Pause AI Voice</span></>
                      ) : (
                          <><Play className="text-indigo-600" size={18} fill="currentColor"/> <span className="font-black text-indigo-600 uppercase text-[10px] tracking-widest">Play Audio Guide</span></>
                      )}
                  </button>
              </div>
          </div>

          {/* Quick Specs */}
          <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">List Price</p>
                  <p className="text-xl font-black text-slate-900 tracking-tighter">{listing.price}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Space</p>
                  <p className="text-xl font-black text-slate-900 tracking-tighter">{listing.sqft} SQFT</p>
              </div>
          </div>

          <div className="flex gap-4 text-[11px] font-black text-slate-500 uppercase tracking-widest justify-center">
              <span className="flex items-center gap-1.5"><Check className="text-indigo-500" size={14}/> {listing.beds} Beds</span>
              <span className="flex items-center gap-1.5"><Check className="text-indigo-500" size={14}/> {listing.baths} Baths</span>
          </div>

          {/* Call to Actions */}
          <div className="space-y-4 pt-4">
              <button 
                onClick={() => setShowBooking(true)}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-indigo-600"
              >
                  <Calendar size={18}/> Book Private Tour
              </button>
              
              <button className="w-full bg-white border-2 border-slate-200 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-3 text-slate-700">
                  <FileText size={18}/> Access Disclosures
              </button>
          </div>

          {/* Contact Bar */}
          <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black">SS</div>
                  <div>
                      <p className="font-black text-[10px] text-slate-900 uppercase">Sarah Smith</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Listing Strategist</p>
                  </div>
              </div>
              <div className="flex gap-2">
                  <button className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"><Phone size={14}/></button>
                  <button className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"><Mail size={14}/></button>
              </div>
          </div>
      </div>

      {/* Booking Modal (Workflow 9) */}
      {showBooking && (
          <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
              <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-scale-in">
                  <div className="flex justify-between items-start mb-6">
                      <h3 className="text-2xl font-black uppercase tracking-tighter italic">Smart Engine AI.</h3>
                      <button onClick={() => setShowBooking(false)} className="p-2 bg-slate-100 rounded-full"><X size={20}/></button>
                  </div>
                  <div className="space-y-4">
                      {['Today, 4:00 PM', 'Tomorrow, 10:00 AM', 'Tomorrow, 2:30 PM'].map(slot => (
                          <button key={slot} className="w-full p-4 border border-slate-200 rounded-2xl text-left hover:border-indigo-600 hover:bg-indigo-50 transition-all font-bold text-slate-700 flex justify-between items-center group">
                              {slot}
                              <ChevronRight className="text-slate-300 group-hover:text-indigo-600" />
                          </button>
                      ))}
                  </div>
                  <button className="w-full mt-8 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl">Confirm Slot</button>
              </div>
          </div>
      )}
    </div>
  );
};

export default SmartListingLanding;
