import { ApiResponse } from './api-response.interface';

export interface MediaResponse extends ApiResponse {
  result: MediaResult;
}

export interface MediaResult {
  id: 1012;
  user_id: number | null;
  caption?: string;
  mime?: string;
  original_file_url: string;
  original_file_size: number;
  original_width: number;
  original_height: number;
  created: Date;
  updated?: Date | null;
  allowed_privileges: string[];
}

export enum MediaFileError {
  NONE = 'none',
  UNKNOWN = 'unknown',
  TOO_BIG = 'post.media.messages.max_size',
  INVALID_TYPE = 'post.media.messages.invalid_type',
}

export enum MediaFileStatus {
  NONE = 'none',
  READY = 'ready',
  UPLOAD = 'upload',
  UPLOADING = 'uploading',
  UPLOADED = 'uploaded',
  ERROR = 'error',
  DELETE = 'delete',
}

export class MediaFile {
  id: number;
  generatedId: number;
  file?: File;
  filename: string;
  fileSize: string;
  icon?: string;
  url?: string;
  caption: string;
  size: number;
  mimeType: string;
  value: number;
  status: MediaFileStatus;
  error: MediaFileError = MediaFileError.NONE;

  constructor(file: File | MediaResult, url: string) {
    this.id = 0;
    this.value = 0;
    this.caption = '';
    this.status = MediaFileStatus.NONE;
    this.error = MediaFileError.NONE;
    this.url = url;
    this.generatedId = this.generateId();
    if (file instanceof File) {
      this.size = file.size;
      this.file = file;
      this.filename = file.name;
      this.mimeType = file.type;
    } else {
      this.size = file.original_file_size;
      this.filename = MediaFile.getFileNameFromUrl(file.original_file_url);
      this.mimeType = file.mime ? file.mime : '';
    }
    this.fileSize = this.getFileSize();
    this.icon = this.getIcon();
  }

  private generateId(): number {
    return (
      Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER - Number.MIN_SAFE_INTEGER + 1)) +
      Number.MIN_SAFE_INTEGER
    );
  }

  public getFileSize(): string {
    const filesize = this.file ? this.file.size : this.size;

    // Megabytes
    if (filesize > 1000000) {
      return (filesize / 1000000).toFixed(2).toString() + 'MB';
    }
    // Kilobytes
    else if (filesize > 1000) {
      return (filesize / 1000).toFixed(2).toString() + 'kB';
    }
    // Bytes
    else {
      return filesize + 'bytes';
    }
  }

  private getIcon(): string {
    const path = '/assets/images/logos/';
    let thumbnail = 'unknown_document.png';
    switch (this.mimeType) {
      case 'application/pdf':
        thumbnail = 'pdf_document.png';
        break;
      case 'application/msword':
        thumbnail = 'word_document.png';
        break;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        thumbnail = 'word_document.png';
        break;
    }
    return path + thumbnail;
  }

  // Our media api returns a relative url with a filename that has an id prepended, instead of the original filename.
  // This function attempts to take that url, and return the original filename.
  static getFileNameFromUrl(url: string): string {
    // Try to use a regex to strip out what we add to the filename and the path
    const regex = /.*\/[0-9a-fA-F]{13}-(.*)/;
    const match = url.match(regex);
    if (match && match[1]) return match[1];

    // The url doesnt have the expected filename, so return everything after the final slash
    const lastSlashIndex = url.lastIndexOf('/');
    const newFilename = lastSlashIndex !== -1 ? url.substring(lastSlashIndex + 1) : url;
    const firstHyphenIndex = newFilename.indexOf('-') + 1;
    return newFilename.substring(firstHyphenIndex);
  }
}
