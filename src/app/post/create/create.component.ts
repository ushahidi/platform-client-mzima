import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostsV5Service, SurveysService } from '@services';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
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

  constructor(
    private route: ActivatedRoute,
    private surveysService: SurveysService,
    private formBuilder: FormBuilder,
    private postsV5Service: PostsV5Service,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.formId = Number(params.get('id'));
      this.loadData(this.formId);
    });
  }

  private loadData(id?: number | null) {
    if (!id) return;
    this.surveysService.getById(id).subscribe({
      next: (data) => {
        this.data = data;
        const tmpFields = data.result.tasks[0].fields
          .sort((a: any, b: any) => a.priority - b.priority)
          .map((field: any) => {
            if (field.type === 'tags') {
              field.all_selected = false;
              field.options.map((option: any) => {
                return (option.value = false);
              });
            }
            return field;
          });

        this.fields = tmpFields;

        let fields: any = {};
        this.fields.map((field) => {
          if (field.type === 'title') {
            this.title = field.default;
          }
          if (field.type === 'description') {
            this.description = field.default;
          }

          if (field.key) {
            if (field.input !== 'tags') {
              const value =
                field.default ||
                (field.input === 'date'
                  ? new Date()
                  : field.input === 'location'
                  ? { lat: -1.28569, lng: 36.832324 }
                  : '');
              fields[field.key] = new FormControl(
                value,
                field.required ? Validators.required : null,
              );
            } else {
              fields[field.key] = new FormArray([]);
            }
          }
        });

        this.form = this.formBuilder.group(fields);
      },
    });
  }

  public getOptionsByParentId(field: any, parent_id: number): any[] {
    return field.options.filter((option: any) => option.parent_id === parent_id);
  }

  public checkGroupIsChecked(value: boolean, field: any, option: any): void {
    option.value = value;

    if (
      (value && field.options.find((o: any) => o.parent_id === option.parent_id && o.value)) ||
      (!value && !field.options.find((o: any) => o.parent_id === option.parent_id && o.value))
    ) {
      field.options.find((o: any) => o.id === option.parent_id).value = value;
    }
  }

  public selectAll(value: boolean, field: any): void {
    field.options.map((option: any) => {
      option.value = value;
    });
  }

  public submitPost(): void {
    if (this.form.disabled) return;

    this.form.disable();

    const fields = this.fields.map((field) => {
      const value: any = {
        value: this.form.value[field.key],
      };

      if (field.input === 'date' || field.input === 'datetime') {
        value.value_meta = {
          from_tz: dayjs.tz.guess(),
        };
      }

      if (field.input === 'location') {
        value.value = {
          lat: this.form.value[field.key].lat,
          lon: this.form.value[field.key].lng,
        };
      }

      return {
        ...field,
        value,
      };
    });

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
      completed_stages: [],
      content: this.description,
      description: '',
      enabled_languages: {},
      form_id: this.formId,
      locale: 'en_US',
      post_content: [
        {
          fields,
          description: null,
          form_id: this.formId,
          id: 2,
          label: 'Structure',
          priority: 0,
          required: false,
          show_when_published: true,
          task_is_internal_only: false,
          translations: [],
          type: 'post',
        },
      ],
      post_date: new Date().toISOString(),
      published_to: [],
      title: this.title,
      type: 'report',
    };

    this.postsV5Service.post(postData).subscribe({
      complete: () => {
        this.router.navigate(['data']);
        this.form.enable();
      },
    });
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
}
