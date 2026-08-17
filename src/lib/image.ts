const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
const MAX_DIMENSION = 2000;
const JPEG_QUALITY = 0.85;

export class PhotoError extends Error {}

/**
 * Decode a user-picked photo and re-encode it as a reasonably sized JPEG.
 * Throws PhotoError with a user-facing message when the file can't be used
 * (wrong type, too large, or a format the browser can't decode, e.g. HEIC).
 */
export async function preparePhoto(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new PhotoError("That file isn't an image. Use a JPG, PNG, or WebP.");
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new PhotoError("Photo is too large — keep it under 25 MB.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new PhotoError(
      "Couldn't read that photo format. Export it as JPG or PNG and try again.",
    );
  }

  try {
    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
    );
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new PhotoError("Couldn't process that photo.");
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) =>
          result ? resolve(result) : reject(new PhotoError("Couldn't process that photo.")),
        "image/jpeg",
        JPEG_QUALITY,
      );
    });

    return new File([blob], "photo.jpg", { type: "image/jpeg" });
  } finally {
    bitmap.close();
  }
}
