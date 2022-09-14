import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-data-source-form',
  templateUrl: './data-source-form.component.html',
  styleUrls: ['./data-source-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataSourceFormComponent implements OnChanges {
  @Input() surveyList: any[];
  @Input() formControls: any[];
  @Output() formControlsChange = new EventEmitter();
  public form: FormGroup = this.fb.group({});
  private hasChange = false;

  @ContentChild('survey') survey!: TemplateRef<any>;

  constructor(
    private fb: FormBuilder, //
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['formControls']?.firstChange) {
      this.removeControls(this.form.controls);
      this.createControls(this.formControls);
    }
  }

  private removeControls(controls: any) {
    this.hasChange = false;
    for (const [key] of Object.entries(controls)) {
      this.form.removeControl(key);
    }
  }

  private createControls(controls: any) {
    for (const control of controls) {
      const validatorsToAdd = [];

      if (control?.rules) {
        for (const [key] of Object.entries(control.rules)) {
          switch (key) {
            case 'required':
              validatorsToAdd.push(Validators.required);
              break;
            default:
              break;
          }
        }
      }

      this.form.addControl(control.form_label, this.fb.control(control.value, validatorsToAdd));
    }
    console.log(this.form.value);
  }

  submit() {
    this.formControlsChange.emit(this.form.value);
  }

  cancel() {}
}
