import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportResultsComponent } from './import-results.component';

describe('ImportResultsComponent', () => {
  let component: ImportResultsComponent;
  let fixture: ComponentFixture<ImportResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImportResultsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
