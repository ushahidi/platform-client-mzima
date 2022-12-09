import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CollectionResult } from '@models';
import { CollectionsService } from '@services';

@Component({
  selector: 'app-collections-modal',
  templateUrl: './collections-modal.component.html',
  styleUrls: ['./collections-modal.component.scss'],
})
export class CollectionsModalComponent {
  public collectionList: CollectionResult[];
  public loading: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private collectionsService: CollectionsService,
  ) {
    this.getCollections();
  }

  private getCollections() {
    this.loading = true;
    const params = {
      orderby: 'created',
      order: 'desc',
    };
    this.collectionsService.getCollections(params).subscribe({
      next: (response) => {
        this.collectionList = response.results;
        this.loading = false;
      },
    });
  }
}
