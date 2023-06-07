import { FormBuilder, FormControl, ValidatorFn, Validators } from '@angular/forms';
import { AlphanumericValidator, FormValidator, PhotoRequiredValidator } from '@validators';

export class PostEditForm {
  private formBuilder: FormBuilder;

  constructor(private fb: FormBuilder) {
    this.formBuilder = fb;
  }

  public addFormControl(value: any, field: any): FormControl {
    if (field.input === 'video') {
      const videoValidators = [];
      if (field.required) {
        videoValidators.push(Validators.required);
      }
      videoValidators.push(new FormValidator().videoValidator);
      return new FormControl(value, videoValidators);
    }

    const validators: ValidatorFn[] = [];
    switch (field.type) {
      case 'point':
        if (field.required) {
          // this.locationRequired = field.required;
          // if (value.lat === '' || value.lng === '') {
          //   this.emptyLocation = true;
          // }
        }
        break;
      case 'description':
        validators.push(Validators.minLength(2), AlphanumericValidator());
        if (field.required) validators.push(Validators.required);
        break;
      case 'title':
        validators.push(Validators.required, Validators.minLength(2), AlphanumericValidator());
        break;
      case 'media':
        if (field.required) {
          validators.push(PhotoRequiredValidator());
        }
        break;
      default:
        if (field.required) {
          validators.push(Validators.required);
        }
        break;
    }
    return new FormControl(value, validators);
  }

  public addFormArray(value: string, field: any) {
    return this.formBuilder.array(
      [] || [new FormControl(value)],
      field.required ? Validators.required : null,
    );
  }
}
