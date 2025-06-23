import { useState, useMemo, useId } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Target } from "lucide-react";
import * as turf from "@turf/turf";

interface Coordinate {
	id?: string;
	lat: number;
	lng: number;
	name?: string;
}

interface LivePreviewMapProps {
	start: Coordinate;
	targets: Coordinate[];
	className?: string;
}

export function LivePreviewMap({ start, targets, className = "" }: LivePreviewMapProps) {
	const gradientId = useId();
	const [viewState, setViewState] = useState({
		longitude: start.lng,
		latitude: start.lat,
		zoom: 12,
		pitch: 45, // 3D-Effekt
		bearing: 0,
	});

	// Dynamische Routen-Berechnung mit Turf.js
	const routeGeometry = useMemo(() => {
		if (targets.length === 0) return null;

		const coordinates = [start, ...targets].map((point) => [point.lng, point.lat]);
		return turf.lineString(coordinates);
	}, [start, targets]);

	// Bounds für optimale Kartenansicht
	const bounds = useMemo(() => {
		if (targets.length === 0) {
			return turf.bbox(turf.point([start.lng, start.lat]));
		}

		const points = [start, ...targets].map((point) => turf.point([point.lng, point.lat]));
		return turf.bbox(turf.featureCollection(points));
	}, [start, targets]);

	// Automatische Kartenanpassung
	useMemo(() => {
		if (bounds) {
			const [minLng, minLat, maxLng, maxLat] = bounds;
			const centerLng = (minLng + maxLng) / 2;
			const centerLat = (minLat + maxLat) / 2;

			setViewState((prev) => ({
				...prev,
				longitude: centerLng,
				latitude: centerLat,
				zoom: Math.min(16, Math.max(10, 14 - targets.length * 0.5)),
			}));
		}
	}, [bounds, targets.length]);

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.3 }}
			className={`h-[400px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-xl bg-gray-100 dark:bg-gray-800 ${className}`}
		>
			<div className="relative w-full h-full">
				{/* Map Container */}
				<div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
					{/* Start Marker */}
					<div className="absolute top-4 left-4 z-10">
						<div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
							<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
								Start: {start.name || "Ihre Adresse"}
							</span>
						</div>
					</div>

					{/* Target Markers */}
					{targets.map((target) => (
						<div
							key={target.id || `target-${target.lat}-${target.lng}`}
							className="absolute z-10"
							style={{
								left: `${20 + targets.indexOf(target) * 15}%`,
								top: `${30 + targets.indexOf(target) * 10}%`,
							}}
						>
							<div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
								<div className="w-3 h-3 bg-red-500 rounded-full"></div>
								<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
									Ziel {targets.indexOf(target) + 1}
								</span>
							</div>
						</div>
					))}

					{/* Route Line Preview */}
					{routeGeometry && (
						<div className="absolute inset-0 pointer-events-none">
							<svg className="w-full h-full">
								<title>Route Preview</title>
								<defs>
									<linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
										<stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
										<stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
									</linearGradient>
								</defs>
								<path
									d={`M ${20} ${50} Q ${40} ${30} ${60} ${40} Q ${80} ${50} ${90} ${60}`}
									stroke={`url(#${gradientId})`}
									strokeWidth="4"
									fill="none"
									strokeDasharray="8,4"
									className="animate-pulse"
								/>
							</svg>
						</div>
					)}

					{/* Map Controls */}
					<div className="absolute bottom-4 right-4 z-10">
						<div className="flex flex-col gap-2">
							<button
								type="button"
								onClick={() =>
									setViewState((prev) => ({ ...prev, pitch: prev.pitch === 45 ? 0 : 45 }))
								}
								className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
								title="3D/2D Toggle"
							>
								<Navigation className="h-5 w-5 text-gray-600 dark:text-gray-400" />
							</button>
							<button
								type="button"
								onClick={() => {
									const newBearing = (viewState.bearing + 90) % 360;
									setViewState((prev) => ({ ...prev, bearing: newBearing }));
								}}
								className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
								title="Rotate Map"
							>
								<Target className="h-5 w-5 text-gray-600 dark:text-gray-400" />
							</button>
						</div>
					</div>

					{/* Stats Overlay */}
					<div className="absolute top-4 right-4 z-10">
						<div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
							<div className="text-sm text-gray-600 dark:text-gray-400">
								<div className="flex items-center gap-2">
									<MapPin className="h-4 w-4" />
									<span>{targets.length} Ziele ausgewählt</span>
								</div>
								{targets.length > 0 && (
									<div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
										Routenoptimierung verfügbar
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
