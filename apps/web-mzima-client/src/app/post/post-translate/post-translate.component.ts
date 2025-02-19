import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LanguageInterface, PostResult, PostsService } from '@mzima-client/sdk';
import { EventBusService, EventType, SessionService } from '@services';
import { UntilDestroy } from '@ngneat/until-destroy';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface PostTranslateComponentData {
  post: PostResult;
  languages: LanguageInterface[];
}

@UntilDestroy()
@Component({
  selector: 'app-post-translate',
  templateUrl: './post-translate.component.html',
  styleUrls: ['./post-translate.component.scss'],
})
export class PostTranslateComponent implements OnInit {
  public languages: LanguageInterface[];
  public enabledLanguages: any;
  public isTranslateMode: boolean;
  public activeLanguage: LanguageInterface;
  public defaultLanguage: LanguageInterface | undefined;
  public post: any;
  public translateForm: FormGroup;
  public displayPostLanguage: LanguageInterface;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: PostTranslateComponentData,
    private postsService: PostsService,
    private eventBusService: EventBusService,
    private snackBar: MatSnackBar,
    private matDialogRef: MatDialogRef<PostTranslateComponent>,
    private session: SessionService,
  ) {}

  ngOnInit(): void {
    this.languages = this.data.languages;
    this.isTranslateMode = false;
    this.post = structuredClone(this.data.post);
    this.enabledLanguages = this.languages.filter((lang) =>
      this.post.enabled_languages?.available?.includes(lang.code),
    );
    const siteLanguage = this.session.getSiteConfigurations().language || 'en';
    this.post.base_language = this.post.base_language || siteLanguage;
    this.defaultLanguage =
      this.languages.find((lang) => lang.code === this.post.base_language) ||
      this.languages.find((lang) => lang.code === 'en');
  }

  public closeModal(ref?: any): void {
    this.matDialogRef.close(ref);
  }
  public displayTranslatedPost(event: MatSelectChange) {
    this.eventBusService.next({
      type: EventType.DisplayTranslatedPost,
      payload: event.value,
    });
    this.closeModal({ displayLanguage: event.value, post: this.post });
  }
  saveTranslation() {
    this.translateForm.disable();
    this.post.post_content.forEach((task: any) => {
      task.fields.forEach((field: any) => {
        if (field.key in this.translateForm.controls) {
          const translatedValue = this.translateForm.controls[field.key].value;
          field.value = field.value || {};
          field.value.translations = field.value.translations || {};

          if (Array.isArray(field.value.translations) && field.value.translations.length === 0) {
            field.value.translations = {};
          }

          field.value.translations[this.activeLanguage.code] = { value: translatedValue };

          if (field.type === 'title' || field.type === 'description') {
            this.post.translations = this.post.translations || {};
            if (Array.isArray(this.post.translations) && this.post.translations.length === 0) {
              this.post.translations = {};
            }
            this.post.translations[this.activeLanguage.code] =
              this.post.translations[this.activeLanguage.code] || {};
            this.post.translations[this.activeLanguage.code][field.type] = translatedValue;
          }
        } else if (field.input === 'upload' || field.type === 'media') {
          if (field.value) {
            field.value = { value: field.value.map((v: any) => v.value) };
          }
        }
      });
    });

    this.post.enabled_languages = { default: 'en', available: this.enabledLanguages };
    delete this.post.completed_stages;

    this.postsService.updateTranslations(this.post.id, this.post).subscribe({
      next: ({ result }) => {
        this.postsService.unlockPost(this.post.id).subscribe();
        this.showMessage('Translation saved successfully', 'success');
        this.closeModal({ displayLanguage: this.activeLanguage, post: result });
      },
      error: ({ error }) => {
        this.translateForm.enable();
        this.postsService.unlockPost(this.post.id).subscribe();
        this.showMessage(`Failed to save translation. ${error.errors.message}`, 'error');
      },
    });
  }

  private showMessage(message: string, type: string) {
    this.snackBar.open(message, 'Close', {
      panelClass: [type],
      duration: 3000,
    });
  }
  selectLanguage(event: Event, lang: LanguageInterface) {
    this.postsService.lockPost(this.post.id).subscribe();
    this.activeLanguage = lang;
    this.translateForm = this.createForm();
    this.enabledLanguages.push(lang.code);
    this.isTranslateMode = true;
  }

  createForm() {
    const newForm = new FormGroup({});
    this.post.post_content
      .flatMap((task: any) => task.fields)
      .filter((field: any) => this.isTranslateableContent(field))
      .forEach((field: any) => {
        if (field.type === 'title' || field.type === 'description') {
          newForm.addControl(field.key, new FormControl('', Validators.required));
        } else {
          newForm.addControl(field.key, new FormControl(''));
        }
        const translation = this.getTranslationValue(field);
        if (translation) {
          newForm.get(field.key)?.setValue(translation);
        }
      });
    return newForm;
  }

  getOriginalValue(field: any) {
    if (field.type === 'title') {
      return this.post.title;
    }
    if (field.type === 'description') {
      return this.post.content;
    }
    return field.value.value;
  }

  getTranslationValue(field: any) {
    if (field.type === 'title') {
      return this.post.translations?.[this.activeLanguage.code]?.title || '';
    }
    if (field.type === 'description') {
      return this.post.translations?.[this.activeLanguage.code]?.description || '';
    }
    return field.value?.translations?.[this.activeLanguage.code]?.value || '';
  }

  isTranslateableContent(field: any) {
    if (field.type === 'title' || field.type === 'description') return true;
    if (field.value && field.value.value)
      return field.input === 'text' || field.input === 'textarea' || field.input === 'markdown';
    return false;
  }
}
