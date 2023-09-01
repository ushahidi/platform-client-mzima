import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable, Subject, debounceTime, forkJoin, lastValueFrom } from 'rxjs';
import { fieldErrorMessages, formHelper } from '@helpers';
import { FormBuilder, Validators } from '@angular/forms';
import { InfiniteScrollCustomEvent, ModalController } from '@ionic/angular';
import { SessionService } from '@services';
import {
  CollectionItem,
  CollectionsService,
  NotificationsService,
  RolesService,
  UserInterface,
} from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

interface CollectionsParams {
  orderby: string;
  order: 'desc' | 'asc';
  limit: number;
  page: number;
  q: string;
  editableBy?: string;
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
  private userRole: string;
  private userData$: Observable<UserInterface>;
  public isLoading = false;
  public isSearchView = false;
  public isPristine = true;
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
    private notificationsService: NotificationsService,
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
      this.initRoles();
    });
  }

  ionViewWillEnter(): void {
    this.getCollections();
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

  public addNewCollection(): void {
    this.isAddCollectionModalOpen = true;
    this.collectionToEdit = '';
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

  public updateCollections(): void {
    if (!this.postId) return;

    const addToCollectionObservables = this.collections
      .filter((c) => c.checked && !this.selectedCollections.has(c.id))
      .map((c) => {
        this.selectedCollections.add(c.id);
        return this.collectionsService.addToCollection(c.id, this.postId!);
      });

    const checkedCollections = this.collections.filter((c) => c.checked);

    const removeFromCollectionObservables = [...this.selectedCollections]
      .filter((id) => checkedCollections.findIndex((c) => c.id === id) === -1)
      .map((id) => {
        this.selectedCollections.delete(id);
        return this.collectionsService.removeFromCollection(id, this.postId!);
      });

    forkJoin([...addToCollectionObservables, ...removeFromCollectionObservables]).subscribe({
      next: () => {
        this.modalController.dismiss({
          collections: Array.from(this.selectedCollections || []),
          changed: true,
        });
      },
      error: ({ error }) => {
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

    this.updateForm(
      'visible_to',
      formHelper.mapRoleToVisible(collection.role, !!collection.featured),
    );

    this.notificationsService.get(String(collection.id)).subscribe({
      next: (response) => {
        const notification = response.results[0];
        this.createCollectionForm.patchValue({
          is_notifications_enabled: !!notification,
        });
      },
    });
  }

  private updateForm(field: string, value: any) {
    this.createCollectionForm.patchValue({ [field]: value });
  }

  public showCollection(collectionId: number): void {
    // TODO: Open collection page
    console.log('showCollection: ', collectionId);
  }
}
