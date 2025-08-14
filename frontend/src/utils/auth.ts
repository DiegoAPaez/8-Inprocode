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
