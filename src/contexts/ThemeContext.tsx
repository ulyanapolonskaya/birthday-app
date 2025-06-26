import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { UserPreferencesService } from '../services/userPreferencesService';

export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  user: User | null;
}

export function ThemeProvider({ children, user }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('dark'); // Default to dark theme
  const [isLoading, setIsLoading] = useState(true);
  
  const userPreferencesService = UserPreferencesService.getInstance();

  // Load theme from user preferences or localStorage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        let savedTheme: Theme = 'dark';
        
        if (user && !user.isAnonymous) {
          // For logged-in users, get from Firestore
          const preferences = await userPreferencesService.getUserPreferences(user);
          savedTheme = preferences.theme || 'dark';
        } else {
          // For anonymous users, use localStorage
          const localTheme = localStorage.getItem('theme') as Theme;
          savedTheme = localTheme || 'dark';
        }
        
        setThemeState(savedTheme);
        applyTheme(savedTheme);
      } catch (error) {
        console.error('Error loading theme:', error);
        // Fallback to dark theme
        setThemeState('dark');
        applyTheme('dark');
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [user]);

  const applyTheme = (newTheme: Theme) => {
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    
    try {
      if (user && !user.isAnonymous) {
        // Save to Firestore for logged-in users
        await userPreferencesService.updateUserPreferences(user, { theme: newTheme });
      } else {
        // Save to localStorage for anonymous users
        localStorage.setItem('theme', newTheme);
      }
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Show loading state while theme is being loaded
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 