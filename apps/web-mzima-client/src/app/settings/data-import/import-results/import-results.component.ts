import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {PollingService} from "../../../core/services/polling.service";
// import { PollingService } from '@services';

@Component({
  selector: 'app-import-results',
  templateUrl: './import-results.component.html',
  styleUrls: ['./import-results.component.scss'],
})
export class ImportResultsComponent implements OnInit {
  importFinished = false;
  filename: string;
  collectionId: any;
  importJobs: any;
  pollingInfo: any;
  document: any = document;

  constructor(
    private pollingService: PollingService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const jobId = this.route.snapshot.queryParamMap.get('job')?.split(',');
    if (jobId) {
      this.pollingService.getImportJobsById(jobId);
      this.pollingService.importFinished$.subscribe((job: any) => {
        this.importFinished = true;
        this.collectionId = job.collection_id;
        this.filename = job.filename;
      });
    } else {
      this.pollingService.getImportJobs();
      this.pollingService.importFinished$.subscribe((job: any) => {
        this.importFinished = true;
        this.collectionId = job.collection_id;
        this.filename = job.filename;
      });
    }
  }

  getPollingInfo() {
    this.pollingInfo = this.pollingService.getCurrentPool();
  }
}
