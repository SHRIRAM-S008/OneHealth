import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface UploadResultsProps {
  results: {
    success: boolean
    message: string
    casesProcessed: number
    casesCreated: number
    errors: Array<{ row: number; error: string }>
  }
}

export function UploadResults({ results }: UploadResultsProps) {
  return (
    <Card className={results.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
      <CardHeader>
        <CardTitle className={results.success ? "text-green-900" : "text-red-900"}>Upload Complete</CardTitle>
        <CardDescription className={results.success ? "text-green-800" : "text-red-800"}>
          {results.message}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Cases Processed</p>
            <p className="text-2xl font-bold">{results.casesProcessed}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Cases Created</p>
            <p className="text-2xl font-bold text-green-600">{results.casesCreated}</p>
          </div>
        </div>

        {results.errors.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Errors:</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {results.errors.map((err, idx) => (
                <p key={idx} className="text-xs text-red-700">
                  Row {err.row}: {err.error}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
