import { MediaFile } from '@mzima-client/sdk';

export function getDocumentThumbnail(mediaFile: MediaFile): string {
  const path = '/assets/images/logos/';
  let thumbnail = 'unknown_document.png';
  switch (mediaFile.mimeType) {
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
