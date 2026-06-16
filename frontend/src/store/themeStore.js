import { create } from 'zustand'

const isThemeDark = () => {
  try {
    const localTheme = localStorage.getItem('theme');
    if (localTheme) return localTheme === 'dark';
    
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  } catch (e) {
    // Ignore storage/media failures
  }
  return false;
};

export const useThemeStore = create((set) => ({
  isDarkMode: isThemeDark(),
  
  toggleTheme: () => set((state) => {
    const nextMode = !state.isDarkMode;
    try {
      if (nextMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch (e) {}
    return { isDarkMode: nextMode };
  }),

  initTheme: () => {
    const isDark = isThemeDark();
    try {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
    set({ isDarkMode: isDark });
  }
}));
