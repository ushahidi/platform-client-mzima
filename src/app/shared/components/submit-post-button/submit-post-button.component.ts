import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AddPostModalComponent } from '@post';

@Component({
  selector: 'app-submit-post-button',
  templateUrl: './submit-post-button.component.html',
  styleUrls: ['./submit-post-button.component.scss'],
})
export class SubmitPostButtonComponent {
  constructor(private dialog: MatDialog, private router: Router) {}

  public addPost(): void {
    const dialogRef = this.dialog.open(AddPostModalComponent, {
      width: '100%',
      maxWidth: '564px',
      minWidth: '300px',
    });

    dialogRef.afterClosed().subscribe({
      next: (response) => {
        if (response?.type) {
          this.router.navigate(['/post/create', response.type]);
        }
      },
    });
  }
}
