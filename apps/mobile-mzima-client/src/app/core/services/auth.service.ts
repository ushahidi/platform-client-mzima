import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(protected httpClient: HttpClient) {}

  toServerModel(entity: any): any {
    return entity;
  }

  fromServerModel(json: any) {
    return json;
  }

  login(username: any, password: any): Observable<any> {
    const CLAIMED_USER_SCOPES = ['*'];

    const payload = {
      username: username,
      password: password,
      grant_type: 'password',
      client_id: 'ushahidiui',
      client_secret: '35e7f0bca957836d05ca0492211b0ac707671261',
      scope: CLAIMED_USER_SCOPES.join(' '),
    };

    return this.httpClient
      .post(`https://mzima-api.staging.ush.zone/oauth/token`, this.toServerModel(payload), {
        responseType: 'json',
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(map((json) => this.fromServerModel(json)));
  }
}
