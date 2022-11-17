export const checkBackendURL = (backendUrl: string) => {
  if (backendUrl.indexOf('http') === -1) {
    backendUrl = `https://${backendUrl}`;
  }

  if (backendUrl.slice(-1) !== '/') {
    backendUrl = `${backendUrl}/`;
  }

  return backendUrl;
};
