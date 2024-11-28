import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslationInterface, LanguageInterface, apiHelpers } from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { formHelper } from '@helpers';
import { BaseComponent } from '../../../base.component';
import {
  GroupCheckboxItemInterface,
  SelectLanguagesModalComponent,
} from '../../../shared/components';
import {
  CategoriesService,
  RolesService,
  CategoryInterface,
  generalHelpers,
} from '@mzima-client/sdk';
import { BreakpointService, SessionService, LanguageService, ConfirmModalService } from '@services';
import { noWhitespaceValidator } from '../../../core/validators';

@UntilDestroy()
@Component({
  selector: 'app-create-category-form',
  templateUrl: './create-category-form.component.html',
  styleUrls: ['./create-category-form.component.scss'],
})
export class CreateCategoryFormComponent extends BaseComponent implements OnInit, OnDestroy {
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
  isParent = false;
  public form: FormGroup;
  private userRole: string;
  public formErrors: any[] = [];

  constructor(
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private fb: FormBuilder,
    private categoriesService: CategoriesService,
    private rolesService: RolesService,
    private languageService: LanguageService,
    private dialog: MatDialog,
    private confirmModalService: ConfirmModalService,
    private translate: TranslateService,
    private router: Router,
    private location: Location,
  ) {
    super(sessionService, breakpointService);
    this.checkDesktop();

    this.languages = this.languageService.getLanguages();
    this.defaultLanguage = this.languages.find((lang) => lang.code === 'en'); // FIXME

    this.form = this.fb.group({
      id: [''],
      name: ['', [Validators.required, noWhitespaceValidator]],
      description: [''],
      is_child_to: [''],
      language: ['en'],
      visible_to: [
        {
          value: 'everyone',
          options: [],
          disabled: false,
        },
      ],
      translations: this.fb.array<TranslationInterface>([]),
      translate_name: [''],
      translate_description: [''],
      parent: [],
    });

    this.categoriesService.categoryErrors$.pipe(untilDestroyed(this)).subscribe((value) => {
      this.formErrors = value;
    });
  }

  ngOnInit(): void {
    this.getUserData();
    this.formSubscribe();
    this.getCategories();
    this.getRoles();
    this.userRole = localStorage.getItem(`${generalHelpers.CONST.LOCAL_STORAGE_PREFIX}role`)!;
    if (this.category) {
      this.isParent = !!this.category.children?.length;
      this.isUpdate = !!this.category;
      this.form.patchValue({
        id: this.category.id,
        name: this.category.tag,
        description: this.category.description,
        language: this.category.enabled_languages.default,
        is_child_to: this.category.parent?.id || null,
      });

      this.updateForm(
        'visible_to',
        formHelper.mapRoleToVisible(this.category?.role, !!this.category.parent_id),
      );

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

  loadData(): void {}

  ngOnDestroy() {
    this.categoriesService.categoryErrors.next(null);
  }

  private formSubscribe() {
    this.form.valueChanges.pipe(untilDestroyed(this)).subscribe({
      next: (data) => {
        this.categoriesService.categoryErrors.next(null);
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
    this.categoriesService
      .getCategories({ only: apiHelpers.ONLY.TAG_ID_PARENTID_PARENT_SLUG })
      .subscribe({
        next: (data) => {
          this.categories = data.results
            .filter((cat: CategoryInterface) => !cat.parent_id)
            .filter((cat: CategoryInterface) => cat.id !== this.category?.id);
        },
      });
  }

  private getRoles() {
    this.rolesService.getRoles().subscribe({
      next: (response) => {
        this.roleOptions = formHelper.roleTransform({
          roles: response.results,
          userRole: this.userRole,
          onlyMe: this.translate.instant('role.only_me'),
          everyone: this.translate.instant('role.everyone'),
          specificRoles: this.translate.instant('app.specific_roles'),
          isShowIcons: false,
        });

        if (this.category) {
          this.checkRoleOptions(this.category.parent?.id);
        }
      },
    });
  }

  checkRoleOptions(parentId: number) {
    this.roleOptions.forEach((option) => {
      if (option?.options) {
        option.options.forEach((role) => {
          if (this.category.role) {
            role.checked = this.category.role.includes(role.value as string);
            role.disabled = !!parentId;
          } else role.checked = role.value === 'admin';
        });
      }
    });
  }

  private updateForm(field: string, value: any) {
    this.form.patchValue({ [field]: value });
  }

  public isRoleActive(roleName: string): boolean {
    return !!this.category.role && this.category.role.indexOf(roleName) > -1;
  }

  public submit(): void {
    if (this.form.invalid) return;

    let role;
    switch (this.form.value.visible_to.value) {
      case 'only_me':
        role = ['me'];
        break;
      case 'everyone':
        // role = ['everyone'];
        role = null;
        break;
      default:
        role = this.form.value.visible_to.options;
    }

    const category = {
      user_id: Number(this.user.userId),
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
      parent_id_original: this.category?.parent?.id || null,
      role,
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
      this.form.controls['translate_name'].setValue('');
      this.form.controls['translate_description'].setValue('');
    }

    if (lang.code === 'en') {
      this.form.controls['translate_name'].clearValidators();
    } else {
      this.form.controls['translate_name'].setValidators([Validators.required]);
    }
    this.form.controls['translate_name'].updateValueAndValidity();
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
    const parentRole = parentCategory ? parentCategory?.role! : null;
    this.updateForm(
      'visible_to',
      formHelper.mapRoleToVisible(parentRole, parentCategory ? !!parentCategory.id : false),
    );
    this.checkRoleOptions(event.value);
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
