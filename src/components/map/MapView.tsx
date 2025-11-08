'use client';

import { useEffect, useRef, useState } from 'react';
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

  // Add property markers - MEJORADO
useEffect(() => {
  if (!map.current || properties.length === 0) return;

  const addMarkers = () => {
    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    properties.forEach((property) => {
      if (!map.current) return;

      // Create marker element
      const el = document.createElement('div');
      el.className = 'property-marker';
      
      // Color based on price
      const color = property.price < 1500 
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
        transition: all 0.2s;
      `;
      
      el.textContent = `$${property.price}`;

      // Hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.15)';
        el.style.zIndex = '1000';
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.zIndex = '1';
      });

      // Create marker
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat([property.longitude, property.latitude])
        .addTo(map.current);

      // Create popup
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,
        closeOnClick: false
      }).setHTML(`
        <div style="padding: 12px; min-width: 200px;">
          <h3 style="font-weight: 600; margin-bottom: 8px; color: #1f2937;">${property.title}</h3>
          <p style="margin: 4px 0; color: #3b82f6; font-weight: 600; font-size: 16px;">$${property.price}/mes</p>
          <p style="margin: 4px 0; color: #6b7280;">${property.bedrooms} habitaciones • ${property.bathrooms} baños</p>
          <p style="margin: 4px 0; color: #6b7280;">${property.area}m² • ${property.district}</p>
        </div>
      `);

      // Show popup on hover
      el.addEventListener('mouseenter', () => {
        marker.setPopup(popup);
        popup.addTo(map.current!);
      });

      el.addEventListener('mouseleave', () => {
        popup.remove();
      });

      markersRef.current.push(marker);
    });

    console.log(`Added ${markersRef.current.length} markers to map`);
  };

  // Wait for map to be fully loaded
  if (map.current.loaded()) {
    addMarkers();
  } else {
    map.current.on('load', addMarkers);
  }

  return () => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
  };
}, [properties]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-77.0428, -12.0464],
      zoom: 12,
      pitch: 45,
      bearing: 0,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;

      // Add 3D buildings
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
  }, []);

  // Add property markers
  useEffect(() => {
    if (!map.current || properties.length === 0 || !map.current.loaded()) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    properties.forEach((property) => {
      if (!map.current) return;

      // Create marker element
      const el = document.createElement('div');
      el.className = 'property-marker';
      
      // Color based on price
      const color = property.price < 1500 
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
        transition: all 0.2s;
      `;
      
      el.textContent = `$${property.price}`;

      // Hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.15)';
        el.style.zIndex = '1000';
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.zIndex = '1';
      });

      // Create marker
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat([property.longitude, property.latitude])
        .addTo(map.current);

      // Create popup
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,
        closeOnClick: false
      }).setHTML(`
        <div style="padding: 12px; min-width: 200px;">
          <h3 style="font-weight: 600; margin-bottom: 8px; color: #1f2937;">${property.title}</h3>
          <p style="margin: 4px 0; color: #3b82f6; font-weight: 600; font-size: 16px;">$${property.price}/mes</p>
          <p style="margin: 4px 0; color: #6b7280;">${property.bedrooms} habitaciones • ${property.bathrooms} baños</p>
          <p style="margin: 4px 0; color: #6b7280;">${property.area}m² • ${property.district}</p>
        </div>
      `);

      // Show popup on hover
      el.addEventListener('mouseenter', () => {
        marker.setPopup(popup);
        popup.addTo(map.current!);
      });

      el.addEventListener('mouseleave', () => {
        popup.remove();
      });

      markersRef.current.push(marker);
    });
  }, [properties]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {loading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-10">
          <p className="text-sm font-medium text-gray-700">Cargando propiedades...</p>
        </div>
      )}
      
      {!loading && properties.length > 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-10">
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