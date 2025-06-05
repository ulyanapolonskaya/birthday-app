import { Edit, Trash2, Cake } from 'lucide-react';
import type { BirthdayWithCalculations } from '../types';
import { formatBirthday } from '../utils/dateUtils';

interface BirthdayCardProps {
  birthday: BirthdayWithCalculations;
  onEdit: (birthday: BirthdayWithCalculations) => void;
  onDelete: (id: string) => void;
}

export const BirthdayCard = ({ birthday, onEdit, onDelete }: BirthdayCardProps) => {
  const getDaysText = (days: number) => {
    if (days === 0) return "Today! 🎉";
    if (days === 1) return "Tomorrow";
    return `In ${days} days`;
  };

  const getCardClassName = () => {
    let baseClass = "card";
    if (birthday.isToday) {
      baseClass += " birthday-today";
    }
    return baseClass;
  };

  return (
    <div className={getCardClassName()}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-sm mb-sm">
            {birthday.isToday && <Cake size={20} style={{ color: 'var(--accent-rose)' }} />}
            <h3 style={{ margin: 0 }}>{birthday.name}</h3>
          </div>
          
          <div className="flex flex-col gap-sm">
            <div className="flex items-center gap-md">
              <span className="text-secondary">
                {formatBirthday(birthday.dob)}
              </span>
              {birthday.age && (
                <span className="text-muted text-sm">
                  Age {birthday.age}
                </span>
              )}
            </div>
            
            <div className={`text-sm font-medium ${birthday.isToday ? 'birthday-today-text' : 'text-secondary'}`}>
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
            title="Edit birthday"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(birthday.id)}
            className="btn btn-sm btn-danger"
            title="Delete birthday"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}; 