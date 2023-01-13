import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { GeoJsonFilter, PostResult } from '@models';
import {
  ConfirmModalService,
  EventBusService,
  EventType,
  PostsService,
  PostsV5Service,
  SurveysService,
} from '@services';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { TranslateService } from '@ngx-translate/core';
import { objectHelpers } from '@helpers';

dayjs.extend(utc);
dayjs.extend(timezone);

@Component({
  selector: 'app-post-item',
  templateUrl: './post-item.component.html',
  styleUrls: ['./post-item.component.scss'],
})
export class PostItemComponent implements OnInit {
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

  constructor(
    private route: ActivatedRoute,
    private surveysService: SurveysService,
    private formBuilder: FormBuilder,
    private postsV5Service: PostsV5Service,
    private postsService: PostsService,
    private router: Router,
    private translate: TranslateService,
    private confirmModalService: ConfirmModalService,
    private eventBusService: EventBusService,
    private location: Location,
  ) {}

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

  // TODO: For edit post. Need update backend response
  private loadPostData(postId: number) {
    this.postsV5Service.getById(postId).subscribe({
      next: (post) => {
        this.formId = post.form_id;
        // this.loadData(this.typeId, post);
      },
    });
  }

  private loadData(id?: number | null) {
    if (!id) return;
    this.surveysService.getById(id).subscribe({
      next: (data) => {
        this.data = data;
        this.tasks = data.result.tasks;
        this.surveyName = data.result.name;

        let fields: any = {};
        for (const task of this.tasks) {
          task.fields
            .sort((a: any, b: any) => a.priority - b.priority)
            .map((field: any) => {
              if (field.type === 'title') {
                this.title = field.default;
              }
              if (field.type === 'description') {
                this.description = field.default;
              }
              if (field.type === 'relation') {
                this.relationConfigForm = field.config.input.form;
                this.relationConfigKey = field.key;
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
      },
    });
  }

  private addFormArray(value: string, field: any) {
    return this.formBuilder.array(
      [] || [new FormControl(value)],
      field.required ? Validators.required : null,
    );
  }

  private addFormControl(value: string, field: any) {
    return new FormControl(value, field.required ? Validators.required : null);
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

          // if (field.type === 'title') this.title = this.form.value[field.key]; // title is ngModel standalone
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
      allowed_privileges: [
        'read',
        'create',
        'update',
        'delete',
        'search',
        'change_status',
        'read_full',
      ],
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

    this.postsV5Service.post(postData).subscribe({
      error: () => {
        this.form.enable();
      },
      complete: async () => {
        this.form.enable();
        await this.confirmModalService.open({
          title: this.translate.instant('notify.confirm_modal.add_post_success.success'),
          description: `<p>${this.translate.instant(
            'notify.confirm_modal.add_post_success.success_description',
          )}</p>`,
          buttonSuccess: this.translate.instant(
            'notify.confirm_modal.add_post_success.success_button',
          ),
        });
        this.backNavigation();
      },
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

    this.backNavigation();
    this.eventBusService.next({
      type: EventType.AddPostButtonSubmit,
      payload: true,
    });
  }

  public backNavigation(): void {
    this.location.back();
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
    this.postsService.getPosts('', params).subscribe({
      next: (data) => {
        console.log(this.relatedPosts);
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
