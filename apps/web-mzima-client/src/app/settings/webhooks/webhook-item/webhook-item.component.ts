import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { regexHelper, takeUntilDestroy$ } from '@helpers';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { BreakpointService, ConfirmModalService } from '@services';
import {
  FormsService,
  SurveysService,
  WebhooksService,
  FormAttributeInterface,
  SurveyItem,
  WebhookResultInterface,
} from '@mzima-client/sdk';
import { Observable } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-webhook-item',
  templateUrl: './webhook-item.component.html',
  styleUrls: ['./webhook-item.component.scss'],
})
export class WebhookItemComponent implements OnInit {
  private isDesktop$: Observable<boolean>;
  private webhook: WebhookResultInterface;
  public form: FormGroup;
  public eventList = [
    { name: 'Create', value: 'create' },
    { name: 'Update', value: 'update' },
  ];
  public entityList = [{ name: 'Post', value: 'post' }];
  public surveyList: SurveyItem[] = [];
  public surveyAttributesList: FormAttributeInterface[] = [];
  private controlFormIdData$: Observable<any>;
  public isCreateWebhook = false;
  public fields: any[];
  public isDesktop = false;
  public submitted = false;

  constructor(
    private route: ActivatedRoute,
    private webhooksService: WebhooksService,
    private formBuilder: FormBuilder,
    private surveysService: SurveysService,
    private formsService: FormsService,
    private router: Router,
    private confirmModalService: ConfirmModalService,
    private translate: TranslateService,
    private breakpointService: BreakpointService,
    private location: Location,
  ) {
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(untilDestroyed(this));
    this.isDesktop$.subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
      },
    });
    this.form = this.formBuilder.group({
      allowed_privileges: [''],
      created: [''],
      destination_field_key: [null],
      entity_type: ['', [Validators.required]],
      event_type: ['', [Validators.required]],
      form_id: [null],
      id: [0],
      name: ['', [Validators.required]],
      shared_secret: ['', [Validators.required, Validators.minLength(20)]],
      source_field_key: [null],
      updated: [''],
      url: ['', [Validators.required, Validators.pattern(regexHelper.urlValidate())]],
      user: [''],
      webhook_uuid: [''],
      is_source_destination: [false],
    });
    this.controlFormIdData$ = this.form.controls['form_id'].valueChanges.pipe(takeUntilDestroy$());
  }

  ngOnInit(): void {
    this.getSurveys();
    const webhookId = this.route.snapshot.paramMap.get('id');
    if (webhookId === 'create') {
      this.isCreateWebhook = true;
    } else {
      this.getWebhook(webhookId!);
    }

    if (this.form.controls['form_id'].value)
      this.getSurveyAttributes(this.form.controls['form_id'].value);

    this.controlFormIdData$.subscribe({
      next: (surveyId) => {
        if (surveyId) this.getSurveyAttributes(surveyId);
      },
      error: (err) => console.log(err),
    });
  }

  private getWebhook(id: string) {
    this.webhooksService.getById(id).subscribe({
      next: (webhook) => {
        this.webhook = webhook.result;
        this.fillInForm(webhook.result);
      },
      error: (err) => console.log(err),
    });
  }

  private fillInForm(data: any): void {
    Object.keys(data).forEach((name) => {
      if (this.form.controls[name]) {
        this.form.controls[name].patchValue(data[name]);
      }
    });
    this.form.controls['is_source_destination'].patchValue(!!this.form.controls['form_id'].value);
  }

  private getSurveys(): void {
    this.surveysService.get().subscribe({
      next: (response) => {
        this.surveyList = response.results;
        this.fields = [
          {
            name: 'Source',
            control: 'source_field_key',
          },
          {
            name: this.translate.instant('settings.webhooks.destination'),
            control: 'destination_field_key',
          },
        ];
      },
      error: (err) => console.log(err),
    });
  }

  private getSurveyAttributes(id: number): void {
    this.formsService.getAttributes(id.toString()).subscribe({
      next: (response) => {
        this.surveyAttributesList = response;
        this.fillInForm({
          destination_field_key: this.checkKeyFields(this.webhook?.destination_field_key!),
          source_field_key: this.checkKeyFields(this.webhook?.source_field_key!),
        });
      },
      error: (err) => console.log(err),
    });
  }

  private checkKeyFields(field: string): any {
    if (field === 'title' || field === 'content') {
      return this.filterAttributes('type', field === 'title' ? field : 'description')?.key;
    } else if (field) {
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
    this.submitted = true;
    if (this.form.value.is_source_destination) {
      this.fillInForm({
        destination_field_key: this.fillForApi(
          this.filterAttributes('key', this.form.controls['destination_field_key'].value),
        ),
        source_field_key: this.fillForApi(
          this.filterAttributes('key', this.form.controls['source_field_key'].value),
        ),
      });
    }
    this.deleteFormFields(['is_source_destination']);
    this.isCreateWebhook ? this.postWebhook() : this.updateWebhook();
  }

  private postWebhook() {
    this.deleteFormFields(['id', 'created', 'updated', 'allowed_privileges', 'user']);
    this.webhooksService.post(this.form.value).subscribe({
      next: () => this.navigateToWebhooks(),
      error: (err) => {
        console.log(err);
        this.submitted = false;
      },
    });
  }

  private updateWebhook() {
    this.webhooksService.update(this.form.controls['id'].value, this.form.value).subscribe({
      next: () => this.navigateToWebhooks(),
      error: (err) => {
        console.log(err);
        this.submitted = false;
      },
    });
  }

  public cancel() {
    this.navigateToWebhooks();
  }

  private navigateToWebhooks() {
    this.webhooksService.setState(true);
    if (this.isDesktop) {
      this.router.navigate(['/settings/webhooks']);
    } else {
      this.location.back();
    }
  }

  private deleteFormFields(fields: Array<string>) {
    for (const field of fields) {
      delete this.form.value[field];
    }
  }

  public async openDialog(): Promise<void> {
    const confirmed = await this.confirmModalService.open({
      title: this.translate.instant('webhook.dialog.delete_warn_title', {
        name: this.form.controls['name'].value,
      }),
      description: this.translate.instant('webhook.dialog.delete_warn_message'),
    });

    if (!confirmed) return;
    this.deleteWebhook();
  }

  public deleteWebhook() {
    this.webhooksService.delete(this.form.controls['id'].value).subscribe({
      next: () => this.navigateToWebhooks(),
      error: (err) => console.log(err),
    });
  }

  public getSurveyName(id: number): string {
    return this.surveyList.find((survey) => survey.id === id)?.name || '';
  }
}
