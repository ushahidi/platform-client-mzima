import { Attribute, Directive, ElementRef } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'input[formControlName]',
})
export class DataQaInputDirective {
  constructor(
    elementRef: ElementRef<HTMLElement>, //
    @Attribute('formControlName') name: string,
  ) {
    const el = elementRef.nativeElement;
    if (!el.hasAttribute('data-qa')) {
      el.setAttribute('data-qa', name);
    }
  }
}
