import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShareAndDonateComponent } from './share-and-donate.component';

describe('ShareAndDonateComponent', () => {
  let component: ShareAndDonateComponent;
  let fixture: ComponentFixture<ShareAndDonateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShareAndDonateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareAndDonateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
