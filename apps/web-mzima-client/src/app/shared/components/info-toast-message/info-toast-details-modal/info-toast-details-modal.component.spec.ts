import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoToastDetailsModalComponent } from './info-toast-details-modal.component';

describe('InfoToastDetailsModalComponent', () => {
  let component: InfoToastDetailsModalComponent;
  let fixture: ComponentFixture<InfoToastDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InfoToastDetailsModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoToastDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
