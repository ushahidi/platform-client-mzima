import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prependUrl',
})
export class PrependUrlPipe implements PipeTransform {
  public transform(mediaPath: string, urlToPrepend: string) {
    // Regular expression to check if the variable is a URL
    const urlPattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name and extension
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i',
    ); // fragment locator

    // Check if the variable matches the URL pattern
    if (urlPattern.test(mediaPath)) {
      // If it's a URL, return it unchanged
      return mediaPath;
    } else {
      // If it's not a URL, append the specified text
      return urlToPrepend + mediaPath;
    }
  }
}
