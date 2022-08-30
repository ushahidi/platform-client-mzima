import { Component, EventEmitter, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RoleResult, CategoryInterface } from '@models';
import { CategoriesService, LanguageService, RolesService } from '@services';

@Component({
  selector: 'app-create-category-form',
  templateUrl: './create-category-form.component.html',
  styleUrls: ['./create-category-form.component.scss'],
})
export class CreateCategoryFormComponent {
  @Output() formSubmit = new EventEmitter<any>();
  public categories: CategoryInterface[];
  public roles: RoleResult[];
  public languages = this.languageService.getLanguages();
  public activeLanguage = this.languages.find((lang) => lang.code === 'en')?.name;

  public form: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    description: [''],
    is_child_to: [''],
    language: ['en'],
    category_visibility: ['everyone'],
    visible_to: this.fb.array(['1']),
  });

  constructor(
    private fb: FormBuilder,
    private categoriesService: CategoriesService,
    private rolesService: RolesService,
    private languageService: LanguageService,
  ) {
    this.categoriesService.get().subscribe({
      next: (data) => {
        this.categories = data.results.filter((cat: CategoryInterface) => !cat.parent_id);
      },
    });

    this.rolesService.get().subscribe({
      next: (data) => {
        this.roles = data.results;
      },
    });

    this.form.valueChanges.subscribe({
      next: (data) => {
        this.activeLanguage = this.languages.find((lang) => lang.code === data.language)?.name;
      },
    });
  }

  public submit(): void {
    if (this.form.invalid) return;
    console.log(this.form.value);
    this.formSubmit.emit(this.form.value);
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

  public addTranslation(): void {
    console.log('addTranslation');
  }
}
