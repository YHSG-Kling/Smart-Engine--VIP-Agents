
import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AgentDashboard from './pages/agent/AgentDashboard';
import BrokerDashboard from './pages/admin/BrokerDashboard';
import UserManagement from './pages/admin/UserManagement'; // Workflow 132
import ListingApprovals from './pages/admin/ListingApprovals'; // Workflow 113
import ListingDistribution from './pages/admin/ListingDistribution'; // Workflow 114
import OpenHouseManager from './pages/agent/OpenHouseManager'; // Workflow 115
import ShowingsDesk from './pages/agent/ShowingsDesk'; // Workflow 122
import FeedbackDesk from './pages/agent/FeedbackDesk'; // Workflow 126
import CalendarDashboard from './pages/common/CalendarDashboard'; // Workflow 123
import SegmentationDesk from './pages/admin/SegmentationDesk'; // Workflow 117
import LeadDistribution from './pages/admin/LeadDistribution'; // Workflow 100
import NotificationSettings from './pages/agent/NotificationSettings'; // Workflow 101/125
import DataHealth from './pages/admin/DataHealth'; // Workflow 97
import ComplianceManager from './pages/admin/ComplianceManager'; 
import RiskManagement from './pages/admin/RiskManagement'; // Workflow 143
import BuyerPortal from './pages/client/BuyerPortal';
import ClientPlaybook from './pages/client/ClientPlaybook'; 
import SmartCMA from './components/AI/CMAGenerator';
import DealDesk from './pages/agent/DealDesk';
import MarketingStudio from './pages/agent/MarketingStudio';
import SmartGuide from './components/AI/SmartGuide';
import CRM from './pages/agent/CRM';
import TransactionManager from './pages/agent/TransactionManager';
import PartnersManager from './pages/admin/PartnersManager';
import VendorMarketplace from './pages/client/VendorMarketplace';
import VendorCompliance from './pages/admin/VendorCompliance'; 
import SystemConfig from './pages/admin/SystemConfig';
import UnifiedInbox from './pages/agent/UnifiedInbox';
import SellerDashboard from './pages/seller/SellerDashboard';
import ListingJourney from './pages/seller/ListingJourney';
import Financials from './pages/admin/Financials';
import AgentRoster from './pages/admin/AgentRoster';
import SmartMatches from './pages/client/SmartMatches';
import Documents from './pages/common/Documents';
import ListingIntake from './pages/agent/ListingIntake';
import SphereManager from './pages/agent/SphereManager';
import SystemHealth from './pages/admin/SystemHealth';
import CommandBar from './components/ui/CommandBar';
import MapIntelligence from './pages/agent/MapIntelligence';
import KnowledgeBase from './pages/agent/KnowledgeBase'; 
import AIAudit from './pages/admin/AIAudit';
import OpenHouseKiosk from './pages/public/OpenHouseKiosk';
import LoginPage from './pages/auth/LoginPage';
import ListingReports from './pages/agent/ListingReports';
import QuickActionsFAB from './components/mobile/QuickActionsFAB';
import SmartListingLanding from './pages/public/SmartListingLanding'; 
import Events from './pages/common/Events';
import ReferralPartnerPortal from './pages/public/ReferralPartnerPortal'; 
import ClosingDashboard from './pages/agent/ClosingDashboard'; // Workflow 110
import HomeValuePortal from './pages/client/HomeValuePortal'; // Workflow 154
import SocialScheduler from './pages/common/SocialScheduler'; // Workflow 156
import ShareableAssets from './pages/seller/ShareableAssets'; // Workflow 156
import BuyerTours from './pages/agent/BuyerTours'; // WF-SHOW-01
import { ToastContainer, ToastMessage } from './components/ui/Toast';
import { UserRole, Listing, UserContext } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { 
  LayoutDashboard, Users, MessageSquare, Briefcase, Map, 
  Settings, LogOut, Search, Bell, Sparkles, Navigation, Calendar 
} from 'lucide-react';

const NexusApp: React.FC = () => {
  const { user, role, isLoading, signIn, signOut } = useAuth();
  const [currentView, setCurrentView] = useState('agent-dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeListingForReport, setActiveListingForReport] = useState<Listing | null>(null);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [initialDeepLink, setInitialDeepLink] = useState<{action: string, id: string} | null>(null);
  const [isQRView, setIsQRView] = useState(false);
  const [isPartnerView, setIsPartnerView] = useState(false);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const id = params.get('id');

    if (path.includes('/listing/') && params.get('source') === 'qr') {
        setIsQRView(true);
        return;
    }

    if (path === '/referral-partner') {
        setIsPartnerView(true);
        return;
    }

    if (action && id) {
        setInitialDeepLink({ action, id });
    }
  }, [role]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
    if (role === UserRole.AGENT) {
        setTimeout(() => {
            setUserContext({
                userId: user?.id || 'demo-agent',
                lastLatLong: '30.2672, -97.7431',
                predictedIntent: 'Showing Mode',
                clientName: 'John',
                address: '123 Main St',
                lockboxCode: '1992'
            });
        }, 2000);
    }
    
    return () => window.removeEventListener('resize', handleResize);
  }, [role, user]);

  useEffect(() => {
    if(role === UserRole.AGENT) setCurrentView('agent-dashboard');
    else if(role === UserRole.BROKER || role === UserRole.ADMIN) setCurrentView('broker-dashboard');
    else if(role === UserRole.BUYER) setCurrentView('buyer-dashboard');
    else if(role === UserRole.SELLER) setCurrentView('listing-journey');
  }, [role]);

  const renderContent = () => {
    if (isQRView) return <SmartListingLanding />;
    if (isPartnerView) return <ReferralPartnerPortal />;

    switch (currentView) {
      case 'agent-dashboard': return <AgentDashboard userContext={userContext} />;
      case 'risk-management': return <RiskManagement />; // Workflow 143
      case 'user-management': return <UserManagement />; // Workflow 132
      case 'listing-approvals': return <ListingApprovals />; 
      case 'listing-distribution': return <ListingDistribution />; 
      case 'oh-manager': return <OpenHouseManager />; 
      case 'showings': return <ShowingsDesk />; 
      case 'buyer-tours': return <BuyerTours />; // WF-SHOW-01
      case 'feedback-log': return <FeedbackDesk />; // Workflow 126
      case 'calendar': return <CalendarDashboard />; 
      case 'segmentation': return <SegmentationDesk />; 
      case 'data-health': return <DataHealth />; 
      case 'lead-distribution': return <LeadDistribution />; 
      case 'notifications': return <NotificationSettings />; 
      case 'listing-intake': return <ListingIntake />;
      case 'crm': return <CRM />;
      case 'transactions': return <TransactionManager initialDealId={initialDeepLink?.id} />;
      case 'closing-dashboard': return <ClosingDashboard />; 
      case 'sphere': return <SphereManager />;
      case 'documents': return <Documents />;
      case 'marketing': return <MarketingStudio />;
      case 'social-scheduler': return <SocialScheduler />; // Workflow 156
      case 'shareable-assets': return <ShareableAssets />; // Workflow 156
      case 'cma': return <SmartCMA />;
      case 'inbox': return <UnifiedInbox isMobile={isMobile} />;
      case 'partners': return <PartnersManager />;
      case 'map-intelligence': return <MapIntelligence />;
      case 'listing-reports': return activeListingForReport ? (
        <ListingReports listing={activeListingForReport} onBack={() => setCurrentView('agent-dashboard')} />
      ) : <AgentDashboard userContext={userContext} />;
      case 'broker-dashboard': return <BrokerDashboard />;
      case 'compliance': return <ComplianceManager />;
      case 'financials': return <Financials />;
      case 'agents': return <AgentRoster />;
      case 'system-health': return <SystemHealth />;
      case 'settings': return <SystemConfig />;
      case 'knowledge-base': return <KnowledgeBase />;
      case 'ai-audit': return <AIAudit />;
      case 'vendor-compliance': return <VendorCompliance />; 
      case 'buyer-dashboard': return <BuyerPortal onNavigate={setCurrentView} isMobile={isMobile} />;
      case 'home-value': return <HomeValuePortal />; // Workflow 154
      case 'playbook': return <ClientPlaybook />; 
      case 'matches': return <SmartMatches />;
      case 'marketplace': return <VendorMarketplace />;
      case 'listing-journey': return <ListingJourney />;
      case 'seller-dashboard': return <SellerDashboard onNavigate={setCurrentView} initialAction={initialDeepLink?.action} />;
      case 'open-house': return <OpenHouseKiosk />;
      case 'events': return <Events />;
      default:
        return <div className="flex items-center justify-center h-[50vh] text-slate-400 font-bold uppercase tracking-widest">Protocol Initializing: {currentView}</div>;
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  
  if (!user && !isQRView && !isPartnerView) return <><ToastContainer toasts={toasts} removeToast={removeToast} /><LoginPage onLogin={(r, email) => signIn(email, r)} /></>;

  return (
    <div className={`flex min-h-screen bg-slate-50 ${isMobile ? 'flex-col' : ''}`}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {!isQRView && !isPartnerView && <CommandBar onNavigate={setCurrentView} />}
      
      {!isMobile && !isQRView && !isPartnerView && (
        <Sidebar role={role} currentView={currentView} onChangeView={setCurrentView} onLogout={signOut} />
      )}
      
      <main className={`flex-1 overflow-y-auto h-screen relative ${
        (isQRView || isPartnerView) ? '' : isMobile ? 'pb-24 pt-4 px-4' : 'ml-64 p-8'
      }`}>
        {!isQRView && !isPartnerView && (
          <header className={`flex justify-between items-center ${isMobile ? 'mb-4' : 'mb-8'}`}>
            <div>
              <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-black text-slate-900 uppercase italic tracking-tighter`}>
                {currentView.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </h1>
              {!isMobile && (
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
                  VIP AGENTS Smart Engine • {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm relative hover:bg-slate-50 transition-colors group">
                  <Bell size={18} className="text-slate-400 group-hover:text-indigo-600" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="flex items-center gap-3">
                  {!isMobile && (
                      <div className="text-right">
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{role}</p>
                          <p className="text-[10px] text-indigo-500 font-bold italic">{user?.email || 'Authenticated'}</p>
                      </div>
                  )}
                  <div 
                      onClick={() => isMobile && setCurrentView('settings')}
                      className="w-10 h-10 md:w-11 md:h-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg border-2 border-white cursor-pointer active:scale-95 transition-transform"
                  >
                      {role[0]}
                  </div>
              </div>
            </div>
          </header>
        )}

        {renderContent()}

        {isMobile && role === UserRole.AGENT && !isQRView && !isPartnerView && <QuickActionsFAB />}
      </main>

      {isMobile && !isQRView && !isPartnerView && (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-200 z-[100] px-6 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
            <MobileNavItem 
                icon={LayoutDashboard} 
                active={currentView.includes('dashboard') || currentView === 'listing-journey'} 
                onClick={() => setCurrentView(role === UserRole.AGENT ? 'agent-dashboard' : role === UserRole.BUYER ? 'buyer-dashboard' : 'listing-journey')} 
            />
            <MobileNavItem 
                icon={Calendar} 
                active={currentView === 'events'} 
                onClick={() => setCurrentView('events')} 
            />
            <MobileNavItem 
                icon={MessageSquare} 
                active={currentView === 'inbox'} 
                onClick={() => setCurrentView('inbox')} 
            />
            <MobileNavItem 
                icon={Briefcase} 
                active={currentView === 'transactions'} 
                onClick={() => setCurrentView('transactions')} 
            />
            <MobileNavItem 
                icon={Navigation} 
                active={currentView === 'map-intelligence'} 
                onClick={() => setCurrentView('map-intelligence')} 
            />
        </nav>
      )}

      {!isMobile && !isQRView && !isPartnerView && <SmartGuide />}
    </div>
  );
};

const MobileNavItem = ({ icon: Icon, active, onClick }: { icon: any, active: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`p-3 rounded-2xl transition-all active:scale-90 ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400'}`}
    >
        <Icon size={24} />
    </button>
);

const App: React.FC = () => <AuthProvider><NexusApp /></AuthProvider>;
export default App;
