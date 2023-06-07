import { AbstractControl, ValidatorFn } from '@angular/forms';
import { alphaNumeric } from '../helpers/regex';

export function AlphanumericValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const isValid = alphaNumeric(control.value);
    return !isValid ? { specialCharacters: { value: control.value } } : null;
  };
}
