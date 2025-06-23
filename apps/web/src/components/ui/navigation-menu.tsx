import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, useId } from "react";

// Navigation Menu Root - Container für das gesamte Navigation Menu
function NavigationMenu({ className, children, ...props }: React.ComponentProps<"div">) {
	return (
		<nav data-slot="navigation-menu" className={cn("relative", className)} {...props}>
			{children}
		</nav>
	);
}

// Navigation Menu List - Container für Menu Items
function NavigationMenuList({ className, children, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="navigation-menu-list"
			className={cn("flex items-center gap-1", className)}
			role="menubar"
			{...props}
		>
			{children}
		</div>
	);
}

// Navigation Menu Item - Container für einzelne Menu Items
function NavigationMenuItem({ className, children, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="navigation-menu-item"
			className={cn("relative", className)}
			role="none"
			{...props}
		>
			{children}
		</div>
	);
}

// Navigation Menu Trigger - Button der das Dropdown öffnet
const navigationMenuTriggerStyle = cva(
	"group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1",
);

function NavigationMenuTrigger({
	className,
	children,
	onClick,
	onKeyDown,
	onMouseEnter,
	onMouseLeave,
	...props
}: React.ComponentProps<"button">) {
	return (
		<button
			data-slot="navigation-menu-trigger"
			className={cn(navigationMenuTriggerStyle(), "group", className)}
			onClick={onClick}
			onKeyDown={onKeyDown}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			role="menuitem"
			aria-haspopup="true"
			{...props}
		>
			{children}{" "}
			<ChevronDownIcon
				className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
				aria-hidden="true"
			/>
		</button>
	);
}

// Navigation Menu Content - Dropdown Inhalt
function NavigationMenuContent({ className, children, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="navigation-menu-content"
			className={cn(
				"absolute top-full right-0 mt-2 bg-popover text-popover-foreground rounded-md border shadow-md z-50",
				className,
			)}
			role="menu"
			{...props}
		>
			{children}
		</div>
	);
}

// Navigation Menu Link - Links innerhalb des Dropdowns
function NavigationMenuLink({ className, children, ...props }: React.ComponentProps<"a">) {
	return (
		<a
			data-slot="navigation-menu-link"
			className={cn(
				"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-all hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			role="menuitem"
			tabIndex={0}
			{...props}
		>
			{children}
		</a>
	);
}

// Navigation Menu Viewport - Container für das Dropdown (nicht mehr benötigt, aber für Kompatibilität)
function NavigationMenuViewport({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="navigation-menu-viewport" className={cn("", className)} {...props} />;
}

// Navigation Menu Indicator - Indicator für aktive Items (nicht mehr benötigt, aber für Kompatibilität)
function NavigationMenuIndicator({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="navigation-menu-indicator" className={cn("", className)} {...props} />;
}

// Hover Navigation Menu - Erweiterte Version mit vollständiger Accessibility
interface HoverNavigationMenuProps {
	trigger: React.ReactElement<{
		onMouseEnter?: (event: React.MouseEvent) => void;
		onMouseLeave?: (event: React.MouseEvent) => void;
		"aria-expanded"?: boolean;
		"aria-haspopup"?: string;
		"aria-controls"?: string;
		"data-state"?: string;
	}>;
	children: React.ReactNode;
	className?: string;
}

function HoverNavigationMenu({ trigger, children, className }: HoverNavigationMenuProps) {
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [isKeyboardUser, setIsKeyboardUser] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const dropdownMenuId = useId();

	// Keyboard detection to differentiate between pointer and keyboard users
	useEffect(() => {
		const handleDocumentKeyDown = (e: KeyboardEvent) => {
			if (
				e.key === "Tab" ||
				e.key === "ArrowUp" ||
				e.key === "ArrowDown" ||
				e.key === "Escape" ||
				e.key === "Enter" ||
				e.key === " "
			) {
				setIsKeyboardUser(true);
			}
		};

		const handleMouseDown = () => {
			setIsKeyboardUser(false);
		};

		document.addEventListener("keydown", handleDocumentKeyDown);
		document.addEventListener("mousedown", handleMouseDown);

		return () => {
			document.removeEventListener("keydown", handleDocumentKeyDown);
			document.removeEventListener("mousedown", handleMouseDown);
		};
	}, []);

	// Hover handlers mit Delay (nur für Mausbenutzer)
	const handleMouseEnter = () => {
		if (isKeyboardUser) return;

		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		setDropdownOpen(true);
	};

	const handleMouseLeave = () => {
		if (isKeyboardUser) return;

		timeoutRef.current = setTimeout(() => {
			setDropdownOpen(false);
		}, 150);
	};

	// Focus management für Dropdown
	const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
		const menuItems = Array.from(
			dropdownRef.current?.querySelectorAll('[role="menuitem"]') || [],
		) as HTMLElement[];
		const currentIndex = menuItems.findIndex((item) => item === document.activeElement);

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
			case "Home": {
				e.preventDefault();
				menuItems[0]?.focus();
				break;
			}
			case "End": {
				e.preventDefault();
				menuItems[menuItems.length - 1]?.focus();
				break;
			}
			case "Escape":
				e.preventDefault();
				setDropdownOpen(false);
				triggerRef.current?.focus();
				break;
			// Tab NICHT behandeln!
		}
	};

	// Click outside handler
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	// Focus trap für Dropdown - nur für Tab-Navigation
	useEffect(() => {
		if (!dropdownOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Tab") {
				const menuItems = Array.from(
					dropdownRef.current?.querySelectorAll('[role="menuitem"]') || [],
				) as HTMLElement[];
				const firstItem = menuItems[0];
				const lastItem = menuItems[menuItems.length - 1];

				if (e.shiftKey && document.activeElement === firstItem) {
					e.preventDefault();
					lastItem?.focus();
				} else if (!e.shiftKey && document.activeElement === lastItem) {
					e.preventDefault();
					firstItem?.focus();
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [dropdownOpen]);

	// Setze triggerRef auf den Button
	useEffect(() => {
		const triggerContainer = document.querySelector('[data-slot="navigation-menu-trigger"]');
		if (triggerContainer) {
			// triggerRef.current = triggerContainer as HTMLButtonElement;

			// Event-Listener direkt hinzufügen
			const handleClick = () => {
				setDropdownOpen((prev) => !prev);
			};

			const handleKeyDown = (e: Event) => {
				const keyboardEvent = e as KeyboardEvent;
				switch (keyboardEvent.key) {
					case "Enter":
					case " ": // Space
						keyboardEvent.preventDefault();
						setDropdownOpen((prev) => !prev);
						if (!dropdownOpen) {
							setTimeout(() => {
								const firstItem =
									dropdownRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
								firstItem?.focus();
							}, 0);
						}
						break;
					case "ArrowDown":
						keyboardEvent.preventDefault();
						setDropdownOpen(true);
						setTimeout(() => {
							const firstItem =
								dropdownRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
							firstItem?.focus();
						}, 0);
						break;
					case "Escape":
						keyboardEvent.preventDefault();
						setDropdownOpen(false);
						triggerRef.current?.focus();
						break;
				}
			};

			triggerContainer.addEventListener("click", handleClick);
			triggerContainer.addEventListener("keydown", handleKeyDown);

			return () => {
				triggerContainer.removeEventListener("click", handleClick);
				triggerContainer.removeEventListener("keydown", handleKeyDown);
			};
		}
	}, [dropdownOpen]);

	return (
		<div className={cn("relative", className)}>
			{/* Trigger-Button: Events direkt an das Trigger-Element weitergeben, kein Wrapper-Button! */}
			{React.isValidElement(trigger)
				? React.cloneElement(trigger, {
						onMouseEnter: handleMouseEnter,
						onMouseLeave: handleMouseLeave,
						"aria-expanded": dropdownOpen,
						"aria-haspopup": "true",
						"aria-controls": dropdownMenuId,
						"data-state": dropdownOpen ? "open" : "closed",
					})
				: trigger}

			{/* Dropdown Content */}
			{dropdownOpen && (
				<div
					ref={dropdownRef}
					id={dropdownMenuId}
					role="menu"
					aria-label="Schnellstart-Menü"
					className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200"
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					onKeyDown={handleDropdownKeyDown}
					tabIndex={-1}
				>
					{children}
				</div>
			)}
		</div>
	);
}

export {
	NavigationMenu,
	NavigationMenuList,
	NavigationMenuItem,
	NavigationMenuContent,
	NavigationMenuTrigger,
	NavigationMenuLink,
	NavigationMenuIndicator,
	NavigationMenuViewport,
	HoverNavigationMenu,
	navigationMenuTriggerStyle,
};
