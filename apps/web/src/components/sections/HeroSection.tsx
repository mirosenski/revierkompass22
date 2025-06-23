import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Search, Shield, Zap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
	const startWizard = () => {
		window.location.href = "/wizard";
	};

	const handleAllPresidencies = () => {
		window.location.href = "/praesidien";
	};

	return (
		<section className="relative min-h-[60vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
			{/* Background gradient */}
			<div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20" />

			{/* Grid pattern overlay */}
			<div className="absolute inset-0 bg-grid-gray-100/50 dark:bg-grid-gray-800/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

			<div className="relative container mx-auto max-w-6xl">
				{/* Main Hero Content */}
				<motion.div
					className="text-center mb-8"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					<motion.div
						className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6"
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.2, duration: 0.5 }}
					>
						<Sparkles className="h-4 w-4" />
						Intelligenter Routen-Wizard
					</motion.div>

					<motion.h1
						className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-4 text-shadow-lg text-shadow-black/20 dark:text-shadow-white/10"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3, duration: 0.8 }}
					>
						Willkommen beim
						<span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-shadow-lg text-shadow-blue-500/30 dark:text-shadow-blue-400/20">
							RevierKompass
						</span>
					</motion.h1>

					<motion.p
						className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 text-shadow-sm text-shadow-black/10 dark:text-shadow-white/5"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4, duration: 0.8 }}
					>
						Finden Sie in Sekundenschnelle die optimale Route zum nächsten Polizeipräsidium.
						Intelligent, offline-fähig und immer aktuell.
					</motion.p>

					<motion.div
						className="flex flex-col sm:flex-row gap-4 justify-center"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5, duration: 0.8 }}
					>
						<Button
							size="lg"
							className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all pointer-coarse:px-12 pointer-coarse:py-6 pointer-coarse:text-xl text-shadow-sm text-shadow-black/20"
							onClick={startWizard}
						>
							<Search className="mr-2 h-5 w-5 pointer-coarse:h-6 pointer-coarse:w-6" />
							Wizard starten
							<ArrowRight className="ml-2 h-5 w-5 pointer-coarse:h-6 pointer-coarse:w-6" />
						</Button>
						<Button
							variant="outline"
							size="lg"
							className="px-8 py-4 text-lg pointer-coarse:px-12 pointer-coarse:py-6 pointer-coarse:text-xl text-shadow-sm text-shadow-black/10"
							onClick={handleAllPresidencies}
						>
							<MapPin className="mr-2 h-5 w-5 pointer-coarse:h-6 pointer-coarse:w-6" />
							Alle Präsidien
						</Button>
					</motion.div>
				</motion.div>

				{/* Compact Feature Cards */}
				<motion.div
					className="grid grid-cols-1 md:grid-cols-3 gap-4"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.6, duration: 0.8 }}
				>
					<div className="flex items-center gap-3 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700">
						<div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
							<Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<h3 className="font-semibold text-gray-900 dark:text-white">
								Sicher & DSGVO-konform
							</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400">Alle Daten verschlüsselt</p>
						</div>
					</div>

					<div className="flex items-center gap-3 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700">
						<div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-2">
							<Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
						</div>
						<div>
							<h3 className="font-semibold text-gray-900 dark:text-white">Blitzschnell</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400">&lt;100ms Antwortzeit</p>
						</div>
					</div>

					<div className="flex items-center gap-3 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700">
						<div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2">
							<MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />
						</div>
						<div>
							<h3 className="font-semibold text-gray-900 dark:text-white">Offline-fähig</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400">PWA Technologie</p>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
