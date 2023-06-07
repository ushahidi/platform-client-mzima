import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { PostsService, SurveysService } from '@mzima-client/sdk';
import { SessionService } from '@services';
import { preparingVideoUrl } from '@validators';
import { DatabaseService } from '@services';
import { PostEditForm } from '../components';

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';

@Component({
  selector: 'app-post-edit',
  templateUrl: 'post-edit.page.html',
  styleUrls: ['post-edit.page.scss'],
})
export class PostEditPage {
  @Input() public postInput: any;
  @Output() cancel = new EventEmitter();
  @Output() updated = new EventEmitter();
  public color: string;
  public form: FormGroup;
  private initialFormData: any;
  private relationConfigForm: any;
  private relationConfigSource: any;
  private relationConfigKey: string;
  private fieldsFormArray = ['tags'];
  public description: string;
  public title: string;
  private formId: number;
  private postId: number;
  private post: any;
  public tasks: any[];
  private completeStages: number[] = [];
  // private fieldsFormArray = ['tags'];
  public surveyName: string;
  public atLeastOneFieldHasValidationError: boolean;
  // public locationRequired = false;
  // public emptyLocation = false;

  public filters: any;
  public surveyList: any;
  public surveyListOptions: any;
  public selectedSurveyId: number = 507;
  public selectedSurvey: any;

  dateOption: any;

  constructor(
    private location: Location,
    private router: Router,
    private formBuilder: FormBuilder,
    private postsService: PostsService,
    private surveysService: SurveysService,
    private sessionService: SessionService,
    private dataBaseService: DatabaseService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
  ) {
    this.filters = JSON.parse(
      localStorage.getItem(this.sessionService.getLocalStorageNameMapper('filters'))!,
    );
    this.transformSurveys();

    this.form = this.formBuilder.group({
      title: new FormControl(),
      description: new FormControl(),
      incidentDate: new FormControl(),
      latitude: new FormControl(),
      longitude: new FormControl(),
    });
  }

  ionViewWillEnter() {
    this.getSurveys();
    if (this.selectedSurveyId) this.loadForm();
  }

  loadForm() {
    this.selectedSurvey = this.surveyList.find((item: any) => item.id === this.selectedSurveyId);
    this.color = this.selectedSurvey.color;
    this.tasks = this.selectedSurvey.tasks;

    const fields: any = {};
    for (const task of this.tasks) {
      task.fields
        .sort((a: any, b: any) => a.priority - b.priority)
        .map((field: any) => {
          switch (field.type) {
            case 'title':
              this.title = field.default;
              break;
            case 'description':
              this.description = field.default;
              break;
            case 'relation':
              const fieldForm: [] = field.config?.input?.form;
              this.relationConfigForm = !fieldForm.length ? this.filters.form : fieldForm;
              this.relationConfigSource = this.filters.source;
              this.relationConfigKey = field.key;
              break;
          }

          if (field.key) {
            const defaultValues: any = {
              date: new Date(),
              location: { lat: '', lng: '' },
              number: 0,
            };

            const types = [
              'upload',
              'tags',
              'location',
              'checkbox',
              'select',
              'radio',
              'date',
              'datetime',
            ];

            const value = types.includes(field.input)
              ? defaultValues[field.input]
              : field.default || defaultValues[field.input] || '';

            field.value = value;
            fields[field.key] = this.fieldsFormArray.includes(field.type)
              ? new PostEditForm(this.formBuilder).addFormArray(value, field)
              : new PostEditForm(this.formBuilder).addFormControl(value, field);
          }
        });
    }
    this.form = new FormGroup(fields);
    this.initialFormData = this.form.value;

    console.log(this.form.controls);
    console.log(this.form.value);
  }

  async transformSurveys() {
    this.surveyList = await this.dataBaseService.get('surveys');
    this.surveyListOptions = this.surveyList.map((item: any) => {
      return {
        label: item.name,
        value: item.id,
      };
    });
  }

  setCalendar() {}

  getSurveys() {
    this.surveysService
      .getSurveys('', {
        page: 1,
        order: 'asc',
        limit: 0,
      })
      .subscribe({
        next: (response) => {
          this.dataBaseService.set('surveys', response.results);
        },
      });
  }

  public onBack() {
    this.location.back();
  }

  async preparationData(): Promise<any> {
    const fieldHandlers = {
      date: (value: any) =>
        value
          ? {
              value: dayjs(value).format('YYYY-MM-DD'),
              value_meta: { from_tz: dayjs.tz.guess() },
            }
          : { value: null },
      datetime: (value: any) =>
        value
          ? {
              value: dayjs(value).format('YYYY-MM-DD'),
              value_meta: { from_tz: dayjs.tz.guess() },
            }
          : { value: null },
      location: (value: any) =>
        value && value.lat ? { value: { lat: value.lat, lon: value.lng } } : { value: null },
      tags: (value: any) => ({ value: value || null }),
      checkbox: (value: any) => ({ value: value || null }),
      video: (value: any) => (value ? { value: preparingVideoUrl(value) } : {}),
      relation: (value: any) => ({ value: value || null }),
      // default: (value: any) => ({ value: value || null }),
    };

    for (const task of this.tasks) {
      task.fields = await Promise.all(
        task.fields.map(async (field: { key: string | number; input: string; type: string }) => {
          const fieldValue = this.form.value[field.key];
          let value: any = { value: fieldValue };

          if (field.type === 'title') this.title = fieldValue;
          if (field.type === 'description') this.description = fieldValue;

          if (fieldHandlers.hasOwnProperty(field.input)) {
            value = fieldHandlers[field.input as keyof typeof fieldHandlers](fieldValue);
          } else if (field.input === 'upload') {
            if (this.form.value[field.key]?.upload && this.form.value[field.key]?.photo) {
              try {
                // const uploadObservable = this.mediaService.uploadFile(
                //   this.form.value[field.key]?.photo,
                //   this.form.value[field.key]?.caption,
                // );
                // const response: any = await lastValueFrom(uploadObservable);
                // value.value = response.id;
              } catch (error: any) {
                throw new Error(`Error uploading file: ${error.message}`);
              }
            } else if (this.form.value[field.key]?.delete && this.form.value[field.key]?.id) {
              try {
                // const deleteObservable = this.mediaService.delete(this.form.value[field.key]?.id);
                // await lastValueFrom(deleteObservable);
                // value.value = null;
              } catch (error: any) {
                throw new Error(`Error deleting file: ${error.message}`);
              }
            } else {
              value.value = this.form.value[field.key]?.id || null;
            }
          }

          return {
            ...field,
            value,
          };
        }),
      );
    }
  }

  public async submitPost(): Promise<void> {
    if (this.form.disabled) return;
    this.form.disable();

    try {
      await this.preparationData();
    } catch (error: any) {
      console.log(error);
      // this.snackBar.open(error, 'Close', { panelClass: ['error'], duration: 3000 });
      return;
    }

    const postData = {
      base_language: 'en',
      completed_stages: this.completeStages,
      content: this.description,
      description: '',
      enabled_languages: {},
      form_id: this.formId,
      locale: 'en_US',
      post_content: this.tasks,
      post_date: new Date().toISOString(),
      published_to: [],
      title: this.title,
      type: 'report',
    };

    if (!this.form.valid) this.form.markAllAsTouched();
    this.preventSubmitIncaseTheresNoBackendValidation();

    if (this.postId) {
      postData.post_date = this.post.post_date || new Date().toISOString();
      this.updatePost(this.postId, postData);
    } else {
      if (!this.atLeastOneFieldHasValidationError) {
        this.createPost(postData);
      }
    }
  }

  private updatePost(postId: number, postData: any) {
    this.postsService.update(postId, postData).subscribe({
      error: () => this.form.enable(),
      complete: async () => {
        await this.postComplete();
        this.backNavigation();
        this.updated.emit();
      },
    });
  }

  private createPost(postData: any) {
    this.postsService.post(postData).subscribe({
      error: () => this.form.enable(),
      complete: async () => {
        await this.postComplete();
        this.router.navigate(['/feed']);
      },
    });
  }

  async postComplete() {
    // await this.confirmModalService.open({
    //   title: this.translate.instant('notify.confirm_modal.add_post_success.success'),
    //   description: `<p>${this.translate.instant(
    //     'notify.confirm_modal.add_post_success.success_description',
    //   )}</p>`,
    //   buttonSuccess: this.translate.instant('notify.confirm_modal.add_post_success.success_button'),
    // });
  }

  public async previousPage() {
    // for (const key in this.initialFormData) {
    //   this.initialFormData[key] = this.initialFormData[key]?.value || null;
    // }
    // if (!objectHelpers.objectsCompare(this.initialFormData, this.form.value)) {
    //   const confirmed = await this.confirmModalService.open({
    //     title: this.translate.instant('notify.default.data_has_not_been_saved'),
    //     description: this.translate.instant('notify.default.proceed_warning'),
    //     confirmButtonText: 'OK',
    //   });
    //   if (!confirmed) return;
    // }
    // if (!this.postInput) {
    //   this.backNavigation();
    //   this.eventBusService.next({
    //     type: EventType.AddPostButtonSubmit,
    //     payload: true,
    //   });
    // } else {
    //   this.cancel.emit();
    // }
  }

  public backNavigation(): void {
    this.location.back();
  }

  // public toggleAllSelection(event: MatCheckboxChange, fields: any, fieldKey: string) {
  //   // fields.map((field: any) => {
  //   //   if (field.key === fieldKey) {
  //   //     field.options.map((el: any) => {
  //   //       this.onCheckChange(event, field.key, el.id);
  //   //     });
  //   //   }
  //   // });
  // }

  public preventSubmitIncaseTheresNoBackendValidation() {
    /** Extra check to prevent form submission before hand
     * incase any field shows error but has no backend validation **/
    this.form.enable();
    for (const task of this.tasks) {
      this.atLeastOneFieldHasValidationError = task.fields.some((field: any) => {
        return (
          this.form.get(field.key)?.hasError('required') ||
          this.form.get(field.key)?.hasError('minlength') ||
          this.form.get(field.key)?.hasError('invalidvideourl')
        );
      });
    }
  }

  public taskComplete(event: any) {
    console.log(event);
    if (event.checked) {
      // this.completeStages.push(id);
    } else {
      // const index = this.completeStages.indexOf(id);
      // if (index >= 0) {
      //   this.completeStages.splice(index, 1);
      // }
    }
  }

  public trackById(item: any): number {
    return item.id;
  }

  public generateSecurityTrustUrl(unsafeUrl: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
  }
}
