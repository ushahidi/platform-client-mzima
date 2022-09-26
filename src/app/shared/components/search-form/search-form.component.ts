import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { CategoryInterface, Savedsearch, SurveyItem } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { CategoriesService, PostsService, SurveysService } from '@services';
import { SavedsearchesService } from 'src/app/core/services/savedsearches.service';
import { SaveSearchModalComponent } from '../save-search-modal/save-search-modal.component';

interface CategoryFlatNode {
  expandable: boolean;
  name: string;
  id: number | string;
  level: number;
}

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss'],
})
export class SearchFormComponent {
  @ViewChild('select') select: MatSelect;
  public _array = Array;
  public onFocus = false;
  public isDropdownOpen = false;
  public form: FormGroup = this.formBuilder.group({
    sorting: [
      {
        orderBy: 'created',
        order: 'desc',
      },
    ],
    order_unlocked_on_top: [true],
    status: [['published', 'draft']],
    categories: this.formBuilder.array([]),
    sources: [],
    surveys: [],
    date_after: [],
    date_before: [],
    location: [],
    location_distance: ['1'],
  });
  public activeFilters: any;
  public sortingOptions = [
    {
      orderBy: 'global_filter.sort.orderby.post_date',
      order: 'global_filter.sort.order.desc',
      value: {
        orderBy: 'post_date',
        order: 'desc',
      },
    },
    {
      orderBy: 'global_filter.sort.orderby.post_date',
      order: 'global_filter.sort.order.asc',
      value: {
        orderBy: 'post_date',
        order: 'asc',
      },
    },
    {
      orderBy: 'global_filter.sort.orderby.created',
      order: 'global_filter.sort.order.desc',
      value: {
        orderBy: 'created',
        order: 'desc',
      },
    },
    {
      orderBy: 'global_filter.sort.orderby.created',
      order: 'global_filter.sort.order.asc',
      value: {
        orderBy: 'created',
        order: 'asc',
      },
    },
    {
      orderBy: 'global_filter.sort.orderby.updated',
      order: 'global_filter.sort.order.desc',
      value: {
        orderBy: 'updated',
        order: 'desc',
      },
    },
    {
      orderBy: 'global_filter.sort.orderby.updated',
      order: 'global_filter.sort.order.asc',
      value: {
        orderBy: 'updated',
        order: 'asc',
      },
    },
  ];
  public savedsearches: Savedsearch[];
  public statuses = [
    {
      value: 'published',
      name: 'post.published',
      icon: 'globe',
    },
    {
      value: 'draft',
      name: 'post.draft',
      icon: 'document',
    },
    {
      value: 'archived',
      name: 'post.archived',
      icon: 'box',
    },
  ];
  public surveyList: SurveyItem[] = [];
  public sources = [
    {
      name: 'Email',
      value: 'email',
    },
    {
      name: 'SMS',
      value: 'sms',
    },
    {
      name: 'Twitter',
      value: 'twitter',
    },
    {
      name: 'Web',
      value: 'web',
    },
  ];
  public categories: CategoryInterface[];
  public activeSavedSearch?: Savedsearch;
  public activeSavedSearchValue?: string;
  public distanceOptions = [
    {
      value: '1',
      label: 'global_filter.option_1',
    },
    {
      value: '10',
      label: 'global_filter.option_2',
    },
    {
      value: '50',
      label: 'global_filter.option_3',
    },
    {
      value: '100',
      label: 'global_filter.option_4',
    },
    {
      value: '500',
      label: 'global_filter.option_5',
    },
  ];
  public total: number;
  public onMapPostsCount: number;
  public isMapView: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private savedsearchesService: SavedsearchesService,
    private surveysService: SurveysService,
    private categoriesService: CategoriesService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private postsService: PostsService,
  ) {
    this.savedsearchesService.get().subscribe({
      next: (response) => {
        this.savedsearches = response.results;

        this.savedsearches.map((search) => {
          if (search.filter?.status === 'all') {
            search.filter.status = ['published', 'draft', 'archived'];
          }
        });
      },
    });

    this.surveysService.get().subscribe({
      next: (response) => {
        this.surveyList = response.results;
      },
    });

    this.categoriesService.get().subscribe({
      next: (response) => {
        this.categories = response.results;
        this.dataSource.data = this.categories
          .filter((category) => !category.parent_id)
          .map((category) => {
            return {
              id: category.id,
              name: category.tag,
              children: this.categories
                .filter((cat) => cat.parent_id === category.id)
                .map((cat) => {
                  return {
                    id: cat.id,
                    name: cat.tag,
                  };
                }),
            };
          });
      },
    });

    this.form.valueChanges.subscribe({
      next: (values) => {
        console.log('change: ', values);
        this.postsService.applyFilters({
          has_location: 'all',
          order: values.sorting.order,
          order_unlocked_on_top: values.order_unlocked_on_top,
          orderby: values.sorting.orderBy,
          'source[]': values.source,
          'status[]': values.status,
          'tags[]': values.categories,
          date_after: values.date_after ? new Date(values.date_after).toISOString() : null,
          date_before: values.date_before ? new Date(values.date_before).toISOString() : null,
        });
      },
    });

    this.postsService.totalPosts$.subscribe({
      next: (total) => {
        this.total = total;
      },
    });

    // this.router.events.pipe(filter(event => event instanceof NavigationStart)).subscribe({
    //   next: (params: any) => {
    //     this.isMapView = params.url === '/map';
    //     console.log('isMapView: ', this.isMapView);
    //   },
    // });
  }

  public setSortingValue(option: any, value: any): boolean {
    return option.order === value.order && option.orderBy === value.orderBy;
  }

  private _transformer = (node: any, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      id: node.id,
      level: level,
    };
  };

  public treeControl = new FlatTreeControl<CategoryFlatNode>(
    (node) => node.level,
    (node) => node.expandable,
  );

  private treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children,
  );

  public dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  public inputOnFocus(): void {
    this.onFocus = true;
  }

  public inputOnBlur(): void {
    this.onFocus = false;
  }

  public onCheckChange(event: MatCheckboxChange, field: string) {
    this.form.markAsDirty();
    const formArray: FormArray = this.form.get(field) as FormArray;
    if (event.checked) {
      formArray.push(new FormControl(event.source.value));
    } else {
      const index = formArray.controls.findIndex((ctrl: any) => ctrl.value == event.source.value);
      if (index > -1) {
        formArray.removeAt(index);
      }
    }
  }

  public hasChild = (_: number, node: CategoryFlatNode) => node.expandable;

  public getCategoriesName(categories: number[]): string {
    return categories
      .reduce((acc: string[], categoryId: number) => {
        const tag = this.categories.find((category) => category.id === categoryId)?.tag;
        return tag ? [...acc, tag] : acc;
      }, [])
      .join(', ');
  }

  public saveSearch(isUpdate?: boolean): void {
    const dialogRef = this.dialog.open(SaveSearchModalComponent, {
      width: '100%',
      maxWidth: 480,
      height: 'auto',
      maxHeight: '90vh',
      data: {
        title: !isUpdate
          ? this.translate.instant('set.create_savedsearch')
          : this.translate.instant('set.update_savedsearch'),
      },
    });

    dialogRef.afterClosed().subscribe({
      next: (result: any) => {
        if (!result || result === 'cancel') return;
        console.log('result: ', result);
      },
    });
  }

  public applySavedFilter(event: MatSelectChange): void {
    this.activeSavedSearch = this.savedsearches.find((search) => search.id === event.value);
    if (this.activeSavedSearch) {
      if (
        this.activeSavedSearch.filter.status &&
        !this._array.isArray(this.activeSavedSearch.filter.status)
      ) {
        this.activeSavedSearch.filter.status = [this.activeSavedSearch.filter.status];
      }
      this.form.patchValue(this.activeSavedSearch.filter);
    } else {
      this.form.reset();
    }
  }

  public resetSavedFilter(): void {
    this.activeSavedSearch = undefined;
    this.activeSavedSearchValue = undefined;
  }

  public formChanged(event: any): void {
    console.log('formChanged: ', event);
  }

  public toggleDropdown(state?: boolean): void {
    this.isDropdownOpen = state || !this.isDropdownOpen;
  }
}
