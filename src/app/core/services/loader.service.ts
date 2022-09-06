import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  public isActive = new Subject<boolean>();

  public show(): void {
    this.isActive.next(true);
  }

  public hide(): void {
    this.isActive.next(false);
  }
}
