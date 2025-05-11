
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: File): Promise<string> {
  // Convert the file to base64
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;
  
  // Upload to Cloudinary
  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader.upload(
      base64String,
      { folder: 'disabilities-map' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!);
      }
    );
  });
  
  
  return result.secure_url;
}