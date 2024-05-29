import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostNotAllowedComponent } from './post-not-allowed.component';

describe('PostNotAllowedComponent', () => {
  let component: PostNotAllowedComponent;
  let fixture: ComponentFixture<PostNotAllowedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostNotAllowedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostNotAllowedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
