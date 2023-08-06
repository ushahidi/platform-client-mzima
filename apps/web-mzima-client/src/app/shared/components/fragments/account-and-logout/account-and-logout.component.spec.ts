import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountAndLogoutComponent } from './account-and-logout.component';

describe('AccountAndLogoutComponent', () => {
  let component: AccountAndLogoutComponent;
  let fixture: ComponentFixture<AccountAndLogoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountAndLogoutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountAndLogoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
