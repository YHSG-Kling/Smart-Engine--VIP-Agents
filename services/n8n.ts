const WORKFLOWS = {
  TRIGGER_HYBRID_ONBOARDING: 'trigger-hybrid-onboarding', 
  FETCH_TRANSITION_STRATEGY: 'fetch-transition-strategy', 
  TRIGGER_HANDOFF_AUDIT: 'trigger-handoff-audit', 
  TRIGGER_DYNAMIC_CHECKLIST: 'trigger-dynamic-checklist',
  FETCH_HANDOFF_LOGS: 'fetch-handoff-logs',
  TRIGGER_DOCUMENT_GENERATION: 'trigger-document-generation',
  TRIGGER_MILESTONE_BROADCAST: 'trigger-milestone-broadcast',
  TRIGGER_CLOSING_SEQUENCE: 'trigger-closing-sequence',
  APPROVE_CDA: 'approve-cda',
  ORDER_CLOSING_GIFT: 'order-closing-gift',
  TRIGGER_CREATIVE_PIPELINE: 'trigger-creative-pipeline',
  SUBMIT_LISTING_FOR_APPROVAL: 'submit-listing-for-approval',
  TRIGGER_SYNDICATION: 'trigger-syndication',
  LAUNCH_OPEN_HOUSE_BLITZ: 'launch-open-house-blitz',
  TRIGGER_DYNAMIC_SEGMENTATION: 'trigger-dynamic-segmentation',
  TRIGGER_SMART_DRIP: 'trigger-smart-drip',
  TRIGGER_REACTIVATION_SCAN: 'trigger-reactivation-scan',
  TRIGGER_SHOWING_REQUEST: 'trigger-showing-request',
  TRIGGER_AVAILABILITY_PROPOSAL: 'trigger-availability-proposal',
  FINALIZE_SHOWING_BOOKING: 'finalize-showing-booking',
  TRIGGER_BRIEFING_GENERATION: 'trigger-briefing-generation',
  SEND_RUNNING_LATE_ALERT: 'send-running-late-alert',
  UPDATE_REMINDER_LOGIC: 'update-reminder-logic',
  TEST_REMINDER_SEQUENCE: 'test-reminder-sequence',
  UPDATE_FEEDBACK_LOGIC: 'update-feedback-logic',
  PUBLISH_FEEDBACK_TO_REPORT: 'publish-feedback-to-report',
  SAVE_CLIENT_PRIVATE_NOTE: 'save-client-private-note',
  UPDATE_ROUTING_LOGIC: 'update-routing-logic',
  FETCH_POTENTIAL_OFFERS: 'fetch-potential-offers',
  TRIGGER_LENDER_REFERRAL: 'trigger-lender-referral',
  ESCALATE_LOW_CONFIDENCE: 'escalate-low-confidence',
  STOP_BUYER_ONBOARDING: 'stop-buyer-onboarding',
  SEND_MESSAGE: 'send-message',
  START_WARM_TRANSFER: 'start-warm-transfer',
  SEND_SELLER_REPORT: 'send-seller-report',
  REQUEST_VIRTUAL_STAGING: 'request-virtual-staging',
  EXECUTE_PAYOUT_BATCH: 'execute-payout-batch',
  AUDIT_DOCUMENT: 'audit-document',
  INGEST_LISTING: 'ingest-listing',
  ASSIGN_PLAYBOOK: 'assign-playbook',
  UPDATE_PLAYBOOK_PROGRESS: 'update-playbook-progress',
  SEND_GIFT: 'send-gift',
  REQUEST_REVIEW: 'request-review',
  CHECK_SYSTEM_HEALTH: 'check-system-health',
  TRIGGER_CLIENT_ACTION: 'trigger-client-action',
  SUBMIT_OPEN_HOUSE_LEAD: 'submit-open-house-lead',
  CONFIRM_AND_RETRAIN_AI: 'confirm-and-retrain-ai',
  TRIGGER_WEEKLY_AI_REVIEW: 'trigger-weekly-ai-review',
  TRIGGER_PROPERTY_ENRICHMENT: 'trigger-property-enrichment',
  VERIFY_VENDOR_INSURANCE: 'verify-vendor-insurance',
  TRIGGER_NO_SHOW_RECOVERY: 'trigger-no-show-recovery',
  SEND_LATE_BUFFER_SMS: 'send-late-buffer-sms',
  GRANT_PORTAL_ACCESS: 'trigger-portal-access',
  TRIGGER_COMPLIANCE_CHECKLIST: 'trigger-compliance-checklist',
  TRIGGER_BROKER_AUDIT: 'trigger-broker-audit',
  TRIGGER_AUDIT_ARCHIVAL: 'trigger-audit-archival',
  TRIGGER_REVIEW_CAMPAIGN: 'trigger-review-campaign',
  SUBMIT_CLIENT_REFERRAL: 'submit-client-referral',
  BROKER_TAKEOVER: 'broker-takeover',
  TRIGGER_CMA_PACKAGE: 'trigger-cma-package',
  APPROVE_SOCIAL_POST: 'approve-social-post',
  GENERATE_VOICE_OFFER: 'generate-voice-offer',
  SEND_VOICE_OFFER: 'send-voice-offer',
  PARSE_COUNTER_PDF: 'parse-counter-pdf',
  LOG_NEGOTIATION_DECISION: 'log-negotiation-decision',
  TRIGGER_COUNTER_DRAFT: 'trigger-counter-draft',
  CONTRACT_TO_PROJECT_PLAN: 'contract-to-project-plan',
  AUTO_FILE_DOCUMENT: 'auto-file-document',
  // WF-SHOW-01
  OPTIMIZE_TOUR_ROUTE: 'optimize-tour-route',
  APPROVE_AND_SEND_TOUR: 'approve-and-send-tour',
  // Workflow 151
  NUDGE_LENDER: 'nudge-lender',
  // Workflow 152
  TRIGGER_UTILITY_CONCIERGE: 'trigger-utility-concierge',
  SCHEDULE_WALKTHROUGH: 'schedule-walkthrough',
  COORDINATE_KEYS: 'coordinate-keys',
  // Workflow 153
  PROCESS_DISBURSEMENT: 'process-disbursement',
  // Workflow 154
  APPROVE_ANNIVERSARY_DRAFT: 'approve-anniversary-draft',
  // Workflow 155
  TCPA_OPT_OUT: 'tcpa-opt-out',
  // Workflow 156
  GENERATE_SOCIAL_CONTENT: 'generate-social-content',
  PUBLISH_SOCIAL_CONTENT: 'publish-social-content',
  // Workflow 157
  UPLOAD_MARKETING_ASSET: 'upload-marketing-asset',
  CLEANUP_EXPIRED_ASSETS: 'cleanup-expired-assets',
  // Missing component-level workflow keys
  BOOK_SLOT: 'book-slot',
  HANDLE_OBJECTION: 'handle-objection',
  CHECK_AVAILABILITY: 'check-availability'
};

export const n8nService = {
  async triggerWorkflow(workflowId: string, data: any) {
    console.log(`[N8N] Triggering Workflow: ${workflowId}`, data);
    return { success: true, isSimulation: true, data: {} };
  },

  async optimizeTourRoute(tourData: any) {
    return this.triggerWorkflow(WORKFLOWS.OPTIMIZE_TOUR_ROUTE, tourData);
  },

  async approveAndSendTour(tourId: string) {
    return this.triggerWorkflow(WORKFLOWS.APPROVE_AND_SEND_TOUR, { tourId });
  },

  async uploadMarketingAsset(data: { name: string, category: string, file: File }) {
      return this.triggerWorkflow(WORKFLOWS.UPLOAD_MARKETING_ASSET, { 
          name: data.name, 
          category: data.category, 
          fileName: data.file.name 
      });
  },

  async generateSocialContent(dealId: string, status: 'Sold' | 'Under Contract') {
    return this.triggerWorkflow(WORKFLOWS.GENERATE_SOCIAL_CONTENT, { dealId, status });
  },

  async publishSocialContent(contentId: string) {
    return this.triggerWorkflow(WORKFLOWS.PUBLISH_SOCIAL_CONTENT, { contentId });
  },

  async logComplianceEvent(data: { phone: string, status: string, evidence: string }) {
    return this.triggerWorkflow(WORKFLOWS.TCPA_OPT_OUT, data);
  },

  async approveAnniversaryDraft(clientId: string, text: string) {
    return this.triggerWorkflow(WORKFLOWS.APPROVE_ANNIVERSARY_DRAFT, { clientId, text });
  },

  async processDisbursement(dealId: string, amount: number) {
    return this.triggerWorkflow(WORKFLOWS.PROCESS_DISBURSEMENT, { dealId, amount });
  },

  async nudgeLender(financingId: string, dealId: string) {
    return this.triggerWorkflow(WORKFLOWS.NUDGE_LENDER, { financingId, dealId });
  },

  async triggerUtilityConcierge(clientId: string, zip: string) {
    return this.triggerWorkflow(WORKFLOWS.TRIGGER_UTILITY_CONCIERGE, { clientId, zip });
  },

  async scheduleWalkthrough(dealId: string, date: string) {
    return this.triggerWorkflow(WORKFLOWS.SCHEDULE_WALKTHROUGH, { dealId, date });
  },

  async coordinateKeys(dealId: string, logic: string) {
    return this.triggerWorkflow(WORKFLOWS.COORDINATE_KEYS, { dealId, logic });
  },

  async autoFileDocument(file: File, dealId: string, clientEmail?: string) {
    return this.triggerWorkflow(WORKFLOWS.AUTO_FILE_DOCUMENT, { dealId, fileName: file.name, clientEmail });
  },

  async parseCounterPDF(file: File, dealId: string) {
    return this.triggerWorkflow(WORKFLOWS.PARSE_COUNTER_PDF, { dealId, fileName: file.name });
  },

  async logNegotiationDecision(roundId: string, decision: 'Accept' | 'Reject' | 'Counter') {
    return this.triggerWorkflow(WORKFLOWS.LOG_NEGOTIATION_DECISION, { roundId, decision });
  },

  async triggerCounterDraft(data: any) {
    return this.triggerWorkflow(WORKFLOWS.TRIGGER_COUNTER_DRAFT, data);
  },

  async generateVoiceOffer(audioBlob: Blob) {
    return this.triggerWorkflow(WORKFLOWS.GENERATE_VOICE_OFFER, { audioBlob });
  },

  async sendVoiceOffer(draftId: string) {
    return this.triggerWorkflow(WORKFLOWS.SEND_VOICE_OFFER, { draftId });
  },

  async approveSocialPost(assetId: string) {
    return this.triggerWorkflow(WORKFLOWS.APPROVE_SOCIAL_POST, { assetId });
  },

  async triggerCMAPackage(data: any) {
    return this.triggerWorkflow(WORKFLOWS.TRIGGER_CMA_PACKAGE, data);
  },

  async brokerTakeover(incidentId: string) {
    return this.triggerWorkflow(WORKFLOWS.BROKER_TAKEOVER, { incidentId });
  },

  async submitReferral(data: any) {
    return this.triggerWorkflow(WORKFLOWS.SUBMIT_CLIENT_REFERRAL, data);
  },

  async triggerReviewCampaign(dealId: string, sentiment: string) {
    return this.triggerWorkflow(WORKFLOWS.TRIGGER_REVIEW_CAMPAIGN, { dealId, sentiment });
  },

  async triggerAuditArchival(dealId: string) {
    return this.triggerWorkflow(WORKFLOWS.TRIGGER_AUDIT_ARCHIVAL, { dealId });
  },

  async triggerBrokerAudit(docId: string, url: string, type: string) {
    return this.triggerWorkflow(WORKFLOWS.TRIGGER_BROKER_AUDIT, { docId, url, type });
  },

  async triggerComplianceChecklist(dealId: string, details: { description: string, yearBuilt: number, type: string }) {
    return this.triggerWorkflow(WORKFLOWS.TRIGGER_COMPLIANCE_CHECKLIST, { dealId, ...details });
  },

  async grantPortalAccess(email: string, role: string, dealId: string, name: string) {
    return this.triggerWorkflow(WORKFLOWS.GRANT_PORTAL_ACCESS, { email, role, dealId, name });
  },

  async triggerNoShowRecovery(showingId: string, data: any) {
    return this.triggerWorkflow(WORKFLOWS.TRIGGER_NO_SHOW_RECOVERY, { showingId, ...data });
  },

  async sendLateBuffer(showingId: string, data: any) {
    return this.triggerWorkflow(WORKFLOWS.SEND_LATE_BUFFER_SMS, { showingId, ...data });
  },

  async updateRoutingLogic(config: any) {
    return this.triggerWorkflow(WORKFLOWS.UPDATE_ROUTING_LOGIC, config);
  },

  async fetchPotentialOffers() {
    return { 
        success: true, 
        data: [
            { id: 'po1', leadName: 'Charlie Day', address: '123 Main St', score: 9, status: 'Hot' },
            { id: 'po2', leadName: 'Diane Court', address: '789 Skyline Dr', score: 10, status: 'Hot' }
        ] 
    };
  },

  async updateFeedbackLogic(config: any) {
    return this.triggerWorkflow(WORKFLOWS.UPDATE_FEEDBACK_LOGIC, config);
  },

  async publishFeedbackToReport(feedbackId: string) {
    return this.triggerWorkflow(WORKFLOWS.PUBLISH_FEEDBACK_TO_REPORT, { feedbackId });
  },

  async saveClientPrivateNote(showingId: string, note: string) {
    return this.triggerWorkflow(WORKFLOWS.SAVE_CLIENT_PRIVATE_NOTE, { showingId, note });
  },

  async triggerHybridOnboarding(contactId: string, sellAddress: string, buyCriteria: any) {
    return this.triggerWorkflow(WORKFLOWS.TRIGGER_HYBRID_ONBOARDING, { contactId, sellAddress, buyCriteria });
  },

  async startWarmTransfer(chatId: string, from: string, to: string) {
    return this.triggerWorkflow(WORKFLOWS.START_WARM_TRANSFER, { chatId, from, to });
  },

  async sendSellerReport(listingId: string, email: string) {
    return this.triggerWorkflow(WORKFLOWS.SEND_SELLER_REPORT, { listingId, email });
  },

  async executePayoutBatch(ids: string[]) {
    return this.triggerWorkflow(WORKFLOWS.EXECUTE_PAYOUT_BATCH, { ids });
  },

  async auditDocument(docId: string, url: string, name: string) {
    return this.triggerWorkflow(WORKFLOWS.AUDIT_DOCUMENT, { docId, url, name });
  },

  async ingestListing(address: string) {
    return this.triggerWorkflow(WORKFLOWS.INGEST_LISTING, { address });
  },

  async assignPlaybook(clientId: string, playbookId: string) {
    return this.triggerWorkflow(WORKFLOWS.ASSIGN_PLAYBOOK, { clientId, playbookId });
  },

  async updatePlaybookProgress(userId: string, stepId: string, status: string) {
    return this.triggerWorkflow(WORKFLOWS.UPDATE_PLAYBOOK_PROGRESS, { userId, stepId, status });
  },

  async sendGift(clientId: string, giftId: string) {
    return this.triggerWorkflow(WORKFLOWS.SEND_GIFT, { clientId, giftId });
  },

  async requestReview(clientId: string, platform: string) {
    return this.triggerWorkflow(WORKFLOWS.REQUEST_REVIEW, { clientId, platform });
  },

  async checkSystemHealth() {
    return this.triggerWorkflow(WORKFLOWS.CHECK_SYSTEM_HEALTH, {});
  },

  async triggerClientAction(type: string, user: string, payload: any) {
    return this.triggerWorkflow(WORKFLOWS.TRIGGER_CLIENT_ACTION, { type, user, payload });
  },

  async submitOpenHouseLead(data: any) {
    return this.triggerWorkflow(WORKFLOWS.SUBMIT_OPEN_HOUSE_LEAD, data);
  },

  async confirmAndRetrainAI(id: string) {
    return this.triggerWorkflow(WORKFLOWS.CONFIRM_AND_RETRAIN_AI, { id });
  },

  async triggerWeeklyAIReview() {
    return this.triggerWorkflow(WORKFLOWS.TRIGGER_WEEKLY_AI_REVIEW, {});
  },

  async triggerPropertyEnrichment(leadId: string, propertyAddress: string) {
    return this.triggerWorkflow(WORKFLOWS.TRIGGER_PROPERTY_ENRICHMENT, { leadId, propertyAddress });
  },

  // Fix: Adding methods called by components that were missing from n8nService object
  async finalizeShowingBooking(showingId: string, slotId: string) {
    return this.triggerWorkflow(WORKFLOWS.FINALIZE_SHOWING_BOOKING, { showingId, slotId });
  },

  async triggerLenderReferral(leadId: string, leadName: string, leadEmail: string, budget: number, context: string) {
    return this.triggerWorkflow(WORKFLOWS.TRIGGER_LENDER_REFERRAL, { leadId, leadName, leadEmail, budget, context });
  },

  async bookSlot(slot: string, user: string) {
    await this.triggerWorkflow(WORKFLOWS.BOOK_SLOT, { slot, user });
    return { success: true, link: '#' };
  },

  async handleObjection(text: string) {
    await this.triggerWorkflow(WORKFLOWS.HANDLE_OBJECTION, { text });
    if (text.toLowerCase().includes('commission')) {
        return { strategy: 'Value Demonstration', script: "I understand. My marketing plan, which includes professional staging and 3D tours, typically nets sellers 3-5% more than average agents. If we reduce the marketing budget, we risk a lower net price." };
    }
    return null;
  },

  async escalateLowConfidence(user: string, query: string, text: string, confidence: number) {
    return this.triggerWorkflow(WORKFLOWS.ESCALATE_LOW_CONFIDENCE, { user, query, text, confidence });
  },

  async checkAvailability() {
    await this.triggerWorkflow(WORKFLOWS.CHECK_AVAILABILITY, {});
    return [
        { start: 'Today, 4:00 PM' },
        { start: 'Tomorrow, 10:00 AM' }
    ];
  },

  async triggerCreativePipeline(listingId: string, photos: string[]) {
    return this.triggerWorkflow(WORKFLOWS.TRIGGER_CREATIVE_PIPELINE, { listingId, photos });
  },

  async triggerReactivationScan(threshold: number, autoSend: boolean) {
    return this.triggerWorkflow(WORKFLOWS.TRIGGER_REACTIVATION_SCAN, { threshold, autoSend });
  },

  async triggerDocumentGeneration(data: any) {
    return this.triggerWorkflow(WORKFLOWS.TRIGGER_DOCUMENT_GENERATION, data);
  },

  async sendMessage(contactName: string, channel: string, text: string) {
    return this.triggerWorkflow(WORKFLOWS.SEND_MESSAGE, { contactName, channel, text });
  },

  async submitListingForApproval(data: any) {
    return this.triggerWorkflow(WORKFLOWS.SUBMIT_LISTING_FOR_APPROVAL, data);
  },

  async verifyVendorInsurance(url: string) {
    await this.triggerWorkflow(WORKFLOWS.VERIFY_VENDOR_INSURANCE, { url });
    return { 
        complianceScore: 100, 
        expiration: '2025-12-31', 
        coverageAmount: 2000000, 
        isCompliant: true 
    };
  },

  async updateReminderLogic(config: any) {
    return this.triggerWorkflow(WORKFLOWS.UPDATE_REMINDER_LOGIC, config);
  },

  async triggerLaunchOpenHouseBlitz(data: any) {
    return this.triggerWorkflow(WORKFLOWS.LAUNCH_OPEN_HOUSE_BLITZ, data);
  },

  async triggerAvailabilityProposal(showingId: string) {
    return this.triggerWorkflow(WORKFLOWS.TRIGGER_AVAILABILITY_PROPOSAL, { showingId });
  },

  async triggerBriefingGeneration(showingId: string) {
    return this.triggerWorkflow(WORKFLOWS.TRIGGER_BRIEFING_GENERATION, { showingId });
  },

  async sendRunningLateAlert(showingId: string, minutes: number) {
    return this.triggerWorkflow(WORKFLOWS.SEND_RUNNING_LATE_ALERT, { showingId, minutes });
  }
};