import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Birthday } from '../types';

interface BirthdayFormProps {
  birthday?: Birthday;
  onSave: (birthday: Omit<Birthday, 'id'>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const BirthdayForm = ({ birthday, onSave, onCancel, isOpen }: BirthdayFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    day: '',
    month: '',
    year: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generate options for dropdowns
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: '01', name: 'Январь' },
    { value: '02', name: 'Февраль' },
    { value: '03', name: 'Март' },
    { value: '04', name: 'Апрель' },
    { value: '05', name: 'Май' },
    { value: '06', name: 'Июнь' },
    { value: '07', name: 'Июль' },
    { value: '08', name: 'Август' },
    { value: '09', name: 'Сентябрь' },
    { value: '10', name: 'Октябрь' },
    { value: '11', name: 'Ноябрь' },
    { value: '12', name: 'Декабрь' }
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (birthday) {
      // Parse existing date (YYYY-MM-DD format)
      const [year, month, day] = birthday.dob.split('-');
      setFormData({
        name: birthday.name,
        day: day,
        month: month,
        year: year,
        notes: birthday.notes || ''
      });
    } else {
      setFormData({
        name: '',
        day: '',
        month: '',
        year: '',
        notes: ''
      });
    }
    setErrors({});
  }, [birthday, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    }

    if (!formData.day || !formData.month || !formData.year) {
      newErrors.dob = 'Все поля даты рождения обязательны';
    } else {
      const selectedDate = new Date(parseInt(formData.year), parseInt(formData.month) - 1, parseInt(formData.day));
      const today = new Date();
      if (selectedDate > today) {
        newErrors.dob = 'Дата рождения не может быть в будущем';
      }

      // Check if the date is valid (e.g., not Feb 30th)
      if (selectedDate.getDate() !== parseInt(formData.day) ||
          selectedDate.getMonth() !== parseInt(formData.month) - 1 ||
          selectedDate.getFullYear() !== parseInt(formData.year)) {
        newErrors.dob = 'Недействительная дата';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert day, month, year to YYYY-MM-DD format
      const dob = `${formData.year}-${formData.month.padStart(2, '0')}-${formData.day.padStart(2, '0')}`;
      
      onSave({
        name: formData.name.trim(),
        dob: dob,
        notes: formData.notes.trim()
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts selecting
    if (errors[name] || errors.dob) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
        dob: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{birthday ? 'Редактировать День Рождения' : 'Добавить День Рождения'}</h2>
          <button onClick={onCancel} className="btn btn-sm btn-secondary">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="name">Имя *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Введите полное имя"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Дата Рождения *</label>
            <div className="date-dropdown-container">
              <select
                name="day"
                value={formData.day}
                onChange={handleChange}
                className={errors.dob ? 'error' : ''}
              >
                <option value="">День</option>
                {days.map(day => (
                  <option key={day} value={day.toString().padStart(2, '0')}>
                    {day}
                  </option>
                ))}
              </select>

              <select
                name="month"
                value={formData.month}
                onChange={handleChange}
                className={errors.dob ? 'error' : ''}
              >
                <option value="">Месяц</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.name}
                  </option>
                ))}
              </select>

              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className={errors.dob ? 'error' : ''}
              >
                <option value="">Год</option>
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            {errors.dob && <span className="error-text">{errors.dob}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="notes">Заметки (необязательно)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Добавьте заметки об этом человеке..."
              rows={3}
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Отмена
            </button>
            <button type="submit" className="btn btn-primary">
              {birthday ? 'Обновить' : 'Добавить'} День Рождения
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 