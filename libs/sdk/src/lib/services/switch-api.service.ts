import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SwitchApiService {
  private updateApi = new Subject();
  public updateApi$ = this.updateApi.asObservable();

  public switchApi(): void {
    this.updateApi.next(true);
  }
}
