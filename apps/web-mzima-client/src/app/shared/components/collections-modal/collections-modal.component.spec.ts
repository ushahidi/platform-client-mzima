import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionsModalComponent } from './collections-modal.component';

describe('CollectionsModalComponent', () => {
  let component: CollectionsModalComponent;
  let fixture: ComponentFixture<CollectionsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollectionsModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
