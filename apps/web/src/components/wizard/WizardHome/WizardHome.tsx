import { useEffect, useId } from "react";
import { Card } from "@/components/ui/card";
import { MapView } from "@/components/ui/MapView";
import { AnimatePresence } from "framer-motion";
import { WizardProgress } from "./WizardProgress";
import { Step1Address, Step2Selection, Step3Results } from "./steps";
import { useWizardStore, selectWizardProgress } from "@/stores/wizard";
import { useRouteCalculation } from "@/services/wizard";

export function WizardHome() {
	const wizardId = useId();
	const {
		currentStep,
		startCoords,
		selectedReviere,
		routeResults,
		calculationStatus,
		setRouteResults,
		setCalculationStatus,
	} = useWizardStore();

	const progress = useWizardStore(selectWizardProgress);

	// React Query für Routenberechnung
	const { data: calculatedRoutes, isLoading: isCalculating } = useRouteCalculation(
		startCoords,
		selectedReviere,
	);

	// Update store when routes are calculated
	useEffect(() => {
		if (calculatedRoutes) {
			setRouteResults(calculatedRoutes);
		}
	}, [calculatedRoutes, setRouteResults]);

	// Update calculation status
	useEffect(() => {
		if (isCalculating) {
			setCalculationStatus("calculating");
		} else if (calculatedRoutes) {
			setCalculationStatus("success");
		}
	}, [isCalculating, calculatedRoutes, setCalculationStatus]);

	// Mock destinations for map display
	const destinations = selectedReviere.map((revier) => ({
		id: revier.id,
		name: revier.name,
		coordinates: revier.coordinates,
		address: revier.contact?.address || revier.name,
	}));

	return (
		<div
			id={wizardId}
			className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20"
		>
			<div className="container mx-auto px-4 py-8 max-w-6xl">
				{/* Progress Bar */}
				<WizardProgress currentStep={currentStep} progress={progress} />

				{/* Step Content */}
				<AnimatePresence mode="wait">
					<div key={currentStep} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Left Column - Form/Results */}
						<div className="lg:col-span-1 space-y-6">
							{currentStep === 1 && <Step1Address />}

							{currentStep === 2 && <Step2Selection />}

							{currentStep === 3 && (
								<Step3Results
									results={routeResults}
									loading={calculationStatus === "calculating"}
								/>
							)}
						</div>

						{/* Right Column - Map */}
						<div className="lg:col-span-2">
							<Card className="h-[600px] backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 overflow-hidden">
								<MapView
									startCoordinates={startCoords}
									destinations={destinations}
									routes={routeResults}
								/>
							</Card>
						</div>
					</div>
				</AnimatePresence>
			</div>
		</div>
	);
}
