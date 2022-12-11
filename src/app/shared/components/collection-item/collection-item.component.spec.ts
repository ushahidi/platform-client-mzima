import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionItemComponent } from './collection-item.component';

describe('CollectionItemComponent', () => {
  let component: CollectionItemComponent;
  let fixture: ComponentFixture<CollectionItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollectionItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
