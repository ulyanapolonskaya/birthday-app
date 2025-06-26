import { useState, useEffect } from 'react';
import { Calendar, LogOut } from 'lucide-react';
import type { Birthday, BirthdayWithCalculations } from './types';
import type { User } from 'firebase/auth';
import { enrichBirthdayData, sortBirthdaysByUpcoming } from './utils/dateUtils';
import { BirthdayCard } from './components/BirthdayCard';
import { BirthdayForm } from './components/BirthdayForm';
import { ConfirmDialog } from './components/ConfirmDialog';
import { LoginForm } from './components/LoginForm';
import { AuthService } from './services/authService';
import { BirthdayService } from './services/birthdayService';

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

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [enrichedBirthdays, setEnrichedBirthdays] = useState<BirthdayWithCalculations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

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

  const authService = AuthService.getInstance();
  const birthdayService = BirthdayService.getInstance();

  // Initialize authentication and listen for auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (authUser) => {
      setUser(authUser);
      setInitializing(false);
      
      if (authUser) {
        await loadBirthdays(authUser);
      } else {
        setBirthdays([]);
        setError(null);
      }
    });

    return unsubscribe;
  }, []);

  // Load birthdays from Firestore
  const loadBirthdays = async (authUser: User) => {
    try {
      setLoading(true);
      setError(null);
      
      let firestoreBirthdays = await birthdayService.getBirthdays(authUser);
      
      // If no birthdays in Firestore, try to migrate from localStorage or JSON
      if (firestoreBirthdays.length === 0) {
        let defaultBirthdays: Birthday[] = [];
        
        // First try localStorage
        const localData = localStorage.getItem('birthdays');
        if (localData) {
          defaultBirthdays = JSON.parse(localData);
        } else {
          // Then try JSON file
          try {
            const response = await fetch('./birthdays.json');
            if (response.ok) {
              defaultBirthdays = await response.json();
            }
                     } catch {
             console.log('No default birthdays.json found');
           }
        }
        
        if (defaultBirthdays.length > 0) {
          await birthdayService.migrateBirthdays(authUser, defaultBirthdays);
          firestoreBirthdays = await birthdayService.getBirthdays(authUser);
        }
      }
      
      setBirthdays(firestoreBirthdays);
    } catch (err) {
      setError('Не удалось загрузить дни рождения. Пожалуйста, попробуйте позже.');
      console.error('Error loading birthdays:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update enriched birthdays when birthdays change
  useEffect(() => {
    const enriched = birthdays.map(enrichBirthdayData);
    const sorted = sortBirthdaysByUpcoming(enriched);
    setEnrichedBirthdays(sorted);
  }, [birthdays]);

  const handleAddBirthday = async (birthdayData: Omit<Birthday, 'id'>) => {
    if (!user) return;
    
    try {
      const newId = await birthdayService.addBirthday(user, birthdayData);
      const newBirthday: Birthday = { ...birthdayData, id: newId };
      setBirthdays(prev => [...prev, newBirthday]);
      setIsFormOpen(false);
    } catch (err) {
      setError('Не удалось добавить день рождения.');
      console.error('Error adding birthday:', err);
    }
  };

  const handleEditBirthday = async (birthdayData: Omit<Birthday, 'id'>) => {
    if (!editingBirthday || !user) return;
    
    try {
      await birthdayService.updateBirthday(user, editingBirthday.id, birthdayData);
      setBirthdays(prev => prev.map(b => 
        b.id === editingBirthday.id 
          ? { ...birthdayData, id: editingBirthday.id }
          : b
      ));
      setIsFormOpen(false);
      setEditingBirthday(undefined);
    } catch (err) {
      setError('Не удалось обновить день рождения.');
      console.error('Error updating birthday:', err);
    }
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

  const confirmDelete = async () => {
    if (!user) return;
    
    try {
      await birthdayService.deleteBirthday(user, deleteConfirm.birthdayId);
      setBirthdays(prev => prev.filter(b => b.id !== deleteConfirm.birthdayId));
      setDeleteConfirm({ isOpen: false, birthdayId: '', birthdayName: '' });
    } catch (err) {
      setError('Не удалось удалить день рождения.');
      console.error('Error deleting birthday:', err);
    }
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



  const todaysBirthdays = enrichedBirthdays.filter(b => b.isToday);

  if (initializing) {
    return (
      <div className="container">
        <div className="flex justify-center items-center" style={{ minHeight: '50vh' }}>
          <div className="text-center">
            <Calendar size={48} style={{ color: 'var(--accent-teal)', margin: '0 auto 1rem' }} />
            <p>Инициализация...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  if (loading) {
    return (
      <div className="container">
        <div className="flex justify-center items-center" style={{ minHeight: '50vh' }}>
          <div className="text-center">
            <Calendar size={48} style={{ color: 'var(--accent-teal)', margin: '0 auto 1rem' }} />
            <p>Загрузка дней рождения...</p>
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
              onClick={() => user && loadBirthdays(user)} 
              className="btn btn-primary"
              style={{ marginTop: 'var(--spacing-md)' }}
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header style={{ padding: 'var(--spacing-xl) 0' }}>
        <div className="mb-lg">
          <div className="flex items-center justify-between">
            <h1 className="flex items-center gap-md">
              <Calendar size={40} style={{ color: 'var(--accent-teal)' }} />
              Семейные Дни Рождения
            </h1>
            <div className="user-info">
              <div className="user-name">
                {user.displayName || (user.isAnonymous ? 'Гость' : user.email)}
              </div>
              <button 
                onClick={() => authService.logout().catch(console.error)}
                className="logout-btn"
                title="Выйти"
              >
                <LogOut size={16} />
                выйти
              </button>
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', marginTop: 'var(--spacing-sm)' }}>
            Отслеживайте дни рождения ваших близких и никогда не забывайте поздравить!
          </p>
        </div>

        {/* Today's Birthdays Alert */}
        {todaysBirthdays.length > 0 && (
          <div className="birthday-alert">
            <div className="flex items-center gap-sm mb-sm">
              <Calendar size={20} />
              <strong>🎉 Сегодня день рождения!</strong>
            </div>
            <div className="flex flex-wrap gap-sm">
              {todaysBirthdays.map(birthday => (
                <span key={birthday.id} className="birthday-alert-name">
                  {birthday.name} ({birthday.age !== undefined ? `${birthday.age} ${getYearsWord(birthday.age)}` : 'возраст неизвестен'})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-sm flex-wrap">
          <button onClick={openAddForm} className="btn btn-primary">
            Добавить день рождения
          </button>
        </div>
      </header>

      <main>
        <div className="birthday-grid">
          {enrichedBirthdays.map((birthday) => (
            <BirthdayCard
              key={birthday.id}
              birthday={birthday}
              onEdit={openEditForm}
              onDelete={handleDeleteBirthday}
            />
          ))}
        </div>

        {enrichedBirthdays.length === 0 && (
          <div className="empty-state">
            <Calendar size={64} style={{ color: 'var(--text-muted)', margin: '0 auto var(--spacing-lg)' }} />
            <h2>Нет дней рождения</h2>
            <p>Добавьте первый день рождения, чтобы начать отслеживание.</p>
            <button onClick={openAddForm} className="btn btn-primary">
              Добавить день рождения
            </button>
          </div>
        )}
      </main>

             {/* Birthday Form Modal */}
       <BirthdayForm
         birthday={editingBirthday}
         onSave={editingBirthday ? handleEditBirthday : handleAddBirthday}
         onCancel={closeForm}
         isOpen={isFormOpen}
       />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Удалить день рождения"
        message={`Вы уверены, что хотите удалить день рождения ${deleteConfirm.birthdayName}?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, birthdayId: '', birthdayName: '' })}
      />
    </div>
  );
}

export default App;
