import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import { MapPin, ArrowRight, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useWizardStore } from "@/stores/wizard";
import { useState } from "react";

export function Step1Address() {
	const { startAddress, nextStep, setStart, canProceed } = useWizardStore();
	const [precision, setPrecision] = useState<string>("");

	const handleAddressSelect = (
		address: string,
		coordinates: [number, number],
		precision?: string,
	) => {
		setStart(address, coordinates);
		setPrecision(precision || "");
	};

	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
		>
			<Card className="p-6 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl">
				<div className="space-y-6">
					<div className="flex items-center gap-3 mb-6">
						<div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
							<MapPin className="h-6 w-6 text-white" />
						</div>
						<div>
							<h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">
								Ihre Startadresse
							</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Geben Sie Ihre Adresse für präzise Routenberechnung ein
							</p>
						</div>
					</div>

					<div className="space-y-4">
						<AddressAutocomplete
							value={startAddress || ""}
							onSelect={handleAddressSelect}
							placeholder="Straße, Hausnummer, PLZ, Stadt"
							autoFocus={true}
						/>

						{precision && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
							>
								<Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
								<span className="text-sm text-blue-700 dark:text-blue-300">
									{precision === "submeter" && "🔍 Submeter-Genauigkeit erkannt"}
									{precision === "meter" && "📍 Meter-Genauigkeit erkannt"}
									{precision === "street" && "🏠 Straßen-Genauigkeit erkannt"}
									{precision === "city" && "🏙️ Stadt-Genauigkeit erkannt"}
									{precision === "region" && "🌍 Regions-Genauigkeit erkannt"}
								</span>
							</motion.div>
						)}
					</div>

					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
						<Button
							onClick={nextStep}
							disabled={!canProceed(1)}
							className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
						>
							<Zap className="mr-2 h-5 w-5" />
							Weiter zur Zielauswahl
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
					</motion.div>
				</div>
			</Card>
		</motion.div>
	);
}
