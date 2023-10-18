import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostNotFoundComponent } from './post-not-found.component';

describe('PostNotFoundComponent', () => {
  let component: PostNotFoundComponent;
  let fixture: ComponentFixture<PostNotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostNotFoundComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
