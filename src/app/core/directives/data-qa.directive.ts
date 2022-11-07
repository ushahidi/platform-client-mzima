import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[data-qa]',
})
export class DataQaDirective implements AfterViewInit {
  @Input('data-qa') dataQa: string | number;

  constructor(private elRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    const el = this.elRef.nativeElement;
    if (!el.hasAttribute('data-qa')) {
      el.setAttribute('data-qa', this.dataQa.toString());
    }
  }
}
