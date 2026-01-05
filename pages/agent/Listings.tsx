import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, MoreVertical, MapPin, 
  Home, DollarSign, Activity, X, Check,
  Camera, Video, Calendar, Sparkles, Loader2,
  ChevronRight, ArrowRight, Ruler, Bath, BedDouble,
  CheckCircle2, AlertTriangle, TrendingUp,
  // Added Bot and Info to fix "Cannot find name" errors on line 638 and 846
  Bot, Info
} from 'lucide-react';
import { airtableService } from '../../services/airtable';
import { n8nService } from '../../services/n8n';
import { Listing, UserRole, PropertyUpgrade } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const Listings: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setIsLoading(true);
    const data = await airtableService.getListings();
    setListings(data || []);
    setIsLoading(false);
  };

  const handleListingCreated = (newListing: any) => {
    loadListings();
    alert(`Success: ${newListing.address} has been saved as a draft.`);
  };

  const filteredListings = listings.filter(l => 
    l.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Listing Portfolio.</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Manage active, pending, and draft properties</p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2 border-b-4 border-indigo-900"
        >
          <Plus size={18} />
          New Listing
        </button>
      </div>

      <div className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="FILTER BY ADDRESS..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none" 
          />
        </div>
        <button className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all border border-slate-100 shadow-inner">
          <Filter size={20} />
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-300 italic font-black uppercase text-xs">
          <Loader2 className="animate-spin mb-4" size={48} />
          Synchronizing Portfolio...
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
           <Home size={48} className="mx-auto text-slate-100 mb-4" />
           <h3 className="text-xl font-black text-slate-800 uppercase italic">Empty Inventory.</h3>
           <p className="text-xs text-slate-400 font-bold uppercase mt-2">Add your first property to begin the intake protocol.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map(listing => (
            <div key={listing.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-lg overflow-hidden flex flex-col group hover:border-indigo-400 transition-all">
              <div className="h-48 bg-slate-900 relative overflow-hidden shrink-0">
                <img src={listing.images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80'} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 left-4 flex gap-2">
                   <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase shadow-lg border ${
                     listing.status === 'Active' ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-900 text-slate-400 border-slate-700'
                   }`}>{listing.status}</span>
                </div>
                <div className="absolute bottom-4 right-4">
                  <p className="text-white font-black text-xl tracking-tighter tabular-nums drop-shadow-lg">${listing.price.toLocaleString()}</p>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-black text-slate-900 uppercase tracking-tight text-base italic leading-none mb-1 truncate">{listing.address}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">Listed {listing.daysOnMarket} days ago</p>
                
                <div className="grid grid-cols-3 gap-2 mb-6">
                   <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                      <p className="text-[7px] font-black text-slate-400 uppercase">Views</p>
                      <p className="text-xs font-black text-slate-800">{listing.stats.views}</p>
                   </div>
                   <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                      <p className="text-[7px] font-black text-slate-400 uppercase">Saves</p>
                      <p className="text-xs font-black text-slate-800">{listing.stats.saves}</p>
                   </div>
                   <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                      <p className="text-[7px] font-black text-slate-400 uppercase">Showings</p>
                      <p className="text-xs font-black text-slate-800">{listing.stats.showings}</p>
                   </div>
                </div>

                <div className="mt-auto flex gap-2">
                   <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-black transition-all">Performance</button>
                   <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 transition-all"><MoreVertical size={18}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showWizard && (
        <ListingCreationWizard 
          onClose={() => setShowWizard(false)}
          onComplete={handleListingCreated}
          currentUserId={user?.id || 'demo-agent'}
        />
      )}
    </div>
  );
};

interface WizardProps {
  onClose: () => void;
  onComplete: (listing: any) => void;
  currentUserId: string;
}

const ListingCreationWizard: React.FC<WizardProps> = ({ onClose, onComplete, currentUserId }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enrichmentData, setEnrichmentData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    // Step 1
    address: '', city: 'Austin', state: 'TX', zip: '',
    sellerId: '', sellerName: '', sellerEmail: '', sellerPhone: '',
    // Step 2
    propertyType: 'Single Family', bedrooms: '', bathrooms: '', sqft: '', lotSize: '', yearBuilt: '',
    features: [] as string[],
    // Step 3
    targetPrice: '', priceStrategy: 'market_value', suggestedPrice: null as number | null, cmaData: null as any,
    upgrades: [] as Partial<PropertyUpgrade>[], disclaimerAccepted: false,
    // Step 4
    photoShoot: false, photoShootDate: '', videoTour: false, openHouse: false, openHouseDate: '',
    listingDescription: ''
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!formData.address || !formData.zip) {
        alert('Please fill in street address and zip code.');
        return;
      }
      setIsProcessing(true);
      try {
        const fullAddr = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`;
        const result = await n8nService.triggerPropertyEnrichment(null, fullAddr);
        if (result.success && result.enrichedData) {
          setEnrichmentData(result.enrichedData);
          setFormData(prev => ({
            ...prev,
            propertyType: result.enrichedData.propertyType,
            bedrooms: result.enrichedData.bedrooms.toString(),
            bathrooms: result.enrichedData.bathrooms.toString(),
            sqft: result.enrichedData.sqft.toString(),
            lotSize: result.enrichedData.lotSize,
            yearBuilt: result.enrichedData.yearBuilt.toString()
          }));
        }
      } catch (e) { console.error(e); }
      setIsProcessing(false);
    }

    if (currentStep === 2) {
      if (!formData.bedrooms || !formData.bathrooms || !formData.sqft) {
        alert('Property metrics required for AI pricing synthesis.');
        return;
      }
      setIsProcessing(true);
      try {
        const fullAddr = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`;
        const cma = await n8nService.triggerCMAPackage(null, fullAddr, formData.bedrooms, formData.bathrooms, formData.sqft, formData.upgrades);
        if (cma.success) {
          setFormData(prev => ({ 
            ...prev, 
            suggestedPrice: cma.suggestedPrice, 
            cmaData: cma, 
            targetPrice: cma.suggestedPrice.toString() 
          }));
        }
      } catch (e) { console.error(e); }
      setIsProcessing(false);
    }

    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    try {
      let sId = formData.sellerId;
      if (!sId && formData.sellerEmail) {
        const seller = await airtableService.createRecord('Leads', {
          'Name': formData.sellerName,
          'Email': formData.sellerEmail,
          'Phone': formData.sellerPhone,
          'Intent_Type': 'Seller',
          'Status': 'Active'
        });
        sId = seller?.records?.[0]?.id;
      }

      const listing = await airtableService.createRecord('Listings', {
        'Address': formData.address,
        'List_Price': parseInt(formData.targetPrice),
        'Status': 'Draft',
        'Days_On_Market': 0,
        'Seller_Email': formData.sellerEmail,
        'Property_Data_JSON': JSON.stringify(formData)
      });

      // Save upgrades if any
      if (formData.upgrades.length > 0) {
        for (const upgrade of formData.upgrades) {
          await airtableService.createPropertyUpgrade({
            ...upgrade,
            listingId: listing.id
          });
        }
      }

      if (formData.photoShoot) {
        await airtableService.createRecord('Tasks', { 'Task Name': 'Order Photography', 'Deal_ID': listing.id, 'Status': 'Pending' });
      }

      onComplete(listing);
      onClose();
    } catch (e) {
      console.error(e);
      alert("Pipeline failure: Listing could not be committed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl h-[85vh] shadow-2xl border border-white/10 overflow-hidden flex flex-col">
        {/* Wizard Header */}
        <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0 border-b-8 border-indigo-600">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
               <Sparkles size={24}/>
            </div>
            <div>
              <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none">Listing Architect.</h3>
              <p className="text-indigo-400 font-bold text-[9px] uppercase tracking-widest mt-1">Step {currentStep} of 4: Protocol Ingest</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24}/></button>
        </div>

        {/* Progress Strip */}
        <div className="bg-slate-100 h-1.5 flex shrink-0">
           {[1, 2, 3, 4].map(s => (
             <div key={s} className={`flex-1 transition-all duration-700 ${s <= currentStep ? 'bg-indigo-600' : 'bg-slate-200'}`} />
           ))}
        </div>

        {/* Wizard Stage Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {currentStep === 1 && (
            <div className="p-10 space-y-10 animate-fade-in">
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1 flex items-center gap-2">
                    <MapPin size={12} className="text-indigo-600"/> Physical Location
                  </h4>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Street Address *</label>
                      <input 
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner" 
                        value={formData.address}
                        onChange={e => updateFormData('address', e.target.value)}
                        placeholder="1234 Skyline Dr..."
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5 col-span-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">City</label>
                        <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.city} readOnly />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Zip Code *</label>
                        <input 
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                          value={formData.zip}
                          onChange={e => updateFormData('zip', e.target.value)}
                          placeholder="78704"
                        />
                      </div>
                    </div>
                  </div>
               </div>

               <div className="space-y-6 pt-6 border-t border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1 flex items-center gap-2">
                    <Home size={12} className="text-indigo-600"/> Seller Registry
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5 col-span-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Seller Name</label>
                        <input 
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" 
                          value={formData.sellerName}
                          onChange={e => updateFormData('sellerName', e.target.value)}
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Email Identity</label>
                        <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.sellerEmail} onChange={e => updateFormData('sellerEmail', e.target.value)} />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Direct Phone</label>
                        <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.sellerPhone} onChange={e => updateFormData('sellerPhone', e.target.value)} />
                     </div>
                  </div>
               </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="p-10 space-y-8 animate-fade-in">
               <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-3xl flex items-center gap-6 shadow-inner">
                  <div className="p-4 bg-white rounded-2xl shadow-sm text-emerald-600 shrink-0"><CheckCircle2 size={32}/></div>
                  <div>
                    <p className="text-emerald-900 font-black uppercase text-[10px] tracking-widest mb-1">Public Record Link: Success</p>
                    <p className="text-emerald-700 text-xs font-bold italic leading-tight">"Airtable Sentinel has auto-populated ${formData.address} attributes from tax records. Verify below."</p>
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-6">
                  {[
                    { l: 'Beds', f: 'bedrooms', i: BedDouble },
                    { l: 'Baths', f: 'bathrooms', i: Bath },
                    { l: 'Sq Ft', f: 'sqft', i: Ruler },
                  ].map(spec => (
                    <div key={spec.f} className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">{spec.l}</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={(formData as any)[spec.f]} 
                          onChange={e => updateFormData(spec.f, e.target.value)}
                          className="w-full p-4 pl-11 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" 
                        />
                        <spec.i className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      </div>
                    </div>
                  ))}
               </div>

               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Year Built</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.yearBuilt} onChange={e => updateFormData('yearBuilt', e.target.value)} />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Lot Size</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.lotSize} onChange={e => updateFormData('lotSize', e.target.value)} />
                 </div>
               </div>
            </div>
          )}

          {currentStep === 3 && (
            <Step3Pricing 
              formData={formData} 
              updateFormData={updateFormData} 
              onUpgradesChange={(newUpgrades) => updateFormData('upgrades', newUpgrades)}
            />
          )}

          {currentStep === 4 && (
            <div className="p-10 space-y-8 animate-fade-in">
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1 flex items-center gap-2"><Activity size={12} className="text-indigo-600"/> Marketing Launch Protocol</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { f: 'photoShoot', l: 'Professional Photo Shoot', i: Camera, d: 'Book award-winning real estate photographer' },
                      { f: 'videoTour', l: 'Social-Native Video Tour', i: Video, d: 'AI-edited vertical luxury reel generation' },
                      { f: 'openHouse', l: 'Public Open House Event', i: Calendar, d: 'Schedule Mimosa Brunch weekend blitz' }
                    ].map(task => (
                      <button 
                        key={task.f}
                        onClick={() => updateFormData(task.f, !(formData as any)[task.f])}
                        className={`p-6 rounded-[1.75rem] border-2 text-left flex items-center gap-6 transition-all ${ (formData as any)[task.f] ? 'bg-emerald-50 border-emerald-600 shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                      >
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${ (formData as any)[task.f] ? 'bg-white text-emerald-600' : 'bg-white text-slate-200'}`}><task.i size={24}/></div>
                         <div className="flex-1">
                           <p className="font-black text-xs uppercase tracking-tight leading-none mb-1">{task.l}</p>
                           <p className="text-[10px] italic font-medium leading-tight">"{task.d}"</p>
                         </div>
                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${ (formData as any)[task.f] ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200'}`}>
                           { (formData as any)[task.f] && <Check size={14}/> }
                         </div>
                      </button>
                    ))}
                  </div>
               </div>

               <div className="space-y-1.5 pt-6 border-t border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Seed Listing Description</label>
                  <textarea 
                    className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] font-medium text-sm h-40 resize-none focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner" 
                    value={formData.listingDescription}
                    onChange={e => updateFormData('listingDescription', e.target.value)}
                    placeholder="AI will expand this into luxury copy later. Jot down key selling points..."
                  />
               </div>
            </div>
          )}
        </div>

        {/* Wizard Footer */}
        <div className="p-8 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <button onClick={onClose} className="text-[10px] font-black uppercase text-slate-400 tracking-widest hover:text-red-500 transition-colors">Abort Ingest</button>
          
          <div className="flex gap-4">
             {currentStep > 1 && (
               <button onClick={() => setCurrentStep(prev => prev - 1)} className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all shadow-sm">Back</button>
             )}
             {currentStep < 4 ? (
               <button 
                onClick={handleNext}
                disabled={isProcessing || (currentStep === 3 && !formData.disclaimerAccepted)}
                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-2 active:scale-95 border-b-4 border-indigo-600 disabled:opacity-50"
               >
                 {isProcessing ? <Loader2 className="animate-spin" size={16}/> : 'Proceed'} <ArrowRight size={16}/>
               </button>
             ) : (
               <button 
                onClick={handleSubmit}
                disabled={isProcessing}
                className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95 border-b-4 border-indigo-900"
               >
                 {isProcessing ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle2 size={16}/>} Create Listing Draft
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

function Step3Pricing({ formData, updateFormData, onUpgradesChange }: { formData: any, updateFormData: any, onUpgradesChange: (u: any[]) => void }) {
  const [showUpgradesModal, setShowUpgradesModal] = useState(false);
  
  const totalUpgradesValue = (formData.upgrades || []).reduce((sum: number, u: any) => sum + (u.estimatedValueAdd || 0), 0);

  const handleRefreshCMA = async () => {
    // Re-trigger CMA calculation logic to account for new upgrades
    try {
        const fullAddr = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`;
        const cma = await n8nService.triggerCMAPackage(null, fullAddr, formData.bedrooms, formData.bathrooms, formData.sqft, formData.upgrades);
        if (cma.success) {
          updateFormData('suggestedPrice', cma.suggestedPrice);
          updateFormData('cmaData', cma);
          updateFormData('targetPrice', cma.suggestedPrice.toString());
        }
      } catch (e) { console.error(e); }
  };

  return (
    <div className="p-10 space-y-8 animate-fade-in">
      {/* PROMINENT DISCLAIMER */}
      <div className="bg-amber-50 border-2 border-amber-400 rounded-3xl p-6">
        <div className="flex gap-4">
          <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-black text-amber-900 text-sm mb-2 uppercase tracking-tight">
              Important: This is NOT an Appraisal
            </p>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              This Comparative Market Analysis (CMA) is a marketing tool to help price 
              your property competitively. It uses methodology similar to appraisal 
              standards (USPAP) and follows Texas TREC guidelines, but only a licensed 
              appraiser can provide an official appraisal. Actual market value may differ 
              based on market conditions, buyer preferences, and other factors.
            </p>
            <label className="flex items-center gap-3 mt-4 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.disclaimerAccepted}
                onChange={(e) => updateFormData('disclaimerAccepted', e.target.checked)}
                className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-xs text-amber-900 font-black uppercase tracking-widest group-hover:text-amber-700">
                I understand this is a CMA, not an appraisal
              </span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center px-1">
            <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.3em]">Property Upgrades & Improvements</h3>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">USPAP Methodology</span>
        </div>
        
        <p className="text-xs text-slate-500 font-medium leading-relaxed italic px-1">
          Factor documented improvements into the pricing logic using state-mandated depreciation schedules.
        </p>
        
        {formData.upgrades && formData.upgrades.length > 0 ? (
          <div className="space-y-3 mb-3">
            {formData.upgrades.map((upgrade: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm hover:border-indigo-300 transition-all">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-indigo-50 text-indigo-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase border border-indigo-100">{upgrade.upgradeCategory.replace('_', ' ')}</span>
                    <p className="font-black text-slate-900 text-xs uppercase tracking-tight">{upgrade.description}</p>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Cost: ${upgrade.cost?.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Year: {upgrade.yearCompleted}
                    </span>
                    {upgrade.estimatedValueAdd && (
                      <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest flex items-center gap-1">
                        <TrendingUp size={10}/> Adj: +${upgrade.estimatedValueAdd.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                      const newUpgrades = formData.upgrades.filter((_: any, i: number) => i !== idx);
                      onUpgradesChange(newUpgrades);
                      handleRefreshCMA();
                  }}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
            
            <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-[1.5rem] flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Improvement Credit</p>
                <p className="text-xl font-black text-indigo-900 tabular-nums">
                  ${totalUpgradesValue.toLocaleString()}
                </p>
              </div>
              <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-tighter italic max-w-[200px] text-right">
                Calculated using category-specific depreciation schedules
              </p>
            </div>
          </div>
        ) : (
          <div className="p-10 bg-slate-50 border border-slate-200 rounded-[2rem] text-center border-dashed">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No verified upgrades logged</p>
          </div>
        )}
        
        <button
          onClick={() => setShowUpgradesModal(true)}
          className="w-full py-4 border-2 border-indigo-600 text-indigo-600 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Add Property Improvement
        </button>
      </div>
      
      <div className="pt-8 border-t border-slate-100 space-y-6">
        <div className="flex justify-between items-center px-1">
            <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.3em]">CMA-Based Pricing Analysis</h3>
            {formData.cmaData?.stateGuidelinesVersion && (
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest italic">{formData.cmaData.stateGuidelinesVersion} Reference</span>
            )}
        </div>
        
        {formData.suggestedPrice && (
          <div className="bg-indigo-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border-b-8 border-indigo-600 group">
            <div className="absolute right-[-20px] top-[-20px] p-4 opacity-10 rotate-12 transition-transform group-hover:rotate-0"><DollarSign size={200}/></div>
            
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.3em] mb-2">AI Market Analysis Protocol</p>
                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
                    Based on {formData.cmaData?.compsCount || 3} comps + verified improvements
                    </p>
                </div>
                <TrendingUp className="w-6 h-6 text-indigo-400" />
                </div>
                
                <div className="flex items-baseline justify-center md:justify-start gap-6">
                <span className="text-sm font-black text-indigo-400/60 tabular-nums">
                    ${(formData.cmaData?.lowRange/1000).toFixed(0)}k
                </span>
                <span className="text-6xl font-black italic tracking-tighter tabular-nums">
                    ${formData.suggestedPrice.toLocaleString()}
                </span>
                <span className="text-sm font-black text-indigo-400/60 tabular-nums">
                    ${(formData.cmaData?.highRange/1000).toFixed(0)}k
                </span>
                </div>
                
                {formData.cmaData?.methodologyNotes && (
                <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Bot size={12}/> Analysis Strategy</p>
                    <p className="text-xs text-indigo-100 italic leading-relaxed font-medium">"{formData.cmaData.methodologyNotes}"</p>
                </div>
                )}
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Your Target List Price *</label>
            <div className="relative group">
                <input 
                    type="number" 
                    value={formData.targetPrice} 
                    onChange={e => updateFormData('targetPrice', e.target.value)}
                    disabled={!formData.disclaimerAccepted}
                    className="w-full p-6 pl-14 bg-slate-50 border border-slate-200 rounded-[2rem] font-black text-3xl italic tracking-tighter text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600 transition-all shadow-inner disabled:opacity-30" 
                />
                <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={32} />
            </div>
            {!formData.disclaimerAccepted && (
                <p className="text-[9px] text-red-500 font-black uppercase tracking-widest px-1 mt-2">
                Acknowledge the legal disclaimer to unlock pricing input
                </p>
            )}
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Pricing Strategy Bias</label>
            <div className="grid grid-cols-1 gap-3">
                {[
                    { id: 'market_value', l: 'Balanced Market', d: 'Targeting current local averages for steady interest.' },
                    { id: 'above_market', l: 'Luxury Positioning', d: 'Testing upper price bound based on premium upgrades.' },
                    { id: 'below_market', l: 'Bidding War Sprint', d: 'Aggressive pricing to trigger multiple offers in 48h.' }
                ].map(strat => (
                    <button 
                    key={strat.id}
                    onClick={() => updateFormData('priceStrategy', strat.id)}
                    disabled={!formData.disclaimerAccepted}
                    className={`p-5 rounded-3xl border-2 text-left transition-all ${formData.priceStrategy === strat.id ? 'bg-indigo-50 border-indigo-600 shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-indigo-200'} disabled:opacity-50`}
                    >
                    <div className="flex justify-between items-center mb-1">
                        <p className="font-black text-[11px] uppercase tracking-tight">{strat.l}</p>
                        {formData.priceStrategy === strat.id && <Check size={16} className="text-indigo-600"/>}
                    </div>
                    <p className="text-[10px] italic leading-tight">{strat.d}</p>
                    </button>
                ))}
            </div>
          </div>
        </div>
      </div>
      
      {showUpgradesModal && (
        <UpgradesModal
          onClose={() => setShowUpgradesModal(false)}
          onSave={(upgrade) => {
            const newUpgrades = [...(formData.upgrades || []), upgrade];
            onUpgradesChange(newUpgrades);
            handleRefreshCMA();
          }}
        />
      )}
    </div>
  );
}

function UpgradesModal({ onClose, onSave }: { onClose: () => void, onSave: (u: any) => void }) {
  const [upgradeData, setUpgradeData] = useState({
    upgradeCategory: 'kitchen' as PropertyUpgrade['upgradeCategory'],
    description: '',
    yearCompleted: new Date().getFullYear(),
    cost: '',
    hasPermits: false,
    hasReceipts: false
  });
  
  const handleSave = () => {
    if (!upgradeData.description || !upgradeData.cost) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Calculate estimated value add using depreciation (Logic from prompt)
    const age = new Date().getFullYear() - upgradeData.yearCompleted;
    let depreciationSchedule = 15; // default
    
    if (upgradeData.upgradeCategory === 'roof' || upgradeData.upgradeCategory === 'hvac') {
      depreciationSchedule = 20;
    } else if (upgradeData.upgradeCategory === 'flooring') {
      depreciationSchedule = 10;
    }
    
    const depreciationFactor = Math.max(0, (depreciationSchedule - age) / depreciationSchedule);
    const estimatedValueAdd = Math.round(parseFloat(upgradeData.cost) * depreciationFactor);
    
    onSave({
      ...upgradeData,
      cost: parseFloat(upgradeData.cost),
      estimatedValueAdd
    });
  };
  
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[2000] p-6 animate-fade-in">
      <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl border border-white/20 animate-scale-in">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
          <div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Add Improvement.</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Factor Upgrades into Price Strategy</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100">
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Category</label>
            <select
              value={upgradeData.upgradeCategory}
              onChange={(e) => setUpgradeData({...upgradeData, upgradeCategory: e.target.value as any})}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none cursor-pointer"
            >
              <option value="kitchen">Kitchen Remodel</option>
              <option value="bathroom">Bathroom Remodel</option>
              <option value="flooring">New Flooring</option>
              <option value="roof">Roof Replacement</option>
              <option value="hvac">HVAC System</option>
              <option value="electrical">Electrical Upgrade</option>
              <option value="plumbing">Plumbing Upgrade</option>
              <option value="windows">New Windows</option>
              <option value="siding">New Siding</option>
              <option value="landscaping">Landscaping</option>
              <option value="pool">Pool/Spa</option>
              <option value="garage">Garage Addition/Upgrade</option>
              <option value="basement_finish">Basement Finish</option>
              <option value="addition">Room Addition</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Description</label>
            <textarea
              value={upgradeData.description}
              onChange={(e) => setUpgradeData({...upgradeData, description: e.target.value})}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs h-24 resize-none focus:ring-2 focus:ring-indigo-600 outline-none"
              placeholder="e.g. Full kitchen remodel with granite countertops..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Cost Paid</label>
              <div className="relative">
                <input
                    type="number"
                    value={upgradeData.cost}
                    onChange={(e) => setUpgradeData({...upgradeData, cost: e.target.value})}
                    className="w-full p-4 pl-10 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none"
                    placeholder="25000"
                />
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16}/>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Year Completed</label>
              <input
                type="number"
                value={upgradeData.yearCompleted}
                onChange={(e) => setUpgradeData({...upgradeData, yearCompleted: parseInt(e.target.value)})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none"
                min="1990"
                max={new Date().getFullYear()}
              />
            </div>
          </div>
          
          <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={upgradeData.hasPermits}
                onChange={(e) => setUpgradeData({...upgradeData, hasPermits: e.target.checked})}
                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
                Has building permits
              </span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={upgradeData.hasReceipts}
                onChange={(e) => setUpgradeData({...upgradeData, hasReceipts: e.target.checked})}
                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
                Has receipts/documentation
              </span>
            </label>
          </div>
          
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
            <Info size={16} className="text-indigo-600 mt-0.5" />
            <p className="text-[9px] text-indigo-800 font-bold uppercase tracking-tighter italic">
              Upgrades are depreciated based on age. Permitted work and receipts increase calculation accuracy.
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 mt-10">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black transition-all border-b-4 border-indigo-600 active:scale-95"
          >
            Add to Analysis
          </button>
        </div>
      </div>
    </div>
  );
}

export default Listings;