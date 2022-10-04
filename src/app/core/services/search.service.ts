import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  constructor(private httpClient: HttpClient) {}

  public get(query: string): Observable<any> {
    return this.httpClient.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
      },
    });
  }
}
