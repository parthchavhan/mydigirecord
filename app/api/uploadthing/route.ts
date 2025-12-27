import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

// Force dynamic rendering to prevent build-time issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});





