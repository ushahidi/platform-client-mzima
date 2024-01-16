import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowMessagesModalComponent } from './show-messages-modal.component';

describe('ShowMessagesModalComponent', () => {
  let component: ShowMessagesModalComponent;
  let fixture: ComponentFixture<ShowMessagesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShowMessagesModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ShowMessagesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
