import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import type { AppContextType } from '../contexts/AppContext';

export function useLoginForm(login: AppContextType['login'], isAuthenticated: boolean) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (!email.trim() || !password) {
        setError('Please enter both email and password');
        return;
      }
      setIsLoading(true);
      try {
        await login(email.trim(), password);
        navigate('/', { replace: true });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Invalid email or password.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, login, navigate]
  );

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    showPassword,
    setShowPassword,
    handleSubmit,
    isAuthenticated,
    navigate,
  };
}
