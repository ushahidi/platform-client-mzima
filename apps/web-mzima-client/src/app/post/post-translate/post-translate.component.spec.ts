import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostTranslateComponent } from './post-translate.component';

describe('PostTranslateComponent', () => {
  let component: PostTranslateComponent;
  let fixture: ComponentFixture<PostTranslateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostTranslateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostTranslateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
