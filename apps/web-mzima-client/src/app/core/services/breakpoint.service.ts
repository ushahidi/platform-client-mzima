import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

@Injectable({
  providedIn: 'root',
})
export class BreakpointService {
  private isDesktop = new BehaviorSubject<boolean>(false);
  public isDesktop$ = this.isDesktop.asObservable();

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver
      .observe(['(max-width: 1024px)'])
      .subscribe((result: BreakpointState) => {
        this.isDesktop.next(!result.matches);
      });
  }
}
