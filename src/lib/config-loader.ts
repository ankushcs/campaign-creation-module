import type { DSP, Field } from "./types"

export async function loadDSPConfig(): Promise<{ dsps: DSP[] }> {
  const response = await fetch("/config/dsp-config.json")
  return response.json()
}

export async function loadTableSchema(dspId: string): Promise<Record<string, { fields: Field[] }>> {
  const response = await fetch("/config/table-schema.json")
  const data = await response.json()
  return data[dspId] || {}
}

export async function loadDefaultTemplate(dspId: string): Promise<Record<string, any>> {
  const response = await fetch("/config/default-template.json")
  const data = await response.json()
  return data[dspId] || {}
}

export async function loadAccounts(): Promise<{ accounts: any[] }> {
  const response = await fetch("/data/mock-advertisers.json")
  const data = await response.json()
  return { accounts: data.advertisers } // Adapter for now until JSON is renamed
}

export async function loadMockCampaigns(): Promise<{ campaigns: any[]; adsets: any[]; ads: any[] }> {
  const response = await fetch("/data/mock-campaigns.json")
  return response.json()
}

export async function loadDemoFetchData(): Promise<{ campaigns: any[]; adsets: any[]; ads: any[] }> {
  const response = await fetch("/data/demo-fetch-data.json")
  return response.json()
}
