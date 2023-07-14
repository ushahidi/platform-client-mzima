import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuListNonPageLinksComponent } from './menu-list-non-page-links.component';

describe('MenuListNonPageLinksComponent', () => {
  let component: MenuListNonPageLinksComponent;
  let fixture: ComponentFixture<MenuListNonPageLinksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenuListNonPageLinksComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuListNonPageLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
