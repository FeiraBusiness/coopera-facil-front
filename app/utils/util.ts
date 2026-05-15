import { toast } from 'react-toastify';

export function isValidToken(expiration: string) {
  return Number.parseInt(expiration) > new Date().getTime();
}

export function verifyAuth() {
  const token = localStorage.getItem('token');
  const expiration = localStorage.getItem('expiration');

  if (!token || !expiration) {
    return false;
  }

  return isValidToken(expiration);
}

export function getToken() {
  const isValid = verifyAuth();

  if (isValid) {
    return localStorage.getItem('token');
  }

  handleLogout(true);
}

export function handleLogout(showToast?: boolean) {
  localStorage.removeItem('token');
  localStorage.removeItem('expiration');

  if (showToast) {
    toast.error('Sessão expirada, faça o login novamente.');
  }

  // next/navigation router só funciona dentro de componentes/hooks client-side,
  // então aqui (função utilitária comum) navegamos via window.location.
  window.location.href = '/auth';
}

export function encodeQueryString(params: Record<string, unknown>) {
  const keys = Object.keys(params);

  return keys.length
    ? '?' + keys.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(params[key]))}`).join('&')
    : '';
}
