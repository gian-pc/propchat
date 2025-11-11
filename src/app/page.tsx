'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/layout/Navbar'
import ChatWidget from '@/components/chat/ChatWidget'
import PropertyDetailsModal from '@/components/property/PropertyDetailsModal'
import PropertyList from '@/components/property/PropertyList'
import { api, Property, PropertyFilters } from '@/services/api' 

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
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [allProperties, setAllProperties] = useState<Property[]>([]) 
  const [displayedProperties, setDisplayedProperties] = useState<Property[]>([]) 
  const [loading, setLoading] = useState(true)
  
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [panToProperty, setPanToProperty] = useState<Property | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [departmentBbox, setDepartmentBbox] = useState<[number, number, number, number] | null>(null);

  // useEffect de Carga
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const responseData = await api.getProperties(filters);
        setAllProperties(responseData.properties); // <-- Carga TODAS las propiedades
        handleClearSelection(); 
      } catch (error) {
        console.error("Error fetching properties in page:", error)
      } finally {
        setLoading(false)
      }
    };
    fetchProperties()
  }, [filters]);

  
  // Función del Navbar
  const handleFilterChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters);
  };

  // Clic en MARCADOR (Mapa)
  const handleMarkerClick = (property: Property) => {
    setDisplayedProperties([property]) 
    setPanToProperty(property) 
    setSelectedDepartment(null); 
    setDepartmentBbox(null); 
  }

  // Clic en TARJETA (Lista)
  const handleCardClick = (property: Property) => {
    setSelectedProperty(property)
    setIsModalOpen(true)
  }

  // Clic en MODAL (Cerrar)
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedProperty(null), 300)
  }
  
  // Clic en DEPARTAMENTO (Mapa)
  const handleDepartmentSelect = (departmentName: string, bbox: [number, number, number, number]) => {
    const upperDeptName = departmentName.toUpperCase();
    
    // Filtra desde 'allProperties'
    const filteredProps = allProperties.filter(
      p => p.department && p.department.toUpperCase() === upperDeptName
    );
    
    setDisplayedProperties(filteredProps); // <-- Actualiza la LISTA
    setSelectedDepartment(upperDeptName); 
    setPanToProperty(null); 
    setDepartmentBbox(bbox); 
  }

  // Clic en "Limpiar Selección"
  const handleClearSelection = () => {
    setDisplayedProperties([]) 
    setHoveredProperty(null)
    setSelectedProperty(null)
    setPanToProperty(null)
    setSelectedDepartment(null);
    setDepartmentBbox(null); 
  }


  return (
    <div className="flex flex-col h-screen w-full">
      
      <Navbar filters={filters} onFiltersChange={handleFilterChange} />

      <div className="flex flex-1 w-full overflow-hidden">
        
        {/* Columna 1: El Mapa */}
        <div 
          className={`
            h-full relative flex-shrink-0
            transition-all duration-300 ease-in-out
            ${displayedProperties.length > 0 ? 'w-3/5' : 'w-full'}
          `}
        >
          <MapView 
            properties={allProperties} // <-- ¡CLAVE! El mapa SIEMPRE recibe TODAS las props
            filteredProperties={displayedProperties} // <-- ¡NUEVO! Pasa las props filtradas
            hoveredPropertyId={hoveredProperty?.id}
            onMarkerClick={handleMarkerClick}
            panToProperty={panToProperty}
            onDepartmentSelect={handleDepartmentSelect}
            selectedDepartment={selectedDepartment}
            departmentBbox={departmentBbox}
          />
          <ChatWidget />
        </div>

        {/* Columna 2: La Lista */}
        <div 
          className={`
            h-full bg-white border-l border-gray-200
            transition-all duration-300 ease-in-out
            overflow-hidden 
            ${displayedProperties.length > 0 ? 'w-2/5' : 'w-0'}
          `}
        >
          <div className="w-full h-full overflow-y-auto">
            <PropertyList
              properties={displayedProperties} // <-- La lista SÍ recibe las props filtradas
              loading={loading}
              onPropertySelect={handleCardClick}
              onPropertyHover={setHoveredProperty}
              onClearSelection={handleClearSelection} 
            />
          </div>
        </div>

        {/* Modal */}
        <PropertyDetailsModal
          property={selectedProperty}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  )
}