import crypto from "node:crypto";

import httpStatus from "http-status";

import ApiError from "@/utils/ApiError";

// import config from "./config";

// Generate secret hash with crypto to use for encryption
// const algorithm = config.encryption.encryptionMethod;
const algorithm ="";
// const initVector = config.encryption.vector;
const initVector = "";
// const Securitykey = config.encryption.secretKey;
const Securitykey = "";

if (algorithm === "" || initVector === "" || Securitykey === "") {
  throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, {
    msg: "encryption credential missing",
  });
}
// Encrypt data
export function encryptData(data: string): string {
  const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
  return cipher.update(data, "utf8", "hex") + cipher.final("hex"); // Encrypts data and converts to hex and base64
}

// Decrypt data
export function decryptData(encryptedData: string): string {
  const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);
  let decryptedData = decipher.update(encryptedData, "hex", "utf8");
  decryptedData += decipher.final("utf8");
  return decryptedData;
}
