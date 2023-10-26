import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuNavViewsComponent } from './menu-nav-views.component';

describe('MenuNavViewsComponent', () => {
  let component: MenuNavViewsComponent;
  let fixture: ComponentFixture<MenuNavViewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenuNavViewsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuNavViewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
