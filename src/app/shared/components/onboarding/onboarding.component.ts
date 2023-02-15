import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { EventBusService, EventType, SessionService } from '@services';
import { NgxCustomTourService } from 'ngx-custom-tour';
import { takeUntilDestroy$ } from '@helpers';

interface OnboardingStep {
  title?: string;
  icon?: string;
  content?: string;
  selector?: string | string[];
  position?: string;
  hidden?: boolean;
}

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent implements AfterViewInit {
  public isLoggedIn = false;
  private userData$ = this.sessionService.currentUserData$.pipe(takeUntilDestroy$());
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
    this.customTourService.showingStep$.subscribe({
      next: (data) => {
        if (this.activeStep === data.order) return;
        this.activeStep = data.order;

        if (data.order === 2) {
          this.router.navigate(['/map']);
        }

        if (data.order === 3) {
          this.router.navigate(['/feed']);
          setTimeout(() => {
            this.customTourService.updateHighlightedElements();
            this.isHidden = false;
          }, 1000);
        }

        if (data.order === 4) {
          this.router.navigate(['/activity']);
        }

        if (data.order === 6) {
          this.router.navigate(['/settings']);
        }
      },
    });

    this.customTourService.finish$.subscribe({
      next: () => {
        localStorage.setItem(
          this.sessionService.localStorageNameMapper('is_onboarding_done'),
          JSON.stringify(true),
        );

        this.eventBusService.next({
          type: EventType.FinishOnboarding,
          payload: true,
        });

        this.router.navigate(['/map']);
      },
    });

    this.userData$.subscribe((userData) => {
      this.isLoggedIn = !!userData.userId;
      this.username = userData.realname;
      this.initOnboardingSteps();
    });

    this.eventBusService.on(EventType.ShowOnboarding).subscribe({
      next: () => this.initOnboarding(),
    });

    this.sessionService.isFiltersVisible$.subscribe({
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
        selector: ['#sidebar-btn-data', '#sidebar-btn-map'],
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
      },
      {
        title: 'Activity',
        icon: 'activity',
        content:
          '<p>Check your deployment activity over time and by volume. Hover each line or bar to highlight it and see the details.</p>',
        selector: '#sidebar-btn-activity',
        position: 'right',
      },
      {
        title: 'Collections',
        icon: 'collections',
        content:
          '<p>To organise the deployment, you are able to create Collections. Just choose name, write description and choose viewing mode - it is that simple!</p>',
        selector: '#sidebar-btn-collections',
        position: 'right',
      },
      {
        title: 'Settings',
        icon: 'settings',
        content:
          '<p>Change your deployment in Settings. You can manage your deployment details when it comes to Surveys,  Data Sources, Importing and Donation. </p><p>Also, it allows your to export data, create categories, manage users permissions and much more!</p>',
        selector: '#sidebar-menu-button-settings',
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
    if (this.activeStep === 2) {
      this.isHidden = true;
    }
    this.customTourService.showNext();
  }

  public prevStep(): void {
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
