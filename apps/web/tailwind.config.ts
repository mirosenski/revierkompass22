import type { Config } from "tailwindcss";

export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				primary: {
					50: "hsl(var(--rk-primary-50) / <alpha-value>)",
					100: "hsl(var(--rk-primary-100) / <alpha-value>)",
					500: "hsl(var(--rk-primary-500) / <alpha-value>)",
					700: "hsl(var(--rk-primary-700) / <alpha-value>)",
				},
				gray: {
					50: "hsl(var(--rk-gray-50) / <alpha-value>)",
					900: "hsl(var(--rk-gray-900) / <alpha-value>)",
				},
			},
			borderRadius: {
				sm: "var(--rk-radius-sm)",
				DEFAULT: "var(--rk-radius-md)",
				lg: "var(--rk-radius-lg)",
			},
			boxShadow: {
				xs: "var(--rk-shadow-xs)",
				sm: "var(--rk-shadow-sm)",
			},
			textShadow: {
				'2xs': '0 1px 1px var(--tw-shadow-color)',
				xs: '0 1px 2px var(--tw-shadow-color)',
				sm: '0 2px 4px var(--tw-shadow-color)',
				DEFAULT: '0 2px 4px var(--tw-shadow-color)',
				md: '0 4px 6px var(--tw-shadow-color)',
				lg: '0 4px 8px var(--tw-shadow-color)',
			},
		},
	},
	plugins: [
		require("tailwindcss-animate"),
		function({ addUtilities }: any) {
			const newUtilities = {
				'.mask-radial-from-transparent': {
					'mask-image': 'radial-gradient(circle at center, transparent 0%, black 100%)',
				},
				'.mask-radial-to-black': {
					'mask-image': 'radial-gradient(circle at center, black 0%, transparent 100%)',
				},
				'.mask-radial-at-center': {
					'mask-image': 'radial-gradient(circle at center, transparent 0%, black 100%)',
				},
				'.mask-b-from-50%': {
					'mask-image': 'linear-gradient(to bottom, transparent 0%, black 50%)',
				},
				'.mask-t-from-50%': {
					'mask-image': 'linear-gradient(to top, transparent 0%, black 50%)',
				},
				'.mask-l-from-50%': {
					'mask-image': 'linear-gradient(to left, transparent 0%, black 50%)',
				},
				'.mask-r-from-50%': {
					'mask-image': 'linear-gradient(to right, transparent 0%, black 50%)',
				},
				'.mask-radial-[50%_90%]': {
					'mask-image': 'radial-gradient(circle at 50% 90%, transparent 0%, black 100%)',
				},
				'.mask-radial-from-80%': {
					'mask-image': 'radial-gradient(circle at center, transparent 0%, black 80%)',
				},
				'.mask-radial-to-85%': {
					'mask-image': 'radial-gradient(circle at center, black 0%, transparent 85%)',
				},
			};
			addUtilities(newUtilities);
		},
	],
} satisfies Config;
