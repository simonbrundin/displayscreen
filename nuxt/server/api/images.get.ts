import { google } from "googleapis";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";

interface DriveFile {
	id: string;
	name: string;
	mimeType: string;
	modifiedTime?: string;
}

interface CachedImage {
	id: string;
	name: string;
	mimeType: string;
	url: string;
}

// In-memory cache for file list
let cachedFiles: DriveFile[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute

// Cache directory
const CACHE_DIR = resolve(process.cwd(), ".image-cache");

function ensureCacheDir() {
	if (!existsSync(CACHE_DIR)) {
		mkdirSync(CACHE_DIR, { recursive: true });
	}
}

function loadServiceAccountKey(): Record<string, unknown> | null {
	const serviceAccountPath = resolve(process.cwd(), "service-account.json");
	if (existsSync(serviceAccountPath)) {
		try {
			const content = readFileSync(serviceAccountPath, "utf-8");
			return JSON.parse(content);
		} catch {
			console.error("Failed to parse service-account.json");
		}
	}
	return null;
}

async function downloadImage(
	drive: ReturnType<typeof google.drive>,
	file: DriveFile,
): Promise<CachedImage | null> {
	const cachePath = join(CACHE_DIR, `${file.id}.cache`);
	const metaPath = join(CACHE_DIR, `${file.id}.meta`);

	// Check if already cached (cache for 1 hour)
	if (existsSync(cachePath) && existsSync(metaPath)) {
		try {
			const meta = JSON.parse(readFileSync(metaPath, "utf-8")) as {
				cachedAt: string;
			};
			const cachedTime = new Date(meta.cachedAt).getTime();
			if (Date.now() - cachedTime < 3600000) {
				return {
					id: file.id,
					name: file.name,
					mimeType: file.mimeType,
					url: `/api/image/${file.id}`,
				};
			}
		} catch {
			// Invalid meta, re-download
		}
	}

	try {
		const response = await drive.files.get(
			{ fileId: file.id, alt: "media" },
			{ responseType: "arraybuffer" },
		);

		writeFileSync(cachePath, Buffer.from(response.data as ArrayBuffer));
		writeFileSync(
			metaPath,
			JSON.stringify({
				cachedAt: new Date().toISOString(),
				mimeType: file.mimeType,
			}),
		);

		return {
			id: file.id,
			name: file.name,
			mimeType: file.mimeType,
			url: `/api/image/${file.id}`,
		};
	} catch (error) {
		console.error(`Failed to download ${file.id}:`, error);
		return null;
	}
}

export default defineEventHandler(async () => {
	const config = useRuntimeConfig();
	ensureCacheDir();

	// Check cache
	if (cachedFiles && Date.now() - cacheTimestamp < CACHE_TTL) {
		const images: CachedImage[] = [];
		for (const file of cachedFiles) {
			const cachePath = join(CACHE_DIR, `${file.id}.cache`);
			if (existsSync(cachePath)) {
				images.push({
					id: file.id,
					name: file.name,
					mimeType: file.mimeType,
					url: `/api/image/${file.id}`,
				});
			}
		}
		return {
			images,
			count: images.length,
			timestamp: new Date().toISOString(),
		};
	}

	// Fetch from Google Drive
	if (!config.googleDriveFolderId) {
		return { images: [], count: 0, timestamp: new Date().toISOString() };
	}

	// Use runtimeConfig for credentials (works for both dev and prod)
	let credentials: Record<string, unknown> | null = null;
	if (config.googleServiceAccountKey) {
		try {
			credentials = JSON.parse(config.googleServiceAccountKey);
		} catch {
			console.error("Failed to parse googleServiceAccountKey");
		}
	} else {
		credentials = loadServiceAccountKey();
	}

	if (!credentials) {
		return { images: [], count: 0, timestamp: new Date().toISOString() };
	}

	const auth = new google.auth.GoogleAuth({
		credentials,
		scopes: ["https://www.googleapis.com/auth/drive.readonly"],
	});
	const drive = google.drive({ version: "v3", auth });

	try {
		const response = await drive.files.list({
			q: `'${config.googleDriveFolderId}' in parents and mimeType contains 'image/'`,
			fields: "files(id, name, mimeType, modifiedTime)",
			orderBy: "name",
		});

		cachedFiles = (response.data.files || []) as DriveFile[];
		cacheTimestamp = Date.now();

		// Download all images
		const images: CachedImage[] = [];
		for (const file of cachedFiles) {
			const cached = await downloadImage(drive, file);
			if (cached) images.push(cached);
		}

		return {
			images,
			count: images.length,
			timestamp: new Date().toISOString(),
		};
	} catch (error) {
		console.error("Error fetching from Google Drive:", error);
		return { images: [], count: 0, timestamp: new Date().toISOString() };
	}
});
