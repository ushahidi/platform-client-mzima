import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { surveyHelper } from '@helpers';
import { CollectionResult } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { CollectionsService, RolesService, SessionService } from '@services';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss'],
})
export class CollectionsComponent implements OnInit {
  public collectionList: CollectionResult[];
  public isLoading: boolean;
  views = surveyHelper.views;
  isCreation = false;
  featuredEnabled = false;
  public collectionForm: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required]],
    description: ['', []],
    featured: [false, []],
    visible_to: [false, []],
    view: ['map', []],
  });
  roleOptions: any;

  constructor(
    private matDialogRef: MatDialogRef<CollectionsComponent>,
    private collectionsService: CollectionsService,
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

  private getCollections() {
    this.isLoading = true;
    const params = {
      orderby: 'created',
      order: 'desc',
    };
    this.collectionsService.getCollections('', params).subscribe({
      next: (response) => {
        this.collectionList = response.results;
        this.isLoading = false;
      },
    });
  }

  goToCollection(collection: CollectionResult) {
    this.matDialogRef.close();
    this.router.navigate([`/`, collection.view]);
    // var viewParam = collection.view !== 'map' ? 'data' : 'map';
    // $state.go(`posts.${viewParam}.collection`, {collectionId: collection.id}, {reload: true});
  }

  saveCollection() {
    const collectionData = this.collectionForm.value;
    this.session.currentUserData$.subscribe((userData) => {
      collectionData.user_id = userData.userId;
      this.collectionsService.post(collectionData).subscribe({
        next: () => {
          this.matDialogRef.close();
        },
        error: (err) => {
          console.error('Something went wrong: ', err);
        },
      });
    });
  }

  addNewCollection() {
    this.isCreation = true;
  }
}
