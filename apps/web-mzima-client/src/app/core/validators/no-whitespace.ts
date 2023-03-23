import { AbstractControl, ValidationErrors } from '@angular/forms';

export function noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value && value.trim().length === 0) {
    return { whitespace: true };
  }
  return null;
}
