import { create } from 'zustand';
import { persist } from 'zustand/middleware'; 

const useUserStore = create(
  persist(
    (set) => ({
      user: null, // User data (e.g., id, email, name, token)
      setUser: (userData) => set({ user: userData }), // Set user data
      clearUser: () => set({ user: null }), // Clear user data (for logout)
      logoutUser: () => { // Logout function
        set({ user: null }); // Clear user data
      },
    }),
    {
      name: 'user-storage', // Storage key name
      storage: {
        getItem: (name) => JSON.parse(window.localStorage.getItem(name)), // Read from localStorage
        setItem: (name, value) => window.localStorage.setItem(name, JSON.stringify(value)), // Save to localStorage
        removeItem: (name) => window.localStorage.removeItem(name), // Remove item from localStorage
      },
    }
  )
);

export default useUserStore;
