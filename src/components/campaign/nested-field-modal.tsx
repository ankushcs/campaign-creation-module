"use client"

import { useState, useEffect } from "react"
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
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Textarea } from "../ui/textarea"
import { Checkbox } from "../ui/checkbox"
import { ScrollArea } from "../ui/scroll-area"
import { Trash2, Plus, ListPlus } from "lucide-react"
import type { Field } from "../../lib/types"
import { cn } from "../../lib/utils"

type NestedFieldModalProps = {
  isOpen: boolean
  title: string
  description?: string
  schema: Field[]
  initialData: any
  onSave: (data: any) => void
  onClose: () => void
}

export function NestedFieldModal({
  isOpen,
  title,
  description,
  schema,
  initialData,
  onSave,
  onClose,
}: NestedFieldModalProps) {
  const [data, setData] = useState<any>(initialData || {})

  useEffect(() => {
    if (isOpen) {
      setData(initialData || {})
    }
  }, [isOpen, initialData])

  const updateData = (path: string[], value: any) => {
    setData((prev: any) => {
      const newData = { ...prev }
      let current = newData
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {}
        current[path[i]] = { ...current[path[i]] }
        current = current[path[i]]
      }
      current[path[path.length - 1]] = value
      return newData
    })
  }

  const handleArrayAdd = (path: string[], itemSchema: Field[]) => {
    setData((prev: any) => {
      const newData = { ...prev }
      let current = newData
      for (let i = 0; i < path.length; i++) {
        if (!current[path[i]]) current[path[i]] = []
        current[path[i]] = [...current[path[i]]]
        current = current[path[i]]
      }
      
      const newItem: any = {}
      itemSchema.forEach(f => {
        if (f.type === "select" && f.options && f.options.length > 0) {
          newItem[f.id] = f.options[0].value
        } else {
          newItem[f.id] = ""
        }
      })
      
      current.push(newItem)
      return newData
    })
  }

  const handleArrayRemove = (path: string[], index: number) => {
    setData((prev: any) => {
      const newData = { ...prev }
      let current = newData
      for (let i = 0; i < path.length; i++) {
        current[path[i]] = [...current[path[i]]]
        current = current[path[i]]
      }
      current.splice(index, 1)
      return newData
    })
  }

  const renderRecursiveFields = (fields: Field[], path: string[]) => {
    return (
      <div className="space-y-6">
        {fields.map((field) => {
          const fieldPath = [...path, field.id]
          const value = path.reduce((acc, curr) => acc?.[curr], data)?.[field.id]

          if (field.type === "object" && field.schema) {
            return (
              <div key={field.id} className="space-y-3 border-l-2 border-primary/20 pl-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-primary">{field.label}</span>
                </div>
                {renderRecursiveFields(field.schema, fieldPath)}
              </div>
            )
          }

          if (field.type === "array" && field.schema) {
            const arrayItems = value || []
            return (
              <div key={field.id} className="space-y-4 border-l-2 border-orange-500/20 pl-4 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-orange-500">{field.label}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleArrayAdd(fieldPath, field.schema!)}
                    className="h-7 px-2 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add {field.label.slice(0, -1)}
                  </Button>
                </div>
                <div className="space-y-3">
                  {arrayItems.map((_: any, idx: number) => (
                    <div key={idx} className="relative bg-muted/30 p-4 rounded-md border border-border group">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArrayRemove(fieldPath, idx)}
                        className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="grid grid-cols-2 gap-4">
                        {renderRecursiveFields(field.schema!, [...fieldPath, idx.toString()])}
                      </div>
                    </div>
                  ))}
                  {arrayItems.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No items added yet.</p>
                  )}
                </div>
              </div>
            )
          }

          return (
            <div key={field.id} className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">{field.label}</Label>
              {renderInput(field, fieldPath, value)}
            </div>
          )
        })}
      </div>
    )
  }

  const renderInput = (field: Field, path: string[], value: any) => {
    if (field.type === "select" && field.options) {
      return (
        <Select 
          value={value?.toString() || ""} 
          onValueChange={(val) => updateData(path, val)}
        >
          <SelectTrigger className="h-9 bg-background">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((opt) => (
              <SelectItem key={opt.value.toString()} value={opt.value.toString()}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (field.type === "multi-select" && field.options) {
      const selectedValues = Array.isArray(value) ? value : []
      const toggleValue = (val: string | number) => {
        if (selectedValues.includes(val)) {
          updateData(path, selectedValues.filter(v => v !== val))
        } else {
          updateData(path, [...selectedValues, val])
        }
      }

      return (
        <div className="flex flex-wrap gap-2 p-2 rounded-md border border-input bg-background min-h-[40px]">
          {field.options.map((opt) => (
            <div 
              key={opt.value.toString()}
              onClick={() => toggleValue(opt.value)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded text-xs cursor-pointer transition-colors border",
                selectedValues.includes(opt.value)
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-muted border-transparent text-muted-foreground hover:border-border"
              )}
            >
              <Checkbox 
                checked={selectedValues.includes(opt.value)}
                className="h-3 w-3 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              {opt.label}
            </div>
          ))}
        </div>
      )
    }

    if (field.type === "textarea") {
      return (
        <Textarea
          value={value || ""}
          onChange={(e) => updateData(path, e.target.value)}
          className="h-20 bg-background"
        />
      )
    }

    return (
      <Input
        type={field.type === "number" ? "number" : "text"}
        value={value || ""}
        onChange={(e) => updateData(path, e.target.value)}
        className="h-9 bg-background"
      />
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-card">
        <DialogHeader className="p-6 border-b border-border bg-muted/30">
          <DialogTitle className="text-xl flex items-center gap-2">
            <ListPlus className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          {renderRecursiveFields(schema, [])}
        </ScrollArea>

        <DialogFooter className="p-4 border-t border-border bg-muted/30">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(data)} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[100px]">
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
