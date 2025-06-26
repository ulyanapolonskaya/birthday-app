import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { User } from 'firebase/auth';
import type { Theme } from '../contexts/ThemeContext';

export interface UserPreferences {
  theme?: Theme;
  // Add more preferences here as needed
}

export class UserPreferencesService {
  private static instance: UserPreferencesService;
  
  private constructor() {}

  public static getInstance(): UserPreferencesService {
    if (!UserPreferencesService.instance) {
      UserPreferencesService.instance = new UserPreferencesService();
    }
    return UserPreferencesService.instance;
  }

  private getUserPreferencesDoc(userId: string) {
    return doc(db, 'users', userId, 'preferences', 'main');
  }

  public async getUserPreferences(user: User): Promise<UserPreferences> {
    try {
      const preferencesDoc = this.getUserPreferencesDoc(user.uid);
      const docSnap = await getDoc(preferencesDoc);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserPreferences;
      } else {
        // Return default preferences
        return {
          theme: 'dark'
        };
      }
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {
        theme: 'dark'
      };
    }
  }

  public async updateUserPreferences(user: User, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const preferencesDoc = this.getUserPreferencesDoc(user.uid);
      const currentPreferences = await this.getUserPreferences(user);
      
      const updatedPreferences = {
        ...currentPreferences,
        ...preferences
      };
      
      await setDoc(preferencesDoc, updatedPreferences, { merge: true });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }
} 