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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Field, Campaign, Adset } from "@/lib/types"
import { Plus, Trash2 } from "lucide-react"

type BulkCreateModalProps = {
  isOpen: boolean
  type: "campaign" | "adset" | "ad"
  creationType: "manual" | "clone"
  fields: Field[]
  defaultTemplate: any
  campaigns: Campaign[]
  adsets: Adset[]
  onAddToBatch: (items: any[], type: "campaign" | "adset" | "ad") => void
  onBack: () => void
  onClose: () => void
}

export function BulkCreateModal({
  isOpen,
  type,
  creationType,
  fields,
  defaultTemplate,
  campaigns,
  adsets,
  onAddToBatch,
  onBack,
  onClose,
}: BulkCreateModalProps) {
  const [rows, setRows] = useState([{ id: "1", ...defaultTemplate }])
  const [selectedCampaign, setSelectedCampaign] = useState("")
  const [cloneOptions, setCloneOptions] = useState({
    objective: false,
    targeting: false,
    budget: false,
  })

  const addRow = () => {
    setRows([...rows, { id: Date.now().toString(), ...defaultTemplate }])
  }

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter((r) => r.id !== id))
    }
  }

  const updateRow = (id: string, field: string, value: any) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  const handleAddToBatch = () => {
    const items = rows.map((row) => ({
      ...row,
      id: `${type}_${Date.now()}_${Math.random()}`,
    }))
    onAddToBatch(items, type)
    setRows([{ id: "1", ...defaultTemplate }])
  }

  const renderFieldCell = (row: any, field: Field) => {
    const value = row[field.id]

    if (field.type === "select" && field.options) {
      return (
        <Select value={value} onValueChange={(newValue) => updateRow(row.id, field.id, newValue)}>
          <SelectTrigger className="h-9 bg-background min-w-[150px]">
            <SelectValue placeholder={`Select ${field.label}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    // Campaign selector for adsets
    if (field.id === "campaign_id" && type === "adset") {
      return (
        <Select value={value} onValueChange={(newValue) => updateRow(row.id, field.id, newValue)}>
          <SelectTrigger className="h-9 bg-background min-w-[150px]">
            <SelectValue placeholder="Select campaign" />
          </SelectTrigger>
          <SelectContent>
            {campaigns.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id}>
                {campaign.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    // Adset selector for ads
    if (field.id === "adset_id" && type === "ad") {
      return (
        <Select value={value} onValueChange={(newValue) => updateRow(row.id, field.id, newValue)}>
          <SelectTrigger className="h-9 bg-background min-w-[150px]">
            <SelectValue placeholder="Select adset" />
          </SelectTrigger>
          <SelectContent>
            {adsets.map((adset) => (
              <SelectItem key={adset.id} value={adset.id}>
                {adset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (field.type === "textarea") {
      return (
        <Textarea
          value={value || ""}
          onChange={(e) => updateRow(row.id, field.id, e.target.value)}
          className="min-w-[200px] h-9 bg-background resize-none"
          placeholder={field.label}
        />
      )
    }

    return (
      <Input
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
        value={value || ""}
        onChange={(e) => updateRow(row.id, field.id, e.target.value)}
        className="h-9 bg-background min-w-[150px]"
        placeholder={field.label}
      />
    )
  }

  // Clone & Remix view
  if (creationType === "clone") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl">Clone & Remix {type}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select an existing {type} and choose what to clone
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Select {type}</Label>
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger className="mt-1.5 bg-background">
                  <SelectValue placeholder={`Choose ${type}...`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Example {type} 1</SelectItem>
                  <SelectItem value="2">Example {type} 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Clone options</Label>
              {Object.entries(cloneOptions).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => setCloneOptions({ ...cloneOptions, [key]: checked as boolean })}
                  />
                  <Label htmlFor={key} className="capitalize text-sm cursor-pointer">
                    {key.replace("_", " ")}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={handleAddToBatch} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Clone & Add to Batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Manual/Bulk creation view with table
  const visibleFields = fields.filter((f) => f.visible)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] sm:w-full sm:h-[90vh] max-w-[95vw] w-full h-[90vh] flex flex-col bg-card p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Bulk Create {type}s</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                Add multiple {type}s at once using the spreadsheet-style editor below
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6">
          <div className="rounded-lg border border-border bg-background">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead className="w-12 sticky left-0 bg-muted z-10">#</TableHead>
                  {visibleFields.map((field) => (
                    <TableHead key={field.id} className="font-semibold text-foreground whitespace-nowrap">
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </TableHead>
                  ))}
                  <TableHead className="w-16 text-center sticky right-0 bg-muted z-10">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, idx) => (
                  <TableRow key={row.id} className="hover:bg-accent/50 text-xs">
                    <TableCell className="font-medium text-muted-foreground sticky left-0 bg-card z-10">
                      {idx + 1}
                    </TableCell>
                    {visibleFields.map((field) => (
                      <TableCell key={field.id} className="p-2">
                        {renderFieldCell(row, field)}
                      </TableCell>
                    ))}
                    <TableCell className="text-center sticky right-0 bg-card z-10">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRow(row.id)}
                        disabled={rows.length === 1}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button variant="outline" onClick={addRow} className="mt-4 w-full bg-transparent border-dashed">
            <Plus className="mr-2 h-4 w-4" />
            Add Row
          </Button>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleAddToBatch} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Add to Batch ({rows.length} {type}
            {rows.length !== 1 ? "s" : ""})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
