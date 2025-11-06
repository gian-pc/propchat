// src/components/property/PropertyList.tsx
'use client'

import { Property } from '@/types/property'
import PropertyCard from './PropertyCard'

interface PropertyListProps {
  properties: Property[]
  onPropertyHover?: (property: Property | null) => void
  onPropertyClick?: (property: Property) => void
  hoveredPropertyId?: string | null
}

export default function PropertyList({
  properties,
  onPropertyHover,
  onPropertyClick,
  hoveredPropertyId
}: PropertyListProps) {
  return (
    <div className="w-full md:w-96 h-full bg-white shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <h2 className="text-xl font-bold">
          Propiedades Disponibles
        </h2>
        <p className="text-sm text-blue-100 mt-1">
          {properties.length} propiedades encontradas
        </p>
      </div>

      {/* Filters (placeholder for now) */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex gap-2 flex-wrap">
          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors">
            Todos
          </button>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
            Departamentos
          </button>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
            Casas
          </button>
        </div>
      </div>

      {/* Property List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            isHovered={hoveredPropertyId === property.id}
            onHover={() => onPropertyHover?.(property)}
            onLeave={() => onPropertyHover?.(null)}
            onClick={() => onPropertyClick?.(property)}
          />
        ))}
      </div>
    </div>
  )
}