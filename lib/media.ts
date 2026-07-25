export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
export const ACCEPTED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/m4a",
  "audio/x-m4a",
  "audio/mp4",
  "audio/ogg",
  "audio/aac",
  "audio/flac",
  "audio/webm"
];
export const ACCEPTED_AUDIO_EXTENSIONS = [".mp3", ".wav", ".m4a", ".ogg", ".aac", ".flac"];

export const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES, ...ACCEPTED_AUDIO_TYPES];

export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 15 * 1024 * 1024;
export const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

export function isVideo(type: string) {
  return ACCEPTED_VIDEO_TYPES.includes(type);
}

export function isAudio(type: string, filename?: string) {
  if (ACCEPTED_AUDIO_TYPES.includes(type)) return true;
  if (type.startsWith("audio/")) return true;
  if (filename) {
    const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
    if (ACCEPTED_AUDIO_EXTENSIONS.includes(ext)) return true;
  }
  return false;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Returns an error message the UI can show directly, or null when the file is usable. */
export function validateMediaFile(file: File): string | null {
  const fileIsAudio = isAudio(file.type, file.name);
  const fileIsVideo = isVideo(file.type);
  const fileIsImage = ACCEPTED_IMAGE_TYPES.includes(file.type);

  if (!fileIsAudio && !fileIsVideo && !fileIsImage) {
    return `${file.type || file.name.substring(file.name.lastIndexOf("."))} isn't supported. Upload an Image (JPG, PNG, WEBP), Video (MP4, MOV), or Audio (MP3, WAV, M4A, OGG, AAC, FLAC).`;
  }

  const limit = fileIsVideo ? MAX_VIDEO_BYTES : fileIsAudio ? MAX_AUDIO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > limit) {
    return `That file is ${formatBytes(file.size)}. The limit is ${formatBytes(limit)} — try a smaller file.`;
  }

  if (file.size === 0) {
    return "That file is empty or corrupted. Please choose a valid file.";
  }

  return null;
}

export function validateAudioFile(file: File): string | null {
  if (!isAudio(file.type, file.name)) {
    return "Unsupported audio format. Please upload an MP3, WAV, M4A, OGG, AAC, or FLAC file.";
  }

  if (file.size > MAX_AUDIO_BYTES) {
    return `Audio file size is ${formatBytes(file.size)}, exceeding the ${formatBytes(MAX_AUDIO_BYTES)} limit.`;
  }

  if (file.size === 0) {
    return "The audio file is empty or corrupted. Please upload a valid audio file.";
  }

  return null;
}

export function validateUrl(urlInput: string): { isValid: boolean; error: string | null; formattedUrl?: string } {
  const trimmed = urlInput ? urlInput.trim() : "";
  if (!trimmed) {
    return { isValid: false, error: "URL cannot be empty. Please enter a webpage URL." };
  }

  let parsedUrl: URL;
  try {
    let toParse = trimmed;
    if (!/^https?:\/\//i.test(toParse)) {
      if (/^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+/i.test(toParse)) {
        toParse = `https://${toParse}`;
      } else {
        return { isValid: false, error: "Invalid URL format. Include http:// or https:// (e.g., https://news.example.com/article)." };
      }
    }
    parsedUrl = new URL(toParse);
  } catch {
    return { isValid: false, error: "Invalid URL syntax. Please enter a valid webpage URL." };
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return { isValid: false, error: `Unsupported URL scheme '${parsedUrl.protocol}'. Only http:// and https:// URLs are supported.` };
  }

  if (!parsedUrl.hostname || !parsedUrl.hostname.includes(".")) {
    return { isValid: false, error: "Invalid domain name in URL." };
  }

  return { isValid: true, error: null, formattedUrl: parsedUrl.toString() };
}

