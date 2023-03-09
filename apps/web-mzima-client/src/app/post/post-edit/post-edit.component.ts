import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Location } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { GeoJsonFilter, PostResult } from '@models';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BreakpointService, EventBusService, EventType } from '@services';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { TranslateService } from '@ngx-translate/core';
import { objectHelpers } from '@helpers';
import { SurveysService } from '../../core/services/surveys.service';
import { PostsV5Service } from '../../core/services/posts.v5.service';
import { PostsService } from '../../core/services/posts.service';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';
import { formValidators } from '@helpers';

dayjs.extend(utc);
dayjs.extend(timezone);

@UntilDestroy()
@Component({
  selector: 'app-post-edit',
  templateUrl: './post-edit.component.html',
  styleUrls: ['./post-edit.component.scss'],
})
export class PostEditComponent implements OnInit, OnChanges {
  @Input() public postInput: any;
  @Output() cancel = new EventEmitter();
  @Output() updated = new EventEmitter();
  public data: any;
  public form: FormGroup;
  public description: string;
  public title: string;
  private formId?: number;
  public tasks: any[];
  public activeLanguage: string;
  private initialFormData: any;
  private relationConfigForm: any;
  private relationConfigKey: string;
  private isSearching = false;
  public relatedPosts: PostResult[];
  public relationSearch: string;
  public selectedRelatedPost: any;
  private completeStages: number[] = [];
  private fieldsFormArray = ['tags'];
  public surveyName: string;
  private postId?: number;
  private post?: any;
  private isDesktop: boolean;
  public atLeastOneFieldHasValidationError: boolean;
  public formValidator = new formValidators.FormValidator();

  constructor(
    private route: ActivatedRoute,
    private surveysService: SurveysService,
    private formBuilder: FormBuilder,
    private postsV5Service: PostsV5Service,
    private postsV3Service: PostsService,
    private router: Router,
    private translate: TranslateService,
    private confirmModalService: ConfirmModalService,
    private eventBusService: EventBusService,
    private location: Location,
    private breakpointService: BreakpointService,
  ) {
    this.breakpointService.isDesktop$.pipe(untilDestroyed(this)).subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
      },
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      if (params.get('type')) {
        this.formId = Number(params.get('type'));
        this.loadData(this.formId);
      }
      if (params.get('id')) {
        this.postId = Number(params.get('id'));
        this.loadPostData(this.postId);
      }
    });
    this.translate.onLangChange.subscribe((newLang) => {
      this.activeLanguage = newLang.lang;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['postInput'] && changes['postInput'].currentValue) {
      this.post = this.postInput;
      this.formId = this.post.form_id;
      this.postId = this.post.id;
      this.loadData(this.formId!, this.post.post_content);
    }
  }

  private loadPostData(postId: number) {
    this.postsV5Service.getById(postId).subscribe({
      next: (post) => {
        this.formId = post.form_id;
        this.post = post;
        this.loadData(this.formId!, post.post_content);
      },
    });
  }

  private loadData(formId: number | null, updateContent?: []) {
    if (!formId) return;
    this.surveysService.getById(formId).subscribe({
      next: (data) => {
        this.data = data;
        this.tasks = data.result.tasks;
        this.surveyName = data.result.name;

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
                  this.relationConfigForm = field.config.input.form;
                  this.relationConfigKey = field.key;
                  break;
              }

              if (field.key) {
                const value =
                  field.default ||
                  (field.input === 'date'
                    ? new Date()
                    : field.input === 'location'
                    ? { lat: -1.28569, lng: 36.832324 }
                    : field.input === 'number'
                    ? 0
                    : '');
                field.value = value;
                fields[field.key] = this.fieldsFormArray.includes(field.type)
                  ? this.addFormArray(value, field)
                  : this.addFormControl(value, field);
              }
            });
        }
        this.form = new FormGroup(fields);
        this.initialFormData = this.form.value;

        if (updateContent) {
          this.updateForm(updateContent);
        }
      },
    });
  }

  private handleTags(key: string, value: any) {
    const formArray = this.form.get(key) as FormArray;
    value.forEach((val: { id: any }) => formArray.push(new FormControl(val?.id)));
  }

  private handleCheckbox(key: string, value: any) {
    const data = value.map((val: { id: any }) => val?.id);
    this.form.patchValue({ [key]: data });
  }

  private handleLocation(key: string, value: any) {
    this.form.patchValue({ [key]: { lat: value?.value.lat, lng: value?.value.lon } });
  }

  private handleDate(key: string, value: any) {
    this.form.patchValue({ [key]: new Date(value?.value) });
  }

  private handleRadio(key: string, value: any) {
    this.form.patchValue({ [key]: value?.value });
  }

  private handleTitle(key: string) {
    this.form.patchValue({ [key]: this.post.title });
  }

  private handleDescription(key: string) {
    this.form.patchValue({ [key]: this.post.content });
  }

  private updateForm(updateValues: any[]) {
    type InputHandlerType = 'tags' | 'checkbox' | 'location' | 'date' | 'datetime' | 'radio';
    type TypeHandlerType = 'title' | 'description';

    const inputHandlers: { [key in InputHandlerType]: (key: string, value: any) => void } = {
      tags: this.handleTags.bind(this),
      checkbox: this.handleCheckbox.bind(this),
      location: this.handleLocation.bind(this),
      date: this.handleDate.bind(this),
      datetime: this.handleDate.bind(this),
      radio: this.handleRadio.bind(this),
    };

    const typeHandlers: { [key in TypeHandlerType]: (key: string) => void } = {
      title: this.handleTitle.bind(this),
      description: this.handleDescription.bind(this),
    };

    for (const { fields } of updateValues) {
      for (const { type, input, key, value } of fields) {
        this.form.patchValue({ [key]: value });
        if (inputHandlers[input as InputHandlerType]) {
          inputHandlers[input as InputHandlerType](key, value);
        }

        if (typeHandlers[type as TypeHandlerType]) {
          typeHandlers[type as TypeHandlerType](key);
        }
      }
    }
  }

  private addFormArray(value: string, field: any) {
    return this.formBuilder.array(
      [] || [new FormControl(value)],
      field.required ? Validators.required : null,
    );
  }

  private addFormControl(value: string, field: any) {
    // console.log({ field, value });
    if (field.type === 'title') {
      return new FormControl(value, [Validators.required, Validators.minLength(2)]);
    } else if (field.input === 'video') {
      const fieldRequired: any = field.required ? Validators.required : null;
      return new FormControl(value, [fieldRequired, this.formValidator.videoValidator]);
    } else {
      return new FormControl(value, field.required ? Validators.required : null);
    }
  }

  public getOptionsByParentId(field: any, parent_id: number): any[] {
    return field.options.filter((option: any) => option.parent_id === parent_id);
  }

  preparationData(): any {
    for (const task of this.tasks) {
      task.fields = task.fields.map(
        (field: { key: string | number; input: string; type: string }) => {
          let value: any = {
            value: this.form.value[field.key],
          };

          if (field.type === 'title') this.title = this.form.value[field.key];
          if (field.type === 'description') this.description = this.form.value[field.key];

          switch (field.input) {
            case 'date':
            case 'datetime':
              value = this.form.value[field.key]
                ? {
                    value: dayjs(this.form.value[field.key]).format('YYYY-MM-DD'),
                    value_meta: {
                      from_tz: dayjs.tz.guess(),
                    },
                  }
                : { value: null };
              break;
            case 'location':
              value.value = {
                lat: this.form.value[field.key].lat,
                lon: this.form.value[field.key].lng,
              };
              break;
            case 'tags':
            case 'checkbox':
              value.value = this.form.value[field.key] || [];
              break;
            case 'relation':
            case 'video':
              value = this.form.value[field.key]
                ? {
                    value: this.form.value[field.key],
                  }
                : {};
              break;
            case 'upload':
              value.value = this.form.value[field.key] || null;
              break;
          }

          return {
            ...field,
            value,
          };
        },
      );
    }
  }

  public async submitPost(): Promise<void> {
    if (this.form.disabled) return;
    this.form.disable();

    this.preparationData();

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
      this.postsV5Service.update(this.postId, postData).subscribe({
        error: () => this.form.enable(),
        complete: async () => {
          await this.postComplete();
        },
      });
    } else {
      if (!this.atLeastOneFieldHasValidationError) {
        this.postsV5Service.post(postData).subscribe({
          error: () => this.form.enable(),
          complete: async () => {
            // console.log('Submit possible!');
            await this.postComplete();
          },
        });
      }
    }
  }

  public preventSubmitIncaseTheresNoBackendValidation() {
    /** Extra check to prevent form submission before hand
     * incase any field shows error but has no backend validation **/
    this.form.enable();
    for (let task of this.tasks) {
      this.atLeastOneFieldHasValidationError = task.fields.some((field: any) => {
        return (
          this.form.get(field.key)?.hasError('required') ||
          this.form.get(field.key)?.hasError('minlength') ||
          this.form.get(field.key)?.hasError('invalidvideourl')
        );
      });
    }
  }

  async postComplete() {
    this.form.enable();
    await this.confirmModalService.open({
      title: this.translate.instant('notify.confirm_modal.add_post_success.success'),
      description: `<p>${this.translate.instant(
        'notify.confirm_modal.add_post_success.success_description',
      )}</p>`,
      buttonSuccess: this.translate.instant('notify.confirm_modal.add_post_success.success_button'),
    });

    this.isDesktop ? this.backNavigation() : this.updated.emit();
  }

  public async previousPage() {
    for (const key in this.initialFormData) {
      this.initialFormData[key] = this.initialFormData[key]?.value || null;
    }
    if (!objectHelpers.objectsCompare(this.initialFormData, this.form.value)) {
      const confirmed = await this.confirmModalService.open({
        title: this.translate.instant('notify.default.data_has_not_been_saved'),
        description: this.translate.instant('notify.default.proceed_warning'),
        confirmButtonText: 'OK',
      });
      if (!confirmed) return;
    }

    if (this.isDesktop) {
      this.backNavigation(true);
      this.eventBusService.next({
        type: EventType.AddPostButtonSubmit,
        payload: true,
      });
    } else {
      this.cancel.emit();
    }
  }

  public backNavigation(isBack = false): void {
    isBack ? this.location.back() : this.router.navigate(['/feed']);
  }

  public toggleAllSelection(event: MatCheckboxChange, fields: any, fieldKey: string) {
    fields.map((field: any) => {
      if (field.key === fieldKey) {
        field.options.map((el: any) => {
          this.onCheckChange(event, field.key, el.id);
        });
      }
    });
  }

  public onCheckChange(event: any, fieldKey: string, id: number) {
    const formArray: FormArray = this.form.get(fieldKey) as FormArray;
    if (event.checked) {
      const index = formArray.controls.findIndex((ctrl: any) => ctrl.value === id);
      if (index === -1) formArray.push(new FormControl(id));
    } else {
      const index = formArray.controls.findIndex((ctrl: any) => ctrl.value === id);
      if (index > -1) {
        formArray.removeAt(index);
      }
    }
  }

  updateAllComplete(fieldKey: string, id: number) {
    return this.form.get(fieldKey)?.value.includes(id);
  }

  public relationSearchPosts() {
    const params: GeoJsonFilter = {
      order: 'desc',
      'form[]': this.relationConfigForm,
      orderby: 'post_date',
      q: this.relationSearch,
      'status[]': [],
    };
    this.isSearching = true;
    this.postsV3Service.getPosts('', params).subscribe({
      next: (data) => {
        this.relatedPosts = data.results;
        this.isSearching = false;
      },
      error: () => (this.isSearching = false),
    });
  }

  public taskComplete({ id }: any, event: MatSlideToggleChange) {
    if (event.checked) {
      this.completeStages.push(id);
    } else {
      const index = this.completeStages.indexOf(id);
      if (index >= 0) {
        this.completeStages.splice(index, 1);
      }
    }
  }

  public chooseRelatedPost(event: MatCheckboxChange, { key }: any, { id, title }: any) {
    if (!event.checked) return;
    this.form.patchValue({ [key]: id });
    this.selectedRelatedPost = { id, title };
    this.relatedPosts = [];
  }

  public deleteRelatedPost({ key }: any, { id }: any) {
    if (this.form.controls[key].value === id) {
      this.form.patchValue({ [key]: '' });
    }
    this.selectedRelatedPost = null;
  }

  public trackById(item: any): number {
    return item.id;
  }
}
