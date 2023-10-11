import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApiVersionDetailsModalComponent } from './api-version-details-modal/api-version-details-modal.component';

@Component({
  selector: 'app-api-version-toast-message',
  templateUrl: './api-version-toast-message.component.html',
  styleUrls: ['./api-version-toast-message.component.scss'],
})
export class ApiVersionToastMessageComponent implements OnChanges {
  @Input() public isOpen = false;
  @Input() public isAdmin = false;
  @Input() public currentApiVersion: string;
  @Output() closeMessage = new EventEmitter();
  private apiVersionDetailsModal?: MatDialogRef<ApiVersionDetailsModalComponent>;

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
    this.apiVersionDetailsModal = this.dialog.open(ApiVersionDetailsModalComponent, {
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
