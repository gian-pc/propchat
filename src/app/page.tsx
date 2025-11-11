'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/layout/Navbar'
import ChatWidget from '@/components/chat/ChatWidget'
import PropertyDetailsModal from '@/components/property/PropertyDetailsModal'
import PropertyList from '@/components/property/PropertyList'
import { api, Property, PropertyFilters } from '@/services/api' 
import { toast } from 'sonner' // Para mostrar notificaciones

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

// Define el tipo para el Bbox
type BBox = [number, number, number, number];

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
  const [departmentBbox, setDepartmentBbox] = useState<BBox | null>(null); 

  // Bandera para saber si el cambio de filtro vino del chat
  const [isChatFiltering, setIsChatFiltering] = useState(false);

  // --- useEffect de Carga (MODIFICADO) ---
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const responseData = await api.getProperties(filters);
        setAllProperties(responseData.properties);
        
        // Si no estamos filtrando por chat, ocultamos la lista. 
        if (!isChatFiltering) {
          handleClearSelection(); 
        }

        if (Object.keys(filters).length > 0) {
             toast.success(`${responseData.properties.length} propiedades encontradas con los filtros aplicados.`);
        }

      } catch (error) {
        console.error("Error fetching properties in page:", error)
        toast.error("Error al cargar propiedades. Revisa tu backend.");
      } finally {
        setLoading(false);
        setIsChatFiltering(false); // Reseteamos la bandera
      }
    };
    fetchProperties()
  }, [filters]);


  // Función para limpiar la selección y OCULTAR LISTA al inicio
  const handleClearSelection = () => {
    setDisplayedProperties([]); // OCULTA LA LISTA AL INICIO
    setHoveredProperty(null);
    setSelectedProperty(null);
    setPanToProperty(null);
    setSelectedDepartment(null);
    setDepartmentBbox(null);
  };
  
  // Función para manejar el clic en la tarjeta (muestra modal, centra mapa)
  const handleCardClick = (property: Property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
    setPanToProperty(property); 
  };
  
  // Función para manejar el clic en el marcador (activa lista, centra mapa)
  const handleMarkerClick = (property: Property) => {
    setDisplayedProperties([property]); 
    setPanToProperty(property); // Centra en la propiedad
    setSelectedDepartment(property.department.toUpperCase()); // Selecciona visualmente el dpto
    setDepartmentBbox(null);
  };
  
  // FUNCIÓN MODIFICADA: Llamada desde el mapa (con BBox) O desde la IA (con BBox=null)
  const handleDepartmentSelect = (departmentName: string, bbox: BBox | null) => {
    const upperDeptName = departmentName.toUpperCase();
    
    // Filtra las propiedades que coinciden con el nombre del departamento
    const filteredPropsByDept = allProperties.filter(
        p => p.department && p.department.toUpperCase() === upperDeptName
    );

    setDisplayedProperties(filteredPropsByDept); // Muestra la lista
    setSelectedDepartment(upperDeptName); // Resalta el polígono
    setPanToProperty(null); 
    setDepartmentBbox(bbox); // Hace zoom inteligente si el BBox no es nulo
  }
  
  // --- FUNCIÓN DEL CHAT (CORREGIDA PARA SINCRONIZACIÓN) ---
  const handleAIChatFilters = (aiFilters: PropertyFilters) => {
    if (!aiFilters) return;

    const departmentName = aiFilters.department;
    
    // Separamos el department del resto de filtros de la API
    const { department, ...restOfFiltersFromAI } = aiFilters;
    
    // 1. Aplicamos los filtros de la API (Esto recarga la data)
    const newFilters = { ...filters, ...restOfFiltersFromAI };
    setFilters(newFilters);
    setIsChatFiltering(true); // Ponemos la bandera de que es un filtro de chat

    // 2. Si hay un departamento, SIMULAMOS LA SELECCIÓN DEL MAPA
    if (departmentName) {
      const upperDeptName = departmentName.toUpperCase();
      
      // Buscamos la primera propiedad para centrar la vista
      const firstProp = allProperties.find(
          p => p.department && p.department.toUpperCase() === upperDeptName
      );

      if (firstProp) {
          // Centramos el mapa en la propiedad del departamento (esto activa el pan)
          setPanToProperty(firstProp); 
          
          // Resaltamos el polígono. (Pasamos NULL porque no tenemos el BBox aquí)
          setSelectedDepartment(upperDeptName);
          
          // Filtramos la lista visible para que SOLO muestre las de ese dpto.
          const filteredPropsByDept = allProperties.filter(p => p.department && p.department.toUpperCase() === upperDeptName);
          setDisplayedProperties(filteredPropsByDept);
          
          toast.info(`Filtros de chat aplicados. Centrando en ${departmentName}.`);

      } else {
          // Si no encontramos propiedades en el dpto, limpiamos el mapa
          toast.warning(`La IA sugirió ${departmentName}, pero no se encontraron propiedades.`);
          handleClearSelection();
      }
    }
  };
  
  // --- (El resto de funciones) ---
  const handleFilterChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters);
    handleClearSelection(); // Limpiamos la selección del mapa al usar el Navbar
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };
  
  // ... (otros handlers sin cambios) ...


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
            properties={allProperties}
            filteredProperties={displayedProperties} // Aquí pasamos las filtradas
            hoveredPropertyId={hoveredProperty?.id}
            onMarkerClick={handleMarkerClick}
            panToProperty={panToProperty}
            onDepartmentSelect={handleDepartmentSelect}
            selectedDepartment={selectedDepartment}
            departmentBbox={departmentBbox}
          />
          {/* ¡Le pasamos la nueva función al ChatWidget! */}
          <ChatWidget onFiltersExtracted={handleAIChatFilters} /> 
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
              properties={displayedProperties} // Muestra la lista de propiedades visibles
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