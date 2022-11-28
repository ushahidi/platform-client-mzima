import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostHeadComponent } from './post-head.component';

describe('PostHeadComponent', () => {
  let component: PostHeadComponent;
  let fixture: ComponentFixture<PostHeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostHeadComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
