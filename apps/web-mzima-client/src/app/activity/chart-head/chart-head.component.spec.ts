import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartHeadComponent } from './chart-head.component';

describe('ChartHeadComponent', () => {
  let component: ChartHeadComponent;
  let fixture: ComponentFixture<ChartHeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChartHeadComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
