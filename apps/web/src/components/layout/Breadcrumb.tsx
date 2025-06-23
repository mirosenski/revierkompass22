import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbProps {
	items?: { label: string; href?: string }[];
	current?: string;
}

export function AppBreadcrumb({ items = [], current }: BreadcrumbProps) {
	return (
		<div className="fixed top-16 left-0 right-0 z-40 border-b border-gray-200/20 bg-white/50 backdrop-blur-md dark:border-gray-800/20 dark:bg-gray-900/50">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<Breadcrumb className="py-3">
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink href="/" className="flex items-center gap-1.5 text-sm">
								<Home className="h-3.5 w-3.5" />
								<span className="hidden sm:inline">Start</span>
							</BreadcrumbLink>
						</BreadcrumbItem>

						{items.map((item) => (
							<div key={item.label} className="flex items-center gap-1.5">
								<BreadcrumbSeparator>
									<ChevronRight className="h-3.5 w-3.5" />
								</BreadcrumbSeparator>
								<BreadcrumbItem>
									{item.href ? (
										<BreadcrumbLink href={item.href} className="text-sm">
											{item.label}
										</BreadcrumbLink>
									) : (
										<span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
									)}
								</BreadcrumbItem>
							</div>
						))}

						{current && (
							<>
								<BreadcrumbSeparator>
									<ChevronRight className="h-3.5 w-3.5" />
								</BreadcrumbSeparator>
								<BreadcrumbItem>
									<BreadcrumbPage className="text-sm font-medium">{current}</BreadcrumbPage>
								</BreadcrumbItem>
							</>
						)}
					</BreadcrumbList>
				</Breadcrumb>
			</div>
		</div>
	);
}
