'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl, { LngLatBounds } from 'mapbox-gl'; 
import 'mapbox-gl/dist/mapbox-gl.css';
import { Property } from '@/services/api'; 
import * as turf from '@turf/turf';
import { Feature, FeatureCollection, Point } from 'geojson';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const PROPERTY_TYPE_COLORS = {
  apartment: '#3b82f6', 
  house: '#10b981',
  default: '#6b7280', 
};

// --- Props (sin cambios) ---
interface MapViewProps {
  properties: Property[];
  filteredProperties: Property[];
  hoveredPropertyId?: string | null;
  onMarkerClick: (property: Property) => void;
  panToProperty: Property | null;
  onDepartmentSelect: (departmentName: string, bbox: [number, number, number, number]) => void;
  selectedDepartment: string | null;
  departmentBbox: [number, number, number, number] | null;
}

export default function Map({ 
  properties, 
  filteredProperties, 
  hoveredPropertyId, 
  onMarkerClick, 
  panToProperty,
  onDepartmentSelect, 
  selectedDepartment,
  departmentBbox 
}: MapViewProps) {
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const selectedDeptId = useRef<string | number | null>(null);
  const hoveredDeptId = useRef<string | number | null>(null);
  const activePopup = useRef<mapboxgl.Popup | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // --- 1. useEffect de Inicialización (COMPLETO) ---
  useEffect(() => {
    if (!mapContainer.current || map.current) return; 

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-75.015152, -9.189967],
      zoom: 4.8,
      pitch: 0,
      bearing: 0,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;
      const currentMap = map.current;

      // 1. Añadir Source (Departamentos)
      currentMap.addSource('departamentos-source', {
        type: 'geojson',
        data: '/departamentos-peru.geojson', 
        generateId: true 
      });

      // 2. Añadir Layer Fill (Departamentos)
      currentMap.addLayer({
        id: 'departamentos-fill',
        type: 'fill',
        source: 'departamentos-source',
        paint: {
          'fill-color': '#10b981', 
          'fill-opacity': [ 
            'case',
            ['all', ['boolean', ['feature-state', 'hover'], false], ['!', ['boolean', ['feature-state', 'selected'], false]]], 0.3,
            0.0
          ]
        }
      });

      // 3. Añadir Layer Borders (Departamentos)
      currentMap.addLayer({
        id: 'departamentos-borders', 
        type: 'line',
        source: 'departamentos-source',
        paint: {
          'line-color': [ 
            'case',
            ['boolean', ['feature-state', 'selected'], false], '#3b82f6', // AZUL si 'selected'
            '#aaaaaa' // Gris por defecto
          ],
          'line-width': [ 
            'case',
            ['boolean', ['feature-state', 'selected'], false], 2.5, // 2.5px si 'selected'
            1 // 1px por defecto
          ],
          'line-opacity': [ 
            'case',
            ['boolean', ['feature-state', 'selected'], false], 1.0, // Sólido si 'selected'
            0.8 // Semi-transparente por defecto
          ],
          'line-dasharray': ['literal', []] // SÓLIDO siempre
        }
      });

      // 4. Clic en DEPARTAMENTO
      currentMap.on('click', 'departamentos-fill', (e) => {
        if (activePopup.current) {
          activePopup.current.remove();
          activePopup.current = null;
        }
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        if (selectedDeptId.current !== null) {
          currentMap.setFeatureState({ source: 'departamentos-source', id: selectedDeptId.current }, { selected: false });
        }
        selectedDeptId.current = feature.id ?? null;
        if (selectedDeptId.current !== null) {
          currentMap.setFeatureState({ source: 'departamentos-source', id: selectedDeptId.current }, { selected: true });
        }
        const deptName = feature.properties?.NOMBDEP;
        const [minLng, minLat, maxLng, maxLat] = turf.bbox(feature.geometry as any);
        const bbox: [number, number, number, number] = [minLng, minLat, maxLng, maxLat];
        if (deptName) {
          onDepartmentSelect(deptName, bbox);
        }
      });
      
      // 5. Mousemove (Departamentos)
      currentMap.on('mousemove', 'departamentos-fill', (e) => {
        currentMap.getCanvas().style.cursor = 'pointer';
        if (!e.features || e.features.length === 0) return;
        if (hoveredDeptId.current !== null) {
          currentMap.setFeatureState({ source: 'departamentos-source', id: hoveredDeptId.current }, { hover: false });
        }
        hoveredDeptId.current = e.features[0].id ?? null;
        if (hoveredDeptId.current !== null) {
          currentMap.setFeatureState({ source: 'departamentos-source', id: hoveredDeptId.current }, { hover: true });
        }
      });
      
      // 6. Mouseleave (Departamentos)
      currentMap.on('mouseleave', 'departamentos-fill', () => {
        currentMap.getCanvas().style.cursor = '';
        if (hoveredDeptId.current !== null) {
          currentMap.setFeatureState({ source: 'departamentos-source', id: hoveredDeptId.current }, { hover: false });
        }
        hoveredDeptId.current = null;
      });

      // --- Capa de Marcadores (Propiedades) ---
      currentMap.addSource('properties-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
      currentMap.addLayer({
        id: 'properties-circles',
        type: 'circle',
        source: 'properties-source',
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': ['case', ['boolean', ['get', 'isHovered'], false], 10, 6],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': ['get', 'opacity'],
          'circle-pitch-alignment': 'map'
        }
      });
      currentMap.on('click', 'properties-circles', (e) => {
        if (!e.features || e.features.length === 0) return;
        const clickedProperty = JSON.parse(e.features[0].properties!.propertyString);
        onMarkerClick(clickedProperty as Property);
      });
      currentMap.on('mouseenter', 'properties-circles', () => {
        currentMap.getCanvas().style.cursor = 'pointer';
      });
      currentMap.on('mouseleave', 'properties-circles', () => {
        currentMap.getCanvas().style.cursor = '';
      });

      // Clic en el MAPA BASE
      currentMap.on('click', () => {
        if (activePopup.current) {
          activePopup.current.remove();
          activePopup.current = null;
        }
      });

      // Avisamos que el mapa está listo
      setIsMapLoaded(true);

    }); // Fin del map.on('load')

  }, []); // Fin del useEffect de inicialización


  // --- 2. useEffect de Marcadores (COMPLETO) ---
  useEffect(() => {
    if (!isMapLoaded || !map.current || !map.current.getSource('properties-source') || !properties) {
      return;
    }
    
    // 1. Convertimos 'properties' en 'features' GeoJSON
    const features: Feature<Point>[] = properties.map((property) => {
      const isHovered = property.id === hoveredPropertyId;
      const isFiltered = filteredProperties.some(p => p.id === property.id);
      const hasSelectedDepartment = selectedDepartment !== null;

      let opacity = 1.0;
      if (hasSelectedDepartment && !isFiltered) {
        opacity = 0.3;
      }
      
      let color = PROPERTY_TYPE_COLORS.default;
      if (property.type === 'apartment') color = PROPERTY_TYPE_COLORS.apartment;
      if (property.type === 'house') color = PROPERTY_TYPE_COLORS.house;

      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [property.longitude, property.latitude] },
        properties: {
          propertyString: JSON.stringify(property), 
          isHovered: isHovered,
          opacity: opacity,
          color: color
        }
      };
    });

    const geojson: FeatureCollection<Point> = {
      type: 'FeatureCollection',
      features: features
    };

    // 3. Actualizamos la fuente de datos en el mapa
    (map.current.getSource('properties-source') as mapboxgl.GeoJSONSource).setData(geojson);

  }, [isMapLoaded, properties, filteredProperties, hoveredPropertyId, selectedDepartment]);


  // --- 3. useEffect de Panning por MARCADOR (CORREGIDO) ---
  useEffect(() => {
    if (!map.current) return;

    if (activePopup.current) {
      activePopup.current.remove();
      activePopup.current = null;
    }

    if (panToProperty) { 
      const sidebarWidthInPixels = window.innerWidth * (2 / 5);
      
      // Altura del chat: ~200px (alto) + 24px (margen inferior)
      const chatWidgetHeight = 224; 
      
      map.current.easeTo({
        center: [panToProperty.longitude, panToProperty.latitude],
        padding: { top: 0, bottom: chatWidgetHeight, left: 0, right: sidebarWidthInPixels }, // <-- ¡ARREGLO CHAT!
        duration: 1000 
      });

      // 3. ...¡Crea y muestra el popup!
      activePopup.current = new mapboxgl.Popup({ 
          offset: 25, 
          closeButton: false,
          closeOnClick: false
        })
        .setLngLat([panToProperty.longitude, panToProperty.latitude])
        .setHTML(`
          <div style="padding: 12px; min-width: 200px;">
            <h3 style="font-weight: 600; margin-bottom: 8px;">${panToProperty.title}</h3> 
            <p style="margin: 4px 0; color: #3b82f6; font-weight: 600;">$${panToProperty.price}/mes</p>
          </div>
        `)
        .addTo(map.current);
    }
  }, [panToProperty]); 
  
  
  // --- 4. useEffect para Zoom a DEPARTAMENTO (COMPLETO) ---
  useEffect(() => {
    if (!map.current) return;
    if (activePopup.current) {
      activePopup.current.remove();
      activePopup.current = null;
    }
    if (departmentBbox) {
      const sidebarWidthInPixels = window.innerWidth * (2 / 5);
      map.current.fitBounds(departmentBbox, {
        padding: { top: 50, bottom: 50, left: 50, right: sidebarWidthInPixels + 50 },
        duration: 1000
      });
    } else if (!panToProperty) { 
      map.current.easeTo({
        center: [-75.015152, -9.189967],
        zoom: 4.8, 
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        duration: 1000
      });
    }
  }, [departmentBbox]);
  
  
  // --- 5. Efecto para sincronizar estado (COMPLETO) ---
  useEffect(() => {
    if (!map.current || !map.current.loaded()) return;
    if (selectedDepartment === null && selectedDeptId.current !== null) {
      map.current.setFeatureState(
        { source: 'departamentos-source', id: selectedDeptId.current },
        { selected: false }
      );
      selectedDeptId.current = null;
    }
  }, [selectedDepartment]); 

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}