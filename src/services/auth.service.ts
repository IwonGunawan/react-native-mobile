import api from "./api"

interface User {
  id: number;
  name: string;
  email: string;
  level: '0' | '1'; // 0=petugas, 1=admin
}
interface LoginResponse {
  access_token: string;
  user: User;
}

export const authService = {
  login: (email: string, password: string) => 
    api.post<LoginResponse>('/auth/login', {email, password})
    .then(r => r.data),
    
  changePassword: (oldPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { oldPassword, newPassword })
       .then(r => r.data),
};