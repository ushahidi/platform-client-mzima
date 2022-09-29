import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveysService } from '@services';

@Component({
  selector: 'app-survey-item',
  templateUrl: './survey-item.component.html',
  styleUrls: ['./survey-item.component.scss'],
})
export class SurveyItemComponent implements OnInit {
  public selectLanguageCode: string;
  public description: string;
  public name: string;
  public form: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required]],
    description: [''],
    color: [null],
    enabled_languages: this.formBuilder.group({
      default: ['en'],
      available: [[]],
    }),
    tasks: [[]],
    require_approval: [true],
    everyone_can_create: [true],
    translations: [{}],
    can_create: [[]],
    disabled: [false],
    hide_author: [false],
    hide_location: [false],
    hide_time: [false],
    targeted_survey: [false],
    type: [''],
  });
  public isEdit = false;

  constructor(
    private formBuilder: FormBuilder, //
    private router: Router,
    private route: ActivatedRoute,
    private surveysService: SurveysService,
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = !!id;
      this.surveysService.getById(id).subscribe({
        next: (response) => {
          this.updateForm(response.result);
        },
      });
    }
  }

  private updateForm(data: any) {
    Object.keys(data).forEach((key) => {
      if (this.form.controls[key]) {
        this.form.controls[key].patchValue(data[key]);
      }
    });
  }

  private getFormControl(name: string) {
    return this.form.controls[name];
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

  public setTranslates(languageCode: string, field: string, event: any) {
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

  public update() {
    console.log('update > form ', this.form.value);
  }

  public cancel() {
    this.router.navigate(['settings/surveys']);
  }
}
