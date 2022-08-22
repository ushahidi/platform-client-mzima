import { Component, Input, OnChanges } from '@angular/core';
import { PostPropertiesInterface } from '@models';

@Component({
  selector: 'app-post-popup',
  templateUrl: './post-popup.component.html',
  styleUrls: ['./post-popup.component.scss'],
})
export class PostPopupComponent implements OnChanges {
  @Input() data: PostPropertiesInterface;

  ngOnChanges(changes: any) {
    console.log('ngOnChanges> ', changes);
  }
}
