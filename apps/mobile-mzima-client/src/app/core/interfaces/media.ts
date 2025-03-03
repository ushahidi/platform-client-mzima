enum MediaUploaderError {
  NONE = 'none',
  MAX_SIZE = 'post.media.messages.max_size',
  REQUIRED = 'post.media.messages.required',
  INVALID_TYPE = 'post.media.messages.invalid_type',
  MAX_FILES = 'post.media.messages.max_files',
}

type MediaType = {
  name: string;
  buttonText: string;
  fileTypes: string;
};

const mediaTypes = new Map<string, MediaType>([
  [
    'image',
    {
      name: 'add_a_photo',
      buttonText: 'post.media.add_image',
      fileTypes: 'image/jpeg, image/png',
    },
  ],
  [
    'audio',
    {
      name: 'speaker',
      buttonText: 'post.media.add_audio',
      fileTypes: 'audio/mp3, audio/mpeg, audio/ogg, audio/aac',
    },
  ],
  [
    'document',
    {
      name: 'note_add',
      buttonText: 'post.media.add_document',
      fileTypes:
        'application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
  ],
]);

export { MediaType, MediaUploaderError, mediaTypes };
