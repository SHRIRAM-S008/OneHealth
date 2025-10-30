"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Case {
  id: string
  disease_name: string
  latitude?: number
  longitude?: number
  location: string
}

interface CasesMapProps {
  cases: Case[]
}

export function CasesMap({ cases }: CasesMapProps) {
  const casesWithLocation = cases.filter((c) => c.latitude && c.longitude)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Case Locations</CardTitle>
        <CardDescription>Geographic distribution of reported cases</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-80 bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Map visualization</p>
            <p className="text-xs text-muted-foreground">{casesWithLocation.length} cases with location data</p>
            <div className="mt-4 space-y-2">
              {casesWithLocation.slice(0, 5).map((case_) => (
                <div key={case_.id} className="text-xs text-muted-foreground">
                  {case_.disease_name} - {case_.location}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
