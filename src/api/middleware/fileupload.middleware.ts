/**
 * File Upload Middleware
 * Configures multer for handling file uploads
 */

import multer from "multer";
import { Request } from "express";

/**
 * Configure multer to store files in memory as Buffer objects
 * This is suitable for our use case since we only need to hash the files
 * and don't need to persist them to disk
 */
const storage = multer.memoryStorage();

/**
 * File filter to validate uploaded files
 * Currently allows all file types, but can be restricted if needed
 *
 * @param req - Express request object
 * @param file - Multer file object
 * @param cb - Callback function
 */
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept all file types
  // You can add restrictions here if needed, for example:
  // if (!file.mimetype.startsWith('application/pdf')) {
  //   return cb(new Error('Only PDF files are allowed'));
  // }
  cb(null, true);
};

/**
 * Configure multer with storage and file filter options
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
});

/**
 * Middleware to handle single file upload with field name "document"
 */
export const uploadDocument = upload.single("document");

/**
 * Export the upload instance for potential custom configurations
 */
export default upload;
