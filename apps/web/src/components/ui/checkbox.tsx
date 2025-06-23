import * as React from "react";
import { cn } from "../../lib/utils";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
	checked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
	({ className, checked, onCheckedChange, ...props }, ref) => {
		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			onCheckedChange?.(e.target.checked);
		};

		return (
			<input
				type="checkbox"
				ref={ref}
				checked={checked}
				onChange={handleChange}
				className={cn(
					"h-4 w-4 rounded border border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800",
					className,
				)}
				{...props}
			/>
		);
	},
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
