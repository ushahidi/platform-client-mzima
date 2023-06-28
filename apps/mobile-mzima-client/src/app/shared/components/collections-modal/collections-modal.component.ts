import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { InfiniteScrollCustomEvent, ModalController } from '@ionic/angular';
import {
  CollectionResult,
  CollectionsService,
  NotificationsService,
  RolesService,
  UserInterface,
} from '@mzima-client/sdk';
import { SessionService, ToastService } from '@services';
import { Observable, Subject, debounceTime, forkJoin, lastValueFrom } from 'rxjs';
import { FormControlComponent } from '../form-control/form-control.component';
import { FormBuilder, Validators } from '@angular/forms';
import { fieldErrorMessages, formHelper } from '@helpers';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

interface CollectionsParams {
  orderby: string;
  order: 'desc' | 'asc';
  limit: number;
  page: number;
  q: string;
  editableBy?: string;
}

interface CollectionItem extends CollectionResult {
  checked?: boolean;
}

@UntilDestroy()
@Component({
  selector: 'app-collections-modal',
  templateUrl: './collections-modal.component.html',
  styleUrls: ['./collections-modal.component.scss'],
})
export class CollectionsModalComponent implements OnInit {
  @Input() public postId?: string;
  @Input() public selectedCollections: Set<number>;
  @ViewChild('formControl') public formControl: FormControlComponent;
  public collections: CollectionItem[] = [];
  public isLoading = false;
  public params: CollectionsParams = {
    orderby: 'created',
    order: 'desc',
    limit: 16,
    page: 1,
    q: '',
  };
  public totalCollections: number;
  public isPristine = true;
  public isSearchView = false;
  private readonly searchSubject = new Subject<string>();
  public isAddCollectionModalOpen = false;
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
  public roleOptions: any;
  private userRole: string;
  private userData$: Observable<UserInterface>;

  constructor(
    private modalController: ModalController,
    private toastService: ToastService,
    private collectionsService: CollectionsService,
    private formBuilder: FormBuilder,
    private rolesService: RolesService,
    private sessionService: SessionService,
    private notificationsService: NotificationsService,
  ) {
    this.searchSubject.pipe(debounceTime(500)).subscribe({
      next: () => {
        this.params.page = 1;
        this.getCollections(this.params);
      },
    });

    this.userData$ = this.sessionService.currentUserData$.pipe(untilDestroyed(this));

    this.userData$.subscribe((userData) => {
      this.userRole = userData.role!;
      this.initRoles();
    });
  }

  ngOnInit(): void {
    this.getCollections(this.params);
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

  private async getCollections(params: CollectionsParams, add?: boolean): Promise<void> {
    this.isLoading = true;
    params.editableBy = this.postId ? 'me' : undefined;

    try {
      const response = await lastValueFrom(this.collectionsService.getCollections(params));
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
      await this.getCollections(this.params, true);
      (ev as InfiniteScrollCustomEvent).target.complete();
    }
  }

  public close(): void {
    this.modalController.dismiss();
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

  public showTip(): void {
    this.toastService.presentToast({
      message:
        'A "Collection" is a manually-curated group of posts. You may find it useful in grouping posts that you would like to share with external partners. It is not dynamic, meaning the posts within it do not change unless you manually update them.',
      duration: 0,
      layout: 'stacked',
      position: 'top',
    });
  }

  public collectionChanged(): void {
    this.isPristine = false;
    if (!this.postId) return;
  }

  public showSearchResults(): void {
    this.isSearchView = true;
  }

  public hideSearchResults(): void {
    this.isSearchView = false;
    this.formControl.blurInput();
  }

  public resetSearchForm(): void {
    this.params.page = 1;
    this.params.q = '';
    this.getCollections(this.params);
  }

  public searchCollections(): void {
    this.searchSubject.next(this.params.q);
  }

  public addNewCollection(): void {
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
    });
  }

  private collectionCreated(): void {
    this.createCollectionForm.enable();
    this.isAddCollectionModalOpen = false;
    this.resetSearchForm();
  }
}
