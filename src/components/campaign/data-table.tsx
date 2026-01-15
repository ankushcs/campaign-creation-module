"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Checkbox } from "../ui/checkbox"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/button"
import type { Field } from "../../lib/types"
import { AlertCircle, CheckCircle, MoreVertical, Copy, Trash2, Edit, Pause, Play, Loader2, PauseCircle } from "lucide-react"
import { cn } from "../../lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { PaginationControls } from "../ui/pagination-controls"

type DataTableProps = {
  data: any[]
  fields: Field[]
  onCellEdit: (id: string, field: string, value: any) => void
  selectedRows: Set<string>
  onSelectionChange: (selected: Set<string>) => void
  onDuplicate?: (id: string) => void
  onPause?: (id: string) => void
  onDelete?: (id: string) => void
  isLoading?: boolean
}

export function DataTable({ 
  data, 
  fields, 
  onCellEdit, 
  selectedRows, 
  onSelectionChange,
  onDuplicate,
  onPause,
  onDelete,
  isLoading
}: DataTableProps) {
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null)

  // ... (selection logic omitted for brevity, keeping same)
  const toggleRowSelection = (id: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    onSelectionChange(newSelected)
  }

  const toggleAllSelection = () => {
    if (selectedRows.size === data.length) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(data.map((row) => row.id)))
    }
  }

  const handleCellClick = (id: string, field: Field) => {
    if (field.editable) {
      setEditingCell({ id, field: field.id })
    }
  }

  const handleCellBlur = () => {
    setEditingCell(null)
  }

  const renderCell = (row: any, field: Field) => {
    const isEditing = editingCell?.id === row.id && editingCell?.field === field.id
    const value = row[field.id]

    if (isEditing) {
      if (field.type === "select" && field.options) {
        return (
          <Select
            value={value}
            onValueChange={(newValue) => {
              onCellEdit(row.id, field.id, newValue)
              setEditingCell(null)
            }}
          >
            <SelectTrigger className="h-8 w-full">
              <SelectValue />
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

      return (
        <Input
          type={field.type === "number" ? "number" : "text"}
          defaultValue={value}
          onBlur={(e) => {
            onCellEdit(row.id, field.id, e.target.value)
            handleCellBlur()
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onCellEdit(row.id, field.id, e.currentTarget.value)
              handleCellBlur()
            } else if (e.key === "Escape") {
              handleCellBlur()
            }
          }}
          autoFocus
          className="h-8"
        />
      )
    }

    return <div className="truncate">{value?.toString() || "-"}</div>
  }

  // Pagination logic can stay same, implemented previously

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(data.length / itemsPerPage)
  
  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center -lg border border-border bg-card">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Fetching data...</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center -lg border-2 border-dashed border-border bg-card">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">No data, load data to edit/update</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex-1 overflow-auto -lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted">
              {/* Table headers same as before */}
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.size === data.length && data.length > 0}
                  onCheckedChange={toggleAllSelection}
                />
              </TableHead>
              <TableHead className="w-12">Status</TableHead>
              {fields.map((field) => (
                <TableHead key={field.id} className="font-semibold text-foreground">
                  {field.label}
                </TableHead>
              ))}
              <TableHead className="w-24 text-right font-semibold text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row) => (
              <TableRow
                key={row.id}
                className={cn(
                  "hover:bg-accent text-xs",
                  row._draft && "bg-draft-highlight",
                  row._edited && !row._draft && "bg-yellow-50",
                  row._groupColor && row._draft && row._groupColor,
                )}
              >
                <TableCell>
                  <Checkbox checked={selectedRows.has(row.id)} onCheckedChange={() => toggleRowSelection(row.id)} />
                </TableCell>
                <TableCell>
                  {row._error ? (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  ) : row._draft ? (
                    <div className="h-2 w-2 -full bg-warning" title="Draft" />
                  ) : row._edited ? (
                    <div className="h-2 w-2 -full bg-info" title="Edited" />
                  ) : row.status === "PAUSED" ? (
                    <PauseCircle className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-success" />
                  )}
                </TableCell>
                {fields.map((field) => (
                  <TableCell
                    key={field.id}
                    onClick={() => handleCellClick(row.id, field)}
                    className={cn("cursor-pointer", field.editable && "hover:bg-accent/50")}
                  >
                    {renderCell(row, field)}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {onDuplicate && (
                        <DropdownMenuItem onClick={() => onDuplicate(row.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                      )}
                      {onPause && (
                        <DropdownMenuItem onClick={() => onPause(row.id)}>
                          {row.status === "PAUSED" ? (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Resume
                            </>
                          ) : (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              Pause
                            </>
                          )}
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem className="text-destructive" onClick={() => onDelete(row.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>



      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
