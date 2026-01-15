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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import type { Field } from "../../lib/types"

type BulkEditModalProps = {
  isOpen: boolean
  type: "campaign" | "adset" | "ad"
  fields: Field[]
  selectedCount: number
  onApply: (field: string, value: any, type: "campaign" | "adset" | "ad") => void
  onClose: () => void
}

export function BulkEditModal({ isOpen, type, fields, selectedCount, onApply, onClose }: BulkEditModalProps) {
  const [selectedField, setSelectedField] = useState("")
  const [value, setValue] = useState("")

  const editableFields = fields.filter((f) => f.editable)
  const currentField = editableFields.find((f) => f.id === selectedField)

  const handleApply = () => {
    if (selectedField && value) {
      onApply(selectedField, value, type)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl">Bulk Edit</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Apply changes to {selectedCount} selected {type}(s)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Field to edit</Label>
            <Select value={selectedField} onValueChange={setSelectedField}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Choose field..." />
              </SelectTrigger>
              <SelectContent>
                {editableFields.map((field) => (
                  <SelectItem key={field.id} value={field.id}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedField && (
            <div className="space-y-2">
              <Label>New value</Label>
              {currentField?.type === "select" && currentField.options ? (
                <Select value={value} onValueChange={setValue}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Choose value..." />
                  </SelectTrigger>
                  <SelectContent>
                    {currentField.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={currentField?.type === "number" ? "number" : "text"}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={`Enter ${currentField?.label.toLowerCase()}...`}
                  className="bg-background"
                />
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={!selectedField || !value}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Apply to {selectedCount} items
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
