import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiVersionDetailsModalComponent } from './api-version-details-modal.component';

describe('ApiVersionDetailsModalComponent', () => {
  let component: ApiVersionDetailsModalComponent;
  let fixture: ComponentFixture<ApiVersionDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApiVersionDetailsModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ApiVersionDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
