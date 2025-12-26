
import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, CheckCircle2, Home, Gift, Star, RefreshCw, Bot, Send, Sparkles, MapPin, X } from 'lucide-react';
import { n8nService } from '../../services/n8n';
import { GoogleGenAI } from "@google/genai";

// Mock Active Listings for the Agent to select from
const ACTIVE_LISTINGS = [
    { id: 'l1', address: '123 Main Street', city: 'Austin, TX', price: '$850,000', beds: 4, baths: 3, sqft: 2800, desc: 'Modern farmhouse with renovated kitchen, large backyard pool, and solar panels. Built in 2018.' },
    { id: 'l2', address: '456 Oak Avenue', city: 'Austin, TX', price: '$625,000', beds: 3, baths: 2, sqft: 1900, desc: 'Charming bungalow in historic district. Walking distance to coffee shops. Updated roof and HVAC.' },
    { id: 'l3', address: '789 Skyline Penthouse', city: 'Austin, TX', price: '$1,200,000', beds: 2, baths: 2.5, sqft: 1500, desc: 'Luxury high-rise living with downtown views. Concierge service, gym, and rooftop pool included.' },
];

const OpenHouseKiosk: React.FC = () => {
  const [listing, setListing] = useState<typeof ACTIVE_LISTINGS[0] | null>(null);
  
  // Steps: -1 (Agent Setup), 0 (Welcome), 1 (Form), 2 (Qualify), 3 (AI Chat/Success)
  const [step, setStep] = useState(-1); 
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', agent: 'No' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Chat State
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
        await n8nService.submitOpenHouseLead({
            ...formData,
            source: 'Open House Kiosk',
            propertyAddress: listing?.address,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Failed to submit lead", error);
    }
    
    setIsSubmitting(false);
    setStep(3);
    
    // Initial Greeting from AI
    setChatMessages([{
        role: 'model',
        text: `Hi ${formData.name.split(' ')[0]}! Welcome to ${listing?.address}. I'm the digital host. Feel free to look around! Do you have any questions about the house price, schools, or features?`
    }]);
  };

  const handleAgentSelect = (selected: typeof ACTIVE_LISTINGS[0]) => {
      setListing(selected);
      setStep(0);
  };

  const handleChatSend = async () => {
      if (!chatInput.trim() || !listing || !process.env.API_KEY) return;
      
      const userMsg = chatInput;
      setChatInput('');
      setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
      setIsTyping(true);

      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              config: {
                  systemInstruction: `You are a helpful, friendly Open House Host for the property at ${listing.address}, ${listing.city}.
                  Property Details:
                  - Price: ${listing.price}
                  - Size: ${listing.beds} Bed, ${listing.baths} Bath, ${listing.sqft} sqft.
                  - Description: ${listing.desc}
                  
                  Goal: Answer visitor questions accurately based on this data. Be enthusiastic but professional. If asked about something not in the data (like "how old is the roof"), say you will have the human agent follow up.`
              },
              contents: [{ role: 'user', parts: [{ text: userMsg }] }]
          });
          
          const reply = response.text || "I'll have the agent follow up on that for you.";
          setChatMessages(prev => [...prev, { role: 'model', text: reply }]);
      } catch (e) {
          console.error(e);
          setChatMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to the network right now. Please ask the agent nearby!" }]);
      } finally {
          setIsTyping(false);
      }
  };

  // AGENT SETUP SCREEN
  if (step === -1) {
      return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
              <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">Open House Setup</h1>
                  <p className="text-slate-500 mb-6">Select the active listing for this kiosk session.</p>
                  
                  <div className="space-y-3">
                      {ACTIVE_LISTINGS.map(l => (
                          <button 
                            key={l.id}
                            onClick={() => handleAgentSelect(l)}
                            className="w-full text-left p-4 border border-slate-200 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
                          >
                              <div className="flex justify-between items-center">
                                  <div>
                                      <h3 className="font-bold text-slate-800 group-hover:text-indigo-700">{l.address}</h3>
                                      <p className="text-sm text-slate-500">{l.city} • {l.price}</p>
                                  </div>
                                  <ChevronRight className="text-slate-300 group-hover:text-indigo-600" />
                              </div>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      );
  }

  // KIOSK SCREEN
  return (
    <div className="h-full w-full bg-slate-900 relative overflow-hidden flex flex-col items-center justify-center font-sans text-white">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600596542815-2495db98dada?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80)' }}
      />
      
      {/* Branding & Exit */}
      <div className="absolute top-8 left-8 z-10 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center">
          <Home className="text-white" />
        </div>
        <div>
            <span className="font-bold tracking-widest text-sm uppercase opacity-80 block">Nexus Brokerage</span>
            {listing && <span className="text-xs text-slate-300 flex items-center gap-1"><MapPin size={10}/> {listing.address}</span>}
        </div>
      </div>
      
      {/* Exit Button (Hidden in production or pin protected) */}
      <button 
        onClick={() => setStep(-1)}
        className="absolute top-8 right-8 z-50 text-white/20 hover:text-white/80 transition-colors"
      >
          <X size={24} />
      </button>

      <div className="relative z-10 w-full max-w-2xl px-6">
        
        {/* STEP 0: WELCOME */}
        {step === 0 && listing && (
          <div className="text-center animate-fade-in-up">
            <h1 className="text-6xl font-bold mb-4">Welcome Home</h1>
            <p className="text-2xl text-slate-300 mb-6">{listing.address} • {listing.city}</p>
            <div className="flex justify-center gap-4 mb-12 text-slate-300">
                <span className="bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">{listing.beds} Beds</span>
                <span className="bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">{listing.baths} Baths</span>
                <span className="bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">{listing.sqft} SqFt</span>
            </div>
            <button 
              onClick={() => setStep(1)}
              className="bg-white text-slate-900 px-12 py-5 rounded-full text-xl font-bold hover:scale-105 transition-transform shadow-2xl flex items-center gap-3 mx-auto"
            >
              Sign In to View <ChevronRight />
            </button>
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-400">
                <Gift size={16} className="text-indigo-400" />
                <span>Sign in to receive the digital brochure & floorplan</span>
            </div>
          </div>
        )}

        {/* STEP 1: CONTACT INFO */}
        {step === 1 && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl animate-fade-in-up">
            <h2 className="text-3xl font-bold mb-6 text-center">Let's get connected</h2>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Full Name" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 text-lg focus:outline-none focus:bg-white/10 focus:border-white/30 transition-all"
              />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 text-lg focus:outline-none focus:bg-white/10 focus:border-white/30 transition-all"
              />
              <input 
                type="tel" 
                placeholder="Phone Number" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 text-lg focus:outline-none focus:bg-white/10 focus:border-white/30 transition-all"
              />
            </div>
            <button 
              onClick={() => setStep(2)}
              disabled={!formData.name || !formData.email}
              className="w-full mt-8 bg-indigo-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 2: QUALIFICATION */}
        {step === 2 && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl animate-fade-in-up">
            <h2 className="text-3xl font-bold mb-8 text-center">Just one quick question</h2>
            <p className="text-center text-lg mb-6 text-slate-300">Are you currently working with a real estate agent?</p>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => { setFormData({...formData, agent: 'Yes'}); handleSubmit(); }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/20 transition-all text-center group"
              >
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-white/20">
                  <CheckCircle2 size={24} />
                </div>
                <span className="font-bold text-lg">Yes, I am</span>
              </button>
              <button 
                onClick={() => { setFormData({...formData, agent: 'No'}); handleSubmit(); }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-indigo-600/40 hover:border-indigo-500/50 transition-all text-center group"
              >
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-white/20">
                  <Star size={24} />
                </div>
                <span className="font-bold text-lg">No, not yet</span>
              </button>
            </div>
            
            {isSubmitting && (
                <div className="mt-6 text-center text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="animate-spin" size={16} /> Saving details...
                </div>
            )}
          </div>
        )}

        {/* STEP 3: AI CONCIERGE CHAT */}
        {step === 3 && (
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden h-[600px] flex flex-col text-slate-800 animate-scale-in">
             <div className="bg-indigo-600 p-6 flex items-center gap-4 text-white">
                 <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                     <Bot size={24} />
                 </div>
                 <div>
                     <h3 className="font-bold text-lg">House Guide AI</h3>
                     <p className="text-indigo-200 text-sm">Ask me about {listing?.address}</p>
                 </div>
                 <button 
                    onClick={() => { setStep(0); setFormData({name:'', email:'', phone:'', agent:'No'}); }}
                    className="ml-auto bg-white/10 px-3 py-1 rounded text-xs font-bold hover:bg-white/20"
                 >
                     Done
                 </button>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                 {chatMessages.map((msg, i) => (
                     <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                             msg.role === 'user' 
                             ? 'bg-indigo-600 text-white rounded-br-none' 
                             : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'
                         }`}>
                             {msg.text}
                         </div>
                     </div>
                 ))}
                 {isTyping && (
                     <div className="flex justify-start">
                         <div className="bg-white rounded-2xl px-4 py-3 border border-slate-200 flex gap-2 items-center">
                             <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                             <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                             <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                         </div>
                     </div>
                 )}
                 <div ref={chatEndRef} />
             </div>

             <div className="p-4 bg-white border-t border-slate-200">
                 <div className="relative">
                     <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask about the pool, schools, age of roof..."
                        className="w-full pl-4 pr-12 py-4 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                     />
                     <button 
                        onClick={handleChatSend}
                        disabled={!chatInput.trim()}
                        className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                         <Send size={20} />
                     </button>
                 </div>
                 <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                     {['How much is the HOA?', 'What schools are nearby?', 'When was it built?'].map(q => (
                         <button 
                            key={q}
                            onClick={() => { setChatInput(q); handleChatSend(); }}
                            className="whitespace-nowrap px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                         >
                             {q}
                         </button>
                     ))}
                 </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OpenHouseKiosk;
