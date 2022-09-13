import { Injectable } from '@angular/core';
import { Observable, Subject, switchMap, timer, retry, share, takeUntil, forkJoin, of } from 'rxjs';
import { DataImportService } from './data-import.service';

@Injectable({
  providedIn: 'root',
})
export class PollingService {
  jobs$: Observable<any[]> = of([]);

  private stopPolling = new Subject();
  private importFinished = new Subject();
  importFinished$ = this.importFinished.asObservable();
  private inProgress: string[] | number[] = [];

  constructor(private dataImportService: DataImportService) {}

  getImportJobs() {
    this.dataImportService.get().subscribe((allJobs) => {
      this.inProgress = allJobs.results
        .filter((job: any) => job.status !== 'SUCCESS' && job.status !== 'FAILED')
        .map((j: any) => j.id);
      if (this.inProgress.length) {
        this.jobsMessing().subscribe((messing) => {
          messing.forEach((job) => {
            if (job.status === 'SUCCESS') {
              this.importFinished.next(job);
            }
          });
        });
      }
    });
  }

  jobsMessing() {
    return timer(1, 5000).pipe(
      switchMap(() => forkJoin(this.inProgress.map((id) => this.dataImportService.getById(id)))),
      retry(),
      share(),
      takeUntil(this.stopPolling),
    );
  }

  ngOnDestroy() {
    this.stopPolling.next(true);
  }
}
