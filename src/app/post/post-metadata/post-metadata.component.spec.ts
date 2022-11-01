import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostMetadataComponent } from './post-metadata.component';

describe('PostMetadataComponent', () => {
  let component: PostMetadataComponent;
  let fixture: ComponentFixture<PostMetadataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostMetadataComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
