import {
  differenceInDays,
  differenceInYears,
  format,
  isToday,
  parseISO,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Birthday, BirthdayWithCalculations } from '../types';

export const calculateAge = (dob: string): number => {
  const birthDate = parseISO(dob);
  return differenceInYears(new Date(), birthDate);
};

export const calculateUpcomingAge = (dob: string): number => {
  const birthDate = parseISO(dob);
  const nextBirthday = getNextBirthday(dob);
  return differenceInYears(nextBirthday, birthDate);
};

export const getNextBirthday = (dob: string): Date => {
  const birthDate = parseISO(dob);
  const today = new Date();
  const currentYear = today.getFullYear();

  // Create this year's birthday
  const thisYearBirthday = new Date(
    currentYear,
    birthDate.getMonth(),
    birthDate.getDate()
  );

  // If this year's birthday has passed, use next year's
  if (thisYearBirthday < today) {
    return new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
  }

  return thisYearBirthday;
};

export const getDaysUntilBirthday = (dob: string): number => {
  const nextBirthday = getNextBirthday(dob);
  const today = new Date();

  // If it's today, return 0
  if (isToday(nextBirthday)) {
    return 0;
  }

  // Normalize both dates to start of day to avoid time-based calculation errors
  const todayNormalized = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const nextBirthdayNormalized = new Date(
    nextBirthday.getFullYear(),
    nextBirthday.getMonth(),
    nextBirthday.getDate()
  );

  return differenceInDays(nextBirthdayNormalized, todayNormalized);
};

export const isBirthdayToday = (dob: string): boolean => {
  const nextBirthday = getNextBirthday(dob);
  return isToday(nextBirthday);
};

export const formatBirthday = (dob: string): string => {
  const birthDate = parseISO(dob);
  return format(birthDate, 'd MMMM', { locale: ru });
};

export const enrichBirthdayData = (
  birthday: Birthday
): BirthdayWithCalculations => {
  return {
    ...birthday,
    age: calculateAge(birthday.dob),
    upcomingAge: calculateUpcomingAge(birthday.dob),
    daysUntilNext: getDaysUntilBirthday(birthday.dob),
    isToday: isBirthdayToday(birthday.dob),
    nextBirthday: getNextBirthday(birthday.dob),
  };
};

export const sortBirthdaysByUpcoming = (
  birthdays: BirthdayWithCalculations[]
): BirthdayWithCalculations[] => {
  return birthdays.sort((a, b) => {
    // Today's birthdays first
    if (a.isToday && !b.isToday) return -1;
    if (!a.isToday && b.isToday) return 1;

    // Then by days until next birthday
    return a.daysUntilNext - b.daysUntilNext;
  });
};
