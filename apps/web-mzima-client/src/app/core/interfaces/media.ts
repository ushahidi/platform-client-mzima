import { SafeUrl } from '@angular/platform-browser';

enum ErrorEnum {
  NONE = 'none',
  MAX_SIZE = 'post.media.messages.max_size',
  REQUIRED = 'post.media.messages.required',
  MAX_FILES = 'post.media.messages.max_files',
}

type MediaType = {
  icon: string;
  buttonText: string;
  fileTypes: string;
};

type MediaFileStatus = 'ready' | 'upload' | 'uploading' | 'uploaded' | 'error' | 'delete';

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

type MediaFile = {
  id?: number;
  generatedId: number;
  file?: File;
  fileExtension?: string;
  url: string | SafeUrl | null;
  caption?: string;
  status: MediaFileStatus;
  size?: number;
  mimeType?: string;
  value?: number;
};

export { MediaFile, MediaFileStatus, MediaType, ErrorEnum, mediaTypes };
