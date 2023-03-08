import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyTaskComponent } from './survey-task.component';

describe('SurveyTaskComponent', () => {
  let component: SurveyTaskComponent;
  let fixture: ComponentFixture<SurveyTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SurveyTaskComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
