import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LanguageService, SessionService } from '@services';

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

  constructor(
    private sessionService: SessionService,
    private formBuilder: FormBuilder,
    public langService: LanguageService,
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
    console.log('sessionService', c);
  }

  test(event: any) {
    console.log('eeeee', event);
    this.siteImage = event.dataURI;
  }

  clearHeader() {
    this.siteImage = '';
  }

  save() {}
}
