import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  getDoc,
  setDoc,
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
      // 1) Fetch the seed list with cache-busting to force latest data
      const urlBase = (import.meta as any)?.env?.BASE_URL ?? '/';
      const url = `${urlBase}birthdays.json?t=${Date.now()}`;

      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        console.log('No family birthdays.json found');
        return;
      }

      const raw: Array<Record<string, unknown>> = await response.json();
      // Normalize seed entries; do not trust incoming "id" as Firestore doc id
      const seedEntries = (raw || []).map((b) => ({
        name: String(b.name ?? ''),
        surname: (b.surname as string | undefined) ?? undefined,
        dob: String(b.dob ?? ''),
        notes: (b.notes as string | undefined) ?? undefined,
        source: 'family' as const,
        seedId: String(b.id ?? ''),
      }))
      // Keep only valid entries
      .filter((b) => b.name && b.dob && b.seedId);

      if (seedEntries.length === 0) return;

      // 2) Compute a seed signature and check per-user meta to avoid wiping on every load
      const birthdaysCollection = this.getUserCollection(user.uid);
      const signature = seedEntries
        .map(
          (s) => `${s.seedId}|${s.name}|${s.surname ?? ''}|${s.dob}|${s.notes ?? ''}`
        )
        .join('~');
      const metaRef = doc(birthdaysCollection, '_seed_meta_');
      const metaSnap = await getDoc(metaRef);
      if (metaSnap.exists()) {
        const prev = metaSnap.data() as { seedSignature?: string };
        if (prev?.seedSignature === signature) {
          // Even if signature matches, verify consistency to repair past duplicates
          const existing = await this.getBirthdays(user);
          const normalize = (v?: string) => (v || '').trim().replace(/\s+/g, ' ').toLowerCase();
          const makeKey = (n?: string, s?: string, d?: string) =>
            `${normalize(n)}_${normalize(s)}_${(d || '').trim()}`;

          const seedIds = new Set(seedEntries.map((s) => s.seedId));
          const family = existing.filter((e) => e.source === 'family');
          const familyKeys = family.map((e) => makeKey(e.name, e.surname, e.dob));
          const uniqueFamilyKeys = new Set(familyKeys);
          const hasDuplicateFamily = uniqueFamilyKeys.size !== familyKeys.length;
          const countMismatch = family.length !== seedEntries.length;
          const hasUnknownSeed = family.some((e) => e.seedId && !seedIds.has(e.seedId));

          if (!hasDuplicateFamily && !countMismatch && !hasUnknownSeed) {
            // Looks consistent; nothing to do
            return;
          }
          // Otherwise fall through to reset and fix
        }
      }

      // 3) Idempotent re-seed with deterministic IDs to avoid duplicates under StrictMode
      const allowedIds = new Set<string>();
      allowedIds.add('_seed_meta_');

      for (const seed of seedEntries) {
        const docId = `seed_${seed.seedId}`;
        allowedIds.add(docId);
        await setDoc(
          doc(birthdaysCollection, docId),
          {
            name: seed.name,
            surname: seed.surname,
            dob: seed.dob,
            notes: seed.notes,
            source: 'family',
            seedId: seed.seedId,
          },
          { merge: true }
        );
      }

      // Delete any docs not in the allowed set (cleans up duplicates and old docs)
      const snapshot = await getDocs(birthdaysCollection);
      const deletions: Promise<void>[] = [];
      snapshot.forEach((d) => {
        if (!allowedIds.has(d.id)) {
          deletions.push(deleteDoc(doc(birthdaysCollection, d.id)));
        }
      });
      if (deletions.length > 0) {
        await Promise.all(deletions);
      }

      // Save meta signature to prevent repeated resets until the file changes again
      await setDoc(metaRef, {
        seedSignature: signature,
        seededAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error force migrating family birthdays:', error);
      // Don't throw - this shouldn't break the app if it fails
    }
  }
}
