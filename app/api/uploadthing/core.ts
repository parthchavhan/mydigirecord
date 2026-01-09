import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  fileUploader: f({
    // Accept all file types
    blob: {
      maxFileSize: "32MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      // You can add authentication here if needed
      // For now, we'll allow all uploads
      return { userId: "admin" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      try {
        console.log("Upload complete for userId:", metadata.userId);
        console.log("file url", file.ufsUrl);
        console.log("file key", file.key);

        // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
        return { 
          uploadedBy: metadata.userId, 
          url: file.ufsUrl, 
          key: file.key,
          name: file.name,
          size: file.size,
          type: file.type,
        };
      } catch (error) {
        console.error("Error in onUploadComplete:", error);
        // Still return file data even if there's an error
        return { 
          uploadedBy: metadata?.userId || "unknown", 
          url: file.ufsUrl, 
          key: file.key,
          name: file.name,
          size: file.size,
          type: file.type,
        };
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

