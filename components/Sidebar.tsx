
import React from 'react';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  MessageSquare, 
  FileText, 
  Settings, 
  BarChart3, 
  Building,
  LogOut,
  BrainCircuit,
  PlusCircle,
  Map,
  Handshake,
  Heart,
  Activity,
  Globe,
  Tablet,
  ListTodo,
  BookOpen,
  ShieldAlert,
  ShieldCheck,
  Megaphone,
  Calendar,
  HeartPulse,
  GitMerge,
  Bell,
  Key,
  CheckCircle2,
  Share2,
  Ticket,
  Tags,
  Clock,
  MessageCircle,
  UserCog,
  AlertTriangle,
  TrendingUp,
  Image as ImageIcon,
  Navigation
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  onChangeView: (view: string) => void;
  currentView: string;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, onChangeView, currentView, onLogout }) => {
  
  const getNavItems = () => {
    switch (role) {
      case UserRole.BROKER:
      case UserRole.ADMIN:
        return [
          { id: 'broker-dashboard', label: 'Command Center', icon: LayoutDashboard },
          { id: 'risk-management', label: 'Risk Control', icon: ShieldAlert }, // Workflow 143
          { id: 'user-management', label: 'Portal Users', icon: UserCog }, // Workflow 132
          { id: 'calendar', label: 'Availability', icon: Calendar }, 
          { id: 'showings', label: 'Showings Hub', icon: Clock }, 
          { id: 'feedback-log', label: 'Feedback Log', icon: MessageCircle }, // Workflow 126
          { id: 'listing-approvals', label: 'Approvals Queue', icon: CheckCircle2 }, 
          { id: 'listing-distribution', label: 'Distribution Hub', icon: Share2 }, 
          { id: 'oh-manager', label: 'Open House Mgr', icon: Ticket }, 
          { id: 'segmentation', label: 'Tagging Rules', icon: Tags }, 
          { id: 'data-health', label: 'Data Health', icon: HeartPulse }, 
          { id: 'lead-distribution', label: 'Lead Distribution', icon: GitMerge }, 
          { id: 'notifications', label: 'Notification Hub', icon: Bell }, 
          { id: 'inbox', label: 'Unified Inbox', icon: MessageSquare },
          { id: 'events', label: 'Events Hub', icon: Calendar },
          { id: 'transactions', label: 'Master Deal Desk', icon: Briefcase },
          { id: 'closing-dashboard', label: 'Settlement Monitor', icon: Key }, 
          { id: 'crm', label: 'Lead CRM', icon: Users },
          { id: 'marketing', label: 'Marketing Studio', icon: Megaphone },
          { id: 'social-scheduler', label: 'Social Scheduler', icon: ImageIcon }, // Workflow 156
          { id: 'ai-audit', label: 'AI Audit Log', icon: ShieldAlert },
          { id: 'vendor-compliance', label: 'Vendor Compliance', icon: ShieldCheck },
          { id: 'map-intelligence', label: 'Map War Room', icon: Globe },
          { id: 'partners', label: 'Partners & Lenders', icon: Handshake },
          { id: 'knowledge-base', label: 'Script Trainer', icon: BookOpen }, 
          { id: 'compliance', label: 'Compliance Audit', icon: FileText },
          { id: 'financials', label: 'Financials', icon: BarChart3 },
          { id: 'agents', label: 'Agent Roster', icon: Users },
          { id: 'system-health', label: 'System Health', icon: Activity },
          { id: 'settings', label: 'System Config', icon: Settings },
        ];
      case UserRole.AGENT:
        return [
          { id: 'agent-dashboard', label: 'My Dashboard', icon: LayoutDashboard },
          { id: 'calendar', label: 'My Schedule', icon: Calendar }, 
          { id: 'showings', label: 'Showing Queue', icon: Clock }, 
          { id: 'buyer-tours', label: 'Buyer Tours', icon: Navigation }, // WF-SHOW-01
          { id: 'feedback-log', label: 'Feedback Log', icon: MessageCircle }, // Workflow 126
          { id: 'listing-approvals', label: 'Listing Approvals', icon: CheckCircle2 }, 
          { id: 'listing-distribution', label: 'Live Syndication', icon: Share2 }, 
          { id: 'oh-manager', label: 'Open House Mgr', icon: Ticket }, 
          { id: 'notifications', label: 'My Notifications', icon: Bell }, 
          { id: 'events', label: 'Events Hub', icon: Calendar },
          { id: 'map-intelligence', label: 'Map Intelligence', icon: Map },
          { id: 'listing-intake', label: 'New Listing', icon: PlusCircle }, 
          { id: 'crm', label: 'Lead CRM', icon: Users },
          { id: 'marketing', label: 'Marketing Studio', icon: Megaphone },
          { id: 'social-scheduler', label: 'Social Scheduler', icon: ImageIcon }, // Workflow 156
          { id: 'playbook', label: 'Client Journeys', icon: ListTodo },
          { id: 'transactions', label: 'Transaction Mgr', icon: Briefcase },
          { id: 'closing-dashboard', label: 'Closing Dashboard', icon: Key }, 
          { id: 'partners', label: 'Partners & Lenders', icon: Handshake },
          { id: 'sphere', label: 'Sphere & Reviews', icon: Heart },
          { id: 'documents', label: 'Document Vault', icon: FileText },
          { id: 'marketplace', label: 'Vendor Marketplace', icon: Building },
          { id: 'open-house', label: 'Open House Kiosk', icon: Tablet },
          { id: 'inbox', label: 'Unified Inbox', icon: MessageSquare },
        ];
      case UserRole.BUYER:
        return [
          { id: 'buyer-dashboard', label: 'My Home Journey', icon: LayoutDashboard },
          { id: 'closing-dashboard', label: 'Moving Day Guide', icon: Key }, 
          { id: 'events', label: 'Events Hub', icon: Calendar },
          { id: 'playbook', label: 'My Playbook', icon: ListTodo },
          { id: 'matches', label: 'Smart Matches', icon: Building },
          { id: 'marketplace', label: 'Vendor Marketplace', icon: Handshake },
          { id: 'documents', label: 'My Documents', icon: FileText },
        ];
      case UserRole.SELLER:
        return [
          { id: 'listing-journey', label: 'Listing Journey', icon: Activity },
          { id: 'home-value', label: 'My Home Value', icon: TrendingUp }, // Workflow 154 - Exclusively for Sellers
          { id: 'seller-dashboard', label: 'Listing Performance', icon: BarChart3 },
          { id: 'shareable-assets', label: 'Shareable Assets', icon: Share2 }, // Workflow 156 - Client Share
          { id: 'closing-dashboard', label: 'Closing Logistics', icon: Key }, 
          { id: 'events', label: 'Events Hub', icon: Calendar },
          { id: 'playbook', label: 'Seller Roadmap', icon: ListTodo },
          { id: 'showings', label: 'Showing Feedback', icon: Users },
          { id: 'documents', label: 'Documents', icon: FileText },
          { id: 'marketplace', label: 'Service Marketplace', icon: Handshake },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0 border-r border-slate-800 z-40">
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
          <BrainCircuit className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight uppercase">VIP AGENTS</h1>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Smart Engine</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-4">
          {role} Console
        </div>
        {getNavItems().map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/50 scale-[1.02]' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-500 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
