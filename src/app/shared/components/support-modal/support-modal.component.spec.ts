import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportModalComponent } from './support-modal.component';

describe('SupportModalComponent', () => {
  let component: SupportModalComponent;
  let fixture: ComponentFixture<SupportModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SupportModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SupportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
