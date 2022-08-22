import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { RoleResult } from '@models';
import { PermissionsService, RolesService } from '@services';
import { DialogComponent } from '../../../shared/components';

@Component({
  selector: 'app-role-item',
  templateUrl: './role-item.component.html',
  styleUrls: ['./role-item.component.scss'],
})
export class RoleItemComponent implements OnInit {
  public permissionsList: any[] = [];
  public role: RoleResult;

  public form: FormGroup = this.fb.group({
    display_name: ['', [Validators.required]],
    description: [''],
    permissions: this.fb.array([]),
    allowed_privileges: this.fb.array([]),
    id: ['', [Validators.required]],
    name: ['', [Validators.required]],
    protected: ['', [Validators.required]],
    url: ['', [Validators.required]],
  });

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private rolesService: RolesService,
    private permissionsService: PermissionsService,
  ) {}

  ngOnInit(): void {
    const roleId = this.route.snapshot.paramMap.get('id') || '';
    const role$ = this.rolesService.getById(roleId);
    const permissions$ = this.permissionsService.get();
    combineLatest([role$, permissions$]).subscribe({
      next: ([role, permissions]) => {
        this.role = role;
        this.permissionsList = permissions.results.map((el: any) => {
          return {
            name: el.name,
            checked: false,
          };
        });
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
      },
      error: (err) => console.log(err),
    });
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

  public openDialog(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '480px',
      data: {
        title: this.role.display_name + ' role will be deleted!',
        body: '<p>This action cannot be undone.</p><p>Are you sure?</p>',
      },
    });

    dialogRef.afterClosed().subscribe({
      next: (response) => {
        if (response?.confirm) {
          this.delete();
        }
      },
    });
  }

  public cancel(): void {
    this.router.navigate(['settings/roles']);
  }

  public save(): void {
    console.log(this.role.id, this.form.value);
    // this.rolesService.update(this.role.id, this.form.value).subscribe({
    //   next: (response) => console.log(response),
    //   error: (err) => console.log(err),
    // });
  }

  public delete() {
    console.log('delete');
    // this.rolesService.delete(this.role.id).subscribe({
    //   next: (response) => console.log(response),
    //   error: (err) => console.log(err),
    // });
  }
}
