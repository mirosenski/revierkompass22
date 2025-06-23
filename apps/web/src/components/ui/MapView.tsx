import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { RouteResult } from "@/stores/wizard";

interface MapViewProps {
	startCoordinates?: [number, number];
	destinations?: Array<{
		id: string;
		name: string;
		coordinates: [number, number];
		address: string;
	}>;
	routes?: RouteResult[];
}

export function MapView({ startCoordinates, destinations = [], routes = [] }: MapViewProps) {
	const mapContainer = useRef<HTMLDivElement>(null);
	const map = useRef<maplibregl.Map | null>(null);
	const [mapLoaded, setMapLoaded] = useState(false);

	const createMarkerElement = useCallback((type: "start" | "destination", label: string) => {
		const el = document.createElement("div");
		el.className = "marker-element";
		el.innerHTML = `
      <div class="relative">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
					type === "start" ? "bg-blue-500" : "bg-red-500"
				}">
          ${label}
        </div>
        <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
					type === "start" ? "border-t-blue-500" : "border-t-red-500"
				}"></div>
      </div>
    `;
		return el;
	}, []);

	const getRouteColor = useCallback((index: number) => {
		const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];
		return colors[index % colors.length];
	}, []);

	useEffect(() => {
		if (!mapContainer.current || map.current) return;

		map.current = new maplibregl.Map({
			container: mapContainer.current,
			style: {
				version: 8,
				sources: {
					osm: {
						type: "raster",
						tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
						tileSize: 256,
						attribution: "© OpenStreetMap contributors",
					},
				},
				layers: [
					{
						id: "osm-tiles",
						type: "raster",
						source: "osm",
						minzoom: 0,
						maxzoom: 22,
					},
				],
			},
			center: startCoordinates || [9.1829, 48.7758], // Stuttgart default
			zoom: 10,
		});

		map.current.on("load", () => {
			setMapLoaded(true);
		});

		return () => {
			if (map.current) {
				map.current.remove();
				map.current = null;
			}
		};
	}, [startCoordinates]);

	// Add start marker
	useEffect(() => {
		if (!map.current || !mapLoaded || !startCoordinates) return;

		// Remove existing start marker
		const existingStartMarker = document.getElementById("start-marker");
		if (existingStartMarker) {
			existingStartMarker.remove();
		}

		// Add new start marker
		const startMarker = new maplibregl.Marker({
			element: createMarkerElement("start", "Start"),
			color: "#3b82f6",
		})
			.setLngLat(startCoordinates)
			.addTo(map.current);

		// Store reference for cleanup
		startMarker.getElement().id = "start-marker";
	}, [startCoordinates, mapLoaded, createMarkerElement]);

	// Add destination markers
	useEffect(() => {
		if (!map.current || !mapLoaded) return;

		// Remove existing destination markers
		const existingMarkers = document.querySelectorAll(".destination-marker");
		existingMarkers.forEach((marker) => marker.remove());

		destinations.forEach((destination, index) => {
			const marker = new maplibregl.Marker({
				element: createMarkerElement("destination", `${index + 1}`),
				color: "#ef4444",
			}).setLngLat(destination.coordinates);

			if (map.current) {
				marker.addTo(map.current);
			}

			marker.getElement().classList.add("destination-marker");
		});
	}, [destinations, mapLoaded, createMarkerElement]);

	// Add route lines
	useEffect(() => {
		if (!map.current || !mapLoaded || routes.length === 0) return;

		// Remove existing route sources and layers
		const existingSources = ["route-1", "route-2", "route-3"];
		existingSources.forEach((sourceId) => {
			if (map.current?.getSource(sourceId)) {
				map.current?.removeLayer(`${sourceId}-layer`);
				map.current?.removeSource(sourceId);
			}
		});

		// Add route lines
		routes.forEach((route, index) => {
			if (!route.geometry) return;

			const sourceId = `route-${index + 1}`;
			const layerId = `${sourceId}-layer`;

			map.current?.addSource(sourceId, {
				type: "geojson",
				data: {
					type: "Feature",
					properties: {},
					geometry: {
						type: "LineString" as const,
						coordinates: route.geometry.coordinates,
					},
				},
			});

			map.current?.addLayer({
				id: layerId,
				type: "line",
				source: sourceId,
				layout: {
					"line-join": "round",
					"line-cap": "round",
				},
				paint: {
					"line-color": getRouteColor(index),
					"line-width": 4,
					"line-opacity": 0.8,
				},
			});
		});

		// Fit map to show all routes
		if (routes.length > 0 && startCoordinates) {
			const coordinates = [startCoordinates, ...destinations.map((d) => d.coordinates)];
			const bounds = new maplibregl.LngLatBounds();
			coordinates.forEach((coord) => bounds.extend(coord));

			map.current.fitBounds(bounds, {
				padding: 50,
				duration: 1000,
			});
		}
	}, [routes, startCoordinates, destinations, mapLoaded, getRouteColor]);

	return (
		<div className="relative w-full h-full">
			<div ref={mapContainer} className="w-full h-full" />

			{/* Map Controls */}
			{mapLoaded && (
				<div className="absolute top-4 right-4 space-y-2">
					<button
						type="button"
						onClick={() => map.current?.zoomIn()}
						className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
					>
                                        <svg
                                                aria-label="Zoom in"
                                                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                        >
                                                <title>Zoom in</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 6v6m0 0v6m0-6h6m-6 0H6"
							/>
						</svg>
					</button>
					<button
						type="button"
						onClick={() => map.current?.zoomOut()}
						className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
					>
                                        <svg
                                                aria-label="Zoom out"
                                                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                        >
                                                <title>Zoom out</title>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
						</svg>
					</button>
				</div>
			)}

			{/* Legend */}
			{routes.length > 0 && (
				<div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
					<h4 className="text-sm font-medium mb-2">Routen</h4>
					<div className="space-y-1">
						{routes.slice(0, 3).map((route, index) => (
							<div key={route.id} className="flex items-center space-x-2">
								<div
									className="w-4 h-2 rounded"
									style={{ backgroundColor: getRouteColor(index) }}
								/>
								<span className="text-xs">{route.name}</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
