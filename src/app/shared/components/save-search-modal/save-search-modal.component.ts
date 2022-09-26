import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RoleResult } from '@models';
import { RolesService } from '@services';

@Component({
  selector: 'app-save-search-modal',
  templateUrl: './save-search-modal.component.html',
  styleUrls: ['./save-search-modal.component.scss'],
})
export class SaveSearchModalComponent {
  public form: FormGroup = this.formBuilder.group({
    name: ['', Validators.required],
    description: [''],
    category_visibility: ['everyone'],
    visible_to: this.formBuilder.array<string>(['admin']),
    featured: [false],
    defaultViewingMode: ['map'],
  });
  public roles: RoleResult[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private matDialogRef: MatDialogRef<SaveSearchModalComponent>,
    private formBuilder: FormBuilder,
    private rolesService: RolesService,
  ) {
    this.rolesService.get().subscribe({
      next: (response) => {
        this.roles = response.results;
      },
    });
  }

  public cancel(): void {
    this.matDialogRef.close('cancel');
  }

  public formSubmit(): void {
    this.matDialogRef.close(this.form.value);
  }

  public onCheckChange(event: MatCheckboxChange, field: string) {
    const formArray: FormArray = this.form.get(field) as FormArray;
    if (event.checked) {
      formArray.push(new FormControl(event.source.value));
    } else {
      const index = formArray.controls.findIndex((ctrl: any) => ctrl.value == event.source.value);
      if (index) {
        formArray.removeAt(index);
      }
    }
  }
}
