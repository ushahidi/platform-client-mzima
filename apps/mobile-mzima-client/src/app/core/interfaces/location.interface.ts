export interface LatLon {
  lat: number;
  lon: number;
}

export interface LocationItem extends LatLon {
  label: string;
}

export interface LocationSelectValue {
  location: LocationItem;
  radius: number;
  distance: number;
}
