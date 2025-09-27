// src/services/storage.service.js
import ImageKit from "imagekit";

export async function uploadFile(file, fileName) {
  if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    throw new Error("Missing ImageKit environment variables");
  }

  const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
  });

  const result = await imagekit.upload({
    file,
    fileName,
  });

  return result;
}

export default uploadFile;
