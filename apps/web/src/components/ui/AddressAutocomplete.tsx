import { useState, useCallback, useRef, useEffect } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { MapPin, Loader2, X, Target, CheckCircle } from "lucide-react";
import { geocodeAddress, type GeocodingResult } from "../../services/geocoding";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AddressAutocompleteProps {
	placeholder?: string;
	value?: string;
	onSelect: (address: string, coordinates: [number, number], precision?: string) => void;
	onClear?: () => void;
	className?: string;
	autoFocus?: boolean;
}

export function AddressAutocomplete({
	placeholder = "Enter address...",
	value = "",
	onSelect,
	onClear,
	className,
	autoFocus = false,
}: AddressAutocompleteProps) {
	const [query, setQuery] = useState(value);
	const [results, setResults] = useState<GeocodingResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
	
	const inputRef = useRef<HTMLInputElement>(null);
	const resultsRef = useRef<HTMLDivElement>(null);

	// Search function with debouncing
	const performSearch = useCallback(async (searchQuery: string) => {
		if (searchQuery.length < 3) {
			setResults([]);
			setIsOpen(false);
			return;
		}

		setIsLoading(true);
		try {
			const geocodingResults = await geocodeAddress(searchQuery);
			setResults(geocodingResults);
			setIsOpen(geocodingResults.length > 0);
			setSelectedIndex(-1);
		} catch (error) {
			console.error('Geocoding error:', error);
			setResults([]);
			setIsOpen(false);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Debounced search
	const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const newQuery = e.target.value;
		setQuery(newQuery);

		// Clear existing timeout
		if (debounceTimeout) {
			clearTimeout(debounceTimeout);
		}

		// Set new timeout
		const timeout = setTimeout(() => {
			performSearch(newQuery);
		}, 300);
		setDebounceTimeout(timeout);
	}, [debounceTimeout, performSearch]);

	// Handle result selection
	const handleSelect = useCallback((result: GeocodingResult) => {
		setQuery(result.display_name);
		setIsOpen(false);
		onSelect(result.display_name, result.coordinates, result.confidence);
	}, [onSelect]);

	// Handle keyboard navigation
	const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
		if (!isOpen || results.length === 0) return;

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				setSelectedIndex((prev) => 
					prev < results.length - 1 ? prev + 1 : prev
				);
				break;
			case 'ArrowUp':
				e.preventDefault();
				setSelectedIndex((prev) => prev > 0 ? prev - 1 : prev);
				break;
			case 'Enter':
				e.preventDefault();
				if (selectedIndex >= 0 && selectedIndex < results.length) {
					handleSelect(results[selectedIndex]);
				}
				break;
			case 'Escape':
				setIsOpen(false);
				setSelectedIndex(-1);
				break;
		}
	}, [isOpen, results, selectedIndex, handleSelect]);

	// Handle clear
	const handleClear = useCallback(() => {
		setQuery("");
		setResults([]);
		setIsOpen(false);
		setSelectedIndex(-1);
		onClear?.();
		inputRef.current?.focus();
	}, [onClear]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// Clean up timeout on unmount
	useEffect(() => {
		return () => {
			if (debounceTimeout) {
				clearTimeout(debounceTimeout);
			}
		};
	}, [debounceTimeout]);

	// Auto focus
	useEffect(() => {
		if (autoFocus && inputRef.current) {
			inputRef.current.focus();
		}
	}, [autoFocus]);

	// Confidence icon and color
	const getConfidenceDisplay = (confidence: GeocodingResult['confidence']) => {
		switch (confidence) {
			case 'submeter':
				return { icon: Target, color: 'text-green-600', label: 'Submeter precision' };
			case 'meter':
				return { icon: Target, color: 'text-blue-600', label: 'Meter precision' };
			case 'street':
				return { icon: MapPin, color: 'text-yellow-600', label: 'Street precision' };
			case 'city':
				return { icon: MapPin, color: 'text-orange-600', label: 'City precision' };
			case 'region':
				return { icon: MapPin, color: 'text-red-600', label: 'Region precision' };
			default:
				return { icon: MapPin, color: 'text-gray-600', label: 'Unknown precision' };
		}
	};

	return (
		<div className={cn("relative w-full", className)} ref={resultsRef}>
			<div className="relative">
				<Input
					ref={inputRef}
					type="text"
					value={query}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					className="pr-16 pl-12"
					autoComplete="off"
					aria-expanded={isOpen}
					aria-haspopup="listbox"
					role="combobox"
				/>
				
				<div className="absolute left-3 top-1/2 transform -translate-y-1/2">
					<MapPin className="h-5 w-5 text-gray-400" />
				</div>
				
				<div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
					{isLoading && (
						<Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
					)}
					{query && !isLoading && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={handleClear}
							className="h-6 w-6 p-0 hover:bg-gray-100"
						>
							<X className="h-3 w-3" />
							<span className="sr-only">Clear</span>
						</Button>
					)}
				</div>
			</div>

			<AnimatePresence>
				{isOpen && results.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: -10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -10, scale: 0.95 }}
						transition={{ duration: 0.15 }}
						className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto"
						role="listbox"
					>
						{results.map((result, index) => {
							const isSelected = index === selectedIndex;
							const { icon: ConfidenceIcon, color } = getConfidenceDisplay(result.confidence);
							
							return (
								<motion.div
									key={result.id}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: index * 0.05 }}
									className={cn(
										"flex items-start gap-3 p-3 cursor-pointer transition-colors",
										"hover:bg-gray-50 dark:hover:bg-gray-700",
										isSelected && "bg-blue-50 dark:bg-blue-900/20"
									)}
									onClick={() => handleSelect(result)}
									role="option"
									aria-selected={isSelected}
								>
									<div className="flex-shrink-0 mt-1">
										<ConfidenceIcon className={cn("h-4 w-4", color)} />
									</div>
									
									<div className="flex-1 min-w-0">
										<div className="font-medium text-gray-900 dark:text-gray-100 truncate">
											{result.display_name}
										</div>
										
										<div className="flex items-center gap-2 mt-1">
											<span className={cn("text-xs font-medium px-2 py-1 rounded-full", {
												'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': result.confidence === 'submeter',
												'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': result.confidence === 'meter',
												'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': result.confidence === 'street',
												'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200': result.confidence === 'city',
												'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': result.confidence === 'region',
											})}>
												{result.confidence}
											</span>
											
											<span className="text-xs text-gray-500 dark:text-gray-400">
												{result.source}
											</span>
											
											{result.address.state && (
												<span className="text-xs text-gray-500 dark:text-gray-400">
													{result.address.state}
												</span>
											)}
										</div>
									</div>
									
									{result.confidence === 'submeter' && (
										<div className="flex-shrink-0">
											<CheckCircle className="h-4 w-4 text-green-600" />
										</div>
									)}
								</motion.div>
							);
						})}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
