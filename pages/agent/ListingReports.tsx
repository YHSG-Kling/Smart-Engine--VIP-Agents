
import React, { useState, useEffect } from 'react';
import { 
  FileText, Sparkles, Send, Eye, Download, 
  RefreshCw, CheckCircle2, ChevronLeft, Loader2, 
  Bot, Clock, TrendingUp, TrendingDown, Edit3, Save, 
  Mail, Paperclip, MessageSquare, Phone,
  // Added Users and Share2 to fix 'Cannot find name' errors
  Users, Share2,
  // Added missing X icon
  X
} from 'lucide-react';
import { Listing, SellerReport } from '../../types';
import { n8nService } from '../../services/n8n';
import { GoogleGenAI } from "@google/genai";

interface ListingReportsProps {
  listing: Listing;
  onBack: () => void;
}

const ListingReports: React.FC<ListingReportsProps> = ({ listing, onBack }) => {
  const [reports, setReports] = useState<SellerReport[]>([
    { id: 'rep_1', listingId: listing.id, address: listing.address, weekEnding: 'Oct 27, 2023', viewsZillow: 450, showingsCount: 4, status: 'Sent', feedbackSummaryAI: 'High interest in kitchen. One objection on master bath color.', openRate: 100, replyRate: 25 },
    { id: 'rep_2', listingId: listing.id, address: listing.address, weekEnding: 'Oct 20, 2023', viewsZillow: 795, showingsCount: 8, status: 'Sent', feedbackSummaryAI: 'Initial launch velocity very high. Recommended open house strategy.', openRate: 85, replyRate: 10 }
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [draftReport, setDraftReport] = useState<SellerReport | null>(null);
  const [editedFeedback, setEditedFeedback] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleGenerateDraft = async () => {
    setIsGenerating(true);
    setDraftReport(null);

    try {
        if (process.env.API_KEY) {
            // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                You are a senior real estate agent writing a weekly performance summary to your client, the seller of ${listing.address}.
                
                THIS WEEK'S DATA:
                - Zillow Views: ${listing.stats.views} (Benchmark: ${listing.benchmarks?.views})
                - Showings: ${listing.stats.showings} (Benchmark: ${listing.benchmarks?.showings})
                - Recent Feedback: "Master bath is dated", "Great light", "Price feels 5% high"
                
                TASK:
                Write a 2-3 paragraph professional, data-driven update. 
                Paragraph 1: Summary of traffic activity.
                Paragraph 2: Synthesis of showing feedback.
                Paragraph 3: Clear recommendation (Price drop, paint credit, or stay the course).
                
                TONE: Direct, empathetic, expert.
            `;

            // Following guidelines: using string contents for single text prompt
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });

            // The generated text output is extracted using the .text property
            const aiText = response.text || "Report generation failed.";
            
            const newDraft: SellerReport = {
                id: `draft_${Date.now()}`,
                listingId: listing.id,
                address: listing.address,
                weekEnding: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
                viewsZillow: listing.stats.views,
                showingsCount: listing.stats.showings,
                feedbackSummaryAI: aiText,
                status: 'Draft'
            };
            setDraftReport(newDraft);
            setEditedFeedback(aiText);
        } else {
            // Simulation
            setTimeout(() => {
                const aiText = `Hi there! We had a solid week of activity for ${listing.address} with ${listing.stats.views} views online. This is tracking well above our local benchmark. However, we only had ${listing.stats.showings} in-person tours. Showing feedback consistently mentions the master bathroom color as a point of friction. I recommend we offer a $1,500 'Designer Paint Credit' in the listing to overcome this objection immediately and secure an offer by next weekend.`;
                const newDraft: SellerReport = {
                    id: `draft_${Date.now()}`,
                    listingId: listing.id,
                    address: listing.address,
                    weekEnding: 'Nov 3, 2023',
                    viewsZillow: listing.stats.views,
                    showingsCount: listing.stats.showings,
                    feedbackSummaryAI: aiText,
                    status: 'Draft'
                };
                setDraftReport(newDraft);
                setEditedFeedback(aiText);
                setIsGenerating(false);
            }, 1500);
            return;
        }
    } catch (e) {
        console.error(e);
        alert("AI Draft failed.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleApproveAndSend = async () => {
    if (!draftReport) return;
    setIsSending(true);
    
    // Workflow 63: Approve & Send
    await n8nService.triggerWorkflow('approve-send-seller-report', { 
        reportId: draftReport.id, 
        listingId: listing.id,
        content: editedFeedback 
    });

    setTimeout(() => {
        const finalReport = { ...draftReport, feedbackSummaryAI: editedFeedback, status: 'Sent' as const };
        setReports([finalReport, ...reports]);
        setDraftReport(null);
        setIsSending(false);
        alert("Report sent successfully to " + listing.sellerEmail);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h3 className="font-bold text-lg text-slate-800">Performance Reports: {listing.address}</h3>
            <p className="text-sm text-slate-500">Proactive value demonstration for your seller.</p>
          </div>
        </div>
        <button 
          onClick={handleGenerateDraft}
          disabled={isGenerating}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          Generate New Draft
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main List / Editor Area */}
          <div className="lg:col-span-2 space-y-6">
              
              {/* Draft Editor (Workflow 63 View B) */}
              {draftReport && (
                <div className="bg-white rounded-2xl border-2 border-indigo-500 shadow-2xl overflow-hidden animate-fade-in-up">
                    <div className="p-6 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Bot className="text-indigo-600" size={20}/>
                            <h4 className="font-black text-indigo-900 uppercase tracking-widest text-xs">AI DRAFT: Week Ending {draftReport.weekEnding}</h4>
                        </div>
                        {/* Fix: Usage of X icon */}
                        <button onClick={() => setDraftReport(null)} className="text-indigo-400 hover:text-indigo-600"><X size={18}/></button>
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Zillow Views</p>
                                <p className="text-2xl font-black text-slate-800">{draftReport.viewsZillow}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Showings</p>
                                <p className="text-2xl font-black text-slate-800">{draftReport.showingsCount}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                <Edit3 size={12}/> Executive Summary & Pivot Strategy
                            </label>
                            <textarea 
                                value={editedFeedback}
                                onChange={(e) => setEditedFeedback(e.target.value)}
                                className="w-full h-64 p-6 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium"
                            />
                        </div>

                        <div className="mt-8 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase">
                                <Paperclip size={14}/> Auto-Attached: Market Comps & Lead Log
                            </div>
                            <button 
                                onClick={handleApproveAndSend}
                                disabled={isSending}
                                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-3 hover:bg-indigo-700 shadow-xl transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isSending ? <Loader2 size={10} className="animate-spin" /> : <Send size={20}/>}
                                Approve & Send to Seller
                            </button>
                        </div>
                    </div>
                </div>
              )}

              {/* History List */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 font-black text-slate-400 uppercase tracking-widest text-[10px]">
                      Report History
                  </div>
                  <div className="divide-y divide-slate-100">
                      {reports.map(report => (
                          <div key={report.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                              <div className="flex items-center gap-6">
                                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                                      <FileText size={24}/>
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-800">Week Ending {report.weekEnding}</h4>
                                      <div className="flex items-center gap-4 mt-1">
                                          <span className="text-xs text-slate-400 flex items-center gap-1"><Eye size={12}/> {report.viewsZillow} Views</span>
                                          <span className="text-xs text-slate-400 flex items-center gap-1"><Users size={12}/> {report.showingsCount} Showings</span>
                                          <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-black uppercase border border-emerald-100">Sent</span>
                                      </div>
                                  </div>
                              </div>
                              <div className="flex items-center gap-6">
                                  <div className="text-right hidden md:block">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Engagement</p>
                                      <div className="flex items-center gap-2">
                                          <span className="text-xs font-bold text-slate-700">{report.openRate}% Open</span>
                                          <span className="text-xs font-bold text-indigo-600">{report.replyRate}% Reply</span>
                                      </div>
                                  </div>
                                  <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                                      <Eye size={20}/>
                                  </button>
                              </div>
                          </div>
                      ))}
                      {reports.length === 0 && (
                          <div className="p-12 text-center text-slate-400 italic">
                              No reports sent for this listing yet.
                          </div>
                      )}
                  </div>
              </div>
          </div>

          {/* Right Sidebar: Contextual Stats */}
          <div className="space-y-6">
              <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                      <h4 className="font-black text-indigo-400 uppercase tracking-widest text-[10px] mb-6">Market Position</h4>
                      <div className="space-y-8">
                          <div>
                              <div className="flex justify-between items-end mb-2">
                                  <span className="text-xs text-slate-400 font-bold uppercase">Online Interest</span>
                                  <span className="text-emerald-400 font-black flex items-center gap-1 text-sm"><TrendingUp size={14}/> {listing.benchmarks?.views}</span>
                              </div>
                              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 w-[75%]" />
                              </div>
                          </div>
                          <div>
                              <div className="flex justify-between items-end mb-2">
                                  <span className="text-xs text-slate-400 font-bold uppercase">Showing Velocity</span>
                                  <span className="text-red-400 font-black flex items-center gap-1 text-sm"><TrendingDown size={14}/> {listing.benchmarks?.showings}</span>
                              </div>
                              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-red-500 w-[35%]" />
                              </div>
                          </div>
                      </div>
                      
                      <div className="mt-10 p-5 bg-white/5 rounded-2xl border border-white/10">
                          <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1 flex items-center gap-1"><Sparkles size={12}/> Pro Tip</p>
                          <p className="text-xs text-indigo-100 leading-relaxed italic">
                              "Showings are underperforming views. This usually indicates a pricing mismatch or photos not matching physical reality. Suggest a walkthrough to refresh staging."
                          </p>
                      </div>
                  </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><MessageSquare size={18} className="text-indigo-600"/> Rapid Response</h4>
                  <p className="text-xs text-slate-500 mb-6">Clients who receive weekly reports are 85% less likely to cancel their listing agreement.</p>
                  <div className="space-y-3">
                      <button className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold hover:bg-slate-100 flex items-center justify-center gap-2">
                          View Recent Feedback Log
                      </button>
                      <button className="w-full bg-indigo-50 text-indigo-700 py-3 rounded-xl text-xs font-bold hover:bg-indigo-100 flex items-center justify-center gap-2">
                          Draft Pre-Close Gift
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

const XCircle = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
);

export default ListingReports;
