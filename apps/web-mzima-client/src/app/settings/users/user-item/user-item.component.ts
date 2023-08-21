import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import {
  RolesService,
  RoleResult,
  UsersService,
  UserInterface,
  generalHelpers,
} from '@mzima-client/sdk';
import { ConfirmModalService } from '../../../core/services/confirm-modal.service';
import { BreakpointService } from '@services';
import { regexHelper } from '@helpers';

@UntilDestroy()
@Component({
  selector: 'app-user-item',
  templateUrl: './user-item.component.html',
  styleUrls: ['./user-item.component.scss'],
})
export class UserItemComponent implements OnInit {
  private isDesktop$: Observable<boolean>;
  public isUpdate = false;
  public roles: RoleResult[];
  public form: FormGroup;
  public isMyProfile = false;
  public isDesktop = false;
  public createUserErrors: any[] = [];
  public submitted = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private userService: UsersService,
    private rolesService: RolesService,
    private translate: TranslateService,
    private confirmModalService: ConfirmModalService,
    private breakpointService: BreakpointService,
    private location: Location,
  ) {
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(untilDestroyed(this));
    this.isDesktop$.subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
      },
    });

    this.form = this.fb.group({
      id: [0],
      realname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern(regexHelper.emailValidate())]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(generalHelpers.CONST.MIN_PASSWORD_LENGTH),
          Validators.maxLength(generalHelpers.CONST.MAX_PASSWORD_LENGTH),
        ],
      ],
      role: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.getRoles();
    const userId = this.route.snapshot.paramMap.get('id') || '';
    this.isUpdate = !!userId;
    if (userId) this.getUserInformation(userId);
  }

  private getUserInformation(userId: string) {
    this.userService.getUserById(userId).subscribe({
      next: (response) => {
        const { result } = response;
        this.fillInForm(result);
        this.form.controls['password'].removeValidators([
          Validators.required,
          Validators.minLength(generalHelpers.CONST.MIN_PASSWORD_LENGTH),
          Validators.maxLength(generalHelpers.CONST.MAX_PASSWORD_LENGTH),
        ]);
        this.form.controls['password'].updateValueAndValidity();
        this.isMyProfile =
          this.form.value.email ===
          localStorage.getItem(`${generalHelpers.CONST.LOCAL_STORAGE_PREFIX}email`);
      },
      error: (err) => console.log(err),
    });
  }

  private getRoles() {
    this.rolesService.getRoles().subscribe({
      next: (response) => {
        this.roles = response.results;
      },
      error: (err) => console.log(err),
    });
  }

  private fillInForm(user: UserInterface) {
    this.form.patchValue({
      id: user.id,
      realname: user.realname,
      email: user.email,
      role: user.role,
    });
  }

  public save() {
    this.submitted = true;
    const roleBody = {
      id: this.form.value.id,
      realname: this.form.value.realname,
      email: this.form.value.email,
      password: this.form.value.password,
      role: this.form.value.role,
    };
    !this.isUpdate ? this.createUser(roleBody) : this.updateUser(roleBody);
  }

  private createUser(roleBody: any) {
    delete roleBody.id;
    this.form.disable();
    this.userService.createUser(roleBody).subscribe({
      next: () => {
        this.navigateToUsers();
        this.form.enable();
      },
      error: ({ error }) => {
        this.createUserErrors = error.errors.failed_validations;
        this.form.enable();
        this.submitted = false;
      },
    });
  }

  private updateUser(roleBody: any) {
    if (!this.form.value.password) delete roleBody.password;
    this.form.disable();
    this.userService.updateUserById(roleBody.id, roleBody).subscribe({
      next: () => {
        this.navigateToUsers();
        this.form.enable();
      },
      error: ({ error }) => {
        this.createUserErrors = error.errors.failed_validations;
        this.form.enable();
        this.submitted = false;
      },
    });
  }

  navigateToUsers() {
    this.location.back();
  }

  public async deleteUser(): Promise<void> {
    const confirmed = await this.confirmModalService.open({
      title: this.translate.instant('notify.user.are_you_sure_you_want_to_delete_user', {
        username: this.form.value.realname,
      }),
      description: this.translate.instant('app.action_cannot_be_undone'),
      confirmButtonText: this.translate.instant('app.yes_delete'),
      cancelButtonText: this.translate.instant('app.no_go_back'),
    });
    if (!confirmed) return;
    await this.delete();
  }

  public async delete() {
    this.userService.deleteUser(this.form.value.id).subscribe({
      next: () => this.navigateToUsers(),
      error: (err) => console.log(err),
    });
  }
}
