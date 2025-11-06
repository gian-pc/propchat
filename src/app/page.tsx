'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import PropertyList from '@/components/property/PropertyList'
import { mockProperties } from '@/lib/mockData'
import type { Property } from '@/types/property'

// Importar MapView con dynamic para evitar SSR issues
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handlePropertyClick = (property: Property) => {
    // Por ahora solo log, después abriremos modal
    console.log('Clicked property:', property)
  }

  return (
    <div className="h-screen w-full flex relative">
      {/* Sidebar con lista de propiedades */}
      <div className={`absolute left-0 top-0 h-full z-20 transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <PropertyList
          properties={mockProperties}
          onPropertyHover={setHoveredProperty}
          onPropertyClick={handlePropertyClick}
          hoveredPropertyId={hoveredProperty?.id}
        />
      </div>

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`absolute top-4 z-30 bg-white hover:bg-gray-100 p-3 rounded-lg shadow-xl transition-all duration-300 ${
          isSidebarOpen ? 'left-[400px]' : 'left-4'
        }`}
      >
        <span className="text-xl">
          {isSidebarOpen ? '◀' : '▶'}
        </span>
      </button>

      {/* Mapa de fondo */}
      <div className="flex-1 h-full">
        <MapView 
          hoveredPropertyId={hoveredProperty?.id}
          onMarkerClick={handlePropertyClick}
        />
      </div>
      
      {/* Header flotante */}
      <div className="absolute top-0 right-0 z-10 p-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">
            PropChat
          </h1>
          <button className="px-4 py-2 bg-white/90 hover:bg-white text-gray-800 rounded-lg font-medium transition-all">
            Iniciar Sesión
          </button>
        </div>
      </div>

      {/* Barra de búsqueda flotante */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4">
        <div className="bg-white rounded-full shadow-2xl p-3 flex items-center gap-3">
          <span className="text-2xl pl-2">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar por ubicación, distrito o características..."
            className="flex-1 outline-none text-gray-700"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-all">
            Buscar
          </button>
        </div>
      </div>

      {/* Chat Widget Flotante */}
      <div className="absolute bottom-6 right-6 z-20">
        <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-2xl hover:scale-110 transition-all duration-200 flex items-center gap-2">
          <span className="text-2xl">💬</span>
          <span className="font-semibold">Chat con IA</span>
        </button>
      </div>

      {/* Badge flotante */}
      <div className="absolute bottom-6 left-6 z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4">
          <p className="text-sm font-semibold text-gray-800">
            🚀 Proyecto en desarrollo
          </p>
          <p className="text-xs text-gray-600">
            Frontend MVP - PropChat
          </p>
        </div>
      </div>
    </div>
  )
}