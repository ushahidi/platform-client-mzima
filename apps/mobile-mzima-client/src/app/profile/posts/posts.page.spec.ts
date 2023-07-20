import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DeploymentPage } from './deployment.page';

describe('DeploymentPage', () => {
  let component: DeploymentPage;
  let fixture: ComponentFixture<DeploymentPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeploymentPage, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(DeploymentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
