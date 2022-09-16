import { Injectable, OnDestroy, RendererFactory2 } from '@angular/core';
import {
  Observable,
  Subject,
  switchMap,
  timer,
  retry,
  share,
  takeUntil,
  forkJoin,
  map,
} from 'rxjs';
import { ExportJobInterface } from '@models';
import { DataImportService } from './data-import.service';
import { ExportJobsService } from './export-jobs.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class PollingService implements OnDestroy {
  stopPolling = new Subject();
  private importFinished = new Subject();
  importFinished$ = this.importFinished.asObservable();
  private renderer = this.rendererFactory.createRenderer(null, null);

  constructor(
    private dataImportService: DataImportService,
    private exportJobsService: ExportJobsService,
    private notificationService: NotificationService,
    private rendererFactory: RendererFactory2,
  ) {}

  getImportJobs() {
    this.dataImportService.get().subscribe((allJobs) => {
      const q = allJobs.results
        .filter((job: any) => job.status !== 'SUCCESS' && job.status !== 'FAILED')
        .map((j: any) => this.dataImportService.getById(j.id));
      this.startImportPolling(q);
    });
  }

  private startImportPolling(queries: Observable<any>[]) {
    const nextQueries: Observable<any>[] = [];
    timer(6000)
      .pipe(
        switchMap(() => forkJoin(queries)),
        retry(),
        share(),
        takeUntil(this.stopPolling),
      )
      .subscribe((result) => {
        console.log('RESULT', result);
        result.forEach((job: ExportJobInterface) => {
          if (job.status === 'SUCCESS') {
            this.notificationService.showError('JOB SUCCESS SUCCESS');
          } else if (job.status === 'FAILED') {
            this.notificationService.showError('JOB FAILED');
          } else {
            nextQueries.push(this.dataImportService.getById(job.id));
          }
        });
        if (nextQueries.length) {
          this.startImportPolling(nextQueries);
        }
      });
  }

  private downloadFile(downloadUrl: string) {
    const URL = window.URL || window.webkitURL;

    const anchor: HTMLAnchorElement = this.renderer.createElement('a');
    anchor.href = downloadUrl;
    this.renderer.appendChild(document.body, anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
    }, 0);
  }

  startExport(query: Partial<ExportJobInterface>) {
    query.entity_type = 'post';

    return this.exportJobsService.save(query).pipe(
      map((job) => {
        this.notificationService.showError('JOB STARTED');
        this.startExportPolling([this.exportJobsService.getById(job.id)]);
        return job.id;
      }),
    );
  }

  private startExportPolling(queries: Observable<any>[]) {
    const nextQueries: Observable<any>[] = [];
    timer(6000)
      .pipe(
        switchMap(() => forkJoin(queries)),
        retry(),
        share(),
        takeUntil(this.stopPolling),
      )
      .subscribe((result) => {
        result.forEach((job) => {
          if (job.status === 'SUCCESS') {
            if (job.send_to_browser) {
              this.downloadFile(job.url);
            } else {
              this.notificationService.showError('JOB SUCCESS');
            }
          } else if (job.status === 'FAILED') {
            this.notificationService.showError('JOB FAILED');
          } else {
            this.notificationService.showError('JOB PENDING');
            nextQueries.push(this.exportJobsService.getById(job.id));
          }
        });
        if (nextQueries.length) {
          this.startExportPolling(nextQueries);
        }
      });
  }

  ngOnDestroy() {
    this.stopPolling.next(true);
  }
}
