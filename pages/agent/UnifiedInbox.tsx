import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, MessageSquare, Phone, Mail, Instagram, Facebook,
  Send, Paperclip, MoreVertical, Star, Archive, 
  Sparkles, Bot, Clock, RefreshCw, CheckCheck, X,
  Mic, Image as ImageIcon, Play, Pause, Circle, PhoneCall, ArrowUpRight,
  ChevronRight, Trash2, ShieldCheck, Zap,
  AlertTriangle, ArrowRight, ChevronLeft, Gavel, AlertCircle
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { n8nService } from '../../services/n8n';
import { ChannelType, Conversation, Message } from '../../types';

interface UnifiedInboxProps {
  isMobile?: boolean;
}

// Extended Message type for internal inbox logic
interface InboxMessage extends Message {
    isTransactionError?: boolean;
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
  
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
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
    },
    {
      id: '3',
      contactName: 'Mike Ross',
      lastMessage: 'Why haven\'t you responded to my offer?',
      timestamp: '2 days ago',
      unread: 1,
      channel: 'facebook',
      avatarColor: 'bg-blue-100 text-blue-600',
      sentiment: 'Angry',
      messages: [
        { id: 'm1', sender: 'contact', text: 'Why haven\'t you responded to my offer?', timestamp: '2 days ago', type: 'facebook' }
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
    if (isMobile) {
      setShowChatOnMobile(true);
    }
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
        contents: [{ role: 'user', parts: [{ text: `
          You are a top-tier real estate agent assistant. Draft a short, professional, and helpful reply to the last message in this conversation.
          If the last message was a voice note asking a question, answer it.
          Context:
          ${context}
          Reply:
        `}]}]
      });
      if (response.text) setAiDraft(response.text.trim());
    } catch (e) {
      console.error(e);
    } finally {
      setIsDrafting(false);
    }
  };

  const initiateWarmTransfer = async () => {
      if (!selectedChat) return;
      if (confirm(`Start warm transfer to lead ${selectedChat.contactName}?`)) {
          await n8nService.startWarmTransfer(selectedChat.id, '+15550009999', '+15125550101');
          alert("Nexus OS: Initializing VOIP handover. Check your primary mobile device.");
      }
  };

  const getChannelIcon = (channel: ChannelType) => {
    switch (channel) {
      case 'sms': return <MessageSquare size={12} />;
      case 'email': return <Mail size={12} />;
      case 'instagram': return <Instagram size={12} />;
      case 'facebook': return <Facebook size={12} />;
      case 'whatsapp': return <MessageSquare size={12} className="text-emerald-600" />;
      default: return <MessageSquare size={12} />;
    }
  };

  const toggleAudio = (id: string) => {
      if (playingAudioId === id) setPlayingAudioId(null);
      else {
          setPlayingAudioId(id);
          setTimeout(() => setPlayingAudioId(null), 3000);
      }
  };

  return (
    <div className={`flex bg-white shadow-2xl border border-slate-200 overflow-hidden animate-fade-in mx-auto max-w-[1400px] 
      ${isMobile ? 'fixed inset-0 z-[60] h-full rounded-none' : 'h-[calc(100vh-180px)] rounded-[2rem]'}`}>
      
      {/* Sidebar: Conversations List */}
      <div className={`${isMobile && showChatOnMobile ? 'hidden' : 'flex'} w-full md:w-[340px] border-r border-slate-100 flex-col bg-slate-50/50 shrink-0`}>
        <div className="p-6 border-b border-slate-100 bg-white">
          <div className="flex justify-between items-center mb-4 md:hidden">
             <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Nexus Inbox</h2>
             <button onClick={() => window.history.back()} className="p-2 text-slate-400"><X size={20}/></button>
          </div>
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="FILTER NEXUS INBOX..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100/50 border-2 border-transparent rounded-xl text-[10px] font-black uppercase tracking-[0.15em] focus:ring-0 focus:border-indigo-500 focus:bg-white transition-all outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide divide-y divide-slate-100">
          {conversations.map(chat => (
            <div 
              key={chat.id}
              onClick={() => handleSelectChat(chat)}
              className={`p-5 hover:bg-white transition-all cursor-pointer relative group ${selectedChat?.id === chat.id ? 'bg-white shadow-inner' : ''} ${chat.sentiment === 'Critical' ? 'bg-red-50/50' : ''}`}
            >
              {selectedChat?.id === chat.id && !isMobile && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600" />}
              
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs uppercase shadow-sm border-2 border-white ${chat.avatarColor}`}>
                    {chat.contactName.includes('Bot') ? <Bot size={18}/> : chat.contactName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <h4 className={`text-xs uppercase tracking-tight truncate ${chat.unread > 0 ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>
                      {chat.contactName}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className={`flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.2em] ${
                            chat.sentiment === 'Critical' ? 'text-red-600' :
                            chat.channel === 'sms' ? 'text-indigo-600' :
                            chat.channel === 'whatsapp' ? 'text-emerald-600' :
                            'text-slate-400'
                        }`}>
                            {chat.sentiment === 'Critical' ? <AlertTriangle size={10}/> : getChannelIcon(chat.channel)} {chat.channel}
                        </span>
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{chat.timestamp}</span>
              </div>
              
              <p className={`text-[11px] truncate pl-[52px] leading-tight ${chat.unread > 0 ? 'text-slate-800 font-bold' : 'text-slate-400 font-medium'} ${chat.sentiment === 'Critical' ? 'text-red-700' : ''}`}>
                {chat.lastMessage}
              </p>
              
              {chat.unread > 0 && (
                  <div className={`absolute right-5 bottom-5 w-5 h-5 ${chat.sentiment === 'Critical' ? 'bg-red-600' : 'bg-indigo-600'} rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100`}>
                    <span className="text-[9px] font-black text-white">{chat.unread}</span>
                  </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className={`${isMobile && !showChatOnMobile ? 'hidden' : 'flex'} flex-1 flex-col bg-white relative h-full`}>
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="h-24 px-4 md:px-8 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20 shrink-0">
              <div className="flex items-center gap-3 md:gap-5">
                {isMobile && (
                    <button onClick={() => setShowChatOnMobile(false)} className="p-2 text-slate-400 -ml-2">
                        <ChevronLeft size={24} />
                    </button>
                )}
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-[1rem] md:rounded-[1.5rem] flex items-center justify-center font-black text-xs md:text-sm shadow-xl border-2 md:border-4 border-white ${selectedChat.avatarColor}`}>
                  {selectedChat.contactName.includes('Bot') ? <Bot size={24}/> : selectedChat.contactName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2 italic truncate">
                    {selectedChat.contactName}
                    <div className={`w-2 h-2 rounded-full ${selectedChat.sentiment === 'Critical' ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'} shrink-0`} />
                  </h3>
                  <div className="flex items-center gap-2 md:gap-4 mt-1">
                      <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         {getChannelIcon(selectedChat.channel)} {selectedChat.channel}
                      </div>
                      {!isMobile && (
                        <>
                          <div className="w-1 h-1 bg-slate-200 rounded-full" />
                          {selectedChat.sentiment === 'Critical' 
                            ? <span className="text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><AlertCircle size={12}/> ACTION REQUIRED</span> 
                            : <span className="text-emerald-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><ArrowUpRight size={12}/> AI: Intent High</span>
                          }
                        </>
                      )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <button 
                    onClick={initiateWarmTransfer}
                    className="flex items-center gap-2 bg-slate-900 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl active:scale-95 border-b-2 md:border-b-4 border-indigo-600"
                >
                    <PhoneCall size={14} className="hidden md:block" /> {isMobile ? 'VOIP' : 'Transfer'}
                </button>
                <button className="p-2 md:p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all" title="Settings">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-8 scrollbar-hide bg-slate-50/30">
              {/* Transaction Alert Card for specific errors */}
              {selectedChat.sentiment === 'Critical' && (
                  <div className="flex justify-center mb-6">
                      <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 text-red-900 max-w-xl shadow-xl relative overflow-hidden group">
                          <div className="absolute right-[-20px] top-[-20px] p-2 opacity-5 text-red-900 group-hover:rotate-12 transition-transform duration-1000"><AlertTriangle size={150}/></div>
                          <div className="relative z-10">
                            <h4 className="font-black text-xs uppercase tracking-[0.25em] flex items-center gap-2 mb-4"><Gavel size={16}/> Transaction Protocol Failure</h4>
                            <p className="text-sm font-bold leading-relaxed mb-6">
                                "The legal department has flagged an error in the last disclosure. All transaction timelines for <strong className="text-red-600">123 Main St</strong> are currently halted."
                            </p>
                            <button className="w-full bg-red-600 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-red-700 active:scale-95 transition-all">Resolve In Document Vault</button>
                          </div>
                      </div>
                  </div>
              )}

              {selectedChat.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                  <div className={`max-w-[85%] md:max-w-[70%] space-y-2`}>
                    <div className={`rounded-xl md:rounded-[2rem] px-4 md:px-6 py-3 md:py-4 shadow-sm relative ${
                        msg.sender === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : selectedChat.sentiment === 'Critical' 
                            ? 'bg-red-50 border border-red-100 text-red-900 rounded-bl-none'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                    }`}>
                        <p className="text-xs md:text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <div className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] px-2 flex items-center gap-2 ${msg.sender === 'user' ? 'justify-end text-slate-400' : 'text-slate-400'}`}>
                      {msg.timestamp}
                      {msg.sender === 'user' && <CheckCheck size={14} className="text-indigo-500" />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-4 md:p-8 bg-white border-t border-slate-100 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.02)] ${isMobile ? 'pb-24' : ''}`}>
              <div className="flex gap-3 md:gap-6 items-end">
                <button className="p-3 md:p-4 text-slate-400 hover:text-indigo-600 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl transition-all active:scale-90">
                  <Paperclip size={isMobile ? 20 : 24} />
                </button>
                <div className="flex-1 relative group">
                  <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Reply to ${selectedChat.contactName.split(' ')[0]}...`}
                    className="w-full bg-slate-50 border-2 border-transparent rounded-xl md:rounded-[1.5rem] px-4 md:px-6 py-3 md:py-5 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:bg-white resize-none h-12 md:h-16 max-h-48 shadow-inner transition-all scrollbar-hide"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <button 
                    onClick={generateSmartReply}
                    disabled={isDrafting}
                    className="absolute right-3 md:right-4 bottom-3 md:bottom-4 p-2 md:p-2.5 bg-white rounded-lg md:rounded-xl shadow-lg border border-slate-100 text-indigo-600 hover:scale-110 active:scale-95 transition-all group-focus-within:border-indigo-200"
                  >
                    {isDrafting ? <RefreshCw className="animate-spin" size={isMobile ? 14 : 18} /> : <Sparkles size={isMobile ? 14 : 18} className="group-hover:animate-pulse" />}
                  </button>
                </div>
                <button 
                  onClick={() => handleSendMessage()}
                  disabled={isSending || !inputText.trim()}
                  className="bg-indigo-600 text-white p-3 md:p-5 rounded-xl md:rounded-[1.5rem] hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-2xl shadow-indigo-100 active:scale-95"
                >
                  <Send size={isMobile ? 20 : 24} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-12 text-center animate-fade-in bg-slate-50/20">
            <div className="w-32 h-32 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center mb-10 border border-slate-100 relative group">
                <div className="absolute inset-0 bg-indigo-500 rounded-[3rem] opacity-0 group-hover:opacity-10 transition-opacity" />
                <MessageSquare size={64} className="opacity-10 group-hover:scale-110 transition-transform duration-700" />
            </div>
            <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tighter italic">Secure Terminal.</h3>
            <p className="max-w-sm text-xs font-bold uppercase tracking-[0.2em] text-slate-300 mt-5 leading-relaxed">Select a communication thread from the terminal stack to initiate lead intelligence.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedInbox;