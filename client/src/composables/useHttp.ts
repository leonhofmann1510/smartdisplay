const headers = {
  'Content-Type': 'application/json'
};

const getRequest = async <T>(url: string, method: string, payload: JSON | null): Promise<T> => {
  try {
    const response = await fetch(url, {
      method,
      headers,
    });
    const json: T = await response.json();
    return Promise.resolve(json);
  }
  catch (error) {
    return Promise.reject(error);
  }
}

const postRequest = async <T>(url: string, method: string, payload: Object | null): Promise<T> => {
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(payload) ?? null
    });
    const json: T = await response.json();
    return Promise.resolve(json);
  }
  catch (error) {
    return Promise.reject(error);
  }
}

const get = <T>(url: string): Promise<T> => {
  return getRequest<T>(url, 'GET', null);
}

const post = <T>(url: string, payload: Object): Promise<T> => {
  return postRequest<T>(url, 'POST', payload);
};

export const useHttp = () => {
  return {
    get,
    post
  }
};
