import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import 'types-wm';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class DonationService {
  private total = 0;
  private scale = 9;

  isMonetizationStarted = false;
  private donate = new BehaviorSubject<any>({});
  donate$ = this.donate.asObservable();

  constructor(private session: SessionService) {}

  setupMonetization() {
    if (document.monetization) {
      document.monetization.addEventListener('monetizationpending', () => {
        console.log('Initializing Web Monetization .');
      });

      document.monetization.addEventListener('monetizationstart', (event) => {
        if (event.detail.paymentPointer === this.session.getSiteConfigurations().donation?.wallet) {
          // $rootScope.$broadcast('event:donation:started');
          console.log('Web Monetization Started.');
          this.isMonetizationStarted = true;
        }
      });

      document.monetization.addEventListener('monetizationprogress', (event) => {
        // initialize currency and scale on first progress event
        if (this.total === 0) {
          this.scale = event.detail.assetScale;
        }

        this.total += Number(event.detail.amount);

        const formattedAmount = (this.total * Math.pow(10, -this.scale)).toFixed(this.scale);

        this.donate.next({ formattedAmount, assetCode: event.detail.assetCode });
      });

      document.monetization.addEventListener('monetizationstop', () => {
        console.log('Web Monetization Stopped.');
        this.isMonetizationStarted = false;
      });
    }
  }
}
