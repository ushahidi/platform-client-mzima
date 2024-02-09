import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable } from 'rxjs';
import { BreakpointService } from '@services';
import { Location } from '@angular/common';
import { PermissionsService, RolesService, RoleResult, generalHelpers } from '@mzima-client/sdk';
import { ConfirmModalService } from '../../../core/services/confirm-modal.service';

const PERMISSIONS = {
  EDIT_THEIR_OWN_POSTS: 'Edit Their Own Posts',
  DELETE_THEIR_OWN_POSTS: 'Delete Their Own Posts',
};

@UntilDestroy()
@Component({
  selector: 'app-role-item',
  templateUrl: './role-item.component.html',
  styleUrls: ['./role-item.component.scss'],
})
export class RoleItemComponent implements OnInit {
  private isDesktop$: Observable<boolean>;
  public permissionsList: any[] = [];
  public role: RoleResult;
  public isUpdate = false;
  public userRole: string;
  public form: FormGroup;
  public isDesktop = false;
  public formErrors: any[] = [];
  public isFormOnSubmit = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private rolesService: RolesService,
    private permissionsService: PermissionsService,
    private confirmModalService: ConfirmModalService,
    private translate: TranslateService,
    private breakpointService: BreakpointService,
    private location: Location,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(untilDestroyed(this));
    this.isDesktop$.subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
      },
    });
    this.form = this.fb.group({
      display_name: ['', [Validators.required]],
      description: [''],
      permissions: [[], [Validators.required]],
      id: [null],
      protected: [false],
    });
  }

  ngOnInit(): void {
    this.userRole = localStorage.getItem(`${generalHelpers.CONST.LOCAL_STORAGE_PREFIX}role`) || '';
    this.isUpdate = !!this.route.snapshot.paramMap.get('id');
    const roleId = this.route.snapshot.paramMap.get('id') || '';
    const role$ = this.rolesService.getRoleById(roleId);
    const permissions$ = this.permissionsService.getPermissions();
    combineLatest([role$, permissions$]).subscribe({
      next: ([role, permissions]) => {
        this.role = role.result;
        this.permissionsList = permissions.results.map((el: any) => {
          return {
            name: el.name,
            checked: false,
            test: el.name.replace(' ', '-').toLowerCase(),
          };
        });
        if (this.isUpdate) {
          this.fillInForm(this.role);

          for (const permission of this.role.permissions) {
            this.permissionsList.reduce((acc, el: any) => {
              return el.name === permission ? [...acc, (el.checked = true)] : [...acc, el];
            }, []);
          }
          this.changeDetectorRef.detectChanges();
        }
      },
      error: (err) => console.log(err),
    });
  }

  setName(event: string) {
    this.form.patchValue({ name: event.toLowerCase() });
  }

  private fillInForm(role: RoleResult) {
    this.form.patchValue({
      id: role.id,
      display_name: role.display_name,
      description: role.description,
      protected: role.protected,
      url: role.url,
      permissions: role.permissions,
    });
    this.changeDetectorRef.detectChanges();
  }

  public navigateToRoles(): void {
    if (this.isDesktop) {
      this.router.navigate(['settings/roles']);
    } else {
      this.location.back();
    }
  }

  public save(): void {
    this.isFormOnSubmit = true;
    const roleBody = {
      id: this.form.value.id,
      display_name: this.form.value.display_name,
      name: this.form.value.display_name, // name: same value as display_name only on initial role add
      description: this.form.value.description,
      permissions: this.form.value.permissions,
      protected: this.form.value.protected,
    };

    if (!this.isUpdate) {
      delete roleBody.id;
      this.rolesService.post(roleBody).subscribe({
        next: () => this.navigateToRoles(),
        error: ({ error }) => {
          this.formErrors = error.errors.failed_validations;
          this.isFormOnSubmit = false;
        },
      });
    } else {
      roleBody.name = this.role.name; // Use role name from API - We don't want to change name property along with display_name on edit/update
      this.rolesService.updateRole(this.role.id, this.form.value).subscribe({
        next: () => this.navigateToRoles(),
        error: ({ error }) => {
          this.formErrors = error.errors.failed_validations;
          this.isFormOnSubmit = false;
        },
      });
    }
  }

  public async deleteRole(): Promise<void> {
    const confirmed = await this.confirmModalService.open({
      title: this.translate.instant('role.are_you_sure_you_want_to_delete_role', {
        roleName: this.role.display_name,
      }),
      description: this.translate.instant('app.action_cannot_be_undone'),
    });
    if (!confirmed) return;
    await this.delete();
  }

  public async delete() {
    this.rolesService.deleteRole(this.role.id).subscribe({
      next: () => this.navigateToRoles(),
      error: (err) => console.log(err),
    });
  }

  public selectedItems(selectedPermissions: any) {
    if (selectedPermissions.includes(PERMISSIONS.DELETE_THEIR_OWN_POSTS)) {
      if (!selectedPermissions.find((el: string) => el === PERMISSIONS.EDIT_THEIR_OWN_POSTS)) {
        selectedPermissions.push(PERMISSIONS.EDIT_THEIR_OWN_POSTS);
        this.form.patchValue({ permissions: selectedPermissions });
      }
    }
  }
}
