import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { InfoToastDetailsModalComponent } from './info-toast-details-modal/info-toast-details-modal.component';

@Component({
  selector: 'app-info-toast-message',
  templateUrl: './info-toast-message.component.html',
  styleUrls: ['./info-toast-message.component.scss'],
})
export class InfoToastMessageComponent implements OnChanges {
  @Input() public isOpen = false;
  @Input() public isAdmin = false;
  @Input() public currentApiVersion: string;
  @Output() closeMessage = new EventEmitter();
  private apiVersionDetailsModal?: MatDialogRef<InfoToastDetailsModalComponent>;

  constructor(private dialog: MatDialog) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isAdmin'] && this.apiVersionDetailsModal) {
      if (changes['isAdmin'].currentValue) {
        this.apiVersionDetailsModal.componentInstance.data.isAdmin =
          changes['isAdmin'].currentValue;
      } else {
        this.apiVersionDetailsModal.componentInstance.closeModal();
      }
    }
  }

  public async openApiInstructionsModal(): Promise<void> {
    this.apiVersionDetailsModal = this.dialog.open(InfoToastDetailsModalComponent, {
      width: '100%',
      maxWidth: 448,
      panelClass: [
        'modal',
        'deployment-info-modal',
        this.isAdmin ? 'deployment-info-modal--admin' : '',
      ],
      data: {
        isAdmin: this.isAdmin,
      },
    });
  }

  public closeToastMessage(): void {
    this.closeMessage.emit();
  }
}
