import { 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../firebase';

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private authStateCallbacks: ((user: User | null) => void)[] = [];

  private constructor() {
    // Listen for authentication state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      // Notify all callbacks
      this.authStateCallbacks.forEach(callback => callback(user));
    });
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async signInAnonymously(): Promise<User> {
    try {
      const result = await signInAnonymously(auth);
      return result.user;
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      throw error;
    }
  }

  public async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  }

  public async registerWithEmail(email: string, password: string, displayName?: string): Promise<User> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      
      return result.user;
    } catch (error) {
      console.error('Error registering with email:', error);
      throw error;
    }
  }

  public async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public isAnonymous(): boolean {
    return this.currentUser?.isAnonymous ?? false;
  }

  public onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.authStateCallbacks.push(callback);
    // Return unsubscribe function
    return () => {
      const index = this.authStateCallbacks.indexOf(callback);
      if (index > -1) {
        this.authStateCallbacks.splice(index, 1);
      }
    };
  }
} 