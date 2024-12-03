export const getApiUrlByDomain = (deploymentInfo: { domain: string; api_domain?: string }) => {
  console.log('deploymentInfo', deploymentInfo);
  if (deploymentInfo?.api_domain == undefined) {
    deploymentInfo['api_domain'] = `api.${deploymentInfo?.domain}`;
  }
  return `${location.protocol}//${location.hostname.replace(
    deploymentInfo.domain,
    deploymentInfo.api_domain,
  )}${location.port ? ':' + location.port : ''}`;
};

export const ONLY = {
  NAME_ID: 'name,id',
  NAME_ID_COLOR: 'name,id,color',
  NAME_COLOR_PERMISSIONS: 'name,color,everyone_can_create,can_create',
  NAME_ID_DESCRIPTION: 'name,id,description',
  NEEDED_POSTS_LIST_PROPERTIES:
    'id,title,status,color,contact,locks,post_media,data_source_message_id,post_date',
  TAG_ID_PARENTID_PARENT_SLUG: 'tag,id,parent_id,parent,slug',
  TAG_ID_PARENTID_PARENT_SLUG_CHILDREN: 'tag,id,parent_id,parent,slug,children',
  TAG_ID_PARENTID_CHILDREN: 'tag,id,parent_id,children',
  SAVEDFILTERS_NAME_ID_FILTER: 'id,name,filter',
};

export const API_V_3 = `api/v3/`;
export const API_V_5 = `api/v5/`;
