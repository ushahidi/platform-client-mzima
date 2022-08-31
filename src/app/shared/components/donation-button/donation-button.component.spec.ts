import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonationButtonComponent } from './donation-button.component';

describe('DonationButtonComponent', () => {
  let component: DonationButtonComponent;
  let fixture: ComponentFixture<DonationButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DonationButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DonationButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
