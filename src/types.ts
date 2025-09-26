export interface Birthday {
  id: string;
  name: string;
  surname?: string;
  dob: string; // ISO date string (YYYY-MM-DD)
  notes?: string;
  // Optional metadata for seeded entries from public/birthdays.json
  source?: 'family' | 'user';
  seedId?: string; // id from the seed JSON to enable syncing
}

export interface BirthdayWithCalculations extends Birthday {
  age?: number;
  upcomingAge?: number;
  daysUntilNext: number;
  isToday: boolean;
  nextBirthday: Date;
}
