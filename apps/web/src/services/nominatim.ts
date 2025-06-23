import { z } from "zod";

// Response schemas
const NominatimPlaceSchema = z.object({
	place_id: z.number(),
	licence: z.string(),
	osm_type: z.string(),
	osm_id: z.number(),
	lat: z.string(),
	lon: z.string(),
	class: z.string(),
	type: z.string(),
	display_name: z.string(),
	address: z
		.object({
			house_number: z.string().optional(),
			road: z.string().optional(),
			suburb: z.string().optional(),
			city: z.string().optional(),
			town: z.string().optional(),
			village: z.string().optional(),
			state: z.string().optional(),
			postcode: z.string().optional(),
			country: z.string().optional(),
			country_code: z.string().optional(),
		})
		.optional(),
	boundingbox: z.array(z.string()).length(4),
});

export type NominatimPlace = z.infer<typeof NominatimPlaceSchema>;

// Service configuration
const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
const REQUEST_HEADERS = {
	"User-Agent": "RevierKompass/1.0 (https://revierkompass.de)",
};

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

async function rateLimitedFetch(url: string, options?: RequestInit) {
	const now = Date.now();
	const timeSinceLastRequest = now - lastRequestTime;

	if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
		await new Promise((resolve) =>
			setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest),
		);
	}

	lastRequestTime = Date.now();
	return fetch(url, options);
}

export interface SearchOptions {
	limit?: number;
	countrycodes?: string;
	viewbox?: string;
	bounded?: boolean;
	addressdetails?: boolean;
}

export async function searchAddress(
	query: string,
	options: SearchOptions = {},
): Promise<NominatimPlace[]> {
	const params = new URLSearchParams({
		q: query,
		format: "json",
		addressdetails: "1",
		limit: (options.limit || 5).toString(),
		countrycodes: options.countrycodes || "de",
		...(options.viewbox && { viewbox: options.viewbox }),
		...(options.bounded && { bounded: "1" }),
	});

	const url = `${NOMINATIM_BASE_URL}/search?${params}`;

	try {
		const response = await rateLimitedFetch(url, { headers: REQUEST_HEADERS });

		if (!response.ok) {
			throw new Error(`Nominatim error: ${response.status}`);
		}

		const data = await response.json();
		return z.array(NominatimPlaceSchema).parse(data);
	} catch (error) {
		console.error("Nominatim search error:", error);
		throw error;
	}
}

export async function reverseGeocode(lat: number, lon: number): Promise<NominatimPlace | null> {
	const params = new URLSearchParams({
		lat: lat.toString(),
		lon: lon.toString(),
		format: "json",
		addressdetails: "1",
	});

	const url = `${NOMINATIM_BASE_URL}/reverse?${params}`;

	try {
		const response = await rateLimitedFetch(url, { headers: REQUEST_HEADERS });

		if (!response.ok) {
			throw new Error(`Nominatim error: ${response.status}`);
		}

		const data = await response.json();
		return NominatimPlaceSchema.parse(data);
	} catch (error) {
		console.error("Nominatim reverse geocode error:", error);
		return null;
	}
}

// Helper functions
export function formatAddress(place: NominatimPlace): string {
	const parts = [];
	const addr = place.address;

	if (!addr) return place.display_name;

	if (addr.road) {
		parts.push(addr.house_number ? `${addr.road} ${addr.house_number}` : addr.road);
	}

	const city = addr.city || addr.town || addr.village;
	if (city) {
		parts.push(addr.postcode ? `${addr.postcode} ${city}` : city);
	}

	return parts.join(", ");
}

export function getCoordinates(place: NominatimPlace): [number, number] {
	return [parseFloat(place.lon), parseFloat(place.lat)];
}
