import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ConfirmModalService,
  EventBusService,
  EventType,
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
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent implements OnInit {
  public data: any;
  public fields: any[] = [];
  public form: FormGroup;
  public description: string;
  public title: string;
  private formId?: number;
  public tasksFormArray = new FormArray([]);
  public tasks: any[];
  public activeLanguage: string;
  public initialFormData: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public type: number,
    private matDialogRef: MatDialogRef<CreateComponent>,
    private route: ActivatedRoute,
    private surveysService: SurveysService,
    // private formBuilder: FormBuilder,
    private postsV5Service: PostsV5Service,
    private router: Router,
    private translate: TranslateService,
    private confirmModalService: ConfirmModalService,
    private eventBusService: EventBusService,
  ) {}

  ngOnInit(): void {
    this.formId = this.type;
    this.loadData(this.formId);
    // this.route.paramMap.subscribe((params) => {
    //   this.formId = Number(params.get('id'));
    //   this.loadData(this.formId);
    // });

    this.translate.onLangChange.subscribe((newLang) => {
      this.activeLanguage = newLang.lang;
    });
  }

  private loadData(id?: number | null) {
    if (!id) return;
    this.surveysService.getById(id).subscribe({
      next: (data) => {
        this.data = data;
        this.tasks = data.result.tasks;

        // const arr: [] = [];
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
                // this.addTaskFormGroup(
                //   field.key,
                //   value,
                //   field.required ? Validators.required : null,
                // );
                fields[field.key] = new FormControl(
                  value,
                  field.required ? Validators.required : null,
                );
              }
            });
        }
        this.form = new FormGroup(fields);
        console.log(this.form);
        console.log(this.form.value);
        this.initialFormData = this.form.value;
      },
    });
  }

  public getOptionsByParentId(field: any, parent_id: number): any[] {
    return field.options.filter((option: any) => option.parent_id === parent_id);
  }

  public async submitPost(): Promise<void> {
    console.log(this.form.value);
    // if (this.form.disabled) return;
    //
    // this.form.disable();
    //
    // const fields = this.fields.map((field) => {
    //   const value: any = {
    //     value: this.form.value[field.key],
    //   };
    //
    //   switch (field.input) {
    //     case 'date':
    //     case 'datetime':
    //       value.value_meta = {
    //         from_tz: dayjs.tz.guess(),
    //       };
    //       break;
    //     case 'location':
    //       value.value = {
    //         lat: this.form.value[field.key].lat,
    //         lon: this.form.value[field.key].lng,
    //       };
    //       break;
    //     case 'tags':
    //     case 'checkbox':
    //       value.value = this.form.value[field.key] || [];
    //       break;
    //   }
    //
    //   return {
    //     ...field,
    //     value,
    //   };
    // });
    //
    // const postData = {
    //   allowed_privileges: [
    //     'read',
    //     'create',
    //     'update',
    //     'delete',
    //     'search',
    //     'change_status',
    //     'read_full',
    //   ],
    //   base_language: 'en',
    //   completed_stages: [],
    //   content: this.description,
    //   description: '',
    //   enabled_languages: {},
    //   form_id: this.formId,
    //   locale: 'en_US',
    //   post_content: [
    //     {
    //       fields,
    //       description: null,
    //       form_id: this.formId,
    //       id: 2,
    //       label: 'Structure',
    //       priority: 0,
    //       required: false,
    //       show_when_published: true,
    //       task_is_internal_only: false,
    //       translations: [],
    //       type: 'post',
    //     },
    //   ],
    //   post_date: new Date().toISOString(),
    //   published_to: [],
    //   title: this.title,
    //   type: 'report',
    // };
    // this.postsV5Service.post(postData).subscribe({
    //   error: () => {
    //     this.form.enable();
    //   },
    //   complete: async () => {
    //     this.matDialogRef.close();
    //     this.form.enable();
    //     await this.confirmModalService.open({
    //       title: this.translate.instant('notify.confirm_modal.add_post_success.success'),
    //       description: `<p>${this.translate.instant(
    //         'notify.confirm_modal.add_post_success.success_description',
    //       )}</p>`,
    //       buttonSuccess: this.translate.instant(
    //         'notify.confirm_modal.add_post_success.success_button',
    //       ),
    //     });
    //   },
    // });
  }

  public onCheckChange(event: any, field: string) {
    const formArray: FormArray = this.form.get(field) as FormArray;

    if (event.checked) {
      formArray.push(new FormControl(event.source.value));
    } else {
      const index = formArray.controls.findIndex((ctrl: any) => ctrl.value === event.source.value);
      if (index > -1) {
        formArray.removeAt(index);
      }
    }
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

    this.matDialogRef.close();
    this.eventBusService.next({
      type: EventType.AddPostButtonSubmit,
      payload: true,
    });
  }

  toggleAllSelection(fieldKey: string) {
    console.log(this.form.controls[fieldKey].value.includes('all'));
    if (this.form.controls[fieldKey].value.includes('all')) {
      for (const task of this.tasks) {
        task.fields.map((field: any) => {
          if (field.key === fieldKey) {
            const ids = field.options.map((el: any) => el.id);
            this.form.controls[fieldKey].setValue(['all', ...ids]);
          }
        });
      }
    } else {
      this.form.controls[fieldKey].setValue([]);
    }
  }

  trackById(item: any): number {
    return item.id;
  }

  relationSearch() {
    console.log('relationSearch');
  }
}
