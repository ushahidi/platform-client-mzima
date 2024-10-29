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
};

export const API_V_3 = `api/v3/`;
export const API_V_5 = `api/v5/`;
