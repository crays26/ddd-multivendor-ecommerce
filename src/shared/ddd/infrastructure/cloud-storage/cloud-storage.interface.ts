export interface PresignedUrlResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export interface UploadResult {
  publicUrl: string;
  key: string;
}

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'application/pdf',
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export interface ICloudStorage {
  generatePresignedUploadUrl(
    contentType: string,
    originalName: string,
    prefix?: string,
  ): Promise<PresignedUrlResult>;

  upload(
    fileBuffer: Buffer,
    contentType: string,
    originalName: string,
    prefix?: string,
  ): Promise<UploadResult>;

  deleteFile(key: string): Promise<void>;
}

export const CLOUD_STORAGE = Symbol('CLOUD_STORAGE');
