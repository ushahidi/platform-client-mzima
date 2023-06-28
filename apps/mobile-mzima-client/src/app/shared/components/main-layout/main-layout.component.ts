import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent {
  @Input() public title?: string;
  @Output() back = new EventEmitter();
}
