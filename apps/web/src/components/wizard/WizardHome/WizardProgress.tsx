import { Check, MapPin, Shield, Route } from "lucide-react";
import { motion } from "framer-motion";

interface WizardProgressProps {
	currentStep: number;
	progress: number;
}

const steps = [
	{
		id: 1,
		title: "Startadresse",
		icon: MapPin,
		description: "Ihre Position eingeben",
	},
	{
		id: 2,
		title: "Ziele wählen",
		icon: Shield,
		description: "Polizeireviere auswählen",
	},
	{
		id: 3,
		title: "Routen berechnen",
		icon: Route,
		description: "Optimale Wege finden",
	},
];

export function WizardProgress({ currentStep, progress }: WizardProgressProps) {
	return (
		<div className="mb-8">
			{/* Progress Bar */}
			<div className="relative mb-6">
				<div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700">
					<motion.div
						className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
						initial={{ width: 0 }}
						animate={{ width: `${progress}%` }}
						transition={{ duration: 0.5, ease: "easeOut" }}
					/>
				</div>
			</div>

			{/* Step Indicators */}
			<div className="flex justify-between">
				{steps.map((step, index) => {
					const isCompleted = currentStep > step.id;
					const isCurrent = currentStep === step.id;
					const Icon = step.icon;

					return (
						<motion.div
							key={step.id}
							className="flex flex-col items-center flex-1"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<div className="relative">
								<div
									className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
										isCompleted
											? "bg-green-500 border-green-500 text-white"
											: isCurrent
												? "bg-blue-500 border-blue-500 text-white"
												: "bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-600"
									}`}
								>
									{isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
								</div>

								{/* Connection Line */}
								{index < steps.length - 1 && (
									<div
										className={`absolute top-6 left-12 w-full h-0.5 transition-colors duration-300 ${
											isCompleted ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
										}`}
									/>
								)}
							</div>

							<div className="mt-3 text-center">
								<h3
									className={`text-sm font-medium transition-colors duration-300 ${
										isCompleted || isCurrent
											? "text-gray-900 dark:text-white"
											: "text-gray-500 dark:text-gray-400"
									}`}
								>
									{step.title}
								</h3>
								<p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{step.description}</p>
							</div>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}
