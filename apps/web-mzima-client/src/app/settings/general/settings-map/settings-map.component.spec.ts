import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsMapComponent } from './settings-map.component';

describe('SettingsMapComponent', () => {
  let component: SettingsMapComponent;
  let fixture: ComponentFixture<SettingsMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsMapComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
