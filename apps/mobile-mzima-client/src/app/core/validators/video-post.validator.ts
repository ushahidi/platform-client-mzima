import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class FormValidator {
  // - Supported YouTube URL formats:
  //   - http://www.youtube.com/watch?v=My2FRPA3Gf8
  //   - http://youtu.be/My2FRPA3Gf8
  //   - https://youtube.googleapis.com/v/My2FRPA3Gf8
  // - Supported Vimeo URL formats:
  //   - http://vimeo.com/25451551
  //   - http://player.vimeo.com/video/25451551
  // - Also supports relative URLs:
  //   - //player.vimeo.com/video/25451551

  public videoEmbedUrl?: any;

  public videoValidator = (control: FormControl) => {
    /** Custom validator for video url */
    if (control.value) {
      const urlMatch: RegExpMatchArray | null = this.matchVideoUrl().urlMatch(control.value);
      if (!urlMatch) {
        return { invalidvideourl: true };
      }
    }
    return null;
  };

  public matchVideoUrl() {
    return {
      urlMatch: (value: string) => {
        return value
          .toString()
          .match(
            /(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/,
          );
      },
      vimeoUrlMatch: (value: string) => {
        return value.match(
          /(http:|https:|)\/\/(player.)?(vimeo\.com)\/?(video\/)?([A-Za-z0-9._%-]*)(\&\S+)?/,
        );
      },
    };
  }

  public videoUrlPreview(videoInput: { value: string }) {
    const { value } = videoInput;
    const urlMatch = this.matchVideoUrl().urlMatch(value);
    const vimeoUrlMatch = this.matchVideoUrl().vimeoUrlMatch(value);
    const urlLeft =
      urlMatch && !vimeoUrlMatch
        ? 'https://www.youtube.com/embed/'
        : 'https://player.vimeo.com/video/';

    let slashCharCount = 0;
    let symbol = '';
    if (urlMatch && !vimeoUrlMatch) {
      slashCharCount = (value.match(/\//g) || []).length;
      symbol = '/';
      if (value.includes('watch?v=') && (value.match(/=/g) || []).length === 1) {
        slashCharCount = (value.match(/=/g) || []).length;
        symbol = '=';
      }
    }
    if (urlMatch && vimeoUrlMatch) {
      slashCharCount = (value.match(/\//g) || []).length;
      symbol = '/';
    }
    this.videoEmbedUrl = `${urlLeft}${value.split(symbol)[slashCharCount]}`;

    return this.videoEmbedUrl;
  }
}

export const preparingVideoUrl = (rawUrl: string): string => {
  let videoId = null;

  if (rawUrl.includes('youtube.com/watch?v=')) {
    videoId = rawUrl.split('v=')[1];
    const ampersandPosition = videoId.indexOf('&');
    if (ampersandPosition != -1) {
      videoId = videoId.substring(0, ampersandPosition);
    }
  } else if (rawUrl.includes('youtu.be/')) {
    videoId = rawUrl.split('/')[3];
  } else if (rawUrl.includes('vimeo.com/') && !rawUrl.includes('/video/')) {
    videoId = rawUrl.split('/')[3];
    return `https://player.vimeo.com/video/${videoId}`;
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}` : rawUrl;
};
