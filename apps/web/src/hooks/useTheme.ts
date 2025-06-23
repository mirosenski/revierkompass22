import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
	const [theme, setTheme] = useState<Theme>(() => {
		try {
			// Versuche zuerst localStorage
			const saved = localStorage.getItem("theme");
			if (saved === "light" || saved === "dark" || saved === "system") {
				console.log("Theme aus localStorage geladen:", saved);
				return saved as Theme;
			}

			// Fallback zu sessionStorage
			const sessionSaved = sessionStorage.getItem("theme");
			if (sessionSaved === "light" || sessionSaved === "dark" || sessionSaved === "system") {
				console.log("Theme aus sessionStorage geladen:", sessionSaved);
				return sessionSaved as Theme;
			}
		} catch (error) {
			console.warn("Storage nicht verfügbar:", error);
		}
		console.log("Verwende System-Theme als Standard");
		return "system";
	});

	const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(() => {
		if (theme !== "system") return theme;
		return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
	});

	const applyTheme = useCallback((selectedTheme: Theme) => {
		const root = document.documentElement;
		root.classList.remove("light", "dark");

		let actualTheme: "light" | "dark";

		if (selectedTheme === "light") {
			root.classList.add("light");
			actualTheme = "light";
		} else if (selectedTheme === "dark") {
			root.classList.add("dark");
			actualTheme = "dark";
		} else {
			// System theme
			if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
				root.classList.add("dark");
				actualTheme = "dark";
			} else {
				root.classList.add("light");
				actualTheme = "light";
			}
		}

		setCurrentTheme(actualTheme);
		console.log("Theme angewendet:", selectedTheme, "->", actualTheme);
	}, []);

	const changeTheme = (newTheme: Theme) => {
		console.log("Theme gewechselt zu:", newTheme);
		setTheme(newTheme);
		applyTheme(newTheme);

		// Speichere in beiden Storages für maximale Kompatibilität
		try {
			localStorage.setItem("theme", newTheme);
			console.log("Theme in localStorage gespeichert:", newTheme);
		} catch (error) {
			console.warn("localStorage nicht verfügbar:", error);
		}

		try {
			sessionStorage.setItem("theme", newTheme);
			console.log("Theme in sessionStorage gespeichert:", newTheme);
		} catch (error) {
			console.warn("sessionStorage nicht verfügbar:", error);
		}
	};

	// Initial theme anwenden
	useEffect(() => {
		applyTheme(theme);
	}, [applyTheme, theme]);

	// System theme changes überwachen
	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const handler = (e: MediaQueryListEvent) => {
			if (theme === "system") {
				const root = document.documentElement;
				root.classList.remove("light", "dark");
				const newTheme = e.matches ? "dark" : "light";
				root.classList.add(newTheme);
				setCurrentTheme(newTheme);
				console.log("System-Theme geändert:", newTheme);
			}
		};

		mediaQuery.addEventListener("change", handler);
		return () => mediaQuery.removeEventListener("change", handler);
	}, [theme]);

	// Theme beim ersten Laden anwenden (verhindert Flash)
	useEffect(() => {
		const root = document.documentElement;
		// Prüfe ob bereits eine Theme-Klasse gesetzt ist (durch HTML-Script)
		const hasThemeClass = root.classList.contains("light") || root.classList.contains("dark");

		if (!hasThemeClass) {
			// Nur anwenden wenn noch keine Klasse gesetzt ist
			if (
				theme === "dark" ||
				(theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
			) {
				root.classList.add("dark");
			} else {
				root.classList.add("light");
			}
		}
	}, [theme]);

	return {
		theme,
		currentTheme,
		changeTheme,
		isDark: currentTheme === "dark",
		isLight: currentTheme === "light",
		isSystem: theme === "system",
	};
}
