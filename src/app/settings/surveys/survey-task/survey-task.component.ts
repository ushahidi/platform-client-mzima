import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { CONST } from '@constants';
import {
  FormAttributeInterface,
  LanguageInterface,
  RoleResult,
  SurveyItem,
  SurveyItemTask,
} from '@models';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmModalService, LanguageService } from '@services';
import { GroupCheckboxItemInterface, GroupCheckboxValueInterface } from 'src/app/shared/components';
import { CreateFieldModalComponent } from '../create-field-modal/create-field-modal.component';

@Component({
  selector: 'app-survey-task',
  templateUrl: './survey-task.component.html',
  styleUrls: ['./survey-task.component.scss'],
})
export class SurveyTaskComponent implements OnInit, OnChanges {
  @Input() task: SurveyItemTask;
  @Input() survey: SurveyItem;
  @Input() roles: RoleResult[];

  surveyId: string;
  selectedRoles: GroupCheckboxValueInterface = {
    value: 'everyone',
    options: [],
  };

  taskFields: FormAttributeInterface[];
  isPost = false;
  showLangError = false;
  selectedLanguage: any;
  languages: any;
  languagesToSelect: LanguageInterface[] = [];
  roleOptions: GroupCheckboxItemInterface[] = [];
  selectedColor: string;

  constructor(
    private confirm: ConfirmModalService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private languageService: LanguageService,
    private translate: TranslateService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['roles']) {
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
          options: this.roles.map((role) => {
            return {
              name: role.display_name,
              value: role.name,
              checked: role.name === 'admin',
              disabled: role.name === 'admin',
            };
          }),
        },
      ];
    }

    if (changes['survey']) {
      this.initLanguages();
      this.selectedColor = this.survey.color;
    }
  }

  getConfigOptions() {
    return {
      selectedRoles: this.selectedRoles,
      hide_time: this.survey.hide_time,
      hide_location: this.survey.hide_location,
      hide_author: this.survey.hide_author,
      require_approval: this.survey.require_approval,
      color: this.selectedColor,
    };
  }

  ngOnInit(): void {
    this.surveyId = this.route.snapshot.paramMap.get('id') || '';
    this.taskFields = this.task.fields;
    this.isPost = this.task.type === 'post';
  }

  private initLanguages() {
    this.languagesToSelect = this.languageService.getLanguages();

    const language = localStorage.getItem(`${CONST.LOCAL_STORAGE_PREFIX}language`);

    if (!this.survey.enabled_languages) {
      this.survey.enabled_languages = {
        default: language!,
        available: [],
      };
    }
    this.languages = {
      default: this.survey.enabled_languages.default,
      active: this.survey.enabled_languages.default,
      available: this.survey.enabled_languages.available,
      surveyLanguages: [
        this.survey.enabled_languages.default,
        ...this.survey.enabled_languages.available,
      ],
    };
    this.selectedLanguage = this.survey.enabled_languages.default;
  }

  drop(event: CdkDragDrop<FormAttributeInterface[]>) {
    moveItemInArray(this.taskFields, event.previousIndex, event.currentIndex);
  }

  changeLanguage(event: any) {
    const newLang = event.value;
    if (this.survey.enabled_languages.available.some((l) => l === newLang)) {
      this.showLangError = true;
    } else {
      this.showLangError = false;
      this.languages = {
        default: newLang,
        active: newLang,
        available: this.survey.enabled_languages.available,
      };
      this.selectedLanguage = newLang;
      this.survey.enabled_languages.default = newLang;
    }
  }

  async deleteField(index: number) {
    const confirmed = await this.confirm.open({
      title: this.translate.instant('notify.form.delete_attribute_confirm'),
      description: `<p>${this.translate.instant('notify.form.delete_attribute_confirm_desc')}</p>`,
    });
    if (!confirmed) return;

    this.taskFields.splice(index, 1);
  }

  get anonymiseReportersEnabled() {
    return true;
  }

  addField() {
    const dialogRef = this.dialog.open(CreateFieldModalComponent, {
      width: '100%',
      maxWidth: '564px',
      minWidth: '300px',
    });

    dialogRef.afterClosed().subscribe({
      next: (response) => {
        if (response) {
          this.taskFields.push(response);
        }
      },
    });
  }
}
