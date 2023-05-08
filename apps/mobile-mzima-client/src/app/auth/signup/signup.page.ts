import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { regexHelper } from '@helpers';

@Component({
  selector: 'app-signup',
  templateUrl: 'signup.page.html',
  styleUrls: ['signup.page.scss'],
})
export class SignupPage {
  public form = this.formBuilder.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.pattern(regexHelper.emailValidate())]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64)]],
    agreement: [false, [Validators.required]],
  });

  constructor(private formBuilder: FormBuilder) {}

  public signUp(): void {
    // TODO: Signup functionality
    console.log('signUp');
  }

  public openLink(event: Event, link: string): void {
    event.preventDefault();
    event.stopPropagation();
    console.log('open: ', link);
  }
}
