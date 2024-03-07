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
import { DataImportService, ExportJobsService, ExportJobInterface } from '@mzima-client/sdk';
import { EventBusService, EventType } from './event-bus.service';
import { NotificationService } from './notification.service';
import { EnvService } from './env.service';

@Injectable({
  providedIn: 'root',
})
export class PollingService implements OnDestroy {
  private currentPool = {
    importing: 0,
    exporting: 0,
  };
  stopImportPolling = new Subject();
  stopExportPolling = new Subject();
  private importFinished = new Subject();
  importFinished$ = this.importFinished.asObservable();
  private renderer;

  constructor(
    private dataImportService: DataImportService,
    private exportJobsService: ExportJobsService,
    private notificationService: NotificationService,
    private env: EnvService,
    private rendererFactory: RendererFactory2,
    private eventBusService: EventBusService,
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  getImportJobs() {
    this.dataImportService.get().subscribe((allJobs) => {
      const q = allJobs.results
        .filter((job: any) => job.status !== 'SUCCESS' && job.status !== 'FAILED')
        .map((j: any) => this.dataImportService.getById(j.id));
      this.startImportPolling(q);
    });
  }

  getImportJobsById(jobs: string[]) {
    const q = jobs.map((j) => this.dataImportService.getById(j));
    this.startImportPolling(q);
  }

  private startImportPolling(queries: Observable<any>[]) {
    this.currentPool.importing = queries.length;
    const nextQueries: Observable<any>[] = [];
    timer(this.env.environment.export_polling_interval || 30 * 1000)
      .pipe(
        switchMap(() => forkJoin(queries)),
        retry(),
        share(),
        takeUntil(this.stopImportPolling),
      )
      .subscribe((result) => {
        result.forEach((job: ExportJobInterface) => {
          if (job.status === 'SUCCESS') {
            this.notificationService.showError('JOB SUCCESSFUL');
            this.importFinished.next(job);
          } else if (job.status === 'FAILED') {
            this.notificationService.showError('JOB FAILED');
          } else {
            nextQueries.push(this.dataImportService.getById(job.id));
          }
        });
        if (nextQueries.length) {
          this.startImportPolling(nextQueries);
        } else {
          this.currentPool.importing = 0;
        }
      });
  }

  private showNotification(type: 'success' | 'error' | 'started') {
    switch (type) {
      case 'success':
        this.notificationService.showSnackbar(
          {
            icon: {
              color: 'success',
              name: 'thumb-up',
            },
            title: 'notify.export.upload_complete',
            buttons: [
              {
                color: 'primary',
                text: 'notify.export.confirmation',
              },
            ],
          },
          {
            duration: 0,
            wide: true,
          },
        );
        break;

      case 'started':
        this.notificationService.showSnackbar(
          {
            icon: {
              color: 'success',
              name: 'ellipses',
            },
            title: 'notify.export.in_progress',
            isLoading: true,
            buttons: [
              {
                color: 'danger',
                text: 'notify.export.cancel_export',
                handler: () => {
                  this.stopExportPolling.next(true);
                  this.eventBus(false);
                },
              },
              {
                color: 'primary',
                text: 'notify.export.confirmation',
              },
            ],
          },
          {
            duration: 0,
            wide: true,
          },
        );
        break;
      default:
        this.notificationService.showError('Failed to export');
        break;
    }
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
        this.showNotification('started');
        this.startExportPolling([this.exportJobsService.getById(job.id)]);
        return job.id;
      }),
    );
  }

  getCurrentPool() {
    return this.currentPool;
  }

  private startExportPolling(queries: Observable<any>[]) {
    this.eventBus(true);
    this.currentPool.exporting = queries.length;

    const nextQueries: Observable<any>[] = [];
    timer(6000)
      .pipe(
        switchMap(() => forkJoin(queries)),
        retry(),
        share(),
        takeUntil(this.stopExportPolling),
      )
      .subscribe((result) => {
        result.forEach((job) => {
          if (job.status === 'SUCCESS') {
            if (job.send_to_browser) {
              this.downloadFile(job.url);
              this.showNotification('success');
            } else {
              this.showNotification('success');
            }
          } else if (job.status === 'FAILED') {
            this.showNotification('error');
          } else {
            nextQueries.push(this.exportJobsService.getById(job.id));
          }
          this.eventBus(false);
        });
        if (nextQueries.length) {
          this.startExportPolling(nextQueries);
        } else {
          this.currentPool.exporting = 0;
        }
      });
  }

  eventBus(value: boolean) {
    this.eventBusService.next({
      type: EventType.StopExportPolling,
      payload: { process: value },
    });
  }

  ngOnDestroy() {
    this.stopImportPolling.next(true);
    this.stopExportPolling.next(true);
  }
}
