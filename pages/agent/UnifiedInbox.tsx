
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, MessageSquare, Phone, Mail, Instagram, Facebook,
  Send, Paperclip, MoreVertical, Star, Archive, 
  Sparkles, Bot, Clock, RefreshCw, CheckCheck, X,
  Mic, Image as ImageIcon, Play, Pause, Circle, PhoneCall, ArrowUpRight,
  ChevronRight, Trash2, ShieldCheck, Zap,
  AlertTriangle, ArrowRight, ChevronLeft, Gavel, AlertCircle,
  Loader2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { n8nService } from '../../services/n8n';
import { ChannelType, Conversation, Message } from '../../types';
import { ComplianceCheckedTextArea } from '../../components/AI/ComplianceCheckedTextArea';

interface UnifiedInboxProps {
  isMobile?: boolean;
}

const UnifiedInbox: React.FC<UnifiedInboxProps> = ({ isMobile }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [aiDraft, setAiDraft] = useState<string | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  
  // Mobile specific state
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const mockConversations: Conversation[] = [
    {
      id: 'transaction_err_1',
      contactName: 'Nexus Compliance Bot',
      lastMessage: 'CRITICAL: Disclosure Rejected for 123 Main St.',
      timestamp: 'Just Now',
      unread: 1,
      channel: 'sms',
      avatarColor: 'bg-red-100 text-red-600',
      sentiment: 'Critical',
      messages: [
        { id: 'm0', sender: 'contact', text: 'Transaction Alert: The Seller Disclosure for 123 Main St has been rejected by the admin. Reason: Missing Page 4 signature. Correct immediately to prevent closing delay.', timestamp: 'Just Now', type: 'sms' }
      ]
    },
    {
      id: '1',
      contactName: 'John Doe',
      lastMessage: 'Can we schedule a viewing for 123 Main St?',
      timestamp: '10:05 AM',
      unread: 2,
      channel: 'sms',
      avatarColor: 'bg-indigo-100 text-indigo-600',
      sentiment: 'Positive',
      messages: [
        { id: 'm1', sender: 'contact', text: 'Hi, I saw the listing on Zillow.', timestamp: '10:00 AM', type: 'sms' },
        { id: 'm2', sender: 'contact', text: 'Can we schedule a viewing for 123 Main St?', timestamp: '10:05 AM', type: 'sms' }
      ]
    },
    {
      id: '4',
      contactName: 'Maria Garcia',
      lastMessage: '[Voice Note]',
      timestamp: '10:30 AM',
      unread: 1,
      channel: 'whatsapp',
      avatarColor: 'bg-emerald-100 text-emerald-600',
      sentiment: 'Urgent',
      messages: [
        { id: 'm1', sender: 'contact', text: 'Here is the photo of the kitchen I liked.', timestamp: '10:28 AM', type: 'whatsapp', mediaUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', mediaType: 'image', aiTranscription: 'AI Vision: Modern kitchen with white marble countertops and gold fixtures.' },
        { id: 'm2', sender: 'contact', text: '[Voice Note]', timestamp: '10:30 AM', type: 'whatsapp', mediaType: 'audio', aiTranscription: 'AI Whisper: "Hey, I really love this layout. Can we see if they accept FHA financing? Let me know ASAP."' }
      ]
    }
  ];

  useEffect(() => {
    setConversations(mockConversations);
    if (!isMobile && mockConversations.length > 0) {
      setSelectedChat(mockConversations[0]);
    }
  }, [isMobile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages, showChatOnMobile]);

  const handleSelectChat = (chat: Conversation) => {
    setSelectedChat(chat);
    if (isMobile) setShowChatOnMobile(true);
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim() || !selectedChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: selectedChat.channel
    };

    const updatedChat = { ...selectedChat, messages: [...selectedChat.messages, newMessage] };
    setSelectedChat(updatedChat);
    setConversations(prev => prev.map(c => c.id === selectedChat.id ? updatedChat : c));
    
    setInputText('');
    setAiDraft(null);
    setIsSending(true);
    await n8nService.sendMessage(selectedChat.contactName, selectedChat.channel, newMessage.text);
    setIsSending(false);
  };

  const generateSmartReply = async () => {
    if (!selectedChat || !process.env.API_KEY) return;
    setIsDrafting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = selectedChat.messages.map(m => {
          if (m.mediaType === 'audio') return `${m.sender} (Voice): ${m.aiTranscription}`;
          if (m.mediaType === 'image') return `${m.sender} (Image): ${m.aiTranscription}`;
          return `${m.sender}: ${m.text}`;
      }).join('\n');
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: `Draft a professional real estate response to: ${context}` }] }]
      });
      if (response.text) setAiDraft(response.text.trim());
    } catch (e) { console.error(e); }
    finally { setIsDrafting(false); }
  };

  const initiateWarmTransfer = async () => {
      if (!selectedChat) return;
      if (confirm(`Start warm transfer to lead ${selectedChat.contactName}?`)) {
          await n8nService.startWarmTransfer(selectedChat.id, '+15550009999', '+15125550101');
          alert("Nexus OS: Initializing VOIP handover. Syncing with mobile terminal.");
      }
  };

  const getChannelIcon = (channel: ChannelType) => {
    switch (channel) {
      case 'sms': return <MessageSquare size={12} />;
      case 'email': return <Mail size={12} />;
      case 'whatsapp': return <MessageSquare size={12} className="text-emerald-600" />;
      default: return <MessageSquare size={12} />;
    }
  };

  return (
    <div className={`flex bg-white shadow-2xl border border-slate-200 overflow-hidden animate-fade-in
      ${isMobile ? 'fixed inset-0 z-[60] h-full' : 'h-[calc(100vh-160px)] rounded-[2.5rem] w-full'}`}>
      
      {/* SIDEBAR: INBOX LIST */}
      <div className={`${isMobile && showChatOnMobile ? 'hidden' : 'flex'} w-full md:w-[320px] lg:w-[400px] border-r border-slate-100 flex-col bg-slate-50 shrink-0 h-full overflow-hidden`}>
        <div className="p-6 border-b border-slate-200 bg-white shrink-0">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">Nexus Inbox</h2>
             {!isMobile && <button className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600"><RefreshCw size={14}/></button>}
          </div>
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="FILTER INBOX..." 
              className="w-full pl-10 pr-4 py-3 bg-slate-100/50 border-2 border-transparent rounded-xl text-[10px] font-black uppercase tracking-widest focus:bg-white focus:border-indigo-500 outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide divide-y divide-slate-100">
          {conversations.map(chat => (
            <div 
              key={chat.id}
              onClick={() => handleSelectChat(chat)}
              className={`p-5 hover:bg-white transition-all cursor-pointer relative group ${selectedChat?.id === chat.id ? 'bg-white shadow-inner' : ''} ${chat.sentiment === 'Critical' ? 'bg-red-50/30' : ''}`}
            >
              {selectedChat?.id === chat.id && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600" />}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs uppercase shadow-sm border border-white shrink-0 ${chat.avatarColor}`}>
                    {chat.contactName.includes('Bot') ? <Bot size={18}/> : chat.contactName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <h4 className={`text-xs uppercase tracking-tight truncate ${chat.unread > 0 ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>
                      {chat.contactName}
                    </h4>
                    <span className={`text-[8px] font-black uppercase ${chat.sentiment === 'Critical' ? 'text-red-600' : 'text-indigo-500'}`}>
                        {chat.sentiment === 'Critical' && <AlertTriangle size={8} className="inline mr-1"/>}
                        {chat.channel}
                    </span>
                  </div>
                </div>
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest shrink-0 ml-2">{chat.timestamp}</span>
              </div>
              <p className={`text-[10px] truncate pl-13 leading-tight ${chat.unread > 0 ? 'text-slate-800 font-bold' : 'text-slate-400 font-medium'}`}>
                {chat.lastMessage}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN STAGE: MESSAGE HISTORY & REPLY WINDOW */}
      <div className={`${isMobile && !showChatOnMobile ? 'hidden' : 'flex'} flex-1 flex-col bg-white relative h-full overflow-hidden min-w-0`}>
        {selectedChat ? (
          <>
            {/* CHAT HEADER */}
            <div className="h-20 px-8 border-b border-slate-100 flex justify-between items-center bg-white/95 backdrop-blur-md shrink-0 z-30">
              <div className="flex items-center gap-4 min-w-0">
                {isMobile && (
                    <button onClick={() => setShowChatOnMobile(false)} className="p-2 text-slate-400 -ml-2">
                        <ChevronLeft size={24} />
                    </button>
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-md border-2 border-white shrink-0 ${selectedChat.avatarColor}`}>
                  {selectedChat.contactName.includes('Bot') ? <Bot size={20}/> : selectedChat.contactName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight italic italic truncate">
                    {selectedChat.contactName}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{selectedChat.channel}</span>
                    <div className="w-1 h-1 bg-slate-200 rounded-full" />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${selectedChat.sentiment === 'Critical' ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                        {selectedChat.sentiment === 'Critical' ? 'Compliance Issue' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                    onClick={initiateWarmTransfer}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 border-b-2 border-indigo-600"
                >
                    <PhoneCall size={14} /> Handover
                </button>
                <button className="p-2 text-slate-300 hover:text-indigo-600 rounded-xl transition-all">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* MESSAGES FEED */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 bg-slate-50/30 scrollbar-hide">
              <div className="max-w-4xl mx-auto w-full space-y-8 pb-48">
                {selectedChat.sentiment === 'Critical' && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-[2rem] p-8 text-red-900 shadow-2xl relative overflow-hidden group">
                        <div className="absolute right-[-20px] top-[-20px] p-2 opacity-5 text-red-900 group-hover:rotate-12 transition-transform duration-1000"><AlertTriangle size={180}/></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-600 text-white rounded-xl shadow-lg"><Gavel size={20}/></div>
                                <h4 className="font-black text-xs uppercase tracking-widest">Compliance Restriction</h4>
                            </div>
                            <p className="text-sm font-bold leading-tight mb-6 italic">"Brokerage Guard has restricted outbound comms for this deal. missing legal signatures detected."</p>
                            <button className="bg-red-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">Repair Doc Vault</button>
                        </div>
                    </div>
                )}

                {selectedChat.messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                    <div className={`max-w-[85%] md:max-w-[70%] space-y-2`}>
                      <div className={`rounded-[1.75rem] px-6 py-4 shadow-sm relative ${
                          msg.sender === 'user' 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : selectedChat.sentiment === 'Critical' ? 'bg-red-50 border border-red-100 text-red-900 rounded-bl-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                      }`}>
                          {msg.mediaType === 'image' && <img src={msg.mediaUrl} className="rounded-xl mb-3 shadow-md border-2 border-white" />}
                          <p className="text-sm font-bold leading-relaxed">{msg.text}</p>
                          {msg.aiTranscription && (
                              <div className="mt-3 pt-3 border-t border-black/5 flex items-center gap-2 opacity-80">
                                  <Bot size={12}/>
                                  <p className="text-[10px] italic font-medium leading-tight">{msg.aiTranscription}</p>
                              </div>
                          )}
                      </div>
                      <div className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 flex items-center gap-2 ${msg.sender === 'user' ? 'justify-end text-slate-400' : 'text-slate-400'}`}>
                        {msg.timestamp}
                        {msg.sender === 'user' && <CheckCheck size={12} className="text-indigo-400" />}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* REPLY WINDOW (Pinned Input Area) */}
            <div className={`absolute bottom-0 left-0 right-0 p-6 lg:p-8 bg-white border-t border-slate-100 shadow-[0_-20px_40px_rgba(0,0,0,0.03)] z-40`}>
              <div className="max-w-4xl mx-auto w-full">
                {aiDraft && (
                    <div className="mb-4 bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-4 animate-fade-in-up relative">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                <Bot size={16} className="text-indigo-600" />
                                <span className="text-[9px] font-black text-indigo-900 uppercase tracking-widest">Synthetic Intelligence Draft</span>
                            </div>
                            <button onClick={() => setAiDraft(null)} className="text-indigo-300 hover:text-indigo-600"><X size={14}/></button>
                        </div>
                        <p className="text-xs font-bold text-indigo-900 italic leading-relaxed mb-4">"{aiDraft}"</p>
                        <div className="flex gap-2">
                          <button onClick={() => handleSendMessage(aiDraft)} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-indigo-700 shadow-lg">Authorize & Send</button>
                          <button onClick={() => { setInputText(aiDraft); setAiDraft(null); }} className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-indigo-50">Refine</button>
                        </div>
                    </div>
                )}

                <div className="flex gap-4 items-end">
                  <button className="p-4 text-slate-400 hover:text-indigo-600 bg-slate-50 border border-slate-100 rounded-2xl transition-all shadow-inner shrink-0">
                    <Paperclip size={20} />
                  </button>
                  <div className="flex-1 relative group">
                    <ComplianceCheckedTextArea
                        value={inputText}
                        onChange={setInputText}
                        onSend={handleSendMessage}
                        contentType={selectedChat.channel === 'email' ? 'email' : 'sms'}
                        placeholder={selectedChat.sentiment === 'Critical' ? 'LOCKED: CORRECT COMPLIANCE ABOVE' : `Reply to ${selectedChat.contactName.split(' ')[0]}...`}
                        className="!p-4 !rounded-2xl !h-14 !max-h-40"
                        sendLabel="Dispatch"
                    />
                    <button 
                      onClick={generateSmartReply}
                      disabled={isDrafting || !!aiDraft || selectedChat.sentiment === 'Critical'}
                      className="absolute right-20 bottom-14 p-2 bg-white rounded-xl shadow-md border border-slate-100 text-indigo-600 hover:scale-110 active:scale-95 transition-all disabled:opacity-30 z-10"
                    >
                      {isDrafting ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-12 text-center animate-fade-in bg-slate-50/20 h-full">
            <div className="w-32 h-32 bg-white rounded-[3rem] shadow-xl flex items-center justify-center mb-8 border border-slate-50 group">
                <MessageSquare size={60} className="opacity-10 group-hover:scale-110 transition-transform duration-700" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Inbox Protocol Offline.</h3>
            <p className="max-w-xs text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4 leading-relaxed px-6">
                Select a conversation from the sidebar to initialize communication synthesis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedInbox;
