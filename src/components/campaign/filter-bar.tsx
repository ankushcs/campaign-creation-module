"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export type Filters = {
  search: string
  status: string
  objective?: string
  optimization_goal?: string
  creative_type?: string
}

type FilterBarProps = {
  type: "campaign" | "adset" | "ad"
  filters: Filters
  onFilterChange: (key: keyof Filters, value: string) => void
}

export function FilterBar({ type, filters, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 py-4 px-6 border-b border-border bg-card/50">
      {/* Search Filter */}
      <div className="relative w-72">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={`Search ${type}s...`}
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="pl-8 bg-background"
        />
      </div>

      {/* Status Filter */}
      <div className="w-[150px]">
        <Select
          value={filters.status}
          onValueChange={(value) => onFilterChange("status", value)}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Level Specific Filters */}
      {type === "campaign" && (
        <div className="w-[150px]">
          <Select
            value={filters.objective || "all"}
            onValueChange={(value) => onFilterChange("objective", value)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="All Objectives" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Objectives</SelectItem>
              <SelectItem value="AWARENESS">Awareness</SelectItem>
              <SelectItem value="TRAFFIC">Traffic</SelectItem>
              <SelectItem value="ENGAGEMENT">Engagement</SelectItem>
              <SelectItem value="LEADS">Leads</SelectItem>
              <SelectItem value="APP_PROMOTION">App Promotion</SelectItem>
              <SelectItem value="SALES">Sales</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {type === "adset" && (
        <div className="w-[150px]">
          <Select
            value={filters.optimization_goal || "all"}
            onValueChange={(value) => onFilterChange("optimization_goal", value)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="All Goals" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Goals</SelectItem>
              <SelectItem value="IMPRESSIONS">Impressions</SelectItem>
              <SelectItem value="LINK_CLICKS">Link Clicks</SelectItem>
              <SelectItem value="CONVERSIONS">Conversions</SelectItem>
              <SelectItem value="REACH">Reach</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {type === "ad" && (
        <div className="w-[150px]">
          <Select
            value={filters.creative_type || "all"}
            onValueChange={(value) => onFilterChange("creative_type", value)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="All Creative Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="IMAGE">Image</SelectItem>
              <SelectItem value="VIDEO">Video</SelectItem>
              <SelectItem value="CAROUSEL">Carousel</SelectItem>
              <SelectItem value="COLLECTION">Collection</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
