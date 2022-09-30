import { Component } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { BehaviorSubject, debounceTime, Subject } from 'rxjs';
import { SearchService } from 'src/app/core/services/search.service';

interface LatLng {
  lat?: number;
  lng?: number;
}

interface SelectedLocation {
  location: LatLng;
  distance: number;
}

interface SearchResponse {
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
  selector: 'app-location-selection',
  templateUrl: './location-selection.component.html',
  styleUrls: ['./location-selection.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: LocationSelectionComponent,
    },
  ],
})
export class LocationSelectionComponent implements ControlValueAccessor {
  public touched = false;
  public disabled = false;
  public location: LatLng;
  private readonly searchSubject = new Subject<string>();

  public distanceOptions = [
    {
      value: 1,
      label: 'global_filter.option_1',
    },
    {
      value: 10,
      label: 'global_filter.option_2',
    },
    {
      value: 50,
      label: 'global_filter.option_3',
    },
    {
      value: 100,
      label: 'global_filter.option_4',
    },
    {
      value: 500,
      label: 'global_filter.option_5',
    },
  ];

  public location_distance: number;
  public citiesOptions: BehaviorSubject<SearchResponse[]>;
  public searchQuery?: SearchResponse;

  constructor(private searchService: SearchService) {
    this.citiesOptions = new BehaviorSubject<any[]>([]);

    this.searchSubject.pipe(debounceTime(350)).subscribe({
      next: (query: string) => {
        this.searchService.get(query).subscribe({
          next: (response: SearchResponse[]) => {
            this.citiesOptions.next(response);
          },
        });
      },
    });
  }

  onChange = (location: SelectedLocation) => {
    console.log(location);
  };

  onTouched = () => {};

  writeValue(value: SelectedLocation) {
    if (value?.location?.lat && value?.location?.lng) {
      this.location = { lat: value?.location?.lat, lng: value?.location?.lng };

      this.searchService.get(`${value?.location?.lat}, ${value?.location?.lng}`).subscribe({
        next: (response: SearchResponse[]) => {
          if (response.length) {
            this.citiesOptions.next(response);
            this.searchQuery = response[0];
          }
        },
      });
    } else {
      this.citiesOptions.next([]);
      this.searchQuery = undefined;
    }
    this.location_distance = value?.distance || 1;
  }

  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  public search(): void {
    this.markAsTouched();
    if (typeof this.searchQuery !== 'string') return;
    this.searchSubject.next(this.searchQuery);
  }

  public displayFn(city: SearchResponse): string {
    return city?.display_name || '';
  }

  public optionSelected(event: MatAutocompleteSelectedEvent): void {
    this.location = {
      lat: Number(event.option.value.lat),
      lng: Number(event.option.value.lon),
    };
    this.onChange({
      location: this.location,
      distance: this.location_distance,
    });
  }

  public changeDistance(): void {
    this.onChange({
      location: this.location,
      distance: this.location_distance,
    });
  }

  public clear(): void {
    this.citiesOptions.next([]);
    this.searchQuery = undefined;
    this.location_distance = 1;
    this.location = {
      lat: undefined,
      lng: undefined,
    };
    this.onChange({
      location: this.location,
      distance: this.location_distance,
    });
  }
}
