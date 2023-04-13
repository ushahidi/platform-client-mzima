import { AbstractControl, ValidatorFn } from '@angular/forms';
import { decimalPattern } from '../helpers/regex';

export function LocationValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const { lat, lng } = control.value;

    // check latitude for decimal number
    if (lat !== '') {
      const isValid = decimalPattern(lat);
      if (!isValid) {
        return { noLetter: true };
      }
    }
    // check longitude for decimal number
    if (lng !== '') {
      const isValid = decimalPattern(lng);
      if (!isValid) {
        return { noLetter: true };
      }
    }

    // check for empty field
    if (lat === '' || lng === '') {
      return { emptyLocation: true };
    }

    return null;
  };
}
