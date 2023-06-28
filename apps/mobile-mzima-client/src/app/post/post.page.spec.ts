import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { PostPage } from './post.page';

describe('PostPage', () => {
  let component: PostPage;
  let fixture: ComponentFixture<PostPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostPage, IonicModule],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
