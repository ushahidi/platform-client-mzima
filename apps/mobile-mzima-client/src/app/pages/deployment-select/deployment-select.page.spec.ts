import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeploymentSelectPage } from './deployment-select.page';

describe('DeploymentSelectPage', () => {
  let component: DeploymentSelectPage;
  let fixture: ComponentFixture<DeploymentSelectPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DeploymentSelectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
