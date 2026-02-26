// uploadthing.js  – UploadThing file router for the PureMarket backend
import { createUploadthing } from "uploadthing/express";
import { createRouteHandler } from "uploadthing/express";

const f = createUploadthing();

// Define the allowed file routes
export const ourFileRouter = {
  // Profile image – max 4 MB, single image
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // No auth required at signup time – just allow the upload
      return {};
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("✅ UploadThing upload complete:", file.url);
      return { url: file.url };
    }),
};

// Express handler – mount this router in server.js
export const uploadthingHandler = createRouteHandler({
  router: ourFileRouter,
});
