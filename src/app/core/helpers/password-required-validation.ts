import { FormControl } from '@angular/forms';

export function passwordRequiredValidation(control: FormControl) {
  const isSpace = (control.value || '').match(/\s/g);

  return isSpace ? { whitespace: true } : null;
}
