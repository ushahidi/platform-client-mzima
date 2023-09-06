import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuListLinksComponent } from './menu-list-links.component';

describe('MenuListLinksComponent', () => {
  let component: MenuListLinksComponent;
  let fixture: ComponentFixture<MenuListLinksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenuListLinksComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuListLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
