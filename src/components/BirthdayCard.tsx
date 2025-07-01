import { Edit, Trash2, Cake } from 'lucide-react';
import type { BirthdayWithCalculations } from '../types';
import { formatBirthday } from '../utils/dateUtils';

interface BirthdayCardProps {
  birthday: BirthdayWithCalculations;
  onEdit: (birthday: BirthdayWithCalculations) => void;
  onDelete: (id: string) => void;
}

// Helper function for Russian pluralization of days
const getDaysWord = (count: number): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'дней';
  }

  if (lastDigit === 1) {
    return 'день';
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    return 'дня';
  } else {
    return 'дней';
  }
};

// Helper function for Russian pluralization of years
const getYearsWord = (count: number): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'лет';
  }

  if (lastDigit === 1) {
    return 'год';
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    return 'года';
  } else {
    return 'лет';
  }
};

export const BirthdayCard = ({
  birthday,
  onEdit,
  onDelete,
}: BirthdayCardProps) => {
  const getDaysText = (days: number) => {
    if (days === 0) return 'Сегодня! 🎉';
    if (days === 1) return 'Завтра';
    return `Через ${days} ${getDaysWord(days)}`;
  };

  const getCardClassName = () => {
    let baseClass = 'card';
    if (birthday.isToday) {
      baseClass += ' birthday-today';
    }
    return baseClass;
  };

  return (
    <div className={getCardClassName()}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-sm mb-sm">
            {birthday.isToday && (
              <Cake size={20} style={{ color: 'var(--accent-rose)' }} />
            )}
            <h3 style={{ margin: 0 }}>
              {birthday.name}
              {birthday.surname && ` ${birthday.surname}`}
            </h3>
          </div>

          <div className="flex flex-col gap-sm">
            <div className="flex items-center gap-md">
              <span className="text-secondary">
                {formatBirthday(birthday.dob)}
              </span>
              {birthday.age && (
                <div className="flex items-center gap-sm text-muted text-sm">
                  <span>
                    {birthday.age} {getYearsWord(birthday.age)}
                  </span>
                  {birthday.upcomingAge &&
                    birthday.upcomingAge !== birthday.age && (
                      <span className="text-accent">
                        → {birthday.upcomingAge}{' '}
                        {getYearsWord(birthday.upcomingAge)}
                      </span>
                    )}
                </div>
              )}
            </div>

            <div
              className={`text-sm font-medium ${
                birthday.isToday ? 'birthday-today-text' : 'text-secondary'
              }`}
            >
              {getDaysText(birthday.daysUntilNext)}
            </div>

            {birthday.notes && (
              <p className="text-sm text-muted" style={{ margin: 0 }}>
                {birthday.notes}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-sm">
          <button
            onClick={() => onEdit(birthday)}
            className="btn btn-sm btn-secondary"
            title="Редактировать день рождения"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(birthday.id)}
            className="btn btn-sm btn-danger"
            title="Удалить день рождения"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
