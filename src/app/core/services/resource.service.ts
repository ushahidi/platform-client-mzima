import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export abstract class ResourceService<T> {
  private readonly apiUrl = environment.backend_url + this.getApiVersions() + this.getResourceUrl();
  private readonly options = {};

  protected constructor(protected httpClient: HttpClient) {
    this.options = {
      responseType: 'json',
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
  }

  abstract getApiVersions(): string;

  abstract getResourceUrl(): string;

  toServerModel(entity: T): any {
    return entity;
  }

  fromServerModel(json: any): T {
    return json;
  }

  getList(index: number, page: number): Observable<T[]> {
    let params = new HttpParams().set('limit', index.toString()).set('offset', page.toString());

    return this.httpClient
      .get<T[]>(`${this.apiUrl}?${params.toString()}`)
      .pipe(map((list) => list.map((item) => this.fromServerModel(item))));
  }

  get(url?: string): Observable<T> {
    const apiUrl = url ? `${this.apiUrl}/${url}` : this.apiUrl;
    return this.httpClient
      .get<T>(`${apiUrl}`, this.options)
      .pipe(map((json) => this.fromServerModel(json)));
  }

  getById(id: string | number): Observable<T> {
    return this.httpClient
      .get<T>(`${this.apiUrl}/${id}`, this.options)
      .pipe(map((json) => this.fromServerModel(json)));
  }

  post(resource: T): Observable<any> {
    return this.httpClient
      .post(`${this.apiUrl}`, this.toServerModel(resource), this.options)
      .pipe(map((json) => this.fromServerModel(json)));
  }

  update(id: string | number, resource: T) {
    return this.httpClient
      .put(`${this.apiUrl}/${id}`, this.toServerModel(resource), this.options)
      .pipe(map((json) => this.fromServerModel(json)));
  }

  delete(id: string | number): Observable<any> {
    return this.httpClient.delete(`${this.apiUrl}/${id}`, this.options);
  }
}
