const DEFAULT_BASE_URL = 'http://localhost:8080';
const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, '');

let authToken = null;

export function setAuthToken(token) {
  authToken = token || null;
}

export function getAuthToken() {
  return authToken;
}

function normalizeHeaders(headers) {
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  return { ...(headers ?? {}) };
}

function resolveUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (!API_BASE_URL) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return API_BASE_URL + '/' + normalizedPath;
}

function buildHeaders(optionsHeaders) {
  const headers = normalizeHeaders(optionsHeaders);

  if (authToken && !('Authorization' in headers)) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  return headers;
}

function prepareInit(method, payload, options = {}) {
  const init = { ...options, method };
  const headers = buildHeaders(options.headers);

  if (payload === undefined) {
    if (Object.keys(headers).length > 0) {
      init.headers = headers;
    }
    return init;
  }

  if (
    payload instanceof FormData ||
    payload instanceof Blob ||
    payload instanceof ArrayBuffer ||
    payload instanceof URLSearchParams ||
    typeof payload === 'string'
  ) {
    if (Object.keys(headers).length > 0) {
      init.headers = headers;
    }
    init.body = payload;
    return init;
  }

  init.body = JSON.stringify(payload);
  init.headers = {
    'Content-Type': 'application/json',
    ...headers,
  };

  return init;
}

async function request(path, init) {
  // Attach Authorization Bearer token if available in the user store (dynamic import to avoid cycles)
  try {
    const existingHeaders = normalizeHeaders(init.headers)
    if (!existingHeaders.Authorization && !existingHeaders.authorization) {
      // dynamic import the user store so we avoid circular imports during module init
      try {
        const { useUserStore } = await import('@/stores/user')
        const userStore = useUserStore()
        const token = userStore?.profile?.token || userStore?.profile?.accessToken
        if (token) {
          init.headers = { ...existingHeaders, Authorization: `Bearer ${token}` }
        } else {
          // fallback to localStorage in case token is persisted there
          try {
            const raw = localStorage.getItem('listio:user')
            const parsed = raw ? JSON.parse(raw) : null
            const fallbackToken = parsed?.profile?.token || parsed?.profile?.accessToken
            if (fallbackToken) init.headers = { ...existingHeaders, Authorization: `Bearer ${fallbackToken}` }
          } catch (e) {
            // ignore localStorage parse errors
          }
        }
      } catch (e) {
        // dynamic import failed (e.g. in non-Vite contexts); try localStorage fallback
        try {
          const raw = localStorage.getItem('listio:user')
          const parsed = raw ? JSON.parse(raw) : null
          const fallbackToken = parsed?.profile?.token || parsed?.profile?.accessToken
          if (fallbackToken) init.headers = { ...(normalizeHeaders(init.headers) || {}), Authorization: `Bearer ${fallbackToken}` }
        } catch (er) {
          // ignore
        }
      }
    }
  } catch (e) {
    // best-effort only; don't block request on auth resolution
  }

  const response = await fetch(resolveUrl(path), init);
  const contentType = response.headers.get('content-type') ?? '';

  if (!response.ok) {
    let errorPayload = null;

    if (contentType.includes('application/json')) {
      try {
        errorPayload = await response.json();
      } catch (error) {
        errorPayload = null;
      }
    } else {
      try {
        errorPayload = await response.text();
      } catch (error) {
        errorPayload = null;
      }
    }

    const message =
      typeof errorPayload === 'object' && errorPayload !== null && 'message' in errorPayload
        ? errorPayload.message
        : 'Request failed with status ' + response.status;

    const apiError = new Error(message);
    apiError.status = response.status;
    apiError.data = errorPayload;
    throw apiError;
  }

  if (response.status === 204) {
    return null;
  }

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  try {
    return await response.text();
  } catch (error) {
    return null;
  }
}

const api = {
  get(path, options) {
    return request(path, prepareInit('GET', undefined, options));
  },
  post(path, payload, options) {
    return request(path, prepareInit('POST', payload, options));
  },
  put(path, payload, options) {
    return request(path, prepareInit('PUT', payload, options));
  },
  patch(path, payload, options) {
    return request(path, prepareInit('PATCH', payload, options));
  },
  delete(path, payload, options) {
    return request(path, prepareInit('DELETE', payload, options));
  },
};

export default api;
