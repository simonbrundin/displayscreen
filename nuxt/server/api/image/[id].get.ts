import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const CACHE_DIR = join(process.cwd(), ".image-cache");

export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, "id");

	if (!id) {
		throw createError({ statusCode: 400, message: "Image ID required" });
	}

	const cachePath = join(CACHE_DIR, `${id}.cache`);
	const metaPath = join(CACHE_DIR, `${id}.meta`);

	if (!existsSync(cachePath)) {
		throw createError({ statusCode: 404, message: "Image not found" });
	}

	try {
		const imageData = readFileSync(cachePath);

		// Get mime type from meta if available
		let mimeType = "image/jpeg";
		if (existsSync(metaPath)) {
			try {
				const meta = JSON.parse(readFileSync(metaPath, "utf-8"));
				mimeType = meta.mimeType || mimeType;
			} catch {
				// Use default
			}
		}

		// Set caching headers
		setHeader(event, "Cache-Control", "public, max-age=3600");
		setHeader(event, "Content-Type", mimeType);

		return imageData;
	} catch (error) {
		throw createError({ statusCode: 500, message: "Failed to read image" });
	}
});
