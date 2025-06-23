import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from "web-vitals";

export interface VitalsReport {
	metric: string;
	value: number;
	rating: "good" | "needs-improvement" | "poor";
	timestamp: number;
}

// Thresholds based on Google's recommendations
const thresholds = {
	CLS: { good: 0.1, poor: 0.25 },
	INP: { good: 100, poor: 300 },
	LCP: { good: 2500, poor: 4000 },
	FCP: { good: 1800, poor: 3000 },
	TTFB: { good: 800, poor: 1800 },
};

function getRating(metric: string, value: number): "good" | "needs-improvement" | "poor" {
	const threshold = thresholds[metric as keyof typeof thresholds];
	if (!threshold) return "needs-improvement";

	if (value <= threshold.good) return "good";
	if (value >= threshold.poor) return "poor";
	return "needs-improvement";
}

// Analytics queue for batching
const analyticsQueue: VitalsReport[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

function queueAnalytics(report: VitalsReport) {
	analyticsQueue.push(report);

	// Batch send after 1 second of inactivity
	if (flushTimeout) clearTimeout(flushTimeout);
	flushTimeout = setTimeout(flushAnalytics, 1000);
}

function flushAnalytics() {
	if (analyticsQueue.length === 0) return;

	// Send to your analytics endpoint
	if (import.meta.env.PROD) {
		// Example: Send to your analytics service
		fetch("/api/analytics/vitals", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				reports: analyticsQueue.splice(0),
				url: window.location.href,
				userAgent: navigator.userAgent,
			}),
		}).catch(console.error);
	} else {
		// Development: Log to console
		console.table(analyticsQueue.splice(0));
	}
}

function sendToAnalytics({ name, delta, value, id }: Metric) {
	const report: VitalsReport = {
		metric: name,
		value: Math.round(name === "CLS" ? value * 1000 : value),
		rating: getRating(name, value),
		timestamp: Date.now(),
	};

	// Log to console in development
	if (import.meta.env.DEV) {
		console.log(`[Web Vitals] ${name}:`, {
			value: report.value,
			rating: report.rating,
			delta: Math.round(delta),
			id,
		});
	}

	queueAnalytics(report);
}

export function reportWebVitals() {
	// Core Web Vitals
	onCLS(sendToAnalytics);
	onINP(sendToAnalytics);
	onLCP(sendToAnalytics);

	// Additional metrics
	onFCP(sendToAnalytics);
	onTTFB(sendToAnalytics);
}

// Performance Observer for custom metrics
export function observePerformance() {
	if (typeof window === "undefined" || !("PerformanceObserver" in window)) return;

	// Observe long tasks
	try {
		const observer = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (entry.duration > 50) {
					console.warn("[Performance] Long task detected:", {
						duration: Math.round(entry.duration),
						startTime: Math.round(entry.startTime),
						name: entry.name,
					});
				}
			}
		});

		observer.observe({ entryTypes: ["longtask"] });
	} catch (_e) {
		// Longtask observer not supported
	}

	// Observe resource timing
	try {
		const resourceObserver = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				const resourceEntry = entry as PerformanceResourceTiming;

				// Log slow resources
				if (resourceEntry.duration > 1000) {
					console.warn("[Performance] Slow resource:", {
						name: resourceEntry.name,
						duration: Math.round(resourceEntry.duration),
						type: resourceEntry.initiatorType,
						size: resourceEntry.transferSize,
					});
				}
			}
		});

		resourceObserver.observe({ entryTypes: ["resource"] });
	} catch (_e) {
		// Resource observer not supported
	}
}

// Utility to measure custom operations
export function measurePerformance<T>(name: string, operation: () => T): T {
	const startMark = `${name}-start`;
	const endMark = `${name}-end`;
	const measureName = `${name}-duration`;

	performance.mark(startMark);

	try {
		const result = operation();

		performance.mark(endMark);
		performance.measure(measureName, startMark, endMark);

		const measure = performance.getEntriesByName(measureName)[0];
		if (measure && measure.duration > 100) {
			console.log(`[Performance] ${name} took ${Math.round(measure.duration)}ms`);
		}

		return result;
	} finally {
		// Clean up marks
		performance.clearMarks(startMark);
		performance.clearMarks(endMark);
		performance.clearMeasures(measureName);
	}
}

// Export for use in components
export const perfMark = (name: string) => performance.mark(name);
export const perfMeasure = (name: string, startMark: string, endMark: string) => {
	performance.measure(name, startMark, endMark);
	const entries = performance.getEntriesByName(name);
	return entries[entries.length - 1]?.duration || 0;
};
