import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSourcesComponent } from './data-sources.component';

describe('DataSourcesComponent', () => {
  let component: DataSourcesComponent;
  let fixture: ComponentFixture<DataSourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DataSourcesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataSourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
