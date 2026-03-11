function inferPathSeparator(pathLike: string): "/" | "\\" {
	return pathLike.includes("\\") ? "\\" : "/";
}

export function joinHomePath(homeDir: string, ...segments: string[]): string {
	const separator = inferPathSeparator(homeDir);
	const normalizedHome = homeDir.replace(/[\\/]+$/g, "");
	const normalizedSegments = segments.map((segment) =>
		segment.replace(/[\\/]+/g, separator),
	);
	return [normalizedHome, ...normalizedSegments].join(separator);
}
