export const surveyFields = [
  {
    label: 'survey.short_text',
    type: 'varchar',
    input: 'text',
    description: 'survey.text_desc',
  },
  {
    label: 'survey.long_text',
    type: 'text',
    input: 'textarea',
    description: 'survey.textarea_desc',
  },
  {
    label: 'survey.number_decimal',
    type: 'decimal',
    input: 'number',
    description: 'survey.decimal_desc',
  },
  {
    label: 'survey.number_integer',
    type: 'int',
    input: 'number',
    description: 'survey.integer_desc',
  },
  {
    label: 'survey.location',
    type: 'point',
    input: 'location',
    description: 'survey.location_desc',
  },
  // {
  //     label: 'Geometry',
  //     type: 'geometry',
  //     input: 'text'
  // },
  {
    label: 'survey.date',
    type: 'datetime',
    input: 'date',
    description: 'survey.date_desc',
  },
  {
    label: 'survey.datetime',
    type: 'datetime',
    input: 'datetime',
    description: 'survey.datetime_desc',
  },
  // {
  //     label: 'Time',
  //     type: 'datetime',
  //     input: 'time'
  // },
  {
    label: 'survey.select',
    type: 'varchar',
    input: 'select',
    description: 'survey.select_desc',
  },
  {
    label: 'survey.radio_button',
    type: 'varchar',
    input: 'radio',
    options: [],
    description: 'survey.radio_desc',
  },
  {
    label: 'survey.checkbox',
    type: 'varchar',
    input: 'checkbox',
    cardinality: 0,
    description: 'survey.checkbox_desc',
  },
  {
    label: 'survey.related_post',
    type: 'relation',
    input: 'relation',
    description: 'survey.relation_desc',
  },
  {
    label: 'survey.upload_image',
    type: 'media',
    input: 'upload',
    description: 'survey.upload_desc',
    config: {
      hasCaption: true,
    },
  },
  {
    label: 'survey.embed_video',
    type: 'varchar',
    input: 'video',
    description: 'survey.video_desc',
  },
  {
    label: 'Markdown',
    type: 'markdown',
    input: 'markdown',
    description: 'survey.markdown_desc',
  },
  {
    label: 'survey.categories',
    type: 'tags',
    cardinality: 0,
    input: 'tags',
    description: 'settings.settings_list.categories_desc',
  },
];
