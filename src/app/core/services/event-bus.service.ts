import { Injectable } from '@angular/core';
import { filter, map, Observable, Subject } from 'rxjs';

export const enum EventType {
  SHOW_POST_DETAILS = 'showPostDetails',
}

export interface BusEvent<T = any> {
  type: EventType;
  payload: T;
}

@Injectable({
  providedIn: 'root',
})
export class EventBusService {
  private _eventSubject = new Subject<BusEvent>();

  public on<T = any>(type: EventType): Observable<T> {
    return this._eventSubject.pipe(
      filter((event) => event.type === type),
      map((event) => event.payload),
    );
  }

  public next(event: BusEvent): void {
    this._eventSubject.next(event);
  }
}
