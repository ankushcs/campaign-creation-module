"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { Upload, FileIcon, FileArchive, X } from "lucide-react"
import { cn } from "../../lib/utils"

interface CreativeUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload?: (data: any) => void
}

export function CreativeUploadModal({
  isOpen,
  onClose,
  onUpload,
}: CreativeUploadModalProps) {
  const [uploadMode, setUploadMode] = React.useState<"single" | "zip">("single")
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [creativeNames, setCreativeNames] = React.useState<string[]>([])
  const [isDragging, setIsDragging] = React.useState(false)

  const addFiles = (files: FileList | File[]) => {
    const newFiles = Array.from(files)
    
    if (uploadMode === "zip") {
      // ZIP mode only allows one file
      const zipFile = newFiles.find(f => f.name.endsWith(".zip"))
      if (zipFile) {
        setSelectedFiles([zipFile])
        setCreativeNames([zipFile.name.split(".")[0]])
      } else {
        alert("Please upload a ZIP file in Zip Upload mode.")
      }
      return
    }

    // Filter out duplicates if needed, but for now just append
    const updatedFiles = [...selectedFiles, ...newFiles]
    const updatedNames = [...creativeNames, ...newFiles.map(f => f.name.split(".")[0])]
    
    setSelectedFiles(updatedFiles)
    setCreativeNames(updatedNames)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files)
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setCreativeNames(prev => prev.filter((_, i) => i !== index))
  }

  const updateName = (index: number, newName: string) => {
    setCreativeNames(prev => {
      const next = [...prev]
      next[index] = newName
      return next
    })
  }

  const handleUpload = () => {
    if (selectedFiles.length === 0) return
    
    const uploadData = selectedFiles.map((file, index) => ({
      name: creativeNames[index],
      file: file,
      mode: uploadMode,
      uploadedAt: new Date()
    }))
    
    console.log("Uploading creatives:", uploadData)
    if (onUpload) onUpload(uploadData)
    
    // Reset and close
    setCreativeNames([])
    setSelectedFiles([])
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Upload Creative</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Mode Selection */}
          <div className="relative">
            <Tabs 
              defaultValue="single" 
              value={uploadMode} 
              onValueChange={(v) => setUploadMode(v as "single" | "zip")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="single" 
                  className="flex items-center gap-2"
                  disabled={selectedFiles.length > 0}
                >
                  <FileIcon className="h-4 w-4" />
                  Multiple Files
                </TabsTrigger>
                <TabsTrigger 
                  value="zip" 
                  className="flex items-center gap-2"
                  disabled={selectedFiles.length > 0}
                >
                  <FileArchive className="h-4 w-4" />
                  Zip Upload
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {selectedFiles.length > 0 && (
              <p className="mt-2 text-center text-xs text-muted-foreground animate-in fade-in slide-in-from-top-1">
                Remove files to switch upload modes
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>File Upload</Label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors",
                  isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                  selectedFiles.length > 0 && "border-solid border-primary/30 bg-primary/5"
                )}
              >
                <div className="rounded-full bg-primary/10 p-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {uploadMode === "single" 
                      ? "Images (JPG, PNG, GIF), Videos (MP4) up to 50MB"
                      : "ZIP folder containing HTML5 assets"}
                  </p>
                </div>
                <input
                  type="file"
                  multiple={uploadMode === "single"}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={handleFileChange}
                  accept={uploadMode === "single" ? "image/*,video/*" : ".zip"}
                />
              </div>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-3 max-h-[300px] overflow-auto pr-2">
                <Label className="text-sm font-semibold">Selected Files ({selectedFiles.length})</Label>
                {selectedFiles.map((file, idx) => (
                  <div key={`${file.name}-${idx}`} className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-background/50">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="rounded-md bg-primary/20 p-2 shrink-0">
                          {uploadMode === "zip" ? (
                            <FileArchive className="h-4 w-4 text-primary" />
                          ) : (
                            <FileIcon className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="truncate text-xs font-medium">
                            {file.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(idx)}
                        className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor={`name-${idx}`} className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Creative Name</Label>
                      <Input
                        id={`name-${idx}`}
                        className="h-8 text-xs"
                        placeholder="Name your creative"
                        value={creativeNames[idx] || ""}
                        onChange={(e) => updateName(idx, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={selectedFiles.length === 0 || creativeNames.some(name => !name.trim())}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Upload {selectedFiles.length > 0 ? `${selectedFiles.length} ` : ""}Creative{selectedFiles.length !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
