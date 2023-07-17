export function prepareRelationConfig(field: any, filters: any) {
  const fieldForm: [] = field.config?.input?.form;
  const relationConfigForm = fieldForm?.length ? fieldForm : filters.form;
  const relationConfigSource = filters.source;
  const relationConfigKey = field.key;

  return { relationConfigForm, relationConfigSource, relationConfigKey };
}
