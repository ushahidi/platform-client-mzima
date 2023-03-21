import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ExportJobInterface } from '../models';
import { ResourceService } from './resource.service';
import { API_CONFIG_TOKEN, SdkConfig } from '../config';

@Injectable({
  providedIn: 'root',
})
export class ExportJobsService extends ResourceService<any> {
  constructor(
    protected override httpClient: HttpClient,
    @Inject(API_CONFIG_TOKEN) config: SdkConfig,
  ) {
    super(httpClient, config);
  }

  getApiVersions(): string {
    return 'api/v3/';
  }

  getResourceUrl(): string {
    return 'exports/jobs';
  }

  save(job: Partial<ExportJobInterface>) {
    return super.post(job);
  }

  override getById(id: string | number): Observable<ExportJobInterface> {
    return super.getById(id);
  }

  override get(url?: string | undefined, queryParams?: any): Observable<ExportJobInterface[]> {
    return super.get(url, queryParams).pipe(
      map((response) => {
        return this.processJobs(response.results);
      }),
    );
  }

  override delete(id: string | number): Observable<any> {
    return super.delete(id);
  }

  processJobs(jobs: ExportJobInterface[]) {
    return jobs.map((job) => {
      if (job.status) {
        if (!job.url_expiration) {
          job.url_expiration = '';
        } else if (Number.isInteger(job.url_expiration)) {
          job.url_expiration = new Date(+job.url_expiration * 1000).toLocaleString();
        }

        job.created_timestamp = job.created_timestamp ? job.created_timestamp : job.created;
        job.created = new Date(job.created).toLocaleString();
        job.status = job.status.toLowerCase();
      }
      return job;
    });
  }
}
