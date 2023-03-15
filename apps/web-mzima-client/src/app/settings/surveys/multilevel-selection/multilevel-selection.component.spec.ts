import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultilevelSelectionComponent } from './multilevel-selection.component';

describe('MultilevelSelectComponent', () => {
  let component: MultilevelSelectionComponent;
  let fixture: ComponentFixture<MultilevelSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MultilevelSelectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MultilevelSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
