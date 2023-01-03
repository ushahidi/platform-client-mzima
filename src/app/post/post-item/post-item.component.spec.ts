import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostItemComponent } from '@post';

describe('CreateComponent', () => {
  let component: PostItemComponent;
  let fixture: ComponentFixture<PostItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should post-item', () => {
    expect(component).toBeTruthy();
  });
});
