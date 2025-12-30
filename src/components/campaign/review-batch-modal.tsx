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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Batch } from "@/lib/types"
import { CheckCircle, AlertCircle, Send } from "lucide-react"
import { cn } from "@/lib/utils"

type ReviewBatchModalProps = {
  isOpen: boolean
  batch: Batch
  onClose: () => void
  onPublish: () => void
}

export function ReviewBatchModal({ isOpen, batch, onClose, onPublish }: ReviewBatchModalProps) {
  const [activeTab, setActiveTab] = useState<"unapplied" | "submitted">("unapplied")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] sm:w-full sm:h-[90vh] max-w-[95vw] w-full h-[90vh] flex flex-col bg-card border overflow-hidden p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl">Review Batch</DialogTitle>
          <DialogDescription className="text-muted-foreground">Review and publish your changes</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/10">
            <TabsList className="bg-muted">
              <TabsTrigger
                value="unapplied"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Unapplied Batch ({batch.items.length})
              </TabsTrigger>
              <TabsTrigger
                value="submitted"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Submitted Batch (0)
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="unapplied" className="flex-1 overflow-auto p-6 mt-0">
            <div className="rounded-lg border border-border bg-background">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted hover:bg-muted">
                    <TableHead className="w-12">Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batch.items.map((item, idx) => (
                    <TableRow
                      key={item.id}
                      className={cn(
                        "text-xs",
                        (item.data as any)._groupColor && (item.data as any)._groupColor
                      )}
                    >
                      <TableCell>
                        {item.validationStatus === "success" ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : item.validationStatus === "error" ? (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-warning" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-accent text-accent-foreground">
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.action}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{(item.data as any).name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.type === "campaign" && `Objective: ${(item.data as any).objective}`}
                        {item.type === "adset" && `Budget: $${(item.data as any).daily_budget}`}
                        {item.type === "ad" && `CTA: ${(item.data as any).call_to_action}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="submitted" className="flex-1 p-6 mt-0">
            <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-border">
              <div className="text-center">
                <p className="text-lg font-medium text-muted-foreground">No submitted batches</p>
                <p className="text-sm text-muted-foreground">Published batches will appear here</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onPublish} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Send className="mr-2 h-4 w-4" />
            Publish Batch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
