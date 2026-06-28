export const runtimeConfig = {
  // Google Drive configuration
  googleDriveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID || "",
  googleServiceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "",

  // Slideshow settings
  slideInterval: parseInt(process.env.SLIDE_INTERVAL || "30000", 10), // 30 seconds default

  // Public config (exposed to client)
  public: {
    slideInterval: parseInt(process.env.SLIDE_INTERVAL || "30000", 10),
  },
};
