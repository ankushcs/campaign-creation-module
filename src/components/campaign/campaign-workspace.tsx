"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Settings, Plus, ChevronDown, Edit2, RefreshCw, Upload } from "lucide-react"
import type { Campaign, Adset, Ad, Field, Batch, BatchItem, Account } from "../../lib/types"
import { DataTable } from "./data-table"
import { BatchPanel } from "./batch-panel"
import { DefaultTemplateModal } from "./default-template-modal"
import { ReviewBatchModal } from "./review-batch-modal"
import { CreateCampaignModal } from "./create-campaign-modal"
import { BulkEditModal } from "./bulk-edit-modal"
import { loadTableSchema, loadDefaultTemplate, loadMockCampaigns } from "../../lib/config-loader"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { useCampaignStore } from "../../lib/store"
import { AccountSwitchModal } from "./account-switch-modal"
import { CreativeUploadModal } from "./creative-upload-modal"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { FilterBar, type Filters } from "./filter-bar"
import { BulkEditChoiceModal } from "./bulk-edit-choice-modal"
import { MultiColumnEditModal } from "./multi-column-edit-modal"

type CampaignWorkspaceProps = {
  dspId: string
  dspName: string
  account: Account
  allAccounts: Account[]
}
const GROUP_COLORS = ["bg-blue-50", "bg-green-50", "bg-purple-50", "bg-orange-50", "bg-pink-50", "bg-yellow-50"]

let colorIndex = 0

export function CampaignWorkspace({ dspId, dspName, account: initialAccount, allAccounts }: CampaignWorkspaceProps) {
  // Get data from global store
  const { 
    all_selected_accounts,
    current_active_account,
    setCurrentActiveAccount,
    pageSchema,
    setPageSchema
  } = useCampaignStore()
  
  // Derived hierarchy labels (pluralized for tabs)
  const hierarchy = pageSchema?.platform_hierarchy || ["Campaign", "Ad Set", "Ad"]
  const levelLabels = {
    campaign: hierarchy[0] || "Campaign",
    adset: hierarchy[1] || "Ad Set",
    ad: hierarchy[2] || "Ad"
  }
  
  const [activeTab, setActiveTab] = useState<"campaigns" | "adsets" | "ads">("campaigns")
  // Use current_active_account from store if available, otherwise fallback to initialAccount
  const [currentAccount, setCurrentAccount] = useState<Account>(current_active_account || initialAccount)
  const [schema, setSchema] = useState<Record<string, Field[]>>({})
  const [defaultTemplate, setDefaultTemplate] = useState<Record<string, any>>({})
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [adsets, setAdsets] = useState<Adset[]>([])
  const [ads, setAds] = useState<Ad[]>([])
  const [batch, setBatch] = useState<Batch>({ id: "1", items: [], createdAt: new Date(), status: "draft" })
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createModalType, setCreateModalType] = useState<"campaign" | "adset" | "ad">("campaign")
  const [showBulkEditModal, setShowBulkEditModal] = useState(false)
  const [showBulkEditChoiceModal, setShowBulkEditChoiceModal] = useState(false)
  const [showMultiColumnEditModal, setShowMultiColumnEditModal] = useState(false)
  const [showCreativeUploadModal, setShowCreativeUploadModal] = useState(false)
  
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [showAccountSwitchModal, setShowAccountSwitchModal] = useState(false)
  const [, setIsAccountSwitcherOpen] = useState(false)

  const [fetchingType, setFetchingType] = useState<"campaign" | "adset" | "ad" | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "all",
    objective: "all",
    optimization_goal: "all",
    creative_type: "all"
  })



  useEffect(() => {
    // Log store data for debugging
    console.log('Store data:', { all_selected_accounts, current_active_account });
    
    // Sync currentAccount with store when it changes
    if (current_active_account && current_active_account.id !== currentAccount.id) {
      setCurrentAccount(current_active_account);
    }
  }, [all_selected_accounts, current_active_account]);

  useEffect(() => {
    loadTableSchema(dspId).then(setSchema)
    loadDefaultTemplate(dspId).then(setDefaultTemplate)
    // Only load data if it's the initial account (simulating data ownership)
    if (currentAccount.id === "adv_1") {
      loadMockCampaigns().then((data) => {
        setCampaigns(data.campaigns || [])
        setAdsets(data.adsets || [])
        setAds(data.ads || [])
      })
    } else {
      setCampaigns([])
      setAdsets([])
      setAds([])
    }
  }, [dspId, currentAccount.id])

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const getFilteredData = (data: any[], type: "campaign" | "adset" | "ad") => {
    return data.filter(item => {
      // Search Filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchName = item.name?.toLowerCase().includes(searchTerm)
        const matchId = item.id?.toLowerCase().includes(searchTerm)
        if (!matchName && !matchId) return false
      }

      // Status Filter
      if (filters.status !== "all" && item.status !== filters.status) {
        return false
      }

      // Level Specific Filters
      if (type === "campaign" && filters.objective !== "all" && item.objective !== filters.objective) return false
      if (type === "adset" && filters.optimization_goal !== "all" && item.optimization_goal !== filters.optimization_goal) return false
      if (type === "ad" && filters.creative_type !== "all" && item.creative_type !== filters.creative_type) return false

      return true
    })
  }

  const handleAccountChange = (accountId: string) => {
    // Use all_selected_accounts from store instead of allAccounts prop
    const accountsToSearch = all_selected_accounts.length > 0 ? all_selected_accounts : allAccounts
    const account = accountsToSearch.find((a) => a.id === accountId)
    if (account) {
      setCurrentAccount(account)
      // Update global store
      setCurrentActiveAccount(account)
      setIsAccountSwitcherOpen(false)
    }
  }

  const handleFetch = async (type: "campaign" | "adset" | "ad", count: number | "all") => {
    setFetchingType(type)
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      const { loadDemoFetchData } = await import("../../lib/config-loader")
      const data = await loadDemoFetchData()
      
      if (type === "campaign") {
        let newItems = data.campaigns || []
        if (count !== "all") newItems = newItems.slice(0, count)
        setCampaigns(prev => [...prev, ...newItems])
      } else if (type === "adset") {
        let newItems = data.adsets || []
        if (count !== "all") newItems = newItems.slice(0, count)
        setAdsets(prev => [...prev, ...newItems])
      } else {
        let newItems = data.ads || []
        if (count !== "all") newItems = newItems.slice(0, count)
        setAds(prev => [...prev, ...newItems])
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setFetchingType(null)
    }
  }

  const handleRefresh = async () => {
    if (campaigns.length === 0 && adsets.length === 0 && ads.length === 0) return

    setIsRefreshing(true)
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      const { loadDemoFetchData } = await import("../../lib/config-loader")
      const data = await loadDemoFetchData()
      
      // Refresh Campaigns
      if (campaigns.length > 0) {
        const count = campaigns.length
        let newItems = data.campaigns || []
        newItems = newItems.slice(0, count)
        setCampaigns(newItems)
      }

      // Refresh Adsets
      if (adsets.length > 0) {
        const count = adsets.length
        let newItems = data.adsets || []
        newItems = newItems.slice(0, count)
        setAdsets(newItems)
      }

      // Refresh Ads
      if (ads.length > 0) {
        const count = ads.length
        let newItems = data.ads || []
        newItems = newItems.slice(0, count)
        setAds(newItems)
      }

    } catch (error) {
      console.error("Failed to refresh data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDuplicate = (id: string, type: "campaign" | "adset" | "ad") => {
    const timestamp = Date.now()
    if (type === "campaign") {
      const item = campaigns.find(c => c.id === id)
      if (item) {
        setCampaigns(prev => [...prev, { ...item, id: `cmp_copy_${timestamp}`, name: `${item.name} (Copy)`, _edited: true }])
      }
    } else if (type === "adset") {
      const item = adsets.find(a => a.id === id)
      if (item) {
        setAdsets(prev => [...prev, { ...item, id: `ads_copy_${timestamp}`, name: `${item.name} (Copy)`, _edited: true }])
      }
    } else {
      const item = ads.find(a => a.id === id)
      if (item) {
        setAds(prev => [...prev, { ...item, id: `ad_copy_${timestamp}`, name: `${item.name} (Copy)`, _edited: true }])
      }
    }
  }

  const handlePause = (id: string, type: "campaign" | "adset" | "ad") => {
    const toggleStatus = (status: string) => status === "ACTIVE" ? "PAUSED" : "ACTIVE"

    if (type === "campaign") {
      setCampaigns(prev => prev.map(item => item.id === id ? { ...item, status: toggleStatus(item.status), _edited: true } : item))
    } else if (type === "adset") {
      setAdsets(prev => prev.map(item => item.id === id ? { ...item, status: toggleStatus(item.status), _edited: true } : item))
    } else {
      setAds(prev => prev.map(item => item.id === id ? { ...item, status: toggleStatus(item.status), _edited: true } : item))
    }
  }

  const handleDelete = (id: string, type: "campaign" | "adset" | "ad") => {
    if (type === "campaign") {
      setCampaigns(prev => prev.filter(item => item.id !== id))
    } else if (type === "adset") {
      setAdsets(prev => prev.filter(item => item.id !== id))
    } else {
      setAds(prev => prev.filter(item => item.id !== id))
    }
  }

  const handleCreateClick = (type: "campaign" | "adset" | "ad") => {
    setCreateModalType(type)
    setShowCreateModal(true)
  }

  const handleCreateBatch = (items: any[], type: "campaign" | "adset" | "ad") => {
    const groupColor = GROUP_COLORS[colorIndex % GROUP_COLORS.length]
    colorIndex++

    const batchItems: BatchItem[] = items.map((item) => ({
      id: `batch_${Date.now()}_${Math.random()}`,
      type,
      action: "create",
      data: { ...item, _draft: true, _groupColor: groupColor },
      validationStatus: "pending",
    }))

    setBatch((prev) => ({
      ...prev,
      items: [...prev.items, ...batchItems],
    }))

    // Add to respective state with draft flag
    if (type === "campaign") {
      setCampaigns((prev) => [...prev, ...items.map((item) => ({ ...item, _draft: true, _groupColor: groupColor }))])
    } else if (type === "adset") {
      setAdsets((prev) => [...prev, ...items.map((item) => ({ ...item, _draft: true, _groupColor: groupColor }))])
    } else {
      setAds((prev) => [...prev, ...items.map((item) => ({ ...item, _draft: true, _groupColor: groupColor }))])
    }

    setShowCreateModal(false)
  }

  const handleCellEdit = (id: string, field: string, value: any, type: "campaign" | "adset" | "ad") => {
    if (type === "campaign") {
      setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value, _edited: true } : c)))
    } else if (type === "adset") {
      setAdsets((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value, _edited: true } : a)))
    } else {
      setAds((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value, _edited: true } : a)))
    }
  }

  const handleBulkEditClick = () => {
    setShowBulkEditChoiceModal(true)
  }

  const handleBulkEditChoice = (mode: "single" | "multi") => {
    setShowBulkEditChoiceModal(false)
    if (mode === "single") {
      setShowBulkEditModal(true)
    } else {
      setShowMultiColumnEditModal(true)
    }
  }

  const handleMultiColumnSave = (updatedItems: any[], type: "campaign" | "adset" | "ad") => {
    // Update local state
    if (type === "campaign") {
      setCampaigns(prev => prev.map(item => {
        const updated = updatedItems.find(u => u.id === item.id)
        return updated ? updated : item
      }))
    } else if (type === "adset") {
      setAdsets(prev => prev.map(item => {
        const updated = updatedItems.find(u => u.id === item.id)
        return updated ? updated : item
      }))
    } else {
      setAds(prev => prev.map(item => {
        const updated = updatedItems.find(u => u.id === item.id)
        return updated ? updated : item
      }))
    }

    // Add to batch as updates
    const updateBatchItems: BatchItem[] = updatedItems.map((item) => ({
      id: `batch_update_${item.id}_${Date.now()}`,
      type,
      action: "update",
      data: item,
      validationStatus: "pending"
    }))

    setBatch(prev => ({
      ...prev,
      items: [...prev.items, ...updateBatchItems]
    }))

    setShowMultiColumnEditModal(false)
    setSelectedRows(new Set())
  }

  const handleBulkEdit = (field: string, value: any, type: "campaign" | "adset" | "ad") => {
    const idsToUpdate = Array.from(selectedRows)

    if (type === "campaign") {
      setCampaigns((prev) =>
        prev.map((c) => (idsToUpdate.includes(c.id) ? { ...c, [field]: value, _edited: true } : c)),
      )
    } else if (type === "adset") {
      setAdsets((prev) => prev.map((a) => (idsToUpdate.includes(a.id) ? { ...a, [field]: value, _edited: true } : a)))
    } else {
      setAds((prev) => prev.map((a) => (idsToUpdate.includes(a.id) ? { ...a, [field]: value, _edited: true } : a)))
    }

    setShowBulkEditModal(false)
    setSelectedRows(new Set())
  }

  const visibleFields = (schema[activeTab === "campaigns" ? "campaign" : activeTab === "adsets" ? "adset" : "ad"] || []).filter((f) => f.isActive)

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge className="bg-primary text-primary-foreground">{dspName}</Badge>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-foreground">
                {currentAccount?.name || "Select Account"}
              </span>
              
              {/* Account Switcher Modal Trigger */}
              {all_selected_accounts?.length > 1 && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full hover:bg-accent"
                    aria-label="Switch account"
                    onClick={() => setShowAccountSwitchModal(true)}
                  >
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <AccountSwitchModal
                    isOpen={showAccountSwitchModal}
                    onClose={() => setShowAccountSwitchModal(false)}
                    accounts={all_selected_accounts}
                    currentAccountId={currentAccount.id}
                    onSelect={handleAccountChange}
                  />
                </>
              )}
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowTemplateModal(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="border-b border-border bg-card px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <Button
                onClick={() => handleCreateClick("campaign")}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create {levelLabels.campaign}
              </Button>
              {hierarchy[1] && (
                <Button
                  onClick={() => handleCreateClick("adset")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add {levelLabels.adset}
                </Button>
              )}
              {hierarchy[2] && (
                <Button
                  onClick={() => handleCreateClick("ad")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add {levelLabels.ad}
                </Button>
              )}
            </div>

            <div className="h-6 w-px bg-border mx-1" />

            <Button
              variant="outline"
              onClick={() => setShowCreativeUploadModal(true)}
              className="border-primary text-primary hover:bg-primary/5"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Creative
            </Button>
          </div>

          <div className="flex gap-2">
            {(campaigns.length > 0 || adsets.length > 0 || ads.length > 0) && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing || !!fetchingType}
                className={isRefreshing ? "animate-spin" : ""}
                title="Refresh data"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={!!fetchingType}>
                  {fetchingType === "campaign" ? "Fetching..." : `Fetch ${levelLabels.campaign}`} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleRefresh()}>
                  Fetch {levelLabels.campaign}s
                </DropdownMenuItem>
                {hierarchy[1] && (
                  <DropdownMenuItem onClick={() => handleRefresh()}>
                    Fetch {levelLabels.adset}s
                  </DropdownMenuItem>
                )}
                {hierarchy[2] && (
                  <DropdownMenuItem onClick={() => handleRefresh()}>
                    Fetch {levelLabels.ad}s
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Keeping Fetch Adset/Ad for backward compatibility if needed, but the main dynamic one is above */}
            {hierarchy[1] && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={!!fetchingType}>
                    {fetchingType === "adset" ? "Fetching..." : `Fetch ${levelLabels.adset}`} <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleFetch("adset", 20)}>Fetch last 20</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFetch("adset", 50)}>Fetch last 50</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFetch("adset", "all")}>Fetch all</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {hierarchy[2] && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={!!fetchingType}>
                    {fetchingType === "ad" ? "Fetching..." : `Fetch ${levelLabels.ad}`} <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleFetch("ad", 20)}>Fetch last 20</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFetch("ad", 50)}>Fetch last 50</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFetch("ad", "all")}>Fetch all</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {selectedRows.size > 0 && (
              <Button variant="outline" onClick={handleBulkEditClick}>
                Bulk Edit ({selectedRows.size})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs and Table */}
      <div className="flex-1 overflow-hidden px-6 py-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full flex flex-col">
          <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-8">
            <TabsTrigger
              value="campaigns"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-3 text-sm font-medium transition-colors"
            >
              {levelLabels.campaign}s
            </TabsTrigger>
            {hierarchy[1] && (
              <TabsTrigger
                value="adsets"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-3 text-sm font-medium transition-colors"
              >
                {levelLabels.adset}s
              </TabsTrigger>
            )}
            {hierarchy[2] && (
              <TabsTrigger
                value="ads"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-3 text-sm font-medium transition-colors"
              >
                {levelLabels.ad}s
              </TabsTrigger>
            )}
          </TabsList>

          <div className="flex-1 overflow-hidden py-4 space-y-4">
            <FilterBar
              type={activeTab === "campaigns" ? "campaign" : activeTab === "adsets" ? "adset" : "ad"}
              filters={filters}
              onFilterChange={handleFilterChange}
            />

            <div className="flex-1 overflow-hidden h-[calc(100%-60px)]">
              <TabsContent value="campaigns" className="h-full m-0">
                <DataTable
                  data={getFilteredData(campaigns, "campaign")}
                  fields={visibleFields}
                  onCellEdit={(id, field, value) => handleCellEdit(id, field, value, "campaign")}
                  selectedRows={selectedRows}
                  onSelectionChange={setSelectedRows}
                  onDuplicate={(id) => handleDuplicate(id, "campaign")}
                  onPause={(id) => handlePause(id, "campaign")}
                  onDelete={(id) => handleDelete(id, "campaign")}
                  isLoading={fetchingType === "campaign"}
                />
              </TabsContent>
              {hierarchy[1] && (
                <TabsContent value="adsets" className="h-full m-0">
                  <DataTable
                    data={getFilteredData(adsets, "adset")}
                    fields={visibleFields}
                    onCellEdit={(id, field, value) => handleCellEdit(id, field, value, "adset")}
                    selectedRows={selectedRows}
                    onSelectionChange={setSelectedRows}
                    onDuplicate={(id) => handleDuplicate(id, "adset")}
                    onPause={(id) => handlePause(id, "adset")}
                    onDelete={(id) => handleDelete(id, "adset")}
                    isLoading={fetchingType === "adset"}
                  />
                </TabsContent>
              )}
              {hierarchy[2] && (
                <TabsContent value="ads" className="h-full m-0">
                  <DataTable
                    data={getFilteredData(ads, "ad")}
                    fields={visibleFields}
                    onCellEdit={(id, field, value) => handleCellEdit(id, field, value, "ad")}
                    selectedRows={selectedRows}
                    onSelectionChange={setSelectedRows}
                    onDuplicate={(id) => handleDuplicate(id, "ad")}
                    onPause={(id) => handlePause(id, "ad")}
                    onDelete={(id) => handleDelete(id, "ad")}
                    isLoading={fetchingType === "ad"}
                  />
                </TabsContent>
              )}
            </div>
          </div>
        </Tabs>
      </div>

      {/* Batch Panel */}
      <BatchPanel batch={batch} onReview={() => setShowReviewModal(true)} />

      {/* Modals */}
      {showTemplateModal && (
        <DefaultTemplateModal
          isOpen={showTemplateModal}
          schema={pageSchema?.template_data || schema}
          onSave={(newTemplate) => {
            setSchema(newTemplate)
            if (pageSchema) {
              setPageSchema({
                ...pageSchema,
                template_data: newTemplate
              })
            }
            setShowTemplateModal(false)
          }}
          onClose={() => setShowTemplateModal(false)}
        />
      )}

      {showReviewModal && (
        <ReviewBatchModal
          isOpen={showReviewModal}
          batch={batch}
          onClose={() => setShowReviewModal(false)}
          onPublish={() => {
            // Handle publish
            setShowReviewModal(false)
          }}
        />
      )}

      {showCreateModal && (
        <CreateCampaignModal
          isOpen={showCreateModal}
          type={createModalType}
          fields={(pageSchema?.template_data || schema)[createModalType] || []}
          defaultTemplate={defaultTemplate[createModalType] || {}}
          campaigns={campaigns}
          adsets={adsets}
          onAddToBatch={handleCreateBatch}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showBulkEditModal && (
        <BulkEditModal
          isOpen={showBulkEditModal}
          type={activeTab === "campaigns" ? "campaign" : activeTab === "adsets" ? "adset" : "ad"}
          fields={visibleFields}
          selectedCount={selectedRows.size}
          onApply={handleBulkEdit}
          onClose={() => setShowBulkEditModal(false)}
        />
      )}

      {showBulkEditChoiceModal && (
        <BulkEditChoiceModal
          isOpen={showBulkEditChoiceModal}
          onSelect={handleBulkEditChoice}
          onClose={() => setShowBulkEditChoiceModal(false)}
        />
      )}

      {showMultiColumnEditModal && (
        <MultiColumnEditModal
          isOpen={showMultiColumnEditModal}
          type={activeTab === "campaigns" ? "campaign" : activeTab === "adsets" ? "adset" : "ad"}
          fields={schema[activeTab === "campaigns" ? "campaign" : activeTab === "adsets" ? "adset" : "ad"] || []}
          initialData={(activeTab === "campaigns" ? campaigns : activeTab === "adsets" ? adsets : ads).filter(i => selectedRows.has(i.id))}
          onApply={handleMultiColumnSave}
          onClose={() => setShowMultiColumnEditModal(false)}
        />
      )}

      {/* Creative Upload Modal */}
      <CreativeUploadModal
        isOpen={showCreativeUploadModal}
        onClose={() => setShowCreativeUploadModal(false)}
        onUpload={(data) => console.log("Creative uploaded:", data)}
      />
    </div>
  )
}
