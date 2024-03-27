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
  tip?: string;
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
        // title: `app.onboarding_modal.start.title${this.username ? ' ' + this.username : ''}!`,
        title: 'app.onboarding_modal.start.title',
        icon: 'greeting',
        content: 'app.onboarding_modal.start.content',
      },
      {
        title: 'app.onboarding_modal.data_collection.title',
        icon: 'marker',
        content: 'app.onboarding_modal.data_collection.content',
        selector: ['[data-onboard-id="sidebar-btn-data"]', '[data-onboard-id="sidebar-btn-map"]'],
        position: 'right',
      },
      {
        title: 'app.onboarding_modal.filtering.title',
        icon: 'filters',
        content: 'app.onboarding_modal.filtering.content.description',
        tip: 'app.onboarding_modal.filtering.content.tip',
        selector: ['.search-form__filters', '[data-filter-highlight]'],
      },
      {
        title: 'app.onboarding_modal.sorting.title',
        icon: 'sorting',
        content: 'app.onboarding_modal.sorting.content',
        selector: '.feed-page__control--sorting',
        position: 'left',
        dynamic: true,
      },
      {
        title: 'app.onboarding_modal.activity.title',
        icon: 'activity',
        content: 'app.onboarding_modal.activity.title',
        selector: '[data-onboard-id="sidebar-btn-activity"]',
        position: 'right',
      },
      {
        title: 'app.onboarding_modal.collections.title',
        icon: 'collections',
        content: 'app.onboarding_modal.collections.content',
        selector: '[data-onboard-id="sidebar-btn-collections"]',
        position: 'right',
      },
      {
        title: 'app.onboarding_modal.settings.title',
        icon: 'settings',
        content: 'app.onboarding_modal.settings.content.description',
        tip: 'app.onboarding_modal.settings.content.tip',
        selector: '[data-onboard-id="sidebar-btn-settings"]',
        position: 'right',
        hidden: !this.isLoggedIn,
      },
      {
        title: 'app.onboarding_modal.end',
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
