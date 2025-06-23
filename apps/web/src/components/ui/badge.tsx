import type * as React from "react";
import { cn } from "../../lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
	const variantClasses = {
		default: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
		secondary: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
		destructive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
		outline: "border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300",
	};

	return (
		<div
			className={cn(
				"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
				variantClasses[variant],
				className,
			)}
			{...props}
		/>
	);
}

export { Badge };
