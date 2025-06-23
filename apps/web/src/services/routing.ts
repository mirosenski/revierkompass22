import { z } from 'zod';
import type { Coordinates, Revier, RouteResult } from '../stores/wizard';

// OSRM Response Schema - simplified for direct API usage without strict validation

// Valhalla API response schemas
const ValhallaLegSchema = z.object({
  distance: z.number(),
  time: z.number(),
  shape: z.string(), // encoded polyline
});

const ValhallaTripSchema = z.object({
  legs: z.array(ValhallaLegSchema),
  summary: z.object({
    time: z.number(),
    length: z.number(),
  }),
});

const ValhallaResponseSchema = z.object({
  trip: ValhallaTripSchema.optional(),
  alternates: z.array(ValhallaTripSchema).optional(),
});

// Turn-by-turn instruction types
export interface RouteInstruction {
  type: 'turn' | 'straight' | 'merge' | 'roundabout' | 'arrival';
  direction?: 'left' | 'right' | 'straight';
  street_name?: string;
  distance: number; // meters
  duration: number; // seconds
  coordinates: Coordinates;
  instruction: string;
}

export interface DetailedRouteResult {
  id: string;
  name: string;
  distance: number;
  duration: number;
  geometry?: {
    type: string;
    coordinates: [number, number][];
  };
  instructions: RouteInstruction[];
  provider: 'osrm' | 'valhalla';
  traffic_aware: boolean;
  alternative_routes: RouteResult[];
}

// Routing providers configuration - Enhanced with multiple endpoints
const OSRM_ENDPOINTS = [
  'https://router.project-osrm.org',
  'https://osrm-api.openstreetmap.de',
  'https://routing.openstreetmap.de'
];

// Additional Valhalla endpoints for future enhancement
// const VALHALLA_ENDPOINTS = [
//   'https://valhalla1.openstreetmap.de',
//   'https://api.openrouteservice.org/v2'
// ];

const VALHALLA_BASE_URL = 'https://valhalla1.openstreetmap.de';

// Get the best available endpoint
async function getBestOSRMEndpoint(): Promise<string> {
  for (const endpoint of OSRM_ENDPOINTS) {
    try {
      const response = await fetch(`${endpoint}/route/v1/driving/9.1829,48.7758;9.1829,48.7758?overview=false`, {
        method: 'GET',
        timeout: 3000
      } as any);
      if (response.ok) {
        return endpoint;
      }
    } catch (error) {
      console.warn(`OSRM endpoint ${endpoint} not available`);
    }
  }
  return OSRM_ENDPOINTS[0]; // fallback to first
}

// Cache for routing results
class RoutingCache {
  private cache = new Map<string, { result: DetailedRouteResult; timestamp: number }>();
  private maxAge = 15 * 60 * 1000; // 15 minutes

  private getCacheKey(start: Coordinates, end: Coordinates, profile: string): string {
    return `${start[0].toFixed(4)},${start[1].toFixed(4)}-${end[0].toFixed(4)},${end[1].toFixed(4)}-${profile}`;
  }

  get(start: Coordinates, end: Coordinates, profile: string): DetailedRouteResult | null {
    const key = this.getCacheKey(start, end, profile);
    const cached = this.cache.get(key);
    
    if (cached && (Date.now() - cached.timestamp) < this.maxAge) {
      return cached.result;
    }
    
    this.cache.delete(key);
    return null;
  }

  set(start: Coordinates, end: Coordinates, profile: string, result: DetailedRouteResult): void {
    const key = this.getCacheKey(start, end, profile);
    this.cache.set(key, { result, timestamp: Date.now() });
    
    // Clean old entries
    if (this.cache.size > 100) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      for (let i = 0; i < 20; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }
}

const routingCache = new RoutingCache();

// Calculate route with OSRM - Enhanced version
async function calculateRouteWithOSRM(
  start: Coordinates, 
  end: Coordinates, 
  profile: 'driving' | 'walking' | 'cycling' = 'driving'
): Promise<DetailedRouteResult> {
  const coords = `${start[0]},${start[1]};${end[0]},${end[1]}`;
  const baseUrl = await getBestOSRMEndpoint();
  
  // Enhanced parameters for better routing
  const params = new URLSearchParams({
    overview: 'full',
    steps: 'true',
    geometries: 'geojson',
    alternatives: '3',
    annotations: 'true',
    continue_straight: 'default'
  });
  
  const url = `${baseUrl}/route/v1/${profile}/${coords}?${params}`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'RevierKompass/1.0.0'
    }
  });
  
  if (!response.ok) {
    throw new Error(`OSRM API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Enhanced validation
  if (!data || data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    throw new Error(`OSRM routing failed: ${data?.code || 'Invalid response'}`);
  }
  
  const route = data.routes[0];
  const alternativeRoutes = data.routes.slice(1);
  
  // Extract actual geometry coordinates from GeoJSON
  const geometry = route.geometry?.coordinates || [];
  
  return {
    id: `osrm-${Date.now()}`,
    name: 'OSRM Route',
    distance: route.distance / 1000, // Convert to km
    duration: Math.round(route.duration / 60), // Convert to minutes
    geometry: {
      type: 'LineString',
      coordinates: geometry,
    },
    instructions: generateOSRMInstructions(route),
    provider: 'osrm',
    traffic_aware: false,
    alternative_routes: alternativeRoutes.map((altRoute: any, index: number) => ({
      id: `osrm-alt-${index}`,
      name: `Alternative ${index + 1}`,
      distance: altRoute.distance / 1000,
      duration: Math.round(altRoute.duration / 60),
      geometry: {
        type: 'LineString',
        coordinates: altRoute.geometry?.coordinates || [],
      },
    })),
  };
}

// Calculate route with Valhalla
async function calculateRouteWithValhalla(
  start: Coordinates, 
  end: Coordinates, 
  profile: 'auto' | 'pedestrian' | 'bicycle' = 'auto'
): Promise<DetailedRouteResult> {
  const requestBody = {
    locations: [
      { lat: start[1], lon: start[0] },
      { lat: end[1], lon: end[0] },
    ],
    costing: profile,
    directions_options: {
      units: 'kilometers',
    },
    shape_match: 'edge_walk',
    alternates: 3,
  };
  
  const response = await fetch(`${VALHALLA_BASE_URL}/route`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
  
  if (!response.ok) {
    throw new Error(`Valhalla API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  const result = ValhallaResponseSchema.parse(data);
  
  if (!result.trip) {
    throw new Error('Valhalla routing failed: no trip returned');
  }
  
  const trip = result.trip;
  const totalDistance = trip.summary.length;
  const totalTime = trip.summary.time;
  
  // Decode shape
  const shape = trip.legs.length > 0 ? decodePolyline(trip.legs[0].shape) : [];
  
  return {
    id: `valhalla-${Date.now()}`,
    name: 'Valhalla Route',
    distance: totalDistance,
    duration: Math.round(totalTime / 60),
    geometry: {
      type: 'LineString',
      coordinates: shape,
    },
    instructions: generateValhallaInstructions(trip),
    provider: 'valhalla',
    traffic_aware: true,
    alternative_routes: (result.alternates || []).map((altTrip, index) => ({
      id: `valhalla-alt-${index}`,
      name: `Alternative ${index + 1}`,
      distance: altTrip.summary.length,
      duration: Math.round(altTrip.summary.time / 60),
      geometry: {
        type: 'LineString',
        coordinates: altTrip.legs.length > 0 ? decodePolyline(altTrip.legs[0].shape) : [],
      },
    })),
  };
}

// Calculate routes with multiple providers
export async function calculateRoutesWithMultipleProviders(
  startCoords: Coordinates,
  targets: Revier[]
): Promise<DetailedRouteResult[]> {
  const results: DetailedRouteResult[] = [];
  
  // Calculate routes for each target in parallel
  const routePromises = targets.map(async (target) => {
    // Check cache first
    const cached = routingCache.get(startCoords, target.coordinates, 'driving');
    if (cached) {
      return { ...cached, name: target.name, id: target.id };
    }
    
    try {
      // Try both providers in parallel and use the best result
      const [osrmResult, valhallaResult] = await Promise.allSettled([
        calculateRouteWithOSRM(startCoords, target.coordinates),
        calculateRouteWithValhalla(startCoords, target.coordinates),
      ]);
      
      let bestResult: DetailedRouteResult | null = null;
      
      // Prefer Valhalla if available (traffic-aware), fall back to OSRM
      if (valhallaResult.status === 'fulfilled') {
        bestResult = valhallaResult.value;
      } else if (osrmResult.status === 'fulfilled') {
        bestResult = osrmResult.value;
      }
      
      if (!bestResult) {
        throw new Error('Both routing services failed');
      }
      
      // Update with target information
      bestResult.name = target.name;
      bestResult.id = target.id;
      
      // Cache the result
      routingCache.set(startCoords, target.coordinates, 'driving', bestResult);
      
      return bestResult;
    } catch (error) {
      console.error(`Routing failed for ${target.name}:`, error);
      
      // Return a fallback route with straight-line distance estimation
      const distance = calculateHaversineDistance(startCoords, target.coordinates);
      const estimatedDuration = Math.round((distance / 50) * 60); // Assume 50 km/h average
      
      return {
        id: target.id,
        name: target.name,
        distance,
        duration: estimatedDuration,
        geometry: {
          type: 'LineString',
          coordinates: [startCoords, target.coordinates],
        },
        instructions: [{
          type: 'arrival' as const,
          street_name: target.name,
          distance: distance * 1000,
          duration: estimatedDuration * 60,
          coordinates: target.coordinates,
          instruction: `Arrive at ${target.name}`,
        }],
        provider: 'fallback' as any,
        traffic_aware: false,
        alternative_routes: [],
      };
    }
  });
  
  const settledResults = await Promise.allSettled(routePromises);
  
  for (const result of settledResults) {
    if (result.status === 'fulfilled') {
      results.push(result.value);
    }
  }
  
  // Sort by distance (closest first)
  return results.sort((a, b) => a.distance - b.distance);
}

// Utility functions
function decodePolyline(encoded: string): Coordinates[] {
  // Simplified polyline decoder - in production, use a proper library
  // This is a basic implementation for demonstration
  const coordinates: Coordinates[] = [];
  let lat = 0;
  let lng = 0;
  let index = 0;
  
  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte: number;
    
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    
    const deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += deltaLat;
    
    result = 0;
    shift = 0;
    
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    
    const deltaLng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += deltaLng;
    
    coordinates.push([lng / 1e5, lat / 1e5]);
  }
  
  return coordinates;
}

function generateOSRMInstructions(route: any): RouteInstruction[] {
  const instructions: RouteInstruction[] = [];
  
  if (route.legs && route.legs.length > 0) {
    for (const leg of route.legs) {
      if (leg.steps && leg.steps.length > 0) {
        for (const step of leg.steps) {
          // Map OSRM maneuver types to our instruction types
          const maneuver = step.maneuver;
          let type: RouteInstruction['type'] = 'straight';
          let direction: RouteInstruction['direction'] = 'straight';
          
          switch (maneuver?.type) {
            case 'turn':
              type = 'turn';
              direction = maneuver.modifier?.includes('left') ? 'left' : 
                         maneuver.modifier?.includes('right') ? 'right' : 'straight';
              break;
            case 'merge':
              type = 'merge';
              break;
            case 'roundabout':
              type = 'roundabout';
              break;
            case 'arrive':
              type = 'arrival';
              break;
            default:
              type = 'straight';
          }
          
          instructions.push({
            type,
            direction,
            street_name: step.name || 'Unnamed road',
            distance: step.distance || 0,
            duration: step.duration || 0,
            coordinates: maneuver?.location || [0, 0],
            instruction: step.maneuver?.instruction || `Continue on ${step.name || 'road'}`
          });
        }
      }
    }
  }
  
  // Fallback if no detailed instructions available
  if (instructions.length === 0) {
    instructions.push({
      type: 'arrival',
      street_name: 'Destination',
      distance: route.distance || 0,
      duration: route.duration || 0,
      coordinates: [0, 0],
      instruction: `Arrive at destination after ${((route.distance || 0) / 1000).toFixed(1)} km`,
    });
  }
  
  return instructions;
}

function generateValhallaInstructions(trip: any): RouteInstruction[] {
  const instructions: RouteInstruction[] = [];
  
  if (trip.legs && trip.legs.length > 0) {
    for (const leg of trip.legs) {
      if (leg.maneuvers && leg.maneuvers.length > 0) {
        for (const maneuver of leg.maneuvers) {
          // Map Valhalla maneuver types to our instruction types
          let type: RouteInstruction['type'] = 'straight';
          let direction: RouteInstruction['direction'] = 'straight';
          
          switch (maneuver.type) {
            case 1: // Turn right
              type = 'turn';
              direction = 'right';
              break;
            case 2: // Turn left
              type = 'turn';
              direction = 'left';
              break;
            case 4: // Continue straight
              type = 'straight';
              break;
            case 5: // Merge
              type = 'merge';
              break;
            case 6: // Roundabout
              type = 'roundabout';
              break;
            case 7: // Destination
              type = 'arrival';
              break;
            default:
              type = 'straight';
          }
          
          instructions.push({
            type,
            direction,
            street_name: maneuver.street_names?.join(', ') || 'Unnamed road',
            distance: maneuver.length * 1000 || 0, // Convert km to meters
            duration: maneuver.time || 0,
            coordinates: [maneuver.begin_shape_index || 0, 0], // Simplified
            instruction: maneuver.instruction || `Continue on ${maneuver.street_names?.join(', ') || 'road'}`
          });
        }
      }
    }
  }
  
  // Fallback if no detailed instructions available
  if (instructions.length === 0) {
    instructions.push({
      type: 'arrival',
      street_name: 'Destination',
      distance: trip.summary.length * 1000 || 0,
      duration: trip.summary.time || 0,
      coordinates: [0, 0],
      instruction: `Arrive at destination after ${(trip.summary.length || 0).toFixed(1)} km`,
    });
  }
  
  return instructions;
}

function calculateHaversineDistance(coord1: Coordinates, coord2: Coordinates): number {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Export helper function for backward compatibility
export async function calculateRoutes(
  startCoords: Coordinates,
  targets: Revier[]
): Promise<RouteResult[]> {
  const detailedResults = await calculateRoutesWithMultipleProviders(startCoords, targets);
  return detailedResults.map(result => ({
    id: result.id,
    name: result.name,
    distance: result.distance,
    duration: result.duration,
    geometry: result.geometry,
    alternatives: result.alternative_routes.map(alt => ({
      distance: alt.distance,
      duration: alt.duration,
      geometry: alt.geometry || { type: 'LineString', coordinates: [] },
    })),
  }));
}
