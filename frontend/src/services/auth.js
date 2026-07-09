import api, { ensureCsrfToken, resetCsrfToken, setCsrfToken } from './api';

export const register = (data) => api.post('/auth/register', data).then((r) => r.data);

export async function login(data) {
  await ensureCsrfToken();
  const result = await api.post('/auth/login', data).then((r) => r.data);
  if (result.csrfToken) {
    setCsrfToken(result.csrfToken);
  } else {
    resetCsrfToken();
    await ensureCsrfToken();
  }
  return result;
}

export const verify = () => api.get('/auth/verify').then((r) => r.data);

export async function logout() {
  try {
    await api.post('/auth/logout');
  } finally {
    resetCsrfToken();
  }
}
