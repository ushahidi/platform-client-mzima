import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareMenuComponent } from './share-menu.component';

describe('ShareMenuComponent', () => {
  let component: ShareMenuComponent;
  let fixture: ComponentFixture<ShareMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShareMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
