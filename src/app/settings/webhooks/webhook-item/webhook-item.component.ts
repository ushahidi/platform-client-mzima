import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { takeUntilDestroy$ } from '@helpers';
import { SurveyItem, SurveyItemTaskField, WebhookResultInterface } from '@models';
import { SurveysService, WebhooksService } from '@services';
import { switchMap } from 'rxjs';
import { ApiFormsService } from '@services';

@Component({
  selector: 'app-webhook-item',
  templateUrl: './webhook-item.component.html',
  styleUrls: ['./webhook-item.component.scss'],
})
export class WebhookItemComponent implements OnInit {
  private webhook: WebhookResultInterface;
  public form: FormGroup = this.formBuilder.group({
    allowed_privileges: ['', [Validators.required]],
    created: ['', [Validators.required]],
    destination_field_key: [null],
    entity_type: ['', [Validators.required]],
    event_type: ['', [Validators.required]],
    form_id: [0],
    id: [0, [Validators.required]],
    name: ['', [Validators.required]],
    shared_secret: ['', [Validators.required]],
    source_field_key: [null],
    updated: [''],
    url: ['', [Validators.required]],
    user: ['', [Validators.required]],
    webhook_uuid: ['', [Validators.required]],
    is_source_destination: [false],
  });
  public eventList = [
    { name: 'Create', value: 'create' },
    { name: 'Update', value: 'update' },
  ];
  public entityList = [{ name: 'Post', value: 'post' }];
  public surveyList: SurveyItem[] = [];
  public surveyAttributesList: SurveyItemTaskField[] = [];
  private controlFormIdData$ = this.form.controls['form_id'].valueChanges.pipe(takeUntilDestroy$());

  constructor(
    private route: ActivatedRoute,
    private webhooksService: WebhooksService,
    private formBuilder: FormBuilder,
    private surveysService: SurveysService,
    private apiFormsService: ApiFormsService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getSurveys();
    this.route.paramMap
      .pipe(switchMap((params: ParamMap) => this.webhooksService.getById(params.get('id') || 1)))
      .subscribe({
        next: (response: WebhookResultInterface) => {
          this.webhook = response;
          this.fillInForm(response);
        },
      });

    if (this.form.controls['form_id'].value)
      this.getSurveyAttributes(this.form.controls['form_id'].value);

    this.controlFormIdData$.subscribe({
      next: (surveyId) => {
        if (surveyId) this.getSurveyAttributes(surveyId);
      },
    });
  }

  private fillInForm(data: WebhookResultInterface): void {
    this.form.patchValue({
      allowed_privileges: data.allowed_privileges,
      created: data.created,
      entity_type: data.entity_type,
      event_type: data.event_type,
      form_id: data?.form_id,
      id: data.id,
      name: data.name,
      shared_secret: data.shared_secret,
      updated: data.updated,
      url: data.url,
      user: data.user,
      webhook_uuid: data.webhook_uuid,
      is_source_destination: !!data.destination_field_key,
    });
  }

  private getSurveys(): void {
    this.surveysService.get().subscribe({
      next: (response) => (this.surveyList = response.results),
    });
  }

  private getSurveyAttributes(id: number): void {
    const queryParams = {
      order: 'asc',
      orderby: 'priority',
    };
    this.apiFormsService.getFormSurveyAttributes(id, queryParams).subscribe({
      next: (response) => {
        this.surveyAttributesList = response.results;
        this.form.patchValue({
          destination_field_key: this.checkKeyFields(this.webhook?.destination_field_key || ''),
          source_field_key: this.checkKeyFields(this.webhook?.source_field_key || ''),
        });
      },
    });
  }

  private checkKeyFields(field: string): any {
    if (field === 'title' || field === 'content') {
      return this.filterAttributes('type', field === 'title' ? field : 'description')?.key;
    } else {
      return field.replace(/values./gi, '');
    }
  }

  private filterAttributes(param: string, value: string) {
    return this.surveyAttributesList.find((el: any) => el[param] === value);
  }

  private fillForApi(obj: any): string {
    if (obj.type === 'title' || obj.type === 'description') {
      return obj.type === 'title' ? obj.type : 'content';
    } else {
      return `values.${obj.key}`;
    }
  }

  public save() {
    if (this.form.value.is_source_destination) {
      this.form.patchValue({
        destination_field_key: this.fillForApi(
          this.filterAttributes('key', this.form.controls['destination_field_key'].value),
        ),
        source_field_key: this.fillForApi(
          this.filterAttributes('key', this.form.controls['source_field_key'].value),
        ),
      });
    }
    delete this.form.value.is_source_destination;
    this.webhooksService.update(this.form.controls['id'].value, this.form.value).subscribe({
      next: () => this.router.navigate(['/settings/webhooks']),
    });
  }

  public cancel() {
    this.router.navigate(['/settings/webhooks']);
  }
}
