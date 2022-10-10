import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CategoryInterface, TranslationInterface, LanguageInterface } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { CategoriesService, LanguageService, RolesService, ConfirmModalService } from '@services';
import {
  GroupCheckboxItemInterface,
  SelectLanguagesModalComponent,
} from 'src/app/shared/components';

@Component({
  selector: 'app-create-category-form',
  templateUrl: './create-category-form.component.html',
  styleUrls: ['./create-category-form.component.scss'],
})
export class CreateCategoryFormComponent implements OnInit {
  @Input() public loading: boolean;
  @Input() public category: CategoryInterface;
  @Output() formSubmit = new EventEmitter<any>();
  public categories: CategoryInterface[];
  public languages: LanguageInterface[] = this.languageService.getLanguages();
  public defaultLanguage?: LanguageInterface = this.languages.find((lang) => lang.code === 'en');
  public activeLanguages: LanguageInterface[] = [];
  public selectedTranslation?: string;
  public roleOptions: GroupCheckboxItemInterface[] = [];

  public form: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    description: [''],
    is_child_to: [''],
    language: ['en'],
    visible_to: [
      {
        value: 'everyone',
        options: ['admin'],
      },
    ],
    translations: this.fb.array<TranslationInterface>([]),
    translate_name: [''],
    translate_description: [''],
    parent: [],
  });

  constructor(
    private fb: FormBuilder,
    private categoriesService: CategoriesService,
    private rolesService: RolesService,
    private languageService: LanguageService,
    private dialog: MatDialog,
    private confirmModalService: ConfirmModalService,
    private translate: TranslateService,
  ) {
    this.categoriesService.get().subscribe({
      next: (data) => {
        this.categories = data.results.filter((cat: CategoryInterface) => !cat.parent_id);
      },
    });

    this.rolesService.get().subscribe({
      next: (response) => {
        this.roleOptions = [
          {
            name: this.translate.instant('role.everyone'),
            value: 'everyone',
            icon: 'person',
          },
          {
            name: this.translate.instant('app.specific_roles'),
            value: 'specific',
            icon: 'group',
            options: response.results.map((role) => {
              return {
                name: role.display_name,
                value: role.name,
                checked: role.name === 'admin',
                disabled: role.name === 'admin',
              };
            }),
          },
        ];
      },
    });

    this.form.valueChanges.subscribe({
      next: (data) => {
        if (!!this.activeLanguages.find((language) => language.code === data.language)) {
          this.activeLanguages = [];
        }
        if (this.defaultLanguage?.code !== data.language) {
          this.defaultLanguage = this.languages.find((lang) => lang.code === data.language);
          this.selectedTranslation = this.defaultLanguage?.code;
          this.form.value.translations = this.form.value.translations.filter(
            (trans: TranslationInterface) => trans.id !== this.defaultLanguage?.code,
          );
        }

        if (this.selectedTranslation && this.selectedTranslation !== this.defaultLanguage?.code) {
          const translation = this.form.value.translations.find(
            (trans: TranslationInterface) => trans.id === this.selectedTranslation,
          );
          if (!translation) {
            this.form.value.translations.push({
              id: this.selectedTranslation,
              name: data.translate_name,
              description: data.translate_description,
            });
          } else {
            translation.name = data.translate_name;
            translation.description = data.translate_description;
          }
        }
      },
    });
  }

  ngOnInit(): void {
    if (this.category) {
      this.form.patchValue({
        name: this.category.tag,
        description: this.category.description,
        language: this.category.enabled_languages.default,
      });

      if (this.category?.role?.length && this.category?.role?.length > 1) {
        this.form.controls['category_visibility'].setValue('specific');
        this.form.setControl('visible_to', this.fb.array(this.category.role));
      }

      if (this.category?.translations) {
        const translations: TranslationInterface[] = Object.keys(this.category?.translations).map(
          (key) => {
            return { id: key, ...this.category.translations[key] };
          },
        );
        this.activeLanguages = this.languages.filter((language) =>
          translations.find((trans) => trans.id === language.code),
        );
        this.form.setControl('translations', this.fb.array(translations));
      }
    }
  }

  public isRoleActive(roleName: string): boolean {
    return !!this.category.role && this.category.role.indexOf(roleName) > -1;
  }

  public submit(): void {
    if (this.form.invalid) return;
    const category = {
      base_language: this.form.value.language,
      color: '',
      description: this.form.value.description,
      enabled_languages: {
        default: this.form.value.language,
        available: [],
      },
      icon: 'tag',
      parent: this.form.value.parent,
      parent_id: this.form.value.is_child_to || null,
      parent_id_original: this.form.value.is_child_to || null,
      role:
        this.form.value.visible_to.value === 'specific'
          ? this.form.value.visible_to.options
          : ['admin'],
      slug: this.form.value.name,
      tag: this.form.value.name,
      translations: this.form.value.translations.reduce(
        (acc: { name: string; description: string }, curr: TranslationInterface) => ({
          ...acc,
          [curr.id]: { name: curr.name, description: curr.description },
        }),
        {},
      ),
      type: 'category',
    };
    this.formSubmit.emit(category);
  }

  public addTranslation(): void {
    const dialogRef = this.dialog.open(SelectLanguagesModalComponent, {
      width: '100%',
      maxWidth: 480,
      data: {
        languages: this.languages,
        activeLanguages: [this.defaultLanguage, ...this.activeLanguages],
      },
    });

    dialogRef.afterClosed().subscribe({
      next: (result: string[]) => {
        if (!result) return;
        result.map((langCode) => {
          const language = this.languages.find((lang) => lang.code === langCode);
          if (this.activeLanguages.find((lang) => lang.code === langCode) || !language) return;
          this.activeLanguages.push(language);
        });
      },
    });
  }

  public chooseTranslation(languageCode?: string): void {
    this.selectedTranslation = languageCode;

    const translation: TranslationInterface = this.form.controls['translations'].value.find(
      (trans: TranslationInterface) => trans.id === languageCode,
    );
    if (translation) {
      this.form.patchValue({
        translate_name: translation.name,
        translate_description: translation.description,
      });
    } else {
      this.form.controls['translate_name'].reset();
      this.form.controls['translate_description'].reset();
    }
  }

  public async deleteTranslation(event: Event, languageCode?: string): Promise<void> {
    event.stopPropagation();
    const confirmed = await this.confirmModalService.open({
      title: 'Are you sure you want to remove this language and all the translations?',
      description: `<p>${this.translate.instant('notify.default.proceed_warning')}</p>`,
    });
    if (!confirmed) return;

    if (this.selectedTranslation === languageCode) {
      this.selectedTranslation = this.defaultLanguage?.code;
    }

    this.activeLanguages.splice(
      this.activeLanguages.findIndex((lang) => lang.code === languageCode),
      1,
    );

    this.form.value.translations = this.form.value.translations.filter(
      (trans: TranslationInterface) => trans.id !== languageCode,
    );
  }

  public parentChanged(event: any): void {
    const parentCategory = this.categories.find((category) => category.id === event.value);
    const visibleTo = parentCategory ? parentCategory?.role || [] : ['admin'];
    this.form.setControl('visible_to', this.fb.array(visibleTo));
    this.form.controls['parent'].setValue(parentCategory);
  }
}
