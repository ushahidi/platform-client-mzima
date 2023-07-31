import { AbstractControl } from '@angular/forms';

export const checkTaskControls = (tasks: any[]) => {
  return tasks.reduce((controls, task) => {
    controls[task.id] = [!task.required];
    return controls;
  }, {});
};

export const requiredTasksValidator = (control: AbstractControl): { [key: string]: any } | null => {
  const invalid = Object.values(control.value).some((value) => value === false);
  return invalid ? { requiredTasks: { value: 'Not all required tasks are complete.' } } : null;
};
