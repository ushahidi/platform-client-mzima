import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CONST } from '@constants';
import { RoleResult, UserInterface } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmModalService, RolesService, UsersService } from '@services';

@Component({
  selector: 'app-user-item',
  templateUrl: './user-item.component.html',
  styleUrls: ['./user-item.component.scss'],
})
export class UserItemComponent implements OnInit {
  public isChangePassword = false;
  public isUpdate = false;
  public roles: RoleResult[];
  public form: FormGroup = this.fb.group({
    id: [0],
    realname: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(7)]],
    role: ['', [Validators.required]],
  });
  public isMyProfile = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private userService: UsersService,
    private rolesService: RolesService,
    private translate: TranslateService,
    private confirm: ConfirmModalService,
  ) {}

  ngOnInit(): void {
    this.getRoles();
    const userId = this.route.snapshot.paramMap.get('id') || '';
    this.isUpdate = !!userId;
    if (userId) this.getUserInformation(userId);
  }

  private getUserInformation(userId: string) {
    this.userService.getUserById(userId).subscribe({
      next: (response) => {
        this.fillInForm(response);
        this.form.controls['password'].removeValidators([
          Validators.required,
          Validators.minLength(7),
        ]);
        this.form.controls['password'].updateValueAndValidity();
        this.isMyProfile =
          this.form.value.email === localStorage.getItem(`${CONST.LOCAL_STORAGE_PREFIX}email`);
      },
      error: (err) => console.log(err),
    });
  }

  private getRoles() {
    this.rolesService.get().subscribe({
      next: (response) => {
        this.roles = response.results;
        this.form.patchValue({ role: this.roles.find((el) => el.name === 'user')?.name });
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
    this.userService.createUser(roleBody).subscribe({
      next: () => this.navigateToUsers(),
      error: (err) => console.log(err),
    });
  }

  private updateUser(roleBody: any) {
    if (!this.form.value.password) delete roleBody.password;
    this.userService.updateUserById(roleBody.id, roleBody).subscribe({
      next: () => this.navigateToUsers(),
      error: (err) => console.log(err),
    });
  }

  navigateToUsers() {
    this.router.navigate(['settings/users']);
  }

  public async deleteUser(): Promise<void> {
    const confirmed = await this.openConfirmModal(
      this.translate.instant('notify.user.are_you_sure_you_want_to_delete_user', {
        username: this.form.value.realname,
      }),
      this.translate.instant('app.action_cannot_be_undone'),
    );
    if (!confirmed) return;
    await this.delete();
  }

  public async delete() {
    this.userService.deleteUser(this.form.value.id).subscribe({
      next: () => this.navigateToUsers(),
      error: (err) => console.log(err),
    });
  }

  private async openConfirmModal(title: string, description: string): Promise<boolean> {
    return this.confirm.open({
      title: this.translate.instant(title),
      description: this.translate.instant(description),
      confirmButtonText: this.translate.instant('app.yes_delete'),
      cancelButtonText: this.translate.instant('app.no_go_back'),
    });
  }
}
