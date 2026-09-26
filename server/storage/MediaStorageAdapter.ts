export interface UploadResult {
  filename: string;
  originalFilename?: string;
  url: string;
  size: number;
  mimeType: string;
  storagePath: string;
}

export interface MediaStorageAdapter {
  getStorageDirectory(): string;
  getStoragePath(): string;
  saveFile(buffer: Buffer, originalName: string, mimeType: string): Promise<UploadResult>;
  deleteFile(filename: string): Promise<boolean>;
  exists(filename: string): boolean;
  getUrl(filename: string): string;
}
