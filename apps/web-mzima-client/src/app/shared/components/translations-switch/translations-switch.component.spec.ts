import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslationsSwitchComponent } from './translations-switch.component';

describe('TranslationsSwitchComponent', () => {
  let component: TranslationsSwitchComponent;
  let fixture: ComponentFixture<TranslationsSwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TranslationsSwitchComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TranslationsSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
