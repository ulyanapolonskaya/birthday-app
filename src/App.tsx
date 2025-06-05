import { useState, useEffect } from 'react';
import { Plus, Calendar, Download } from 'lucide-react';
import type { Birthday, BirthdayWithCalculations } from './types';
import { enrichBirthdayData, sortBirthdaysByUpcoming } from './utils/dateUtils';
import { BirthdayCard } from './components/BirthdayCard';
import { BirthdayForm } from './components/BirthdayForm';
import { ConfirmDialog } from './components/ConfirmDialog';

function App() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [enrichedBirthdays, setEnrichedBirthdays] = useState<BirthdayWithCalculations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBirthday, setEditingBirthday] = useState<Birthday | undefined>();

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    birthdayId: string;
    birthdayName: string;
  }>({
    isOpen: false,
    birthdayId: '',
    birthdayName: ''
  });

  // Load birthdays from JSON file
  useEffect(() => {
    const loadBirthdays = async () => {
      try {
        setLoading(true);
        const response = await fetch('/birthdays.json');
        if (!response.ok) {
          throw new Error('Failed to load birthdays');
        }
        const data: Birthday[] = await response.json();
        
        // Check for localStorage data (for local changes)
        const localData = localStorage.getItem('birthdays');
        const birthdaysToUse = localData ? JSON.parse(localData) : data;
        
        setBirthdays(birthdaysToUse);
        setError(null);
      } catch (err) {
        setError('Failed to load birthdays. Please try again later.');
        console.error('Error loading birthdays:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBirthdays();
  }, []);

  // Update enriched birthdays when birthdays change
  useEffect(() => {
    const enriched = birthdays.map(enrichBirthdayData);
    const sorted = sortBirthdaysByUpcoming(enriched);
    setEnrichedBirthdays(sorted);
  }, [birthdays]);

  // Save to localStorage
  const saveBirthdays = (newBirthdays: Birthday[]) => {
    setBirthdays(newBirthdays);
    localStorage.setItem('birthdays', JSON.stringify(newBirthdays));
  };

  const handleAddBirthday = (birthdayData: Omit<Birthday, 'id'>) => {
    const newBirthday: Birthday = {
      ...birthdayData,
      id: Date.now().toString() // Simple ID generation
    };
    
    const newBirthdays = [...birthdays, newBirthday];
    saveBirthdays(newBirthdays);
    setIsFormOpen(false);
  };

  const handleEditBirthday = (birthdayData: Omit<Birthday, 'id'>) => {
    if (!editingBirthday) return;
    
    const updatedBirthdays = birthdays.map(b => 
      b.id === editingBirthday.id 
        ? { ...birthdayData, id: editingBirthday.id }
        : b
    );
    
    saveBirthdays(updatedBirthdays);
    setIsFormOpen(false);
    setEditingBirthday(undefined);
  };

  const handleDeleteBirthday = (id: string) => {
    const birthday = birthdays.find(b => b.id === id);
    if (birthday) {
      setDeleteConfirm({
        isOpen: true,
        birthdayId: id,
        birthdayName: birthday.name
      });
    }
  };

  const confirmDelete = () => {
    const newBirthdays = birthdays.filter(b => b.id !== deleteConfirm.birthdayId);
    saveBirthdays(newBirthdays);
    setDeleteConfirm({ isOpen: false, birthdayId: '', birthdayName: '' });
  };

  const openEditForm = (birthday: BirthdayWithCalculations) => {
    setEditingBirthday(birthday);
    setIsFormOpen(true);
  };

  const openAddForm = () => {
    setEditingBirthday(undefined);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingBirthday(undefined);
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(birthdays, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'birthdays.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const todaysBirthdays = enrichedBirthdays.filter(b => b.isToday);

  if (loading) {
    return (
      <div className="container">
        <div className="flex justify-center items-center" style={{ minHeight: '50vh' }}>
          <div className="text-center">
            <Calendar size={48} style={{ color: 'var(--accent-teal)', margin: '0 auto 1rem' }} />
            <p>Loading birthdays...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="flex justify-center items-center" style={{ minHeight: '50vh' }}>
          <div className="text-center">
            <p style={{ color: 'var(--error)' }}>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
              style={{ marginTop: 'var(--spacing-md)' }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header style={{ padding: 'var(--spacing-xl) 0' }}>
        <div className="flex justify-between items-center mb-lg">
          <div>
            <h1 className="flex items-center gap-md">
              <Calendar size={40} style={{ color: 'var(--accent-teal)' }} />
              Family Birthdays
            </h1>
            <p className="text-secondary" style={{ margin: 0 }}>
              Keep track of your loved ones' special days
            </p>
          </div>
          
          <div className="flex gap-sm">
            <button onClick={downloadJSON} className="btn btn-secondary" title="Download JSON">
              <Download size={16} />
              Export
            </button>
            <button onClick={openAddForm} className="btn btn-primary">
              <Plus size={16} />
              Add Birthday
            </button>
          </div>
        </div>

        {todaysBirthdays.length > 0 && (
          <div className="birthday-alert">
            <h2 style={{ color: 'var(--accent-rose)', margin: '0 0 var(--spacing-sm) 0' }}>
              🎉 Today's Birthdays!
            </h2>
            <div className="flex flex-col gap-sm">
              {todaysBirthdays.map(birthday => (
                <span key={birthday.id} className="text-lg">
                  <strong>{birthday.name}</strong> turns {birthday.age}!
                </span>
              ))}
            </div>
          </div>
        )}
      </header>

      <main>
        {enrichedBirthdays.length === 0 ? (
          <div className="text-center" style={{ padding: 'var(--spacing-2xl) 0' }}>
            <Calendar size={64} style={{ color: 'var(--text-muted)', margin: '0 auto var(--spacing-lg)' }} />
            <h3 className="text-muted">No birthdays yet</h3>
            <p className="text-muted mb-lg">Add your first birthday to get started!</p>
            <button onClick={openAddForm} className="btn btn-primary">
              <Plus size={16} />
              Add Your First Birthday
            </button>
          </div>
        ) : (
          <div className="birthday-grid">
            {enrichedBirthdays.map(birthday => (
              <BirthdayCard
                key={birthday.id}
                birthday={birthday}
                onEdit={openEditForm}
                onDelete={handleDeleteBirthday}
              />
            ))}
          </div>
        )}
      </main>

      <BirthdayForm
        birthday={editingBirthday}
        onSave={editingBirthday ? handleEditBirthday : handleAddBirthday}
        onCancel={closeForm}
        isOpen={isFormOpen}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Birthday"
        message={`Are you sure you want to delete ${deleteConfirm.birthdayName}'s birthday? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, birthdayId: '', birthdayName: '' })}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}

export default App;
