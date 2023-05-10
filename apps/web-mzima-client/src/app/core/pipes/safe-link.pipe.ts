import { Pipe, PipeTransform } from '@angular/core';

import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl',
})
export class SafePipe implements PipeTransform {
  constructor(private domSanitizer: DomSanitizer) {}

  transform(url: string) {
    let correctedUrl = url;

    if (url.includes('“') || url.includes('”')) {
      correctedUrl = url.replace(/“|”/g, '"');
    }

    return this.domSanitizer.bypassSecurityTrustHtml(correctedUrl);
  }
}
