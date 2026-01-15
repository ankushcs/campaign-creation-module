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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Badge } from "../ui/badge"
import { CheckCircle, AlertCircle, Send, Trash2 } from "lucide-react"
import { cn } from "../../lib/utils"
import { useCampaignStore } from "../../lib/store"

type ReviewBatchModalProps = {
  isOpen: boolean
  onClose: () => void
  onPublish: () => void
}

export function ReviewBatchModal({ isOpen, onClose, onPublish }: ReviewBatchModalProps) {
  const { batch, removeBatchItem, pageSchema } = useCampaignStore()
  const [activeTab, setActiveTab] = useState<"unapplied" | "submitted">("unapplied")
  
  const hierarchy = pageSchema?.platform_hierarchy || ["campaign", "adset", "ad"]
  const [activeLevel, setActiveLevel] = useState<string>(hierarchy[0])

  const operations = batch?.operations || []
  const filteredOperations = operations.filter(op => op.entity_type === activeLevel)

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
                Unapplied Batch ({operations.length})
              </TabsTrigger>
              <TabsTrigger
                value="submitted"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Submitted Batch (0)
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="unapplied" className="flex-1 flex flex-col overflow-hidden mt-0">
            <Tabs value={activeLevel} onValueChange={setActiveLevel} className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 py-2 border-b border-border bg-muted/5">
                <TabsList className="bg-transparent gap-2 h-auto p-0">
                  {hierarchy.map(level => {
                    const count = operations.filter(op => op.entity_type === level).length
                    return (
                      <TabsTrigger
                        key={level}
                        value={level}
                        className="capitalize border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-4 py-2 bg-transparent h-10 data-[state=active]:bg-transparent"
                      >
                        {level}s <Badge variant="secondary" className="ml-2 bg-muted-foreground/10 h-5 px-1.5">{count}</Badge>
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
              </div>

              <div className="flex-1 overflow-auto p-6">
                <div className="rounded-lg border border-border bg-background overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted hover:bg-muted font-medium text-xs">
                        <TableHead className="w-12">Status</TableHead>
                        <TableHead>Operation</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead className="w-16 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOperations.map((op) => (
                        <TableRow
                          key={op.id}
                          className={cn(
                            "text-xs transition-colors",
                            (op.data as any)._groupColor && (op.data as any)._groupColor
                          )}
                        >
                          <TableCell>
                            {op.validationStatus === "success" ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : op.validationStatus === "error" ? (
                              <AlertCircle className="h-4 w-4 text-destructive" />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-yellow-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "uppercase text-[10px]",
                                op.operation_type === "create" ? "text-green-600 border-green-200 bg-green-50" : "text-blue-600 border-blue-200 bg-blue-50"
                              )}
                            >
                              {op.operation_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="capitalize">{op.entity_type}</TableCell>
                          <TableCell className="font-semibold">{(op.data as any).name}</TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">
                            {op.entity_type === "campaign" && `Objective: ${(op.data as any).objective}`}
                            {op.entity_type === "adset" && `Budget: $${(op.data as any).daily_budget || (op.data as any).lifetime_budget}`}
                            {op.entity_type === "ad" && `Creative: ${(op.data as any).creative_type}`}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBatchItem(op.id)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredOperations.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic">
                            No {activeLevel}s in batch
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </Tabs>
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
          <Button 
            onClick={onPublish} 
            disabled={operations.length === 0}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="mr-2 h-4 w-4" />
            Publish Batch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
