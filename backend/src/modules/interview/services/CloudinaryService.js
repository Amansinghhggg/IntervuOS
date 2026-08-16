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
   * Extracts public ID from a full Cloudinary URL.
   *
   * @param {string} url - The Cloudinary asset URL
   * @returns {string|null} The extracted public ID
   */
  extractPublicIdFromUrl(url) {
    if (!url || typeof url !== "string") return null;
    try {
      // Formats: https://res.cloudinary.com/<cloud_name>/video/upload/v<version>/<folder>/<public_id>.<ext>
      const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
      return matches ? matches[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * Deletes a recording from Cloudinary using its public ID or full URL.
   * Handles folder prefixes, file extensions, and edge cache invalidation.
   *
   * @param {string} publicIdOrUrl - The Cloudinary public ID or URL
   * @returns {Promise<Object>} Cloudinary deletion result
   */
  deleteRecording(publicIdOrUrl) {
    if (!publicIdOrUrl) return Promise.resolve({ result: "not_found" });

    let publicId = publicIdOrUrl;
    if (publicId.startsWith("http://") || publicId.startsWith("https://")) {
      const extracted = this.extractPublicIdFromUrl(publicId);
      if (extracted) publicId = extracted;
    }

    return new Promise((resolve) => {
      cloudinary.uploader.destroy(
        publicId,
        { resource_type: "video", invalidate: true },
        (error, result) => {
          if (!error && result?.result === "ok") {
            return resolve(result);
          }

          // If publicId had an extension like .webm, try stripping it
          const stripped = publicId.replace(/\.[^/.]+$/, "");
          if (stripped !== publicId) {
            cloudinary.uploader.destroy(
              stripped,
              { resource_type: "video", invalidate: true },
              (err2, res2) => {
                if (err2) {
                  console.warn("[CloudinaryService] Deletion retry failed:", err2.message);
                }
                resolve(res2 || result || { result: "not_found" });
              }
            );
          } else {
            if (error) {
              console.warn("[CloudinaryService] Deletion warning:", error.message);
            }
            resolve(result || { result: "not_found" });
          }
        }
      );
    });
  }
}

export default new CloudinaryService();
