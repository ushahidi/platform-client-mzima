import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-contact-modal',
  templateUrl: './delete-contact-modal.component.html',
  styleUrls: ['./delete-contact-modal.component.scss'],
})
export class DeleteContactModalComponent {
  constructor(private matDialogRef: MatDialogRef<DeleteContactModalComponent>) {}

  cancel() {
    this.matDialogRef.close();
  }

  submit() {
    this.matDialogRef.close();
  }
}
