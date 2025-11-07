'use client'

import { useState } from 'react'
import Map, { Marker, Popup } from 'react-map-gl'
import type { ViewStateChangeEvent } from 'react-map-gl'
import { mockProperties } from '@/lib/mockData'
import type { Property } from '@/types/property'

import 'mapbox-gl/dist/mapbox-gl.css'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

interface MapViewProps {
  hoveredPropertyId?: string | null
  onMarkerClick?: (property: Property) => void
}

export default function MapView({ hoveredPropertyId, onMarkerClick }: MapViewProps) {
  const [viewState, setViewState] = useState({
    longitude: -77.0428,
    latitude: -12.0464,
    zoom: 15,
    pitch: 60,
    bearing: 0
  })
  
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  if (!MAPBOX_TOKEN) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 font-semibold">
            ⚠️ Mapbox token no encontrado
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Agrega NEXT_PUBLIC_MAPBOX_TOKEN en .env.local
          </p>
        </div>
      </div>
    )
  }

  const getPriceColor = (price: number) => {
    if (price < 800) return 'bg-green-500'
    if (price < 1500) return 'bg-yellow-500'
    if (price < 2000) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const handleMarkerClick = (property: Property, e: any) => {
    e.originalEvent.stopPropagation()
    setSelectedProperty(property)
    onMarkerClick?.(property)
  }

  return (
    <div className="h-full w-full relative">
      <Map
        {...viewState}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        onLoad={(evt) => {
          const map = evt.target
          
          // Agregar capa de edificios 3D
          if (!map.getLayer('3d-buildings')) {
            const layers = map.getStyle().layers
            const labelLayerId = layers?.find(
              (layer: any) => layer.type === 'symbol' && layer.layout?.['text-field']
            )?.id

            map.addLayer(
              {
                id: '3d-buildings',
                source: 'composite',
                'source-layer': 'building',
                filter: ['==', 'extrude', 'true'],
                type: 'fill-extrusion',
                minzoom: 15,
                paint: {
                  'fill-extrusion-color': '#aaa',
                  'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'height']
                  ],
                  'fill-extrusion-base': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'min_height']
                  ],
                  'fill-extrusion-opacity': 0.6
                }
              },
              labelLayerId
            )
          }
        }}
      >
        {/* Property Markers */}
        {mockProperties.map((property) => {
          const isHovered = hoveredPropertyId === property.id
          
          return (
            <Marker
              key={property.id}
              longitude={property.longitude}
              latitude={property.latitude}
              anchor="bottom"
              onClick={(e) => handleMarkerClick(property, e)}
            >
              <div className={`cursor-pointer transition-all duration-200 ${
                isHovered ? 'scale-125' : 'hover:scale-110'
              }`}>
                <div className={`${getPriceColor(property.price)} text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg ${
                  isHovered ? 'ring-4 ring-white' : ''
                }`}>
                  ${property.price}
                </div>
              </div>
            </Marker>
          )
        })}

        {/* Popup */}
        {selectedProperty && (
          <Popup
            longitude={selectedProperty.longitude}
            latitude={selectedProperty.latitude}
            anchor="top"
            onClose={() => setSelectedProperty(null)}
            closeButton={true}
            closeOnClick={false}
            className="property-popup"
          >
            <div className="p-2 min-w-[250px]">
              <img 
                src={selectedProperty.imageUrl} 
                alt={selectedProperty.title}
                className="w-full h-32 object-cover rounded-lg mb-2"
              />
              <h3 className="font-bold text-gray-800 mb-1">
                {selectedProperty.title}
              </h3>
              <p className="text-2xl font-bold text-blue-600 mb-2">
                ${selectedProperty.price}/mes
              </p>
              <div className="flex gap-3 text-sm text-gray-600 mb-2">
                <span>🛏️ {selectedProperty.bedrooms}</span>
                <span>🚿 {selectedProperty.bathrooms}</span>
                <span>📐 {selectedProperty.area}m²</span>
              </div>
              <p className="text-sm text-gray-500">
                📍 {selectedProperty.district}
              </p>
              <button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors">
                Ver detalles
              </button>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  )
}