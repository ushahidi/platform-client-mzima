import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, debounceTime, forkJoin, lastValueFrom } from 'rxjs';
import { fieldErrorMessages, formHelper } from '@helpers';
import { FormBuilder, Validators } from '@angular/forms';
import { InfiniteScrollCustomEvent, ModalController } from '@ionic/angular';
import {
  AlertService,
  DatabaseService,
  NetworkService,
  SessionService,
  ToastService,
} from '@services';
import {
  CollectionItem,
  CollectionsService,
  NotificationsService,
  RolesService,
  UserInterface,
} from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { STORAGE_KEYS } from '@constants';

interface CollectionsParams {
  orderby: string;
  order: 'desc' | 'asc';
  limit: number;
  page: number;
  q: string;
  editableBy?: string;
}

enum CollectionAction {
  Add = 'add',
  Remove = 'remove',
}

@UntilDestroy()
@Component({
  selector: 'app-choose-collection',
  templateUrl: './choose-collection.component.html',
  styleUrls: ['./choose-collection.component.scss'],
})
export class ChooseCollectionComponent {
  @Input() public postId?: string;
  @Input() public editable?: boolean;
  @Input() public isProfile?: boolean;
  @Input() public selectedCollections: Set<number> = new Set();
  @Output() back = new EventEmitter();
  public isAddCollectionModalOpen = false;
  public canManageCollections: boolean;
  collectionToEdit: string | number;
  public createCollectionForm = this.formBuilder.group({
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
    is_notifications_enabled: [true],
  });
  public fieldErrorMessages = fieldErrorMessages;
  readonly searchSubject = new Subject<string>();
  public params: CollectionsParams = {
    orderby: 'created',
    order: 'desc',
    limit: 16,
    page: 1,
    q: '',
    editableBy: 'me',
  };
  public roleOptions: any;
  public userRole: string;
  public currentUserId: any;
  public userPermissions: string;
  private userData$: Observable<UserInterface>;
  public isLoading = false;
  public isSearchView = false;
  public isPristine = true;
  isConnection = true;
  public collections: CollectionItem[] = [];
  public totalCollections: number;
  public viewingModeOptions = [
    {
      label: 'Map',
      value: 'map',
    },
    {
      label: 'Data',
      value: 'data',
    },
  ];

  constructor(
    private modalController: ModalController,
    private collectionsService: CollectionsService,
    private formBuilder: FormBuilder,
    private rolesService: RolesService,
    private sessionService: SessionService,
    private networkService: NetworkService,
    private alertService: AlertService,
    private toastService: ToastService,
    private notificationsService: NotificationsService,
    private databaseService: DatabaseService,
    private router: Router,
  ) {
    this.searchSubject.pipe(debounceTime(500)).subscribe({
      next: (query: string) => {
        this.params.page = 1;
        this.params.q = query;
        this.getCollections();
      },
    });

    this.userData$ = this.sessionService.currentUserData$.pipe(untilDestroyed(this));

    this.userData$.subscribe((userData) => {
      this.userRole = userData.role!;
      this.currentUserId = userData.userId;
      this.userPermissions = Array.isArray(userData.permissions)
        ? userData.permissions.join(',')
        : userData.permissions!;

      this.canManageCollections = this.checkManageCollections(userData);
      this.initRoles();
    });
  }

  private checkManageCollections(userData: UserInterface): boolean {
    if (Array.isArray(userData.permissions!)) {
      const hasPermission = userData.permissions!.includes('Manage Collections and Saved Searches');
      return hasPermission;
    } else {
      console.log('User doesnt have the collection management rights');
      return false;
    }
  }

  async ionViewWillEnter() {
    this.initNetworkListener();
    await this.checkNetwork();
    this.getCollections();
  }

  private async checkNetwork() {
    this.setConnectionStatus(await this.networkService.checkNetworkStatus());
  }

  private initNetworkListener() {
    this.networkService.networkStatus$.pipe(untilDestroyed(this)).subscribe({
      next: (value) => {
        this.setConnectionStatus(value);
      },
    });
  }

  private setConnectionStatus(status: boolean) {
    this.isConnection = status;
  }

  private initRoles() {
    this.rolesService.getRoles().subscribe({
      next: (response) => {
        this.roleOptions = formHelper.roleTransform({
          roles: response.results,
          userRole: this.userRole,
          onlyMe: 'Only me',
          everyone: 'Everyone',
          specificRoles: 'Specific roles...',
        });
      },
    });
  }

  public async getCollections(add?: boolean): Promise<void> {
    this.isLoading = true;

    try {
      const response = await lastValueFrom(this.collectionsService.getCollections(this.params));
      this.collections = add ? [...this.collections, ...response.results] : response.results;
      this.collections.map(
        (collection) => (collection.checked = this.selectedCollections.has(collection.id)),
      );
      this.totalCollections = response.meta.total;
      this.isLoading = false;
    } catch (error) {
      console.error(error);
      const response = await this.databaseService.get(STORAGE_KEYS.COLLECTIONS);
      if (response) {
        console.log('Database Collections: ', response);
        this.collections = response.results;
        this.collections.map(
          (collection) => (collection.checked = this.selectedCollections.has(collection.id)),
        );
        this.totalCollections = response.meta?.total;
      }
      this.isLoading = false;
    }
  }

  public async loadMoreCollections(ev: any): Promise<void> {
    if (this.totalCollections > this.collections.length && this.params.page) {
      this.params.page++;
      await this.getCollections(true);
      (ev as InfiniteScrollCustomEvent).target.complete();
    }
  }

  featuredChange(checked: boolean = false) {
    this.updateForm('visible_to', {
      value: 'only_me',
      options: [this.userRole],
      disabled: checked,
    });
  }

  public addNewCollection(): void {
    this.collectionToEdit = '';
    this.createCollectionForm.patchValue({
      name: '',
      description: '',
      featured: false,
      view: 'map',
      is_notifications_enabled: true,
    });
    this.isAddCollectionModalOpen = true;
  }

  public createCollection(): void {
    this.createCollectionForm.disable();
    const collectionData: any = this.createCollectionForm.value;
    collectionData.role =
      this.createCollectionForm.value.visible_to === 'everyone'
        ? null
        : (this.createCollectionForm.value.visible_to as any).options;
    collectionData.featured = collectionData.visible_to.value === 'only_me';
    delete collectionData.visible_to;

    this.userData$.subscribe((userData) => {
      collectionData.user_id = userData.userId;
      if (this.collectionToEdit) {
        this.collectionsService.update(this.collectionToEdit, collectionData).subscribe({
          next: (response) => {
            if (collectionData.is_notifications_enabled) {
              this.notificationsService.post({ set_id: String(response.result.id) }).subscribe({
                next: () => {
                  this.collectionCreated();
                },
                error: ({ error }) => {
                  console.error(error);
                  this.createCollectionForm.enable();
                },
              });
            } else {
              this.collectionCreated();
            }
          },
          error: ({ error }) => {
            console.error(error);
            this.createCollectionForm.enable();
          },
        });
      } else {
        this.collectionsService.post(collectionData).subscribe({
          next: (response) => {
            if (collectionData.is_notifications_enabled) {
              this.notificationsService.post({ set_id: String(response.result.id) }).subscribe({
                next: () => {
                  this.collectionCreated();
                },
                error: ({ error }) => {
                  console.error(error);
                  this.createCollectionForm.enable();
                },
              });
            } else {
              this.collectionCreated();
            }
          },
          error: ({ error }) => {
            console.error(error);
            this.createCollectionForm.enable();
          },
        });
      }
    });
  }

  public async updateCollections() {
    if (!this.postId) return;
    const collectionActions: any[] = [];
    this.collections
      .filter((c) => c.checked && !this.selectedCollections.has(c.id))
      .map((c) => {
        this.selectedCollections.add(c.id);
        collectionActions.push({
          action: CollectionAction.Add,
          postId: this.postId,
          collectionId: c.id,
        });
        // return this.collectionsService.addToCollection(c.id, this.postId!);
      });

    const checkedCollections = this.collections.filter((c) => c.checked);

    [...this.selectedCollections]
      .filter((id) => checkedCollections.findIndex((c) => c.id === id) === -1)
      .map((id) => {
        this.selectedCollections.delete(id);
        collectionActions.push({
          action: CollectionAction.Remove,
          postId: this.postId,
          collectionId: id,
        });
        // return this.collectionsService.removeFromCollection(id, this.postId!);
      });

    await this.offlineStore(collectionActions);

    console.log('11111', this.isConnection);
    if (this.isConnection) {
      await this.updateCollection();
    } else {
      this.toastService.presentToast({
        header: 'Success',
        message: `Post will be added/removed to collections when connection restores.`,
        buttons: [],
      });
      this.modalController.dismiss();
    }
  }

  /**
   * Storing collection edit indexedb
   */
  async offlineStore(collectionsArray: any[]) {
    const pendingCollections: any[] =
      (await this.databaseService.get(STORAGE_KEYS.PENDING_COLLECTIONS)) || [];
    const collectionsToStore = [...pendingCollections, ...collectionsArray];
    await this.databaseService.set(STORAGE_KEYS.PENDING_COLLECTIONS, collectionsToStore);
  }

  /**
   * Upload collection actions from indexedb
   */
  async updateCollection() {
    const pendingCollections: any[] = await this.databaseService.get(
      STORAGE_KEYS.PENDING_COLLECTIONS,
    );
    const observables = [...pendingCollections].map((item) => {
      if (item.action === CollectionAction.Add) {
        return this.collectionsService.addToCollection(item.collectionId, item.postId);
      } else {
        return this.collectionsService.removeFromCollection(item.collectionId, item.postId);
      }
    });
    forkJoin(observables).subscribe({
      next: async () => {
        await this.databaseService.set(STORAGE_KEYS.PENDING_COLLECTIONS, []);
        this.modalController.dismiss({
          collections: Array.from(this.selectedCollections || []),
          changed: true,
        });
      },
      error: ({ error }) => {
        this.modalController.dismiss({
          collections: Array.from(this.selectedCollections || []),
          changed: true,
        });
        console.error(error);
      },
    });
  }

  private collectionCreated(): void {
    this.createCollectionForm.enable();
    this.isAddCollectionModalOpen = false;
    this.resetSearchForm();
  }

  public resetSearchForm(): void {
    this.params.page = 1;
    this.params.q = '';
    this.getCollections();
  }

  public close(): void {
    this.modalController.dismiss();
  }

  public collectionChanged(state: boolean, collection: CollectionItem): void {
    this.isPristine = false;
    collection.checked = state;
  }

  public editCollectionHandle(collection: CollectionItem): void {
    this.isAddCollectionModalOpen = true;
    this.collectionToEdit = collection.id;

    this.createCollectionForm.patchValue({
      name: collection.name,
      description: collection.description,
      featured: collection.featured,
      view: collection.view,
      is_notifications_enabled: false,
    });

    this.updateForm('visible_to', formHelper.mapRoleToVisible(collection.role));

    this.notificationsService.get(String(collection.id)).subscribe({
      next: (response) => {
        const notification = response.results[0];
        this.createCollectionForm.patchValue({
          is_notifications_enabled: !!notification,
        });
      },
    });
  }

  async deleteCollection() {
    const result = await this.alertService.presentAlert({
      header: `Are you sure you want to delete this collection?`,
      message: 'This action cannot be undone. Please proceed with caution.',
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
      this.collectionsService.delete(this.collectionToEdit).subscribe(() => {
        this.toastService.presentToast({
          message: `Collection has been successfully deleted`,
        });
        this.modalController.dismiss();
        this.getCollections();
      });
    }
  }

  private updateForm(field: string, value: any) {
    this.createCollectionForm.patchValue({ [field]: value });
  }

  public showCollection(collectionId: number): void {
    this.router.navigate([`/collection/${collectionId}`]);
  }
}
