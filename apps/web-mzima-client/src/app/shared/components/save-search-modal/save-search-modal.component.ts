import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AccountNotificationsInterface } from '@models';
import { GroupCheckboxItemInterface } from '../group-checkbox-select/group-checkbox-select.component';
import { formHelper } from '@helpers';
import { ConfirmModalService } from '../../../core/services/confirm-modal.service';
import {
  NotificationsService,
  RolesService,
  Savedsearch,
  SavedsearchesService,
} from '@mzima-client/sdk';

export interface SaveSearchModalData {
  search?: Savedsearch;
}

@Component({
  selector: 'app-save-search-modal',
  templateUrl: './save-search-modal.component.html',
  styleUrls: ['./save-search-modal.component.scss'],
})
export class SaveSearchModalComponent implements OnInit {
  public form: FormGroup;
  public roleOptions: GroupCheckboxItemInterface[] = [];
  private notification: AccountNotificationsInterface;
  formErrors: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private matDialogRef: MatDialogRef<SaveSearchModalComponent>,
    private formBuilder: FormBuilder,
    private rolesService: RolesService,
    private confirmModalService: ConfirmModalService,
    private savedsearchesService: SavedsearchesService,
    private translate: TranslateService,
    private notificationsService: NotificationsService,
  ) {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      category_visibility: ['everyone'],
      visible_to: [
        {
          value: 'everyone',
          options: [],
        },
      ],
      featured: [false],
      defaultViewingMode: ['map'],
      is_notifications_enabled: [false],
    });
  }

  ngOnInit(): void {
    this.rolesService.getRoles().subscribe({
      next: (response) => {
        this.roleOptions = [
          {
            name: 'Only me',
            value: 'only_me',
            // icon: 'person',
          },
          {
            name: this.translate.instant('role.everyone'),
            value: 'everyone',
            // icon: 'person',
          },
          {
            name: this.translate.instant('app.specific_roles'),
            value: 'specific',
            // icon: 'group',
            options: response.results.map((role) => {
              return {
                name: role.display_name,
                value: role.name,
                checked: role.name === 'admin',
                disabled: role.name === 'admin',
              };
            }),
          },
        ];

        if (this.data?.search) {
          this.form.patchValue({
            name: this.data.search.name,
            description: this.data.search.description,
            visible_to: this.data.search.featured
              ? { value: 'only_me', options: [] }
              : formHelper.mapRoleToVisible(this.data.search.role),
            featured: this.data.search.featured,
            defaultViewingMode: this.data.search.view,
          });
        }
      },
    });
    if (this.data.search) {
      this.notificationsService.get(String(this.data.search.id)).subscribe({
        next: (response) => {
          this.notification = response.results[0];
          this.form.patchValue({
            is_notifications_enabled: !!this.notification,
          });
        },
      });
    }
  }

  public cancel(): void {
    this.matDialogRef.close('cancel');
  }

  public formSubmit(): void {
    const filters: any = {};
    for (const key in this.data.activeFilters) {
      filters[key.replace(/\[\]/g, '')] = this.data.activeFilters[key];
    }

    const savedSearchParams = {
      filter: filters,
      name: this.form.value.name,
      description: this.form.value.description,
      featured: this.form.value.visible_to.value === 'only_me',
      role:
        this.form.value.visible_to.value === 'specific' ? this.form.value.visible_to.options : [],
      view: this.form.value.defaultViewingMode,
    };

    if (this.data?.search?.id) {
      this.savedsearchesService
        .update(this.data.search.id, {
          ...this.data.activeSavedSearch,
          ...savedSearchParams,
        })
        .subscribe({
          next: () => {
            this.matDialogRef.close(true);
          },
        });
    } else {
      this.savedsearchesService
        .post({
          ...savedSearchParams,
        })
        .subscribe({
          next: () => {
            this.matDialogRef.close(true);
          },
          error: (err) => {
            this.formErrors = err.error.errors.failed_validations;
          },
        });
    }
  }

  public async deleteSavedfilter(): Promise<void> {
    const confirmed = await this.confirmModalService.open({
      title: this.translate.instant('global_filter.delete_this_saved_filter'),
      description: `<p>${this.translate.instant('notify.default.proceed_warning')}</p>`,
    });

    if (!confirmed) return;

    this.matDialogRef.close('delete');
  }
}
