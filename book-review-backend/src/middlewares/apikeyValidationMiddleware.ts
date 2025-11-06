import { NextFunction } from "express";
import CryptoJS from "crypto-js";

// Middleware to verify the API key
export const checkApiKey = (
  req: any,
  res: any,
  next: NextFunction
) => {
  const encryptedAPIKey: string = req.headers["x-api-key"] as string || '';
  const validApiKey = process.env.API_KEY  || '';
  const encryptionKey = process.env.ENCRYPTION_KEY || '';

  if (!encryptedAPIKey) {
    return res.status(403).json({ message: "API key missing" });
  }

  // For development: also allow plain API key
  if (encryptedAPIKey === validApiKey) {
    next();
    return;
  }

  try {
    const decryptedApiKey = CryptoJS.AES.decrypt(encryptedAPIKey, encryptionKey).toString(CryptoJS.enc.Utf8);
    
    if (decryptedApiKey === validApiKey) {
      next();
    } else {
      return res.status(401).json({ message: "Invalid API key" });
    }
  } catch (error) {
    return res.status(401).json({ message: "Invalid API key format" });
  }
};
