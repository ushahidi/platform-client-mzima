import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AddPostModalComponent } from '@post';
import { EventBusService, EventType, BreakpointService } from '@services';
import { Observable } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-submit-post-button',
  templateUrl: './submit-post-button.component.html',
  styleUrls: ['./submit-post-button.component.scss'],
})
export class SubmitPostButtonComponent implements OnInit {
  public isDesktop$: Observable<boolean>;

  constructor(
    private dialog: MatDialog,
    private eventBusService: EventBusService,
    private breakpointService: BreakpointService,
    private router: Router,
  ) {
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(untilDestroyed(this));
  }

  ngOnInit() {
    this.eventBusService.on(EventType.AddPostButtonSubmit).subscribe({
      next: () => this.addPost(),
    });
  }

  public async addPost(): Promise<void> {
    const dialogRef = this.dialog.open(AddPostModalComponent, {
      width: '100%',
      maxWidth: 615,
      panelClass: 'modal',
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
