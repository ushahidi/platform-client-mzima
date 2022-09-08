import { Component, Input, OnChanges } from '@angular/core';
import { PostPropertiesInterface } from '@models';
import { EventBusService, EventType } from '@services';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
})
export class PostComponent implements OnChanges {
  @Input() data: PostPropertiesInterface;

  constructor(private eventBusService: EventBusService) {}

  ngOnChanges(changes: any) {
    console.log('ngOnChanges> ', changes);
  }

  public showDetails(): void {
    this.eventBusService.next({ type: EventType.SHOW_POST_DETAILS, payload: this.data });
  }
}
