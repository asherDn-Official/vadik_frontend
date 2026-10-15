/**
 * Utilities for validating media types and file formats in Customer Rhythm flow builder
 * Ensures strict enforcement that template nodes requiring VIDEO only allow video,
 * and template nodes requiring IMAGE only allow images.
 */

export const normalizeMediaType = (rawType) => {
  const norm = String(rawType || "").trim().toUpperCase();
  if (norm === "VIDEO") return "VIDEO";
  if (norm === "IMAGE") return "IMAGE";
  if (norm === "DOCUMENT" || norm === "FILE" || norm === "DOC") return "DOCUMENT";
  if (norm === "TEXT") return "TEXT";
  return "NONE";
};

export const getMediaPickerTabType = (rawType) => {
  const norm = normalizeMediaType(rawType);
  if (norm === "VIDEO") return "video";
  if (norm === "DOCUMENT") return "file";
  return "image";
};

export const getMediaAcceptString = (rawType) => {
  const norm = normalizeMediaType(rawType);
  if (norm === "VIDEO") return "video/*,.mp4,.3gp,.mov,.webm";
  if (norm === "DOCUMENT") return ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx";
  if (norm === "IMAGE") return "image/*,.jpg,.jpeg,.png,.webp";
  return "*/*";
};

export const isUrlCompatibleWithMediaType = (url, expectedFormat) => {
  if (!url || typeof url !== "string") return true;
  const norm = normalizeMediaType(expectedFormat);
  if (norm === "NONE" || norm === "TEXT") return true;

  const cleanUrl = url.split("?")[0].toLowerCase();
  const isVideoExt = /\.(mp4|3gp|mov|webm|m4v|mkv)$/i.test(cleanUrl);
  const isImageExt = /\.(jpg|jpeg|png|webp|gif|bmp|svg|tiff)$/i.test(cleanUrl);
  const isDocExt = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv)$/i.test(cleanUrl);

  if (norm === "VIDEO") {
    // If it clearly has an image or document extension, it is incompatible
    if (isImageExt || isDocExt) return false;
    return true;
  }
  if (norm === "IMAGE") {
    // If it clearly has a video or document extension, it is incompatible
    if (isVideoExt || isDocExt) return false;
    return true;
  }
  if (norm === "DOCUMENT") {
    // If it clearly has an image or video extension, it is incompatible
    if (isVideoExt || isImageExt) return false;
    return true;
  }
  return true;
};

export const isFileCompatibleWithMediaType = (file, expectedFormat) => {
  if (!file) return false;
  const norm = normalizeMediaType(expectedFormat);
  if (norm === "NONE" || norm === "TEXT") return true;

  const mime = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();

  if (norm === "VIDEO") {
    if (mime.startsWith("video/")) return true;
    return /\.(mp4|3gp|mov|webm|m4v)$/i.test(name);
  }
  if (norm === "IMAGE") {
    if (mime.startsWith("image/")) return true;
    return /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(name);
  }
  if (norm === "DOCUMENT") {
    if (mime.startsWith("application/") || mime.startsWith("text/")) return true;
    return /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv)$/i.test(name);
  }
  return false;
};
