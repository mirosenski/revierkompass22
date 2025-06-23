import { useMemo, useState, useCallback, useEffect } from "react";
import { useDebounce } from "./useDebounce";

interface UseVirtualizedDataOptions<T> {
	data: T[];
	searchKeys?: (keyof T)[];
	itemsPerPage?: number;
	debounceMs?: number;
}

interface UseVirtualizedDataReturn<T> {
	// Filtered and paginated data
	displayData: T[];
	totalItems: number;
	totalPages: number;
	currentPage: number;

	// Search
	searchQuery: string;
	setSearchQuery: (query: string) => void;

	// Pagination
	goToPage: (page: number) => void;
	nextPage: () => void;
	previousPage: () => void;

	// Sorting
	sortBy: keyof T | null;
	sortDirection: "asc" | "desc";
	toggleSort: (key: keyof T) => void;

	// Selection
	selectedItems: Set<T>;
	toggleSelection: (item: T) => void;
	selectAll: () => void;
	clearSelection: () => void;
	isSelected: (item: T) => boolean;
}

export function useVirtualizedData<T extends Record<string, unknown>>({
	data,
	searchKeys = [],
	itemsPerPage = 50,
	debounceMs = 300,
}: UseVirtualizedDataOptions<T>): UseVirtualizedDataReturn<T> {
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [sortBy, setSortBy] = useState<keyof T | null>(null);
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
	const [selectedItems, setSelectedItems] = useState<Set<T>>(new Set());

	const debouncedSearchQuery = useDebounce(searchQuery, debounceMs);

	// Filter data based on search query
	const filteredData = useMemo(() => {
		if (!debouncedSearchQuery) return data;

		const query = debouncedSearchQuery.toLowerCase();
		return data.filter((item) => {
			if (searchKeys.length === 0) {
				// Search all string values if no keys specified
				return Object.values(item).some((value) => String(value).toLowerCase().includes(query));
			}

			// Search only specified keys
			return searchKeys.some((key) => String(item[key]).toLowerCase().includes(query));
		});
	}, [data, debouncedSearchQuery, searchKeys]);

	// Sort filtered data
	const sortedData = useMemo(() => {
		if (!sortBy) return filteredData;

		return [...filteredData].sort((a, b) => {
			const aVal = a[sortBy];
			const bVal = b[sortBy];

			if (aVal === bVal) return 0;

			const comparison = aVal < bVal ? -1 : 1;
			return sortDirection === "asc" ? comparison : -comparison;
		});
	}, [filteredData, sortBy, sortDirection]);

	// Paginate sorted data
	const { displayData, totalPages } = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;

		return {
			displayData: sortedData.slice(startIndex, endIndex),
			totalPages: Math.ceil(sortedData.length / itemsPerPage),
		};
	}, [sortedData, currentPage, itemsPerPage]);

	// Reset to page 1 when search changes
        useEffect(() => {
                setCurrentPage(1);
        }, []);

	// Pagination handlers
	const goToPage = useCallback(
		(page: number) => {
			setCurrentPage(Math.max(1, Math.min(page, totalPages)));
		},
		[totalPages],
	);

	const nextPage = useCallback(() => {
		goToPage(currentPage + 1);
	}, [currentPage, goToPage]);

	const previousPage = useCallback(() => {
		goToPage(currentPage - 1);
	}, [currentPage, goToPage]);

	// Sort handler
	const toggleSort = useCallback(
		(key: keyof T) => {
			if (sortBy === key) {
				setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
			} else {
				setSortBy(key);
				setSortDirection("asc");
			}
		},
		[sortBy],
	);

	// Selection handlers
	const toggleSelection = useCallback((item: T) => {
		setSelectedItems((prev) => {
			const next = new Set(prev);
			if (next.has(item)) {
				next.delete(item);
			} else {
				next.add(item);
			}
			return next;
		});
	}, []);

	const selectAll = useCallback(() => {
		setSelectedItems(new Set(displayData));
	}, [displayData]);

	const clearSelection = useCallback(() => {
		setSelectedItems(new Set());
	}, []);

	const isSelected = useCallback(
		(item: T) => {
			return selectedItems.has(item);
		},
		[selectedItems],
	);

	return {
		displayData,
		totalItems: sortedData.length,
		totalPages,
		currentPage,
		searchQuery,
		setSearchQuery,
		goToPage,
		nextPage,
		previousPage,
		sortBy,
		sortDirection,
		toggleSort,
		selectedItems,
		toggleSelection,
		selectAll,
		clearSelection,
		isSelected,
	};
}
