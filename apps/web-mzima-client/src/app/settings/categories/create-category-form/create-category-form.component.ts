import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CONST } from '@constants';
import { TranslationInterface, LanguageInterface } from '@models';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import {
  GroupCheckboxItemInterface,
  SelectLanguagesModalComponent,
} from '../../../shared/components';
import { LanguageService } from '../../../core/services/language.service';
import { CategoriesService, RolesService, CategoryInterface } from '@mzima-client/sdk';
import { ConfirmModalService } from '../../../core/services/confirm-modal.service';
import { BreakpointService } from '@services';

@UntilDestroy()
@Component({
  selector: 'app-create-category-form',
  templateUrl: './create-category-form.component.html',
  styleUrls: ['./create-category-form.component.scss'],
})
export class CreateCategoryFormComponent implements OnInit {
  @Input() public loading: boolean;
  @Input() public category: CategoryInterface;
  @Output() formSubmit = new EventEmitter<any>();
  @Output() deleteCall = new EventEmitter<any>();
  public categories: CategoryInterface[];
  public languages: LanguageInterface[];
  public defaultLanguage?: LanguageInterface;
  public activeLanguages: LanguageInterface[] = [];
  public selectedTranslation?: string;
  public roleOptions: GroupCheckboxItemInterface[] = [];
  public isUpdate = false;
  public isDesktop = false;
  public form: FormGroup;
  private userRole: string;

  constructor(
    private fb: FormBuilder,
    private categoriesService: CategoriesService,
    private rolesService: RolesService,
    private languageService: LanguageService,
    private dialog: MatDialog,
    private confirmModalService: ConfirmModalService,
    private translate: TranslateService,
    private breakpointService: BreakpointService,
    private router: Router,
    private location: Location,
  ) {
    this.languages = this.languageService.getLanguages();
    this.defaultLanguage = this.languages.find((lang) => lang.code === 'en');
    this.breakpointService.isDesktop$.pipe(untilDestroyed(this)).subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
      },
    });
  }

  private updateRole() {
    let value = '';
    if (this.category?.role) {
      if (this.category?.role?.length === 1) {
        value = 'onlyme';
      }
      if (this.category?.role?.length > 1) {
        value = 'specific';
      }
    } else {
      value = 'everyone';
    }

    this.updateForm('visible_to', {
      value,
      options: this.category.role,
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    this.formSubscribe();
    this.getCategories();
    this.getRoles();
    this.userRole = localStorage.getItem(`${CONST.LOCAL_STORAGE_PREFIX}role`)!;
    if (this.category) {
      this.isUpdate = !!this.category;
      this.form.patchValue({
        id: this.category.id,
        name: this.category.tag,
        description: this.category.description,
        language: this.category.enabled_languages.default,
        is_child_to: this.category.parent?.id || null,
      });

      this.updateRole();

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
    this.activeLanguages.push(this.defaultLanguage!);
  }

  private initializeForm() {
    this.form = this.fb.group({
      id: [''],
      name: ['', [Validators.required]],
      description: [''],
      is_child_to: [''],
      language: ['en'],
      visible_to: [],
      translations: this.fb.array<TranslationInterface>([]),
      translate_name: [''],
      translate_description: [''],
      parent: [],
    });
  }

  private formSubscribe() {
    this.form.valueChanges.pipe(untilDestroyed(this)).subscribe({
      next: (data) => {
        // if (!!this.activeLanguages.find((language) => language.code === data.language)) {
        //   this.activeLanguages = [];
        // }
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

  private getCategories() {
    this.categoriesService.get().subscribe({
      next: (data) => {
        this.categories = data.results.filter((cat: CategoryInterface) => !cat.parent_id);
      },
    });
  }

  private capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  private getRoles() {
    this.rolesService.getRoles().subscribe({
      next: (response) => {
        this.roleOptions = [
          {
            name: this.translate.instant('role.only_me'),
            value: 'onlyme',
            icon: 'person',
            options: [
              {
                name: this.capitalize(this.userRole),
                value: this.userRole,
                checked: true,
              },
            ],
          },
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

        this.roleOptions.forEach((option) => {
          switch (option.value) {
            case 'onlyme':
              if (this.category.role?.length === 1 && this.category.role.includes(this.userRole)) {
                option.checked = true;
              }
              break;
            case 'specific':
              if (this.category.role?.length! > 1) {
                option.checked = true;
              }
              break;
            case 'everyone':
              if (!this.category.role) {
                option.checked = true;
              }
          }
          if (option?.options) {
            option.options.forEach((subOption) => {
              if (this.category.role) {
                subOption.checked = this.category.role.includes(subOption.value as string);
              } else if (subOption.value === 'admin') {
                subOption.checked = true;
              } else {
                subOption.checked = false;
              }
            });
          }
        });
      },
    });
  }

  private updateForm(field: string, value: any) {
    this.form.patchValue({ [field]: value });
  }

  public isRoleActive(roleName: string): boolean {
    return !!this.category.role && this.category.role.indexOf(roleName) > -1;
  }

  public submit(): void {
    // console.log(this.form.value);
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
        this.form.value.visible_to.value === 'everyone' ? null : this.form.value.visible_to.options,
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
      maxWidth: 576,
      panelClass: 'modal',
      data: {
        languages: this.languages,
        activeLanguages: this.activeLanguages,
        defaultLanguage: this.defaultLanguage,
      },
    });

    dialogRef.afterClosed().subscribe({
      next: (result: LanguageInterface[]) => {
        if (!result) return;
        const defaultIndex = result.indexOf(this.defaultLanguage!);
        result.splice(defaultIndex, 1);
        this.activeLanguages = [this.defaultLanguage!, ...result];
      },
    });
  }

  public chooseTranslation(lang: LanguageInterface): void {
    console.log(lang);
    this.selectedTranslation = lang.code;

    const translation: TranslationInterface = this.form.controls['translations'].value.find(
      (trans: TranslationInterface) => trans.id === lang.code,
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
    const language = this.languages.find((lang) => lang.code === languageCode);
    const confirmed = await this.confirmModalService.open({
      title: this.translate.instant('notify.do_you_really_want_to_delete_language', {
        lang: language!.name,
      }),
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

  public deleteCategoryEmit() {
    this.deleteCall.emit(true);
  }

  public back() {
    if (this.isDesktop) {
      this.router.navigate(['settings/categories']);
    } else {
      this.location.back();
    }
  }
}
