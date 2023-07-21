import { Component, ViewChild } from '@angular/core';
import { ChooseCollectionComponent } from '../../shared/components';
import { Router } from '@angular/router';

@Component({
  selector: 'app-collection',
  templateUrl: 'collection.page.html',
  styleUrls: ['collection.page.scss'],
})
export class CollectionPage {
  @ViewChild('chooseCollection') chooseCollection: ChooseCollectionComponent;

  constructor(private router: Router) {}

  ionViewWillEnter(): void {
    this.chooseCollection.getCollections();
  }

  public back(): void {
    this.router.navigate(['profile']);
  }
}
