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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { Field } from "@/lib/types"

type DefaultTemplateModalProps = {
  isOpen: boolean
  schema: Record<string, { fields: Field[] }>
  defaultTemplate: Record<string, any>
  onSave: (template: Record<string, any>) => void
  onClose: () => void
}

export function DefaultTemplateModal({ isOpen, schema, defaultTemplate, onSave, onClose }: DefaultTemplateModalProps) {
  const [activeTab, setActiveTab] = useState<"campaign" | "adset" | "ad">("campaign")
  const [localSchema, setLocalSchema] = useState(schema)

  const toggleFieldVisibility = (level: string, fieldId: string) => {
    setLocalSchema((prev) => ({
      ...prev,
      [level]: {
        fields: prev[level].fields.map((f) => (f.id === fieldId ? { ...f, visible: !f.visible } : f)),
      },
    }))
  }

  const handleSave = () => {
    // In a real app, this would save to config
    onSave(defaultTemplate)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl">Default Template</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure default fields and visibility for each level
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1">
          <TabsList className="bg-muted">
            <TabsTrigger
              value="campaign"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Campaign
            </TabsTrigger>
            <TabsTrigger
              value="adset"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Adset
            </TabsTrigger>
            <TabsTrigger
              value="ad"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Ad
            </TabsTrigger>
          </TabsList>

          {["campaign", "adset", "ad"].map((level) => (
            <TabsContent key={level} value={level} className="max-h-[50vh] overflow-y-auto space-y-3">
              {localSchema[level]?.fields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
                >
                  <div className="flex-1">
                    <Label className="font-medium text-foreground">{field.label}</Label>
                    <div className="text-sm text-muted-foreground">
                      Type: {field.type} {field.required && "(Required)"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`${level}-${field.id}`} className="text-sm text-muted-foreground w-20 text-right">
                      {field.visible ? "Selected" : "Unselected"}
                    </Label>
                    <Switch
                      id={`${level}-${field.id}`}
                      checked={field.visible}
                      onCheckedChange={() => toggleFieldVisibility(level, field.id)}
                    />
                  </div>
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
