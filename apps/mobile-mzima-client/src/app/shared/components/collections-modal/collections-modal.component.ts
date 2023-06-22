import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { InfiniteScrollCustomEvent, ModalController } from '@ionic/angular';
import { CollectionResult, CollectionsService } from '@mzima-client/sdk';
import { ToastService } from '@services';
import { Subject, debounceTime, lastValueFrom } from 'rxjs';
import { FormControlComponent } from '../form-control/form-control.component';
import { FormBuilder, Validators } from '@angular/forms';
import { fieldErrorMessages } from '@helpers';

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
    notifications: [true],
  });
  public fieldErrorMessages = fieldErrorMessages;

  constructor(
    private modalController: ModalController,
    private toastService: ToastService,
    private collectionsService: CollectionsService,
    private formBuilder: FormBuilder,
  ) {
    this.searchSubject.pipe(debounceTime(500)).subscribe({
      next: () => {
        this.params.page = 1;
        this.getCollections(this.params);
      },
    });
  }

  ngOnInit(): void {
    this.getCollections(this.params);
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

  public close(collections?: Set<number>): void {
    this.modalController.dismiss({ collections });
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

  public collectionChanged(state: any, collectionId: number): void {
    this.isPristine = false;
    if (!this.postId) return;
    if (state) {
      this.collectionsService.addToCollection(collectionId, this.postId).subscribe({
        next: () => {
          this.selectedCollections.add(collectionId);
        },
      });
    } else {
      this.collectionsService.removeFromCollection(collectionId, this.postId).subscribe({
        next: () => {
          this.selectedCollections.delete(collectionId);
        },
      });
    }
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
    console.log('createCollection');
  }
}
