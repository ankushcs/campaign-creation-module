"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Field } from "@/lib/types"

type MultiColumnEditModalProps = {
  isOpen: boolean
  type: "campaign" | "adset" | "ad"
  fields: Field[]
  initialData: any[]
  onApply: (updatedItems: any[], type: "campaign" | "adset" | "ad") => void
  onClose: () => void
}

export function MultiColumnEditModal({
  isOpen,
  type,
  fields,
  initialData,
  onApply,
  onClose,
}: MultiColumnEditModalProps) {
  const [items, setItems] = useState<any[]>([])
  const [validationStatus, setValidationStatus] = useState<Record<string, boolean>>({})

  // Initialize data when modal opens
  useEffect(() => {
    if (isOpen) {
      setItems(JSON.parse(JSON.stringify(initialData))) // Deep copy to avoid mutating original state directly
      setValidationStatus({})
    }
  }, [isOpen, initialData])

  const handleCellChange = (id: string, fieldId: string, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [fieldId]: value, _edited: true } : item))
    )
    // Clear validation status on edit to force re-validation
    setValidationStatus({})
  }

  const validateItems = () => {
    const newStatus: Record<string, boolean> = {}
    items.forEach((item) => {
      let isValid = true
      fields.forEach((field) => {
        if (field.required && field.visible && !field.editable) {
           // Skip non-editable fields (like ID)
           return
        }
        if (field.required && field.visible) {
             const value = item[field.id]
             if (value === undefined || value === "" || value === null) {
                 isValid = false
             }
        }
      })
      newStatus[item.id] = isValid
    })
    setValidationStatus(newStatus)
  }

  const isAllValid = Object.keys(validationStatus).length === items.length && Object.values(validationStatus).every(v => v)

  const handleSave = () => {
    if (isAllValid) {
       onApply(items, type)
    }
  }

  const editableFields = fields.filter((f) => f.editable && f.visible)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] sm:w-full sm:h-[90vh] max-w-[95vw] w-full h-[90vh] flex flex-col bg-card p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="text-xl">Multi-Column Bulk Edit</DialogTitle>
          <DialogDescription className="text-muted-foreground">
             Edit multiple fields for {items.length} {type}(s). Validate before saving.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6">
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                   {/* Validation Status Column Header */}
                   <TableHead className="w-[50px] text-center">Valid</TableHead>
                   
                   {editableFields.map((field) => (
                    <TableHead key={field.id} className="min-w-[150px]">
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-accent/50 text-xs">
                    <TableCell className="text-center">
                        {validationStatus[item.id] === undefined ? (
                            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 mx-auto" />
                        ) : validationStatus[item.id] ? (
                            <CheckCircle className="w-5 h-5 text-success mx-auto" />
                        ) : (
                            <XCircle className="w-5 h-5 text-destructive mx-auto" />
                        )}
                    </TableCell>
                    {editableFields.map((field) => (
                      <TableCell key={field.id} className="p-2">
                         {field.type === "select" && field.options ? (
                           <Select
                             value={item[field.id]?.toString() || ""}
                             onValueChange={(val) => handleCellChange(item.id, field.id, val)}
                           >
                              <SelectTrigger className="h-8 w-full bg-background border-input focus:ring-1">
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options.map(opt => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                              </SelectContent>
                           </Select>
                         ) : (
                             <Input 
                                value={item[field.id] || ""}
                                onChange={(e) => handleCellChange(item.id, field.id, e.target.value)}
                                className="h-8 bg-background border-input focus:ring-1"
                                type={field.type === "number" ? "number" : "text"}
                             />
                         )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/50">
          <div className="flex w-full items-center justify-between">
             <div className="text-sm text-muted-foreground">
                {items.length} items selected
             </div>
             <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button 
                    variant="secondary" 
                    onClick={validateItems}
                    disabled={isAllValid} // Disable validate if already valid? No, let them re-validate.
                >
                    Validate
                </Button>
                <Button 
                    onClick={handleSave}
                    disabled={!isAllValid}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    Add to Batch
                </Button>
             </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
