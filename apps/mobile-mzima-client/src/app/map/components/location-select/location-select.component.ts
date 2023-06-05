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

interface LocationItem {
  label: string;
  lat: number;
  lon: number;
}

interface LocationSelectValue {
  location: LocationItem;
  radius: number;
  distance: number;
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

  value: LocationSelectValue | null;
  onChange: any = () => {};
  onTouched: any = () => {};

  public query = '';
  public results: LocationItem[] = [];
  public selectedLocation?: LocationItem | null;
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
      value: 500,
      label: 'Within 500 km',
    },
  ];
  private readonly searchSubject = new Subject<string>();
  public isInputOnFocus: boolean;

  constructor(private searchService: SearchService) {
    this.searchSubject.pipe(debounceTime(500)).subscribe({
      next: (query: string) => {
        this.searchService.get(query).subscribe({
          next: (response: SearchResponse[]) => {
            this.results = response.map((i) => ({
              label: i.display_name,
              lat: Number(i.lat),
              lon: Number(i.lon),
            }));
          },
        });
      },
    });
  }

  writeValue(value: LocationSelectValue | null): void {
    if (value) {
      this.selectedLocation = value.location
        ? {
            lat: value.location.lat,
            lon: value.location.lon,
            label: value.location.label,
          }
        : null;
      this.query = value.location?.label ?? '';
      this.radiusValue = value.distance ?? 1;
    } else {
      this.selectedLocation = null;
      this.radiusValue = 1;
    }
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

  public selectLocation(location: LocationItem): void {
    this.query = location.label;
    this.selectedLocation = location;
    this.onChange({
      location: this.selectedLocation,
      radius: this.radiusValue,
    });
  }

  public handleInputBlur(): void {
    setTimeout(() => {
      this.isInputOnFocus = false;
    }, 50);
  }

  public handleInputClear(): void {
    this.results = [];
    this.onChange({
      location: null,
      radius: this.radiusValue,
    });
  }

  public setRadius(): void {
    this.onChange({
      location: this.selectedLocation,
      radius: this.radiusValue,
    });
  }
}
