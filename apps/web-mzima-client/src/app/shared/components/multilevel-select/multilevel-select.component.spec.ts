import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultilevelSelectComponent } from './multilevel-select.component';

describe('MultilevelSelectComponent', () => {
  let component: MultilevelSelectComponent;
  let fixture: ComponentFixture<MultilevelSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MultilevelSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MultilevelSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
