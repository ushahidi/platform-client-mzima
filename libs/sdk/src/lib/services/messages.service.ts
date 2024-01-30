import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiHelpers } from '../helpers';
import { EnvLoader } from '../loader';
import { MessageResponse, MessageResult, MessageFilter } from '../models';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class MessagesService extends ResourceService<any> {
  private defaultMessageFilters: MessageFilter = {
    order: 'asc',
    orderby: 'created',
    page: 1, // Pages start at 1
    limit: 5,
  };

  constructor(
    protected override httpClient: HttpClient,
    protected override currentLoader: EnvLoader,
  ) {
    super(httpClient, currentLoader);
  }

  getApiVersions(): string {
    return apiHelpers.API_V_5;
  }

  getResourceUrl(): string {
    return 'messages';
  }

  getLayers(): Observable<MessageResponse> {
    return super.get();
  }

  createMessage(params: any): Observable<any> {
    return super.post(params);
  }

  getMessageById(id: string | number): Observable<MessageResult> {
    return super.getById(id);
  }

  getMessagesByPost(
    postId: string | number,
    messageFilter?: MessageFilter,
  ): Observable<MessageResponse> {
    const params = { ...this.defaultMessageFilters, ...messageFilter, post: postId };
    return super.get(undefined, params);
  }
}
