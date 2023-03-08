import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleItemComponent } from './role-item.component';

describe('RoleItemComponent', () => {
  let component: RoleItemComponent;
  let fixture: ComponentFixture<RoleItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RoleItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
