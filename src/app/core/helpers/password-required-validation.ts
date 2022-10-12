import { FormControl } from '@angular/forms';

export function passwordRequiredValidation(control: FormControl) {
  console.log('passwordRequiredValidation: ', control);

  const isSpace = (control.value || '').match(/\s/g);

  return isSpace ? { whitespace: true } : null;
}
