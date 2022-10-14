import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFieldModalComponent } from './create-field-modal.component';

describe('CreateFieldModalComponent', () => {
  let component: CreateFieldModalComponent;
  let fixture: ComponentFixture<CreateFieldModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateFieldModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateFieldModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
