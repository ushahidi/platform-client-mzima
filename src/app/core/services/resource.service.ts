import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export abstract class ResourceService<T> {
  private readonly apiUrl = environment.api_url + this.getResourceUrl();
  private readonly options = {};

  protected constructor(protected httpClient: HttpClient) {
    this.options = {
      responseType: 'json',
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
  }

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

  get(): Observable<T> {
    return this.httpClient
      .get<T>(`${this.apiUrl}`, this.options)
      .pipe(map((json) => this.fromServerModel(json)));
  }

  getById(id: string | number): Observable<T> {
    return this.httpClient
      .get<T>(`${this.apiUrl}/${id}`, this.options)
      .pipe(map((json) => this.fromServerModel(json)));
  }

  post(resource: T): Observable<any> {
    return this.httpClient
      .post(`${this.apiUrl}`, this.options, this.toServerModel(resource))
      .pipe(map((json) => this.fromServerModel(json)));
  }

  update(resource: T) {
    return this.httpClient
      .put(`${this.apiUrl}`, this.options, this.toServerModel(resource))
      .pipe(map((json) => this.fromServerModel(json)));
  }

  delete(id: string | number): Observable<any> {
    return this.httpClient.delete(`${this.apiUrl}/${id}`, this.options);
  }
}
