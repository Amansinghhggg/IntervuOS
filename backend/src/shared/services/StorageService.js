import { v2 as cloudinary } from "cloudinary";
import https from "https";

class StorageService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
  /**
   * Validates if a file buffer is a valid PDF
   * @param {Buffer} buffer - The file buffer
   * @returns {boolean} True if valid PDF, false otherwise
   */
  validateResume(buffer) {
    if (!buffer || buffer.length < 5) return false;
    // Magic Bytes for PDF: %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
    return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46 && buffer[4] === 0x2D;
  }

  /**
   * Uploads a resume to Cloudinary
   * @param {Buffer} fileBuffer - The file buffer
   * @param {Object} options - Upload options (folder, public_id, etc.)
   * @returns {Promise<Object>} Cloudinary upload result
   */
  uploadResume(fileBuffer, options = {}) {
    const folder = options.folder || "ForkTalent/resumes";
    const timeout = parseInt(process.env.CLOUDINARY_UPLOAD_TIMEOUT, 10) || options.timeout || 60000;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "raw", // Needed for non-image/video files like PDF
          public_id: options.publicId, // If omitted, Cloudinary generates one
          timeout,
        },
        (error, result) => {
          if (error) {
            console.error("[StorageService] Resume upload failed:", error);
            return reject(error);
          }
          resolve(result);
        }
      );

      uploadStream.end(fileBuffer);
    });
  }

  /**
   * Deletes a resume from Cloudinary
   * @param {string} publicId - The Cloudinary public ID
   * @returns {Promise<Object>} Cloudinary deletion result
   */
  deleteResume(publicId) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, { resource_type: "raw" }, (error, result) => {
        if (error) {
          console.error(`[StorageService] Failed to delete resume ${publicId}:`, error);
          return reject(error);
        }
        resolve(result);
      });
    });
  }

  /**
   * Generates a download stream from a Cloudinary secure_url and pipes it to the response
   * @param {string} secureUrl - The Cloudinary secure_url
   * @param {Object} res - Express response object
   */
  generateDownloadStream(secureUrl, res) {
    return new Promise((resolve, reject) => {
      https.get(secureUrl, (response) => {
        if (response.statusCode !== 200) {
          return reject(new Error(`Failed to fetch file from storage. Status Code: ${response.statusCode}`));
        }
        response.pipe(res);
        response.on('end', resolve);
        response.on('error', reject);
      }).on('error', reject);
    });
  }
}

export default new StorageService();
