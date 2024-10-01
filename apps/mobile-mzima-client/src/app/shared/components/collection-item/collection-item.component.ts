import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CollectionItem } from '@mzima-client/sdk';

@Component({
  selector: 'app-collection-item',
  templateUrl: './collection-item.component.html',
  styleUrls: ['./collection-item.component.scss'],
})
export class CollectionItemComponent {
  @Input() public collection: CollectionItem;
  @Input() public editable?: boolean;
  @Input() public userRole: string;
  @Input() public currentUserId: string;
  @Input() public canManageCollections: boolean;
  @Output() collectionChanged = new EventEmitter<boolean>();
  @Output() editCollection = new EventEmitter();

  get canEditCollection(): boolean {
    if (this.userRole === 'admin') {
      return true;
    }
    return (
      this.canManageCollections && String(this.collection.user_id) === String(this.currentUserId)
    );
  }

  public editClickHandle(event: Event): void {
    event.stopPropagation();
    this.editCollection.emit();
  }
}
