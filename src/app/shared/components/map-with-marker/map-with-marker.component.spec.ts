import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapWithMarkerComponent } from './map-with-marker.component';

describe('MapWithMarkerComponent', () => {
  let component: MapWithMarkerComponent;
  let fixture: ComponentFixture<MapWithMarkerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapWithMarkerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MapWithMarkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
