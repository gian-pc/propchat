// src/components/property/PropertyCard.tsx
'use client'

import { Property } from '@/types/property'

interface PropertyCardProps {
  property: Property
  isHovered?: boolean
  onHover?: () => void
  onLeave?: () => void
  onClick?: () => void
}

export default function PropertyCard({ 
  property, 
  isHovered, 
  onHover, 
  onLeave,
  onClick 
}: PropertyCardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden ${
        isHovered ? 'ring-2 ring-blue-500 scale-105' : ''
      }`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={property.imageUrl}
          alt={property.title}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
          ${property.price}/mes
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-1">
          {property.title}
        </h3>

        <p className="text-sm text-gray-500 mb-3">
          📍 {property.district}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            🛏️ {property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            🚿 {property.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            📐 {property.area}m²
          </span>
        </div>
      </div>
    </div>
  )
}