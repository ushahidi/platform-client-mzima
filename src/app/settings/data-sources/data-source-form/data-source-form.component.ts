import {
  AfterContentChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-data-source-form',
  templateUrl: './data-source-form.component.html',
  styleUrls: ['./data-source-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataSourceFormComponent implements AfterContentChecked, OnChanges {
  @Input() surveyList: any[];
  @Input() provider: any;
  @Output() formControlsChange = new EventEmitter();
  @Output() formCancel = new EventEmitter();
  @ContentChild('survey') survey!: TemplateRef<any>;
  public form: FormGroup = this.fb.group({});
  private hasChange = false;

  constructor(
    private fb: FormBuilder, //
    private ref: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['provider']?.firstChange && !changes['surveyList']) {
      this.removeControls(this.form.controls);
      this.createForm(this.provider);
      this.addControlsToForm('id', this.fb.control(this.provider.id, Validators.required));
    }
  }

  ngAfterContentChecked() {
    this.ref.detectChanges();
  }

  private createForm(provider: any) {
    this.createControls(provider.options);
    this.createControls(provider.inbound_fields);
    // console.log(this.form.controls);
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
      this.addControlsToForm(control.form_label, this.fb.control(control.value, validatorsToAdd));
    }
  }

  private addControlsToForm(name: string, control: AbstractControl) {
    this.form.addControl(name, control);
  }

  public submit() {
    this.formControlsChange.emit(this.form.value);
  }

  public cancel() {
    this.formCancel.emit(true);
  }
}
