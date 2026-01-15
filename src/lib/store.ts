import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DSP, Account, Field, Batch, BatchOperation } from './types'

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
  
  // Batch Management
  batch: Batch
  addItemToBatch: (operation: BatchOperation | BatchOperation[]) => void
  removeBatchItem: (operationId: string) => void
  clearBatch: () => void

  // Helpers
  reset: () => void
}

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set) => ({
      platform: null,
      setPlatform: (platform) => set((state) => ({ 
        platform,
        batch: { ...state.batch, platform: platform?.name || "" }
      })),

      availableAccounts: [],
      setAvailableAccounts: (accounts) => set({ availableAccounts: accounts }),

      // New state fields
      all_selected_accounts: [],
      setAllSelectedAccounts: (accounts) => set({ all_selected_accounts: accounts }),
      
      current_active_account: null,
      setCurrentActiveAccount: (account) => set((state) => ({ 
        current_active_account: account,
        batch: { ...state.batch, advertiser_id: account?.id || "" }
      })),
      
      pageSchema: null,
      setPageSchema: (schema) => set({ pageSchema: schema }),

      // Batch
      batch: { 
        id: "1", 
        platform: "",
        advertiser_id: "",
        operations: [], 
        options: { validate_only: false },
        createdAt: new Date(), 
        status: "draft" 
      },
      addItemToBatch: (operation) => set((state) => {
        const { items, ...cleanBatch } = (state.batch || {}) as any
        const currentOperations = cleanBatch.operations || []
        return {
          batch: {
            ...cleanBatch,
            operations: Array.isArray(operation) ? [...currentOperations, ...operation] : [...currentOperations, operation]
          }
        }
      }),
      removeBatchItem: (operationId) => set((state) => {
        const { items, ...cleanBatch } = (state.batch || {}) as any
        return {
          batch: {
            ...cleanBatch,
            operations: (cleanBatch.operations || []).filter((op: any) => op.id !== operationId)
          }
        }
      }),
      clearBatch: () => set((state) => {
        const { items, ...cleanBatch } = (state.batch || {}) as any
        return {
          batch: { ...cleanBatch, operations: [] }
        }
      }),

      reset: () => set({ 
        platform: null, 
        availableAccounts: [], 
        all_selected_accounts: [],
        current_active_account: null,
        pageSchema: null,
        batch: { 
          id: "1", 
          platform: "",
          advertiser_id: "",
          operations: [], 
          options: { validate_only: false },
          createdAt: new Date(), 
          status: "draft" 
        }
      })
    }),
    {
      name: 'campaign-store',
      version: 3, // Bump version to trigger fresh migration
      migrate: (persistedState: any) => {
        if (persistedState?.batch) {
          // Robust cleanup: remove 'items' if they exist, regardless of version
          const { items, ...restOfBatch } = persistedState.batch;
          return {
            ...persistedState,
            batch: restOfBatch
          };
        }
        return persistedState;
      },
    }
  )
)
