import { useState } from "react"
import { v4 as uuidv4 } from 'uuid'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import type { Field, Campaign, Adset, BatchOperation } from "../../lib/types"
import { Plus, Trash2, Settings2, X, Copy, AlertCircle } from "lucide-react"
import { NestedFieldModal } from "./nested-field-modal"
import { cn } from "../../lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

type BulkCreateModalProps = {
  isOpen: boolean
  type: "campaign" | "adset" | "ad"
  creationType: "manual" | "clone"
  fields: Field[]
  defaultTemplate: any
  campaigns: Campaign[]
  adsets: Adset[]
  batchOperations: BatchOperation[]
  onAddToBatch: (operations: BatchOperation[]) => void
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
  batchOperations,
  onAddToBatch,
  onBack,
  onClose,
}: BulkCreateModalProps) {
  const visibleFields = fields.filter((f) => f.isActive)

  const getInitialRow = (id: string) => {
    const row: any = { id }
    visibleFields.forEach((field) => {
      if (field.type === "select" && field.options && field.options.length > 0) {
        row[field.id] = defaultTemplate[field.id] || field.options[0].value
      } else {
        row[field.id] = ""
      }
    })
    return row
  }

  const [rows, setRows] = useState(() => [getInitialRow("1")])
  const [errors, setErrors] = useState<Record<string, Record<string, boolean>>>({})
  const [selectedCampaign, setSelectedCampaign] = useState("")
  const [cloneOptions, setCloneOptions] = useState({
    objective: false,
    targeting: false,
    budget: false,
  })

  // Nested Modal State
  const [nestedModal, setNestedModal] = useState<{
    isOpen: boolean
    rowId: string | null
    field: Field | null
  }>({
    isOpen: false,
    rowId: null,
    field: null,
  })

  const openNestedModal = (rowId: string, field: Field) => {
    setNestedModal({
      isOpen: true,
      rowId,
      field,
    })
  }

  const handleNestedSave = (nestedData: any) => {
    if (nestedModal.rowId && nestedModal.field) {
      updateRow(nestedModal.rowId, nestedModal.field.id, nestedData)
    }
    setNestedModal({ isOpen: false, rowId: null, field: null })
  }

  const addRow = () => {
    setRows([...rows, getInitialRow(uuidv4())])
  }

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter((r) => r.id !== id))
      const newErrors = { ...errors }
      delete newErrors[id]
      setErrors(newErrors)
    }
  }

  const duplicateRow = (id: string) => {
    const rowToClone = rows.find(r => r.id === id)
    if (rowToClone) {
      const newRow = { ...rowToClone, id: uuidv4() }
      setRows([...rows, newRow])
    }
  }

  const updateRow = (id: string, fieldId: string, value: any) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, [fieldId]: value } : r)))
    
    // Clear error if value is provided
    if (value && errors[id]?.[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [id]: { ...prev[id], [fieldId]: false }
      }))
    }
  }

  const [duplicateWarning, setDuplicateWarning] = useState(false)

  const handleAddToBatch = () => {
    // 1. Validation for required fields
    const newErrors: Record<string, Record<string, boolean>> = {}
    let hasErrors = false

    rows.forEach(row => {
      const rowErrors: Record<string, boolean> = {}
      visibleFields.forEach(field => {
        if (field.required) {
          const val = row[field.id]
          if (!val || (typeof val === 'object' && Object.keys(val).length === 0)) {
            rowErrors[field.id] = true
            hasErrors = true
          }
        }
      })
      if (Object.keys(rowErrors).length > 0) {
        newErrors[row.id] = rowErrors
      }
    })

    if (hasErrors) {
      setErrors(newErrors)
      return
    }

    // 2. Filter out truly empty rows (though validation might have caught most)
    const nonEmptyRows = rows.filter(row => {
      return visibleFields.some(f => {
        const val = row[f.id]
        if (!val) return false
        if (f.type === 'select' && val === defaultTemplate[f.id]) return false
        if (f.type === 'object' || f.type === 'array') return Object.keys(val).length > 0
        return true
      })
    })

    if (nonEmptyRows.length === 0) {
      onClose()
      return
    }

    // 3. Check for duplicates
    const rowHashes = nonEmptyRows.map(r => {
      const { id, ...data } = r
      return JSON.stringify(data)
    })
    const hasDuplicates = new Set(rowHashes).size !== rowHashes.length

    if (hasDuplicates && !duplicateWarning) {
      setDuplicateWarning(true)
      return
    }

    // 4. Transform to BatchOperation structure
    const operations: BatchOperation[] = nonEmptyRows.map((row) => {
      const { id, ...data } = row
      const opId = uuidv4()
      const clientId = `temp_${type}_${idx_to_name_hash(row.name)}_${Date.now()}`

      let parentRef = undefined
      if (type === "adset" && row.campaign_id) {
        const isFromBatch = batchOperations.some(op => op.client_id === row.campaign_id || op.id === row.campaign_id)
        parentRef = {
          type: isFromBatch ? "client_id" : "platform_id",
          value: row.campaign_id
        } as const
      } else if (type === "ad" && row.adset_id) {
        const isFromBatch = batchOperations.some(op => op.client_id === row.adset_id || op.id === row.adset_id)
        parentRef = {
          type: isFromBatch ? "client_id" : "platform_id",
          value: row.adset_id
        } as const
      }

      return {
        operation_id: opId,
        operation_type: "create",
        entity_type: type,
        client_id: clientId,
        parent_ref: parentRef,
        data: data,
        id: uuidv4(), // internal storage ID
        validationStatus: "pending",
        _groupColor: (data as any)._groupColor
      }
    })

    onAddToBatch(operations)
    setRows([getInitialRow(uuidv4())])
    setDuplicateWarning(false)
    setErrors({})
    onClose()
  }

  const idx_to_name_hash = (name: string) => {
    return name?.toLowerCase().replace(/\s+/g, '_').slice(0, 10) || 'entity'
  }

  const renderFieldCell = (row: any, field: Field) => {
    const value = row[field.id]
    const hasError = errors[row.id]?.[field.id]

    const errorWrapper = (children: React.ReactNode) => (
      <div className="relative group">
        {children}
        {hasError && (
          <div className="absolute -right-1 -top-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-destructive text-destructive-foreground rounded-full p-0.5">
                    <AlertCircle className="h-3 w-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">{field.label} is required</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    )

    if (field.type === "select" && field.options) {
      return errorWrapper(
        <Select value={value?.toString()} onValueChange={(newValue) => updateRow(row.id, field.id, newValue)}>
          <SelectTrigger className={cn(
            "h-9 bg-background min-w-[150px]",
            hasError && "border-destructive ring-destructive"
          )}>
            <SelectValue placeholder={`Select ${field.label}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option.value.toString()} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (field.type === "object" || field.type === "array" || field.type === "multi-select") {
      const displayValue = getFieldSummary(value, field)
      return errorWrapper(
        <div className="flex items-center gap-2 min-w-[200px]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openNestedModal(row.id, field)}
            className={cn(
              "h-8 flex-1 justify-start px-2 font-normal overflow-hidden text-ellipsis whitespace-nowrap text-xs",
              value ? "text-primary border-primary/30 bg-primary/5" : "text-muted-foreground border-dashed",
              hasError && "border-destructive text-destructive hover:bg-destructive/5"
            )}
          >
            <Settings2 className="h-3 w-3 mr-1.5 shrink-0" />
            {displayValue}
          </Button>
          {value && (
             <Button
               variant="ghost"
               size="sm"
               onClick={() => updateRow(row.id, field.id, null)}
               className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
             >
               <X className="h-3 w-3" />
             </Button>
          )}
        </div>
      )
    }

    // Campaign selector for adsets
    if (field.id === "campaign_id" && type === "adset") {
      const availableCampaigns = [
        ...campaigns.map(c => ({ id: c.id, name: c.name, source: "Existing" })),
        ...batchOperations
          .filter(op => op.entity_type === "campaign")
          .map(op => ({ id: op.client_id || op.id, name: (op.data as any).name, source: "Batch" }))
      ]

      return errorWrapper(
        <Select value={value} onValueChange={(newValue) => updateRow(row.id, field.id, newValue)}>
          <SelectTrigger className={cn(
            "h-9 bg-background min-w-[200px]",
            hasError && "border-destructive ring-destructive"
          )}>
            <SelectValue placeholder="Select campaign" />
          </SelectTrigger>
          <SelectContent>
            {availableCampaigns.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id}>
                <div className="flex items-center justify-between w-full gap-4">
                  <span>{campaign.name}</span>
                  <span className="text-[10px] bg-muted px-1 rounded text-muted-foreground uppercase">{campaign.source}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    // Adset selector for ads
    if (field.id === "adset_id" && type === "ad") {
      const availableAdsets = [
        ...adsets.map(a => ({ id: a.id, name: a.name, source: "Existing" })),
        ...batchOperations
          .filter(op => op.entity_type === "adset")
          .map(op => ({ id: op.client_id || op.id, name: (op.data as any).name, source: "Batch" }))
      ]

      return errorWrapper(
        <Select value={value} onValueChange={(newValue) => updateRow(row.id, field.id, newValue)}>
          <SelectTrigger className={cn(
            "h-9 bg-background min-w-[200px]",
            hasError && "border-destructive ring-destructive"
          )}>
            <SelectValue placeholder="Select adset" />
          </SelectTrigger>
          <SelectContent>
            {availableAdsets.map((adset) => (
              <SelectItem key={adset.id} value={adset.id}>
                <div className="flex items-center justify-between w-full gap-4">
                  <span>{adset.name}</span>
                  <span className="text-[10px] bg-muted px-1 rounded text-muted-foreground uppercase">{adset.source}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (field.type === "textarea") {
      return errorWrapper(
        <Textarea
          value={value || ""}
          onChange={(e) => updateRow(row.id, field.id, e.target.value)}
          className={cn(
            "min-w-[200px] h-9 bg-background resize-none",
            hasError && "border-destructive ring-destructive placeholder:text-destructive/50"
          )}
          placeholder={field.label}
        />
      )
    }

    return errorWrapper(
      <Input
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
        value={value || ""}
        onChange={(e) => updateRow(row.id, field.id, e.target.value)}
        className={cn(
          "h-9 bg-background min-w-[150px]",
          hasError && "border-destructive ring-destructive placeholder:text-destructive/50"
        )}
        placeholder={field.label}
      />
    )
  }

  const getFieldSummary = (value: any, field: Field) => {
    if (!value) return `Configure ${field.label}`
    
    try {
      if (field.id === "targeting") {
        const parts = []
        if (value.age_min || value.age_max) parts.push(`${value.age_min || '?'}-${value.age_max || '?'}`)
        if (value.genders && Array.isArray(value.genders) && value.genders.length > 0) {
           parts.push(`${value.genders.length} Genders`)
        }
        if (value.geo_locations) {
           const geo = value.geo_locations
           if (geo.countries?.length) parts.push(`${geo.countries.length} Regions`)
           if (geo.cities?.length) parts.push(`${geo.cities.length} Cities`)
        }
        return parts.length > 0 ? parts.join(', ') : "Settings Configured"
      }
      
      if (field.type === "multi-select" && Array.isArray(value)) {
        return `${value.length} selected`
      }

      if (field.type === "array") {
        return `${Array.isArray(value) ? value.length : 0} items`
      }
      
      return "Configured"
    } catch (e) {
      return "Error"
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] sm:w-full sm:h-[90vh] max-w-[95vw] w-full h-[90vh] flex flex-col bg-card p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Bulk Create {type}s</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                Add multiple {type}s at once using the spreadsheet-style editor below
              </DialogDescription>
            </div>
            {Object.keys(errors).length > 0 && (
              <div className="flex items-center gap-2 text-destructive text-sm animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4" />
                <span>Please fill all required fields</span>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6 space-y-4">
          {duplicateWarning && (
            <div className="flex items-center gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <div className="flex-1">
                <strong>Duplicate data detected!</strong> You have identical rows in your creation list.
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setDuplicateWarning(false)}
                className="h-7 px-2 hover:bg-destructive/20"
              >
                Dismiss
              </Button>
            </div>
          )}

          <div className="rounded-lg border border-border bg-background overflow-hidden relative">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead className="w-12 sticky left-0 bg-muted z-20 text-xs">#</TableHead>
                  {visibleFields.map((field) => (
                    <TableHead key={field.id} className="font-semibold text-foreground whitespace-nowrap text-xs">
                      <div className="flex items-center gap-1">
                        {field.label}
                        {field.required && <span className="text-destructive">*</span>}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-16 text-center sticky right-0 bg-muted z-20 text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, idx) => (
                  <TableRow key={row.id} className={cn(
                    "hover:bg-accent/50",
                    errors[row.id] && "bg-destructive/5"
                  )}>
                    <TableCell className="font-medium text-muted-foreground sticky left-0 bg-background z-10 text-xs text-center border-r">
                      {idx + 1}
                    </TableCell>
                    {visibleFields.map((field) => (
                      <TableCell key={field.id} className="p-2 border-r last:border-r-0">
                        {renderFieldCell(row, field)}
                      </TableCell>
                    ))}
                    <TableCell className="text-center sticky right-0 bg-background z-10 border-l">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateRow(row.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRow(row.id)}
                          disabled={rows.length === 1}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

        {nestedModal.field && (
          <NestedFieldModal
            isOpen={nestedModal.isOpen}
            title={`${nestedModal.field.label} Settings`}
            description={`Configure ${nestedModal.field.label.toLowerCase()} for this ${type}`}
            schema={nestedModal.field.schema || []}
            initialData={nestedModal.rowId ? rows.find(r => r.id === nestedModal.rowId)?.[nestedModal.field.id] : null}
            onSave={handleNestedSave}
            onClose={() => setNestedModal({ ...nestedModal, isOpen: false })}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
