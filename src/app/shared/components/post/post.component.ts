import { Component, Input, OnChanges } from '@angular/core';
import { PostPropertiesInterface } from '@models';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
})
export class PostComponent implements OnChanges {
  @Input() post: PostPropertiesInterface;
  @Input() feedView: boolean;
  private details = new Subject<boolean>();
  public details$ = this.details.asObservable();

  ngOnChanges(changes: any) {
    console.log('ngOnChanges> ', changes);
  }

  public showDetails(): void {
    this.details.next(true);
  }
}
