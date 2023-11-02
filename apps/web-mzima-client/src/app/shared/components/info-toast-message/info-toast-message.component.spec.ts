import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoToastMessageComponent } from './info-toast-message.component';

describe('InfoToastMessageComponent', () => {
  let component: InfoToastMessageComponent;
  let fixture: ComponentFixture<InfoToastMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InfoToastMessageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoToastMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
