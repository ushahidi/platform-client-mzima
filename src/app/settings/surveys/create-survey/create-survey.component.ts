import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-survey',
  templateUrl: './create-survey.component.html',
  styleUrls: ['./create-survey.component.scss'],
})
export class CreateSurveyComponent implements OnInit {
  ngOnInit(): void {
    console.log('CreateSurveyComponent');
  }
}
