import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CONST } from '@constants';
import { mergeMap, tap } from 'rxjs';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor(private http: HttpClient, private sessionService: SessionService) {}

  getSite() {
    return this.http.get(`${CONST.API_URL}/config/site`).pipe(
      tap((data) => {
        this.sessionService.setConfigurations('site', data);
      }),
    );
  }

  getFeatures() {
    return this.http.get(`${CONST.API_URL}/config/features`).pipe(
      tap((data) => {
        this.sessionService.setConfigurations('features', data);
      }),
    );
  }

  initAllConfigurations() {
    return this.getSite().pipe(
      mergeMap(() => {
        return this.getFeatures();
      }),
    );
  }
}
