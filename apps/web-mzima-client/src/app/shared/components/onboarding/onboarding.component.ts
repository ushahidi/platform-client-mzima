import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { EventBusService, EventType, SessionService } from '@services';
import { NgxCustomTourService } from 'ngx-custom-tour';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';

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
    private translate: TranslateService,
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
        title: this.translate.instant('onboarding.greeting', { username: this.username || '' }),
        icon: 'greeting',
        content: this.translate.instant('onboarding.intro'),
      },
      {
        title: this.translate.instant('onboarding.data_collection.title'),
        icon: 'marker',
        content: this.translate.instant('onboarding.data_collection.content'),
        selector: ['[data-onboard-id="sidebar-btn-data"]', '[data-onboard-id="sidebar-btn-map"]'],
        position: 'right',
      },
      {
        title: this.translate.instant('onboarding.filtering.title'),
        icon: 'filters',
        content: this.translate.instant('onboarding.filtering.content'),
        selector: ['.search-form__filters', '[data-filter-highlight]'],
      },
      {
        title: this.translate.instant('onboarding.sorting.title'),
        icon: 'sorting',
        content: this.translate.instant('onboarding.sorting.content'),
        selector: '.feed-page__control--sorting',
        position: 'left',
        dynamic: true,
      },
      {
        title: this.translate.instant('onboarding.activity.title'),
        icon: 'activity',
        content: this.translate.instant('onboarding.activity.content'),
        selector: '[data-onboard-id="sidebar-btn-activity"]',
        position: 'right',
      },
      {
        title: this.translate.instant('onboarding.collections.title'),
        icon: 'collections',
        content: this.translate.instant('onboarding.collections.content'),
        selector: '[data-onboard-id="sidebar-btn-collections"]',
        position: 'right',
      },
      {
        title: this.translate.instant('onboarding.settings.title'),
        icon: 'settings',
        content: this.translate.instant('onboarding.settings.content'),
        selector: '[data-onboard-id="sidebar-btn-settings"]',
        position: 'right',
        hidden: !this.isLoggedIn,
      },
      {
        title: this.translate.instant('onboarding.ready'),
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
