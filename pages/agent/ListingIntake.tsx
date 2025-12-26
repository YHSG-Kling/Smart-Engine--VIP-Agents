
import React, { useState } from 'react';
import { 
  Home, MapPin, Loader2, CheckCircle2, 
  FileText, Camera, Wand2, ArrowRight, Sparkles,
  Info, RefreshCw, Bot, Plus, Trash2, LayoutList,
  ChevronRight, Building, ShieldCheck
} from 'lucide-react';
import { n8nService } from '../../services/n8n';
import { GoogleGenAI } from "@google/genai";

const ListingIntake: React.FC = () => {
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState('');
  const [isEnriching, setIsEnriching] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data State (Workflow 111 Pre-fill)
  const [propertyData, setPropertyData] = useState({
    beds: '',
    baths: '',
    sqft: '',
    yearBuilt: '',
    apn: '',
    roofType: 'Asphalt Shingle',
    style: 'Modern Farmhouse',
    description: '',
    price: '850000'
  });

  const handleAutoFill = async () => {
    if (!address) return;
    setIsEnriching(true);
    
    // Workflow 111 Node 1 & 2: Instant Ingest + Data Enrichment
    await n8nService.ingestListing(address);
    
    // Simulated enrichment result from Estated/BatchData API
    setTimeout(() => {
      setPropertyData(prev => ({
        ...prev,
        beds: '4',
        baths: '3.5',
        sqft: '2840',
        yearBuilt: '2019',
        apn: '992810-442',
        roofType: 'Metal'
      }));
      setIsEnriching(false);
      setStep(2);
    }, 2000);
  };

  const handleGenerateDescription = async () => {
    if (!process.env.API_KEY) {
        // Fallback simulation
        setIsGeneratingDescription(true);
        setTimeout(() => {
            setPropertyData(prev => ({
                ...prev,
                description: `Experience luxury living in this stunning ${prev.beds}-bedroom ${prev.style} residence. Built in ${prev.yearBuilt}, this ${prev.sqft} sqft masterpiece features high-end finishes and a durable ${prev.roofType} roof. Located at ${address}, this home offers the perfect blend of modern sophistication and comfort.`
            }));
            setIsGeneratingDescription(false);
        }, 1500);
        return;
    }

    setIsGeneratingDescription(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `You are a luxury real estate copywriter. Write a 150-word "Coming Soon" teaser for a new listing.
        Address: ${address}
        Beds: ${propertyData.beds}
        Baths: ${propertyData.baths}
        SqFt: ${propertyData.sqft}
        Year: ${propertyData.yearBuilt}
        Style: ${propertyData.style}
        Architecture: Highlight the ${propertyData.style} elements.
        Return only the description text.`;

        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });

        if (result.text) {
            setPropertyData(prev => ({ ...prev, description: result.text.trim() }));
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsGeneratingDescription(false);
    }
  };

  const handleSubmitForApproval = async () => {
      setIsSubmitting(true);
      // Workflow 113 Node 1
      await n8nService.submitListingForApproval({
          address,
          description: propertyData.description,
          price: propertyData.price,
          sqft: propertyData.sqft,
          agentId: 'current-agent-id'
      });

      setTimeout(() => {
          setIsSubmitting(false);
          alert("Compliance Sentinel Initiated: Listing submitted for AI & Broker approval.");
          setStep(1); // Reset or navigate away
      }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Listing Ingest.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Workflow 111: "Instant Ingest" AI Protocol</p>
        </div>
        <div className="flex gap-2">
           {[1, 2, 3, 4].map(s => (
               <div key={s} className={`w-10 h-2 rounded-full transition-all duration-500 ${step >= s ? 'bg-indigo-600' : 'bg-slate-200'}`} />
           ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
        
        {/* Step 1: Ingest Entry */}
        {step === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8 animate-fade-in-up">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 shadow-inner">
              <MapPin size={40} />
            </div>
            <div className="max-w-md space-y-2">
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic">Initiate Property Ingest</h3>
                <p className="text-sm text-slate-500 font-medium">Enter the residential address. Nexus AI will crawl tax records and listing archives to pre-fill the intake protocol.</p>
            </div>
            <div className="w-full max-w-xl relative group">
              <input 
                type="text" 
                placeholder="ENTER FULL ADDRESS..." 
                className="w-full p-6 pl-14 bg-slate-50 border-2 border-transparent rounded-[2rem] text-lg font-bold focus:ring-0 focus:border-indigo-500 focus:bg-white transition-all outline-none shadow-inner"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && address && handleAutoFill()}
              />
              <Home className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={24} />
            </div>
            <button 
              onClick={handleAutoFill}
              disabled={isEnriching || !address}
              className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.25em] shadow-2xl hover:bg-black disabled:opacity-50 flex items-center gap-3 transition-all active:scale-95 border-b-4 border-indigo-600"
            >
              {isEnriching ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              Execute AI Auto-Fill
            </button>
            <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                <Bot size={14}/> Integrated with Estated & BatchData API
            </div>
          </div>
        )}

        {/* Step 2: Protocol Audit */}
        {step === 2 && (
          <div className="p-10 animate-fade-in-up flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <div>
                 <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic">Review AI Enrichment</h3>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Found matching record in Travis County Central Appraisal District</p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-emerald-100 flex items-center gap-2">
                <CheckCircle2 size={14} /> 92% Confidence
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
               {[
                 { label: 'Beds', val: propertyData.beds, field: 'beds' },
                 { label: 'Baths', val: propertyData.baths, field: 'baths' },
                 { label: 'Sq Ft', val: propertyData.sqft, field: 'sqft' },
                 { label: 'Year Built', val: propertyData.yearBuilt, field: 'yearBuilt' },
                 { label: 'Tax ID / APN', val: propertyData.apn, field: 'apn' },
                 { label: 'Roof Material', val: propertyData.roofType, field: 'roofType' }
               ].map(item => (
                 <div key={item.label} className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">{item.label}</label>
                   <input 
                     type="text" 
                     value={item.val} 
                     onChange={(e) => setPropertyData({...propertyData, [item.field]: e.target.value})}
                     className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-sm" 
                   />
                 </div>
               ))}
            </div>

            <div className="mt-auto flex justify-between items-center pt-8 border-t border-slate-100">
              <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase text-slate-400 tracking-widest hover:text-slate-600 transition-colors">Abort & Back</button>
              <button onClick={() => setStep(3)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center gap-2 hover:bg-black transition-all">Proceed to Vision <ArrowRight size={18} /></button>
            </div>
          </div>
        )}

        {/* Step 3: Vision Lab */}
        {step === 3 && (
          <div className="p-10 text-center animate-fade-in-up flex-1 flex flex-col justify-center">
            <div className="w-20 h-20 bg-purple-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-purple-600 mb-6 shadow-sm">
              <Camera size={36} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic mb-2">AI Enhancer Vision Lab</h3>
            <p className="text-slate-500 text-sm font-medium mb-8 max-w-sm mx-auto">Upload iPhone photos. Nexus Vision will identify floor materials, appliance brands, and light exposure for better copy.</p>
            
            <div className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-16 hover:bg-slate-50 transition-all cursor-pointer group mb-10 flex flex-col items-center justify-center gap-4">
              <Plus size={32} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
              <p className="font-black text-slate-300 uppercase tracking-widest text-[10px] group-hover:text-indigo-400 transition-colors">Initialize Asset Stream</p>
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-slate-100">
              <button onClick={() => setStep(2)} className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Back to Data</button>
              <button onClick={() => setStep(4)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-700 transition-all">Final Step: Content <ArrowRight size={18} /></button>
            </div>
          </div>
        )}

        {/* Step 4: Marketing Synthesis & Submission */}
        {step === 4 && (
          <div className="p-10 animate-fade-in-up flex-1 flex flex-col">
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border-b-8 border-indigo-600 mb-8">
                <div className="absolute right-0 top-0 p-8 opacity-10 rotate-12"><Wand2 size={150}/></div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Luxury Copy Synthesis.</h3>
                    <p className="text-indigo-100 text-sm font-medium opacity-80 mb-6">AI generating a "Coming Soon" teaser based on {propertyData.style} elements.</p>
                    <button 
                        onClick={handleGenerateDescription}
                        disabled={isGeneratingDescription}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl hover:bg-indigo-500 transition-all"
                    >
                        {isGeneratingDescription ? <Loader2 className="animate-spin" size={14}/> : <Sparkles size={14}/>}
                        {propertyData.description ? 'Re-Generate' : 'Generate Marketing Description'}
                    </button>
                </div>
            </div>

            <div className="flex-1 space-y-4 mb-8">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Teaser Narrative Output</label>
                <textarea 
                    value={propertyData.description}
                    onChange={(e) => setPropertyData({...propertyData, description: e.target.value})}
                    placeholder="Awaiting AI generation protocol..."
                    className="w-full flex-1 p-6 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-medium text-slate-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner resize-none min-h-[200px]"
                />
            </div>

            <div className="mt-auto flex flex-col sm:flex-row justify-between items-center gap-4">
              <button onClick={() => setStep(3)} className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Back to Vision</button>
              <button 
                onClick={handleSubmitForApproval}
                disabled={isSubmitting || !propertyData.description}
                className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3 border-b-4 border-indigo-900 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin"/> : <ShieldCheck size={18}/>}
                Submit for Compliance Review
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ListingIntake;
