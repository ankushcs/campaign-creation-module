import type { DSP, Field, Account } from "./types"

// Fallback data if API fails or for demo purposes
const DEMO_PLATFORMS: DSP[] = [
  {
    id: "meta-ads",
    name: "Meta Ads",
    enabled: true,
    description: "Reach audiences on Facebook, Instagram, and Messenger",
    icon: "/icons/meta.svg",
  },
  {
    id: "google-ads",
    name: "Google Ads",
    enabled: false,
    description: "Search, Display, and Video campaigns across Google's network",
    icon: "/icons/google-ads.svg",
  },
  {
    id: "dv360",
    name: "Display & Video 360",
    enabled: false,
    description: "Enterprise-grade programmatic buying platform",
    icon: "/icons/dv360.svg",
  },
  {
    id: "linkedin-ads",
    name: "LinkedIn Ads",
    enabled: false,
    description: "Professional network targeting for B2B campaigns",
    icon: "/icons/linkedin.svg",
  },
]

export async function fetchActiveDSPs(): Promise<{ dsps: DSP[] }> {
  try {
    const response = await fetch("/campaign/create/get-all-active-dsps/")
    
    if (!response.ok) {
      throw new Error("Network response was not ok")
    }

    const data = await response.json()
    // Map API response to internal DSP type
    return {
       dsps: data.data.platform.map((p: any) => ({
         ...p,
         // Ensure optional fields are handled if needed by UI, though type is now optional
         icon: p.icon || "", 
       }))
    }
  } catch (error) {
    console.warn("Failed to fetch DSPs, using fallback demo data:", error)
    return { dsps: DEMO_PLATFORMS }
  }
}

// Deprecated: kept for backward compatibility if needed temporarily
export async function loadDSPConfig(): Promise<{ dsps: DSP[] }> {
  return fetchActiveDSPs()
}

export async function loadTableSchema(dspId: string): Promise<Record<string, Field[]>> {
  const response = await fetch("/config/table-schema.json")
  const data = await response.json()
  return data[dspId] || {}
}

export async function loadDefaultTemplate(dspId: string): Promise<Record<string, any>> {
  const response = await fetch("/config/default-template.json")
  const data = await response.json()
  return data[dspId] || {}
}

const DEMO_TEMPLATE_DATA: { platform_hierarchy: string[], template_data: Record<string, Field[]> } = {
  platform_hierarchy: ["campaign", "adset", "ad"],
  template_data: {
  "campaign": [
    { "id": "name", "label": "Campaign Name", "type": "text", "required": true, "editable": false, "isActive": true },
    { "id": "objective", "label": "Objective", "type": "select", "required": true, "editable": false, "isActive": true, "options": ["OUTCOME_AWARENESS", "OUTCOME_ENGAGEMENT", "OUTCOME_TRAFFIC", "OUTCOME_LEADS", "OUTCOME_SALES"] },
    { "id": "status", "label": "Status", "type": "select", "required": true, "editable": false, "isActive": true, "options": ["ACTIVE", "PAUSED", "ARCHIVED"] },
    { "id": "budget_optimization", "label": "Budget Optimization", "type": "select", "required": false, "editable": true, "isActive": true, "options": ["CBO", "ABO"] },
    { "id": "buying_type", "label": "Buying Type", "type": "select", "required": true, "editable": false, "isActive": true, "options": ["AUCTION", "RESERVED"] },
    { "id": "spend_cap", "label": "Spend Cap", "type": "number", "required": false, "editable": true, "isActive": true },
    { "id": "start_date", "label": "Start Date", "type": "date", "required": false, "editable": true, "isActive": true },
    { "id": "end_date", "label": "End Date", "type": "date", "required": false, "editable": true, "isActive": true }
  ],

  "adset": [
    { "id": "name", "label": "Adset Name", "type": "text", "required": true, "editable": false, "isActive": true },
    { "id": "campaign_id", "label": "Campaign", "type": "select", "required": true, "editable": false, "isActive": true },
    { "id": "status", "label": "Status", "type": "select", "required": true, "editable": false, "isActive": true, "options": ["ACTIVE", "PAUSED", "ARCHIVED"] },
    { "id": "optimization_goal", "label": "Optimization Goal", "type": "select", "required": true, "editable": false, "isActive": true, "options": ["IMPRESSIONS", "LINK_CLICKS", "CONVERSIONS", "REACH"] },
    { "id": "billing_event", "label": "Billing Event", "type": "select", "required": true, "editable": false, "isActive": true, "options": ["IMPRESSIONS", "LINK_CLICKS", "APP_INSTALLS"] },
    { "id": "bid_amount", "label": "Bid Amount", "type": "number", "required": false, "editable": true, "isActive": true },
    { "id": "daily_budget", "label": "Daily Budget", "type": "number", "required": false, "editable": true, "isActive": true },
    { "id": "lifetime_budget", "label": "Lifetime Budget", "type": "number", "required": false, "editable": true, "isActive": true },
    { "id": "targeting", "label": "Targeting", "type": "json", "required": true, "editable": false, "isActive": true },
    { "id": "start_time", "label": "Start Time", "type": "datetime", "required": false, "editable": true, "isActive": true },
    { "id": "end_time", "label": "End Time", "type": "datetime", "required": false, "editable": true, "isActive": true }
  ],

  "ad": [
    { "id": "name", "label": "Ad Name", "type": "text", "required": true, "editable": false, "isActive": true },
    { "id": "adset_id", "label": "Adset", "type": "select", "required": true, "editable": false, "isActive": true },
    { "id": "status", "label": "Status", "type": "select", "required": true, "editable": false, "isActive": true, "options": ["ACTIVE", "PAUSED", "ARCHIVED"] },
    { "id": "creative_type", "label": "Creative Type", "type": "select", "required": true, "editable": false, "isActive": true, "options": ["IMAGE", "VIDEO", "CAROUSEL", "COLLECTION"] },
    { "id": "primary_text", "label": "Primary Text", "type": "textarea", "required": true, "editable": false, "isActive": true },
    { "id": "headline", "label": "Headline", "type": "text", "required": true, "editable": false, "isActive": true },
    { "id": "description", "label": "Description", "type": "text", "required": false, "editable": true, "isActive": true },
    { "id": "call_to_action", "label": "Call to Action", "type": "select", "required": true, "editable": false, "isActive": true, "options": ["LEARN_MORE", "SHOP_NOW", "SIGN_UP", "DOWNLOAD", "GET_QUOTE"] },
    { "id": "destination_url", "label": "Destination URL", "type": "url", "required": true, "editable": false, "isActive": true },
    { "id": "media_url", "label": "Media URL", "type": "url", "required": false, "editable": true, "isActive": true }
  ]
}
}

const DEMO_ACCOUNTS: { popup_heading: string; popup_description: string; accounts: Account[] } = {
  popup_heading: "Choose Meta Ad Account",
  popup_description: "Select the ad account you want to use for this campaign",
  accounts: [
    { id: "act_201", name: "Fashion Brand US" },
    { id: "act_202", name: "Fashion Brand EU" },
    { id: "act_203", name: "Fashion Brand India" },
    { id: "act_204", name: "Fashion Brand China" },
  ]
}

export async function fetchTableSchema(
  platformId: string,
  accountIds: string[]
): Promise<{ platform_hierarchy: string[], template_data: Record<string, Field[]> }> {
  try {
    // Build query string with multiple account_ids
    const params = new URLSearchParams()
    params.append('platform_id', platformId)
    accountIds.forEach(accountId => {
      params.append('account_ids', accountId)
    })
    
    const response = await fetch(`/campaign/create/config/table-schema?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error("Network response was not ok")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.warn("Failed to fetch table schema, using fallback demo data:", error)
    return DEMO_TEMPLATE_DATA
  }
}



export async function fetchAccounts(platformId: string): Promise<{ data: { popup_heading: string; popup_description: string; accounts: Account[] } }> {
  try {
    const response = await fetch(`/campaign/create/get-accounts?platform_id=${platformId}`)
    
    if (!response.ok) {
      throw new Error("Network response was not ok")
    }

    return await response.json()
  } catch (error) {
    console.warn("Failed to fetch accounts, using fallback demo data:", error)
    return {
      data: DEMO_ACCOUNTS
    }
  }
}

// Deprecated: Adapter for backward compatibility
export async function loadAccounts(): Promise<{ accounts: any[] }> {
    // Default to Google Ads for legacy calls
    const result = await fetchAccounts("google-ads")
    return { accounts: result.data.accounts }
}

export async function loadMockCampaigns(): Promise<{ campaigns: any[]; adsets: any[]; ads: any[] }> {
  const response = await fetch("/data/mock-campaigns.json")
  return response.json()
}

export async function loadDemoFetchData(): Promise<{ campaigns: any[]; adsets: any[]; ads: any[] }> {
  const response = await fetch("/data/demo-fetch-data.json")
  return response.json()
}
