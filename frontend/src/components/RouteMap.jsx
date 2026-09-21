import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const RouteMap = ({ route }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      console.warn('VITE_MAPBOX_ACCESS_TOKEN is not set');
      return;
    }

    if (!containerRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      projection: 'mercator',
      center: [
        (route.origin.lon + route.destination.lon) / 2,
        (route.origin.lat + route.destination.lat) / 2,
      ],
      zoom: 6,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    mapRef.current = map;

    map.on('load', () => {
      if (route.geometry && Array.isArray(route.geometry.coordinates)) {
        const geojson = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route.geometry.coordinates,
          },
        };

        map.addSource('route-line', {
          type: 'geojson',
          data: geojson,
        });

        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route-line',
          paint: {
            'line-color': '#3b82f6',
            'line-width': 4,
          },
        });
      }

      new mapboxgl.Marker({ color: 'green' })
        .setLngLat([route.origin.lon, route.origin.lat])
        .setPopup(new mapboxgl.Popup().setText(route.origin.name))
        .addTo(map);

      new mapboxgl.Marker({ color: 'red' })
        .setLngLat([route.destination.lon, route.destination.lat])
        .setPopup(new mapboxgl.Popup().setText(route.destination.name))
        .addTo(map);

      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([route.origin.lon, route.origin.lat]);
      bounds.extend([route.destination.lon, route.destination.lat]);

      if (route.geometry && Array.isArray(route.geometry.coordinates)) {
        route.geometry.coordinates.forEach((coord) => bounds.extend(coord));
      }

      map.fitBounds(bounds, { padding: 60, maxZoom: 12 });
    });

    return () => {
      mapRef.current?.remove();
    };
  }, [route]);

  return <div ref={containerRef} className="w-full h-64 rounded-lg overflow-hidden" />;
};

export default RouteMap;
