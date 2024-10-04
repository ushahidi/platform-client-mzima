import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Location } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BreakpointService,
  EventBusService,
  EventType,
  SessionService,
  LanguageService,
  ConfirmModalService,
} from '@services';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import { TranslateService } from '@ngx-translate/core';
import {
  SurveysService,
  PostsService,
  GeoJsonFilter,
  PostResult,
  MediaService,
  postHelpers,
  SurveyItem,
} from '@mzima-client/sdk';
import { BaseComponent } from '../../base.component';
import { preparingVideoUrl } from '../../core/helpers/validators';
import { objectHelpers, formValidators, dateHelper } from '@helpers';
import { PhotoRequired, PointValidator } from '../../core/validators';
import { Observable, lastValueFrom, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LanguageInterface } from '@mzima-client/sdk';
import { MatSelectChange } from '@angular/material/select';

dayjs.extend(timezone);

@Component({
  selector: 'app-post-edit',
  templateUrl: './post-edit.component.html',
  styleUrls: ['./post-edit.component.scss'],
})
export class PostEditComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() public postInput: any;
  @Input() public modalView: boolean;
  @Output() cancel = new EventEmitter();
  @Output() updated = new EventEmitter();
  public color: string;
  public form: FormGroup;
  public taskForm: FormGroup;
  public description: string;
  public title: string;
  public formId?: number;
  public tasks: any[];
  public activeLanguage: string;
  private initialFormData: any;
  private relationConfigForm: any;
  private relationConfigSource: any;
  private relationConfigKey: string;
  private isSearching = false;
  public isEditPost = false;
  public relatedPosts: PostResult[];
  public relationSearch: string;
  public selectedRelatedPost: any;
  private completeStages: number[] = [];
  private fieldsFormArray = ['tags'];
  public surveyName: string;
  private postId?: number;
  private formInfo: any;
  public requireApproval = false;
  maxSizeError = false;

  public post?: any;
  public atLeastOneFieldHasValidationError: boolean;
  public formValidator = new formValidators.FormValidator();
  // public locationRequired = false;
  public emptyLocation = false;
  public submitted = false;
  public filters;
  maxImageSize: any;
  selectedLanguage: any;
  postLanguages: LanguageInterface[] = [];
  selectedSurvey: SurveyItem;
  public surveys: Observable<any>;
  constructor(
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private route: ActivatedRoute,
    private surveysService: SurveysService,
    private formBuilder: FormBuilder,
    private postsService: PostsService,
    private router: Router,
    private translate: TranslateService,
    private confirmModalService: ConfirmModalService,
    private eventBusService: EventBusService,
    private location: Location,
    private mediaService: MediaService,
    private languageService: LanguageService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
  ) {
    super(sessionService, breakpointService);
    this.checkDesktop();
    this.getUserData();
    this.filters = JSON.parse(
      localStorage.getItem(this.sessionService.getLocalStorageNameMapper('filters'))!,
    );
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      if (params.get('type')) {
        this.formId = Number(params.get('type'));
        this.loadSurveyData(this.formId);
      }
      if (params.get('id')) {
        this.postId = Number(params.get('id'));
        this.loadPostData(this.postId);
      }
      if (!this.formId) {
        this.surveysService.get().subscribe((result) => {
          this.surveys = of(result.results);
        });
      }
    });

    this.translate.onLangChange.subscribe((newLang) => {
      this.activeLanguage = newLang.lang;
    });

    this.maxImageSize = Number(this.sessionService.getSiteConfigurations().image_max_size);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['postInput'] && changes['postInput'].currentValue) {
      this.post = this.postInput;
      this.formId = this.post.form_id;
      this.postId = this.post.id;
      this.loadSurveyData(this.formId!, this.post.post_content);
    }
  }

  loadData(): void {}

  formSelected() {
    this.formId = this.selectedSurvey.id;
    this.post.form_id = this.selectedSurvey.id;
    this.post.post_content = this.selectedSurvey.tasks;
    this.loadSurveyData(this.formId, this.post.post_content);
  }

  selectLanguageEmit(event: MatSelectChange) {
    this.activeLanguage = event.value.code;
    this.surveyName = this.formInfo.translations[this.activeLanguage]?.name || this.formInfo.name;
  }

  private loadPostData(postId: number) {
    this.postsService.getById(postId).subscribe({
      next: (post) => {
        this.formId = post.form_id;
        this.post = post;
        if (!this.postsService.isPostLockedForCurrentUser(this.post)) {
          this.postsService.lockPost(this.post.id).subscribe();
          this.loadSurveyData(this.formId!, post.post_content);
        } else {
          this.backNavigation();
        }
      },
    });
  }

  getParentsWithChildren(options: any[]) {
    const parents = options.filter((opt: any) => !opt.parent_id);
    parents.forEach((parent) => {
      parent.children = options.filter((opt: any) => opt.parent_id === parent.id);
    });
    return parents;
  }

  private loadSurveyData(formId: number | null, updateContent?: any[]) {
    if (!formId) return;
    this.surveysService.getSurveyById(formId).subscribe({
      next: (data) => {
        const { result } = data;
        this.requireApproval = result.require_approval;
        this.color = result.color;
        this.tasks = result.tasks;
        this.surveyName = result.name;
        this.formInfo = result;
        const languages = this.languageService.getLanguages();

        const availableLanguages: any[] = result.enabled_languages.available;
        if (availableLanguages.length) {
          availableLanguages.unshift(result.enabled_languages.default);
          availableLanguages.forEach((langCode: string) => {
            this.postLanguages.push(
              languages.find((lang) => lang.code.split('-')[0] === langCode.split('-')[0])!,
            );
          });
          this.selectedLanguage = this.postLanguages[0];
        }

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
                case 'tags':
                  field.options = this.getParentsWithChildren(field.options);
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
                  ? this.addFormArray(value, field)
                  : this.addFormControl(value, field);
              }
            });
        }

        this.taskForm = this.formBuilder.group(postHelpers.createTaskFormControls(this.tasks));

        this.form = new FormGroup(fields);
        this.initialFormData = this.form.value;
        this.handleOtherOptions();
        if (updateContent) {
          this.isEditPost = true;
          this.tasks = postHelpers.markCompletedTasks(this.tasks, this.post);

          this.tasks.forEach((task, index) => {
            if (task.completed) {
              this.taskForm.patchValue({
                [task.id]: task.completed,
              });
              if (index !== 0) {
                this.completeStages.push(task.id);
              }
            }
          });

          this.updateForm(updateContent);
        }
      },
    });
  }

  private handleOtherOptions() {
    for (const task of this.tasks) {
      task.fields.map((field: any) => {
        if (
          (field.input === 'radio' || field.input === 'checkbox') &&
          field.options.includes('Other')
        ) {
          this.form.addControl(`other${field.key}`, new FormControl());
        }
      });
    }
  }
  public hasEmptyOther(key: string) {
    const emptyOther =
      this.form.get(key)?.value?.includes('Other') &&
      !this.form.get('other' + key)?.value &&
      this.form.get('other' + key)?.touched;
    this.form.controls[key].setErrors({ emptyOther });
    if (!emptyOther) this.form.controls[key].updateValueAndValidity();
    return emptyOther;
  }

  public selectOther(event: any, field: any) {
    event.stopPropagation();
    if (field.input === 'radio') {
      this.form.patchValue({ [field.key]: 'Other' });
    } else {
      if (!this.form.controls[field.key].value?.includes('Other')) {
        const newValue = this.form.controls[field.key].value || [];
        newValue.push('Other');
        this.form.patchValue({ [field.key]: newValue });
      }
    }
  }

  public toggleFocus(event: any, field: any) {
    console.log(field);
    event.stopPropagation();
  }

  public changeLocation(data: any, formKey: string) {
    const { location, error } = data;
    const { lat, lng } = location;

    this.form.patchValue({ [formKey]: { lat: lat, lng: lng } });

    this.emptyLocation = error;
    this.cdr.detectChanges();
  }

  private handleTags(key: string, value: any) {
    const formArray = this.form.get(key) as FormArray;
    value?.forEach((val: { id: any }) => formArray.push(new FormControl(val?.id)));
  }

  private async handleUpload(key: string, value: any) {
    if (!value?.value) return;
    try {
      const uploadObservable = this.mediaService.getById(value.value);
      const response: any = await lastValueFrom(uploadObservable);

      this.form.patchValue({
        [key]: {
          id: value.value,
          caption: response.result.caption,
          photo: response.result.original_file_url,
        },
      });
    } catch (error: any) {
      this.form.patchValue({ [key]: null });
      throw new Error(`Error fetching file: ${error.message}`);
    }
  }

  private handleDefault(key: string, value: any) {
    this.form.patchValue({ [key]: value?.value });
  }

  private handleRadio(key: string, value: any, options: any) {
    if (options.indexOf(value?.value) < 0 && options.includes('Other')) {
      this.form.patchValue({ [key]: 'Other' });
      this.form.patchValue({ [`other${key}`]: value?.value });
    } else {
      this.form.patchValue({ [key]: value?.value });
      this.form.patchValue({ [`other${key}`]: '' });
    }
  }

  private handleCheckbox(key: string, value: any, options: any) {
    let data = value?.value;
    if (data?.length && options.includes('Other')) {
      for (const val of data) {
        if (options.indexOf(val) < 0) {
          this.form.patchValue({ [`other${key}`]: val });
          data = data.filter((oldVal: any) => oldVal !== val);
          data.push('Other');
        }
      }
    }
    this.form.patchValue({ [key]: data });
  }

  private handleLocation(key: string, value: any) {
    this.form.patchValue({
      [key]: value?.value
        ? { lat: value?.value.lat, lng: value?.value.lon }
        : {
            lat: '',
            lng: '',
          },
    });
  }

  private handleDate(key: string, value: any) {
    this.form.patchValue({ [key]: value?.value ? dateHelper.setDate(value?.value, 'date') : null });
  }

  private handleDateTime(key: string, value: any) {
    this.form.patchValue({
      [key]: value?.value ? dateHelper.setDate(value?.value, 'datetime') : null,
    });
  }

  private handleTitle(key: string) {
    this.form.patchValue({ [key]: this.post.title });
  }

  private handleDescription(key: string) {
    this.form.patchValue({ [key]: this.post.content ? this.post.content : '' });
  }

  private updateForm(updateValues: any[]) {
    type InputHandlerType =
      | 'tags'
      | 'checkbox'
      | 'location'
      | 'date'
      | 'datetime'
      | 'radio'
      | 'text'
      | 'upload'
      | 'video'
      | 'textarea'
      | 'relation'
      | 'number';
    type TypeHandlerType = 'title' | 'description';

    const inputHandlers: Partial<{ [key in InputHandlerType]: (key: string, value: any) => void }> =
      {
        tags: this.handleTags.bind(this),
        location: this.handleLocation.bind(this),
        date: this.handleDate.bind(this),
        datetime: this.handleDateTime.bind(this),
        upload: this.handleUpload.bind(this),
      };

    type InputHandlersOptionsType = 'radio' | 'checkbox';

    const inputHandlersOptions: {
      [key in InputHandlersOptionsType]: (key: string, value: any, options: any) => void;
    } = {
      radio: this.handleRadio.bind(this),
      checkbox: this.handleCheckbox.bind(this),
    };

    const typeHandlers: { [key in TypeHandlerType]: (key: string) => void } = {
      title: this.handleTitle.bind(this),
      description: this.handleDescription.bind(this),
    };

    for (const { fields } of updateValues) {
      for (const { type, input, key, value, options } of fields) {
        this.form.patchValue({ [key]: value });
        if (inputHandlers[input as InputHandlerType]) {
          inputHandlers[input as InputHandlerType]!(key, value);
        } else if (inputHandlersOptions[input as InputHandlersOptionsType]) {
          inputHandlersOptions[input as InputHandlersOptionsType](key, value, options);
        } else {
          this.handleDefault.bind(this)(key, value);
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

  private addFormControl(value: any, field: any): FormControl {
    if (field.input === 'video') {
      const videoValidators = [];
      if (field.required) {
        videoValidators.push(Validators.required);
      }
      videoValidators.push(this.formValidator.videoValidator);
      return new FormControl(value, videoValidators);
    }

    const validators: ValidatorFn[] = [];
    switch (field.type) {
      case 'point':
        if (field.required) {
          validators.push(PointValidator());
        }
        break;
      case 'description':
        validators.push(Validators.minLength(2));
        if (field.required) validators.push(Validators.required);
        break;
      case 'title':
        validators.push(Validators.required, Validators.minLength(2));
        break;
      case 'media':
        if (field.required) {
          validators.push(PhotoRequired());
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

  async preparationData(): Promise<any> {
    for (const task of this.tasks) {
      task.fields = await Promise.all(
        task.fields.map(
          async (field: { key: string | number; input: string; type: string; options: any }) => {
            let value: any = {
              value: this.form.value[field.key],
            };

            if (field.type === 'title') this.title = this.form.value[field.key];
            if (field.type === 'description') this.description = this.form.value[field.key];

            switch (field.input) {
              case 'date':
                value = this.form.value[field.key]
                  ? {
                      value: dateHelper.setDate(this.form.value[field.key], 'date'),
                      value_meta: {
                        from_tz: dayjs.tz.guess(),
                      },
                    }
                  : { value: null };
                break;
              case 'datetime':
                value = this.form.value[field.key]
                  ? {
                      value: dateHelper.setDate(this.form.value[field.key], 'datetime'),
                      value_meta: {
                        from_tz: dayjs.tz.guess(),
                      },
                    }
                  : { value: null };
                break;
              case 'location':
                value = this.form.value[field.key].lat
                  ? {
                      value: {
                        lat: this.form.value[field.key].lat,
                        lon: this.form.value[field.key].lng,
                      },
                    }
                  : { value: null };
                break;
              case 'tags':
              case 'checkbox':
                value.value = this.form.value[field.key] || null;
                if (value.value?.includes('Other')) {
                  value.value = value.value.filter((opt: any) => opt !== 'Other');
                  value.value.push(this.form.value[`other${field.key}`]);
                }
                break;
              case 'radio':
                if (field.options.includes('Other')) {
                  value.value =
                    this.form.value[field.key] === 'Other'
                      ? this.form.value[`other${field.key}`]
                      : this.form.value[field.key];
                } else {
                  value.value = this.form.value[field.key] || null;
                }
                break;
              case 'video':
                value = this.form.value[field.key]
                  ? {
                      value: preparingVideoUrl(this.form.value[field.key]),
                    }
                  : {};
                break;

              case 'relation':
                value.value = this.form.value[field.key] || null;
                break;
              case 'upload':
                const originalValue = this.post?.post_content[0]?.fields.filter(
                  (fieldValue: { key: string | number }) => fieldValue.key === field.key,
                )[0];
                if (this.form.value[field.key]?.upload && this.form.value[field.key]?.photo) {
                  try {
                    this.maxSizeError = false;
                    if (this.maxImageSize > this.form.value[field.key].photo.size) {
                      const uploadObservable = this.mediaService.uploadFile(
                        this.form.value[field.key]?.photo,
                        this.form.value[field.key]?.caption,
                      );
                      const response: any = await lastValueFrom(uploadObservable);
                      value.value = response.result.id;
                    } else {
                      this.maxSizeError = true;
                      throw new Error(`Error uploading file: max size exceed`);
                    }
                  } catch (error: any) {
                    throw new Error(`Error uploading file: ${error.message}`);
                  }
                } else if (this.form.value[field.key]?.delete && this.form.value[field.key]?.id) {
                  try {
                    const deleteObservable = this.mediaService.delete(
                      this.form.value[field.key]?.id,
                    );
                    await lastValueFrom(deleteObservable);
                    value.value = null;
                  } catch (error: any) {
                    throw new Error(`Error deleting file: ${error.message}`);
                  }
                } else if (originalValue?.value?.mediaCaption !== value.value?.caption) {
                  try {
                    const captionObservable = await this.mediaService.updateCaption(
                      originalValue.value.id,
                      value.value.caption,
                    );
                    await lastValueFrom(captionObservable);
                    value.value = originalValue.value.id;
                  } catch (error: any) {
                    throw new Error(`Error updating caption: ${error.message}`);
                  }
                } else {
                  value.value = this.form.value[field.key]?.id || null;
                }
                break;
              default:
                value.value = this.form.value[field.key] || null;
            }
            return {
              ...field,
              value,
            };
          },
        ),
      );
    }
  }

  public async submitPost(): Promise<void> {
    if (this.form.disabled) return;
    this.submitted = true;
    this.form.disable();

    try {
      await this.preparationData();
    } catch (error: any) {
      this.form.enable();
      this.submitted = false;
      this.showMessage(error, 'error');
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
      published_to: [],
      title: this.title,
      type: 'report',
    };

    if (!this.form.valid) this.form.markAllAsTouched();
    this.preventSubmitIncaseTheresNoBackendValidation();

    if (this.postId) {
      this.updatePost(this.postId, postData);
    } else {
      if (!this.atLeastOneFieldHasValidationError) {
        this.createPost(postData);
      }
    }
  }

  private updatePost(postId: number, postData: any) {
    this.postsService.update(postId, postData).subscribe({
      next: ({ result }) => {
        this.postsService.unlockPost(postId).subscribe();
        this.eventBusService.next({
          type: EventType.UpdatedPost,
          payload: result,
        });
      },
      error: ({ error }) => {
        this.form.enable();
        this.submitted = false;
        if (error.errors?.status === 422) {
          this.showMessage(`Failed to update a post. ${error.errors.message}`, 'error');
        }
      },
      complete: async () => {
        // await this.postComplete();
        this.updated.emit();
        if (this.checkRoutes('feed')) this.backNavigation();
      },
    });
  }

  private checkRoutes(path: string) {
    return this.router.url.includes(path);
  }

  private createPost(postData: any) {
    this.postsService.post(postData).subscribe({
      error: ({ error }) => {
        if (error.errors?.status === 422) {
          this.showMessage(`Failed to create a post. ${error.errors.message}`, 'error');
        }
        if (error.errors[0]?.status === 403) {
          this.showMessage(`Failed to create a post. ${error.errors[0].message}`, 'error');
        }
        this.form.enable();
        this.submitted = false;
      },
      complete: async () => {
        await this.postComplete();
        this.router.navigate(['/feed']);
      },
    });
  }

  private showMessage(message: string, type: string) {
    this.snackBar.open(message, 'Close', {
      panelClass: [type],
      duration: 3000,
    });
  }

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

  async postComplete() {
    await this.confirmModalService.open({
      title: this.translate.instant('notify.confirm_modal.add_post_success.success'),
      description: `<p>${this.translate.instant(
        'notify.confirm_modal.add_post_success.success_description',
      )}</p>`,
      buttonSuccess: this.translate.instant('notify.confirm_modal.add_post_success.success_button'),
    });
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

    if (this.postId) {
      this.postsService.unlockPost(this.postId).subscribe();
      this.cancel.emit();
    }
    // else {
    //   this.eventBusService.next({
    //     type: EventType.AddPostButtonSubmit,
    //     payload: true,
    //   });
    // }
    this.backNavigation();
  }

  public backNavigation(): void {
    let urlString = this.router.url;
    if (this.checkRoutes('edit')) {
      urlString = urlString.replace('edit', 'view');
      const urlParts = urlString.split('?');
      const url = urlParts[0];
      let queryParams = {};
      if (urlParts[1]) {
        const params = new URLSearchParams(urlParts[1]);
        queryParams = { mode: params.get('mode'), page: params.get('page') };
      }
      this.router.navigate([url], { queryParams: queryParams });
    } else {
      this.router.navigate(['map']);
    }
  }
  public getTotalCategoryCount(options: any[]) {
    let length = options.length;
    options.forEach((parent) => {
      length = length + parent.children.length;
    });
    return length;
  }
  public toggleAllSelection(event: MatCheckboxChange, fields: any, fieldKey: string) {
    fields.map((field: any) => {
      if (field.key === fieldKey) {
        field.options.map((el: any) => {
          this.onCheckChange(event, field.key, el.id);
          if (el.children?.length) {
            el.children.map((child: any) => {
              this.onCheckChange(event, field.key, child.id);
            });
          }
        });
      }
    });
  }

  public onCheckChange(
    event: any,
    fieldKey: string,
    id: number,
    options?: any[],
    parentId?: number,
  ) {
    const formArray: FormArray = this.form.get(fieldKey) as FormArray;
    const isChecked = event.checked;

    if (isChecked) {
      const hasId = formArray.controls.some((control: any) => control.value === id);
      if (!hasId) formArray.push(new FormControl(id));

      if (parentId) {
        const hasParentId = formArray.controls.some((control: any) => control.value === parentId);
        if (!hasParentId) formArray.push(new FormControl(parentId));
      }

      if (!parentId && options) {
        const parent = options.find((option) => option.id === id);
        parent.children.forEach((child: any) => {
          const hasChildId = formArray.controls.some((control: any) => control.value === child.id);
          if (!hasChildId) formArray.push(new FormControl(child.id));
        });
      }
    } else {
      const index = formArray.controls.findIndex((ctrl: any) => ctrl.value === id);
      if (index > -1) formArray.removeAt(index);

      if (parentId && options) {
        const parent = options.find((option) => option.id === parentId);
        const isParentHasCheckedChild = parent.children.some((child: any) =>
          formArray.controls.some((control: any) => control.value === child.id),
        );
        if (!isParentHasCheckedChild) {
          const i = formArray.controls.findIndex((ctrl: any) => ctrl.value === parentId);
          if (i > -1) formArray.removeAt(i);
        }
      }

      if (!parentId && options) {
        const parent = options.find((option) => option.id === id);
        parent.children.forEach((child: any) => {
          const i = formArray.controls.findIndex((ctrl: any) => ctrl.value === child.id);
          if (i > -1) formArray.removeAt(i);
        });
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
      'source[]': this.relationConfigSource,
      orderby: 'post_date',
      q: this.relationSearch,
      'status[]': [],
    };
    this.isSearching = true;
    this.postsService.getPosts('', params).subscribe({
      next: (data) => {
        this.relatedPosts = data.results;
        this.isSearching = false;
      },
      error: () => (this.isSearching = false),
    });
  }

  public taskComplete({ id }: any, event: MatSlideToggleChange) {
    this.taskForm.patchValue({ [id]: event.checked });

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
    this.relationSearch = '';
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

  public generateSecurityTrustUrl(unsafeUrl: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
  }

  public clearField(event: any, key: string) {
    event.stopPropagation();
    this.form.patchValue({ [key]: null });
  }

  public isLocationRequired(field: any): boolean {
    return field?.required || false;
  }
}
