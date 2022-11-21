import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-twitter-widget',
  templateUrl: './twitter-widget.component.html',
  styleUrls: ['./twitter-widget.component.scss'],
})
export class TwitterWidgetComponent {
  @Input() public id: string;
}
