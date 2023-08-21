import { AbstractControl, FormControl } from '@angular/forms';
import { PostContent } from '../models';

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

export const replaceNewlinesInString = (input: string): string => {
  return input.replace(/\n/g, '<br>');
};

export const replaceNewlinesWithBreaks = (data: PostContent[]) => {
  return data.map((item: PostContent) => {
    if (item.fields) {
      item.fields = item.fields.map((field) => {
        if (field.value && typeof field.value.value === 'string') {
          field.value.value = replaceNewlinesInString(field.value.value);
        }
        return field;
      });
    }
    return item;
  });
};

export const isAllRequiredCompleted = (post: any): boolean => {
  for (const content of post.post_content) {
    if (content.required) {
      if (!post.completed_stages.some((stage: any) => stage.form_stage_id === content.id)) {
        return false;
      }
    }
  }
  return true;
};
