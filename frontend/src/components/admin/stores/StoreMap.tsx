import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Store } from '../../../types/store';

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

interface StoreMapProps {
  stores: Store[];
  onMapClick?: (coordinates: { lat: number; lng: number }) => void;
  selectedCoordinates?: { lat: number; lng: number } | null;
}

export const StoreMap: React.FC<StoreMapProps> = ({
  stores,
  onMapClick,
  selectedCoordinates
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const selectedMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [0, 0],
      zoom: 0
    });

    // Add click event to select coordinates
    if (onMapClick) {
      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        onMapClick({ lat, lng });
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [onMapClick]);

  // Update markers when stores change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add markers for each store
    stores.forEach(store => {
      const marker = new mapboxgl.Marker({ color: '#3B82F6' })
        .setLngLat([store.longitude, store.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div>
              <h3 class="font-semibold">${store.name}</h3>
              <p class="text-sm text-gray-600">Lat: ${store.latitude.toFixed(6)}</p>
              <p class="text-sm text-gray-600">Lng: ${store.longitude.toFixed(6)}</p>
            </div>`
          )
        );

      if (map.current) {
        marker.addTo(map.current);
        markersRef.current[store.id] = marker;
      }
    });

    // Fit map to show all stores if any exist
    if (stores.length > 0 && map.current) {
      const bounds = new mapboxgl.LngLatBounds();
      stores.forEach(store => {
        bounds.extend([store.longitude, store.latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [stores]);

  // Update selected coordinates marker
  useEffect(() => {
    if (!map.current) return;

    // Remove previous selected marker
    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.remove();
      selectedMarkerRef.current = null;
    }

    // Add new selected marker if coordinates exist
    if (selectedCoordinates) {
      selectedMarkerRef.current = new mapboxgl.Marker({ color: '#10B981' })
        .setLngLat([selectedCoordinates.lng, selectedCoordinates.lat])
        .addTo(map.current);
    }
  }, [selectedCoordinates]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Store Locations</h3>
        <p className="text-sm text-gray-600">
          Interactive map showing all restaurant locations. Click on the map to select coordinates when creating a new store.
        </p>
      </div>
      <div
        ref={mapContainer}
        className="h-96 w-full"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};
