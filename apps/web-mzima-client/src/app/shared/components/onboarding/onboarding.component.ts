import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { EventBusService, EventType, LanguageService, SessionService } from '@services';
import { NgxCustomTourService } from 'ngx-custom-tour';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LanguageInterface } from '@models';

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
  public username?: string;
  public isFiltersVisible: boolean;
  private activeStep: number;
  public isHidden: boolean;
  public languages: LanguageInterface[];
  public selectedLanguage$: any;

  constructor(
    private router: Router,
    private customTourService: NgxCustomTourService,
    private sessionService: SessionService,
    private eventBusService: EventBusService,
    private languageService: LanguageService,
  ) {
    this.selectedLanguage$ = this.languageService.selectedLanguage$.pipe(untilDestroyed(this));
    this.languageService.languages$
      .pipe(untilDestroyed(this))
      .subscribe((langs: LanguageInterface[]) => {
        const initialLanguage = this.languageService.initialLanguage;
        this.languages = langs.sort((lang: LanguageInterface) => {
          return lang.code == initialLanguage ? -1 : 0;
        });
      });
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
        title: 'tour.steps.0.title',
        icon: 'greeting',
        content: 'tour.steps.0.content',
      },
      {
        title: 'tour.steps.1.title',
        icon: 'marker',
        content: 'tour.steps.1.content',
        selector: ['[data-onboard-id="sidebar-btn-data"]', '[data-onboard-id="sidebar-btn-map"]'],
        position: 'right',
      },
      {
        title: 'tour.steps.2.title',
        icon: 'filters',
        content: 'tour.steps.2.content',
        selector: ['.search-form__filters', '[data-filter-highlight]'],
      },
      {
        title: 'tour.steps.3.title',
        icon: 'sorting',
        content: 'tour.steps.3.content',
        selector: '.feed-page__control--sorting',
        position: 'left',
        dynamic: true,
      },
      {
        title: 'tour.steps.4.title',
        icon: 'activity',
        content: 'tour.steps.4.content',
        selector: '[data-onboard-id="sidebar-btn-activity"]',
        position: 'right',
      },
      {
        title: 'tour.steps.5.title',
        icon: 'collections',
        content: 'tour.steps.5.content',
        selector: '[data-onboard-id="sidebar-btn-collections"]',
        position: 'right',
      },
      {
        title: 'tour.steps.6.title',
        icon: 'settings',
        content: 'tour.steps.6.content',
        selector: '[data-onboard-id="sidebar-btn-settings"]',
        position: 'right',
        hidden: !this.isLoggedIn,
      },
      {
        title: 'tour.steps.7.title',
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
