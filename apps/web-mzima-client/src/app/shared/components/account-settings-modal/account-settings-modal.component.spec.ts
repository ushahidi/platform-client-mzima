import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSettingsModalComponent } from './account-settings-modal.component';

describe('AccountSettingsComponent', () => {
  let component: AccountSettingsModalComponent;
  let fixture: ComponentFixture<AccountSettingsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountSettingsModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountSettingsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
