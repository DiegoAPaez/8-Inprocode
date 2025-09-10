// Utility function to check if JWT cookie exists
export const getJWTFromCookie = (): string | null => {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const jwtCookie = cookies.find(cookie => cookie.trim().startsWith('jwtToken='));

  if (jwtCookie) {
    const token = jwtCookie.split('=')[1];
    return token && token !== '' ? token : null;
  }

  return null;
};

// Utility function to clear the JWT cookie
export const clearJWTCookie = (): void => {
  if (typeof document === 'undefined') return;

  // Clear the cookie by setting it with an expired date
  document.cookie = 'jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=; SameSite=Lax';

  // Also try clearing without domain specification (for localhost)
  document.cookie = 'jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
};
