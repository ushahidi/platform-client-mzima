import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-survey',
  templateUrl: './create-survey.component.html',
  styleUrls: ['./create-survey.component.scss'],
})
export class CreateSurveyComponent implements OnInit {
  public selectLanguageCode: string;
  public description: string;
  public name: string;
  public form: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required]],
    description: [''],
    color: [null],
    enabled_languages: this.formBuilder.group({
      default: ['en'],
      available: this.formBuilder.array(this.buildArrayControl(null)),
    }),
    tasks: this.formBuilder.array(this.buildArrayControl(null)), // array
    require_approval: [true],
    everyone_can_create: [true],
    translations: [], //{} or "translations":{"aln":{"name": "name aln", "description":"desc aln"}}
  });
  public isEdit = false;

  constructor(
    private formBuilder: FormBuilder, //
  ) {}

  private buildArrayControl(data: any[] | null) {
    console.log('buildArrayControl > data ', data);
    return [];
  }

  public ngOnInit(): void {
    console.log('CreateSurveyComponent');
  }

  private getFormControl(name: string) {
    return this.form.controls[name];
  }

  get availableLanguages() {
    return this.getFormControl('enabled_languages').value.available as FormArray;
  }

  public setAvailableLanguages(languageCode: string): void {
    this.getFormControl('enabled_languages').value.available.push(languageCode);
    const param = {
      ...this.getFormControl('translations').value,
      [languageCode]: {
        name: '',
        description: '',
      },
    };
    this.form.patchValue({
      translations: param,
    });
  }

  public chooseTranslation(languageCode: string): void {
    this.selectLanguageCode = languageCode;
    this.name = this.description = '';
  }

  setTranslates(languageCode: string, field: string, event: any) {
    const translations = this.getFormControl('translations').value;
    for (const key in translations) {
      if (key === languageCode) {
        translations[key] = {
          ...translations[key],
          [field]: event.target.value,
        };
        this.form.patchValue({
          translations: translations,
        });
      }
    }
  }

  public async deleteTranslation(languageCode: string): Promise<void> {
    this.getFormControl('enabled_languages').value.available = this.getFormControl(
      'enabled_languages',
    ).value.available.filter((el: any) => el !== languageCode);

    const translations = this.getFormControl('translations').value;
    for (const key in translations) {
      if (key === languageCode) {
        delete translations[key];
        this.form.patchValue({
          translations: translations,
        });
      }
    }
  }

  public save() {
    console.log('save > form ', this.form.value);
  }

  public cancel() {
    console.log('cancel');
  }
}
