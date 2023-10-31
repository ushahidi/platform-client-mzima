export const checkBackendURL = (backendUrl: string) => {
  const parseURL = (url: string) => {
    try {
      return new URL(url);
    } catch (e) {
      // Attempt to build based on the current document
      if (e instanceof TypeError) {
        return new URL(url, document.baseURI);
      } else {
        throw e;
      }
    }
  };

  let result = parseURL(backendUrl);

  // Query string or hash not allowed
  if (result.search !== '' || result.hash !== '') {
    throw new Error('Invalid backend URL');
  }

  // Ensure the path ends in /
  if (result.pathname.slice(-1) !== '/') {
    result.pathname += '/';
  }

  return result.href;
};
