export const getApiUrlByDomain = (deploymentInfo: { domain: string; api_domain?: string }) => {
  if (!deploymentInfo.api_domain) deploymentInfo.api_domain = `api.${deploymentInfo.domain}`;
  return `${location.protocol}//${location.hostname.replace(
    deploymentInfo.domain,
    deploymentInfo.api_domain,
  )}${location.port ? ':' + location.port : ''}`;
};

export const API_V_3 = `api/v3/`;
export const API_V_5 = `api/v5/`;
