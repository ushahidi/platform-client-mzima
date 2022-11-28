import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PostPropertiesInterface } from '@models';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-post-preview',
  templateUrl: './post-preview.component.html',
  styleUrls: ['./post-preview.component.scss'],
})
export class PostPreviewComponent {
  @Input() public post: PostPropertiesInterface;
  @Input() public feedView?: boolean;
  @Input() public media?: any;
  @Input() public selectable?: boolean;
  @Input() public isChecked?: boolean;
  @Output() selected = new EventEmitter();
  private details = new Subject<boolean>();
  public details$ = this.details.asObservable();

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
}
