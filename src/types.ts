export interface Birthday {
  id: string;
  name: string;
  surname?: string;
  dob: string; // ISO date string (YYYY-MM-DD)
  notes?: string;
}

export interface BirthdayWithCalculations extends Birthday {
  age?: number;
  upcomingAge?: number;
  daysUntilNext: number;
  isToday: boolean;
  nextBirthday: Date;
}
