import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
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
    dob: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (birthday) {
      setFormData({
        name: birthday.name,
        dob: birthday.dob,
        notes: birthday.notes || ''
      });
    } else {
      setFormData({
        name: '',
        dob: '',
        notes: ''
      });
    }
    setErrors({});
  }, [birthday, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const selectedDate = new Date(formData.dob);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.dob = 'Date of birth cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave({
        name: formData.name.trim(),
        dob: formData.dob,
        notes: formData.notes.trim()
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{birthday ? 'Edit Birthday' : 'Add Birthday'}</h2>
          <button onClick={onCancel} className="btn btn-sm btn-secondary">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="dob">Date of Birth *</label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className={errors.dob ? 'error' : ''}
            />
            {errors.dob && <span className="error-text">{errors.dob}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any notes about this person..."
              rows={3}
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              {birthday ? 'Update' : 'Add'} Birthday
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 