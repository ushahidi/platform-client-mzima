import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFeedItemComponent } from './edit-feed-item.component';

describe('EditFeedItemComponent', () => {
  let component: EditFeedItemComponent;
  let fixture: ComponentFixture<EditFeedItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditFeedItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditFeedItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
