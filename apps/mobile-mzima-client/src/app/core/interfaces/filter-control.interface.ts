export interface FilterControl {
  name: string;
  icon: string;
  label: string;
  selected?: string;
  selectedLabel?: string;
  selectedCount?: number | string | null;
  options?: FilterControlOption[];
  value: any;
}

export interface FilterControlOption {
  value?: string | number;
  label?: string | number;
  checked?: boolean;
  info?: string;
  options?: Omit<FilterControlOption, 'options'>[];
}
