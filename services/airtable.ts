
import { Lead, Deal, Vendor, Agent, CommissionRecord, MarketingChannel, Listing, Contest } from '../types';

// Configuration
// In a real deployment, these would be in a .env file
const API_KEY = process.env.REACT_APP_AIRTABLE_PAT || process.env.AIRTABLE_API_KEY; 
const BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}`;

// Helper for headers
const getHeaders = () => ({
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json'
});

// Generic Fetch Wrapper
async function fetchTable<T>(tableName: string, mapper: (record: any) => T): Promise<T[] | null> {
  if (!API_KEY || !BASE_ID) {
    // Return null to indicate we should use mock data
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/${tableName}?maxRecords=100&view=Grid%20view`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Airtable Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.records.map(mapper);
  } catch (error) {
    console.error(`Failed to fetch ${tableName}:`, error);
    return null;
  }
}

// Generic Create Wrapper
async function createRecord(tableName: string, fields: any) {
  if (!API_KEY || !BASE_ID) return { id: 'mock-id', fields };

  try {
    const response = await fetch(`${BASE_URL}/${tableName}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ records: [{ fields }] })
    });
    return await response.json();
  } catch (error) {
    console.error(`Failed to create in ${tableName}:`, error);
    return null;
  }
}

// Generic Update Wrapper
async function updateRecord(tableName: string, recordId: string, fields: any) {
  if (!API_KEY || !BASE_ID) return { id: recordId, fields };

  try {
    const response = await fetch(`${BASE_URL}/${tableName}/${recordId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ fields })
    });
    return await response.json();
  } catch (error) {
    console.error(`Failed to update ${tableName}:`, error);
    return null;
  }
}

// Data Mappers (Convert Airtable JSON to App Types)
const mapLead = (record: any): Lead => ({
  id: record.id,
  name: record.fields['Name'] || 'Unknown',
  score: record.fields['Engagement_Score'] || 0,
  lastActivity: record.fields['Last_Activity_Summary'] || 'No recent activity',
  status: record.fields['Status'] || 'New',
  source: record.fields['Source'] || 'Unknown',
  tags: record.fields['Tags'] ? record.fields['Tags'].split(',') : [],
  sentiment: record.fields['Sentiment_Label'] || 'Neutral',
  urgency: record.fields['Urgency_Score'] || 1,
  intent: record.fields['Intent_Type'] || 'Buyer',
  aiSummary: record.fields['AI_Summary_Text'] || '',
});

const mapDeal = (record: any): Deal => ({
  id: record.id,
  address: record.fields['Property_Address'] || 'Unknown Address',
  price: record.fields['Contract_Price'] || 0,
  projectedGCI: record.fields['Projected_GCI'] || 0,
  stage: record.fields['Current_Stage'] || 'New',
  clientName: record.fields['Client_Name'] || 'Unknown',
  healthScore: record.fields['Deal_Health_Score'] || 100,
  healthStatus: record.fields['Health_Status'] || 'Healthy',
  nextTask: record.fields['Next_Critical_Task'] || 'None',
  missingDocs: record.fields['Missing_Docs_Count'] || 0,
  riskReason: record.fields['Risk_Reason_AI'],
  lenderReferralStatus: record.fields['Lender_Referral_Status'] || 'None',
  assignedLender: record.fields['Assigned_Lender'],
  winProbability: record.fields['Win_Probability_Percent'], // AI Predictive
  predictedClose: record.fields['Predicted_Close_Date'],    // AI Predictive
});

const mapVendor = (record: any): Vendor => ({
  id: record.id,
  companyName: record.fields['Company_Name'] || 'Unknown Vendor',
  category: record.fields['Category'] || 'Contractor',
  rating: record.fields['Average_Rating'] || 0,
  verified: record.fields['Verified_Status'] === 'Verified',
  insuranceStatus: record.fields['Insurance_Valid'] ? 'Valid' : 'Expired',
  dealsClosed: record.fields['Total_Jobs_Completed'] || 0,
  minCreditScore: record.fields['Min_Credit_Score'],
  email: record.fields['Email'],
  logoUrl: record.fields['Logo_URL'],
  introTemplateId: record.fields['Intro_Template_ID'],
  rateSheetUrl: record.fields['Rate_Sheet_URL'],
  status: record.fields['Status'] || 'Active'
});

// Fix: Adding missing Agent properties for Workflow 100 routing logic
const mapAgent = (record: any): Agent => ({
  id: record.id,
  name: record.fields['Full_Name'] || 'Unknown Agent',
  role: record.fields['Role'] || 'Associate',
  email: record.fields['Email'] || '',
  phone: record.fields['Phone'] || '',
  volume: record.fields['YTD_Volume'] || 0,
  deals: record.fields['YTD_Deals'] || 0,
  capProgress: record.fields['Cap_Progress_Percent'] || 0,
  capPaid: record.fields['Cap_Paid_Amount'] || 0,
  capTotal: record.fields['Cap_Total_Goal'] || 20000,
  teamLead: record.fields['Team_Leader_Name'],
  status: record.fields['Status'] || 'Active',
  availability: record.fields['Availability_Status'] || 'Offline',
  dailyLeadCap: record.fields['Daily_Lead_Cap'] || 0,
  leadsReceivedToday: record.fields['Leads_Received_Today'] || 0,
  lastRoutingTime: record.fields['Last_Routing_Time'],
  serviceAreasZips: record.fields['Service_Areas_Zips'] ? record.fields['Service_Areas_Zips'].split(',') : [],
  specialties: record.fields['Specialties'] ? record.fields['Specialties'].split(',') : [],
  closingRate: record.fields['Closing_Rate'] || 0,
});

const mapCommission = (record: any): CommissionRecord => ({
  id: record.id,
  date: record.fields['Closing_Date'] || '',
  address: record.fields['Property_Address'] || 'Unknown',
  agentName: record.fields['Agent_Name'] || '',
  gci: record.fields['GCI_Amount'] || 0,
  split: record.fields['Split_Percentage'] || 0.7,
  agentNet: record.fields['Agent_Net_Pay'] || 0,
  brokerNet: record.fields['Broker_Net_Pay'] || 0,
  status: record.fields['Payment_Status'] || 'Pending',
});

const mapMarketing = (record: any): MarketingChannel => ({
  channel: record.fields['Channel_Name'] || 'Unknown',
  spend: record.fields['Total_Spend'] || 0,
  leads: record.fields['Leads_Generated'] || 0,
  deals: record.fields['Deals_Closed'] || 0,
  gci: record.fields['Attributed_GCI'] || 0,
  cac: record.fields['CAC_Cost'] || 0,
  roas: `${record.fields['ROAS_Multiplier'] || 0}x`,
});

const mapListing = (record: any): Listing => ({
  id: record.id,
  address: record.fields['Address'] || 'Unknown',
  price: record.fields['List_Price'] || 0,
  status: record.fields['Status'] || 'Active',
  daysOnMarket: record.fields['Days_On_Market'] || 0,
  images: record.fields['Images'] ? record.fields['Images'].split(',') : [],
  description: record.fields['Description'],
  sellerEmail: record.fields['Seller_Email'],
  stats: {
    views: record.fields['Views_Count'] || 0,
    saves: record.fields['Saves_Count'] || 0,
    showings: record.fields['Showings_Count'] || 0,
    offers: record.fields['Offers_Count'] || 0,
  },
  benchmarks: {
    views: record.fields['Benchmark_Views'] || '+0%',
    saves: record.fields['Benchmark_Saves'] || '+0%',
    showings: record.fields['Benchmark_Showings'] || '+0%',
  }
});

const mapContest = (record: any): Contest => ({
  id: record.id,
  title: record.fields['Title'] || 'Sales Contest',
  metric: record.fields['Metric_Type'] || 'Volume',
  startDate: record.fields['Start_Date'],
  endDate: record.fields['End_Date'],
  prize: record.fields['Prize_Description'],
  participants: record.fields['Participants_JSON'] ? JSON.parse(record.fields['Participants_JSON']) : []
});

// Service Exports
export const airtableService = {
  getLeads: () => fetchTable('Leads', mapLead),
  getTransactions: () => fetchTable('Transactions', mapDeal),
  getVendors: () => fetchTable('Vendors', mapVendor),
  getAgents: () => fetchTable('Agents', mapAgent),
  getCommissions: () => fetchTable('Commissions', mapCommission),
  getMarketingStats: () => fetchTable('Marketing_Attribution', mapMarketing),
  getListings: () => fetchTable('Listings', mapListing),
  getContests: () => fetchTable('Gamification_Contests', mapContest),
  
  // Write Operations
  updateLeadStatus: (id: string, status: string) => updateRecord('Leads', id, { 'Status': status }),
  updateDealStage: (id: string, stage: string) => updateRecord('Transactions', id, { 'Current_Stage': stage }),
  createLead: (lead: any) => createRecord('Leads', lead),
};
