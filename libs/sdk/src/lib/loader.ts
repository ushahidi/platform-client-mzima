import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { apiHelpers } from './helpers';

export abstract class EnvLoader {
  abstract getApiUrl(): Observable<any>;
}

/**
 * This loader is just a placeholder that does nothing, in case you don't need a loader at all
 */
@Injectable()
export class EnvFakeLoader extends EnvLoader {
  getApiUrl(): Observable<string> {
    console.log('asdasdasd', apiHelpers.defaultApiURl);
    return of(apiHelpers.defaultApiURl);
  }
}
