import { AbstractControl, FormControl } from '@angular/forms';

export function MustBeTrueValidator(control: AbstractControl) {
  return control.value ? null : { mustBeTrue: { value: control.value } };
}

export const checkTaskControls = (tasks: any[]) => {
  return tasks.reduce((controls, task) => {
    controls[task.id] = new FormControl(!task.required, task.required ? MustBeTrueValidator : null);
    return controls;
  }, {});
};
