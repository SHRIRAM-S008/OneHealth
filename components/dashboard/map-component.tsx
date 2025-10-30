"use client"

import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"

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
  onSelectedCasesChange: Dispatch<SetStateAction<Case[]>>
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
  
  // Get map center (average of all case locations)
  const getMapCenter = (): [number, number] => {
    if (cases.length === 0) {
      return [20.0, 0.0] // Default center
    }
    
    const avgLat = cases.reduce((sum, c) => sum + (c.latitude || 0), 0) / cases.length
    const avgLng = cases.reduce((sum, c) => sum + (c.longitude || 0), 0) / cases.length
    
    return [avgLat || 20.0, avgLng || 0.0]
  }

  // Initialize Leaflet
  useEffect(() => {
    if (typeof window !== "undefined") {
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
    }
    
    return () => {
      // Cleanup
      if (typeof window !== "undefined") {
        delete (window as any).leafletMarkerClusterGroup
      }
    }
  }, [])

  // Initialize marker cluster group
  useEffect(() => {
    if (!map || !showClusters) return
    
    // Initialize marker cluster group only on client
    if (typeof window !== "undefined" && !markerClusterRef.current) {
      const markerClusterGroup = (window as any).leafletMarkerClusterGroup
      if (markerClusterGroup) {
        markerClusterRef.current = markerClusterGroup()
        map.addLayer(markerClusterRef.current)
      }
    }
    
    return () => {
      if (markerClusterRef.current) {
        markerClusterRef.current.clearLayers()
        if (map) {
          map.removeLayer(markerClusterRef.current)
        }
        markerClusterRef.current = null
      }
    }
  }, [map, showClusters])

  // Update markers when cases or cluster setting changes
  useEffect(() => {
    if (!map || !showClusters) return
    
    if (markerClusterRef.current) {
      markerClusterRef.current.clearLayers()
      
      // Only initialize Leaflet on client
      if (typeof window !== "undefined") {
        const L = require("leaflet")
        
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
            
            markerClusterRef.current!.addLayer(marker)
          }
        })
      }
    }
  }, [cases, map, showClusters])

  // Handle map click for drawing rectangle
  const handleMapClick = (e: any) => {
    if (!drawing) return
    
    if (!drawStartRef.current) {
      // First click - start drawing
      drawStartRef.current = e.latlng
    } else {
      // Second click - finish drawing
      if (map && drawStartRef.current && typeof window !== "undefined") {
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
      }
    }
  }

  // Add event listener to map when it's created
  useEffect(() => {
    if (!map) return
    
    const handleMapClickWrapper = (e: any) => handleMapClick(e)
    
    map.on('click', handleMapClickWrapper)
    return () => {
      map.off('click', handleMapClickWrapper)
    }
  }, [map, drawing])

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={getMapCenter()}
        zoom={4}
        minZoom={2}
        maxZoom={18}
        style={{ height: "100%", width: "100%" }}
        ref={setMap as unknown as Dispatch<SetStateAction<any>>}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
      </MapContainer>
    </div>
  )
}