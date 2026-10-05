/**
 * Location geocoding & coordinate database service for Bucharest events.
 * Maps addresses/neighborhoods/landmarks to SVG viewbox coordinates (210 x 297).
 * Supports fallback dynamic geocoding via OpenStreetMap Nominatim API + bounding box conversion.
 */

export interface LocationCoords {
  cx: number;
  cy: number;
}

// Bounding box for Bucharest map in real Lat/Lng
const BUCHAREST_BOUNDS = {
  minLat: 44.33,
  maxLat: 44.55,
  minLng: 25.95,
  maxLng: 26.25,
};

// Map SVG ViewBox dimensions
const SVG_WIDTH = 210;
const SVG_HEIGHT = 297;

/**
 * Converts latitude & longitude to SVG map coordinates (0..210, 0..297).
 */
export function latLngToSvgCoords(lat: number, lng: number): LocationCoords {
  // Clamp values within Bucharest bounds
  const clampedLat = Math.max(BUCHAREST_BOUNDS.minLat, Math.min(BUCHAREST_BOUNDS.maxLat, lat));
  const clampedLng = Math.max(BUCHAREST_BOUNDS.minLng, Math.min(BUCHAREST_BOUNDS.maxLng, lng));

  // Normalized (0..1)
  const normX = (clampedLng - BUCHAREST_BOUNDS.minLng) / (BUCHAREST_BOUNDS.maxLng - BUCHAREST_BOUNDS.minLng);
  // Latitude decreases as Y increases in SVG space (top is higher lat)
  const normY = 1 - (clampedLat - BUCHAREST_BOUNDS.minLat) / (BUCHAREST_BOUNDS.maxLat - BUCHAREST_BOUNDS.minLat);

  return {
    cx: Math.round(normX * SVG_WIDTH),
    cy: Math.round(normY * SVG_HEIGHT),
  };
}

/**
 * Pre-computed Location / Neighborhood Coordinates Database (SVG Space)
 */
export const LOCATION_DATABASE: Record<string, LocationCoords> = {
  // Neighborhood Centers
  romexpo: { cx: 90, cy: 68 },
  floreasca: { cx: 118, cy: 82 },
  "drumul-taberei": { cx: 58, cy: 148 },
  "old-town": { cx: 102, cy: 124 },
  centru: { cx: 102, cy: 124 },
  berceni: { cx: 120, cy: 210 },
  pantelimon: { cx: 165, cy: 120 },
  militari: { cx: 45, cy: 130 },
  titan: { cx: 155, cy: 160 },
  colentina: { cx: 140, cy: 75 },
  pipera: { cx: 125, cy: 45 },
  tineretului: { cx: 110, cy: 165 },
  cotroceni: { cx: 75, cy: 130 },

  // Landmark & Popular Venue Database
  "parc floreasca": { cx: 118, cy: 80 },
  "parcul floreasca": { cx: 118, cy: 80 },
  "hala romexpo": { cx: 90, cy: 68 },
  "parcul drumul taberei": { cx: 55, cy: 152 },
  "parc drumul taberei": { cx: 55, cy: 152 },
  "centrul vechi": { cx: 102, cy: 126 },
  "piazza uniri": { cx: 104, cy: 135 },
  "piata unirii": { cx: 104, cy: 135 },
  "piata victoriei": { cx: 100, cy: 95 },
  "ateneul roman": { cx: 102, cy: 112 },
  "parcul herastrau": { cx: 95, cy: 60 },
  "king michael i park": { cx: 95, cy: 60 },
  "parcul tineretului": { cx: 110, cy: 165 },
  "parcul carol": { cx: 100, cy: 155 },
  "national arena": { cx: 150, cy: 130 },
  "arena nationala": { cx: 150, cy: 130 },
  "universitatea bucuresti": { cx: 102, cy: 118 },
  "palatul parlamentului": { cx: 90, cy: 135 },
};

/**
 * Cache for runtime geocoded query results to avoid redundant API hits.
 */
const geocodeCache = new Map<string, LocationCoords>();

/**
 * Resolves map coordinates for an event automatically.
 * 1. Checks exact event coordinates if provided.
 * 2. Checks local Database (Address / Title / Neighborhood).
 * 3. Dynamically queries OpenStreetMap Nominatim API (Google/OSM free geocoding).
 * 4. Offsets overlapping markers dynamically so pins don't overlap.
 */
export async function getEventCoordinates(event: {
  id: string;
  neighborhood: string;
  address?: string;
  title?: string;
  localizedTitle?: string;
  coordinates?: { lat: number; lng: number };
}): Promise<LocationCoords> {
  // If exact lat/lng is attached to the event
  if (event.coordinates?.lat && event.coordinates?.lng) {
    return latLngToSvgCoords(event.coordinates.lat, event.coordinates.lng);
  }

  const searchTerms = [
    event.address,
    event.title,
    event.localizedTitle,
    event.neighborhood,
  ].filter(Boolean) as string[];

  // Check Local Landmark/Address Database
  for (const term of searchTerms) {
    const key = term.toLowerCase().trim();
    if (LOCATION_DATABASE[key]) {
      return LOCATION_DATABASE[key];
    }
  }

  // Primary Query for Geocoding API
  const query = (event.address || event.neighborhood) + ", Bucharest, Romania";
  const cacheKey = query.toLowerCase();

  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  // Dynamic API search (Nominatim Geocoding API)
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=1`,
      {
        headers: {
          "Accept-Language": "en,ro",
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const coords = latLngToSvgCoords(lat, lon);
        geocodeCache.set(cacheKey, coords);
        return coords;
      }
    }
  } catch {
    // Fallback on network failure
  }

  // Default Fallback: Neighborhood lookup or Center of Bucharest
  const fallback = LOCATION_DATABASE[event.neighborhood] || { cx: 105, cy: 148 };
  return fallback;
}

/**
 * Dynamically computes automatic pinpoint positions for an array of events,
 * applying collision displacement so pins at identical locations disperse nicely.
 */
export function calculateDynamicEventPositions<
  T extends {
    id: string;
    neighborhood: string;
    address?: string;
    title?: string;
    localizedTitle?: string;
    coordinates?: { lat: number; lng: number };
  }
>(events: T[]): Map<string, LocationCoords> {
  const positionsMap = new Map<string, LocationCoords>();
  const occupancyCount = new Map<string, number>();

  for (const evt of events) {
    const searchTerms = [
      evt.address,
      evt.title,
      evt.localizedTitle,
      evt.neighborhood,
    ].filter(Boolean) as string[];

    let coords: LocationCoords | null = null;

    if (evt.coordinates?.lat && evt.coordinates?.lng) {
      coords = latLngToSvgCoords(evt.coordinates.lat, evt.coordinates.lng);
    } else {
      for (const term of searchTerms) {
        const key = term.toLowerCase().trim();
        if (LOCATION_DATABASE[key]) {
          coords = LOCATION_DATABASE[key];
          break;
        }
      }
    }

    if (!coords) {
      coords = LOCATION_DATABASE[evt.neighborhood] || { cx: 105, cy: 148 };
    }

    // Handle pin collision displacement (jittering in a slight ring)
    const baseKey = `${coords.cx},${coords.cy}`;
    const count = occupancyCount.get(baseKey) || 0;
    occupancyCount.set(baseKey, count + 1);

    if (count > 0) {
      const angle = (count * 2.4); // spiral angle
      const distance = 8 + count * 3; // radius offset
      const cx = Math.round(coords.cx + Math.cos(angle) * distance);
      const cy = Math.round(coords.cy + Math.sin(angle) * distance);
      positionsMap.set(evt.id, { cx, cy });
    } else {
      positionsMap.set(evt.id, coords);
    }
  }

  return positionsMap;
}
