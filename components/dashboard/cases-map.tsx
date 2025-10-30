"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

// Create a consistent loading component
const MapLoading = () => (
  <div className="h-full w-full bg-muted flex items-center justify-center">
    <p className="text-muted-foreground">Loading map...</p>
  </div>
);

// Error component for when map fails to load
const MapError = () => (
  <div className="h-full w-full bg-muted flex items-center justify-center">
    <p className="text-muted-foreground">Map unavailable</p>
  </div>
);

// Dynamically import the entire MapComponent to avoid SSR issues
const MapComponent = dynamic(
  () => import("@/components/dashboard/map-component").catch(() => {
    // Fallback component if dynamic import fails
    return { default: () => <MapError /> };
  }),
  { 
    ssr: false,
    loading: () => <MapLoading />
  }
)

interface Case {
  id: string
  disease_name: string
  disease_category: string
  latitude?: number
  longitude?: number
  location: string
  patient_age?: number
  patient_gender?: string
  status: string
  created_at: string
}

interface CasesMapProps {
  cases: Case[]
  onRegionFilter?: (cases: Case[]) => void
}

export function CasesMap({ cases, onRegionFilter }: CasesMapProps) {
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [showClusters, setShowClusters] = useState(true)
  const [showBoundaries, setShowBoundaries] = useState(false)
  const [drawing, setDrawing] = useState(false)
  const [selectedCases, setSelectedCases] = useState<Case[]>([])
  const [isClient, setIsClient] = useState(false)
  
  const casesWithLocation = cases.filter((c) => c.latitude && c.longitude)

  // Set isClient to true after component mounts to prevent hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Toggle drawing mode
  const toggleDrawing = () => {
    setDrawing(!drawing)
    if (!drawing) {
      // Entering drawing mode
      setSelectedCases([])
      if (onRegionFilter) {
        onRegionFilter([])
      }
    }
  }

  // Clear selection
  const clearSelection = () => {
    setDrawing(false)
    setSelectedCases([])
    if (onRegionFilter) {
      onRegionFilter([])
    }
  }

  // Don't render anything until mounted to avoid hydration issues
  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle>Case Locations</CardTitle>
              <CardDescription>Geographic distribution of reported cases</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled
              >
                Draw Area
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled
              >
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="clusters" 
                  checked={true} 
                  disabled
                />
                <label 
                  htmlFor="clusters" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Clusters
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="heatmap" 
                  checked={false} 
                  disabled
                />
                <label 
                  htmlFor="heatmap" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Heatmap (Coming Soon)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="boundaries" 
                  checked={false} 
                  disabled
                />
                <label 
                  htmlFor="boundaries" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Boundaries (Coming Soon)
                </label>
              </div>
            </div>
            
            <div className="rounded-lg overflow-hidden border">
              <div className="h-80 w-full relative">
                <MapLoading />
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {casesWithLocation.length} cases with location data
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative z-0">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Case Locations</CardTitle>
            <CardDescription>Geographic distribution of reported cases</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={drawing ? "default" : "outline"} 
              size="sm" 
              onClick={toggleDrawing}
            >
              {drawing ? "Cancel Drawing" : "Draw Area"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearSelection}
              disabled={selectedCases.length === 0 && !drawing}
            >
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="clusters" 
                checked={showClusters} 
                onCheckedChange={(checked) => setShowClusters(checked as boolean)} 
              />
              <label 
                htmlFor="clusters" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Clusters
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="heatmap" 
                checked={showHeatmap} 
                onCheckedChange={(checked) => setShowHeatmap(checked as boolean)} 
                disabled
              />
              <label 
                htmlFor="heatmap" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Heatmap (Coming Soon)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="boundaries" 
                checked={showBoundaries} 
                onCheckedChange={(checked) => setShowBoundaries(checked as boolean)} 
                disabled
              />
              <label 
                htmlFor="boundaries" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Boundaries (Coming Soon)
              </label>
            </div>
          </div>
          
          <div className="rounded-lg overflow-hidden border">
            <div className="h-80 w-full relative">
              {isClient && (
                <MapComponent 
                  cases={casesWithLocation} 
                  showClusters={showClusters} 
                  drawing={drawing}
                  onRegionFilter={onRegionFilter}
                  onSelectedCasesChange={setSelectedCases}
                />
              )}
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {casesWithLocation.length} cases with location data
            {selectedCases.length > 0 && (
              <p className="mt-1">
                <span className="font-medium">{selectedCases.length}</span> cases selected in drawn area
              </p>
            )}
            {drawing && (
              <p className="mt-1 text-blue-600">
                Click on the map to start drawing a rectangle, then click again to finish
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}