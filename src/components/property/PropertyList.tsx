'use client'

import { useState } from 'react'
import { Property } from '@/types/property'
import PropertyCard from './PropertyCard'
import { Slider } from '@/components/ui/slider'

interface PropertyListProps {
  properties: Property[]
  onPropertyHover?: (property: Property | null) => void
  onPropertyClick?: (property: Property) => void
  hoveredPropertyId?: string | null
}

type FilterType = 'all' | 'apartment' | 'house' | 'studio' | 'loft'

export default function PropertyList({
  properties,
  onPropertyHover,
  onPropertyClick,
  hoveredPropertyId
}: PropertyListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [priceRange, setPriceRange] = useState<number[]>([0, 4000])
  const [bedroomFilter, setBedroomFilter] = useState<number | null>(null)

  // Filtrar propiedades
  const filteredProperties = properties.filter((property) => {
    // Filtro por tipo
    if (activeFilter !== 'all' && property.type !== activeFilter) {
      return false
    }

    // Filtro por precio
    if (property.price < priceRange[0] || property.price > priceRange[1]) {
      return false
    }

    // Filtro por habitaciones
    if (bedroomFilter !== null && property.bedrooms !== bedroomFilter) {
      return false
    }

    return true
  })

  const filterButtons: { label: string; value: FilterType; icon: string }[] = [
    { label: 'Todos', value: 'all', icon: '🏠' },
    { label: 'Departamentos', value: 'apartment', icon: '🏢' },
    { label: 'Casas', value: 'house', icon: '🏡' },
    { label: 'Estudios', value: 'studio', icon: '🚪' },
    { label: 'Lofts', value: 'loft', icon: '🏭' },
  ]

  const bedroomOptions = [
    { label: 'Todas', value: null },
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4+', value: 4 },
  ]

  return (
    <div className="w-full md:w-96 h-full bg-white shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <h2 className="text-xl font-bold">Propiedades Disponibles</h2>
        <p className="text-sm text-blue-100 mt-1">
          {filteredProperties.length} de {properties.length} propiedades
        </p>
      </div>

      {/* Filters Section */}
      <div className="p-4 border-b bg-gray-50 space-y-4 max-h-[400px] overflow-y-auto">
        {/* Type Filters */}
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-2 block">
            TIPO DE PROPIEDAD
          </label>
          <div className="flex gap-2 flex-wrap">
            {filterButtons.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeFilter === filter.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.icon} {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Slider */}
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-2 block">
            RANGO DE PRECIO (mensual)
          </label>
          <div className="space-y-3">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              min={0}
              max={4000}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-sm font-medium text-gray-700">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                ${priceRange[0]}
              </span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                ${priceRange[1]}
              </span>
            </div>
          </div>
        </div>

        {/* Bedroom Filter */}
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-2 block">
            HABITACIONES
          </label>
          <div className="flex gap-2">
            {bedroomOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => setBedroomFilter(option.value)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  bedroomFilter === option.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reset Filters Button */}
        {(activeFilter !== 'all' ||
          priceRange[0] !== 0 ||
          priceRange[1] !== 4000 ||
          bedroomFilter !== null) && (
          <button
            onClick={() => {
              setActiveFilter('all')
              setPriceRange([0, 4000])
              setBedroomFilter(null)
            }}
            className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors text-sm"
          >
            🔄 Limpiar filtros
          </button>
        )}
      </div>

      {/* Property List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isHovered={hoveredPropertyId === property.id}
              onHover={() => onPropertyHover?.(property)}
              onLeave={() => onPropertyHover?.(null)}
              onClick={() => onPropertyClick?.(property)}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 font-medium">
              No se encontraron propiedades
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Intenta ajustar los filtros
            </p>
          </div>
        )}
      </div>
    </div>
  )
}