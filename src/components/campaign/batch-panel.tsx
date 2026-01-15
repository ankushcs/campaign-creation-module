"use client"

import { useState } from "react"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import type { Batch } from "../../lib/types"
import { Package, Eye, ChevronDown } from "lucide-react"

type BatchPanelProps = {
  batch: Batch | null
  onReview: () => void
}

export function BatchPanel({ batch, onReview }: BatchPanelProps) {
  const [isMinimized, setIsMinimized] = useState(true)

  const itemCount = batch?.items.length || 0

  if (isMinimized) {
    return (
      <Button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 h-14 w-14 -full bg-primary shadow-lg hover:bg-primary/90 p-0 flex items-center justify-center transition-all duration-200"
      >
        <Package className="h-6 w-6 text-primary-foreground" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center -full bg-destructive text-xs font-bold text-destructive-foreground border-2 border-background">
            {itemCount}
          </span>
        )}
      </Button>
    )
  }

  if (!batch || batch.items.length === 0) {
    return (
      <Card className="fixed bottom-6 right-6 w-80 border-2 border-border bg-card p-4 shadow-lg animate-in slide-in-from-bottom-5 fade-in duration-200">
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-2">
             <div className="flex h-8 w-8 items-center justify-center -lg bg-accent">
               <Package className="h-4 w-4 text-accent-foreground" />
             </div>
             <div className="font-semibold text-card-foreground">Batch</div>
           </div>
           <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)} className="h-6 w-6">
             <ChevronDown className="h-4 w-4" />
           </Button>
        </div>
        <div className="text-sm text-muted-foreground ml-10">No items</div>
      </Card>
    )
  }

  const campaigns = batch.items.filter((item) => item.type === "campaign").length
  const adsets = batch.items.filter((item) => item.type === "adset").length
  const ads = batch.items.filter((item) => item.type === "ad").length

  return (
    <Card className="fixed bottom-6 right-6 w-80 border-2 border-primary bg-card p-4 shadow-lg animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center -lg bg-primary">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-semibold text-card-foreground">Batch #{batch.id}</div>
              <div className="text-sm text-muted-foreground">{batch.items.length} items</div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)}>
             <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {campaigns > 0 && (
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              {campaigns} Campaign{campaigns > 1 ? "s" : ""}
            </Badge>
          )}
          {adsets > 0 && (
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              {adsets} Adset{adsets > 1 ? "s" : ""}
            </Badge>
          )}
          {ads > 0 && (
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              {ads} Ad{ads > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={onReview} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
            <Eye className="mr-2 h-4 w-4" />
            Review
          </Button>
        </div>
      </div>
    </Card>
  )
}
