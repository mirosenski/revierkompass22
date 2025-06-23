import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Wifi, WifiOff, Layers, Navigation, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "./button";
import { Card } from "./card";
import type { RouteResult } from "@/stores/wizard";

interface EnhancedMapViewProps {
	startCoordinates?: [number, number];
	destinations?: Array<{
		id: string;
		name: string;
		coordinates: [number, number];
		address: string;
	}>;
	routes?: RouteResult[];
	className?: string;
	showControls?: boolean;
	style?: 'light' | 'dark' | 'satellite';
}

// Enhanced map styles for modern look
const MAP_STYLES = {
	light: {
		version: 8 as const,
		sources: {
			osm: {
				type: "raster" as const,
				tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
				tileSize: 256,
				attribution: "© OpenStreetMap contributors",
			},
		},
		layers: [
			{
				id: "osm-tiles",
				type: "raster" as const,
				source: "osm",
				minzoom: 0,
				maxzoom: 19,
			},
		],
	},
	dark: {
		version: 8 as const,
		sources: {
			"carto-dark": {
				type: "raster" as const,
				tiles: ["https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"],
				tileSize: 256,
				attribution: "© CartoDB, © OpenStreetMap contributors",
			},
		},
		layers: [
			{
				id: "carto-dark-tiles",
				type: "raster" as const,
				source: "carto-dark",
				minzoom: 0,
				maxzoom: 19,
			},
		],
	},
	satellite: {
		version: 8 as const,
		sources: {
			satellite: {
				type: "raster" as const,
				tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
				tileSize: 256,
				attribution: "© Esri, © OpenStreetMap contributors",
			},
		},
		layers: [
			{
				id: "satellite-tiles",
				type: "raster" as const,
				source: "satellite",
				minzoom: 0,
				maxzoom: 19,
			},
		],
	},
};

export function EnhancedMapView({ 
	startCoordinates, 
	destinations = [], 
	routes = [],
	className = "",
	showControls = true,
	style = 'light'
}: EnhancedMapViewProps) {
	const mapContainer = useRef<HTMLDivElement>(null);
	const map = useRef<maplibregl.Map | null>(null);
	const [mapLoaded, setMapLoaded] = useState(false);
	const [isOnline, setIsOnline] = useState(navigator.onLine);
	const [currentStyle, setCurrentStyle] = useState(style);
	const [bearing, setBearing] = useState(0);
	const [pitch, setPitch] = useState(0);
	
	// Track online/offline status
	useEffect(() => {
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);
		
		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);
		
		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, []);

	// Create modern marker elements
	const createMarkerElement = useCallback((type: "start" | "destination", _label: string, index?: number) => {
		const el = document.createElement("div");
		el.className = "marker-element cursor-pointer";
		
		if (type === "start") {
			el.innerHTML = `
				<div class="relative group">
					<div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 border-4 border-white dark:border-gray-800 transform transition-transform group-hover:scale-110">
						<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
						</svg>
					</div>
					<div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent border-t-emerald-500"></div>
					<div class="absolute inset-0 rounded-full bg-emerald-400 opacity-30 animate-ping"></div>
				</div>
			`;
		} else {
			const colors = [
				"from-blue-400 to-blue-600",
				"from-purple-400 to-purple-600", 
				"from-red-400 to-red-600",
				"from-orange-400 to-orange-600",
				"from-indigo-400 to-indigo-600"
			];
			const colorClass = colors[(index || 0) % colors.length];
			
			el.innerHTML = `
				<div class="relative group">
					<div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-2xl bg-gradient-to-br ${colorClass} border-3 border-white dark:border-gray-800 transform transition-transform group-hover:scale-110">
						${index !== undefined ? index + 1 : ''}
					</div>
					<div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-4 border-transparent border-t-blue-500"></div>
				</div>
			`;
		}
		
		return el;
	}, []);

	// Enhanced route colors with gradients
	const getRouteColor = useCallback((index: number) => {
		const colors = [
			"#3b82f6", // blue
			"#8b5cf6", // purple
			"#ef4444", // red
			"#f59e0b", // orange
			"#10b981"  // emerald
		];
		return colors[index % colors.length];
	}, []);

	// Initialize map with enhanced styling
	useEffect(() => {
		if (!mapContainer.current || map.current) return;

		map.current = new maplibregl.Map({
			container: mapContainer.current,
			style: MAP_STYLES[currentStyle],
			center: startCoordinates || [9.1829, 48.7758],
			zoom: 12,
			pitch: 45, // 3D effect
			bearing: 0,
			fadeDuration: 300,
		});

		// Add navigation control with custom styling
		const nav = new maplibregl.NavigationControl({
			showCompass: true,
			showZoom: true,
			visualizePitch: true
		});
		
		map.current.addControl(nav, 'top-right');

		// Add geolocate control
		const geolocate = new maplibregl.GeolocateControl({
			positionOptions: {
				enableHighAccuracy: true
			},
			trackUserLocation: true,
			showUserLocation: true
		});
		
		map.current.addControl(geolocate, 'top-right');

		// Track map movements for controls
		map.current.on('rotate', () => {
			if (map.current) {
				setBearing(map.current.getBearing());
			}
		});

		map.current.on('pitch', () => {
			if (map.current) {
				setPitch(map.current.getPitch());
			}
		});

		map.current.on("load", () => {
			setMapLoaded(true);
			
			// Add subtle map animations
			if (map.current) {
				map.current.easeTo({
					pitch: 45,
					bearing: 0,
					duration: 1000
				});
			}
		});

		return () => {
			if (map.current) {
				map.current.remove();
				map.current = null;
			}
		};
	}, [startCoordinates, currentStyle]);

	// Add start marker with animation
	useEffect(() => {
		if (!map.current || !mapLoaded || !startCoordinates) return;

		// Remove existing markers
		const existingMarkers = document.querySelectorAll('.start-marker');
		existingMarkers.forEach(marker => marker.remove());

		// Add start marker
		const startMarker = new maplibregl.Marker({
			element: createMarkerElement("start", "Start"),
		})
			.setLngLat(startCoordinates)
			.addTo(map.current);

		// Add popup for start location
		const startPopup = new maplibregl.Popup({
			offset: 25,
			closeButton: false,
			className: 'custom-popup'
		}).setHTML(`
			<div class="p-2">
				<h3 class="font-semibold text-emerald-600 dark:text-emerald-400">Startpunkt</h3>
				<p class="text-sm text-gray-600 dark:text-gray-300">Ihre Startadresse</p>
			</div>
		`);

		startMarker.setPopup(startPopup);

		return () => {
			startMarker.remove();
		};
	}, [mapLoaded, startCoordinates, createMarkerElement]);

	// Add destination markers with enhanced styling
	useEffect(() => {
		if (!map.current || !mapLoaded) return;

		// Remove existing destination markers
		const existingMarkers = document.querySelectorAll('.destination-marker');
		existingMarkers.forEach(marker => marker.remove());

		destinations.forEach((destination, index) => {
			const marker = new maplibregl.Marker({
				element: createMarkerElement("destination", `${index + 1}`, index),
			})
				.setLngLat(destination.coordinates)
				.addTo(map.current!);

			// Enhanced popup with modern styling
			const popup = new maplibregl.Popup({
				offset: 25,
				closeButton: true,
				className: 'custom-popup enhanced-popup'
			}).setHTML(`
				<div class="p-4 max-w-xs">
					<h3 class="font-semibold text-blue-600 dark:text-blue-400 mb-2">${destination.name}</h3>
					<p class="text-sm text-gray-600 dark:text-gray-300 mb-2">${destination.address}</p>
					<div class="flex items-center gap-2 text-xs text-gray-500">
						<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
						</svg>
						Ziel ${index + 1}
					</div>
				</div>
			`);

			marker.setPopup(popup);
		});

		// Auto-fit bounds if we have destinations
		if (destinations.length > 0 && startCoordinates) {
			const bounds = new maplibregl.LngLatBounds();
			bounds.extend(startCoordinates);
			destinations.forEach(dest => bounds.extend(dest.coordinates));
			
			map.current.fitBounds(bounds, {
				padding: { top: 60, bottom: 60, left: 60, right: 60 },
				duration: 1000
			});
		}
	}, [mapLoaded, destinations, startCoordinates, createMarkerElement]);

	// Add routes with enhanced styling
	useEffect(() => {
		if (!map.current || !mapLoaded || routes.length === 0) return;

		// Remove existing route layers
		routes.forEach((_, index) => {
			if (map.current!.getLayer(`route-${index}`)) {
				map.current!.removeLayer(`route-${index}`);
			}
			if (map.current!.getSource(`route-${index}`)) {
				map.current!.removeSource(`route-${index}`);
			}
		});

		// Add new route layers with enhanced styling
		routes.forEach((route, index) => {
			if (route.geometry && route.geometry.coordinates.length > 0) {
				const routeColor = getRouteColor(index);
				
				map.current!.addSource(`route-${index}`, {
					type: 'geojson',
					data: {
						type: 'Feature',
						properties: {},
						geometry: route.geometry as any
					}
				});

				// Add route line with gradient effect
				map.current!.addLayer({
					id: `route-${index}`,
					type: 'line',
					source: `route-${index}`,
					layout: {
						'line-join': 'round',
						'line-cap': 'round'
					},
					paint: {
						'line-color': routeColor,
						'line-width': 5,
						'line-opacity': 0.8,
						'line-blur': 1
					}
				});

				// Add route outline for better visibility
				map.current!.addLayer({
					id: `route-${index}-outline`,
					type: 'line',
					source: `route-${index}`,
					layout: {
						'line-join': 'round',
						'line-cap': 'round'
					},
					paint: {
						'line-color': '#ffffff',
						'line-width': 7,
						'line-opacity': 0.4
					}
				}, `route-${index}`);
			}
		});
	}, [mapLoaded, routes, getRouteColor]);

	// Map control functions
	const handleZoomIn = () => {
		map.current?.zoomIn({ duration: 300 });
	};

	const handleZoomOut = () => {
		map.current?.zoomOut({ duration: 300 });
	};

	const handleResetRotation = () => {
		map.current?.easeTo({ 
			bearing: 0, 
			pitch: 45, 
			duration: 500 
		});
	};

	const handleStyleChange = (newStyle: 'light' | 'dark' | 'satellite') => {
		if (map.current && newStyle !== currentStyle) {
			setCurrentStyle(newStyle);
			map.current.setStyle(MAP_STYLES[newStyle]);
		}
	};

	return (
		<div className={`relative overflow-hidden rounded-2xl ${className}`}>
			{/* Map container */}
			<div 
				ref={mapContainer} 
				className="w-full h-full min-h-[400px]"
				style={{ filter: 'contrast(1.1) saturate(1.1)' }}
			/>
			
			{/* Enhanced overlay controls */}
			{showControls && (
				<>
					{/* Online/Offline indicator */}
					<Card className="absolute top-4 left-4 p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-white/20">
						<div className="flex items-center gap-2">
							{isOnline ? (
								<>
									<Wifi className="w-4 h-4 text-green-500" />
									<span className="text-xs font-medium text-green-600 dark:text-green-400">Online</span>
								</>
							) : (
								<>
									<WifiOff className="w-4 h-4 text-red-500" />
									<span className="text-xs font-medium text-red-600 dark:text-red-400">Offline</span>
								</>
							)}
						</div>
					</Card>

					{/* Map style controls */}
					<Card className="absolute top-4 right-4 p-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-white/20">
						<div className="flex gap-1">
							<Button
								variant={currentStyle === 'light' ? 'default' : 'ghost'}
								size="sm"
								onClick={() => handleStyleChange('light')}
								className="h-8 w-8 p-0"
								title="Light mode"
							>
								<Layers className="w-3 h-3" />
							</Button>
							<Button
								variant={currentStyle === 'dark' ? 'default' : 'ghost'}
								size="sm"
								onClick={() => handleStyleChange('dark')}
								className="h-8 w-8 p-0"
								title="Dark mode"
							>
								<div className="w-3 h-3 bg-current rounded-full" />
							</Button>
							<Button
								variant={currentStyle === 'satellite' ? 'default' : 'ghost'}
								size="sm"
								onClick={() => handleStyleChange('satellite')}
								className="h-8 w-8 p-0"
								title="Satellite view"
							>
								<div className="w-3 h-3 border-2 border-current rounded" />
							</Button>
						</div>
					</Card>

					{/* Enhanced zoom controls */}
					<Card className="absolute bottom-4 right-4 p-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-white/20">
						<div className="flex flex-col gap-1">
							<Button
								variant="ghost"
								size="sm"
								onClick={handleZoomIn}
								className="h-8 w-8 p-0"
								title="Zoom in"
							>
								<ZoomIn className="w-4 h-4" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleZoomOut}
								className="h-8 w-8 p-0"
								title="Zoom out"
							>
								<ZoomOut className="w-4 h-4" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleResetRotation}
								className="h-8 w-8 p-0"
								title="Reset rotation"
							>
								<RotateCcw className="w-4 h-4" />
							</Button>
						</div>
					</Card>

					{/* Map info overlay */}
					{(bearing !== 0 || pitch !== 45) && (
						<Card className="absolute bottom-4 left-4 p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-white/20">
							<div className="flex items-center gap-4 text-xs">
								<div className="flex items-center gap-1">
									<Navigation className="w-3 h-3" />
									<span>{Math.round(bearing)}°</span>
								</div>
								<div className="flex items-center gap-1">
									<span>Pitch: {Math.round(pitch)}°</span>
								</div>
							</div>
						</Card>
					)}
				</>
			)}

			{/* Custom CSS for enhanced popups */}
			<style>{`
				.custom-popup .maplibregl-popup-content {
					border-radius: 12px;
					box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
					border: 1px solid rgba(255, 255, 255, 0.2);
					backdrop-filter: blur(16px);
				}
				
				.enhanced-popup .maplibregl-popup-content {
					background: rgba(255, 255, 255, 0.95);
				}
				
				.dark .enhanced-popup .maplibregl-popup-content {
					background: rgba(17, 24, 39, 0.95);
					color: white;
				}
				
				.maplibregl-popup-anchor-bottom .maplibregl-popup-tip {
					border-top-color: rgba(255, 255, 255, 0.95);
				}
				
				.dark .maplibregl-popup-anchor-bottom .maplibregl-popup-tip {
					border-top-color: rgba(17, 24, 39, 0.95);
				}
			`}</style>
		</div>
	);
}
