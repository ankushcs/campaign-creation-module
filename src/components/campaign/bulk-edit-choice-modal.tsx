"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LayoutList, TableProperties } from "lucide-react"

type BulkEditChoiceModalProps = {
  isOpen: boolean
  onSelect: (mode: "single" | "multi") => void
  onClose: () => void
}

export function BulkEditChoiceModal({ isOpen, onSelect, onClose }: BulkEditChoiceModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl">Bulk Edit Options</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose how you want to edit the selected items
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="h-32 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5"
            onClick={() => onSelect("single")}
          >
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <LayoutList className="h-6 w-6" />
            </div>
            <div className="text-center">
              <div className="font-semibold">Single Column</div>
              <div className="text-xs text-muted-foreground mt-1">
                Update one field for all items
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-32 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5"
            onClick={() => onSelect("multi")}
          >
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <TableProperties className="h-6 w-6" />
            </div>
            <div className="text-center">
              <div className="font-semibold">Multiple Columns</div>
              <div className="text-xs text-muted-foreground mt-1">
                Edit items in a spreadsheet view
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
