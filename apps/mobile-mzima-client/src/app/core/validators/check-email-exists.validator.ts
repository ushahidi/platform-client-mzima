import { AsyncValidatorFn } from '@angular/forms';

export function emailExistsValidator(exists: boolean): AsyncValidatorFn {
  return (): any => {
    return exists ? { emailExists: true } : null;
  };
}
