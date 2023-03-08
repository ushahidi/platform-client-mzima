import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private isActive = new BehaviorSubject<boolean>(false);
  isActive$ = this.isActive.asObservable();

  public show(): void {
    this.isActive.next(true);
  }

  public hide(): void {
    this.isActive.next(false);
  }
}
