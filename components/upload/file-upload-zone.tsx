"use client"

import type React from "react"

import { useRef, useState } from "react"

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
}

export function FileUploadZone({ onFileSelect, selectedFile }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

    const files = e.dataTransfer.files
    if (files.length > 0) {
      onFileSelect(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      onFileSelect(files[0])
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
        isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      } ${selectedFile ? "bg-green-50 border-green-300" : ""}`}
    >
      <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileInput} className="hidden" />

      <div onClick={() => fileInputRef.current?.click()}>
        <svg
          className="mx-auto h-12 w-12 text-muted-foreground mb-2"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v24a4 4 0 004 4h24a4 4 0 004-4V20m-14-8v16m-6-6l6 6 6-6"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-sm font-medium">Drag and drop your CSV file here</p>
        <p className="text-xs text-muted-foreground mt-1">or click to select a file</p>
      </div>
    </div>
  )
}
