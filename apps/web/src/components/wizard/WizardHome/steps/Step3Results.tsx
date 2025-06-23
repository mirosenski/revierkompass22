import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Copy,
	Loader2,
	FileText,
	FileSpreadsheet,
	Share,
	Printer,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useExportRoutes, formatDistance, formatDuration } from "@/services/wizard";
import type { RouteResult } from "@/stores/wizard";
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
		// Clear localStorage completely
		localStorage.removeItem("revierkompass-wizard");
		// Reload the page to reset everything
		window.location.reload();
	};

	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			className="space-y-6"
		>
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
						className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
						disabled={results.length === 0}
					>
						<Printer className="mr-2 h-4 w-4" />
						Drucken
					</Button>
				</div>
			</Card>

			{/* Ergebnisliste */}
			<Card className="p-6 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl">
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
									<div className="flex items-center gap-3 mb-2">
										<span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
											{index + 1}
										</span>
										<div>
											<div className="font-semibold text-lg">{result.name}</div>
											<div className="text-sm text-gray-500 dark:text-gray-400">
												{formatDistance(result.distance)} • {formatDuration(result.duration)}
											</div>
										</div>
									</div>
								</Card>
							</motion.div>
						))
					) : (
						<div className="text-center text-gray-500 py-8">Keine Routen berechnet</div>
					)}
				</div>
			</Card>
			{/* Neue Zielsuche starten */}
			<Card className="p-4 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20">
				<button
					onClick={handleNewSearch}
					className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
				>
					Neue Zielsuche starten
				</button>
			</Card>
		</motion.div>
	);
}
