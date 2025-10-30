"use client"

import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer } from "react-leaflet"

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

interface MapComponentProps {
  cases: Case[]
  showClusters: boolean
  drawing: boolean
  onRegionFilter?: (cases: Case[]) => void
  onSelectedCasesChange: (cases: Case[]) => void
}

export default function MapComponent({ 
  cases, 
  showClusters, 
  drawing, 
  onRegionFilter,
  onSelectedCasesChange
}: MapComponentProps) {
  const [map, setMap] = useState<any | null>(null)
  const markerClusterRef = useRef<any | null>(null)
  const rectangleRef = useRef<any | null>(null)
  const drawStartRef = useRef<any | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  
  // Get map center (average of all case locations)
  const getMapCenter = (): [number, number] => {
    if (cases.length === 0) {
      return [20.0, 0.0] // Default center
    }
    
    const avgLat = cases.reduce((sum, c) => sum + (c.latitude || 0), 0) / cases.length
    const avgLng = cases.reduce((sum, c) => sum + (c.longitude || 0), 0) / cases.length
    
    return [avgLat || 20.0, avgLng || 0.0]
  }

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initialize Leaflet
  useEffect(() => {
    if (!isClient) return
    
    try {
      const L = require("leaflet")
      require("leaflet.markercluster")
      
      // Fix for default marker icons in Leaflet with Next.js
      // Add proper checks to prevent errors
      if (L.Icon && L.Icon.Default && L.Icon.Default.prototype) {
        if (Object.prototype.hasOwnProperty.call(L.Icon.Default.prototype, '_getIconUrl')) {
          delete (L.Icon.Default.prototype as any)._getIconUrl
        }
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        })
      }
      
      // Store reference to markerClusterGroup
      if (L.markerClusterGroup) {
        (window as any).leafletMarkerClusterGroup = L.markerClusterGroup
      }
    } catch (error) {
      console.error("Error initializing Leaflet:", error)
      setMapError("Failed to load map component")
    }
    
    return () => {
      // Cleanup
      if (typeof window !== "undefined") {
        delete (window as any).leafletMarkerClusterGroup
      }
    }
  }, [isClient])

  // Initialize marker cluster group
  useEffect(() => {
    if (!isClient || !map || !showClusters || mapError) return
    
    try {
      // Initialize marker cluster group only on client
      if (!markerClusterRef.current) {
        const markerClusterGroup = (window as any).leafletMarkerClusterGroup
        if (markerClusterGroup) {
          markerClusterRef.current = markerClusterGroup({
            maxClusterRadius: 80,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true
          })
          map.addLayer(markerClusterRef.current)
        }
      }
    } catch (error) {
      console.error("Error initializing marker cluster:", error)
      setMapError("Failed to initialize map clusters")
    }
    
    return () => {
      if (markerClusterRef.current) {
        try {
          markerClusterRef.current.clearLayers()
          if (map) {
            map.removeLayer(markerClusterRef.current)
          }
        } catch (error) {
          console.error("Error cleaning up marker cluster:", error)
        }
        markerClusterRef.current = null
      }
    }
  }, [isClient, map, showClusters, mapError])

  // Update markers when cases or cluster setting changes
  useEffect(() => {
    if (!isClient || !map || !showClusters || !markerClusterRef.current || mapError) return
    
    try {
      // Only initialize Leaflet on client
      const L = require("leaflet")
      
      // Clear existing markers
      markerClusterRef.current.clearLayers()
      
      cases.forEach((case_) => {
        if (case_.latitude && case_.longitude) {
          const marker = L.marker([case_.latitude, case_.longitude])
          
          marker.bindPopup(`
            <div className="p-2">
              <h3 className="font-bold">${case_.disease_name}</h3>
              <p className="text-sm">Location: ${case_.location}</p>
              <p className="text-sm">Status: ${case_.status}</p>
              <p className="text-sm">Category: ${case_.disease_category}</p>
              ${case_.patient_age ? `<p className="text-sm">Age: ${case_.patient_age}</p>` : ''}
              ${case_.patient_gender ? `<p className="text-sm">Gender: ${case_.patient_gender}</p>` : ''}
              <p className="text-xs text-gray-500 mt-1">${new Date(case_.created_at).toLocaleDateString()}</p>
            </div>
          `)
          
          markerClusterRef.current.addLayer(marker)
        }
      })
    } catch (error) {
      console.error("Error updating markers:", error)
      setMapError("Failed to update map markers")
    }
  }, [isClient, cases, map, showClusters, mapError])

  // Handle map click for drawing rectangle
  const handleMapClick = (e: any) => {
    if (!isClient || !drawing || mapError) return
    
    if (!drawStartRef.current) {
      // First click - start drawing
      drawStartRef.current = e.latlng
    } else {
      // Second click - finish drawing
      if (map && drawStartRef.current) {
        try {
          const L = require("leaflet")
          const bounds = L.latLngBounds(drawStartRef.current, e.latlng)
          
          // Remove previous rectangle if exists
          if (rectangleRef.current) {
            map.removeLayer(rectangleRef.current)
          }
          
          // Draw new rectangle
          rectangleRef.current = L.rectangle(bounds, { color: "#3b82f6", weight: 2 }).addTo(map)
          
          // Filter cases within bounds
          const filteredCases = cases.filter(case_ => {
            if (!case_.latitude || !case_.longitude) return false
            return bounds.contains([case_.latitude, case_.longitude])
          })
          
          onSelectedCasesChange(filteredCases)
          if (onRegionFilter) {
            onRegionFilter(filteredCases)
          }
          
          // Reset drawing state
          drawStartRef.current = null
        } catch (error) {
          console.error("Error handling map click:", error)
          setMapError("Failed to handle map interaction")
        }
      }
    }
  }

  // Add event listener to map when it's created
  useEffect(() => {
    if (!isClient || !map || mapError) return
    
    try {
      const handleMapClickWrapper = (e: any) => handleMapClick(e)
      
      map.on('click', handleMapClickWrapper)
      return () => {
        map.off('click', handleMapClickWrapper)
      }
    } catch (error) {
      console.error("Error adding map event listener:", error)
      setMapError("Failed to initialize map interactions")
    }
  }, [isClient, map, drawing, mapError])

  // Don't render anything until client-side to prevent hydration issues
  if (!isClient) {
    return <div className="w-full h-full bg-muted flex items-center justify-center">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  }

  // Show error message if map failed to load
  if (mapError) {
    return <div className="w-full h-full bg-muted flex items-center justify-center">
      <p className="text-muted-foreground">Map unavailable: {mapError}</p>
    </div>
  }

  return (
    <MapContainer
      center={getMapCenter()}
      zoom={4}
      minZoom={2}
      maxZoom={18}
      style={{ height: "100%", width: "100%" }}
      ref={setMap}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
    </MapContainer>
  )
}