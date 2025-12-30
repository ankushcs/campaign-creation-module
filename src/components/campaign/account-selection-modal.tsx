"use client"

import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Search } from "lucide-react"
import type { Account } from "@/lib/types"

type AccountSelectionModalProps = {
  isOpen: boolean
  accounts: Account[]
  onSelect: (accountIds: string[]) => void
  onBack: () => void
  onClose: () => void
}

export function AccountSelectionModal({
  isOpen,
  accounts,
  onSelect,
  onBack,
  onClose,
}: AccountSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set())

  const filteredAccounts = useMemo(() => {
    return accounts.filter(
      (acc) =>
        acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.industry.toLowerCase().includes(searchQuery.toLowerCase()),
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

  const handleNext = () => {
    if (selectedAccounts.size > 0) {
      onSelect(Array.from(selectedAccounts))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl">Select Account</DialogTitle>
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

          <div className="max-h-[400px] space-y-2 overflow-y-auto rounded-md border border-border bg-background p-4">
            {filteredAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center space-x-3 rounded-md p-3 hover:bg-accent cursor-pointer transition-colors"
                onClick={() => toggleAccount(account.id)}
              >
                <Checkbox
                  checked={selectedAccounts.has(account.id)}
                  onCheckedChange={() => toggleAccount(account.id)}
                />
                <div className="flex-1">
                  <div className="font-medium text-foreground">{account.name}</div>
                  <div className="text-sm text-muted-foreground">{account.industry}</div>
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
            disabled={selectedAccounts.size === 0}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Next ({selectedAccounts.size} selected)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
