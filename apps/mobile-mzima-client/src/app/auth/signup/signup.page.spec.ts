import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
// import { ExploreContainerComponentModule } from '../components/explore-container/explore-container.module';

import { SignupPage } from './signup.page';

describe('SignupPage', () => {
  let component: SignupPage;
  let fixture: ComponentFixture<SignupPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupPage, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
