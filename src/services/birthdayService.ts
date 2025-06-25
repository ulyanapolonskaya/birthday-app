import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Birthday } from '../types';
import type { User } from 'firebase/auth';

export class BirthdayService {
  private static instance: BirthdayService;
  
  private constructor() {}

  public static getInstance(): BirthdayService {
    if (!BirthdayService.instance) {
      BirthdayService.instance = new BirthdayService();
    }
    return BirthdayService.instance;
  }

  private getUserCollection(userId: string) {
    return collection(db, 'users', userId, 'birthdays');
  }

  public async getBirthdays(user: User): Promise<Birthday[]> {
    try {
      const birthdaysCollection = this.getUserCollection(user.uid);
      const q = query(birthdaysCollection, orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      const birthdays: Birthday[] = [];
      querySnapshot.forEach((doc) => {
        birthdays.push({
          id: doc.id,
          ...doc.data()
        } as Birthday);
      });
      
      return birthdays;
    } catch (error) {
      console.error('Error getting birthdays:', error);
      throw error;
    }
  }

  public async addBirthday(user: User, birthday: Omit<Birthday, 'id'>): Promise<string> {
    try {
      const birthdaysCollection = this.getUserCollection(user.uid);
      const docRef = await addDoc(birthdaysCollection, birthday);
      return docRef.id;
    } catch (error) {
      console.error('Error adding birthday:', error);
      throw error;
    }
  }

  public async updateBirthday(user: User, birthdayId: string, birthday: Omit<Birthday, 'id'>): Promise<void> {
    try {
      const birthdayDoc = doc(this.getUserCollection(user.uid), birthdayId);
      await updateDoc(birthdayDoc, birthday);
    } catch (error) {
      console.error('Error updating birthday:', error);
      throw error;
    }
  }

  public async deleteBirthday(user: User, birthdayId: string): Promise<void> {
    try {
      const birthdayDoc = doc(this.getUserCollection(user.uid), birthdayId);
      await deleteDoc(birthdayDoc);
    } catch (error) {
      console.error('Error deleting birthday:', error);
      throw error;
    }
  }

  // Migration helper: Copy existing data to Firestore
  public async migrateBirthdays(user: User, birthdays: Birthday[]): Promise<void> {
    try {
      const birthdaysCollection = this.getUserCollection(user.uid);
      
      // Check if user already has data
      const existingBirthdays = await this.getBirthdays(user);
      if (existingBirthdays.length > 0) {
        console.log('User already has birthdays in Firestore, skipping migration');
        return;
      }

      // Add all birthdays to Firestore
      for (const birthday of birthdays) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...birthdayData } = birthday;
        await addDoc(birthdaysCollection, birthdayData);
      }
      
      console.log('Successfully migrated birthdays to Firestore');
    } catch (error) {
      console.error('Error migrating birthdays:', error);
      throw error;
    }
  }
} 