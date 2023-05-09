import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeploymentPage } from './deployment.page';

describe('DeploymentPage', () => {
  let component: DeploymentPage;
  let fixture: ComponentFixture<DeploymentPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DeploymentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
