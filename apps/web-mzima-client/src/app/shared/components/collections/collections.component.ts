import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { surveyHelper, formHelper } from '@helpers';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { SessionService, BreakpointService, EventBusService, EventType } from '@services';
import {
  CollectionsService,
  NotificationsService,
  RolesService,
  CollectionResult,
  PostResult,
  AccountNotificationsInterface,
} from '@mzima-client/sdk';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AlertService } from 'libs/sdk/src/lib/services/alerts.service';
import { BaseComponent } from '../../../base.component';
import { ConfirmModalService } from '../../../core/services/confirm-modal.service';
import { Permissions } from '@enums';

enum CollectionView {
  List = 'list',
  Create = 'create',
  Edit = 'edit',
}

@UntilDestroy()
@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss'],
})
export class CollectionsComponent extends BaseComponent implements OnInit {
  CollectionView = CollectionView;
  public collectionList: CollectionResult[];
  public isLoading: boolean;
  views = surveyHelper.views;
  query = '';
  currentView: CollectionView = CollectionView.List;
  featuredEnabled = false;
  searchForm: FormGroup;
  collectionForm: FormGroup;
  roleOptions: any;
  tmpCollectionToEditId = 0;
  private notification: AccountNotificationsInterface;
  private userRole: string;
  public isManageCollections: boolean;
  public formErrors: any[] = [];

  constructor(
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private matDialogRef: MatDialogRef<CollectionsComponent>,
    @Inject(MAT_DIALOG_DATA) public post: PostResult,
    private collectionsService: CollectionsService,
    private confirm: ConfirmModalService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private eventBus: EventBusService,
    private router: Router,
    private rolesService: RolesService,
    private notificationsService: NotificationsService,
    private alertService: AlertService,
  ) {
    super(sessionService, breakpointService);
    this.checkDesktop();

    this.searchForm = this.formBuilder.group({
      query: ['', []],
    });
  }

  ngOnInit() {
    this.getUserData();
    this.initializeForm();
    this.formSubscribe();
    this.checkPermission();

    const permissions = localStorage.getItem('USH_permissions')!;
    this.featuredEnabled = permissions ? permissions.split(',').includes('Manage Posts') : false;
  }

  checkPermission() {
    this.isManageCollections =
      this.user.permissions?.includes(Permissions.ManageCollections) ?? false;
    this.userRole = this.user.role!;
    if (this.isLoggedIn) {
      this.initRoles();
    }
  }

  private initializeForm() {
    this.collectionForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: [''],
      featured: [false],
      visible_to: [
        {
          value: 'everyone',
          options: ['everyone'],
          disabled: false,
        },
      ],
      view: ['map'],
      is_notifications_enabled: [false],
    });
  }

  private updateForm(field: string, value: any) {
    this.collectionForm.patchValue({ [field]: value });
  }

  private formSubscribe() {
    this.collectionForm.controls['name'].valueChanges.pipe(untilDestroyed(this)).subscribe({
      next: () => {
        this.formErrors = [];
      },
    });
  }

  private initRoles() {
    this.rolesService.getRoles().subscribe({
      next: (response) => {
        this.roleOptions = formHelper.roleTransform({
          roles: response.results,
          userRole: this.userRole,
          onlyMe: this.translate.instant('role.only_me'),
          everyone: this.translate.instant('role.everyone'),
          specificRoles: this.translate.instant('app.specific_roles'),
          isShowIcons: false,
        });
      },
    });
  }

  loadData(query = '') {
    this.isLoading = true;
    let params: any = new Map();
    params = {
      orderby: 'created',
      order: 'desc',
      q: query,
    };

    if (this.post?.id) {
      params.editableBy = 'me';
    }

    this.collectionsService.getCollections(params).subscribe({
      next: (response) => {
        this.collectionList = response.results.map((item) => {
          const isOwner = item.user_id === Number(this.user.userId);

          return {
            ...item,
            my_collection: isOwner,
            visible: this.isManageCollections || !(item.featured && !isOwner),
          };
        });
        this.collectionList = this.collectionList.filter((collection) => collection.visible);
        this.isLoading = false;
      },
    });
  }

  isPostInCollection(collection: CollectionResult) {
    return this.post?.sets?.some((set) => set === collection.id);
  }

  onCheckChange(isChecked: boolean, item: CollectionResult) {
    if (isChecked) {
      this.collectionsService.addToCollection(item.id, this.post.id).subscribe();
      this.alertService.showMessage(`Post added to the ${item.name} collection`);
    } else {
      this.collectionsService.removeFromCollection(item.id, this.post.id).subscribe();
      this.alertService.showMessage(`Post removed from the ${item.name} collection`);
    }
  }

  async deleteCollection(collection: CollectionResult) {
    const confirmed = await this.confirm.open({
      title: collection.name,
      description: this.translate.instant('notify.collection.delete_collection_confirm'),
    });

    if (!confirmed) return;

    this.collectionsService.delete(collection.id).subscribe(() => {
      this.eventBus.next({ type: EventType.DeleteCollection, payload: collection.id });
      this.collectionList = this.collectionList.filter((c) => c.id !== collection.id);
    });
  }

  editCollection(collection: CollectionResult) {
    this.collectionForm.patchValue({
      name: collection.name,
      description: collection.description,
      featured: collection.featured,
      view: collection.view,
    });

    this.updateForm(
      'visible_to',
      formHelper.mapRoleToVisible(collection.role, !!collection.featured),
    );

    this.tmpCollectionToEditId = collection.id;
    this.currentView = CollectionView.Edit;

    this.notificationsService.get(String(collection.id)).subscribe({
      next: (response) => {
        this.notification = response.results[0];
        this.collectionForm.patchValue({
          is_notifications_enabled: !!this.notification,
        });
      },
    });
  }

  goToCollection(collection: CollectionResult) {
    this.matDialogRef.close();
    this.router.navigate([
      `/`,
      collection.view === 'map' ? 'map' : 'feed',
      'collection',
      collection.id,
    ]);
    // var viewParam = collection.view !== 'map' ? 'data' : 'map';
    // $state.go(`posts.${viewParam}.collection`, {collectionId: collection.id}, {reload: true});
  }

  withoutManageCollectionsPrivilege(checked: boolean = false) {
    this.updateForm('visible_to', {
      value: 'only_me',
      options: [this.userRole],
      disabled: checked,
    });
  }

  saveCollection() {
    if (!this.isManageCollections) this.withoutManageCollectionsPrivilege();
    const collectionData = this.collectionForm.value;

    const visibleTo = collectionData.visible_to.value;
    if (visibleTo === 'only_me') {
      collectionData.role = ['me'];
      collectionData['view_only']['only_me'] = true;
    } else if (visibleTo === 'everyone') {
      collectionData.role = ['everyone'];
    } else {
      collectionData.role = collectionData.visible_to.options;
    }
    delete collectionData.visible_to;

    collectionData.user_id = Number(this.user.userId);
    if (this.currentView === CollectionView.Create) {
      this.collectionsService.post(collectionData).subscribe({
        next: () => {
          this.matDialogRef.close();
        },
        error: ({ error }) => {
          this.formErrors = error.errors.failed_validations;
        },
      });
    } else {
      this.collectionsService.update(this.tmpCollectionToEditId, collectionData).subscribe({
        next: () => {
          this.eventBus.next({
            type: EventType.UpdateCollection,
            payload: this.tmpCollectionToEditId,
          });
          this.matDialogRef.close();
        },
        error: ({ error }) => {
          this.formErrors = error.errors.failed_validations;
        },
      });
    }

    if (!this.notification && collectionData.is_notifications_enabled) {
      this.notificationsService.post({ set_id: String(this.tmpCollectionToEditId) }).subscribe();
    } else if (this.notification && !collectionData.is_notifications_enabled) {
      this.notificationsService.delete(this.notification.id).subscribe();
    }
  }

  addNewCollection() {
    this.currentView = CollectionView.Create;
    this.initializeForm();
    this.formSubscribe();
  }

  public closeModal(): void {
    this.formErrors = [];
    if (this.currentView !== CollectionView.List) {
      this.currentView = CollectionView.List;
    } else {
      this.matDialogRef.close();
    }
  }
}
