
import React, { useState, useEffect } from 'react';
import { Search, Command, ArrowRight, Zap, Users, FileText, Settings, Sparkles, Loader2, Map as MapIcon, BarChart3, MessageSquare } from 'lucide-react';
import { n8nService } from '../../services/n8n';
import { GoogleGenAI } from "@google/genai";

interface CommandBarProps {
  onNavigate: (view: string) => void;
}

const CommandBar: React.FC<CommandBarProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Keyboard Shortcut Handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!isOpen) return null;

  const actions = [
    { label: 'Add New Lead', icon: Users, shortcut: 'N', action: () => { onNavigate('crm'); setIsOpen(false); } },
    { label: 'Create Transaction', icon: FileText, shortcut: 'T', action: () => { onNavigate('transactions'); setIsOpen(false); } },
    { label: 'View Financials', icon: Zap, shortcut: 'F', action: () => { onNavigate('financials'); setIsOpen(false); } },
    { label: 'System Settings', icon: Settings, shortcut: 'S', action: () => { onNavigate('settings'); setIsOpen(false); } },
  ];

  const handleAICommand = async () => {
    if (!query) return;
    setIsProcessing(true);
    setAiResponse(null);
    
    try {
        // Check for API Key (In a real app, handle this gracefully)
        if (!process.env.API_KEY) {
            // Fallback for demo if no key
            simulateProcessing(query);
            return;
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            config: { 
                responseMimeType: 'application/json',
                temperature: 0.2
            },
            contents: {
                parts: [{
                    text: `You are an intelligent command parser for the Nexus Real Estate OS.
                    Analyze the User Request and map it to an intent.

                    Available Navigation Routes:
                    - 'agent-dashboard': Home, Dashboard, Overview
                    - 'crm': CRM, Leads, Contacts, People
                    - 'transactions': Deals, Pipeline, Contracts, Escrow
                    - 'financials': Money, GCI, Commission, Stats
                    - 'marketing': Marketing, Ads, Social, Campaigns
                    - 'inbox': Messages, SMS, Email, Chat
                    - 'map-intelligence': Map, Location, Search Area
                    - 'settings': Config, Settings, Profile

                    Response Schema (JSON):
                    {
                        "intent": "NAVIGATE" | "ACTION" | "INFO",
                        "targetRoute": "string (one of the available routes, only if NAVIGATE)",
                        "actionType": "string (e.g. create_lead, send_email, search - only if ACTION)",
                        "feedbackMessage": "string (A concise, natural language confirmation message)"
                    }

                    User Request: "${query}"`
                }]
            }
        });

        const resultText = response.text;
        if (resultText) {
            const data = JSON.parse(resultText);
            setAiResponse(data.feedbackMessage);

            if (data.intent === 'NAVIGATE' && data.targetRoute) {
                setTimeout(() => {
                    onNavigate(data.targetRoute);
                    setIsOpen(false);
                }, 1000);
            } else if (data.intent === 'ACTION') {
                // Execute mock action via service
                if (data.actionType === 'send_email' || data.actionType === 'create_lead') {
                    await n8nService.triggerClientAction(data.actionType, 'current_user', { query });
                }
                setTimeout(() => setIsOpen(false), 1500);
            }
        } else {
            setAiResponse("I wasn't sure how to handle that. Try 'Go to CRM' or 'Add Lead'.");
        }

    } catch (error) {
        console.error("AI Command Error:", error);
        // Fallback to simulation on error
        simulateProcessing(query);
    } finally {
        setIsProcessing(false);
    }
  };

  // Fallback simulation for when API is missing or fails
  const simulateProcessing = (q: string) => {
      const lowerQ = q.toLowerCase();
      setTimeout(async () => {
        setIsProcessing(false);
        if (lowerQ.includes('lead') || lowerQ.includes('add')) {
            onNavigate('crm');
            setAiResponse("Navigating to CRM to add lead...");
            setTimeout(() => setIsOpen(false), 1000);
        } else if (lowerQ.includes('deal') || lowerQ.includes('contract')) {
            onNavigate('transactions');
            setAiResponse("Opening Transaction Manager...");
            setTimeout(() => setIsOpen(false), 1000);
        } else if (lowerQ.includes('email') || lowerQ.includes('message')) {
            await n8nService.sendMessage('Last Contact', 'sms', 'Hey, just checking in!');
            setAiResponse("✅ AI: I've drafted that message for you in the Unified Inbox.");
            setTimeout(() => {
                onNavigate('inbox');
                setIsOpen(false);
            }, 1500);
        } else {
            setAiResponse("I didn't quite catch that. Try 'View Dashboard' or 'Add Lead'.");
        }
    }, 1000);
  };

  const filteredActions = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-start justify-center pt-[20vh]">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in-up transition-all">
        <div className="flex items-center px-4 py-3 border-b border-slate-100">
          {isProcessing ? <Loader2 className="animate-spin text-indigo-600 w-5 h-5" /> : <Sparkles className="text-indigo-600 w-5 h-5" />}
          <input 
            type="text" 
            placeholder="Ask Nexus to do something... (e.g. 'Take me to my deals')" 
            className="w-full px-4 py-2 text-lg outline-none text-slate-700 placeholder:text-slate-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAICommand()}
            autoFocus
          />
          <div className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200 font-mono">
            ESC
          </div>
        </div>
        
        <div className="p-2">
          {aiResponse && (
              <div className="px-3 py-2 text-sm text-indigo-700 bg-indigo-50 rounded-lg mb-2 flex items-center gap-2 animate-pulse">
                  <BotIcon size={16} /> {aiResponse}
              </div>
          )}

          {filteredActions.length > 0 && (
              <>
                <div className="text-xs font-bold text-slate-400 uppercase px-3 py-2">Quick Actions</div>
                {filteredActions.map((action, i) => (
                    <button 
                    key={i}
                    onClick={action.action}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-colors group"
                    >
                    <div className="flex items-center gap-3">
                        <action.icon size={18} className="group-hover:text-indigo-600" />
                        <span className="font-medium">{action.label}</span>
                    </div>
                    <span className="text-xs bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 font-mono group-hover:border-indigo-200 group-hover:text-indigo-500">
                        {action.shortcut}
                    </span>
                    </button>
                ))}
              </>
          )}
          
          {filteredActions.length === 0 && !aiResponse && query && (
              <div 
                onClick={handleAICommand}
                className="px-3 py-3 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center gap-2 text-slate-600 group"
              >
                  <Sparkles size={16} className="text-indigo-500 group-hover:animate-spin" /> 
                  <span>Ask AI to process "<strong>{query}</strong>"...</span>
              </div>
          )}

          {!query && !aiResponse && (
             <div className="px-4 py-4 text-center text-slate-400 text-sm">
                <p>Try "Go to Marketing", "Add Lead John Doe", or "Show my Deals"</p>
             </div>
          )}
        </div>
        
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Command size={12} /> <span><strong>Cmd + K</strong> to open</span>
          </div>
          <span>Nexus OS v2.5 AI Powered</span>
        </div>
      </div>
      
      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10" onClick={() => setIsOpen(false)} />
    </div>
  );
};

const BotIcon = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
);

export default CommandBar;
