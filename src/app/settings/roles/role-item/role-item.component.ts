import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CONST } from '@constants';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest } from 'rxjs';
import { RoleResult } from '@models';
import {
  PermissionsService,
  RolesService,
  ConfirmModalService,
  BreakpointService,
} from '@services';
import { Location } from '@angular/common';

@Component({
  selector: 'app-role-item',
  templateUrl: './role-item.component.html',
  styleUrls: ['./role-item.component.scss'],
})
export class RoleItemComponent implements OnInit {
  public permissionsList: any[] = [];
  public role: RoleResult;
  public roles: RoleResult[];
  public isUpdate = false;
  public userRole: string;

  public form: FormGroup = this.fb.group({
    display_name: ['', [Validators.required]],
    description: [''],
    permissions: this.fb.array([], [Validators.required]),
    allowed_privileges: this.fb.array([]),
    id: [0],
    name: ['', [Validators.required]],
    protected: [false],
    url: [''],
  });
  public isDesktop = false;

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
  ) {
    this.breakpointService.isDesktop.subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
      },
    });
  }

  ngOnInit(): void {
    this.userRole = localStorage.getItem(`${CONST.LOCAL_STORAGE_PREFIX}role`) || '';
    this.isUpdate = !!this.route.snapshot.paramMap.get('id');
    const roleId = this.route.snapshot.paramMap.get('id') || '';
    const roles$ = this.rolesService.get();
    const role$ = this.rolesService.getById(roleId);
    const permissions$ = this.permissionsService.get();
    combineLatest([role$, permissions$, roles$]).subscribe({
      next: ([role, permissions, roles]) => {
        this.roles = roles.results;
        this.role = role;
        this.permissionsList = permissions.results.map((el: any) => {
          const nameTranslateText = el.name.replaceAll(' ', '_').toLowerCase();
          return {
            name: this.translate.instant(`settings.roles.${nameTranslateText}`),
            checked: false,
            test: el.name.replace(' ', '-').toLowerCase(),
          };
        });
        if (this.isUpdate) {
          this.fillInForm(role);

          for (const privileges of role.allowed_privileges) {
            this.addData(privileges, this.privilegesControl);
          }

          for (const permission of role.permissions) {
            this.addData(permission, this.permissionsControl);

            this.permissionsList.reduce((acc, el: any) => {
              return el.name === permission ? [...acc, (el.checked = true)] : [...acc, el];
            }, []);
          }
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
      name: role.name,
      protected: role.protected,
      url: role.url,
    });
  }

  private addData(value: string, collections: FormArray) {
    if (!collections.value.includes(value)) {
      collections.push(this.fb.control(value));
    }
  }

  private get permissionsControl() {
    return this.form.controls['permissions'] as FormArray;
  }

  private get privilegesControl() {
    return this.form.controls['allowed_privileges'] as FormArray;
  }

  public onCheckChange(event: any, field: string) {
    const formArray: FormArray = this.form.get(field) as FormArray;
    if (event.checked) {
      formArray.push(new FormControl(event.source.value));
    } else {
      let i: number = 0;
      formArray.controls.forEach((ctrl: any) => {
        if (ctrl.value == event.source.value) {
          formArray.removeAt(i);
          return;
        }
        i++;
      });
    }
  }

  public navigateToRoles(): void {
    if (this.isDesktop) {
      this.router.navigate(['settings/roles']);
    } else {
      this.location.back();
    }
  }

  public save(): void {
    const roleBody = {
      id: this.form.value.id,
      name: this.form.value.name,
      display_name: this.form.value.display_name,
      description: this.form.value.description,
      permissions: this.form.value.permissions,
      protected: this.form.value.protected,
    };

    if (!this.isUpdate) {
      delete roleBody.id;
      this.rolesService.post(roleBody).subscribe({
        next: () => this.navigateToRoles(),
        error: (err) => console.log(err),
      });
    } else {
      this.rolesService.update(this.role.id, this.form.value).subscribe({
        next: () => this.navigateToRoles(),
        error: (err) => console.log(err),
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
    this.rolesService.delete(this.role.id).subscribe({
      next: () => this.navigateToRoles(),
      error: (err) => console.log(err),
    });
  }
}
