import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import type { Map as MaplibreMap } from "maplibre-gl";

interface DrawnFeature {
	id: string;
	type: "Feature";
	geometry: {
		type: "Point" | "LineString" | "Polygon";
		coordinates: number[] | number[][] | number[][][];
	};
        properties: Record<string, unknown>;
}

interface MapState {
	// Map instance
        map: MaplibreMap | null;
        setMap: (map: MaplibreMap | null) => void;

	// View state
	center: [number, number];
	zoom: number;
	bearing: number;
	pitch: number;

	// Layers visibility
	layersVisibility: {
		route: boolean;
		reviere: boolean;
		traffic: boolean;
		satellite: boolean;
	};

	// Drawing mode
	drawingMode: "none" | "point" | "polygon" | "line";
	drawnFeatures: DrawnFeature[];

	// Measurement
	isMeasuring: boolean;
	measurements: Array<{
		id: string;
		type: "distance" | "area";
		value: number;
                geometry: unknown;
	}>;

	// Actions
	updateViewState: (
		state: Partial<{
			center: [number, number];
			zoom: number;
			bearing: number;
			pitch: number;
		}>,
	) => void;
	toggleLayer: (layer: keyof MapState["layersVisibility"]) => void;
	setDrawingMode: (mode: MapState["drawingMode"]) => void;
	addDrawnFeature: (feature: DrawnFeature) => void;
	clearDrawnFeatures: () => void;
	toggleMeasuring: () => void;
	addMeasurement: (measurement: MapState["measurements"][0]) => void;
	clearMeasurements: () => void;

	// Utility
	flyTo: (center: [number, number], zoom?: number) => void;
	fitBounds: (bounds: [[number, number], [number, number]], padding?: number) => void;
}

export const useMapStore = create<MapState>()(
	devtools(
		subscribeWithSelector((set, get) => ({
			// Initial state
			map: null,
			center: [8.6821, 50.1109], // Frankfurt
			zoom: 6,
			bearing: 0,
			pitch: 0,

			layersVisibility: {
				route: true,
				reviere: true,
				traffic: false,
				satellite: false,
			},

			drawingMode: "none",
			drawnFeatures: [],

			isMeasuring: false,
			measurements: [],

			// Actions
			setMap: (map) => set({ map }),

			updateViewState: (state) =>
				set((prev) => ({
					...prev,
					...state,
				})),

			toggleLayer: (layer) =>
				set((state) => ({
					layersVisibility: {
						...state.layersVisibility,
						[layer]: !state.layersVisibility[layer],
					},
				})),

			setDrawingMode: (mode) => set({ drawingMode: mode }),

			addDrawnFeature: (feature) =>
				set((state) => ({
					drawnFeatures: [...state.drawnFeatures, feature],
				})),

			clearDrawnFeatures: () => set({ drawnFeatures: [] }),

			toggleMeasuring: () => set((state) => ({ isMeasuring: !state.isMeasuring })),

			addMeasurement: (measurement) =>
				set((state) => ({
					measurements: [...state.measurements, measurement],
				})),

			clearMeasurements: () => set({ measurements: [] }),

			// Utility functions
			flyTo: (center, zoom) => {
				const { map } = get();
				if (!map) return;

				map.flyTo({
					center,
					zoom: zoom || map.getZoom(),
					duration: 1500,
				});

				set({ center, zoom: zoom || get().zoom });
			},

			fitBounds: (bounds, padding = 50) => {
				const { map } = get();
				if (!map) return;

				map.fitBounds(bounds, {
					padding,
					duration: 1000,
				});
			},
		})),
		{
			name: "MapStore",
		},
	),
);

// Selectors
export const selectMapInstance = (state: MapState) => state.map;
export const selectViewState = (state: MapState) => ({
	center: state.center,
	zoom: state.zoom,
	bearing: state.bearing,
	pitch: state.pitch,
});
export const selectLayersVisibility = (state: MapState) => state.layersVisibility;
export const selectDrawingState = (state: MapState) => ({
	mode: state.drawingMode,
	features: state.drawnFeatures,
});
export const selectMeasurementState = (state: MapState) => ({
	isMeasuring: state.isMeasuring,
	measurements: state.measurements,
});
