import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataImportComponent } from './import.component';

describe('ImportComponent', () => {
  let component: DataImportComponent;
  let fixture: ComponentFixture<DataImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DataImportComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
