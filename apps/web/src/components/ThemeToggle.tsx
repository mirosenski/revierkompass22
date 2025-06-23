import { useEffect, useState, useId } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>(() => {
		const saved = localStorage.getItem("theme");
		if (saved === "light" || saved === "dark") {
			return saved as Theme;
		}
		return "system";
	});

	const [mounted, setMounted] = useState(false);
	const themeDescriptionId = useId();

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		const root = document.documentElement;
		root.classList.remove("light", "dark");

		if (theme === "light") {
			root.classList.add("light");
		} else if (theme === "dark") {
			root.classList.add("dark");
		} else {
			if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
				root.classList.add("dark");
			} else {
				root.classList.add("light");
			}
		}

		localStorage.setItem("theme", theme);
	}, [theme]);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const handler = (e: MediaQueryListEvent) => {
			if (theme === "system") {
				const root = document.documentElement;
				root.classList.remove("light", "dark");
				root.classList.add(e.matches ? "dark" : "light");
			}
		};

		mediaQuery.addEventListener("change", handler);
		return () => mediaQuery.removeEventListener("change", handler);
	}, [theme]);

	if (!mounted) return null;

	return (
		<div
			className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-full"
			role="radiogroup"
			aria-label="Theme auswählen"
			aria-describedby={themeDescriptionId}
		>
			<div id={themeDescriptionId} className="sr-only">
				Wählen Sie zwischen hellem, dunklem oder System-Theme
			</div>

			<button
				type="button"
				onClick={() => setTheme("light")}
				className={`relative p-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
					theme === "light"
						? "bg-white dark:bg-gray-700 shadow-sm scale-110"
						: "hover:bg-gray-200 dark:hover:bg-gray-700 scale-95 opacity-60"
				}`}
				title="Hell"
				aria-label="Helles Theme aktivieren"
			>
				<Sun className="h-4 w-4" aria-hidden="true" />
			</button>

			<button
				type="button"
				onClick={() => setTheme("system")}
				className={`relative p-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
					theme === "system"
						? "bg-white dark:bg-gray-700 shadow-sm scale-110"
						: "hover:bg-gray-200 dark:hover:bg-gray-700 scale-95 opacity-60"
				}`}
				title="System"
				aria-label="System-Theme aktivieren"
			>
				<Monitor className="h-4 w-4" aria-hidden="true" />
			</button>

			<button
				type="button"
				onClick={() => setTheme("dark")}
				className={`relative p-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
					theme === "dark"
						? "bg-white dark:bg-gray-700 shadow-sm scale-110"
						: "hover:bg-gray-200 dark:hover:bg-gray-700 scale-95 opacity-60"
				}`}
				title="Dunkel"
				aria-label="Dunkles Theme aktivieren"
			>
				<Moon className="h-4 w-4" aria-hidden="true" />
			</button>
		</div>
	);
}
