export interface UserData {
  id?: string;
  email: string;
  fullName: string;
  role?: string;
  accessTokenExpiration: string;
  refreshTokenExpiration: string;
}

export const getAccessToken = () => localStorage.getItem('accessToken');
export const getRefreshToken = () => localStorage.getItem('refreshToken');
export const getUser = (): UserData | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const saveAuthData = (data: {
  accessToken: string;
  refreshToken: string;
  email: string;
  fullName: string;
  role?: string;
  accessTokenExpiration: string;
  refreshTokenExpiration: string;
}) => {
  // Decode role from JWT if not provided in response
  let role = data.role;
  if (!role && data.accessToken) {
    try {
      const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
      role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload['role'];
    } catch (e) {
      console.error('Error decoding token role:', e);
    }
  }

  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('user', JSON.stringify({
    email: data.email,
    fullName: data.fullName,
    role: role,
    accessTokenExpiration: data.accessTokenExpiration,
    refreshTokenExpiration: data.refreshTokenExpiration
  }));
};

export const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};
