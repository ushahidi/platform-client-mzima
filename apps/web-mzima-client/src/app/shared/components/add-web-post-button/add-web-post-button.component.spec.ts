import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWebPostButtonComponent } from './add-web-post-button.component';

describe('AddWebPostButtonComponent', () => {
  let component: AddWebPostButtonComponent;
  let fixture: ComponentFixture<AddWebPostButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddWebPostButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddWebPostButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
