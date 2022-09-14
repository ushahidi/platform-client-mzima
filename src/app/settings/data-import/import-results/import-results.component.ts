import { Component, OnInit } from '@angular/core';
import { PollingService } from '@services';

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

  constructor(private pollingService: PollingService) {}

  ngOnInit(): void {
    this.pollingService.getImportJobs();
    this.pollingService.importFinished$.subscribe((job: any) => {
      this.importFinished = true;
      this.collectionId = job.collection_id;
      this.filename = job.filename;
      console.log('importFinished$', job);
    });
  }
}
