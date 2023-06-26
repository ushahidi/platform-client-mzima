import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { STORAGE_KEYS } from '@constants';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { distinctUntilChanged, lastValueFrom } from 'rxjs';
import {
  GeoJsonFilter,
  MediaService,
  PostContent,
  PostResult,
  PostsService,
  SurveysService,
} from '@mzima-client/sdk';
import { AlertService, SessionService } from '@services';
import { FormValidator, preparingVideoUrl } from '@validators';
import { DatabaseService } from '@services';
import { NetworkService } from '../../core/services/network.service';
import { ToastService } from '../../core/services/toast.service';
import { PostEditForm, UploadFileHelper } from '../helpers';

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import { objectHelpers, UTCHelper } from '@helpers';

dayjs.extend(timezone);

@UntilDestroy()
@Component({
  selector: 'app-post-edit',
  templateUrl: 'post-edit.page.html',
  styleUrls: ['post-edit.page.scss'],
})
export class PostEditPage {
  @Input() public postInput: any;
  @Output() cancel = new EventEmitter();
  @Output() updated = new EventEmitter();
  public date: string;
  public color: string;
  public form: FormGroup;
  private initialFormData: any;
  private relationConfigForm: any;
  private relationConfigSource: any;
  private relationConfigKey: string;
  private isSearching = false;
  public relatedPosts: PostResult[];
  public relationSearch: string;
  public selectedRelatedPost: any;
  private fieldsFormArray = ['tags'];
  public description: string;
  public title: string;
  private postId: number;
  private post: any;
  public tasks: any[] = [];
  private completeStages: number[] = [];
  public surveyName: string;
  public atLeastOneFieldHasValidationError: boolean;
  public locationRequired = false;
  public emptyLocation = false;
  public formValidator = new FormValidator();

  public filters: any;
  public surveyList: any[] = [];
  public surveyListOptions: any;
  public selectedSurveyId: number;
  public selectedSurvey: any;
  private fileToUpload: any;
  private checkedList: any[] = [];
  private isConnection = true;
  public connectionInfo = '';

  dateOption: any;

  constructor(
    private networkService: NetworkService,
    private toastService: ToastService,
    private alertService: AlertService,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private postsService: PostsService,
    private mediaService: MediaService,
    private surveysService: SurveysService,
    private sessionService: SessionService,
    private dataBaseService: DatabaseService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
  ) {
    this.networkService.networkStatus$
      .pipe(distinctUntilChanged(), untilDestroyed(this))
      .subscribe({
        next: (value) => {
          this.isConnection = value;
          this.connectionInfo = value
            ? ''
            : 'The connection was lost, the information will be saved to the database';
        },
      });
    this.filters = JSON.parse(
      localStorage.getItem(this.sessionService.getLocalStorageNameMapper('filters'))!,
    );
    this.route.paramMap.subscribe((params) => {
      if (params.get('id')) {
        this.postId = Number(params.get('id'));
        this.postsService.lockPost(this.postId).subscribe((p) => {
          console.log('Post locked: ', p);
        });
        this.loadPostData(this.postId);
      }
    });
  }

  async ionViewWillEnter() {
    this.transformSurveys();
  }

  private loadPostData(postId: number) {
    this.postsService.getById(postId).subscribe({
      next: (post) => {
        this.selectedSurveyId = post.form_id!;
        this.post = post;
        this.loadForm(post.post_content);
      },
    });
  }

  async transformSurveys() {
    this.surveyList = await this.dataBaseService.get(STORAGE_KEYS.SURVEYS);
    if (!this.surveyList?.length) this.getSurveys();
    this.surveyListOptions = this.surveyList.map((item: any) => {
      return {
        label: item.name,
        value: item.id,
      };
    });
  }

  clearData() {
    this.relatedPosts = [];
    this.fileToUpload = null;

    if (this.form?.controls) {
      for (const control in this.form.controls) {
        this.form.removeControl(control);
      }
    }
  }

  loadForm(updateContent?: PostContent[]) {
    if (!this.selectedSurveyId) return;
    this.clearData();

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
              date: UTCHelper.toUTC(dayjs()),
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

            if (field.type === 'point') {
              this.locationRequired = field.required;
              if (value.lat === '' || value.lng === '') this.emptyLocation = true;
            }
          }
        });
    }
    this.form = new FormGroup(fields);
    this.initialFormData = this.form.value;

    if (updateContent) {
      this.updateForm(updateContent);
    }
  }

  public changeLocation(data: any, formKey: string) {
    const { location, error } = data;
    const { lat, lng } = location;

    this.form.patchValue({ [formKey]: { lat: lat, lng: lng } });

    this.emptyLocation = error;
    this.cdr.detectChanges();
  }

  setCalendar(event: any, key: any, type: 'date' | 'dateTime' = 'date') {
    const template = type === 'dateTime' ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
    this.form.patchValue({ [key]: UTCHelper.toUTC(event.detail.value, template) });
  }

  getSurveys() {
    this.surveysService
      .getSurveys('', {
        page: 1,
        order: 'asc',
        limit: 0,
      })
      .subscribe({
        next: (response) => {
          this.dataBaseService.set(STORAGE_KEYS.SURVEYS, response.results);
          this.transformSurveys();
        },
        error: (err) => {
          this.transformSurveys();
          console.log(err);
        },
      });
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

    const inputHandlers: { [key in InputHandlerType]: (key: string, value: any) => void } = {
      tags: this.handleTags.bind(this),
      checkbox: this.handleCheckbox.bind(this),
      location: this.handleLocation.bind(this),
      date: this.handleDate.bind(this),
      datetime: this.handleDate.bind(this),
      radio: this.handleDefault.bind(this),
      text: this.handleDefault.bind(this),
      upload: this.handleUpload.bind(this),
      video: this.handleDefault.bind(this),
      textarea: this.handleDefault.bind(this),
      relation: this.handleDefault.bind(this),
      number: this.handleDefault.bind(this),
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
          caption: response.caption,
          photo: response.original_file_url,
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

  private handleCheckbox(key: string, value: any) {
    const data = value?.value;
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
    this.form.patchValue({ [key]: value?.value ? new Date(value?.value) : null });
  }

  private handleTitle(key: string) {
    this.form.patchValue({ [key]: this.post.title });
  }

  private handleDescription(key: string) {
    this.form.patchValue({ [key]: this.post.content ? this.post.content : '' });
  }

  async preparationData(): Promise<any> {
    const fieldHandlers = {
      date: (value: any) =>
        value
          ? {
              value: UTCHelper.toUTC(value),
              value_meta: { from_tz: dayjs.tz.guess() },
            }
          : { value: null },
      datetime: (value: any) =>
        value
          ? {
              value: UTCHelper.toUTC(value, 'YYYY-MM-DD HH:mm'),
              value_meta: { from_tz: dayjs.tz.guess() },
            }
          : { value: null },
      location: (value: any) =>
        value && value.lat ? { value: { lat: value.lat, lon: value.lng } } : { value: null },
      video: (value: any) => (value ? { value: preparingVideoUrl(value) } : {}),
    };

    for (const task of this.tasks) {
      task.fields = await Promise.all(
        task.fields.map(async (field: { key: string | number; input: string; type: string }) => {
          const fieldValue: any = this.form.value[field.key];
          let value: any = { value: fieldValue };

          if (field.type === 'title') this.title = fieldValue;
          if (field.type === 'description') this.description = fieldValue;

          if (fieldHandlers.hasOwnProperty(field.input)) {
            value = fieldHandlers[field.input as keyof typeof fieldHandlers](fieldValue);
          } else if (field.input === 'upload') {
            if (this.form.value[field.key]?.upload && this.form.value[field.key]?.photo) {
              this.fileToUpload = {
                ...this.form.value[field.key]?.photo,
                caption: this.form.value[field.key]?.caption,
                upload: this.form.value[field.key]?.upload,
              };
            } else if (this.form.value[field.key]?.delete && this.form.value[field.key]?.id) {
              this.fileToUpload = {
                fileId: this.form.value[field.key]?.id,
                delete: this.form.value[field.key]?.delete,
              };
            } else {
              value.value = this.form.value[field.key]?.id || null;
            }
          } else {
            value.value = this.form.value[field.key] || null;
          }

          return {
            ...field,
            value,
          };
        }),
      );
    }
  }

  /**
   * Checking post information and preparing data
   */
  public async submitPost(): Promise<void> {
    if (this.form.disabled) return;
    // this.form.disable();

    try {
      await this.preparationData();
    } catch (error: any) {
      this.toastService.presentToast({
        message: error,
        duration: 3000,
      });
      console.log(error);
      return;
    }

    const postData: any = {
      base_language: 'en',
      completed_stages: this.completeStages,
      content: this.description,
      description: '',
      enabled_languages: {},
      form_id: this.selectedSurveyId,
      locale: 'en_US',
      post_content: this.tasks,
      post_date: new Date().toISOString(),
      published_to: [],
      title: this.title,
      type: 'report',
    };

    if (this.fileToUpload) postData.file = this.fileToUpload;

    if (!this.form.valid) this.form.markAllAsTouched();

    this.preventSubmitIncaseTheresNoBackendValidation();

    if (this.postId) postData.post_date = this.post.post_date || new Date().toISOString();

    await this.offlineStore(postData);

    // TODO: Remove after testing
    console.log('postData', postData);

    if (this.isConnection) await this.uploadPost();
  }

  /**
   * Storing created post to indexedb
   */
  async offlineStore(postData: any) {
    const pendingPosts: any[] =
      (await this.dataBaseService.get(STORAGE_KEYS.PENDING_POST_KEY)) || [];
    pendingPosts.push(postData);
    await this.dataBaseService.set(STORAGE_KEYS.PENDING_POST_KEY, pendingPosts);
  }

  /**
   * Upload created post from indexedb
   */
  async uploadPost() {
    const pendingPosts: any[] = await this.dataBaseService.get(STORAGE_KEYS.PENDING_POST_KEY);
    for (let postData of pendingPosts) {
      if (postData?.file?.upload) {
        postData = await new UploadFileHelper(this.mediaService).uploadFile(
          postData,
          postData.file,
        );
      }

      if (postData?.file?.delete) {
        postData = await this.deleteFile(postData, postData.file);
      }

      if (this.postId) {
        this.updatePost(this.postId, postData);
      } else {
        if (!this.atLeastOneFieldHasValidationError) {
          this.createPost(postData);
        }
      }
    }
    await this.dataBaseService.set(STORAGE_KEYS.PENDING_POST_KEY, []);
  }

  async deleteFile(postData: any, { fileId }: any) {
    try {
      const deleteObservable = this.mediaService.delete(fileId);
      await lastValueFrom(deleteObservable);

      for (const content of postData.post_content) {
        for (const field of content.fields) {
          if (field.input === 'upload') {
            field.value.value = null;
          }
        }
      }

      delete postData.file;
      return postData;
    } catch (error: any) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  }

  /** Update post */
  private updatePost(postId: number, postData: any) {
    this.postsService.update(postId, postData).subscribe({
      error: () => this.form.enable(),
      complete: async () => {
        await this.postComplete();
        this.backNavigation();
        // this.updated.emit();
      },
    });
  }

  /** Create post */
  private createPost(postData: any) {
    this.postsService.post(postData).subscribe({
      error: () => this.form.enable(),
      complete: async () => {
        await this.postComplete();
        this.backNavigation();
      },
    });
  }

  async postComplete() {
    await this.alertService.presentAlert({
      header: 'Success!',
      message:
        'Thank you for submitting your report. The post is being reviewed by our team and soon will appear on the platform.',
      buttons: [
        {
          text: 'OK',
          role: 'confirm',
        },
      ],
    });
  }

  public async previousPage() {
    for (const key in this.initialFormData) {
      this.initialFormData[key] = this.initialFormData[key]?.value || null;
    }
    if (!objectHelpers.objectsCompare(this.initialFormData, this.form.value)) {
      const result = await this.alertService.presentAlert({
        header: 'Success!',
        message:
          'Thank you for submitting your report. The post is being reviewed by our team and soon will appear on the platform.',
      });
      if (result.role !== 'confirm') return;
    }

    if (!this.postInput) {
      this.backNavigation();
      // this.eventBusService.next({
      //   type: EventType.AddPostButtonSubmit,
      //   payload: true,
      // });
    } else {
      this.cancel.emit();
    }
  }

  public backNavigation(): void {
    this.router.navigate(['/']);
  }

  public preventSubmitIncaseTheresNoBackendValidation() {
    /** Extra check to prevent form submission beforehand
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

  public taskComplete({ id }: any, event: any) {
    if (event.checked) {
      this.completeStages.push(id);
    } else {
      const index = this.completeStages.indexOf(id);
      if (index >= 0) {
        this.completeStages.splice(index, 1);
      }
    }
  }

  public toggleAllSelection(checked: any, field: any, fieldKey: string) {
    if (field.key === fieldKey) {
      field.options.map((el: any) => {
        this.onCheckChange(checked, field.key, el.id);
      });
    }
  }

  public onCheckChange(
    checked: boolean,
    fieldKey: string,
    id: number,
    options?: any[],
    parentId?: number,
  ) {
    const formArray: FormArray = this.form.get(fieldKey) as FormArray;

    if (checked) {
      const hasId = formArray.controls.some((control: any) => control.value === id);
      if (!hasId) formArray.push(new FormControl(id));

      if (parentId) {
        const hasParentId = formArray.controls.some((control: any) => control.value === parentId);
        if (!hasParentId) formArray.push(new FormControl(parentId));
      }

      if (!parentId && options) {
        const children = options.filter((option) => option.parent_id === id);
        children.forEach((child) => {
          const hasChildId = formArray.controls.some((control: any) => control.value === child.id);
          if (!hasChildId) formArray.push(new FormControl(child.id));
        });
      }
    } else {
      const index = formArray.controls.findIndex((ctrl: any) => ctrl.value === id);
      if (index > -1) formArray.removeAt(index);

      if (parentId && options) {
        const children = options.filter((option: any) => option.parent_id === parentId);
        const isParentHasCheckedChild = children.some((child) =>
          formArray.controls.some((control: any) => control.value === child.id),
        );
        if (!isParentHasCheckedChild) {
          const i = formArray.controls.findIndex((ctrl: any) => ctrl.value === parentId);
          if (i > -1) formArray.removeAt(i);
        }
      }

      if (!parentId && options) {
        const children = options.filter((option) => option.parent_id === id);
        children.forEach((child) => {
          const i = formArray.controls.findIndex((ctrl: any) => ctrl.value === child.id);
          if (i > -1) formArray.removeAt(i);
        });
      }
    }
  }

  public chooseRelatedPost(event: any, { key }: any, { id, title }: any) {
    if (!event) return;
    this.form.patchValue({ [key]: id });
    this.selectedRelatedPost = { id, title };
    this.relatedPosts = [];
    this.relationSearch = '';
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

  public changeSelectionFields(checked: boolean, fieldKey: string, item: any) {
    if (checked) {
      this.checkedList = this.form.controls[fieldKey].value || [];
      this.checkedList.push(item);
      this.form.patchValue({ [fieldKey]: this.checkedList });
    } else {
      this.checkedList = this.form.controls[fieldKey].value;
      const index = this.checkedList.indexOf(item);
      if (index >= 0) {
        this.checkedList.splice(index, 1);
        this.form.patchValue({ [fieldKey]: this.checkedList });
      }
    }
  }
}
