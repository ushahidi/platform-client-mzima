import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { formHelper } from '@helpers';
import { AccountNotificationsInterface, NotificationTypeEnum } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { ConfirmModalService } from '../../../core/services/confirm-modal.service';
import {
  ContactsService,
  NotificationsService,
  CollectionsService,
  SavedsearchesService,
  ContactsInterface,
  UsersService,
  UserDataInterface,
  UserInterface,
} from '@mzima-client/sdk';

enum AccountTypeEnum {
  Email = 'email',
  Phone = 'phone',
}

interface AccountTypeInterface {
  name: string;
  value: AccountTypeEnum;
}

@Component({
  selector: 'app-account-settings-modal',
  templateUrl: './account-settings-modal.component.html',
  styleUrls: ['./account-settings-modal.component.scss'],
})
export class AccountSettingsModalComponent implements OnInit {
  public profile: UserInterface;
  public contacts: ContactsInterface[];
  public isUpdatingPassword = false;
  public selectedTabIndex = 0;
  public isLoading: boolean;
  public isContactsChanged: boolean;
  public isAddAccountFormOpen: boolean;
  public matcher = new formHelper.FormErrorStateMatcher();
  public accountTypes: AccountTypeInterface[] = [
    {
      name: 'Email',
      value: AccountTypeEnum.Email,
    },
    {
      name: 'Phone',
      value: AccountTypeEnum.Phone,
    },
  ];
  public profileForm: FormGroup;
  public addAccountForm: FormGroup;
  public notifications: AccountNotificationsInterface[] = [];
  NotificationTypeEnum = NotificationTypeEnum;

  private checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    if (!group) return null;
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    if (confirmPass) {
      return pass === confirmPass ? null : { notSame: true };
    }
    return null;
  };

  constructor(
    private usersService: UsersService,
    private contactsService: ContactsService,
    private formBuilder: FormBuilder,
    private confirmModalService: ConfirmModalService,
    private notificationsService: NotificationsService,
    private collectionsService: CollectionsService,
    private translate: TranslateService,
    private matDialogRef: MatDialogRef<AccountSettingsModalComponent>,
    private _snackBar: MatSnackBar,
    private savedsearchesService: SavedsearchesService,
  ) {
    this.profileForm = this.formBuilder.group(
      {
        role: [''],
        display_name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: [''],
        confirmPassword: [''],
      },
      { validators: this.checkPasswords },
    );

    this.addAccountForm = this.formBuilder.group({
      type: ['email', [Validators.required]],
      name: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.getTabInformation();
  }

  private getProfile(): void {
    this.usersService.getCurrentUser().subscribe({
      next: (response) => {
        const { result } = response;
        this.profile = result;

        this.profileForm.patchValue({
          role: this.profile.role,
          display_name: this.profile.realname,
          email: this.profile.email,
        });

        this.profileForm.markAsPristine();
        this.isLoading = false;
      },
    });
  }

  private getContacts(): void {
    this.isContactsChanged = false;
    this.contactsService
      .get({
        user: 'me',
      })
      .subscribe({
        next: (response) => {
          this.contacts = response.results;
          this.isLoading = false;
        },
      });
  }

  public updateProfile(): void {
    if (this.profileForm.invalid) return;

    let options: UserDataInterface = {
      realname: this.profileForm.value.display_name,
      email: this.profileForm.value.email,
    };
    if (this.isUpdatingPassword) {
      options = {
        ...options,
        password: this.profileForm.value.password,
      };
    }

    this.profileForm.disable();
    this.usersService.updateCurrentUser(options).subscribe({
      next: () => {
        this.getProfile();
        this.profileForm.controls['password'].setValue('');
        this.profileForm.controls['confirmPassword'].setValue('');
        this.updatePassword(false);
        this.profileForm.enable();
        this.closeModal();
      },
    });
  }

  public updateContacts(): void {
    forkJoin(
      this.contacts.map((contact) =>
        this.contactsService.update(contact.id, {
          contact: contact.contact,
          can_notify: contact.can_notify,
        }),
      ),
    ).subscribe({
      complete: () => {
        this.getContacts();
        this.closeModal();
      },
    });
  }

  public updatePassword(isOpen: boolean): void {
    this.isUpdatingPassword = isOpen;

    if (this.isUpdatingPassword) {
      this.setFieldsValidators(
        [this.profileForm.controls['password'], this.profileForm.controls['confirmPassword']],
        [Validators.required, Validators.minLength(8), Validators.maxLength(64)],
      );
    } else {
      this.setFieldsValidators(
        [this.profileForm.controls['password'], this.profileForm.controls['confirmPassword']],
        [],
      );
      this.profileForm.patchValue({ password: '', confirmPassword: '' });
    }
  }

  private setFieldsValidators(controls: AbstractControl[], validators: ValidatorFn[]): void {
    controls.map((control) => {
      control.setValidators(validators);
      control.updateValueAndValidity();
    });
  }

  public getTabInformation(): void {
    this.isLoading = true;
    switch (this.selectedTabIndex) {
      case 0:
        this.getProfile();
        break;

      case 1:
        this.getContacts();
        this.getNotifications();
        break;
    }
  }

  public applyChanges(): void {
    switch (this.selectedTabIndex) {
      case 0:
        this.updateProfile();
        break;

      case 1:
        this.updateContacts();
        break;
    }
  }

  public async deleteContact(id: number): Promise<void> {
    const confirmed = await this.confirmModalService.open({
      title: this.translate.instant('user.are_you_sure_you_want_to_delete_this_account'),
      description: this.translate.instant('notify.default.proceed_warning'),
    });
    if (!confirmed) return;

    this.contactsService.delete(id).subscribe({
      next: () => {
        this.getContacts();
      },
    });
  }

  public addAccount(): void {
    if (this.addAccountForm.invalid) return;

    this.addAccountForm.disable();
    this.contactsService
      .post({
        active: true,
        can_notify: true,
        contact: this.addAccountForm.value.name,
        type: this.addAccountForm.value.type,
      })
      .subscribe({
        next: () => {
          this.getContacts();
          this.addAccountForm.reset();
          this.addAccountForm.markAsPristine();
          this.addAccountForm.enable();
        },
      });
  }

  private closeModal(): void {
    this.matDialogRef.close();
  }

  public accountFormatChanged(event: MatRadioChange): void {
    const value: AccountTypeEnum = event.value;

    const actions = {
      [AccountTypeEnum.Email]: () => [Validators.required, Validators.email],
      [AccountTypeEnum.Phone]: () => [Validators.required, Validators.pattern('[- +()0-9]{13}')],
    };

    if (actions[value]) {
      const validators = actions[value]();
      this.setFieldsValidators([this.addAccountForm.controls['name']], validators);
    }
  }

  private getNotifications(): void {
    this.notificationsService.get().subscribe({
      next: (response) => {
        this.notifications = response.results;

        this.notifications.map((notification) => {
          this.collectionsService.getById(String(notification.set.id)).subscribe({
            next: (res) => {
              this.applyNotificationName(
                res.result.id,
                res.result.name,
                NotificationTypeEnum.Collection,
              );
            },
            error: () => {
              this.savedsearchesService.getById(String(notification.set.id)).subscribe({
                next: (res) => {
                  this.applyNotificationName(
                    res.result.id!,
                    res.result.name!,
                    NotificationTypeEnum.SavedSearch,
                  );
                },
              });
            },
          });
        });
      },
    });
  }

  private applyNotificationName(
    notificationId: number,
    name: string,
    type: NotificationTypeEnum,
  ): void {
    const notification = this.notifications.find((n) => n.set.id === notificationId);
    if (notification) {
      notification.type = type;
      notification.set.name = name;
    }
  }

  public async deleteNotification(id: string): Promise<void> {
    const confirmed = await this.confirmModalService.open({
      title: this.translate.instant(
        'notification.are_you_sure_you_want_to_remove_this_notification',
      ),
      description: this.translate.instant('notify.default.proceed_warning'),
    });
    if (!confirmed) return;

    this.notificationsService.delete(id).subscribe({
      next: async () => {
        this.getNotifications();

        await this._snackBar.open(
          this.translate.instant('notification.removed'),
          this.translate.instant('message.button.default'),
        );
      },
    });
  }

  public filteredNotifications(type: NotificationTypeEnum): AccountNotificationsInterface[] {
    return this.notifications.filter((notification) => notification.type === type);
  }
}
