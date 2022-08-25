import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Event, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { SurveysService } from '@services';
import { takeUntilDestroy$ } from '@helpers';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent implements OnInit {
  public data?: any;
  public fields?: any[];
  private routerEvents = this.router.events.pipe(takeUntilDestroy$());

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private surveysService: SurveysService,
  ) {
    this.loadData();
  }

  ngOnInit(): void {
    this.routerEvents.subscribe({
      next: (event: Event) => {
        if (event instanceof NavigationStart) {
          this.fields = undefined;
        }

        if (event instanceof NavigationEnd) {
          this.loadData();
        }
      },
    });
  }

  private loadData() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.surveysService.getById(id).subscribe({
      next: (data) => {
        console.log('data: ', data);

        this.data = data;
        this.fields = data.result.tasks[0].fields.sort((a: any, b: any) => a.priority - b.priority);

        this.fields?.map((field: any) => {
          if (field.type === 'tags') {
            field.all_selected = false;
            field.options.map((option: any) => {
              option.value = false;
            });
          }
        });
      },
    });
  }

  public getOptionsByParentId(field: any, parent_id: number): any[] {
    return field.options.filter((option: any) => option.parent_id === parent_id);
  }

  public checkGroupIsChecked(value: boolean, field: any, option: any): void {
    option.value = value;

    if (
      (value && field.options.find((o: any) => o.parent_id === option.parent_id && o.value)) ||
      (!value && !field.options.find((o: any) => o.parent_id === option.parent_id && o.value))
    ) {
      field.options.find((o: any) => o.id === option.parent_id).value = value;
    }
  }

  public selectAll(value: boolean, field: any): void {
    field.options.map((option: any) => {
      option.value = value;
    });
  }
}
