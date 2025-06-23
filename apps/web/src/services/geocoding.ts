import { z } from 'zod';

// Nominatim API response schema
const NominatimResponseSchema = z.object({
  display_name: z.string(),
  lat: z.string().transform(Number),
  lon: z.string().transform(Number),
  place_id: z.number(),
  type: z.string().optional(),
  importance: z.number().optional(),
  address: z.object({
    house_number: z.string().optional(),
    road: z.string().optional(),
    postcode: z.string().optional(),
    city: z.string().optional(),
    town: z.string().optional(),
    village: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

export type NominatimResponse = z.infer<typeof NominatimResponseSchema>;

// Photon API response schema  
const PhotonFeatureSchema = z.object({
  geometry: z.object({
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  properties: z.object({
    name: z.string().optional(),
    street: z.string().optional(),
    housenumber: z.string().optional(),
    postcode: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    osm_id: z.number().optional(),
    osm_type: z.string().optional(),
    extent: z.array(z.number()).optional(),
  }),
});

const PhotonResponseSchema = z.object({
  features: z.array(PhotonFeatureSchema),
});

export type PhotonResponse = z.infer<typeof PhotonResponseSchema>;

// Unified geocoding result
export interface GeocodingResult {
  id: string;
  display_name: string;
  coordinates: [number, number]; // [longitude, latitude]
  confidence: 'submeter' | 'meter' | 'street' | 'city' | 'region';
  address: {
    house_number?: string;
    road?: string;
    postcode?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  source: 'nominatim' | 'photon';
  importance?: number;
}

// Cache using IndexedDB
class GeocodingCache {
  private dbName = 'revierkompass-geocoding';
  private storeName = 'geocoding-cache';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'query' });
          store.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }

  async get(query: string): Promise<GeocodingResult[] | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(query.toLowerCase());
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result && (Date.now() - result.timestamp) < 24 * 60 * 60 * 1000) { // 24 hours
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
    });
  }

  async set(query: string, data: GeocodingResult[]): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put({
        query: query.toLowerCase(),
        data,
        timestamp: Date.now(),
      });
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

const cache = new GeocodingCache();

// Geocoding with Nominatim
async function geocodeWithNominatim(query: string): Promise<GeocodingResult[]> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '5');
  url.searchParams.set('countrycodes', 'de'); // Restrict to Germany
  url.searchParams.set('bounded', '1');
  url.searchParams.set('viewbox', '5.87,47.27,15.04,55.06'); // Germany bounding box
  
  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'RevierKompass/1.0.0 (contact@revierkompass.de)',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Nominatim API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  const results = z.array(NominatimResponseSchema).parse(data);
  
  return results.map((result) => ({
    id: `nominatim-${result.place_id}`,
    display_name: result.display_name,
    coordinates: [result.lon, result.lat] as [number, number],
    confidence: getConfidenceLevel(result),
    address: {
      house_number: result.address?.house_number,
      road: result.address?.road,
      postcode: result.address?.postcode,
      city: result.address?.city,
      state: result.address?.state,
      country: result.address?.country,
    },
    source: 'nominatim',
    importance: result.importance,
  }));
}

// Geocoding with Photon
async function geocodeWithPhoton(query: string): Promise<GeocodingResult[]> {
  const url = new URL('https://photon.komoot.io/api/');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '5');
  url.searchParams.set('osm_tag', 'place');
  url.searchParams.set('bbox', '5.87,47.27,15.04,55.06'); // Germany bounding box
  
  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Photon API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  const results = PhotonResponseSchema.parse(data);
  
  return results.features.map((feature, index) => ({
    id: `photon-${feature.properties.osm_id || index}`,
    display_name: buildDisplayName(feature.properties),
    coordinates: feature.geometry.coordinates,
    confidence: getPhotonConfidenceLevel(feature.properties),
    address: {
      house_number: feature.properties.housenumber,
      road: feature.properties.street,
      postcode: feature.properties.postcode,
      city: feature.properties.city,
      state: feature.properties.state,
      country: feature.properties.country,
    },
    source: 'photon',
  }));
}

// Combined geocoding function
export async function geocodeAddress(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 3) {
    return [];
  }
  
  const normalizedQuery = query.trim();
  
  // Check cache first
  try {
    const cached = await cache.get(normalizedQuery);
    if (cached) {
      return cached;
    }
  } catch (error) {
    console.warn('Cache read error:', error);
  }
  
  try {
    // Run both services in parallel
    const [nominatimResults, photonResults] = await Promise.allSettled([
      geocodeWithNominatim(normalizedQuery),
      geocodeWithPhoton(normalizedQuery),
    ]);
    
    const allResults: GeocodingResult[] = [];
    
    if (nominatimResults.status === 'fulfilled') {
      allResults.push(...nominatimResults.value);
    }
    
    if (photonResults.status === 'fulfilled') {
      allResults.push(...photonResults.value);
    }
    
    // Filter for Baden-Württemberg addresses only
    const bwResults = allResults.filter(result => 
      result.address.state?.toLowerCase().includes('baden-württemberg') ||
      result.address.state?.toLowerCase().includes('baden-wurttemberg') ||
      result.display_name.toLowerCase().includes('baden-württemberg')
    );
    
    // Sort by confidence and importance
    const sortedResults = bwResults.sort((a, b) => {
      const confidenceOrder = { submeter: 4, meter: 3, street: 2, city: 1, region: 0 };
      const confDiff = confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
      if (confDiff !== 0) return confDiff;
      
      return (b.importance || 0) - (a.importance || 0);
    });
    
    // Deduplicate by coordinates (within 100m)
    const deduplicated = deduplicateResults(sortedResults);
    
    // Cache results
    try {
      await cache.set(normalizedQuery, deduplicated);
    } catch (error) {
      console.warn('Cache write error:', error);
    }
    
    return deduplicated.slice(0, 5); // Return top 5 results
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Failed to geocode address');
  }
}

// Helper functions
function getConfidenceLevel(result: NominatimResponse): GeocodingResult['confidence'] {
  if (result.address?.house_number) return 'submeter';
  if (result.address?.road) return 'street';
  if (result.address?.city) return 'city';
  return 'region';
}

function getPhotonConfidenceLevel(properties: any): GeocodingResult['confidence'] {
  if (properties.housenumber) return 'submeter';
  if (properties.street) return 'street';
  if (properties.city) return 'city';
  return 'region';
}

function buildDisplayName(properties: any): string {
  const parts = [];
  if (properties.name) parts.push(properties.name);
  if (properties.street) parts.push(properties.street);
  if (properties.housenumber) parts.push(properties.housenumber);
  if (properties.postcode) parts.push(properties.postcode);
  if (properties.city) parts.push(properties.city);
  return parts.join(', ');
}

function deduplicateResults(results: GeocodingResult[]): GeocodingResult[] {
  const deduplicated: GeocodingResult[] = [];
  
  for (const result of results) {
    const isDuplicate = deduplicated.some(existing => {
      const distance = calculateDistance(
        result.coordinates,
        existing.coordinates
      );
      return distance < 0.1; // 100m threshold
    });
    
    if (!isDuplicate) {
      deduplicated.push(result);
    }
  }
  
  return deduplicated;
}

function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
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
