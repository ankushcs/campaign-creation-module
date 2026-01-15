"use client"

import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Checkbox } from "../ui/checkbox"
import { Search } from "lucide-react"
import type { Account } from "../../lib/types"
import { useCampaignStore } from "../../lib/store"
import { fetchTableSchema } from "../../lib/config-loader"

type AccountSelectionModalProps = {
  isOpen: boolean
  title?: string
  accounts: Account[]
  platformId: string
  onSelect: () => void
  onBack: () => void
  onClose: () => void
}

export function AccountSelectionModal({
  isOpen,
  title = "Select Account",
  accounts,
  platformId,
  onSelect,
  onBack,
  onClose,
}: AccountSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  
  const { 
    setAllSelectedAccounts, 
    setCurrentActiveAccount,
    setPageSchema
  } = useCampaignStore()

  const filteredAccounts = useMemo(() => {
    return accounts.filter(
      (acc) =>
        acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.id.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [accounts, searchQuery])

  const toggleAccount = (id: string) => {
    const newSelected = new Set(selectedAccounts)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedAccounts(newSelected)
  }

  const handleNext = async () => {
    if (selectedAccounts.size > 0) {
      setIsLoading(true)
      try {
        const accountIds = Array.from(selectedAccounts)
        
        // Transform to account objects with id and name
        const accountObjects = accounts
          .filter(acc => accountIds.includes(acc.id))
          .map(acc => ({ id: acc.id, name: acc.name }))
        
        // Update store with all selected accounts
        setAllSelectedAccounts(accountObjects)
        
        // Set first account as current active account
        if (accountObjects.length > 0) {
          setCurrentActiveAccount(accountObjects[0])
        }
        
        // Fetch table schema from API
        const schema = await fetchTableSchema(platformId, accountIds)
        
        // Store the schema in the store
        setPageSchema(schema)
        
        // Call the original onSelect callback (no args needed)
        onSelect()
      } catch (error) {
        console.error("Error in handleNext:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose one or more accounts to work with
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>

          <div className="max-h-[400px] space-y-2 overflow-y-auto -md border border-border bg-background p-4">
            {filteredAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center space-x-3 -md p-3 hover:bg-accent cursor-pointer transition-colors"
                onClick={() => toggleAccount(account.id)}
              >
                <Checkbox
                  checked={selectedAccounts.has(account.id)}
                  onCheckedChange={() => toggleAccount(account.id)}
                />
                <div className="flex-1">
                  <div className="font-medium text-foreground">{account.name}</div>
                  <div className="text-xs text-muted-foreground">ID: {account.id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={selectedAccounts.size === 0 || isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? "Loading..." : `Next (${selectedAccounts.size} selected)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
