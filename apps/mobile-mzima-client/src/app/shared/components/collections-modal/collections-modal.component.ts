import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ChooseCollectionComponent } from '@components';

@Component({
  selector: 'app-collections-modal',
  templateUrl: './collections-modal.component.html',
  styleUrls: ['./collections-modal.component.scss'],
})
export class CollectionsModalComponent implements AfterViewInit {
  @ViewChild('chooseCollection') public chooseCollection: ChooseCollectionComponent;

  @Input() public postId?: string;
  @Input() public selectedCollections: Set<number> = new Set();

  constructor(private modalController: ModalController) {}

  ngAfterViewInit(): void {
    this.chooseCollection.getCollections();
  }

  public close(): void {
    this.modalController.dismiss();
  }
}
