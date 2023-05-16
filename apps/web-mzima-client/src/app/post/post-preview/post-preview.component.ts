import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { PostPropertiesInterface, UserInterface } from '@mzima-client/sdk';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-post-preview',
  templateUrl: './post-preview.component.html',
  styleUrls: ['./post-preview.component.scss'],
})
export class PostPreviewComponent implements OnInit, OnChanges {
  @Input() public post: PostPropertiesInterface;
  @Input() public user: UserInterface;
  @Input() public feedView?: boolean;
  @Input() public media?: any;
  @Input() public selectable?: boolean;
  @Input() public isChecked?: boolean;
  @Output() selected = new EventEmitter();
  @Output() edit = new EventEmitter();
  @Output() refresh = new EventEmitter();
  @Output() deleted = new EventEmitter();
  @Output() statusChanged = new EventEmitter();
  private details = new Subject<boolean>();
  public details$ = this.details.asObservable();
  public allowed_privileges: string | string[];

  ngOnInit() {
    this.allowed_privileges = this.post?.allowed_privileges ?? '';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['post']) {
      this.allowed_privileges = this.post?.allowed_privileges ?? '';
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
    this.deleted.emit();
  }

  public statusChangedHandle(): void {
    this.statusChanged.emit();
  }
}
