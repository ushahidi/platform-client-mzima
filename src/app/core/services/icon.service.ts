import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Icons } from '../enums/icons';

@Injectable({
  providedIn: 'root',
})
export class IconService {
  constructor(private matIconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {}

  registerIcons(): void {
    this.load(Icons, 'assets/icons');
  }

  private load(icons: typeof Icons, url: string): void {
    Object.keys(icons).forEach((icon) => {
      // @ts-ignore
      const iconName = icons[icon];
      this.matIconRegistry.addSvgIcon(
        iconName,
        this.sanitizer.bypassSecurityTrustResourceUrl(`${url}/${iconName}.svg`),
      );
    });
  }
}
