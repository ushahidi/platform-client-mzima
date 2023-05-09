import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeploymentSearchPage } from './deployment-search.page';

describe('DeploymentSearchPage', () => {
  let component: DeploymentSearchPage;
  let fixture: ComponentFixture<DeploymentSearchPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DeploymentSearchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
