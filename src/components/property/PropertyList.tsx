// src/components/property/PropertyList.tsx
'use client'

import { Property } from '@/services/api'
import PropertyCard from './PropertyCard'
import { IoCloseCircleOutline } from 'react-icons/io5' // Para el botón de limpiar

interface PropertyListProps {
  properties: Property[];
  loading: boolean;
  onPropertySelect: (property: Property) => void;
  onPropertyHover: (property: Property | null) => void;
  onClearSelection: () => void; // <-- ¡NUEVA PROP!
}

export default function PropertyList({ 
  properties, 
  loading, 
  onPropertySelect, 
  onPropertyHover,
  onClearSelection // <-- Recibimos la nueva prop
}: PropertyListProps) {
  
  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Cargando propiedades...
      </div>
    )
  }

  return (
    <div className="h-full">
      {/* Encabezado de la lista */}
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10 flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {properties.length === 0 
            ? 'Haz clic en un marcador' 
            : `${properties.length} ${properties.length === 1 ? 'propiedad' : 'propiedades'}`
          }
        </h2>
        {properties.length > 0 && ( // Solo muestra el botón si hay propiedades en la lista
          <button 
            onClick={onClearSelection} 
            className="flex items-center text-red-500 hover:text-red-700 text-sm"
          >
            <IoCloseCircleOutline className="w-5 h-5 mr-1" />
            Limpiar selección
          </button>
        )}
      </div>

      {/* Contenedor de las tarjetas */}
      <div className="p-2 grid grid-cols-1 gap-2">
        {properties.length === 0 ? (
          <p className="p-4 text-center text-gray-500">
            No hay propiedades seleccionadas para mostrar.
          </p>
        ) : (
          properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={() => onPropertySelect(property)}
              onMouseEnter={() => onPropertyHover(property)}
              onMouseLeave={() => onPropertyHover(null)}
            />
          ))
        )}
      </div>
    </div>
  )
}