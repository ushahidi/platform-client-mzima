import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraggableLayoutComponent } from './draggable-layout.component';

describe('DraggableLayoutComponent', () => {
  let component: DraggableLayoutComponent;
  let fixture: ComponentFixture<DraggableLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DraggableLayoutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DraggableLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
