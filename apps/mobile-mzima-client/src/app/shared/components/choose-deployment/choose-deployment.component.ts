import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MainLayoutComponent } from '../main-layout/main-layout.component';
import { Deployment } from '@mzima-client/sdk';
import { Subject, debounceTime } from 'rxjs';
import { AlertService, ConfigService, DeploymentService, EnvService } from '@services';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-choose-deployment',
  templateUrl: './choose-deployment.component.html',
  styleUrls: ['./choose-deployment.component.scss'],
})
export class ChooseDeploymentComponent implements OnInit {
  @Input() isProfile: boolean;
  @Output() back = new EventEmitter();
  @Output() chosen = new EventEmitter();
  @ViewChild('layout') public layout: MainLayoutComponent;
  public isSearchView = false;
  public deploymentList: Deployment[] = [];
  public foundedDeploymentList: Deployment[] = [];
  private selectedDeployments: Deployment[] = [];
  public isDeploymentsLoading = false;
  public addButtonVisible = false;
  public currentDeploymentId?: number;
  private domain: string | null = null;
  private readonly searchSubject = new Subject<string>();

  constructor(
    private envService: EnvService,
    private configService: ConfigService,
    private deploymentService: DeploymentService,
    private router: Router,
    private alertService: AlertService,
  ) {
    this.searchSubject.pipe(debounceTime(500)).subscribe({
      next: (query: string) => {
        this.deploymentService.searchDeployments(query).subscribe({
          next: (deployments: any[]) => {
            this.isDeploymentsLoading = false;
            this.foundedDeploymentList = deployments;
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
  }

  ngOnInit(): void {
    this.loadDeployments();
  }

  public backHandle(): void {
    this.back.emit();
  }

  public loadDeployments() {
    this.deploymentList = this.deploymentService.getDeployments();

    const index = this.deploymentList.findIndex((i: any) => i.deployment_name === 'mzima-api');
    if (index === -1) {
      this.deploymentList = [
        {
          id: 1,
          domain: 'staging.ush.zone',
          subdomain: 'mzima-api',
          fqdn: 'mzima.staging.ush.zone',
          status: 'deployed',
          deployment_name: 'mzima-api',
          description: 'mzima-api for testing',
          image: 'https://via.placeholder.com/150/B186D1/FFFFFF?text=M',
          tier: 'level_1',
          selected: false,
        },
        ...this.deploymentList,
      ];
      this.deploymentService.setDeployments(this.deploymentList);
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

  public chooseDeployment(deployment: any) {
    this.deploymentService.setDeployment(deployment);
    this.envService.setDynamicBackendUrl();
    this.configService.initAllConfigurations();
    this.chosen.emit();
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
    if (query == null) {
      this.isDeploymentsLoading = false;
      this.foundedDeploymentList = [];
      this.domain = null;
    } else if (
      query.indexOf('.') != -1 ||
      query.indexOf('http:') != -1 ||
      query.indexOf('https:') != -1
    ) {
      this.isDeploymentsLoading = false;
      this.foundedDeploymentList = [];
      this.domain = query.toLowerCase().replace('http://', '').replace('https://', '');
    } else if (query.length > 0) {
      this.isDeploymentsLoading = true;
      this.domain = null;
      this.searchSubject.next(query);
    } else {
      this.isDeploymentsLoading = false;
      this.foundedDeploymentList = [];
    }
  }

  public addDeployment(): void {
    this.deploymentService.addDeployments(this.selectedDeployments);
    this.layout.closeSearchForm();
    this.foundedDeploymentList = [];
    this.addButtonVisible = false;
    this.loadDeployments();
  }
}
