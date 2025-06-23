import { useWizardStore } from "../stores/wizard";
import { useCallback } from "react";

export function useWizardNavigation() {
	const { currentStep, nextStep, previousStep, goToStep, canProceed } = useWizardStore();

	const navigateToStep = useCallback(
		(step: number) => {
			goToStep(step);
		},
		[goToStep],
	);

	const handleNext = useCallback(() => {
		if (!canProceed(currentStep)) {
			console.warn(`Cannot proceed from step ${currentStep}`);
			return;
		}
		nextStep();
	}, [currentStep, canProceed, nextStep]);

	const handlePrevious = useCallback(() => {
		previousStep();
	}, [previousStep]);

	const canGoNext = canProceed(currentStep);
	const canGoPrevious = currentStep > 1;

	return {
		currentStep,
		navigateToStep,
		handleNext,
		handlePrevious,
		canGoNext,
		canGoPrevious,
	};
}
