
export enum UserRole {
  BROKER = 'BROKER',
  AGENT = 'AGENT',
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
  HYBRID = 'HYBRID' // Workflow 104: Dual-Role
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  playbookId?: string;
  lastLogin?: string; 
  ownsProperty?: boolean;
  searchCriteria?: { 
    beds?: number;
    zip?: string;
    priceRange?: [number, number];
    propertyType?: 'Condo' | 'Single Family' | 'Multi-Family' | 'Fixer';
  };
  stats?: {
    gci?: number;
    dealsClosed?: number;
    activeLeads?: number;
  };
  email?: string;
  // Workflow 104 Fields
  sellStatus?: 'Pre-List' | 'Listed' | 'Under Contract' | 'Closed';
  buyStatus?: 'Searching' | 'Offer' | 'Under Contract' | 'Closed';
  // Workflow 108 Client Prefs
  smsEnabled?: boolean;
  emailEnabled?: boolean;
}

// WF-SHOW-01: Smart Showing Route Planner
export interface TourStop {
  id: string;
  tourId: string;
  propertyId: string;
  address: string;
  lat: number;
  lng: number;
  showDurationMinutes: number;
  order: number;
  driveTimeFromPrevMinutes?: number;
  arrivalTime?: string; // ISO string
  departureTime?: string; // ISO string
  listingAgentName?: string;
  listingAgentPhone?: string;
  internalNotes?: string;
  imageUrl?: string;
  price?: number;
}

export interface Tour {
  id: string;
  buyerId: string;
  buyerName: string;
  agentId: string;
  tourDate: string;
  startLocation: string;
  startTime: string;
  status: 'Draft' | 'Optimized' | 'Approved' | 'SentToBuyer';
  agentItineraryUrl?: string;
  buyerItineraryUrl?: string;
  stops: TourStop[];
}

// Workflow 156: Social Media Distribution
export type SocialPlatform = 'Instagram' | 'Facebook' | 'LinkedIn';
export type PostStatus = 'Draft' | 'Scheduled' | 'Published';

export interface SocialContent {
  id: string;
  dealId: string;
  platform: SocialPlatform;
  imageUrl: string;
  captionText: string;
  status: PostStatus;
  scheduledDate?: string;
}

// Workflow 155: TCPA Compliance
export interface ComplianceLogEntry {
  id: string;
  phoneNumber: string;
  status: 'Opt-In' | 'Opt-Out';
  evidence: string;
  timestamp: string;
  source: string;
}

// Workflow 151: Financing Tracking
export type LoanStage = 'Application' | 'Processing' | 'Underwriting' | 'Appraisal' | 'Approved' | 'CTC' | 'Funded';

export interface FinancingLog {
  id: string;
  dealId: string;
  lenderName: string;
  lenderEmail: string;
  loanStage: LoanStage;
  lastUpdateRaw: string; // AI Summary
  nextDeadline?: string;
  appraisalStatus: 'Ordered' | 'Pending' | 'Completed' | 'Review';
  commitmentDate: string;
  conditionsRemaining: boolean;
  timestamp: string;
}

// Workflow 153: Settlement Data
export interface SettlementData {
  finalSalePrice: number;
  recordingNumber: string;
  fundingDate: string;
  hudStatementUrl?: string;
  isRecorded: boolean;
  isFunded: boolean;
}

// Workflow 152: Closing Logistics
export interface ClosingLogistics {
  closingDate: string;
  walkthroughTime?: string;
  utilitiesTransferred: boolean;
  keysLocation?: string;
  giftOrdered: boolean;
  commissionAmount: number;
  titleCompanyLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface Closing {
  id: string;
  dealId: string;
  address: string;
  closingDate: string;
  cdStatus: 'Pending' | 'Approved';
  cdaStatus: 'Draft' | 'Pending' | 'Approved';
  wireInstructionsSent: boolean;
  utilitiesStatus: 'Pending' | 'Done';
  finalWalkthroughTime?: string;
  commissionAmount: number;
  logistics?: ClosingLogistics;
}

// Workflow 149: Document Storage Registry
export type DocType = 'Contract' | 'Disclosure' | 'Inspection' | 'Closing' | 'Marketing' | 'Report';
export type PrivacyLevel = 'Internal' | 'Client-Shared' | 'Public';

export interface DocumentRegistryEntry {
  id: string;
  dealId: string;
  fileNameCanonical: string;
  driveLink: string;
  docType: DocType;
  privacyLevel: PrivacyLevel;
  size: string;
  timestamp: string;
}

// WF-CMA-01: CMA & Listing Package Types
export interface CMAPackage {
  id: string;
  cmaUrl: string;
  marketingPlanUrl: string;
  presentationUrl: string;
  emailDraft: string;
  marketSnapshot: string;
  pricingStrategies: {
    aggressive: string;
    marketAligned: string;
    speedToSell: string;
  };
  timestamp: string;
}

// Workflow 147: Negotiation Logic
export interface NegotiationRound {
  id: string;
  dealId: string;
  roundNumber: number;
  offerPrice: number;
  concessions: string;
  closingDate: string; // ISO String
  pdfUrl?: string;
  aiAnalysisSummary?: string;
  status: 'Received' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';
  timestamp: string;
  source: 'Our Client' | 'Other Side';
}

// Workflow 145: Offer Drafts
export interface OfferDraft {
  id: string;
  dealId: string;
  rawDictation: string;
  parsedPrice: number;
  parsedClosingDays: number;
  parsedInclusions: string;
  parsedInspectionDays: number;
  pdfUrl?: string;
  status: 'Draft' | 'Sent';
  timestamp: string;
}

// Workflow 132: Portal User Management
export type OnboardingStatus = 'Invited' | 'Logged In' | 'Completed Setup' | 'Suspended';

export interface PortalUser {
  id: string;
  email: string;
  name: string;
  role: 'Buyer' | 'Seller' | 'Vendor' | 'Agent';
  onboardingStatus: OnboardingStatus;
  linkedDealId?: string;
  lastLogin?: string;
  magicLinkToken?: string;
}

// Workflow 137: Compliance Automation
export interface ComplianceChecklistItem {
  id: string;
  dealId: string;
  documentName: string;
  status: 'Missing' | 'Pending Review' | 'Approved';
  sourceRule: string; // e.g. "Added by AI (Year Built < 1978)"
}

// Workflow 138: E-Sign Tracking
export interface ESignEnvelope {
  id: string;
  envelopeId: string;
  status: 'Sent' | 'Delivered' | 'Completed' | 'Voided';
  viewedAt?: string;
  signedAt?: string;
  recipientEmail: string;
  dealId: string;
  documentName: string;
  agentId: string;
}

// Workflow 139: Back-office Audit & Approval
export type BrokerApprovalStatus = 'Draft' | 'AI Rejected' | 'Pending Broker' | 'Approved';

export interface TransactionDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  category: DocType;
  status: 'Signed' | 'Pending' | 'Draft' | 'Review Needed' | 'Compliant' | 'Scanning' | 'Uploaded';
  dealContext?: string;
  dealId?: string;
  complianceNotes?: string;
  source?: 'Upload' | 'Dotloop' | 'Email';
  aiValidationScore?: number;
  missingElements?: string;
  brokerApprovalStatus: BrokerApprovalStatus;
  agentId?: string;
}

// Workflow 142: Referral Engine
export type ReferralLeadStatus = 'New' | 'Contacted' | 'Closed Deal';
export type ReferralRewardStatus = 'Pending' | 'Sent';

export interface ClientReferral {
  id: string;
  referrerId: string;
  referrerName: string;
  friendName: string;
  friendPhone: string;
  status: ReferralLeadStatus;
  rewardStatus: ReferralRewardStatus;
  rewardType: string;
  timestamp: string;
  notes?: string;
}

// Workflow 143: Risk Management
export type SeverityLevel = 'Low' | 'Medium' | 'License Risk';
export type ResolutionStatus = 'Open' | 'Broker Intervening' | 'Resolved';

export interface RiskIncident {
  id: string;
  severity: SeverityLevel;
  triggerPhrase: string;
  status: ResolutionStatus;
  transcript: string;
  clientName: string;
  agentName: string;
  dealId: string;
  timestamp: string;
  sentimentScore: number;
}

// Workflow 144: Review Marketing Assets
export type SocialPostStatus = 'Draft' | 'Scheduled' | 'Posted';

export interface ReviewMarketingAsset {
  id: string;
  reviewText: string;
  reviewerName: string;
  imageUrl: string;
  caption: string;
  status: SocialPostStatus;
  timestamp: string;
}

// Workflow 140: Regulatory Archives
export type AuditStatus = 'Open' | 'Archived' | 'Purged';

// Workflow 141: Reputation Management
export type ReviewStatus = 'Requested' | 'Received' | 'Negative Intervention' | 'Nurture Mode';

export interface ReviewAndFeedback {
  id: string;
  transactionId: string;
  clientName: string;
  agentName: string;
  internalRating: number; // 1-5
  publicReviewLink?: string;
  status: ReviewStatus;
  giftSent: boolean;
  timestamp: string;
  feedbackText?: string;
  sentimentTrend?: 'Euphoric' | 'Positive' | 'Neutral' | 'Rocky';
}

// Workflow 129: Analytics Schema
export interface DailySnapshot {
  id?: string;
  date: string;
  totalLeadsNew: number;
  totalShowings: number;
  offersSubmitted: number;
  revenueBooked: number;
}

export interface Lead {
  id: string;
  name: string;
  score: number;
  lastActivity: string;
  lastActivityDate?: string; 
  status: 'New' | 'Hot' | 'Nurture' | 'Cold' | 'Scraped' | 'Flagged' | 'Ready for Handoff' | 'QA Failed' | 'Client Referral';
  source: string;
  tags: string[];
  tagRationale?: Record<string, string>;
  sentiment: 'Delighted' | 'Interested' | 'Neutral' | 'Skeptical' | 'Anxious' | 'Frustrated' | 'Angry' | 'Positive' | 'Negative' | 'Urgent';
  urgency: 1 | 2 | 3 | 4 | 5;
  intent: 'Buyer' | 'Seller' | 'Investor' | 'Hybrid' | 'Renter' | 'Vendor';
  phone?: string;
  email?: string;
  aiSummary?: string;
  totalEngagementScore?: number;
  engagementVelocity?: number;
  isSurgeDetected?: boolean;
  propertyAddress?: string;
  propertyIntelligence?: any;
  socialProfileSummary?: string;
  estimatedIncome?: string;
  aiPersonalityTip?: string;
  aiSuggestedOpeningLine?: string;
  emailStatus?: string;
  phoneType?: string;
  urgencyReason?: string;
  enrichmentStatus?: string;
  dncEnabled?: boolean; // Workflow 155
}

export interface Listing {
  id: string;
  address: string;
  price: number;
  status: 'Active' | 'Pending' | 'Sold' | 'Expired';
  daysOnMarket: number;
  images: string[];
  description?: string;
  sellerEmail?: string;
  stats: {
    views: number;
    saves: number;
    showings: number;
    offers: number;
  };
  benchmarks?: {
    views: string;
    saves: string;
    showings: string;
  };
}

export interface Deal {
  id: string;
  address: string;
  price: number;
  stage: string;
  clientName: string;
  healthScore: number;
  healthStatus: 'Healthy' | 'Critical' | 'At Risk';
  nextTask: string;
  missingDocs: number;
  riskReason?: string;
  winProbability: number;
  tasksCompleted?: number;
  tasksTotal?: number;
  lenderReferralStatus?: 'None' | 'Sent' | 'Viewed' | 'Applied' | 'Approved';
  assignedLender?: string;
  auditStatus?: AuditStatus;
  projectedGCI?: number;
  predictedClose?: string;
  auditPacketUrl?: string;
  financingType?: string;
  propertyType?: string;
  // Workflow 153 Fields
  settlementData?: SettlementData;
  commissionPaid?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  volume: number;
  deals: number;
  capProgress: number;
  capPaid: number;
  capTotal: number;
  status: 'Active' | 'Away' | 'Offline';
  availability: string;
  dailyLeadCap: number;
  leadsReceivedToday: number;
  badges?: string[];
  teamLead?: string;
  serviceAreasZips: string[];
  specialties: string[];
  closingRate: number;
  lastRoutingTime?: string;
}

export interface UserContext {
  userId: string;
  lastLatLong: string;
  predictedIntent: string;
  clientName: string;
  address: string;
  lockboxCode: string;
}

export interface ReferralRecord {
  id: string;
  referrerId: string;
  referrerName: string;
  leadName: string;
  budget: number;
  preferredArea: string;
  leadEmail: string;
  status: string;
  timestamp: string;
  aiMatchScores: {
    agentName: string;
    score: number;
    rationale: string;
  }[];
  notes: string;
}

export interface ComplianceReport {
  id: string;
  month: string;
  totalFilesAudited: number;
  criticalErrorsFound: number;
  riskScore: number;
  pdfUrl: string;
  aiExecutiveSummary: string;
}

export interface ListingIntakeDraft {
  id: string;
  address: string;
  agentName: string;
  status: string;
  createdAt: string;
  timeInPipeline: string;
  beds: number;
  baths: number;
  sqft?: number;
}

export interface DetectedDefect {
  id: string;
  transactionId: string;
  description: string;
  severity: string;
  category: string;
  matchedCategory: string;
  matchedOffer: string;
}

export interface MarketplaceVendor extends Vendor {
  matchingTags: string[];
  conversionStats?: {
    clicks: number;
    conversions: number;
    revenueShare: number;
  };
}

export interface ResourceGuide {
  id: string;
  title: string;
  description: string;
  category: string;
  unlockedAt: string;
  isNew?: boolean;
}

export interface Showing {
  id: string;
  propertyId: string;
  leadId: string;
  address: string;
  leadName: string;
  requestedTime: string;
  status: 'Requested' | 'Picking Slots' | 'Pending Seller Confirm' | 'Confirmed' | 'Completed' | 'No-Show';
  isPreQualified: boolean;
  proposedSlots?: CalendarSlot[];
  lockboxCode?: string;
  alarmCode?: string;
  privateRemarks?: string;
  agentBriefingLink?: string;
  clientBriefingLink?: string;
  clientPrivateNotes?: string;
}

export interface CalendarSlot {
  id: string;
  showingId: string;
  start: string;
  end: string;
  selected: boolean;
}

export interface DripCampaign {
  id: string;
  name: string;
  status: 'Active' | 'Paused' | 'Draft';
  steps: number;
  openRate: number;
  replyRate: number;
  goalType: string;
}

export interface LeadMagnet {
  id: string;
  name: string;
  type: string;
  url: string;
  visitors: number;
  leads: number;
  conversionRate: number;
  status: 'Active' | 'Inactive';
}

export interface MarketingAsset {
  id: string;
  listingId: string;
  name: string;
  url: string;
  type: 'Video' | 'PDF' | 'Image';
  platform: string;
  category: string;
  aiTags: string[];
  uploadDate: string;
  size: string;
  expirationDate?: string; // Workflow 157
  status?: 'Active' | 'Archived'; // Workflow 157
}

export interface BrandTemplate {
  id: string;
  name: string;
  platform: string;
  previewUrl: string;
}

export interface SocialPost {
  id: string;
  platform: string;
  content: string;
  image: string;
  scheduledDate: string;
  status: 'Scheduled' | 'Draft';
}

export interface MarketStat {
  id: string;
  zipCode: string;
  monthYear: string;
  medianPrice: number;
  domAverage: number;
  inventoryLevel: number;
  soldCountLast7Days: number;
  aiExecutiveSummary: string;
}

export interface AdCampaign {
  id: string;
  campaignId: string;
  platform: string;
  spendCurrent: number;
  leadsGenerated: number;
  costPerLead: number;
  aiAuditStatus: string;
  aiRecommendation: string;
  ctr: number;
}

export interface QRCodeRecord {
  id: string;
  listingId: string;
  listingAddress: string;
  targetUrl: string;
  scanCount: number;
  slug: string;
  qrImageUrl: string;
}

export interface SocialLeadMapping {
  id: string;
  formId: string;
  campaignName: string;
  targetWorkflowTag: string;
  lastSynced: string;
}

export interface CampaignEnrollment {
  id: string;
  contactId: string;
  campaignId: string;
  status: string;
  enrolledAt: string;
}

export interface SellerActivity {
  id: string;
  listingId: string;
  activityType: string;
  timestamp: string;
}

export interface DripStep {
  id: string;
  campaignId: string;
  stepOrder: number;
  channel: 'Email' | 'SMS';
  waitTimeHours: number;
  aiPromptTemplate: string;
}

export interface ActiveNurture {
  id: string;
  leadName: string;
  currentStep: string;
  aiSentiment: string;
  nextAction: string;
  status: 'Active' | 'Paused';
  lastActivity: string;
}

export interface ReactivationConfig {
  zombieThresholdDays: number;
  isAutoSendEnabled: boolean;
  lastScanDate: string;
}

export interface ResurrectedLead {
  id: string;
  leadId: string;
  name: string;
  ghostedDays: number;
  recallProperty: string;
  hookProperty: string;
  aiMessage: string;
  replyText: string;
  sentiment: string;
  timestamp: string;
}

export interface Prospect {
  id: string;
  name: string;
  source: string;
  status: string;
  volume?: string;
  lastTouch?: string;
}

export interface ScrapeJob {
  id: string;
  source: string;
  status: string;
  timestamp: string;
  resultsFound: number;
}

export interface SearchActivityLog {
  id: string;
  leadId: string;
  propertyAddress: string;
  price: number;
  featuresViewed: string[];
  timestamp: string;
  intentTag: string;
}

export interface SocialLeadLog {
  id: string;
  leadId: string;
  leadName: string;
  fbFormId: string;
  adSetName: string;
  rawPayload: any;
  initialAIOutreachSent: boolean;
  timestamp: string;
}

// Workflow 148: Transaction Tasks
export type TaskRole = 'Agent' | 'Client' | 'TC' | 'Lender';
export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface TransactionTask {
  id: string;
  dealId: string;
  title: string;
  status: TaskStatus;
  priority: 'Critical' | 'High' | 'Med' | 'Low';
  category: string;
  due: string; // ISO Date String
  phase: 'Inspection' | 'Appraisal' | 'Financing' | 'Closing';
  assignedTo: TaskRole;
  dependency?: string; // Linked Task ID
  description?: string;
}

export interface TaskMasterTemplate {
  id: string;
  taskName: string;
  role: TaskRole;
  phase: TransactionTask['phase'];
  triggerKeyword?: string;
  daysAfterAccepted: number;
}

export interface GeneratedDoc {
  id: string;
  envelopeId: string;
  docType: 'Offer' | 'Addendum' | 'Contract';
  status: 'Sent' | 'Delivered' | 'Completed';
  pdfUrl: string;
  dealId: string;
  timestamp: string;
}

export interface Vendor {
  id: string;
  companyName: string;
  category: string;
  rating: number;
  verified: boolean;
  insuranceStatus: 'Valid' | 'Expired' | 'Insufficient';
  dealsClosed: number;
  description?: string;
  logoUrl?: string;
  email?: string;
  minCreditScore?: number;
  introTemplateId?: string;
  rateSheetUrl?: string;
  status: string;
  isStarredByAgent?: boolean;
  catchmentCriteria?: string;
}

export interface PointRule {
  id: string;
  activity: string;
  basePoints: number;
  currentMultiplier: number;
}

export interface ScoringWeight {
  id: string;
  activityName: string;
  points: number;
}

export interface CommissionRecord {
  id: string;
  date: string;
  address: string;
  agentName: string;
  gci: number;
  split: number;
  agentNet: number;
  brokerNet: number;
  status: 'Paid' | 'Pending' | 'Dispute';
}

export interface MarketingChannel {
  channel: string;
  spend: number;
  leads: number;
  deals: number;
  gci: number;
  cac: number;
  roas: string;
}

export interface Contest {
  id: string;
  title: string;
  metric: 'Volume' | 'Deals' | 'GCI';
  startDate: string;
  endDate: string;
  prize: string;
  participants: any[];
}

export type ChannelType = 'sms' | 'email' | 'instagram' | 'facebook' | 'whatsapp';

export interface Message {
  id: string;
  sender: 'user' | 'contact';
  text: string;
  timestamp: string;
  type: ChannelType;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio';
  aiTranscription?: string;
}

export interface Conversation {
  id: string;
  contactName: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  channel: ChannelType;
  avatarColor: string;
  sentiment: string;
  messages: Message[];
}

export interface Payout {
  id: string;
  agentStripeId: string;
  agentName: string;
  amount: number;
  currency: string;
  referenceDeal: string;
  status: 'Ready' | 'Paid';
  executedAt?: string;
  stripeTransferId?: string;
}

export interface ClientPlaybookData {
  id: string;
  name: string;
  progress: number;
  currentStepIndex: number;
  lastActivity: string;
  stalled: boolean;
  steps: PlaybookStep[];
}

export interface PlaybookStep {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'upload' | 'form' | 'action' | 'tool';
  status: 'complete' | 'active' | 'locked';
  videoUrl?: string;
  resourceLink?: string;
  requiredDoc?: string;
}

export interface VendorStats {
  id: string;
  vendorName: string;
  totalJobs: number;
  averageRating: number;
  responseTimeAvgHrs: number;
  aiHealthScore: number;
  status: 'Active' | 'Probation';
  category: string;
  trend: 'Up' | 'Down' | 'Stable';
  recentReviewSentiment: number;
}

export interface PastClient {
  id: string;
  name: string;
  closingDate: string;
  homeAnniversary: string;
  referralsSent: number;
  lastTouch: string;
  giftStatus: string;
  reviewStatus: string;
  houseFeaturesTags?: string[];
  currentEstValue?: number;
  birthday?: string;
  children?: PastClient[];
}

export interface Review {
  id: string;
  clientName: string;
  platform: string;
  rating: number;
  text: string;
  date: string;
  status: 'Pending' | 'Replied';
}

export interface ContractTemplate {
  id: string;
  name: string;
  type: string;
  lastMapped: string;
}

export interface ComplianceRule {
  id: string;
  triggerKeyword: string;
  requiredDoc: string;
  logicDesc: string;
}

export interface ScriptObjection {
  id: string;
  category: 'Commission' | 'Timing' | 'Competition';
  triggerPhrases: string[];
  coreResponse: string;
  successRate: number;
  usageCount: number;
}

export interface AuditFlag {
  id: string;
  leadName: string;
  riskType: 'Compliance' | 'Bad Lead Pattern';
  riskScore: number;
  explanation: string;
  transcriptSnippet: string;
  status: 'Pending' | 'Resolved';
  detectedAt: string;
}

export interface VendorApplication {
  id: string;
  businessName: string;
  contactEmail: string;
  description: string;
  category: string;
  status: 'New' | 'AI Review' | 'Approved' | 'Rejected';
  aiSuggestedTags: string[];
  licenseUrl: string;
  submittedDate: string;
}

export interface SellerReport {
  id: string;
  listingId: string;
  address: string;
  weekEnding: string;
  viewsZillow: number;
  showingsCount: number;
  status: 'Sent' | 'Draft';
  feedbackSummaryAI: string;
  openRate?: number;
  replyRate?: number;
  pdfUrl?: string;
}

export interface RealEstateEvent {
  id: string;
  name: string;
  dateTime: string;
  location: string;
  type: 'Seminar' | 'Webinar' | 'Networking';
  description: string;
  faqText: string;
  rsvpCount: number;
  attendeeCount: number;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  contactId: string;
  contactName: string;
  status: 'Registered' | 'Attended' | 'Cancelled';
  invitedByAgentId: string;
  timestamp: string;
}

export interface RoutingLog {
  id: string;
  leadName: string;
  agentName: string;
  agentId: string;
  zipCode: string;
  budget: number;
  matchReason: string;
  timestamp: string;
  status: 'Assigned' | 'Overridden';
}

export interface NotificationRule {
  id: string;
  name: string;
  scoreThreshold: number;
  primaryChannel: 'SMS' | 'Email' | 'Slack';
  isActive: boolean;
}

export interface NotificationPreference {
  agentId: string;
  smsHotLeads: boolean;
  emailWarmLeads: boolean;
  slackTeamUpdates: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export interface DealStakeholder {
  id: string;
  dealId: string;
  role: 'Lender' | 'Title' | 'Inspector' | 'Client';
  name: string;
  email: string;
  phone: string;
  autoNotify: boolean;
}

export interface CommsAuditLog {
  id: string;
  recipientType: 'Lender' | 'Client' | 'Title' | 'Inspector';
  messageBody: string;
  timestamp: string;
  channel: 'SMS' | 'Email';
  status: 'Sent' | 'Delivered' | 'Failed';
}

export interface ReminderConfig {
  intervals: ('24h' | '2h' | '15m')[];
  googleMapsApiKey: string;
  weatherApiKey: string;
  isActive: boolean;
}

export interface ListingApproval {
  id: string;
  listingId: string;
  address: string;
  agentName: string;
  riskScore: number;
  flaggedTerms: string[];
  price: number;
  pricePerSqft: number;
  status: 'Pending AI' | 'Needs Review' | 'Approved' | 'Rejected';
  aiFeedback?: string;
  submittedDate: string;
  description: string;
}

export interface SyndicationLink {
  id: string;
  listingId: string;
  platform: 'Zillow' | 'Realtor' | 'Website' | 'Facebook' | 'Instagram' | 'LinkedIn';
  url: string;
  status: 'Active' | 'Processing' | 'Failed';
  clicks: number;
}

export interface SyndicationError {
  id: string;
  listingId: string;
  address: string;
  platform: string;
  error: string;
  timestamp: string;
}

export interface OpenHouse {
  id: string;
  listingId: string;
  address: string;
  startTime: string;
  endTime: string;
  theme: string;
  status: 'Active' | 'Completed';
  rsvpCount: number;
  qrCodeUrl: string;
}

export interface OHTemplate {
  id: string;
  name: string;
  description: string;
  aiPrompt: string;
}

export interface TagRule {
  id: string;
  ruleName: string;
  conditionField: string;
  conditionValue: string;
  frequencyThreshold: number;
  tagToApply: string;
  isActive: boolean;
}

export interface AvailabilitySettings {
  allowDoubleBooking: boolean;
  driveTimeBufferMins: number;
  workingHoursStart: string;
  workingHoursEnd: string;
}

export interface ShowingFeedback {
  id: string;
  showingId: string;
  address: string;
  leadName: string;
  rawResponseText: string;
  sentimentScore: number;
  keyObjections: string[];
  interestLevel: 'Hot' | 'Warm' | 'Cold';
  publishedToSeller: boolean;
  timestamp: string;
}

export interface FeedbackConfig {
  delayTimeMins: number;
  autoShareWithSeller: boolean;
  isActive: boolean;
}

export interface ClientActionLog {
  id: string;
  actionName: string;
  status: string;
  timestamp: string;
  payloadData: any;
  clientName: string;
}
