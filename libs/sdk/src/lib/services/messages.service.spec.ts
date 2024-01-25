import { MessagesService } from './messages.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EnvLoader } from '../loader';
import { Observable, of } from 'rxjs';

class MockEnvLoader extends EnvLoader {
  getApiUrl(): Observable<any> {
    return of('http://localhost:8080/');
  }
}

describe('MessagesService', () => {
  let service: MessagesService;
  // let envLoader : EnvLoader;
  let httpClient: HttpTestingController;

  const sampleMessage = {
    id: 1,
    parent_id: null,
    contact_id: null,
    post_id: 1,
    user_id: null,
    data_source: null,
    data_source_message_id: null,
    title: 'Test Message',
    message: 'Another test message',
    datetime: null,
    type: 'sms',
    status: 'received',
    direction: 'incoming',
    created: '1970-01-01T00:00:00.000000Z',
    additional_data: null,
    notification_post_id: null,
    contact: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: EnvLoader,
          useClass: MockEnvLoader,
        },
      ],
    });
    httpClient = TestBed.inject(HttpTestingController);
    // envLoader = TestBed.inject(EnvLoader);
    service = TestBed.inject(MessagesService);
  });

  afterEach(() => {
    httpClient.verify();
  });

  describe('createMessage()', () => {
    it('#createMessage should POST correct request', () => {
      service.createMessage(sampleMessage);
      const req = httpClient.expectOne({
        method: 'POST',
        // url: '/messages'
      });
      req.flush(sampleMessage);
    });
  });
  describe('getMessageById()', () => {
    it('#getMessageById should GET', () => {
      service.getMessageById(sampleMessage.id);
      const req = httpClient.expectOne({
        method: 'GET',
        // url: '/messages'
      });
      req.flush(sampleMessage);
    });
  });

  describe('getMessagesByPost()', () => {
    it('#getMessagesByPost should GET', () => {
      service.getMessageById(sampleMessage.post_id);
      const req = httpClient.expectOne({
        method: 'GET',
        // url: '/messages'
      });
      req.flush(sampleMessage);
    });
  });
});
