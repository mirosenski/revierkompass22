import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Route,
	Clock,
	Copy,
	Loader2,
	Sparkles,
	FileText,
	FileSpreadsheet,
	Share,
	Printer,
	Zap,
	Target,
	Map,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useWizardStore } from "@/stores/wizard";
import { useExportRoutes, formatDistance, formatDuration } from "@/services/wizard";
import type { RouteResult } from "@/stores/wizard";
import { EnhancedMapView } from "@/components/ui/EnhancedMapView";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

declare module "jspdf" {
    interface jsPDF {
        // biome-ignore lint/suspicious/noExplicitAny: third-party definition
        autoTable: (options: any) => jsPDF;
    }
}

interface Step3ResultsProps {
	results: RouteResult[];
	loading: boolean;
}

export function Step3Results({ results, loading }: Step3ResultsProps) {
	const [copied, setCopied] = useState(false);
	const [activeProvider, setActiveProvider] = useState("osrm");
	const { reset } = useWizardStore();
	const exportMutation = useExportRoutes();

	const handleCopy = () => {
		const text = results
			.map(
				(r, i) =>
					`${i + 1}. ${r.name}\n   ${formatDistance(r.distance)} - ${formatDuration(r.duration)}`,
			)
			.join("\n\n");
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleExport = () => {
		exportMutation.mutate(results);
	};

	const handleExportPDF = async () => {
		const doc = new jsPDF();

		// Header
		doc.setFontSize(20);
		doc.text("Revierkompass - Routenoptimierung", 20, 20);

		doc.setFontSize(12);
		doc.text(`Erstellt am: ${new Date().toLocaleDateString("de-DE")}`, 20, 35);
		doc.text(`Anzahl Ziele: ${results.length}`, 20, 45);

		// Results table
		const tableData = results.map((result, index) => [
			`${index + 1}`,
			result.name,
			formatDistance(result.distance),
			formatDuration(result.duration),
		]);

                // biome-ignore lint/suspicious/noExplicitAny: library augmentation
                (doc as any).autoTable({
			startY: 60,
			head: [["#", "Ziel", "Distanz", "Dauer"]],
			body: tableData,
			theme: "grid",
			headStyles: { fillColor: [59, 130, 246] },
			styles: { fontSize: 10 },
		});

		doc.save("revierkompass-routen.pdf");
	};

	const handleShare = () => {
		const shareData = {
			title: "Revierkompass Routenoptimierung",
			text: `Optimierte Routen für ${results.length} Ziele`,
			url: window.location.href,
		};

		if (navigator.share) {
			navigator.share(shareData);
		} else {
			handleCopy();
		}
	};

	const handlePrint = () => {
		window.print();
	};

	const handleNewSearch = () => {
		reset();
	};

	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			className="space-y-6"
		>
			{/* Header Card */}
			<Card className="p-6 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl">
				<div className="flex items-center gap-3 mb-4">
					<div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
						<Sparkles className="h-6 w-6 text-white" />
					</div>
					<div>
						<h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">
							Routenoptimierung abgeschlossen
						</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							{results.length} optimierte Routen berechnet
						</p>
					</div>
				</div>

				{/* Provider Selection */}
				<div className="flex gap-2 mb-4">
					<Button
						variant={activeProvider === "osrm" ? "default" : "outline"}
						onClick={() => setActiveProvider("osrm")}
						className="hover:scale-105 transition-transform"
					>
						<Route className="mr-2 h-4 w-4" />
						OSRM
					</Button>
					<Button
						variant={activeProvider === "valhalla" ? "default" : "outline"}
						onClick={() => setActiveProvider("valhalla")}
						className="hover:scale-105 transition-transform"
					>
						<Target className="mr-2 h-4 w-4" />
						Valhalla
					</Button>
				</div>
			</Card>

			{/* Export Controls */}
			<Card className="p-6 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl">
				<div className="flex flex-wrap gap-3">
					<Button
						onClick={handleCopy}
						variant="outline"
						className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
						disabled={results.length === 0}
					>
						<Copy className="mr-2 h-4 w-4" />
						{copied ? "Kopiert!" : "Kopieren"}
					</Button>

					<Button
						onClick={handleExport}
						className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
						disabled={results.length === 0 || exportMutation.isPending}
					>
						<FileSpreadsheet className="mr-2 h-4 w-4" />
						{exportMutation.isPending ? "Exportiere..." : "Excel Export"}
					</Button>

					<Button
						onClick={handleExportPDF}
						className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
						disabled={results.length === 0}
					>
						<FileText className="mr-2 h-4 w-4" />
						PDF (Vektor)
					</Button>

					<Button
						onClick={handleShare}
						className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
						disabled={results.length === 0}
					>
						<Share className="mr-2 h-4 w-4" />
						Teilen-Link
					</Button>

					<Button
						onClick={handlePrint}
						className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
						disabled={results.length === 0}
					>
						<Printer className="mr-2 h-4 w-4" />
						Drucken
					</Button>
				</div>
			</Card>

			{/* Enhanced Map View */}
			{!loading && results.length > 0 && (
				<Card className="p-1 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl overflow-hidden">
					<div className="flex items-center justify-between p-4 pb-2">
						<div className="flex items-center gap-2">
							<Map className="h-5 w-5 text-blue-600 dark:text-blue-400" />
							<h3 className="font-semibold text-gray-900 dark:text-gray-100">Routenübersicht</h3>
						</div>
						<div className="text-xs text-gray-500 dark:text-gray-400">
							{results.length} Route{results.length !== 1 ? 'n' : ''} berechnet
						</div>
					</div>
					<div className="h-96 rounded-xl overflow-hidden">
						<EnhancedMapView
							startCoordinates={useWizardStore.getState().startCoords}
							destinations={results.map(result => ({
								id: result.id,
								name: result.name,
								coordinates: useWizardStore.getState().selectedReviere.find(r => r.id === result.id)?.coordinates || [0, 0],
								address: result.name
							}))}
							routes={results}
							showControls={true}
							style="light"
							className="w-full h-full"
						/>
					</div>
				</Card>
			)}

			{/* Results */}
			<div className="space-y-4">
				{loading ? (
					<Card className="p-8 text-center backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl">
						<Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
						<p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
							Berechne optimale Routen...
						</p>
						<p className="text-sm text-gray-500 dark:text-gray-500">
							Multi-Provider Routing mit OSRM & Valhalla
						</p>
					</Card>
				) : results.length > 0 ? (
					results.map((result, index) => (
						<motion.div
							key={result.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<Card className="p-6 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center mb-4">
											<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
												{index + 1}
											</div>
											<div>
												<h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">
													{result.name}
												</h3>
												<div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
													<span className="flex items-center text-blue-600 dark:text-blue-400">
														<Route className="mr-1 h-4 w-4" />
														{formatDistance(result.distance)}
													</span>
													<span className="flex items-center text-green-600 dark:text-green-400">
														<Clock className="mr-1 h-4 w-4" />
														{formatDuration(result.duration)}
													</span>
												</div>
											</div>
										</div>

										{/* Route Details */}
										{result.alternatives && result.alternatives.length > 0 && (
											<div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
												<h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
													Alternative Routen:
												</h4>
												<div className="space-y-2">
                                                                        {result.alternatives?.slice(0, 3).map((alt: any, altIndex: number) => (
                                                                                <div
                                                                                        key={`${result.id}-alt-${altIndex}`}
                                                                                        className="flex items-center justify-between text-sm"
                                                                                >
                                                                                        <span className="text-gray-600 dark:text-gray-400">
                                                                                                Alternative {altIndex + 1}
															</span>
															<div className="flex items-center gap-4">
																<span className="text-blue-600 dark:text-blue-400">
																	{formatDistance(alt.distance)}
																</span>
																<span className="text-green-600 dark:text-green-400">
																	{formatDuration(alt.duration)}
																</span>
															</div>
														</div>
													))}
												</div>
											</div>
										)}
									</div>
									<Sparkles className="h-6 w-6 text-yellow-500 ml-4" />
								</div>
							</Card>
						</motion.div>
					))
				) : (
					<Card className="p-8 text-center backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl">
						<Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
						<p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
							Keine Ergebnisse verfügbar
						</p>
						<p className="text-sm text-gray-500 dark:text-gray-500">
							Überprüfen Sie Ihre Eingaben und versuchen Sie es erneut
						</p>
					</Card>
				)}
			</div>

			{/* New Search Button */}
			<Card className="p-4 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20">
				<Button variant="outline" onClick={handleNewSearch} className="w-full h-12 font-semibold">
					<Zap className="mr-2 h-5 w-5" />
					Neue Routenoptimierung starten
				</Button>
			</Card>
		</motion.div>
	);
}
