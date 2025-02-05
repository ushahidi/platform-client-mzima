import { AbstractControl, ValidatorFn } from '@angular/forms';

export function MediaRequired(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;

    // Handle different structures, could be array of media or single object
    if (
      value &&
      (Array.isArray(value) ? value.length > 0 : value.photo || value.audio || value.document)
    ) {
      return null; // this should be valid if at least one media file exists
    } else {
      return { photoRequired: true };
    }
  };
}
