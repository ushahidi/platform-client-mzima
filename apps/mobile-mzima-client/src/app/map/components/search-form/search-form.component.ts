import { Component, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss'],
})
export class SearchFormComponent {
  @Input() public isLight = true;

  public form = this.formBuilder.group({
    postsQuery: [''],
  });

  constructor(private formBuilder: FormBuilder) {}
}
