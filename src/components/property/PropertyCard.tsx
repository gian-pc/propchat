// src/components/property/PropertyCard.tsx
'use client'

import { Property } from '@/services/api'
import Image from 'next/image'
import { IoBedOutline } from 'react-icons/io5'
import { LuBath } from 'react-icons/lu'
import { TfiRulerAlt } from 'react-icons/tfi'

interface PropertyCardProps {
  property: Property
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export default function PropertyCard({ 
  property, 
  onClick, 
  onMouseEnter, 
  onMouseLeave 
}: PropertyCardProps) {
  
  return (
    <div 
      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative w-full h-48">
        <Image
          src={property.imageUrl || '/placeholder-image.jpg'} // Asegúrate de tener un placeholder
          alt={property.title}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 ease-in-out hover:scale-105"
        />
      </div>
      
      <div className="p-4">
        {/* Precio */}
        <p className="text-2xl font-bold text-blue-600">
          ${property.price.toLocaleString('en-US')}
          <span className="text-sm font-normal text-gray-500">/mes</span>
        </p>
        
        {/* Título */}
        <h3 className="text-lg font-semibold text-gray-800 mt-2 truncate">
          {property.title}
        </h3>
        
        {/* Distrito */}
        <p className="text-sm text-gray-500 truncate">
          {property.district}
        </p>

        {/* Detalles (Camas, Baños, Área) */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mt-3 pt-3 border-t">
          <div className="flex items-center gap-1.5">
            <IoBedOutline className="w-5 h-5 text-gray-500" />
            <span>{property.bedrooms} hab.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <LuBath className="w-4 h-4 text-gray-500" />
            <span>{property.bathrooms} baños</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TfiRulerAlt className="w-4 h-4 text-gray-500" />
            <span>{property.area} m²</span>
          </div>
        </div>
      </div>
    </div>
  )
}