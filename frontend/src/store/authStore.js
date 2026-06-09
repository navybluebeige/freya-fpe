import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('freya_user') || 'null'),
  token: localStorage.getItem('freya_token') || null,
  isAuthenticated: !!localStorage.getItem('freya_token'),

  login: (token, user) => {
    console.log('💾 Saving token:', token);
    console.log('💾 Saving user:', user);
    localStorage.setItem('freya_token', token);
    localStorage.setItem('freya_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('freya_token');
    localStorage.removeItem('freya_user');
    set({ token: null, user: null, isAuthenticated: false });
  },

  updateUser: (user) => {
    localStorage.setItem('freya_user', JSON.stringify(user));
    set({ user });
  },
}));

export default useAuthStore;
