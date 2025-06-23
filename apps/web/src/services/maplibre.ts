import maplibregl from "maplibre-gl";
import type { Map as MapLibreMap, MapOptions, LngLatLike, StyleSpecification } from "maplibre-gl";

// Map configuration
export const MAP_CONFIG = {
	// Germany bounds
	bounds: {
		north: 55.0,
		south: 47.3,
		east: 15.0,
		west: 5.9,
	},

	// Default center (Frankfurt am Main)
	defaultCenter: {
		lng: 8.6821,
		lat: 50.1109,
	},

	// Default zoom levels
	zoom: {
		default: 6,
		city: 11,
		district: 13,
		street: 16,
		min: 5,
		max: 18,
	},

	// Map styles
	styles: {
		light: "https://api.maptiler.com/maps/streets-v2/style.json?key=YOUR_KEY",
		dark: "https://api.maptiler.com/maps/streets-v2-dark/style.json?key=YOUR_KEY",
		// Fallback to OSM raster tiles
		osm: {
			version: 8,
			sources: {
				"osm-tiles": {
					type: "raster" as const,
					tiles: [
						"https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
						"https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
						"https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
					],
					tileSize: 256,
					attribution: "© OpenStreetMap contributors",
				},
			},
			layers: [
				{
					id: "osm-tiles",
					type: "raster" as const,
					source: "osm-tiles",
					minzoom: 0,
					maxzoom: 19,
				},
			],
		} satisfies StyleSpecification,
	},
};

// Initialize map
export function createMap(
	container: string | HTMLElement,
	options?: Partial<MapOptions>,
): MapLibreMap {
	const map = new maplibregl.Map({
		container,
		style: MAP_CONFIG.styles.osm,
		center: [MAP_CONFIG.defaultCenter.lng, MAP_CONFIG.defaultCenter.lat],
		zoom: MAP_CONFIG.zoom.default,
		minZoom: MAP_CONFIG.zoom.min,
		maxZoom: MAP_CONFIG.zoom.max,
		...options,
	});

	// Add navigation controls
	map.addControl(new maplibregl.NavigationControl(), "top-right");

	// Add scale
	map.addControl(
		new maplibregl.ScaleControl({
			maxWidth: 200,
			unit: "metric",
		}),
		"bottom-left",
	);

	// Constrain to Germany bounds
	const bounds = new maplibregl.LngLatBounds(
		[MAP_CONFIG.bounds.west, MAP_CONFIG.bounds.south],
		[MAP_CONFIG.bounds.east, MAP_CONFIG.bounds.north],
	);
	map.setMaxBounds(bounds);

	return map;
}

// Marker utilities
export interface MarkerOptions {
	color?: string;
	draggable?: boolean;
	popup?: string;
}

export function addMarker(
	map: MapLibreMap,
	coordinates: LngLatLike,
	options: MarkerOptions = {},
): maplibregl.Marker {
	const marker = new maplibregl.Marker({
		color: options.color || "#3b82f6",
		draggable: options.draggable || false,
	})
		.setLngLat(coordinates)
		.addTo(map);

	if (options.popup) {
		const popup = new maplibregl.Popup({ offset: 25 }).setHTML(options.popup);
		marker.setPopup(popup);
	}

	return marker;
}

// Route visualization
export function addRouteLayer(map: MapLibreMap, routeId: string) {
	// Add route source
	map.addSource(routeId, {
		type: "geojson",
		data: {
			type: "Feature",
			properties: {},
			geometry: {
				type: "LineString",
				coordinates: [],
			},
		},
	});

	// Add route line
	map.addLayer({
		id: `${routeId}-line`,
		type: "line",
		source: routeId,
		layout: {
			"line-join": "round",
			"line-cap": "round",
		},
		paint: {
			"line-color": "#3b82f6",
			"line-width": 4,
			"line-opacity": 0.8,
		},
	});

	// Add route outline
	map.addLayer(
		{
			id: `${routeId}-outline`,
			type: "line",
			source: routeId,
			layout: {
				"line-join": "round",
				"line-cap": "round",
			},
			paint: {
				"line-color": "#1e40af",
				"line-width": 6,
				"line-opacity": 0.4,
			},
		},
		`${routeId}-line`,
	);
}

export function updateRoute(map: MapLibreMap, routeId: string, coordinates: number[][]) {
	const source = map.getSource(routeId) as maplibregl.GeoJSONSource;
	if (source) {
		source.setData({
			type: "Feature",
			properties: {},
			geometry: {
				type: "LineString",
				coordinates,
			},
		});
	}
}

// Revier polygon visualization
export function addRevierLayer(map: MapLibreMap, revierId: string) {
	map.addSource(revierId, {
		type: "geojson",
		data: {
			type: "FeatureCollection",
			features: [],
		},
	});

	// Fill layer
	map.addLayer({
		id: `${revierId}-fill`,
		type: "fill",
		source: revierId,
		paint: {
			"fill-color": "#3b82f6",
			"fill-opacity": 0.1,
		},
	});

	// Border layer
	map.addLayer({
		id: `${revierId}-border`,
		type: "line",
		source: revierId,
		paint: {
			"line-color": "#3b82f6",
			"line-width": 2,
			"line-opacity": 0.8,
		},
	});
}

// Utility functions
export function fitBounds(map: MapLibreMap, coordinates: number[][], padding = 50) {
	if (coordinates.length === 0) return;

	const bounds = new maplibregl.LngLatBounds();
	coordinates.forEach((coord) => {
		bounds.extend(coord as LngLatLike);
	});

	map.fitBounds(bounds, {
		padding,
		duration: 1000,
	});
}

export function animateTo(map: MapLibreMap, center: LngLatLike, zoom?: number) {
	map.flyTo({
		center,
		zoom: zoom || map.getZoom(),
		duration: 1500,
		essential: true,
	});
}
