export const statuses = [
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

export const sources = [
  {
    name: 'Email',
    value: 'email',
    total: 0,
  },
  {
    name: 'SMS',
    value: 'sms',
    total: 0,
  },
  {
    name: 'Twitter',
    value: 'twitter',
    total: 0,
  },
  {
    name: 'Web',
    value: 'web',
    total: 0,
  },
];

export const sortingOptions = [
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
