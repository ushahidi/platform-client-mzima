import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyItemComponent } from './survey-item.component';

describe('CreateSurveyComponent', () => {
  let component: SurveyItemComponent;
  let fixture: ComponentFixture<SurveyItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SurveyItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
