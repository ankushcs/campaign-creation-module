import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DSP, Account, Field } from './types'

interface CampaignState {
  // DSP / Platform
  platform: DSP | null
  setPlatform: (platform: DSP | null) => void

  // Accounts
  availableAccounts: Account[]
  setAvailableAccounts: (accounts: Account[]) => void
  
  // New: All selected accounts and current active account
  all_selected_accounts: Array<{ id: string; name: string }>
  setAllSelectedAccounts: (accounts: Array<{ id: string; name: string }>) => void
  
  current_active_account: { id: string; name: string } | null
  setCurrentActiveAccount: (account: { id: string; name: string } | null) => void
  
  // Page Schema Configuration
  pageSchema: {
    platform_hierarchy: string[]
    template_data: Record<string, Field[]>
  } | null
  setPageSchema: (schema: {
    platform_hierarchy: string[]
    template_data: Record<string, Field[]>
  } | null) => void
  
  // Helpers
  reset: () => void
}

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set) => ({
      platform: null,
      setPlatform: (platform) => set({ platform }),

      availableAccounts: [],
      setAvailableAccounts: (accounts) => set({ availableAccounts: accounts }),

      // New state fields
      all_selected_accounts: [],
      setAllSelectedAccounts: (accounts) => set({ all_selected_accounts: accounts }),
      
      current_active_account: null,
      setCurrentActiveAccount: (account) => set({ current_active_account: account }),
      
      pageSchema: null,
      setPageSchema: (schema) => set({ pageSchema: schema }),

      reset: () => set({ 
        platform: null, 
        availableAccounts: [], 
        all_selected_accounts: [],
        current_active_account: null,
        pageSchema: null
      })
    }),
    {
      name: 'campaign-store', // localStorage key
    }
  )
)
