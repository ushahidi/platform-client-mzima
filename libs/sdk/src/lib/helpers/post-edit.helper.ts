import { AbstractControl, FormControl } from '@angular/forms';

export function MustBeTrueValidator(control: AbstractControl) {
  const isTrue = control.value;
  return isTrue === true ? null : { mustBeTrue: { value: control.value } };
}

export const checkTaskControls = (tasks: any[]) => {
  return tasks.reduce((controls, task) => {
    controls[task.id] = new FormControl(!task.required, task.required ? MustBeTrueValidator : null);
    return controls;
  }, {});
};
