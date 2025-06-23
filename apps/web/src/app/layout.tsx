import { Outlet, useMatches } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AppBreadcrumb } from "@/components/layout/Breadcrumb";

export default function Shell() {
	const matches = useMatches();

	// @ts-ignore
	const crumbs = matches
		// @ts-ignore
		.filter((match) => match.context?.getTitle)
		.map((match) => ({
			// @ts-ignore
			label: match.context.getTitle(),
			href: match.pathname,
		}));

	// Das erste "Start"-Element entfernen, da es durch das Home-Icon ersetzt wird
	const breadcrumbItems = crumbs.length > 1 ? crumbs.slice(1) : [];
	const currentPage = crumbs.length > 0 ? crumbs[crumbs.length - 1].label : "";

	return (
		<div className="flex min-h-dvh flex-col bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-50">
			<Header />
			<AppBreadcrumb
				items={breadcrumbItems.slice(0, -1)}
				current={currentPage !== "Start" ? currentPage : undefined}
			/>
			<main className="flex-1 pt-28 pb-8">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<Outlet />
				</div>
			</main>
			<Footer />
		</div>
	);
}
