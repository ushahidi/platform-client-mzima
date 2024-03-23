import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyFiltersComponent } from './survey-filters.component';

describe('SurveyFiltersComponent', () => {
  let component: SurveyFiltersComponent;
  let fixture: ComponentFixture<SurveyFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SurveyFiltersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
