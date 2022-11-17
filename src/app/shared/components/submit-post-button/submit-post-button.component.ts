import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AddPostModalComponent, CreateComponent } from '@post';
import { ConfirmModalService, EventBusService, EventType } from '@services';

@Component({
  selector: 'app-submit-post-button',
  templateUrl: './submit-post-button.component.html',
  styleUrls: ['./submit-post-button.component.scss'],
})
export class SubmitPostButtonComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    private router: Router,
    private translate: TranslateService,
    private confirmModalService: ConfirmModalService,
    private eventBusService: EventBusService,
  ) {}

  ngOnInit() {
    this.eventBusService.on(EventType.AddPostButtonSubmit).subscribe({
      next: () => this.addPost(),
    });
  }

  public async addPost(): Promise<void> {
    const dialogRef = this.dialog.open(AddPostModalComponent, {
      width: '100%',
      maxWidth: '615px',
      minWidth: '300px',
    });

    dialogRef.afterClosed().subscribe({
      next: (response) => {
        if (response?.type) {
          this.dialog.open(CreateComponent, {
            width: '100%',
            maxWidth: '564px',
            minWidth: '300px',
            maxHeight: '700px',
            minHeight: '350px',
            data: response.type,
          });
          // this.router.navigate(['/post/create', response.type]);
        }
      },
    });
  }
}
