import { Button } from "@/components/ui/button";
import { Menu, Search, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
	HoverNavigationMenu,
	NavigationMenuTrigger,
	NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { useState, useRef, useEffect, useId } from "react";

export function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const mobileMenuRef = useRef<HTMLDivElement>(null);
	const mobileToggleRef = useRef<HTMLButtonElement>(null);
	const mobileMenuId = useId();

	// Keyboard navigation für Mobile Menu
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!mobileMenuOpen) return;

			const menuItems = mobileMenuRef.current?.querySelectorAll(
				"a, button",
			) as NodeListOf<HTMLElement>;
			const currentIndex = Array.from(menuItems).findIndex(
				(item) => item === document.activeElement,
			);

			switch (e.key) {
				case "ArrowDown": {
					e.preventDefault();
					const nextIndex = (currentIndex + 1) % menuItems.length;
					menuItems[nextIndex]?.focus();
					break;
				}
				case "ArrowUp": {
					e.preventDefault();
					const prevIndex = currentIndex <= 0 ? menuItems.length - 1 : currentIndex - 1;
					menuItems[prevIndex]?.focus();
					break;
				}
				case "Escape":
					setMobileMenuOpen(false);
					mobileToggleRef.current?.focus();
					break;
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [mobileMenuOpen]);

	// Focus trap für Mobile Menu
	useEffect(() => {
		if (!mobileMenuOpen) return;

		const handleTabKey = (e: KeyboardEvent) => {
			const menuItems = mobileMenuRef.current?.querySelectorAll(
				"a, button",
			) as NodeListOf<HTMLElement>;
			const firstItem = menuItems[0];
			const lastItem = menuItems[menuItems.length - 1];

			if (e.shiftKey && document.activeElement === firstItem) {
				e.preventDefault();
				lastItem?.focus();
			} else if (!e.shiftKey && document.activeElement === lastItem) {
				e.preventDefault();
				firstItem?.focus();
			}
		};

		document.addEventListener("keydown", handleTabKey);
		return () => document.removeEventListener("keydown", handleTabKey);
	}, [mobileMenuOpen]);

	return (
		<header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200/20 dark:border-gray-800/20">
			{/* Backdrop blur for glassmorphism effect */}
			<div
				className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl"
				aria-hidden="true"
			/>

			<nav className="relative container mx-auto px-4 sm:px-6 lg:px-8" aria-label="Hauptnavigation">
				<div className="flex h-16 items-center justify-between">
					{/* Logo & Brand */}
					<div className="flex items-center">
						<a
							href="/"
							className="flex items-center gap-3 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
							aria-label="RevierKompass - Zur Startseite"
						>
							<img src="/logo.svg" alt="" className="h-8 w-auto" aria-hidden="true" />
							<span className="hidden sm:inline">RevierKompass</span>
						</a>
					</div>

					{/* Center spacer */}
					<div className="flex-1" aria-hidden="true" />

					{/* Right side: Navigation + Actions */}
					<div className="flex items-center gap-3">
						{/* Desktop Navigation - Hover Dropdown */}
						<div className="hidden lg:block">
							<HoverNavigationMenu
								trigger={<NavigationMenuTrigger>Schnellstart</NavigationMenuTrigger>}
							>
								<div className="w-[500px] p-4">
									<div className="grid grid-cols-2 gap-3">
										{/* Hauptaktion */}
										<div className="col-span-2">
											<NavigationMenuLink
												href="/wizard"
												className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-blue-500/10 to-blue-600/10 p-6 no-underline outline-none focus:shadow-md hover:scale-105 transition-transform"
												aria-label="Route finden - Schnellste Route zum nächsten Revier berechnen"
											>
												<Search
													className="h-6 w-6 mb-2 text-blue-600 dark:text-blue-400"
													aria-hidden="true"
												/>
												<div className="mb-2 text-lg font-medium">Route finden</div>
												<p className="text-sm leading-tight text-gray-600 dark:text-gray-400">
													Schnellste Route zum nächsten Revier berechnen
												</p>
											</NavigationMenuLink>
										</div>

										{/* Sekundäre Aktionen */}
										<NavigationMenuLink
											href="/praesidien"
											className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-all hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-50 dark:focus:bg-gray-700 dark:focus:text-gray-50 hover:scale-105"
											aria-label="Präsidien - Alle Polizeipräsidien im Überblick"
										>
											<div className="text-sm font-medium leading-none">Präsidien</div>
											<p className="line-clamp-2 text-sm leading-snug text-gray-600 dark:text-gray-400">
												Alle Polizeipräsidien im Überblick
											</p>
										</NavigationMenuLink>

										<NavigationMenuLink
											href="/karte"
											className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-all hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-50 dark:focus:bg-gray-700 dark:focus:text-gray-50 hover:scale-105"
											aria-label="Kartenansicht - Interaktive Karte mit allen Standorten"
										>
											<div className="text-sm font-medium leading-none">Kartenansicht</div>
											<p className="line-clamp-2 text-sm leading-snug text-gray-600 dark:text-gray-400">
												Interaktive Karte mit allen Standorten
											</p>
										</NavigationMenuLink>
									</div>
								</div>
							</HoverNavigationMenu>
						</div>

						{/* Theme Toggle */}
						<ThemeToggle />

						{/* Admin Login - Prominenter */}
						<Button
							variant="outline"
							size="sm"
							className="hidden sm:flex items-center gap-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
							aria-label="Admin Login - Administrator-Bereich öffnen"
						>
							<Shield className="h-4 w-4" aria-hidden="true" />
							<span className="hidden md:inline">Admin</span>
						</Button>

						{/* Mobile Menu Toggle */}
						<Button
							ref={mobileToggleRef}
							variant="ghost"
							size="icon"
							className="lg:hidden"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							aria-expanded={mobileMenuOpen}
							aria-controls={mobileMenuId}
							aria-label={mobileMenuOpen ? "Navigation schließen" : "Navigation öffnen"}
						>
							<Menu className="h-5 w-5" aria-hidden="true" />
						</Button>
					</div>
				</div>

				{/* Mobile Navigation */}
				{mobileMenuOpen && (
					<div
						ref={mobileMenuRef}
						id={mobileMenuId}
						className="lg:hidden py-4 border-t border-gray-200/20 dark:border-gray-800/20"
						role="menu"
						aria-label="Mobile Navigation"
					>
						<div className="flex flex-col gap-2">
							<a
								href="/wizard"
								className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
								role="menuitem"
								aria-label="Route finden - Schnellste Route zum nächsten Revier berechnen"
							>
								<Search className="h-4 w-4" aria-hidden="true" />
								Route finden
							</a>
							<a
								href="/praesidien"
								className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
								role="menuitem"
								aria-label="Präsidien - Alle Polizeipräsidien im Überblick"
							>
								Präsidien
							</a>
							<a
								href="/karte"
								className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
								role="menuitem"
								aria-label="Karte - Interaktive Karte mit allen Standorten"
							>
								Karte
							</a>
							<hr className="my-2 border-gray-200 dark:border-gray-800" />
							<a
								href="/admin"
								className="px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-950 rounded-md flex items-center gap-2 text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
								role="menuitem"
								aria-label="Admin Login - Administrator-Bereich öffnen"
							>
								<Shield className="h-4 w-4" aria-hidden="true" />
								Admin Login
							</a>
						</div>
					</div>
				)}
			</nav>
		</header>
	);
}
