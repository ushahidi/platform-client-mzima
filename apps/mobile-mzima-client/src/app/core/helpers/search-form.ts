import _ from 'lodash';

export const statuses = [
  {
    value: 'published',
    name: 'Published',
    icon: 'globe',
  },
  {
    value: 'draft',
    name: 'Draft',
    icon: 'document',
  },
  {
    value: 'archived',
    name: 'Archived',
    icon: 'box',
  },
];

export const sources = [
  {
    name: 'Email',
    value: 'email',
    total: 0,
    checked: true,
  },
  {
    name: 'SMS',
    value: 'sms',
    total: 0,
    checked: true,
  },
  {
    name: 'Twitter',
    value: 'twitter',
    total: 0,
    checked: true,
  },
  {
    name: 'Web',
    value: 'web',
    total: 0,
    checked: true,
  },
  {
    name: 'USSD',
    value: 'ussd',
    total: 0,
    checked: true,
  },
  {
    name: 'WhatsApp',
    value: 'whatsapp',
    total: 0,
    checked: true,
  },
];

export const sortingOptions = [
  {
    orderBy: 'global_filter.sort.orderby.created',
    order: 'global_filter.sort.order.desc',
    value: {
      orderby: 'created',
      order: 'desc',
    },
  },
  {
    orderBy: 'global_filter.sort.orderby.created',
    order: 'global_filter.sort.order.asc',
    value: {
      orderby: 'created',
      order: 'asc',
    },
  },
  {
    orderBy: 'global_filter.sort.orderby.post_date',
    order: 'global_filter.sort.order.desc',
    value: {
      orderby: 'post_date',
      order: 'desc',
    },
  },
  {
    orderBy: 'global_filter.sort.orderby.post_date',
    order: 'global_filter.sort.order.asc',
    value: {
      orderby: 'post_date',
      order: 'asc',
    },
  },
  {
    orderBy: 'global_filter.sort.orderby.updated',
    order: 'global_filter.sort.order.desc',
    value: {
      orderby: 'updated',
      order: 'desc',
    },
  },
  {
    orderBy: 'global_filter.sort.orderby.updated',
    order: 'global_filter.sort.order.asc',
    value: {
      orderby: 'updated',
      order: 'asc',
    },
  },
];

interface Filter {
  [key: string]: any;
}

export const DEFAULT_FILTERS: Filter = {
  query: '',
  status: ['published', 'draft'],
  tags: [],
  source: [],
  form: [],
  place: '',
  date: {
    start: '',
    end: '',
  },
  center_point: {
    location: {
      lat: null,
      lng: null,
    },
    distance: 1,
  },
};

export const compareForms = (form1: any, form2: any) => {
  return !_.isEqual(form1, form2);
};
