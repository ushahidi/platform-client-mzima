import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { MainLayoutComponent } from '../main-layout/main-layout.component';
import { Deployment } from '@mzima-client/sdk';
import { Subject, debounceTime } from 'rxjs';
import {
  AlertService,
  AuthService,
  ConfigService,
  DeploymentService,
  EnvService,
  // IntercomService,
} from '@services';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ToastService } from '@services';

@UntilDestroy()
@Component({
  selector: 'app-choose-deployment',
  templateUrl: './choose-deployment.component.html',
  styleUrls: ['./choose-deployment.component.scss'],
})
export class ChooseDeploymentComponent {
  @Input() isProfile: boolean;
  @Output() back = new EventEmitter();
  @Output() chosen = new EventEmitter();
  @ViewChild('layout') public layout: MainLayoutComponent;
  public isSearchView = false;
  public showSearch = true;
  public deploymentList: Deployment[] = [];
  public foundDeploymentList: Deployment[] = [];
  private selectedDeployments: Deployment[] = [];
  public isDeploymentsLoading = false;
  public addButtonVisible = false;
  public currentDeploymentId?: number | string;
  private domain: string | null = null;
  private readonly searchSubject = new Subject<string>();

  tap = 0;

  constructor(
    private envService: EnvService,
    private configService: ConfigService,
    private deploymentService: DeploymentService,
    private alertService: AlertService,
    private authService: AuthService, // private intercomService: IntercomService,
    protected toastService: ToastService,
    protected platform: Platform,
  ) {
    this.showSearch = true;
    this.searchSubject.pipe(debounceTime(500)).subscribe({
      next: (query: string) => {
        console.log('Search Subject', query);
        this.deploymentService.searchDeployments(query).subscribe({
          next: (deployments: any[]) => {
            console.log(deployments);
            this.isDeploymentsLoading = false;
            this.foundDeploymentList = deployments;
          },
          error: (err: any) => {
            this.isDeploymentsLoading = false;
            console.log(err);
          },
        });
      },
    });

    this.deploymentService.deployment$.pipe(untilDestroyed(this)).subscribe({
      next: (deployment) => {
        this.currentDeploymentId = deployment?.id;
      },
    });

    if (!this.isProfile && this.platform.is('android')) {
      this.platform.backButton.subscribeWithPriority(65, () => {
        console.log('back button via hardware click from choose deployment view');

        this.tap++;
        console.log('Back Button Tap', this.tap);
        if (this.tap === 3) App.exitApp();
        else if (this.tap === 2) this.doubleTapExistToast();
      });
    }
  }

  public loadDeployments() {
    this.deploymentList = this.deploymentService.getDeployments();

    if (this.deploymentService.hasDuplicates(this.deploymentList)) {
      this.deploymentService.setDeployments(
        this.deploymentService.removeDuplicates(this.deploymentList),
      );
      this.deploymentList = this.deploymentService.getDeployments();
    }
  }

  public async callModal(event: any) {
    const result = await this.alertService.presentAlert({
      header: 'Are you sure you want to delete this deployment?',
      message: 'Deleting means that from now you will not see it in your deployment list.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'confirm',
          cssClass: 'danger',
        },
      ],
    });

    if (result.role === 'confirm') {
      const { deployment } = event;
      this.removeDeployment(deployment.id);
    }
  }

  public removeDeployment(deploymentId: number) {
    const index = this.deploymentList.findIndex((i: any) => i.id === deploymentId);
    if (index !== -1) this.deploymentList.splice(index, 1);
    this.deploymentService.setDeployments(this.deploymentList);
  }

  public async chooseDeployment(deployment: Deployment) {
    const currentDeployment = this.deploymentService.getDeployment() ?? null;
    this.authService.logout();
    this.deploymentService.setDeployment(deployment);
    this.envService.setDynamicBackendUrl();
    try {
      await this.configService.initAllConfigurations();
      deployment.isOutdated = false;
      this.deploymentService.updateDeployment(deployment.id, { isOutdated: false });
      this.chosen.emit();
    } catch (error: any) {
      if (error.status === 404) {
        deployment.isOutdated = true;
        this.deploymentService.updateDeployment(deployment.id, { isOutdated: true });
        this.showDeploymentOutdatedWarning();
        this.deploymentService.setDeployment(currentDeployment);
        this.envService.setDynamicBackendUrl();
        await this.configService.initAllConfigurations();
      }
    }
  }

  private showDeploymentOutdatedWarning(): void {
    this.alertService.presentAlert({
      icon: {
        name: 'warning',
        color: 'danger',
      },
      header: 'Outdated Deployment!',
      message:
        "<p>We're sorry, but the deployment option you're trying to select is not supported by the application as the administrator hasn't updated it yet. Until the update is performed, the deployment won't function properly.</p><p>If you are the administrator of this deployment, please feel free to contact us for more information.</p>",
      buttons: [
        // {
        //   text: 'Contact us',
        //   cssClass: 'medium',
        //   handler: () => {
        //     this.intercomService.displayMessenger();
        //   },
        // },
        {
          text: 'Ok',
          cssClass: 'primary',
        },
      ],
    });
  }

  public selectDeployment(event: any) {
    const { checked, deployment } = event;
    if (checked) {
      if (this.selectedDeployments.some((i: any) => i.id === deployment.id)) {
        return;
      }
      this.selectedDeployments.push(deployment);
    } else {
      const index = this.selectedDeployments.findIndex((i: any) => i.id === deployment.id);
      if (index !== -1) {
        this.selectedDeployments.splice(index, 1);
      }
    }
    this.addButtonVisible = !!this.selectedDeployments.length;
  }

  public searchDeployments(query: string | null): void {
    console.log('Search Deployments', query);
    if (query == null) {
      this.isDeploymentsLoading = false;
      this.foundDeploymentList = [];
      this.domain = null;
    } else if (
      // query.indexOf('.') != -1 ||
      query.indexOf('http:') != -1 ||
      query.indexOf('https:') != -1
    ) {
      this.isDeploymentsLoading = false;
      this.foundDeploymentList = [];
      this.domain = query;
      // const value = this.deploymentService.removeDomainForSearch(this.domain);
      console.log('Domain for search', this.domain);
      this.searchSubject.next(this.domain);
    } else if (query.length > 0) {
      this.isDeploymentsLoading = true;
      this.domain = null;
      this.searchSubject.next(query);
    } else {
      this.isDeploymentsLoading = false;
      this.foundDeploymentList = [];
    }
  }

  public addDeployment(): void {
    console.log('Selected Deployments', this.selectedDeployments);
    this.deploymentService.addDeployments(this.selectedDeployments);
    this.layout.closeSearchForm();
    this.foundDeploymentList = [];
    this.addButtonVisible = false;
    this.loadDeployments();
  }

  public backHandle(): void {
    this.showSearch = false;
    this.back.emit();
  }

  protected async doubleTapExistToast() {
    const result = await this.toastService.presentToast({
      message: 'Tap back button again to exit the App',
      buttons: [],
    });
    if (result) {
      this.tap = 0;
    }
  }
}
