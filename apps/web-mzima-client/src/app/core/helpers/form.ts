import { FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export class FormErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    const invalidCtrl = !!(control?.invalid && control?.parent?.dirty);
    const invalidParent = !!(control?.parent?.invalid && control?.parent?.dirty);

    return invalidCtrl || invalidParent;
  }
}

export const mapRoleToVisible = (role?: string[]) => {
  if (role && role.length > 0) {
    return {
      value: 'specific',
      options: role,
    };
  } else {
    return {
      value: 'everyone',
      options: [],
    };
  }
};
