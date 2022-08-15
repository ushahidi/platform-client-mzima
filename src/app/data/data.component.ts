import { Component } from '@angular/core';
import { SessionService } from '../core/services';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
})
export class DataComponent {
  constructor(public sessionService: SessionService) {}
}
