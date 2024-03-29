import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { EnvService } from './env.service';

@Injectable({
  providedIn: 'root',
})
export abstract class ResourceService<T> {
  private apiUrl = '';
  private readonly options = {};

  protected constructor(protected httpClient: HttpClient, protected env: EnvService) {
    this.apiUrl = this.env.environment.backend_url + this.getApiVersions() + this.getResourceUrl();
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
    const params = new HttpParams().set('limit', index.toString()).set('offset', page.toString());

    return this.httpClient
      .get<T[]>(`${this.apiUrl}?${params.toString()}`)
      .pipe(map((list) => list.map((item) => this.fromServerModel(item))));
  }

  get(url?: string, queryParams?: any): Observable<T> {
    const apiUrl = url ? `${this.apiUrl}/${url}` : this.apiUrl;
    const options = queryParams
      ? Object.assign({}, this.options, { params: queryParams })
      : this.options;
    return this.httpClient
      .get<T>(`${apiUrl}`, options)
      .pipe(map((json) => this.fromServerModel(json)));
  }

  getById(id: string | number): Observable<T> {
    return this.httpClient
      .get<T>(`${this.apiUrl}/${id}`, this.options)
      .pipe(map((json) => this.fromServerModel(json)));
  }

  post(resource: T, url?: string): Observable<any> {
    const apiUrl = url ? `${this.apiUrl}/${url}` : this.apiUrl;
    return this.httpClient
      .post(`${apiUrl}`, this.toServerModel(resource), this.options)
      .pipe(map((json) => this.fromServerModel(json)));
  }

  update(id: string | number, resource: T, config?: string) {
    const apiUrl = config ? `${this.apiUrl}/${id}/${config}` : `${this.apiUrl}/${id}`;
    return this.httpClient
      .put(apiUrl, this.toServerModel(resource), this.options)
      .pipe(map((json) => this.fromServerModel(json)));
  }

  patch(id: string | number, resource: T, config?: string) {
    const apiUrl = config ? `${this.apiUrl}/${id}/${config}` : `${this.apiUrl}/${id}`;
    return this.httpClient
      .patch(apiUrl, this.toServerModel(resource), this.options)
      .pipe(map((json) => this.fromServerModel(json)));
  }

  delete(id: string | number, config?: string): Observable<any> {
    const apiUrl = config ? `${this.apiUrl}/${id}/${config}` : `${this.apiUrl}/${id}`;
    return this.httpClient.delete(`${apiUrl}`, this.options);
  }
}
