import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebhookItemComponent } from './webhook-item.component';

describe('WebhookItemComponent', () => {
  let component: WebhookItemComponent;
  let fixture: ComponentFixture<WebhookItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WebhookItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WebhookItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
