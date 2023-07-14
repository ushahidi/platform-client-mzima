import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeploymentBroadcastComponent } from './deployment-broadcast.component';

describe('DeploymentBroadcastComponent', () => {
  let component: DeploymentBroadcastComponent;
  let fixture: ComponentFixture<DeploymentBroadcastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeploymentBroadcastComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeploymentBroadcastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
