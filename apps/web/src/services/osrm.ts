import { z } from "zod";

// OSRM response schemas
const RouteStepSchema = z.object({
	distance: z.number(),
	duration: z.number(),
	geometry: z.string(),
	name: z.string(),
	mode: z.string(),
	maneuver: z.object({
		bearing_after: z.number(),
		bearing_before: z.number(),
		location: z.array(z.number()).length(2),
		modifier: z.string().optional(),
		type: z.string(),
	}),
});

const RouteLegSchema = z.object({
	distance: z.number(),
	duration: z.number(),
	steps: z.array(RouteStepSchema),
	summary: z.string(),
});

const RouteSchema = z.object({
	distance: z.number(),
	duration: z.number(),
	legs: z.array(RouteLegSchema),
	geometry: z.string(),
	weight_name: z.string(),
	weight: z.number(),
});

const OSRMResponseSchema = z.object({
	code: z.string(),
	routes: z.array(RouteSchema),
	waypoints: z.array(
		z.object({
			hint: z.string().optional(),
			distance: z.number().optional(),
			name: z.string(),
			location: z.array(z.number()).length(2),
		}),
	),
});

export type OSRMRoute = z.infer<typeof RouteSchema>;
export type OSRMResponse = z.infer<typeof OSRMResponseSchema>;

// Service configuration
export const OSRM_CONFIG = {
	baseUrl: "https://router.project-osrm.org",
	// Fallback servers
	fallbackUrls: [
		"https://routing.openstreetmap.de",
		"https://osrm.example.com", // Your own OSRM instance
	],
	profile: "driving", // car, bike, foot
	timeout: 10000, // 10 seconds
	maxWaypoints: 100,
};

// Decode polyline (OSRM uses polyline6 format)
export function decodePolyline(encoded: string): number[][] {
	const coords: number[][] = [];
	let index = 0;
	let lat = 0;
	let lng = 0;
	const factor = 1e6; // polyline6 uses 6 decimal places

	while (index < encoded.length) {
		let b: number;
		let shift = 0;
		let result = 0;

		// Decode latitude
		do {
			b = encoded.charCodeAt(index++) - 63;
			result |= (b & 0x1f) << shift;
			shift += 5;
		} while (b >= 0x20);

		const dlat = result & 1 ? ~(result >> 1) : result >> 1;
		lat += dlat;

		// Reset for longitude
		shift = 0;
		result = 0;

		// Decode longitude
		do {
			b = encoded.charCodeAt(index++) - 63;
			result |= (b & 0x1f) << shift;
			shift += 5;
		} while (b >= 0x20);

		const dlng = result & 1 ? ~(result >> 1) : result >> 1;
		lng += dlng;

		coords.push([lng / factor, lat / factor]);
	}

	return coords;
}

// Format coordinates for OSRM
function formatCoordinates(coords: number[][]): string {
	return coords.map((c) => `${c[0]},${c[1]}`).join(";");
}

// Calculate route
export async function calculateRoute(
	waypoints: number[][],
	options: {
		profile?: string;
		alternatives?: boolean;
		steps?: boolean;
		geometries?: "polyline" | "polyline6" | "geojson";
		overview?: "full" | "simplified" | "false";
	} = {},
): Promise<OSRMResponse> {
	if (waypoints.length < 2) {
		throw new Error("At least 2 waypoints required");
	}

	if (waypoints.length > OSRM_CONFIG.maxWaypoints) {
		throw new Error(`Maximum ${OSRM_CONFIG.maxWaypoints} waypoints allowed`);
	}

	const profile = options.profile || OSRM_CONFIG.profile;
	const coordinates = formatCoordinates(waypoints);

	const params = new URLSearchParams({
		alternatives: (options.alternatives || false).toString(),
		steps: (options.steps || true).toString(),
		geometries: options.geometries || "polyline6",
		overview: options.overview || "full",
	});

	const url = `${OSRM_CONFIG.baseUrl}/route/v1/${profile}/${coordinates}?${params}`;

	try {
		const response = await fetch(url, {
			signal: AbortSignal.timeout(OSRM_CONFIG.timeout),
		});

		if (!response.ok) {
			throw new Error(`OSRM error: ${response.status}`);
		}

		const data = await response.json();
		return OSRMResponseSchema.parse(data);
	} catch (error) {
		console.error("OSRM routing error:", error);
		throw error;
	}
}

// Calculate optimized route (TSP - Traveling Salesman Problem)
export async function calculateOptimizedRoute(
	waypoints: number[][],
	options: {
		profile?: string;
		source?: "first" | "last" | "any";
		destination?: "first" | "last" | "any";
		roundtrip?: boolean;
	} = {},
): Promise<OSRMResponse & { waypoint_index: number[] }> {
	if (waypoints.length < 2) {
		throw new Error("At least 2 waypoints required");
	}

	const profile = options.profile || OSRM_CONFIG.profile;
	const coordinates = formatCoordinates(waypoints);

	const params = new URLSearchParams({
		source: options.source || "first",
		destination: options.destination || "last",
		roundtrip: (options.roundtrip || false).toString(),
	});

	const url = `${OSRM_CONFIG.baseUrl}/trip/v1/${profile}/${coordinates}?${params}`;

	try {
		const response = await fetch(url, {
			signal: AbortSignal.timeout(OSRM_CONFIG.timeout),
		});

		if (!response.ok) {
			throw new Error(`OSRM error: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("OSRM optimization error:", error);
		throw error;
	}
}

// Get distance matrix
export async function getDistanceMatrix(
	waypoints: number[][],
	options: {
		profile?: string;
		sources?: number[];
		destinations?: number[];
	} = {},
): Promise<{
	distances: number[][];
	durations: number[][];
}> {
	const profile = options.profile || OSRM_CONFIG.profile;
	const coordinates = formatCoordinates(waypoints);

	const params = new URLSearchParams();
	if (options.sources) {
		params.set("sources", options.sources.join(";"));
	}
	if (options.destinations) {
		params.set("destinations", options.destinations.join(";"));
	}

	const url = `${OSRM_CONFIG.baseUrl}/table/v1/${profile}/${coordinates}?${params}`;

	try {
		const response = await fetch(url, {
			signal: AbortSignal.timeout(OSRM_CONFIG.timeout),
		});

		if (!response.ok) {
			throw new Error(`OSRM error: ${response.status}`);
		}

		const data = await response.json();
		return {
			distances: data.distances,
			durations: data.durations,
		};
	} catch (error) {
		console.error("OSRM distance matrix error:", error);
		throw error;
	}
}

// Helper functions
export function formatDuration(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	if (hours > 0) {
		return `${hours} Std. ${minutes} Min.`;
	}
	return `${minutes} Min.`;
}

export function formatDistance(meters: number): string {
	if (meters < 1000) {
		return `${Math.round(meters)} m`;
	}
	return `${(meters / 1000).toFixed(1)} km`;
}

// Fallback distance calculation (Haversine formula)
export function calculateHaversineDistance(coord1: number[], coord2: number[]): number {
	const R = 6371000; // Earth radius in meters
	const lat1 = (coord1[1] * Math.PI) / 180;
	const lat2 = (coord2[1] * Math.PI) / 180;
	const deltaLat = ((coord2[1] - coord1[1]) * Math.PI) / 180;
	const deltaLon = ((coord2[0] - coord1[0]) * Math.PI) / 180;

	const a =
		Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
		Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c;
}
