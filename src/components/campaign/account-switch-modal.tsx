"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Label } from "../ui/label"

interface AccountSwitchModalProps {
  isOpen: boolean
  onClose: () => void
  accounts: Array<{ id: string; name: string }>
  currentAccountId: string
  onSelect: (accountId: string) => void
}

export function AccountSwitchModal({
  isOpen,
  onClose,
  accounts,
  currentAccountId,
  onSelect,
}: AccountSwitchModalProps) {
  const [selectedId, setSelectedId] = React.useState(currentAccountId)

  React.useEffect(() => {
    setSelectedId(currentAccountId)
  }, [currentAccountId, isOpen])

  const handleSave = () => {
    onSelect(selectedId)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Switch Account</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup
            value={selectedId}
            onValueChange={setSelectedId}
            className="flex flex-col gap-4"
          >
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center space-x-3 rounded-md border p-3 hover:bg-accent cursor-pointer transition-colors"
                onClick={() => setSelectedId(account.id)}
              >
                <RadioGroupItem value={account.id} id={account.id} />
                <Label
                  htmlFor={account.id}
                  className="flex-1 cursor-pointer font-medium"
                >
                  {account.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Switch Account</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
