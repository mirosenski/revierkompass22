import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Map as MaplibreMap } from "maplibre-gl";

// Types
export interface ViewportState {
	center: [number, number];
	zoom: number;
	bearing: number;
	pitch: number;
}

export interface MapConfig {
	style: string;
	bounds: [[number, number], [number, number]];
	maxZoom: number;
	minZoom: number;
}

export interface LayerVisibility {
	route: boolean;
	reviere: boolean;
	traffic: boolean;
	satellite: boolean;
}

// Query Keys
const mapKeys = {
	all: ["map"] as const,
	viewport: () => [...mapKeys.all, "viewport"] as const,
	config: () => [...mapKeys.all, "config"] as const,
	layers: () => [...mapKeys.all, "layers"] as const,
	instance: () => [...mapKeys.all, "instance"] as const,
};

// Default values
const defaultViewport: ViewportState = {
	center: [8.6821, 50.1109], // Frankfurt
	zoom: 6,
	bearing: 0,
	pitch: 0,
};

const defaultConfig: MapConfig = {
	style: "https://demotiles.maplibre.org/style.json",
	bounds: [
		[5.9, 47.3],
		[15.0, 55.0],
	], // Germany
	maxZoom: 18,
	minZoom: 5,
};

// Viewport Query & Mutations
export function useViewport() {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: mapKeys.viewport(),
		queryFn: () => {
			// Load from localStorage if available
			const saved = localStorage.getItem("revierkompass-viewport");
			return saved ? JSON.parse(saved) : defaultViewport;
		},
		staleTime: Infinity,
		gcTime: Infinity,
	});

	const updateViewport = useMutation({
		mutationFn: async (viewport: Partial<ViewportState>) => {
			const current = queryClient.getQueryData<ViewportState>(mapKeys.viewport());
			const updated = { ...current, ...viewport };

			// Persist to localStorage
			localStorage.setItem("revierkompass-viewport", JSON.stringify(updated));

			return updated;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(mapKeys.viewport(), data);
		},
	});

	return {
		viewport: query.data ?? defaultViewport,
		isLoading: query.isLoading,
		updateViewport: updateViewport.mutate,
	};
}

// Map Config Query
export function useMapConfig() {
	return useQuery({
		queryKey: mapKeys.config(),
		queryFn: async () => {
			// Could load from API or environment
			return defaultConfig;
		},
		staleTime: Infinity,
		gcTime: Infinity,
	});
}

// Map Instance Management
let mapInstance: MaplibreMap | null = null;

export function useMapInstance() {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: mapKeys.instance(),
		queryFn: () => mapInstance,
		staleTime: Infinity,
		gcTime: Infinity,
	});

        const setMapInstance = useMutation({
                mutationFn: async (map: MaplibreMap | null) => {
			mapInstance = map;
			return map;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(mapKeys.instance(), data);
		},
	});

	return {
		map: query.data,
		setMap: setMapInstance.mutate,
	};
}

// Layer Visibility Management
export function useLayerVisibility() {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: mapKeys.layers(),
		queryFn: () => ({
			route: true,
			reviere: true,
			traffic: false,
			satellite: false,
		}),
		staleTime: Infinity,
	});

	const toggleLayer = useMutation({
		mutationFn: async (layer: keyof LayerVisibility) => {
			const current = queryClient.getQueryData<LayerVisibility>(mapKeys.layers());
			if (!current) return { route: true, reviere: true, traffic: false, satellite: false };

			const updated = {
				...current,
				[layer]: !current[layer],
			};

			// Apply to map instance if available
			if (mapInstance) {
				const visibility = updated[layer] ? "visible" : "none";

				// Handle different layer types
				switch (layer) {
					case "route":
						mapInstance.setLayoutProperty("route", "visibility", visibility);
						mapInstance.setLayoutProperty("route-outline", "visibility", visibility);
						break;
					case "reviere":
						mapInstance.setLayoutProperty("reviere-fill", "visibility", visibility);
						mapInstance.setLayoutProperty("reviere-border", "visibility", visibility);
						break;
					// Add more layer handlers as needed
				}
			}

			return updated;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(mapKeys.layers(), data);
		},
	});

	return {
		layers: query.data ?? { route: true, reviere: true, traffic: false, satellite: false },
		toggleLayer: toggleLayer.mutate,
	};
}

// Prefetch map data
export function usePrefetchMapData() {
	const queryClient = useQueryClient();

	return () => {
		// Prefetch all map-related data
		queryClient.prefetchQuery({
			queryKey: mapKeys.viewport(),
			queryFn: () => {
				const saved = localStorage.getItem("revierkompass-viewport");
				return saved ? JSON.parse(saved) : defaultViewport;
			},
		});

		queryClient.prefetchQuery({
			queryKey: mapKeys.config(),
			queryFn: async () => defaultConfig,
		});
	};
}

// Invalidate all map queries
export function useInvalidateMapQueries() {
	const queryClient = useQueryClient();

	return () => {
		queryClient.invalidateQueries({ queryKey: mapKeys.all });
	};
}
