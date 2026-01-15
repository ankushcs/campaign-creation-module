"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Switch } from "../ui/switch"
import { Label } from "../ui/label"
import type { Field } from "../../lib/types"
import { cn } from "../../lib/utils"
import { ScrollArea } from "../ui/scroll-area"

type DefaultTemplateModalProps = {
  isOpen: boolean
  schema: Record<string, Field[]>
  onSave: (template: Record<string, Field[]>) => void
  onClose: () => void
}

export function DefaultTemplateModal({ isOpen, schema, onSave, onClose }: DefaultTemplateModalProps) {
  const [localSchema, setLocalSchema] = useState(schema)
  const [hasChanges, setHasChanges] = useState(false)
  const levels = Object.keys(schema)
  const [activeTab, setActiveTab] = useState(levels[0] || "campaign")

  const toggleFieldVisibility = (level: string, fieldId: string) => {
    setLocalSchema((prev) => ({
      ...prev,
      [level]: prev[level].map((f) => {
        if (f.id === fieldId) {
          if (f.required && !f.editable) return f
          setHasChanges(true)
          return { ...f, isActive: !f.isActive }
        }
        return f
      }),
    }))
  }

  const handleSave = () => {
    onSave(localSchema)
  }

  const isFieldMandatory = (field: Field) => {
    return field.required && !field.editable
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-6 bg-card gap-0">
        <DialogHeader className="pb-4 shrink-0">
          <DialogTitle className="text-xl">Default Template</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure default fields and visibility for each level. Fields that are required and not editable are automatically included.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <TabsList className="bg-muted w-full justify-start overflow-x-auto shrink-0 mb-4">
            {levels.map((level) => (
              <TabsTrigger
                key={level}
                value={level}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground capitalize"
              >
                {level}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="flex-1 min-h-0 pr-4">
            <div className="py-2 space-y-3">
              {levels.map((level) => (
                <TabsContent key={level} value={level} className="space-y-3 m-0 outline-none">
                  {localSchema[level]?.map((field) => {
                    const mandatory = isFieldMandatory(field)
                    const isChecked = mandatory ? true : field.isActive

                    return (
                      <div
                        key={field.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-background p-4 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1 pr-4">
                          <Label className="font-medium text-foreground text-sm cursor-pointer" htmlFor={`${level}-${field.id}`}>
                            {field.label}
                          </Label>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <Label 
                            htmlFor={`${level}-${field.id}`} 
                            className={cn(
                              "text-sm w-20 text-right cursor-pointer",
                              isChecked ? "text-primary font-semibold" : "text-muted-foreground font-normal"
                            )}
                          >
                            {isChecked ? "Selected" : "Unselected"}
                          </Label>
                          <Switch
                            id={`${level}-${field.id}`}
                            checked={isChecked}
                            disabled={mandatory}
                            onCheckedChange={() => toggleFieldVisibility(level, field.id)}
                            className="data-[state=checked]:bg-primary"
                          />
                        </div>
                      </div>
                    )
                  })}
                </TabsContent>
              ))}
            </div>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="mt-4 pt-4 border-t shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges}
            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
