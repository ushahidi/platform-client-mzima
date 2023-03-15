import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitPostButtonComponent } from './submit-post-button.component';

describe('SubmitPostButtonComponent', () => {
  let component: SubmitPostButtonComponent;
  let fixture: ComponentFixture<SubmitPostButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubmitPostButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SubmitPostButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
