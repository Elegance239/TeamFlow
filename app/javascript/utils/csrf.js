export function getCsrfHeaders() {
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  return token ? { 'X-CSRF-Token': token } : {};
}
