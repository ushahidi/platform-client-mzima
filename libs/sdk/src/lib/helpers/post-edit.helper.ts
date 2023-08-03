import { AbstractControl, FormControl } from '@angular/forms';

export function MustBeTrueValidator(control: AbstractControl) {
  return control.value ? null : { mustBeTrue: { value: control.value } };
}

export const createTaskFormControls = (tasks: any[]) => {
  return tasks.reduce((controls, task, index) => {
    controls[task.id] = new FormControl(index === 0, task.required ? MustBeTrueValidator : null);
    return controls;
  }, {});
};

export const markCompletedTasks = (tasks: any[], post: any) => {
  post.completed_stages = post.completed_stages || [];

  return tasks.map((task, index) => {
    const matchedStage = post.completed_stages.find(
      (stage: any) => stage.form_stage_id === task.id,
    );

    if (matchedStage || index === 0) {
      return { ...task, completed: matchedStage ? matchedStage.completed === 1 : true };
    }
    return task;
  });
};
