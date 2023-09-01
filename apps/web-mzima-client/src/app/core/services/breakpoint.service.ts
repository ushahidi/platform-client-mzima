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
    this.breakpointObserveAndSubscribe('(min-width: 1025px)');
    this.breakpointObserveAndSubscribe('(max-width: 1024px)');
  }

  breakpointObserveAndSubscribe(width: string) {
    this.breakpointObserver.observe([width]).subscribe((result: BreakpointState) => {
      this.isDesktop.next(!result.matches);
    });
  }
}
