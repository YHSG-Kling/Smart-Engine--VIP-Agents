
import React, { useState, useMemo } from 'react';
import { 
  Home, Mail, Share2, FileText, Bot, 
  TrendingUp, DollarSign, Target, ShieldCheck,
  Zap, Sparkles, Star, Loader2, RefreshCw,
  Search, ListChecks, Wand2, ArrowRight,
  CheckCircle2, Gauge, Landmark, PieChart,
  MessageSquare, Gavel
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { airtableService } from '../../services/airtable';
import { AIToolName, UserRole } from '../../types';
import { AIToolModal } from '../../components/AI/AIToolModal';

interface AIToolDef {
  name: string;
  category: 'marketing' | 'communication' | 'sales' | 'transactions' | 'analysis';
  toolName: AIToolName;
  icon: any;
  description: string;
  usage: number;
  avgRating: number;
  allowedRoles: UserRole[];
}

const AIToolsHub: React.FC = () => {
  const { user, role } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTool, setSelectedTool] = useState<any>(null);
  
  const allTools: AIToolDef[] = [
    {
      name: 'Listing Architect',
      category: 'marketing',
      toolName: 'listing_description',
      icon: Home,
      description: 'Create compelling property descriptions from tax records and features.',
      usage: 156,
      avgRating: 4.9,
      allowedRoles: [UserRole.AGENT, UserRole.BROKER, UserRole.ADMIN, UserRole.SELLER]
    },
    {
      name: 'Email Smart Composer',
      category: 'communication',
      toolName: 'email_composer',
      icon: Mail,
      description: 'Synthesize professional correspondence for any transaction scenario.',
      usage: 423,
      avgRating: 4.8,
      allowedRoles: [UserRole.AGENT, UserRole.BROKER, UserRole.ADMIN, UserRole.BUYER, UserRole.SELLER]
    },
    {
      name: 'Social Hook Engine',
      category: 'marketing',
      toolName: 'social_post',
      icon: Share2,
      description: 'Generate posts, captions, and viral hooks for all major social platforms.',
      usage: 289,
      avgRating: 4.7,
      allowedRoles: [UserRole.AGENT, UserRole.BROKER, UserRole.ADMIN, UserRole.SELLER]
    },
    {
      name: 'Contract Clause Explainer',
      category: 'transactions',
      toolName: 'contract_explainer',
      icon: FileText,
      description: 'Translate complex legal jargon into plain English for your clients.',
      usage: 78,
      avgRating: 4.9,
      allowedRoles: [UserRole.AGENT, UserRole.BROKER, UserRole.ADMIN, UserRole.BUYER, UserRole.SELLER]
    },
    {
      name: 'Objection Handler',
      category: 'sales',
      toolName: 'objection_handler',
      icon: MessageSquare,
      description: 'Get proven response scripts and reframes for any client hesitation.',
      usage: 201,
      avgRating: 4.8,
      allowedRoles: [UserRole.AGENT, UserRole.BROKER, UserRole.ADMIN]
    },
    {
      name: 'Market Report Synth',
      category: 'analysis',
      toolName: 'market_report',
      icon: TrendingUp,
      description: 'Turn raw MLS data into high-value, client-ready market reports.',
      usage: 134,
      avgRating: 4.6,
      allowedRoles: [UserRole.AGENT, UserRole.BROKER, UserRole.ADMIN, UserRole.BUYER, UserRole.SELLER]
    },
    {
      name: 'Offer Letter Strategist',
      category: 'transactions',
      toolName: 'offer_letter',
      icon: Gavel,
      description: 'Draft compelling offer summaries that highlight value over just price.',
      usage: 92,
      avgRating: 4.7,
      allowedRoles: [UserRole.AGENT, UserRole.BROKER, UserRole.ADMIN, UserRole.BUYER]
    },
    {
      name: 'Negotiation Advisor',
      category: 'sales',
      toolName: 'negotiation_advisor',
      icon: Target,
      description: 'Get tactical advice based on game theory for complex counter-offers.',
      usage: 65,
      avgRating: 4.9,
      allowedRoles: [UserRole.AGENT, UserRole.BROKER, UserRole.ADMIN, UserRole.BUYER, UserRole.SELLER]
    },
    {
        name: 'Price Justification Builder',
        category: 'analysis',
        toolName: 'price_justification',
        icon: DollarSign,
        description: 'Synthesize deep value stories to justify listing or offer prices.',
        usage: 112,
        avgRating: 4.7,
        allowedRoles: [UserRole.AGENT, UserRole.BROKER, UserRole.ADMIN, UserRole.SELLER]
    }
  ];

  // Filter tools by role first
  const roleFilteredTools = useMemo(() => {
    return allTools.filter(t => t.allowedRoles.includes(role));
  }, [role]);
  
  const filteredTools = useMemo(() => {
      return selectedCategory === 'all' 
        ? roleFilteredTools 
        : roleFilteredTools.filter(t => t.category === selectedCategory);
  }, [roleFilteredTools, selectedCategory]);
  
  const categories = useMemo(() => {
      const baseCategories = [
        { value: 'all', label: 'All Clusters' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'communication', label: 'Communication' },
        { value: 'sales', label: 'Sales' },
        { value: 'transactions', label: 'Transactions' },
        { value: 'analysis', label: 'Analysis' }
      ];
      // Only show categories that have tools for this role
      return baseCategories.filter(cat => 
        cat.value === 'all' || roleFilteredTools.some(t => t.category === cat.value)
      );
  }, [roleFilteredTools]);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Hero Header */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden border-b-8 border-indigo-600 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="absolute right-0 top-0 p-12 opacity-5 rotate-12"><Zap size={200}/></div>
          <div className="relative z-10 max-w-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-600 rounded-xl shadow-lg">
                    <Sparkles size={20} className="text-white"/>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Intelligence Hub</span>
              </div>
              <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-4 leading-none">AI Tools <br/> Suite.</h1>
              <p className="text-indigo-100 text-lg font-medium opacity-90 leading-relaxed mb-8">
                  {role === UserRole.BUYER ? "Specialized AI tools to help you navigate your home purchase with data-backed confidence." :
                   role === UserRole.SELLER ? "Strategic AI tools to maximize your home value and streamline your selling experience." :
                   "Purpose-built real estate logic engines trained on high-performance closing data."}
              </p>
              <div className="flex gap-4">
                 <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center">
                    <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">PROMPT TIER</p>
                    <p className="text-2xl font-black italic">{role === UserRole.BROKER || role === UserRole.ADMIN ? 'MASTER' : 'PREMIUM'}</p>
                 </div>
                 <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center">
                    <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">ACCESS</p>
                    <p className="text-2xl font-black italic uppercase">{role}</p>
                 </div>
              </div>
          </div>
      </div>
      
      {/* Category Filter */}
      <div className="flex bg-white rounded-xl p-1 border border-slate-200 w-fit shadow-md overflow-x-auto max-w-full scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              selectedCategory === cat.value
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      
      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map(tool => {
          const Icon = tool.icon;
          return (
            <div 
                key={tool.name} 
                onClick={() => setSelectedTool(tool)}
                className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:border-indigo-400 transition-all group cursor-pointer flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="p-4 bg-slate-50 rounded-3xl group-hover:bg-indigo-50 transition-colors shadow-inner">
                  <Icon className="w-8 h-8 text-indigo-400 group-hover:text-indigo-600" />
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-xs font-black italic">{tool.avgRating}</span>
                </div>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic mb-3 leading-none">{tool.name}</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed italic mb-8 flex-1">"{tool.description}"</p>
              
              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Personalized for {role.toLowerCase()}
                </span>
                <button className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-90">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Tool Modal */}
      {selectedTool && (
        <AIToolModal
          tool={selectedTool}
          onClose={() => setSelectedTool(null)}
        />
      )}
    </div>
  );
}

export default AIToolsHub;
