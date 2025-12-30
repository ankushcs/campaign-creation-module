"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { Field, Campaign, Adset } from "@/lib/types"
import { BulkCreateModal } from "./bulk-create-modal"

type CreateCampaignModalProps = {
  isOpen: boolean
  type: "campaign" | "adset" | "ad"
  fields: Field[]
  defaultTemplate: any
  campaigns: Campaign[]
  adsets: Adset[]
  onAddToBatch: (items: any[], type: "campaign" | "adset" | "ad") => void
  onClose: () => void
}

export function CreateCampaignModal({
  isOpen,
  type,
  fields,
  defaultTemplate,
  campaigns,
  adsets,
  onAddToBatch,
  onClose,
}: CreateCampaignModalProps) {
  const [step, setStep] = useState<"selection" | "entry">("selection")
  const [creationType, setCreationType] = useState<"manual" | "clone">("manual")

  const handleNext = () => {
    setStep("entry")
  }

  const handleBack = () => {
    setStep("selection")
  }

  const handleClose = () => {
    setStep("selection")
    setCreationType("manual")
    onClose()
  }

  if (step === "selection") {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl">Create {type}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Choose how you want to create your {type}
            </DialogDescription>
          </DialogHeader>

          <RadioGroup value={creationType} onValueChange={(v) => setCreationType(v as any)}>
            <div className="space-y-3">
              <div
                className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                  creationType === "manual" ? "border-primary bg-accent" : "border-border hover:border-primary/50"
                }`}
                onClick={() => setCreationType("manual")}
              >
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual" className="cursor-pointer flex-1">
                  <div className="font-semibold text-foreground">Single / Bulk Creation</div>
                  <div className="text-sm text-muted-foreground">Create multiple items in a spreadsheet-style grid</div>
                </Label>
              </div>

              <div
                className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                  creationType === "clone" ? "border-primary bg-accent" : "border-border hover:border-primary/50"
                }`}
                onClick={() => setCreationType("clone")}
              >
                <RadioGroupItem value="clone" id="clone" />
                <Label htmlFor="clone" className="cursor-pointer flex-1">
                  <div className="font-semibold text-foreground">Clone & Remix</div>
                  <div className="text-sm text-muted-foreground">Start from an existing {type} and modify it</div>
                </Label>
              </div>
            </div>
          </RadioGroup>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleNext} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Next
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <BulkCreateModal
      isOpen={step === "entry"}
      type={type}
      creationType={creationType}
      fields={fields}
      defaultTemplate={defaultTemplate}
      campaigns={campaigns}
      adsets={adsets}
      onAddToBatch={onAddToBatch}
      onBack={handleBack}
      onClose={handleClose}
    />
  )
}
