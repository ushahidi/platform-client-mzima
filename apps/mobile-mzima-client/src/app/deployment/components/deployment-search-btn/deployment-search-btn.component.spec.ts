import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DeploymentSearchBtnComponent } from './deployment-search-btn.component';

describe('DeploymentSearchBtnComponent', () => {
  let component: DeploymentSearchBtnComponent;
  let fixture: ComponentFixture<DeploymentSearchBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DeploymentSearchBtnComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(DeploymentSearchBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
