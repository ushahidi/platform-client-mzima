import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApiKeyResult } from '@models';
import { ApiKeyService, LanguageService, SessionService } from '@services';
import { DialogComponent } from 'src/app/shared/components';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss'],
})
export class GeneralComponent implements OnInit {
  public generalForm: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required]],
    description: ['', []],
    email: ['', [Validators.email, Validators.required]],
    language: ['en', []],
    private: [false, []],
    disable_registration: [false, []],
  });

  siteImage: string;
  apiKey: ApiKeyResult;

  constructor(
    private sessionService: SessionService,
    private formBuilder: FormBuilder,
    public langService: LanguageService,
    private dialog: MatDialog,
    private apiKeyService: ApiKeyService,
  ) {}

  ngOnInit(): void {
    const c: any = this.sessionService.getConfigurations('site');
    this.siteImage = c.image_header;
    this.generalForm.setValue({
      name: c.name,
      description: c.description,
      email: c.email,
      language: c.language,
      private: c.private,
      disable_registration: true,
    });
    this.apiKeyService.get().subscribe((res) => {
      // FIXME: results[0]
      this.apiKey = res.results[0];
    });
  }

  test(event: any) {
    console.log('eeeee', event);
    this.siteImage = event.dataURI;
  }

  clearHeader() {
    this.siteImage = '';
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
            console.log('SUCCESS', newKey);
            this.apiKey = newKey;
          });
        }
      },
    });
  }

  save() {}
}
