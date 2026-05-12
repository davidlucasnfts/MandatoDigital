import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

interface Props {
  points: Array<[number, number, number]>; // [lat, lng, intensity]
  radius?: number;
  blur?: number;
  maxZoom?: number;
  max?: number;
  gradient?: Record<number, string>;
}

export default function HeatmapLayer({
  points,
  radius = 25,
  blur = 15,
  maxZoom = 17,
  max = 1.0,
  gradient = { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1: 'red' },
}: Props) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    // @ts-ignore — leaflet.heat extende L.Layer
    const heatLayer = L.heatLayer(points as any, {
      radius,
      blur,
      maxZoom,
      max,
      gradient,
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, radius, blur, maxZoom, max, gradient]);

  return null;
}
