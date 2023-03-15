import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostDetailsModalComponent } from './post-details-modal.component';

describe('PostDetailsModalComponent', () => {
  let component: PostDetailsModalComponent;
  let fixture: ComponentFixture<PostDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostDetailsModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
