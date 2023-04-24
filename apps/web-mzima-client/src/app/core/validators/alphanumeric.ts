import { AbstractControl, ValidatorFn } from '@angular/forms';

export function AlphanumericValidatorValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const pattern = /^[\p{L}\p{N}\s\-".?!;,@'()]*$/gmu;
    const isValid = pattern.test(control.value);
    return !isValid ? { specialCharacters: { value: control.value } } : null;
  };
}
