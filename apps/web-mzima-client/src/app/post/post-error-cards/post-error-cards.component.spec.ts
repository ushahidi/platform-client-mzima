import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostErrorCardsComponent } from './post-error-cards.component';

describe('PostErrorCardsComponent', () => {
  let component: PostErrorCardsComponent;
  let fixture: ComponentFixture<PostErrorCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostErrorCardsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostErrorCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
