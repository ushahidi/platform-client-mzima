import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { LanguageInterface, PostResult, PostsService } from '@mzima-client/sdk';
import { UntilDestroy } from '@ngneat/until-destroy';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as _ from 'lodash';
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
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: PostTranslateComponentData,
    private postsService: PostsService,
  ) {}

  ngOnInit(): void {
    this.languages = this.data.languages;
    this.isTranslateMode = false;
    this.post = _.cloneDeep(this.data.post);
    this.enabledLanguages = this.post.enabled_languages;
    this.defaultLanguage = this.languages.find((lang) => lang.code === this.post.base_language);
  }
  closeModal() {
    console.log('close modal');
  }
  saveTranslation() {
    this.post.enabled_languages = this.enabledLanguages;
    this.post.post_content.forEach((task: any) => {
      task.fields
        .filter((field: any) => field.key in this.translateForm.controls)
        .forEach((field: any) => {
          const translatedValue = this.translateForm.controls[field.key].value;
          if (!field.value) {
            field.value = {};
          }
          if (!field.value.translations) {
            field.value.translations = {};
          }
          field.value = {
            ...field.value,
            translations: [
              {
                ...field.value.translations[0],
                [this.activeLanguage.code]: { value: translatedValue },
              },
            ],
          };
          if (field.type === 'title' || field.type === 'description') {
            this.post.translations = [this.activeLanguage.code] = [
              {
                ...this.post.translations[this.activeLanguage.code],
                [field.type]: translatedValue,
              },
            ];
          }
        });
    });
    this.postsService.updateTranslations(this.post.id, this.post).subscribe((res) => {
      console.log(res);
    });
  }
  selectLanguage(event: Event, lang: LanguageInterface) {
    this.activeLanguage = lang;
    this.translateForm = this.createForm();
    this.enabledLanguages.available.push(lang.code);
    this.isTranslateMode = true;
  }

  createForm() {
    const newForm = new FormGroup({});
    this.post.post_content
      .flatMap((task: any) => task.fields)
      .filter((field: any) => this.isTranslateableContent(field))
      .forEach((field: any) => {
        newForm.addControl(field.key, new FormControl(''));
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
      return this.post.translations?.[this.activeLanguage.code]?.content || '';
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
