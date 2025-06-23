import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import type { Coordinates, Revier, RouteResult, Praesidium } from "../stores/wizard";
import { getPraesidienBySearch, getReviereByPraesidium } from "./dataLoader";
import { geocodeAddress } from "./geocoding";
import { calculateRoutesWithMultipleProviders } from "./routing";

// API Response Schemas
const GeocodingResponseSchema = z.object({
	display_name: z.string(),
	lat: z.string().transform(Number),
	lon: z.string().transform(Number),
	place_id: z.number(),
	type: z.string().optional(),
	address: z
		.object({
			house_number: z.string().optional(),
			road: z.string().optional(),
			postcode: z.string().optional(),
			city: z.string().optional(),
			state: z.string().optional(),
			country: z.string().optional(),
		})
		.optional(),
});

// Mock Data for Development
const MOCK_PRAESIDIEN: Praesidium[] = [
	{
		id: "stuttgart",
		name: "Polizeipräsidium Stuttgart",
		coordinates: [9.1829, 48.7758] as [number, number],
		childReviere: ["stuttgart-mitte", "stuttgart-bad-cannstatt", "stuttgart-feuerbach"],
	},
	{
		id: "karlsruhe",
		name: "Polizeipräsidium Karlsruhe",
		coordinates: [8.4037, 49.0069] as [number, number],
		childReviere: ["karlsruhe-mitte", "karlsruhe-durlach", "karlsruhe-mühlburg"],
	},
	{
		id: "mannheim",
		name: "Polizeipräsidium Mannheim",
		coordinates: [8.466, 49.4875] as [number, number],
		childReviere: ["mannheim-innenstadt", "mannheim-neckarau", "mannheim-schwetzingerstadt"],
	},
];

const MOCK_REVIERE: Revier[] = [
	{
		id: "stuttgart-mitte",
		name: "Polizeirevier Stuttgart-Mitte",
		praesidiumId: "stuttgart",
		coordinates: [9.1829, 48.7758] as [number, number],
		geometry: {
			type: "Polygon",
			coordinates: [
				[
					[9.17, 48.76],
					[9.19, 48.76],
					[9.19, 48.79],
					[9.17, 48.79],
					[9.17, 48.76],
				],
			],
		},
		contact: {
			phone: "+49 711 8990-0",
			email: "stuttgart-mitte@polizei.bwl.de",
			address: "Schlossplatz 1, 70173 Stuttgart",
		},
	},
	{
		id: "stuttgart-bad-cannstatt",
		name: "Polizeirevier Stuttgart-Bad Cannstatt",
		praesidiumId: "stuttgart",
		coordinates: [9.2167, 48.8] as [number, number],
		geometry: {
			type: "Polygon",
			coordinates: [
				[
					[9.2, 48.79],
					[9.23, 48.79],
					[9.23, 48.81],
					[9.2, 48.81],
					[9.2, 48.79],
				],
			],
		},
		contact: {
			phone: "+49 711 8990-100",
			email: "bad-cannstatt@polizei.bwl.de",
			address: "Marktstraße 15, 70372 Stuttgart",
		},
	},
	{
		id: "stuttgart-feuerbach",
		name: "Polizeirevier Stuttgart-Feuerbach",
		praesidiumId: "stuttgart",
		coordinates: [9.15, 48.81] as [number, number],
		geometry: {
			type: "Polygon",
			coordinates: [
				[
					[9.14, 48.8],
					[9.16, 48.8],
					[9.16, 48.82],
					[9.14, 48.82],
					[9.14, 48.8],
				],
			],
		},
		contact: {
			phone: "+49 711 8990-200",
			email: "feuerbach@polizei.bwl.de",
			address: "Stuttgarter Straße 45, 70469 Stuttgart",
		},
	},
	{
		id: "karlsruhe-mitte",
		name: "Polizeirevier Karlsruhe-Mitte",
		praesidiumId: "karlsruhe",
		coordinates: [8.4037, 49.0069] as [number, number],
		geometry: {
			type: "Polygon",
			coordinates: [
				[
					[8.39, 48.99],
					[8.41, 48.99],
					[8.41, 49.02],
					[8.39, 49.02],
					[8.39, 48.99],
				],
			],
		},
		contact: {
			phone: "+49 721 666-0",
			email: "karlsruhe-mitte@polizei.bwl.de",
			address: "Kaiserstraße 186, 76133 Karlsruhe",
		},
	},
	{
		id: "karlsruhe-durlach",
		name: "Polizeirevier Karlsruhe-Durlach",
		praesidiumId: "karlsruhe",
		coordinates: [8.47, 48.99] as [number, number],
		geometry: {
			type: "Polygon",
			coordinates: [
				[
					[8.46, 48.98],
					[8.48, 48.98],
					[8.48, 49.0],
					[8.46, 49.0],
					[8.46, 48.98],
				],
			],
		},
		contact: {
			phone: "+49 721 666-100",
			email: "durlach@polizei.bwl.de",
			address: "Pfinztalstraße 9, 76227 Karlsruhe",
		},
	},
	{
		id: "karlsruhe-mühlburg",
		name: "Polizeirevier Karlsruhe-Mühlburg",
		praesidiumId: "karlsruhe",
		coordinates: [8.35, 49.02] as [number, number],
		geometry: {
			type: "Polygon",
			coordinates: [
				[
					[8.34, 49.01],
					[8.36, 49.01],
					[8.36, 49.03],
					[8.34, 49.03],
					[8.34, 49.01],
				],
			],
		},
		contact: {
			phone: "+49 721 666-200",
			email: "muehlburg@polizei.bwl.de",
			address: "Mühlburger Straße 12, 76185 Karlsruhe",
		},
	},
	{
		id: "mannheim-innenstadt",
		name: "Polizeirevier Mannheim-Innenstadt",
		praesidiumId: "mannheim",
		coordinates: [8.466, 49.4875] as [number, number],
		geometry: {
			type: "Polygon",
			coordinates: [
				[
					[8.45, 49.47],
					[8.47, 49.47],
					[8.47, 49.5],
					[8.45, 49.5],
					[8.45, 49.47],
				],
			],
		},
		contact: {
			phone: "+49 621 174-0",
			email: "innenstadt@polizei.bwl.de",
			address: "M1 1, 68161 Mannheim",
		},
	},
	{
		id: "mannheim-neckarau",
		name: "Polizeirevier Mannheim-Neckarau",
		praesidiumId: "mannheim",
		coordinates: [8.5, 49.47] as [number, number],
		geometry: {
			type: "Polygon",
			coordinates: [
				[
					[8.49, 49.46],
					[8.51, 49.46],
					[8.51, 49.48],
					[8.49, 49.48],
					[8.49, 49.46],
				],
			],
		},
		contact: {
			phone: "+49 621 174-100",
			email: "neckarau@polizei.bwl.de",
			address: "Neckarauer Straße 25, 68199 Mannheim",
		},
	},
	{
		id: "mannheim-schwetzingerstadt",
		name: "Polizeirevier Mannheim-Schwetzingerstadt",
		praesidiumId: "mannheim",
		coordinates: [8.44, 49.5] as [number, number],
		geometry: {
			type: "Polygon",
			coordinates: [
				[
					[8.43, 49.49],
					[8.45, 49.49],
					[8.45, 49.51],
					[8.43, 49.51],
					[8.43, 49.49],
				],
			],
		},
		contact: {
			phone: "+49 621 174-200",
			email: "schwetzingerstadt@polizei.bwl.de",
			address: "Schwetzinger Straße 8, 68165 Mannheim",
		},
	},
];

// API Functions - Real implementations
export const searchPraesidien = async (query: string): Promise<Praesidium[]> => {
	try {
		return await getPraesidienBySearch(query);
	} catch (error) {
		console.error('Error searching Präsidien:', error);
		// Fallback to mock data
		await new Promise((resolve) => setTimeout(resolve, 300));
		if (!query.trim()) return MOCK_PRAESIDIEN;
		return MOCK_PRAESIDIEN.filter((praesidium) =>
			praesidium.name.toLowerCase().includes(query.toLowerCase()),
		);
	}
};

export const getReviereByPraesidiumApi = async (praesidiumId: string): Promise<Revier[]> => {
	try {
		return await getReviereByPraesidium(praesidiumId);
	} catch (error) {
		console.error('Error loading Reviere:', error);
		// Fallback to mock data
		await new Promise((resolve) => setTimeout(resolve, 200));
		return MOCK_REVIERE.filter((revier) => revier.praesidiumId === praesidiumId);
	}
};

export const calculateRoutes = async (
	startCoords: Coordinates,
	targets: Revier[],
): Promise<RouteResult[]> => {
	return await calculateRoutesWithMultipleProviders(startCoords, targets);
};

export const geocodeAddressLegacy = async (
	address: string,
): Promise<z.infer<typeof GeocodingResponseSchema>> => {
	const results = await geocodeAddress(address);
	if (results.length === 0) {
		throw new Error("No results found");
	}
	
	const result = results[0];
	return {
		display_name: result.display_name,
		lat: result.coordinates[1],
		lon: result.coordinates[0],
		place_id: parseInt(result.id.replace(/\D/g, '')) || 0,
		type: result.source,
		address: result.address,
	};
};

// React Query Hooks
export const usePraesidienSearch = (query: string) => {
	return useQuery({
		queryKey: ["praesidien", query],
		queryFn: () => searchPraesidien(query),
		enabled: query.length >= 2,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

export const useReviereByPraesidium = (praesidiumId: string) => {
	return useQuery({
		queryKey: ["reviere", praesidiumId],
		queryFn: () => getReviereByPraesidiumApi(praesidiumId),
		enabled: !!praesidiumId,
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
};

export const useRouteCalculation = (startCoords: Coordinates | undefined, targets: Revier[]) => {
	return useQuery({
		queryKey: ["routes", startCoords, targets.map((t) => t.id)],
                queryFn: () => {
                        if (!startCoords) throw new Error("Start coordinates required");
                        return calculateRoutes(startCoords, targets);
                },
		enabled: !!startCoords && targets.length > 0,
		staleTime: 2 * 60 * 1000, // 2 minutes
		gcTime: 5 * 60 * 1000, // 5 minutes
	});
};

export const useGeocoding = (address: string) => {
	return useQuery({
		queryKey: ["geocoding", address],
		queryFn: () => geocodeAddressLegacy(address),
		enabled: address.length >= 3,
		staleTime: 30 * 60 * 1000, // 30 minutes
		gcTime: 60 * 60 * 1000, // 1 hour
	});
};

// Mutations
export const useSaveRoute = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (route: RouteResult) => {
			// Simulate saving to backend
			await new Promise((resolve) => setTimeout(resolve, 500));
			return route;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["saved-routes"] });
		},
	});
};

export const useExportRoutes = () => {
	return useMutation({
		mutationFn: async (routes: RouteResult[]) => {
			// Simulate export process
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Generate CSV content
			const csvContent = [
				"Name,Distance (km),Duration (min)",
				...routes.map((route) => `${route.name},${route.distance.toFixed(1)},${route.duration}`),
			].join("\n");

			// Create and download file
			const blob = new Blob([csvContent], { type: "text/csv" });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `routes-${new Date().toISOString().split("T")[0]}.csv`;
			a.click();
			window.URL.revokeObjectURL(url);

			return routes;
		},
	});
};

// Utility Functions
export const formatDistance = (distance: number): string => {
	return `${distance.toFixed(1)} km`;
};

export const formatDuration = (duration: number): string => {
	const hours = Math.floor(duration / 60);
	const minutes = duration % 60;

	if (hours > 0) {
		return `${hours}h ${minutes}min`;
	}
	return `${minutes} min`;
};

export const calculateBoundingBox = (coordinates: Coordinates[]): [Coordinates, Coordinates] => {
	if (coordinates.length === 0) {
		return [
			[0, 0],
			[0, 0],
		];
	}

	const lats = coordinates.map((coord) => coord[1]);
	const lngs = coordinates.map((coord) => coord[0]);

	return [
		[Math.min(...lngs), Math.min(...lats)],
		[Math.max(...lngs), Math.max(...lats)],
	];
};
