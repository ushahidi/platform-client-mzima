import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupCheckboxSelectComponent } from './group-checkbox-select.component';

describe('GroupCheckboxSelectComponent', () => {
  let component: GroupCheckboxSelectComponent;
  let fixture: ComponentFixture<GroupCheckboxSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GroupCheckboxSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupCheckboxSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
