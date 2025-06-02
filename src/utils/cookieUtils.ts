
import Cookies from 'js-cookie';

export const setCookie = (name: string, value: string, days: number = 7) => {
  Cookies.set(name, value, { expires: days });
};

export const getCookie = (name: string): string | undefined => {
  return Cookies.get(name);
};

export const removeCookie = (name: string) => {
  Cookies.remove(name);
};

export const isTokenValid = (token: string): boolean => {
  if (!token) return false;
  
  try {
    // Extract JWT payload
    const payload = token.split('.')[1];
    if (!payload) return false;
    
    const decoded = JSON.parse(atob(payload));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token is expired
    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};
