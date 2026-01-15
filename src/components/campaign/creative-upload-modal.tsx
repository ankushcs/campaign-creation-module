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
  const [creativeName, setCreativeName] = React.useState("")
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      if (!creativeName) {
        setCreativeName(e.target.files[0].name.split(".")[0])
      }
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      // Validate file type based on mode
      if (uploadMode === "zip" && !file.name.endsWith(".zip")) {
        alert("Please upload a ZIP file in Zip Upload mode.")
        return
      }
      setSelectedFile(file)
      if (!creativeName) {
        setCreativeName(file.name.split(".")[0])
      }
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setCreativeName("")
  }

  const handleUpload = () => {
    if (!selectedFile || !creativeName) return
    
    const uploadData = {
      name: creativeName,
      file: selectedFile,
      mode: uploadMode,
      uploadedAt: new Date()
    }
    
    console.log("Uploading creative:", uploadData)
    if (onUpload) onUpload(uploadData)
    
    // Reset and close
    setCreativeName("")
    setSelectedFile(null)
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
                  disabled={!!selectedFile}
                >
                  <FileIcon className="h-4 w-4" />
                  Single File
                </TabsTrigger>
                <TabsTrigger 
                  value="zip" 
                  className="flex items-center gap-2"
                  disabled={!!selectedFile}
                >
                  <FileArchive className="h-4 w-4" />
                  Zip Upload
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {selectedFile && (
              <p className="mt-2 text-center text-xs text-muted-foreground animate-in fade-in slide-in-from-top-1">
                Remove the current file to switch upload modes
              </p>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="creative-name">Creative Name</Label>
              <Input
                id="creative-name"
                placeholder="Enter creative name"
                value={creativeName}
                onChange={(e) => setCreativeName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>File Upload</Label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors",
                  isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                  selectedFile && "border-solid border-primary/30 bg-primary/5"
                )}
              >
                {!selectedFile ? (
                  <>
                    <div className="rounded-full bg-primary/10 p-3">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm font-medium">
                        Click to upload or drag and drop
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {uploadMode === "single" 
                          ? "Image (JPG, PNG, GIF), Video (MP4) up to 50MB"
                          : "ZIP folder containing HTML5 assets"}
                      </p>
                    </div>
                    <input
                      type="file"
                      className="absolute inset-0 cursor-pointer opacity-0"
                      onChange={handleFileChange}
                      accept={uploadMode === "single" ? "image/*,video/*" : ".zip"}
                    />
                  </>
                ) : (
                  <div className="flex w-full items-center justify-between gap-4 px-2">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-primary/20 p-2">
                        {uploadMode === "zip" ? (
                          <FileArchive className="h-5 w-5 text-primary" />
                        ) : (
                          <FileIcon className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="max-w-[200px] truncate text-sm font-medium">
                          {selectedFile.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearFile}
                      className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || !creativeName}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Upload Creative
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
