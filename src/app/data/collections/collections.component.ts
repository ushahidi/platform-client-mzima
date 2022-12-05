import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { surveyHelper } from '@helpers';
import { CollectionResult } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { CollectionsService, ConfirmModalService, RolesService, SessionService } from '@services';

enum CollectionView {
  List = 'list',
  Create = 'create',
  Edit = 'edit',
}

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss'],
})
export class CollectionsComponent implements OnInit {
  CollectionView = CollectionView;
  public collectionList: CollectionResult[];
  public isLoading: boolean;
  views = surveyHelper.views;
  query = '';
  currentView: CollectionView = CollectionView.List;
  featuredEnabled = false;
  searchForm: FormGroup = this.formBuilder.group({
    query: ['', []],
  });
  collectionForm: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required]],
    description: ['', []],
    featured: [false, []],
    visible_to: [false, []],
    view: ['map', []],
  });
  roleOptions: any;
  tmpCollectionToEditId = 0;

  constructor(
    private matDialogRef: MatDialogRef<CollectionsComponent>,
    private collectionsService: CollectionsService,
    private confirm: ConfirmModalService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private router: Router,
    private session: SessionService,
    private rolesService: RolesService,
  ) {}

  ngOnInit() {
    this.getCollections();
    this.featuredEnabled = true; //hasPermission Manage Posts
    this.rolesService.get().subscribe({
      next: (response) => {
        this.roleOptions = [
          {
            name: 'Only me',
            value: 'only_me',
            // icon: 'person',
          },
          {
            name: this.translate.instant('role.everyone'),
            value: 'everyone',
            // icon: 'person',
          },
          {
            name: this.translate.instant('app.specific_roles'),
            value: 'specific',
            // icon: 'group',
            options: response.results.map((role) => {
              return {
                name: role.display_name,
                value: role.name,
                checked: role.name === 'admin',
                disabled: role.name === 'admin',
              };
            }),
          },
        ];
      },
    });
  }

  getCollections(query = '') {
    this.isLoading = true;
    const params = {
      orderby: 'created',
      order: 'desc',
      q: query,
    };
    this.collectionsService.getCollections('', params).subscribe({
      next: (response) => {
        this.collectionList = response.results;
        this.isLoading = false;
      },
    });
  }

  async deleteCollection(collection: CollectionResult, event: Event) {
    event?.stopPropagation();
    const confirmed = await this.confirm.open({
      title: collection.name,
      description: this.translate.instant('notify.collection.delete_collection_confirm'),
    });

    if (!confirmed) return;

    this.collectionsService.delete(collection.id).subscribe(() => {
      this.collectionList = this.collectionList.filter((c) => c.id !== collection.id);
    });
  }

  private tmpMapRoleToVisible(role?: string[]) {
    if (role && role.length > 0) {
      return {
        value: 'specific',
        options: role,
      };
    } else {
      return {
        value: 'everyone',
        options: [],
      };
    }
  }

  editCollection(collection: CollectionResult, event: Event) {
    event?.stopPropagation();
    this.collectionForm.patchValue({
      name: collection.name,
      description: collection.description,
      featured: collection.featured,
      visible_to: this.tmpMapRoleToVisible(collection.role),
      view: collection.view,
    });
    this.tmpCollectionToEditId = collection.id;
    this.currentView = CollectionView.Edit;
  }

  goToCollection(collection: CollectionResult) {
    this.matDialogRef.close();
    this.router.navigate([`/`, collection.view === 'map' ? 'map' : 'feed']);
    // var viewParam = collection.view !== 'map' ? 'data' : 'map';
    // $state.go(`posts.${viewParam}.collection`, {collectionId: collection.id}, {reload: true});
  }

  saveCollection() {
    const collectionData = this.collectionForm.value;
    collectionData.role = collectionData.visible_to.options;
    this.session.currentUserData$.subscribe((userData) => {
      collectionData.user_id = userData.userId;

      if (this.currentView === CollectionView.Create) {
        this.collectionsService.post(collectionData).subscribe({
          next: () => {
            this.matDialogRef.close();
          },
          error: (err) => {
            console.error('Something went wrong: ', err);
          },
        });
      } else {
        this.collectionsService.update(this.tmpCollectionToEditId, collectionData).subscribe({
          next: () => {
            this.matDialogRef.close();
          },
          error: (err) => {
            console.error('Something went wrong: ', err);
          },
        });
      }
    });
  }

  addNewCollection() {
    this.currentView = CollectionView.Create;
  }
}
