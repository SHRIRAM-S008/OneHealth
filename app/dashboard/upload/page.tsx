"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileUploadZone } from "@/components/upload/file-upload-zone"
import { UploadProgress } from "@/components/upload/upload-progress"
import { UploadResults } from "@/components/upload/upload-results"
import { downloadCSV } from "@/lib/csv-utils"
import { Download } from "lucide-react"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
      setError("Please select a CSV file")
      return
    }
    setFile(selectedFile)
    setError(null)
    setResults(null)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload-cases", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      setResults(data)
      setFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during upload")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Upload Cases</h2>
        <p className="text-muted-foreground mt-2">Bulk upload disease cases from a CSV file</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>Select a CSV file with disease case data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUploadZone onFileSelect={handleFileSelect} selectedFile={file} />

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">{error}</div>
              )}

              {file && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm font-medium text-blue-900">Selected: {file.name}</p>
                  <p className="text-xs text-blue-700 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              )}

              <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
                {uploading ? "Uploading..." : "Upload Cases"}
              </Button>
            </CardContent>
          </Card>

          {uploading && <UploadProgress />}

          {results && <UploadResults results={results} />}
        </div>

        {/* CSV Format Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">CSV Format</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium mb-1">Required columns:</p>
              <ul className="space-y-1 text-muted-foreground text-xs">
                <li>• patient_age</li>
                <li>• patient_gender (M/F/Other)</li>
                <li>• disease_name</li>
                <li>• symptoms (comma-separated)</li>
                <li>• onset_date (YYYY-MM-DD)</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">Optional columns:</p>
              <ul className="space-y-1 text-muted-foreground text-xs">
                <li>• location</li>
                <li>• latitude</li>
                <li>• longitude</li>
                <li>• notes</li>
              </ul>
            </div>
            <div className="pt-3 border-t">
              <Button variant="outline" size="sm" onClick={() => downloadCSV()} className="w-full gap-2">
                <Download className="w-4 h-4" />
                Download Sample CSV
              </Button>
            </div>
            <div className="pt-2">
              <p className="text-xs text-muted-foreground">
                Disease categories will be automatically assigned using AI analysis.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
