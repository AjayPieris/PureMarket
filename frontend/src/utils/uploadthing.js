// src/utils/uploadthing.js
// Connects the frontend to the UploadThing backend route handler
import { generateReactHelpers } from "@uploadthing/react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export const { useUploadThing, uploadFiles } = generateReactHelpers({
  url: `${API_BASE}/api/uploadthing`,
});
