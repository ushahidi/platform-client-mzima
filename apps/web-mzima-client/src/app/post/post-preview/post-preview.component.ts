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
      const mediaField = this.post.post_content?.flatMap((post_content) => {
        return post_content.fields.filter((field) => {
          return field.type === 'media' && field.value?.id;
        });
      })[0];
      if (mediaField?.value?.id) {
        this.mediaService.getById(mediaField.value.value).subscribe({
          next: (media) => {
            this.media = media.result;
            this.mediaLoaded.emit();
          },
        });
      }
    }
  }

  public showDetails(): void {
    this.details.next(true);
  }

  public postClicked(event: Event): void {
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
