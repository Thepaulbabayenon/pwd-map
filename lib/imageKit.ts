// lib/imagekit.js
import ImageKit from "imagekit";

// Initialize ImageKit with your configuration
export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ?? (() => { throw new Error("NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY is not defined"); })(),
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY ?? (() => { throw new Error("IMAGEKIT_PRIVATE_KEY is not defined"); })(),
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? (() => { throw new Error("NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT is not defined"); })(),
});

// Generate auth parameters for client-side uploads
export async function getImageKitAuthParams() {
  const token = imagekit.getAuthenticationParameters();
  return token;
}