import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedViewComponent } from './feed-view.component';

describe('FeedViewComponent', () => {
  let component: FeedViewComponent;
  let fixture: ComponentFixture<FeedViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeedViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
