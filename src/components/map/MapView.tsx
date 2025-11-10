'use client';

import { useEffect, useRef, useState, useCallback } from 'react'; // Agregué useCallback por si lo necesitas más adelante
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { api, Property } from '@/services/api';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Función para cargar las propiedades desde el backend
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const responseData = await api.getProperties();
        setProperties(responseData.properties);
      } catch (error) {
        console.error('Error fetching properties:', error);
        // Aquí podrías agregar un estado para mostrar un mensaje de error en la UI si lo deseas
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []); // Se ejecuta solo una vez al montar el componente

  // Inicializar el mapa
  useEffect(() => {
    if (!mapContainer.current || map.current) return; // Si el contenedor no existe o el mapa ya está inicializado, salir

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-77.0428, -12.0464], // Centro de Lima
      zoom: 12,
      pitch: 45,
      bearing: 0,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;

      // Add 3D buildings layer
      const layers = map.current.getStyle().layers;
      const labelLayerId = layers?.find(
        (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
      )?.id;

      map.current.addLayer(
        {
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height'],
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height'],
            ],
            'fill-extrusion-opacity': 0.6,
          },
        },
        labelLayerId
      );
    });
  }, []); // Dependencia vacía para que se ejecute solo una vez al montar el componente

  // Add property markers logic
  useEffect(() => {
    if (!map.current || properties.length === 0) return;

    const currentMap = map.current; // Captura el mapa actual

    const addMarkers = () => {
      // Remove existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Add new markers
      properties.forEach((property) => {
        // Create marker element
        const el = document.createElement('div');
        el.className = 'property-marker';

        // Color based on price
        const color =
          property.price < 1500
            ? '#10b981'
            : property.price < 2500
            ? '#3b82f6'
            : '#8b5cf6';

        el.style.cssText = `
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: ${color};
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 11px;
          transition: all 0.1s ease-out; /* Transición más rápida y simple */
        `;

        el.textContent = `$${property.price}`;

        // Crear el marcador de Mapbox
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: 'center',
        })
          .setLngLat([property.longitude, property.latitude])
          .addTo(currentMap); // Usar el mapa capturado

        // Crear popup
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false, // El popup se cierra al mover el mouse o al hacer clic fuera
          closeOnClick: false,
        }).setHTML(`
          <div style="padding: 12px; min-width: 200px;">
            <h3 style="font-weight: 600; margin-bottom: 8px; color: #1f2937;">${property.title}</h3>
            <p style="margin: 4px 0; color: #3b82f6; font-weight: 600; font-size: 16px;">$${property.price}/mes</p>
            <p style="margin: 4px 0; color: #6b7280;">${property.bedrooms} habitaciones • ${property.bathrooms} baños</p>
            <p style="margin: 4px 0; color: #6b7280;">${property.area}m² • ${property.district}</p>
          </div>
        `);

        // Eventos para el elemento del marcador (el 'div' que creamos)
        el.addEventListener('mouseenter', () => {
          el.style.zIndex = '1000'; // Solo cambiamos el z-index
          popup.setLngLat([property.longitude, property.latitude]).addTo(currentMap);
        });

        el.addEventListener('mouseleave', () => {
          el.style.zIndex = '1';
          popup.remove();
        });

        // Al hacer clic en el marcador, puedes añadir aquí la lógica para abrir el modal de detalles
        // el.addEventListener('click', () => {
        //   // Por ejemplo: openPropertyDetailsModal(property.id);
        //   console.log('Clicked property:', property.id);
        // });

        markersRef.current.push(marker);
      });

      console.log(`Added ${markersRef.current.length} markers to map`);
    };

    // Asegurarse de que el mapa esté cargado antes de añadir marcadores
    if (currentMap.loaded()) {
      addMarkers();
    } else {
      currentMap.on('load', addMarkers);
    }

    // Función de limpieza para eliminar marcadores al desmontar o actualizar las propiedades
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      // Si usas currentMap.off('load', addMarkers), asegúrate de que addMarkers sea una función useCallback
      // currentMap.off('load', addMarkers); 
    };
  }, [properties, map.current]); // Dependencia del array de propiedades y del objeto map.current

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {loading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-10">
          <p className="text-sm font-medium text-gray-700">Cargando propiedades...</p>
        </div>
      )}

      {!loading && properties.length > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-10">
          <p className="text-sm font-medium text-gray-700">
            {properties.length} {properties.length === 1 ? 'propiedad' : 'propiedades'} encontradas
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-24 left-4 bg-white p-3 rounded-lg shadow-lg z-10">
        <p className="text-xs font-semibold text-gray-700 mb-2">Precios</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">{'< $1,500'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-600">$1,500 - $2,500</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            <span className="text-xs text-gray-600">{'> $2,500'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}