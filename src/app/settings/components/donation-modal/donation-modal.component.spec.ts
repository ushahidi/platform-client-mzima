import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonationModalComponent } from './donation-modal.component';

describe('DonationModalComponent', () => {
  let component: DonationModalComponent;
  let fixture: ComponentFixture<DonationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DonationModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DonationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
