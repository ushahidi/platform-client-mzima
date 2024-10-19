import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MediaService, PostResult, UserInterface } from '@mzima-client/sdk';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-post-preview',
  templateUrl: './post-preview.component.html',
  styleUrls: ['./post-preview.component.scss'],
})
export class PostPreviewComponent implements OnInit, OnChanges {
  @Input() public post: PostResult;
  @Input() public user: UserInterface;
  @Input() public feedView?: boolean;
  @Input() public selectable?: boolean;
  @Input() public isChecked?: boolean;
  @Output() selected = new EventEmitter();
  @Output() edit = new EventEmitter();
  @Output() refresh = new EventEmitter();
  @Output() deleted = new EventEmitter();
  @Output() statusChanged = new EventEmitter();
  @Output() mediaLoaded = new EventEmitter();
  public media?: any;
  private details = new Subject<boolean>();
  public details$ = this.details.asObservable();
  private onDeleted = new Subject<PostResult>();
  public deleted$ = this.onDeleted.asObservable();
  public allowed_privileges: string | string[];

  constructor(private mediaService: MediaService) {}

  ngOnInit() {
    this.allowed_privileges = this.post?.allowed_privileges ?? '';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['post']) {
      this.allowed_privileges = this.post?.allowed_privileges ?? '';

      // Brute force extraction of the first image found in a post.
      // Ugly approach, but it stops as soon as it finds an image.
      // TODO: Optimise
      if (this.post.post_content) {
        let mediaFieldId: number = 0;
        for (const content of this.post.post_content) {
          for (const field of content.fields) {
            if (field.type === 'media') {
              if (field.input === 'upload' && field.value?.value) {
                mediaFieldId = field.value.value;
                break;
              } else if (field.input === 'image' && field.value.length > 0) {
                for (const value of field.value) {
                  if (value.value) {
                    mediaFieldId = value.value;
                    break;
                  }
                }
              }
            }
            if (mediaFieldId !== 0) break;
          }
          if (mediaFieldId !== 0) break;
        }
        if (mediaFieldId !== 0) {
          this.mediaService.getById(mediaFieldId).subscribe({
            next: (media) => {
              this.media = media.result;
              this.mediaLoaded.emit();
            },
          });
        }
      }
    }
  }

  public showDetails(): void {
    this.details.next(true);
  }

  public postClicked(event: MouseEvent): void {
    if (this.selectable) {
      event.stopPropagation();
      this.isChecked = !this.isChecked;
      this.selected.emit(this.isChecked);
    }
  }

  public deletedHandle(): void {
    if (this.feedView) {
      this.deleted.emit();
    } else {
      this.onDeleted.next(this.post);
    }
  }

  public statusChangedHandle(): void {
    this.statusChanged.emit();
  }
}
