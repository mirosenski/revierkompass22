import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Checkbox } from "./checkbox";
import { Badge } from "./badge";
import { Shield, GripVertical, MapPin, Building2 } from "lucide-react";
import type { Revier, Praesidium } from "@/stores/wizard";

interface VirtualizedHierarchyProps {
	praesidien: Praesidium[];
	selectedReviere: Revier[];
	onToggleRevier: (revier: Revier) => void;
	onReorderReviere: (revierIds: string[]) => void;
	availableReviere: Revier[];
	className?: string;
}

// Sortable Item Component
function SortableRevierItem({
	revier,
	isSelected,
	onToggle,
}: {
	revier: Revier;
	isSelected: boolean;
	onToggle: () => void;
}) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: revier.id,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<motion.div
			ref={setNodeRef}
			style={style}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			className={`relative ${isDragging ? "z-50" : "z-0"}`}
		>
			<div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
				{/* Drag Handle */}
				<div
					{...attributes}
					{...listeners}
					className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
				>
					<GripVertical className="h-4 w-4 text-gray-400" />
				</div>

				{/* Checkbox */}
				<Checkbox
					checked={isSelected}
					onCheckedChange={onToggle}
					className="h-6 w-6 rounded-lg border-2 border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
				/>

				{/* Revier Info */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-3 mb-1">
						<Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
						<span className="font-medium text-gray-900 dark:text-gray-100 truncate">
							{revier.name}
						</span>
						<Badge variant="outline" className="px-2 py-1 text-xs">
							{revier.praesidiumId}
						</Badge>
					</div>
					{revier.contact?.address && (
						<div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
							<MapPin className="h-3 w-3" />
							<span className="truncate">{revier.contact.address}</span>
						</div>
					)}
				</div>

				{/* Selection Indicator */}
				{isSelected && (
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						className="w-2 h-2 bg-blue-600 rounded-full"
					/>
				)}
			</div>
		</motion.div>
	);
}

export function VirtualizedHierarchy({
	praesidien,
	selectedReviere,
	onToggleRevier,
	onReorderReviere,
	availableReviere,
	className = "",
}: VirtualizedHierarchyProps) {
	const [expandedPraesidien, setExpandedPraesidien] = useState<Set<string>>(new Set());

	// Flattened list of all reviere with praesidium info
	const allReviere = useMemo(() => {
		const reviere: Array<Revier & { praesidiumName: string }> = [];

		praesidien.forEach((praesidium) => {
			if (expandedPraesidien.has(praesidium.id)) {
				// Filter available reviere that belong to this praesidium
				const praesidiumReviere = availableReviere.filter(
					(revier) => revier.praesidiumId === praesidium.id,
				);

				praesidiumReviere.forEach((revier) => {
					reviere.push({
						...revier,
						praesidiumName: praesidium.name,
					});
				});
			}
		});

		return reviere;
	}, [praesidien, expandedPraesidien, availableReviere]);

	// Virtualizer setup
	const parentRef = useRef<HTMLDivElement>(null);
	const rowVirtualizer = useVirtualizer({
		count: allReviere.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 80,
		overscan: 5,
	});

	const togglePraesidium = (praesidiumId: string) => {
		setExpandedPraesidien((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(praesidiumId)) {
				newSet.delete(praesidiumId);
			} else {
				newSet.add(praesidiumId);
			}
			return newSet;
		});
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = allReviere.findIndex((revier) => revier.id === active.id);
			const newIndex = allReviere.findIndex((revier) => revier.id === over.id);

			const newOrder = [...allReviere.map((r) => r.id)];
			const [removed] = newOrder.splice(oldIndex, 1);
			newOrder.splice(newIndex, 0, removed);

			onReorderReviere(newOrder);
		}
	};

	return (
		<div className={`space-y-4 ${className}`}>
			{/* Praesidien List */}
			<div className="space-y-2">
				{praesidien.map((praesidium) => {
					const praesidiumReviere = availableReviere.filter(
						(revier) => revier.praesidiumId === praesidium.id,
					);

					return (
						<motion.div
							key={praesidium.id}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
						>
                                        <button
                                                type="button"
                                                onClick={() => togglePraesidium(praesidium.id)}
                                                className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors rounded-lg"
                                        >
								<div className="flex items-center gap-3">
									<Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
									<div className="text-left">
										<div className="font-semibold text-gray-900 dark:text-gray-100">
											{praesidium.name}
										</div>
										<div className="text-sm text-gray-500 dark:text-gray-400">
											{praesidiumReviere.length} Reviere verfügbar
										</div>
									</div>
								</div>
								<motion.div
									animate={{ rotate: expandedPraesidien.has(praesidium.id) ? 180 : 0 }}
									transition={{ duration: 0.2 }}
									className="text-gray-400"
								>
									▼
								</motion.div>
							</button>

							<AnimatePresence>
								{expandedPraesidien.has(praesidium.id) && (
									<motion.div
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: "auto", opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ duration: 0.3, ease: "easeInOut" }}
										className="overflow-hidden"
									>
										<div className="p-4 pt-0">
											<DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
												<SortableContext
													items={praesidiumReviere.map((r) => r.id)}
													strategy={verticalListSortingStrategy}
												>
													<div className="space-y-2">
														{praesidiumReviere.map((revier) => (
															<SortableRevierItem
																key={revier.id}
																revier={revier}
																isSelected={selectedReviere.some((r) => r.id === revier.id)}
																onToggle={() => onToggleRevier(revier)}
															/>
														))}
													</div>
												</SortableContext>
											</DndContext>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</motion.div>
					);
				})}
			</div>

			{/* Virtualized List for Large Datasets */}
			{allReviere.length > 50 && (
				<div className="mt-6">
					<div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
						Virtualisierte Ansicht für {allReviere.length} Reviere
					</div>
					<div
						ref={parentRef}
						className="h-[400px] overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg"
					>
						<div
							style={{
								height: `${rowVirtualizer.getTotalSize()}px`,
								width: "100%",
								position: "relative",
							}}
						>
							{rowVirtualizer.getVirtualItems().map((virtualRow) => {
								const revier = allReviere[virtualRow.index];
								return (
									<div
										key={virtualRow.index}
										style={{
											position: "absolute",
											top: 0,
											left: 0,
											width: "100%",
											height: `${virtualRow.size}px`,
											transform: `translateY(${virtualRow.start}px)`,
										}}
									>
										<SortableRevierItem
											revier={revier}
											isSelected={selectedReviere.some((r) => r.id === revier.id)}
											onToggle={() => onToggleRevier(revier)}
										/>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
