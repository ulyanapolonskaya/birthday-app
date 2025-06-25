import { useState } from 'react';
import { Calendar, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { AuthService } from '../services/authService';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authService = AuthService.getInstance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    if (!isLogin && !displayName) {
      setError('Пожалуйста, укажите ваше имя');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await authService.signInWithEmail(email, password);
      } else {
        await authService.registerWithEmail(email, password, displayName);
      }
      onSuccess?.();
    } catch (error: unknown) {
      console.error('Authentication error:', error);
      
      // Handle Firebase auth errors with user-friendly messages
      let errorMessage = 'Произошла ошибка. Попробуйте еще раз.';
      
      const firebaseError = error as { code?: string; message?: string };
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          errorMessage = 'Пользователь с таким email не найден';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Неверный пароль';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'Пользователь с таким email уже существует';
          break;
        case 'auth/weak-password':
          errorMessage = 'Пароль слишком слабый. Используйте минимум 6 символов';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Неверный формат email';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Слишком много попыток входа. Попробуйте позже';
          break;
        default:
          errorMessage = firebaseError.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await authService.signInAnonymously();
      onSuccess?.();
    } catch {
      setError('Не удалось войти анонимно. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <Calendar size={48} style={{ color: 'var(--accent-teal)', margin: '0 auto var(--spacing-md)' }} />
          <h1>Семейные Дни Рождения</h1>
          <p>Войдите в систему, чтобы продолжить</p>
        </div>

        <div className="login-tabs">
          <button
            type="button"
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
          >
            <LogIn size={16} />
            Вход
          </button>
          <button
            type="button"
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
          >
            <UserPlus size={16} />
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form-content">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="displayName">Ваше имя</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Введите ваше имя"
                disabled={loading}
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <div className="password-input">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                disabled={loading}
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="login-divider">
          <span>или</span>
        </div>

        <button
          type="button"
          onClick={handleAnonymousLogin}
          className="btn btn-secondary btn-full"
          disabled={loading}
        >
          Войти как гость
        </button>

        <div className="login-footer">
          <p>
            {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              disabled={loading}
            >
              {isLogin ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}; 