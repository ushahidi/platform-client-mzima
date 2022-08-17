import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PermissionResult, RoleResult } from '@models';
import { PermissionsService, RolesService } from '@services';

@Component({
  selector: 'app-role-item',
  templateUrl: './role-item.component.html',
  styleUrls: ['./role-item.component.scss'],
})
export class RoleItemComponent implements OnInit {
  private data: RoleResult;
  public form: FormGroup;
  private permissions: PermissionResult;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private rolesService: RolesService,
    private permissionsService: PermissionsService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe({
      next: (params) => {
        this.getRoleById(Number(params['id']));
      },
    });
    this.getPermissions();
    this.initForm();
  }

  getRoleById(id: number) {
    this.rolesService.getById(id).subscribe({
      next: (response) => {
        this.data = response;
        console.log(this.data);
      },
      error: (err) => console.log(err),
    });
  }

  getPermissions() {
    this.permissionsService.get().subscribe({
      next: (response) => (this.permissions = response),
      error: (err) => console.log(err),
    });
  }

  initForm() {
    this.form = this.formBuilder.group({
      display_name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      permissions: this.formBuilder.array([]),
      allowed_privileges: ['', [Validators.required]],
      id: ['', [Validators.required]],
      name: ['', [Validators.required]],
      protected: ['', [Validators.required]],
      url: ['', [Validators.required]],
    });
  }

  get permissionsValue() {
    return this.form.controls['permissions'] as FormArray;
  }

  cancel(): void {}

  save(): void {}

  getErrorMessage(field: string) {
    return field;
  }
}
