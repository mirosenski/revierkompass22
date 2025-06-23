export function Footer() {
	return (
		<footer className="mt-16 bg-gray-100 dark:bg-gray-800 py-6 text-center text-xs text-gray-600 dark:text-gray-300">
			<p>
				© {new Date().getFullYear()} RevierKompass – built with&nbsp;
				<a
					href="https://react.dev"
					className="underline hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
				>
					React
				</a>
			</p>
		</footer>
	);
}
