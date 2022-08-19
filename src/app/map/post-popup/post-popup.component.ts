import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-post-popup',
  templateUrl: './post-popup.component.html',
  styleUrls: ['./post-popup.component.scss'],
})
export class PostPopupComponent implements OnChanges {
  @Input() data: any;

  ngOnChanges(changes: any) {
    console.log('ngOnChanges> ', changes);
  }
}
