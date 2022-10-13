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
import { formHelper } from '@helpers';
import { ContactsInterface, UserDataInterface, UserInterface } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { UsersService, ContactsService, ConfirmModalService } from '@services';
import { forkJoin } from 'rxjs';

enum AccountTypeEnum {
  Email = 'email',
  Phone = 'phone',
}

interface AccountTypeInterface {
  name: string;
  value: AccountTypeEnum;
}

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss'],
})
export class AccountSettingsComponent implements OnInit {
  public profile: UserInterface;
  public contacts: ContactsInterface[];
  public isUpdatingPassword = false;
  public selectedTabIndex = 0;
  public isLoading: boolean;
  public isContactsChanged: boolean;
  public isAddAccountFormOpen: boolean;
  public isContactsOnUpdate: boolean;
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

  private checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    if (!group) return null;
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { notSame: true };
  };

  public profileForm: FormGroup = this.formBuilder.group(
    {
      role: [''],
      display_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(8)]],
      confirmPassword: ['', [Validators.minLength(8)]],
    },
    { validators: this.checkPasswords },
  );

  public addAccountForm: FormGroup = this.formBuilder.group({
    type: ['email', [Validators.required]],
    name: ['', [Validators.required, Validators.email]],
  });

  constructor(
    private usersService: UsersService,
    private contactsService: ContactsService,
    private formBuilder: FormBuilder,
    private confirmModalService: ConfirmModalService,
    private translate: TranslateService,
    private matDialogRef: MatDialogRef<AccountSettingsComponent>,
  ) {}

  ngOnInit(): void {
    this.getTabInformation();
  }

  public matcher = new formHelper.FormErrorStateMatcher();

  private getProfile(): void {
    this.usersService.getCurrentUser().subscribe({
      next: (profile) => {
        this.profile = profile;

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
      },
    });
  }

  public updateContacts(): void {
    this.isContactsOnUpdate = true;
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
        this.isContactsOnUpdate = false;
        this.closeModal();
      },
    });
  }

  public updatePassword(isOpen: boolean): void {
    this.isUpdatingPassword = isOpen;

    if (this.isUpdatingPassword) {
      this.setFieldsValidators(
        [this.profileForm.controls['password'], this.profileForm.controls['confirmPassword']],
        [Validators.required, Validators.minLength(8)],
      );
    } else {
      this.setFieldsValidators(
        [this.profileForm.controls['password'], this.profileForm.controls['confirmPassword']],
        [Validators.minLength(8)],
      );
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
      title: 'Are you sure you want to delete this account?',
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
}
