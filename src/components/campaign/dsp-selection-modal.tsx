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
import { Badge } from "@/components/ui/badge"
import type { DSP } from "@/lib/types"

type DSPSelectionModalProps = {
  isOpen: boolean
  dsps: DSP[]
  onSelect: (dspId: string) => void
  onClose: () => void
}

export function DSPSelectionModal({ isOpen, dsps, onSelect, onClose }: DSPSelectionModalProps) {
  const [selectedDSP, setSelectedDSP] = useState<string>("")

  const handleContinue = () => {
    if (selectedDSP) {
      onSelect(selectedDSP)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl">Select DSP</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose the advertising platform you want to work with
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={selectedDSP} onValueChange={setSelectedDSP} className="gap-3">
          {dsps.map((dsp) => (
            <div
              key={dsp.id}
              className={`flex items-center space-x-3 rounded-lg border-2 p-4 transition-colors ${
                dsp.enabled ? "cursor-pointer hover:border-primary" : "cursor-not-allowed opacity-50"
              } ${selectedDSP === dsp.id ? "border-primary bg-accent" : "border-border"}`}
              onClick={() => dsp.enabled && setSelectedDSP(dsp.id)}
            >
              <RadioGroupItem value={dsp.id} id={dsp.id} disabled={!dsp.enabled} />
              <Label
                htmlFor={dsp.id}
                className={`flex flex-1 items-center justify-between ${dsp.enabled ? "cursor-pointer" : "cursor-not-allowed"}`}
              >
                <div>
                  <div className="font-semibold text-foreground">{dsp.name}</div>
                  <div className="text-sm text-muted-foreground">{dsp.description}</div>
                </div>
                {!dsp.enabled && (
                  <Badge variant="secondary" className="ml-2">
                    Coming Soon
                  </Badge>
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedDSP}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
