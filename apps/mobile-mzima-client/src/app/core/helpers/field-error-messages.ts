import { FormControl } from '@angular/forms';
import { formErrorMessages } from '@constants';

export const fieldErrorMessages = (control: FormControl, controlName: string): string[] => {
  if (!control.touched) return [];
  const errors: string[] = [];
  const errorMap = formErrorMessages[controlName];

  if (errorMap) {
    for (const key in control.errors) {
      const errorMessage = errorMap[key];
      if (errorMessage) {
        errors.push(errorMessage);
      }
    }
  }

  return errors;
};
