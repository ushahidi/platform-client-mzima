import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteContactModalComponent } from './delete-contact-modal.component';

describe('DeleteContactModalComponent', () => {
  let component: DeleteContactModalComponent;
  let fixture: ComponentFixture<DeleteContactModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeleteContactModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteContactModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
