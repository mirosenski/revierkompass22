import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Building2, MapPin, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useWizardStore, type Praesidium } from "@/stores/wizard";
import { usePraesidienSearch, useReviereByPraesidium } from "@/services/wizard";
import { VirtualizedHierarchy } from "@/components/ui/VirtualizedHierarchy";

export function Step2Selection() {
	const {
		query,
		setQuery,
		selectedReviere,
		toggleRevier,
		previousStep,
		nextStep,
		canProceed,
		praesidium,
		choosePraesidium,
		setAvailableReviere,
	} = useWizardStore();

	const [searchQuery, setSearchQuery] = useState(query);

	// React Query für Praesidien-Suche
	const { data: praesidien = [], isLoading: isLoadingPraesidien } =
		usePraesidienSearch(searchQuery);

	// React Query für Reviere
	const { data: reviere = [], isLoading: isLoadingReviere } = useReviereByPraesidium(
		praesidium?.id || "",
	);

	// Update available reviere when praesidium changes
	useEffect(() => {
		if (reviere.length > 0) {
			setAvailableReviere(reviere);
		}
	}, [reviere, setAvailableReviere]);

        const handlePraesidiumSelect = (selectedPraesidium: Praesidium) => {
		choosePraesidium(selectedPraesidium);
		setSearchQuery(selectedPraesidium.name);
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchQuery(value);
		setQuery(value);
	};

	const handleReorderReviere = (revierIds: string[]) => {
		// Hier könnte die Logik für die Neuordnung implementiert werden
		console.log("Reviere neu geordnet:", revierIds);
	};

	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			className="space-y-6"
		>
			{/* Selection Card */}
			<Card className="p-6 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl">
				{/* Praesidium Selection */}
				{!praesidium && (
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Building2 className="h-5 w-5 text-blue-600" />
							<span className="text-lg font-semibold">Polizeipräsidium auswählen:</span>
						</div>

						<Input
							placeholder="Präsidium suchen (z.B. Stuttgart, Karlsruhe...)"
							value={searchQuery}
							onChange={handleSearchChange}
							className="h-12 text-lg"
						/>

						<div className="space-y-2 max-h-64 overflow-y-auto">
							{isLoadingPraesidien ? (
								<div className="text-center py-8 text-gray-500">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
									Suche läuft...
								</div>
							) : praesidien.length > 0 ? (
								praesidien.map((praesidium) => (
									<motion.div
										key={praesidium.id}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										<Button
											variant="outline"
											className="w-full justify-start h-auto p-4 text-left"
											onClick={() => handlePraesidiumSelect(praesidium)}
										>
											<Building2 className="mr-3 h-5 w-5" />
											<div>
												<div className="font-semibold text-lg">{praesidium.name}</div>
												<div className="text-sm opacity-70">
													{praesidium.childReviere.length} Reviere verfügbar
												</div>
											</div>
										</Button>
									</motion.div>
								))
							) : searchQuery.length > 0 ? (
								<div className="text-center py-8 text-gray-500">Keine Präsidien gefunden</div>
							) : (
								<div className="text-center py-8 text-gray-500">
									Geben Sie einen Suchbegriff ein
								</div>
							)}
						</div>
					</div>
				)}

				{/* Selected Praesidium */}
				{praesidium && (
					<div className="space-y-6">
						<div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
							<div className="flex items-center gap-3">
								<Building2 className="h-5 w-5 text-blue-600" />
								<div>
									<span className="font-semibold text-lg">{praesidium.name}</span>
									<div className="text-sm text-blue-600 dark:text-blue-400">
										{reviere.length} Reviere verfügbar
									</div>
								</div>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									choosePraesidium(null);
									setSearchQuery("");
								}}
								className="hover:bg-blue-100 dark:hover:bg-blue-800"
							>
								Ändern
							</Button>
						</div>

						{/* Reviere Selection mit VirtualizedHierarchy */}
						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<MapPin className="h-5 w-5 text-green-600" />
								<span className="text-lg font-semibold">Reviere auswählen:</span>
							</div>

							{isLoadingReviere ? (
								<div className="text-center py-8 text-gray-500">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
									Lade Reviere...
								</div>
							) : reviere.length > 0 ? (
								<VirtualizedHierarchy
									praesidien={[praesidium]}
									selectedReviere={selectedReviere}
									onToggleRevier={toggleRevier}
									onReorderReviere={handleReorderReviere}
									availableReviere={reviere}
								/>
							) : (
								<div className="text-center py-8 text-gray-500">
									Keine Reviere für dieses Präsidium verfügbar
								</div>
							)}
						</div>
					</div>
				)}
			</Card>

			{/* Navigation */}
			<Card className="p-4 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20">
				<div className="flex gap-3">
					<Button variant="outline" onClick={previousStep} className="flex-1 h-12">
						<ArrowLeft className="mr-2 h-5 w-5" />
						Zurück
					</Button>
					<Button
						onClick={nextStep}
						disabled={!canProceed(2)}
						className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
					>
						<Zap className="mr-2 h-5 w-5" />
						Routen berechnen
						<Search className="ml-2 h-5 w-5" />
					</Button>
				</div>
			</Card>
		</motion.div>
	);
}
