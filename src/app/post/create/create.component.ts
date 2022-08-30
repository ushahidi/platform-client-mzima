import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SurveysService } from '@services';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent implements OnInit {
  public data: any;
  public fields: any[] = [];

  constructor(private route: ActivatedRoute, private surveysService: SurveysService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.loadData(params.get('id'));
    });
  }

  private loadData(id?: string | null) {
    if (!id) return;
    this.surveysService.getById(id).subscribe({
      next: (data) => {
        this.data = data;
        const tmpFields = data.result.tasks[0].fields
          .sort((a: any, b: any) => a.priority - b.priority)
          .map((field: any) => {
            if (field.type === 'tags') {
              field.all_selected = false;
              field.options.map((option: any) => {
                return (option.value = false);
              });
            }
            return field;
          });
        this.fields = tmpFields;
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
