import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuModalPopupsComponent } from './menu-modal-popups.component';

describe('MenuModalPopupsComponent', () => {
  let component: MenuModalPopupsComponent;
  let fixture: ComponentFixture<MenuModalPopupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenuModalPopupsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuModalPopupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
