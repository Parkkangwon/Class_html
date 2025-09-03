import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter, type OurFileRouter } from "./route";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    isDev: process.env.NODE_ENV === 'development',
  },
});

export type { OurFileRouter };

// Add environment variables to .env.local:
// UPLOADTHING_SECRET=your_uploadthing_secret
// UPLOADTHING_APP_ID=your_uploadthing_app_id
