import { SafeUrl } from '@angular/platform-browser';

enum MediaUploaderError {
  NONE = 'none',
  MAX_SIZE = 'post.media.messages.max_size',
  REQUIRED = 'post.media.messages.required',
  INVALID_TYPE = 'post.media.messages.invalid_type',
  MAX_FILES = 'post.media.messages.max_files',
}

enum MediaFileError {
  NONE = 'none',
  UNKNOWN = 'unknown',
  TOO_BIG = 'post.media.messages.max_size',
  INVALID_TYPE = 'post.media.messages.invalid_type',
}

enum MediaFileStatus {
  NONE = 'none',
  READY = 'ready',
  UPLOAD = 'upload',
  UPLOADING = 'uploading',
  UPLOADED = 'uploaded',
  ERROR = 'error',
  DELETE = 'delete',
}

type MediaType = {
  icon: string;
  buttonText: string;
  fileTypes: string;
};

const mediaTypes = new Map<string, MediaType>([
  [
    'image',
    {
      icon: 'add_a_photo',
      buttonText: 'post.media.add_photo',
      fileTypes: 'image/jpeg, image/png',
    },
  ],
  [
    'audio',
    {
      icon: 'speaker',
      buttonText: 'post.media.add_audio',
      fileTypes: 'audio/mp3, audio/ogg, audio/aac',
    },
  ],
  [
    'document',
    {
      icon: 'note_add',
      buttonText: 'post.media.add_document',
      fileTypes:
        'application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
  ],
]);

class MediaFile {
  id: number;
  generatedId: number;
  file: File;
  filename: string;
  url: string | SafeUrl | null;
  caption: string;
  status: MediaFileStatus;
  size: number;
  mimeType: string;
  value: number;
  error: MediaFileError = MediaFileError.NONE;

  constructor(file: File, url: string | SafeUrl) {
    this.id = 0;
    this.value = 0;
    this.filename = file.name;
    this.caption = '';
    this.size = file.size;
    this.file = file;
    this.status = MediaFileStatus.NONE;
    this.error = MediaFileError.NONE;
    this.mimeType = file.type;
    this.url = url;
    this.generatedId = this.generateId();
  }

  private generateId(): number {
    return (
      Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER - Number.MIN_SAFE_INTEGER + 1)) +
      Number.MIN_SAFE_INTEGER
    );
  }

  getFileSize(): string {
    let filesize = 0;
    if (this.status === MediaFileStatus.READY) filesize = this.size;
    else filesize = this.file ? this.file.size : 0;

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
}

export { MediaFile, MediaFileStatus, MediaType, MediaUploaderError, MediaFileError, mediaTypes };
