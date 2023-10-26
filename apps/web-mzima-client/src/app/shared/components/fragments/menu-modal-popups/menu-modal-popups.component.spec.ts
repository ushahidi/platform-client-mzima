import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuListNonLinksComponent } from './menu-list-non-links.component';

describe('MenuListNonLinksComponent', () => {
  let component: MenuListNonLinksComponent;
  let fixture: ComponentFixture<MenuListNonLinksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenuListNonLinksComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuListNonLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
