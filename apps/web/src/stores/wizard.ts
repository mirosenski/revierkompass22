import { create } from "zustand";
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { z } from "zod";

// Enhanced Types with Zod Validation
const CoordinatesSchema = z.tuple([z.number(), z.number()]);
const AddressSchema = z.object({
	display_name: z.string(),
	lat: z.string().transform(Number),
	lon: z.string().transform(Number),
	place_id: z.number(),
	type: z.string().optional(),
});

const RevierSchema = z.object({
	id: z.string(),
	name: z.string(),
	praesidiumId: z.string(),
	coordinates: CoordinatesSchema,
	geometry: z
		.object({
			type: z.string(),
			coordinates: z.array(z.array(z.array(z.number()))), // GeoJSON Polygon coordinates
		})
		.optional(),
	contact: z
		.object({
			phone: z.string().optional(),
			email: z.string().optional(),
			address: z.string().optional(),
		})
		.optional(),
	distance: z.number().optional(),
	duration: z.number().optional(),
});

const RouteResultSchema = z.object({
	id: z.string(),
	name: z.string(),
	distance: z.number(),
	duration: z.number(),
	geometry: z
		.object({
			type: z.string(),
			coordinates: z.array(CoordinatesSchema),
		})
		.optional(),
	alternatives: z
		.array(
			z.object({
				distance: z.number(),
				duration: z.number(),
				geometry: z.object({
					type: z.string(),
					coordinates: z.array(CoordinatesSchema),
				}),
			}),
		)
		.optional(),
});

// Types
export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type Revier = z.infer<typeof RevierSchema>;
export type RouteResult = z.infer<typeof RouteResultSchema>;

export interface Praesidium {
	id: string;
	name: string;
	coordinates: Coordinates;
	childReviere: string[];
}

interface WizardState {
	// Step 0 - Start location
	startAddress?: string;
	startCoords?: Coordinates;
	addressValidation: "idle" | "loading" | "success" | "error";

	// Step 1 - Search & Selection
	query: string;
	searchResults: Praesidium[];
	praesidium?: Praesidium;
	searchMode: "presidium" | "custom";

	// Step 2 - Reviere selection
	selectedReviere: Revier[];
	availableReviere: Revier[];
	selectionMode: "single" | "multiple";

	// Step 3 - Results
	routeResults: RouteResult[];
	calculationStatus: "idle" | "calculating" | "success" | "error";
	selectedRoute?: RouteResult;

	// Navigation & UI
	currentStep: number;

	// Actions
	setStart: (addr: string, coords?: Coordinates) => void;
	setQuery: (q: string) => void;
	setSearchResults: (results: Praesidium[]) => void;
	choosePraesidium: (p: Praesidium | null) => void;
	toggleRevier: (revier: Revier) => void;
	setAvailableReviere: (reviere: Revier[]) => void;
	setRouteResults: (results: RouteResult[]) => void;
	setSelectedRoute: (route: RouteResult) => void;
	setCalculationStatus: (status: WizardState["calculationStatus"]) => void;
	setSearchMode: (mode: "presidium" | "custom") => void;
	setSelectionMode: (mode: "single" | "multiple") => void;
	nextStep: () => void;
	previousStep: () => void;
	goToStep: (step: number) => void;
	reset: () => void;
	isStepValid: (step: number) => boolean;
	canProceed: (step: number) => boolean;
	validateStep: (step: number) => boolean;
}

const initialState = {
	query: "",
	searchResults: [],
	selectedReviere: [],
	availableReviere: [],
	routeResults: [],
	currentStep: 1,
	addressValidation: "idle" as const,
	searchMode: "presidium" as const,
	selectionMode: "multiple" as const,
	calculationStatus: "idle" as const,
};

export const useWizardStore = create<WizardState>()(
	devtools(
		persist(
			subscribeWithSelector(
				immer((set, get) => ({
					...initialState,

					setStart: (addr, coords) =>
						set((state) => {
							state.startAddress = addr;
							state.startCoords = coords;
							state.addressValidation = coords ? "success" : "error";
						}),

					setQuery: (q) =>
						set((state) => {
							state.query = q;
						}),

					setSearchResults: (results) =>
						set((state) => {
							state.searchResults = results;
						}),

					choosePraesidium: (p) =>
						set((state) => {
							state.praesidium = p || undefined;
							if (p) {
								state.currentStep = 2;
								// Auto-select all Reviere when Präsidium is selected
								const reviereForPraesidium = state.availableReviere.filter(
									(revier) => revier.praesidiumId === p.id
								);
								state.selectedReviere = reviereForPraesidium;
							} else {
								// Clear selection when no Präsidium is selected
								state.selectedReviere = [];
							}
						}),

					toggleRevier: (revier: Revier) =>
						set((state) => {
							const index = state.selectedReviere.findIndex((r) => r.id === revier.id);
							if (index >= 0) {
								state.selectedReviere.splice(index, 1);
							} else {
								if (state.selectionMode === "single") {
									state.selectedReviere = [revier];
								} else {
									state.selectedReviere.push(revier);
								}
							}
						}),

					setAvailableReviere: (reviere) =>
						set((state) => {
							state.availableReviere = reviere;
						}),

					setRouteResults: (results) =>
						set((state) => {
							state.routeResults = results;
							state.calculationStatus = "success";
						}),

					setSelectedRoute: (route) =>
						set((state) => {
							state.selectedRoute = route;
						}),

					setCalculationStatus: (status) =>
						set((state) => {
							state.calculationStatus = status;
						}),

					setSearchMode: (mode) =>
						set((state) => {
							state.searchMode = mode;
						}),

					setSelectionMode: (mode) =>
						set((state) => {
							state.selectionMode = mode;
						}),

					nextStep: () =>
						set((state) => {
							if (state.currentStep < 3 && get().canProceed(state.currentStep)) {
								state.currentStep += 1;
							}
						}),

					previousStep: () =>
						set((state) => {
							if (state.currentStep > 1) {
								state.currentStep -= 1;
							}
						}),

					goToStep: (step) =>
						set((state) => {
							state.currentStep = Math.max(1, Math.min(3, step));
						}),

					reset: () => set(() => initialState),

					isStepValid: (step) => get().validateStep(step),

					canProceed: (step) => {
						const state = get();
						switch (step) {
							case 1:
								return !!state.startCoords && state.addressValidation === "success";
							case 2:
								return state.selectedReviere.length > 0;
							case 3:
								return state.routeResults.length > 0;
							default:
								return false;
						}
					},

					validateStep: (step) => {
						const state = get();
						switch (step) {
							case 1:
								return !!state.startCoords && state.addressValidation === "success";
							case 2:
								return state.selectedReviere.length > 0;
							case 3:
								return state.routeResults.length > 0;
							default:
								return false;
						}
					},
				})),
			),
			{
				name: "revierkompass-wizard",
				partialize: (state) => ({
					startAddress: state.startAddress,
					startCoords: state.startCoords,
					query: state.query,
					praesidium: state.praesidium,
					selectedReviere: state.selectedReviere,
					currentStep: state.currentStep,
					searchMode: state.searchMode,
					selectionMode: state.selectionMode,
				}),
			},
		),
		{
			name: "WizardStore",
		},
	),
);

// Enhanced Selectors
export const selectCanProceedToStep2 = (state: WizardState) =>
	!!state.startCoords && state.addressValidation === "success";
export const selectCanProceedToStep3 = (state: WizardState) => state.selectedReviere.length > 0;
export const selectIsStepCompleted = (step: number) => (state: WizardState) => {
	switch (step) {
		case 1:
			return selectCanProceedToStep2(state);
		case 2:
			return selectCanProceedToStep3(state);
		case 3:
			return state.routeResults.length > 0;
		default:
			return false;
	}
};

export const selectWizardProgress = (state: WizardState) => {
	const completedSteps = [1, 2, 3].filter((step) => selectIsStepCompleted(step)(state)).length;
	return (completedSteps / 3) * 100;
};
