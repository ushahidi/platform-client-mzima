import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { surveyHelper, formHelper } from '@helpers';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { SessionService, BreakpointService, EventBusService, EventType } from '@services';
import {
  CollectionsService,
  NotificationsService,
  RolesService,
  CollectionResult,
  PostResult,
  UserInterface,
  AccountNotificationsInterface,
} from '@mzima-client/sdk';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';
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
export class CollectionsComponent implements OnInit {
  CollectionView = CollectionView;
  private userData$: Observable<UserInterface>;
  public isDesktop$: Observable<boolean>;
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
  isLoggedIn = true;
  private notification: AccountNotificationsInterface;
  private userRole: string;
  public isManageCollections: boolean;
  public formErrors: any[] = [];

  constructor(
    private matDialogRef: MatDialogRef<CollectionsComponent>,
    @Inject(MAT_DIALOG_DATA) public post: PostResult,
    private collectionsService: CollectionsService,
    private confirm: ConfirmModalService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private eventBus: EventBusService,
    private router: Router,
    private session: SessionService,
    private rolesService: RolesService,
    private breakpointService: BreakpointService,
    private notificationsService: NotificationsService,
  ) {
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(untilDestroyed(this));
    this.userData$ = this.session.currentUserData$.pipe(untilDestroyed(this));
    this.searchForm = this.formBuilder.group({
      query: ['', []],
    });
  }

  ngOnInit() {
    this.initializeForm();
    this.formSubscribe();
    this.userData$.subscribe((userData) => {
      this.isManageCollections =
        userData.permissions?.includes(Permissions.ManageCollections) ?? false;
      this.userRole = userData.role!;
      this.isLoggedIn = !!userData.userId;
      if (this.isLoggedIn) {
        this.initRoles();
      }
    });

    const permissions = localStorage.getItem('USH_permissions')!;
    // console.log(permissions);
    if (permissions) {
      this.featuredEnabled = permissions.split(',').includes('Manage Posts');
    } else {
      this.featuredEnabled = false;
    }

    this.getCollections();
  }

  private initializeForm() {
    this.collectionForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: [''],
      featured: [false],
      visible_to: [
        {
          value: 'everyone',
          options: [],
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

  getCollections(query = '') {
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
        this.collectionList = response.results;
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
    } else {
      this.collectionsService.removeFromCollection(item.id, this.post.id).subscribe();
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

  featuredChange(event: MatSlideToggleChange) {
    this.updateForm('visible_to', {
      value: 'only_me',
      options: [this.userRole],
      disabled: event.checked,
    });
  }

  saveCollection() {
    const collectionData = this.collectionForm.value;
    collectionData.role =
      this.collectionForm.value.visible_to.value === 'everyone'
        ? null
        : this.collectionForm.value.visible_to.options;
    collectionData.featured = collectionData.visible_to.value === 'only_me';
    delete collectionData.visible_to;
    this.userData$.subscribe((userData) => {
      collectionData.user_id = userData.userId;
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
    });

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
