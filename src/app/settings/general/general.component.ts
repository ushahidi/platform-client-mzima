import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApiKeyResult } from '@models';
import { TranslateService } from '@ngx-translate/core';
import {
  ApiKeyService,
  ConfigService,
  LanguageService,
  MediaService,
  SessionService,
} from '@services';
import { mergeMap } from 'rxjs';
import { DialogComponent } from 'src/app/shared/components';
import { SettingsMapComponent } from './settings-map/settings-map.component';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss'],
})
export class GeneralComponent implements OnInit {
  @ViewChild('mapSettings') mapSettings: SettingsMapComponent;
  public generalForm: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required]],
    description: ['', []],
    email: ['', [Validators.email, Validators.required]],
    language: ['en', []],
    private: [false, []],
    disable_registration: [false, []],
  });

  siteConfig: any;
  apiKey: ApiKeyResult;
  isSaving = false;
  uploadedFile?: File;

  constructor(
    private sessionService: SessionService,
    private formBuilder: FormBuilder,
    private mediaService: MediaService,
    private configService: ConfigService,
    public langService: LanguageService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private apiKeyService: ApiKeyService,
  ) {}

  ngOnInit(): void {
    this.siteConfig = this.sessionService.getConfigurations('site');
    this.generalForm.patchValue({
      name: this.siteConfig.name,
      description: this.siteConfig.description,
      email: this.siteConfig.email,
      language: this.siteConfig.language,
      private: this.siteConfig.private,
      disable_registration: true,
    });
    this.apiKeyService.get().subscribe((res) => {
      // FIXME: results[0]
      this.apiKey = res.results[0];
    });
    this.translate.onLangChange.subscribe((newLang) => {
      this.generalForm.controls['language'].setValue(newLang.lang);
    });
  }

  fileUploaded(event: File) {
    // this.siteImage = event.dataURI;
    this.uploadedFile = event;
  }

  headerImageDeleted() {
    this.siteConfig.image_header = '';
    this.uploadedFile = undefined;
  }

  generateApiKey() {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '480px',
      data: {
        title: 'Are you sure?',
        body: '<p>notify.api_key.change_question</p>',
      },
    });

    dialogRef.afterClosed().subscribe({
      next: (response) => {
        if (response?.confirm) {
          this.apiKeyService.update(this.apiKey.id, this.apiKey).subscribe((newKey) => {
            this.apiKey = newKey;
          });
        }
      },
    });
  }

  save() {
    this.isSaving = true;
    if (this.uploadedFile) {
      this.mediaService
        .uploadFile(this.uploadedFile)
        .pipe(
          mergeMap((newImage: any) => {
            this.siteConfig.image_header = newImage.original_file_url;
            return this.updateSettings();
          }),
        )
        .subscribe({
          complete: () => {
            this.isSaving = false;
          },
        });
    } else {
      this.updateSettings().subscribe({
        complete: () => {
          this.isSaving = false;
        },
      });
    }
  }

  private updateSettings() {
    const siteConfig = Object.assign({}, this.generalForm.value, {
      image_header: this.siteConfig.image_header,
    });
    return this.configService.update('site', siteConfig).pipe(
      mergeMap((updatedSite) => {
        this.sessionService.setConfigurations('site', updatedSite);
        return this.configService.update('map', this.mapSettings.mapConfig);
      }),
    );
  }
}
