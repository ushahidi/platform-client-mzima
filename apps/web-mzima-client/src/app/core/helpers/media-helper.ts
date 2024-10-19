import { MediaFile } from '../interfaces/media';

export function getDocumentThumbnail(mediaFile: MediaFile) {
  const path = '/assets/images/logos/';
  let thumbnail = 'unknown_document.png';
  switch (mediaFile.file?.type) {
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
