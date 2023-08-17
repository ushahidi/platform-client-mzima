import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-post-details-modal',
  templateUrl: './post-details-modal.component.html',
  styleUrls: ['./post-details-modal.component.scss'],
})
export class PostDetailsModalComponent {
  public post: any;
  public color: string;
  public editable: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private matDialogRef: MatDialogRef<PostDetailsModalComponent>,
  ) {
    this.post = data?.post;
    this.color = data?.color;
    this.editable = data?.editable;
  }

  public handleEditPost(): void {
    this.editable = !this.editable;
  }

  public cancel(): void {
    this.editable = false;
    this.matDialogRef.close();
  }

  public updated(): void {
    this.editable = false;
    this.matDialogRef.close({
      update: true,
    });
  }

  public statusChangedHandle(): void {
    this.matDialogRef.close({
      statusChanged: true,
    });
  }
}
