import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SearchService } from '@services';
import { Subject, debounceTime } from 'rxjs';

export interface SearchResponse {
  boundingbox: string[];
  class: string;
  display_name: string;
  icon: string;
  importance: number;
  lat: string;
  licence: string;
  lon: string;
  osm_id: number;
  osm_type: string;
  place_id: number;
  type: string;
}

@Component({
  selector: 'app-location-select',
  templateUrl: './location-select.component.html',
  styleUrls: ['./location-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LocationSelectComponent),
      multi: true,
    },
  ],
})
export class LocationSelectComponent implements ControlValueAccessor {
  @Input() public disabled = false;

  value?: { from: string; to: string };
  onChange: any = () => {};
  onTouched: any = () => {};

  public query = '';
  public results: any[] = [];
  public radiusValue = 1;
  public radiusOptions = [
    {
      value: 1,
      label: 'Within 1 km',
    },
    {
      value: 10,
      label: 'Within 10 km',
    },
    {
      value: 50,
      label: 'Within 50 km',
    },
    {
      value: 100,
      label: 'Within 100 km',
    },
    {
      value: 1,
      label: 'Within 500 km',
    },
  ];
  private readonly searchSubject = new Subject<string>();

  constructor(private searchService: SearchService) {
    this.searchSubject.pipe(debounceTime(500)).subscribe({
      next: (query: string) => {
        this.searchService.get(query).subscribe({
          next: (response: SearchResponse[]) => {
            this.results = response.map((i) => ({
              label: i.display_name,
              lat: i.lat,
              lon: i.lon,
            }));
          },
        });
      },
    });
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public getAddresses(): void {
    this.searchSubject.next(this.query);
  }
}
