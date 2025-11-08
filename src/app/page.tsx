'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import ChatWidget from '@/components/chat/ChatWidget'
import PropertyDetailsModal from '@/components/property/PropertyDetailsModal'
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
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedProperty(null), 300)
  }

  return (
    <div className="h-screen w-full relative">
      {/* Mapa */}
      <MapView 
        hoveredPropertyId={hoveredProperty?.id}
        onMarkerClick={handlePropertyClick}
      />

      {/* Chat */}
      <ChatWidget />

      {/* Modal de Detalles */}
      <PropertyDetailsModal
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}