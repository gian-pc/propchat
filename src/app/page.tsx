'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import ChatWidget from '@/components/chat/ChatWidget'
import { mockProperties } from '@/lib/mockData'
import type { Property } from '@/types/property'

const MapView = dynamic(
  () => import('@/components/map/MapView'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Cargando mapa...</p>
      </div>
    )
  }
)

export default function Home() {
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null)

  const handlePropertyClick = (property: Property) => {
    console.log('Clicked property:', property)
  }

  return (
    <div className="h-screen w-full relative">
      {/* Solo el Mapa */}
      <MapView 
        hoveredPropertyId={hoveredProperty?.id}
        onMarkerClick={handlePropertyClick}
      />

      {/* Solo el Chat */}
      <ChatWidget />
    </div>
  )
}