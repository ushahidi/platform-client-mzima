import { Component, OnInit } from '@angular/core';
import { CollectionResult } from '@models';
import { CollectionsService } from '@services';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss'],
})
export class CollectionsComponent implements OnInit {
  public collectionList: CollectionResult[];
  public isLoading: boolean;

  constructor(private collectionsService: CollectionsService) {}

  ngOnInit() {
    this.getCollections();
  }

  private getCollections() {
    this.isLoading = true;
    const params = {
      orderby: 'created',
      order: 'desc',
    };
    this.collectionsService.getCollections('', params).subscribe({
      next: (response) => {
        this.collectionList = response.results;
        this.isLoading = false;
      },
    });
  }
}
