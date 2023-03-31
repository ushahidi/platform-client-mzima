import { AbstractControl, ValidatorFn } from '@angular/forms';

export function excludeSpecialCharactersValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const pattern = /^[^#$%^&*ˆ+=]*$/;
    const isValid = pattern.test(control.value);
    return !isValid ? { specialCharacters: { value: control.value } } : null;
  };
}
