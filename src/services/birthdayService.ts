import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
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
          ...doc.data(),
        } as Birthday);
      });

      return birthdays;
    } catch (error) {
      console.error('Error getting birthdays:', error);
      throw error;
    }
  }

  public async addBirthday(
    user: User,
    birthday: Omit<Birthday, 'id'>
  ): Promise<string> {
    try {
      const birthdaysCollection = this.getUserCollection(user.uid);
      const docRef = await addDoc(birthdaysCollection, birthday);
      return docRef.id;
    } catch (error) {
      console.error('Error adding birthday:', error);
      throw error;
    }
  }

  public async updateBirthday(
    user: User,
    birthdayId: string,
    birthday: Omit<Birthday, 'id'>
  ): Promise<void> {
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

  // Migration helper: Copy existing data to Firestore (with smart merge)
  public async migrateBirthdays(
    user: User,
    birthdays: Birthday[]
  ): Promise<void> {
    try {
      const birthdaysCollection = this.getUserCollection(user.uid);

      // Get existing birthdays to check for duplicates
      const existingBirthdays = await this.getBirthdays(user);

      // Create a set of existing birthdays for duplicate checking
      const existingKeys = new Set(
        existingBirthdays.map(
          (b) =>
            `${b.name.toLowerCase()}_${b.surname?.toLowerCase() || ''}_${b.dob}`
        )
      );

      let addedCount = 0;

      // Add birthdays that don't already exist
      for (const birthday of birthdays) {
        const key = `${birthday.name.toLowerCase()}_${
          birthday.surname?.toLowerCase() || ''
        }_${birthday.dob}`;

        if (!existingKeys.has(key)) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...birthdayData } = birthday;
          await addDoc(birthdaysCollection, birthdayData);
          addedCount++;
        }
      }

      console.log(
        `Successfully migrated ${addedCount} new birthdays to Firestore (${
          birthdays.length - addedCount
        } duplicates skipped)`
      );
    } catch (error) {
      console.error('Error migrating birthdays:', error);
      throw error;
    }
  }

  // Force migration helper: Always try to merge family birthdays for all users
  public async forceMigrateFamilyBirthdays(user: User): Promise<void> {
    try {
      // Try to fetch the family birthdays from JSON file
      let familyBirthdays: Birthday[] = [];

      try {
        const response = await fetch('./birthdays.json');
        if (response.ok) {
          familyBirthdays = await response.json();
        }
      } catch {
        console.log('No family birthdays.json found');
        return;
      }

      if (familyBirthdays.length > 0) {
        await this.migrateBirthdays(user, familyBirthdays);
      }
    } catch (error) {
      console.error('Error force migrating family birthdays:', error);
      // Don't throw - this shouldn't break the app if it fails
    }
  }
}
