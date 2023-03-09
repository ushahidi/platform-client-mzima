import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { EventBusService, EventType, SessionService } from '@services';
import { NgxCustomTourService } from 'ngx-custom-tour';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

interface OnboardingStep {
  title?: string;
  icon?: string;
  content?: string;
  selector?: string | string[];
  position?: string;
  hidden?: boolean;
  dynamic?: boolean;
}

@UntilDestroy()
@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent implements AfterViewInit {
  public isLoggedIn = false;
  public onboardingSteps: OnboardingStep[];
  private username?: string;
  public isFiltersVisible: boolean;
  private activeStep: number;
  public isHidden: boolean;

  constructor(
    private router: Router,
    private customTourService: NgxCustomTourService,
    private sessionService: SessionService,
    private eventBusService: EventBusService,
  ) {
    this.customTourService.showingStep$.pipe(untilDestroyed(this)).subscribe({
      next: (data) => {
        if (this.activeStep === data.order) return;
        this.activeStep = data.order;

        if (data.order === 1 || data.order === 2 || data.order === 5) {
          this.router.navigate(['/map']);
        }

        if (data.order === 3) {
          this.router.navigate(['/feed']);
        }

        if (data.order === 4) {
          this.router.navigate(['/activity']);
        }

        if (data.order === 6) {
          this.router.navigate(['/settings']);
        }

        // if (this.onboardingSteps[data.order].dynamic) {
        //   setTimeout(() => {
        //     this.customTourService.updateHighlightedElements();
        //     this.isHidden = false;
        //   }, 1000);
        // }
      },
    });

    this.customTourService.finish$.pipe(untilDestroyed(this)).subscribe({
      next: () => {
        localStorage.setItem(
          this.sessionService.getLocalStorageNameMapper('is_onboarding_done'),
          JSON.stringify(true),
        );

        this.eventBusService.next({
          type: EventType.FinishOnboarding,
          payload: true,
        });

        this.router.navigate(['/map']);
      },
    });

    this.sessionService
      .getCurrentUserData()
      .pipe(untilDestroyed(this))
      .subscribe((userData) => {
        this.isLoggedIn = !!userData.userId;
        this.username = userData.realname;
        if (!this.onboardingSteps) {
          this.initOnboardingSteps();
        }
      });

    this.eventBusService.on(EventType.ShowOnboarding).subscribe({
      next: () => this.initOnboarding(),
    });

    this.eventBusService.on(EventType.FeedPostsLoaded).subscribe({
      next: () => {
        setTimeout(() => {
          this.customTourService.updateHighlightedElements();
          this.isHidden = false;
        }, 100);
      },
    });

    this.sessionService.isFiltersVisible$.pipe(untilDestroyed(this)).subscribe({
      next: (isFiltersVisible) => {
        setTimeout(() => {
          this.isFiltersVisible = isFiltersVisible;
        }, 1);
      },
    });
  }

  ngAfterViewInit() {
    this.initOnboarding();
  }

  private initOnboarding(): void {
    if (!this.router.url.includes('/map') && !this.router.url.includes('/feed')) {
      this.router.navigate(['/map']);
    }
    this.customTourService.initialize({
      dismissOnOverlay: false,
    });
  }

  private initOnboardingSteps(): void {
    this.onboardingSteps = [
      {
        title: `Hello${this.username ? ' ' + this.username : ''}!`,
        icon: 'greeting',
        content:
          '<p>You’ve successfully created your deployment. Now, while we polish it up, please, get along with Ushahidi features. The onboarding process will take couple of minutes.</p>',
      },
      {
        title: 'Data collection',
        icon: 'marker',
        content:
          '<p>You can see all of the collected data while moving through the Map view or on the Data view.</p>',
        selector: ['[data-onboard-id="sidebar-btn-data"]', '[data-onboard-id="sidebar-btn-map"]'],
        position: 'right',
      },
      {
        title: 'Filtering',
        icon: 'filters',
        content:
          '<p>You can filter your results by its’ Status, Categories, Date range and Location. You can also save your filters, so you can go back to them quickly.</p><p>To reduce amount of data in fast and efficient way, use left bar to choose specific Surveys and Data sources.</p>',
        selector: ['.search-form__filters', '[data-filter-highlight]'],
      },
      {
        title: 'Sorting',
        icon: 'sorting',
        content:
          '<p>You can sort the results by post date, latest updates and date creation - from newest to oldest.</p>',
        selector: '.feed-page__control--sorting',
        position: 'left',
        dynamic: true,
      },
      {
        title: 'Activity',
        icon: 'activity',
        content:
          '<p>Check your deployment activity over time and by volume. Hover each line or bar to highlight it and see the details.</p>',
        selector: '[data-onboard-id="sidebar-btn-activity"]',
        position: 'right',
      },
      {
        title: 'Collections',
        icon: 'collections',
        content:
          '<p>To organise your posts into groups, you are able to create Collections. Just choose name, write description and choose viewing mode - it is that simple!</p>',
        selector: '[data-onboard-id="sidebar-btn-collections"]',
        position: 'right',
      },
      {
        title: 'Settings',
        icon: 'settings',
        content:
          '<p>Change your deployment in Settings. You can manage your deployment details when it comes to Surveys,  Data Sources, Importing and Donation. </p><p>Also, it allows your to export data, create categories, manage users permissions and much more!</p>',
        selector: '[data-onboard-id="sidebar-menu-button-settings"]',
        position: 'right',
        hidden: !this.isLoggedIn,
      },
      {
        title: 'You’re ready!',
        icon: 'clapper',
      },
    ];
  }

  public nextStep(): void {
    if (this.onboardingSteps[this.activeStep + 1]?.dynamic) {
      this.isHidden = true;
    }
    this.customTourService.showNext();
  }

  public prevStep(): void {
    if (this.onboardingSteps[this.activeStep - 1]?.dynamic) {
      this.isHidden = true;
    }
    this.customTourService.showPrev();
  }

  public finishOnboarding(): void {
    this.customTourService.end();
  }

  public openSupportModal(): void {
    this.finishOnboarding();
    this.eventBusService.next({
      type: EventType.OpenSupportModal,
      payload: true,
    });
  }
}
