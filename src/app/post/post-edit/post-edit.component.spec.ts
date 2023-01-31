import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostEditComponent } from '@post';

describe('CreateComponent', () => {
  let component: PostEditComponent;
  let fixture: ComponentFixture<PostEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should post-item', () => {
    expect(component).toBeTruthy();
  });
});
