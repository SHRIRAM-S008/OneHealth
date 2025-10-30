export function UploadProgress() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Processing file...</p>
        <p className="text-xs text-muted-foreground">Please wait</p>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div className="bg-primary h-full animate-pulse" style={{ width: "60%" }} />
      </div>
    </div>
  )
}
