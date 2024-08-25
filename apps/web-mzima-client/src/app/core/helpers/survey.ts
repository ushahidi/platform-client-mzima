let currentInterimId = 0;

export const surveyFields = [
  {
    label: 'survey.short_text',
    type: 'varchar',
    input: 'text',
    instructions: 'survey.text_desc',
  },
  {
    label: 'survey.long_text',
    type: 'text',
    input: 'textarea',
    instructions: 'survey.textarea_desc',
  },
  {
    label: 'survey.number_decimal',
    type: 'decimal',
    input: 'number',
    instructions: 'survey.decimal_desc',
  },
  {
    label: 'survey.number_integer',
    type: 'int',
    input: 'number',
    instructions: 'survey.integer_desc',
  },
  {
    label: 'survey.location',
    type: 'point',
    input: 'location',
    instructions: 'survey.location_desc',
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
    instructions: 'survey.date_desc',
  },
  {
    label: 'survey.datetime',
    type: 'datetime',
    input: 'datetime',
    instructions: 'survey.datetime_desc',
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
    instructions: 'survey.select_desc',
  },
  {
    label: 'survey.radio_button',
    type: 'varchar',
    input: 'radio',
    options: [],
    instructions: 'survey.radio_desc',
  },
  {
    label: 'survey.checkbox',
    type: 'varchar',
    input: 'checkbox',
    options: [],
    cardinality: 0,
    instructions: 'survey.checkbox_desc',
  },
  {
    label: 'survey.related_post',
    type: 'relation',
    input: 'relation',
    config: {
      input: {
        form: [],
      },
    },
    instructions: 'survey.relation_desc',
  },
  {
    label: 'survey.upload_image',
    type: 'media',
    input: 'upload',
    instructions: 'survey.upload_desc',
    config: {
      hasCaption: true,
      maxUploadSize: 2,
    },
  },
  {
    label: 'survey.upload_audio',
    type: 'audio',
    input: 'upload',
    instructions: 'survey.audio_desc',
    config: {
      maxUploadSize: 2,
    },
  },
  {
    label: 'survey.upload_document',
    type: 'document',
    input: 'upload',
    instructions: 'survey.document_desc',
    config: {
      maxUploadSize: 2,
    },
  },
  {
    label: 'survey.embed_video',
    type: 'varchar',
    input: 'video',
    instructions: 'survey.video_desc',
  },
  {
    label: 'survey.markdown',
    type: 'markdown',
    input: 'markdown',
    instructions: 'survey.markdown_desc',
  },
  {
    label: 'survey.categories',
    type: 'tags',
    cardinality: 0,
    input: 'tags',
    instructions: 'settings.settings_list.categories_desc',
    options: [],
  },
];

export const maxUploadSizes = [2, 5, 10];

export const fieldHasTranslations = (field: any, lang: any) => {
  if (!field.translations) return false;
  return field.translations[lang]?.options
    ? Object.values(field.translations[lang]?.options).length > 0
    : false;
};

export const fieldCanHaveOptions = (field: any = {}) => {
  return field.input === 'checkbox' || field.input === 'radio' || field.input === 'select';
};

export const areOptionsUnique = (options: any[] = []) => {
  // converting to Set would remove duplicates,so if size matches original we are good
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
  return new Set(options).size === options.length;
};

export const hasEmptyOptions = (options: any[] = []) => {
  // check against duplicate or empty options
  return options.filter((i) => i === '' || i === null).length > 0;
};

const getInterimId = () => {
  const id = 'interim_id_' + currentInterimId;
  currentInterimId++;
  return id;
};

export const defaultTask = {
  priority: 0,
  required: false,
  type: 'post',
  label: 'Post',
  show_when_published: true,
  task_is_internal_only: false,
  translations: {},
  fields: [
    {
      cardinality: 0,
      input: 'text',
      priority: 1,
      required: true,
      label: 'Title',
      type: 'title',
      config: {},
      form_stage_id: getInterimId(),
      translations: {},
    },
    {
      cardinality: 0,
      input: 'text',
      priority: 2,
      required: true,
      label: 'Description',
      type: 'description',
      options: [],
      config: {},
      form_stage_id: getInterimId(),
      translations: {},
    },
  ],
  is_public: true,
};

export const views = [
  {
    name: 'map',
    display_name: 'views.map',
  },
  {
    name: 'data',
    display_name: 'views.data',
  },
];
