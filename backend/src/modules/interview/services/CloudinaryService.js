import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryService {
  /**
   * Generalized method to upload an interview recording.
   * Internally uses upload_stream for now, but abstracts this
   * away from callers so it can be swapped to upload_large later.
   *
   * @param {Buffer} fileBuffer - The file buffer
   * @param {string} originalFilename - Original filename
   * @param {Object} options - Additional upload options
   * @returns {Promise<Object>} Cloudinary upload result
   */
  /**
   * Generalized method to upload an interview recording with automatic retries for transient network errors.
   *
   * @param {Buffer} fileBuffer - The file buffer
   * @param {string} originalFilename - Original filename
   * @param {Object} options - Additional upload options
   * @returns {Promise<Object>} Cloudinary upload result
   */
  async uploadRecording(fileBuffer, originalFilename, options = {}) {
    const folder = options.folder || "ForkTalent";
    const timeout = parseInt(process.env.CLOUDINARY_UPLOAD_TIMEOUT, 10) || options.timeout || 600000;
    const maxRetries = options.maxRetries || 3;

    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.#executeUploadStream(fileBuffer, originalFilename, folder, timeout);
        return result;
      } catch (error) {
        lastError = error;
        const isNetworkError =
          error.code === "ECONNRESET" ||
          error.code === "ETIMEDOUT" ||
          error.code === "ENOTFOUND" ||
          error.code === "ESOCKETTIMEDOUT" ||
          error.code === "EPIPE" ||
          error.errno === -4077 ||
          error.message?.includes("ECONNRESET");

        if (isNetworkError && attempt < maxRetries) {
          const delayMs = attempt * 1500;
          console.warn(`[CloudinaryService] Transient network error (${error.code || error.message}). Retrying upload (${attempt}/${maxRetries}) in ${delayMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else {
          break;
        }
      }
    }

    console.error("[CloudinaryService] Upload failed after retries:", lastError);
    throw lastError;
  }

  #executeUploadStream(fileBuffer, originalFilename, folder, timeout) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "video", // Required for webm/audio/video files
          public_id: `${Date.now()}-${originalFilename || "recording"}`,
          timeout,
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );

      uploadStream.on("error", (err) => reject(err));
      uploadStream.end(fileBuffer);
    });
  }

  /**
   * Deprecated: Use uploadRecording instead.
   */
  uploadStream(fileBuffer, originalFilename, folder = "ForkTalent") {
    return this.uploadRecording(fileBuffer, originalFilename, { folder });
  }

  /**
   * Deletes a recording from Cloudinary using its public ID.
   *
   * @param {string} publicId - The Cloudinary public ID of the video
   * @returns {Promise<Object>} Cloudinary deletion result
   */
  deleteRecording(publicId) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        { resource_type: "video" },
        (error, result) => {
          if (error) {
            console.error("[CloudinaryService] Deletion failed:", error);
            return reject(error);
          }
          resolve(result);
        }
      );
    });
  }
}

export default new CloudinaryService();
