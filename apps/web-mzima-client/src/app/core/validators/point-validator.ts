import { AbstractControl, ValidatorFn } from '@angular/forms';

export function PointValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (value && (value.lat === '' || value.lng === '')) {
      return { invalidPoint: true };
    }
    return null;
  };
}
