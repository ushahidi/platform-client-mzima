import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectLanguagesModalComponent } from './select-languages-modal.component';

describe('SelectLanguagesModalComponent', () => {
  let component: SelectLanguagesModalComponent;
  let fixture: ComponentFixture<SelectLanguagesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectLanguagesModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectLanguagesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
