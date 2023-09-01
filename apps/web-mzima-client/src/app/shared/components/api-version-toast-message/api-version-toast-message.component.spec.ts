import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiVersionToastMessageComponent } from './api-version-toast-message.component';

describe('ApiVersionToastMessageComponent', () => {
  let component: ApiVersionToastMessageComponent;
  let fixture: ComponentFixture<ApiVersionToastMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApiVersionToastMessageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ApiVersionToastMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
