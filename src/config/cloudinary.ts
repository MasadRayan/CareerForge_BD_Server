import { v2 as cloudinary } from "cloudinary";
import env from "./env";


cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const RESOURCE_TYPE = "raw" as const;
const FOLDER = "cvs" as const;

export const uploadCVBuffer = async (
  buffer: Buffer,
  publicId: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: RESOURCE_TYPE,
        folder: FOLDER,
        public_id: publicId,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error ?? new Error("Cloudinary upload failed"));
        }
        resolve(result.secure_url);
      },
    );
    uploadStream.end(buffer);
  });
};

export const deleteCVFile = async (publicId: string): Promise<void> => {
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: RESOURCE_TYPE,
  })

  if (result.result !== 'ok' && result.result !== 'not found') {
    console.error(`⚠️ Cloudinary: failed to delete "${publicId}":`, result)
    throw new Error(`Cloudinary deletion failed for "${publicId}"`)
  }
}


export const publicIdFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url)
    const parts = urlObj.pathname.split('/upload/')
    if (parts.length < 2) return null
    const withoutVersion = parts[1].replace(/^v\d+\//, '')
    const withoutExtension = withoutVersion.replace(/\.[^/.]+$/, '')
    return withoutExtension 
  } catch {
    return null
  }
}
export { cloudinary };
