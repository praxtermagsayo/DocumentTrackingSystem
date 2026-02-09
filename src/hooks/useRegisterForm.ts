import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  organization: string;
}

const initialFormData: RegisterFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  organization: '',
};

export function useRegisterForm(isAuthenticated: boolean) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>(initialFormData);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const validateForm = useCallback((): boolean => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (!validateForm()) return;
      setIsLoading(true);
      try {
        const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            data: {
              full_name: fullName,
              organization: formData.organization || undefined,
              phone: formData.phone || undefined,
            },
          },
        });
        if (signUpError) throw signUpError;
        if (data.session) {
          navigate('/', { replace: true });
        } else {
          navigate('/login', {
            replace: true,
            state: { message: 'Account created. Please check your email to confirm your account.' },
          });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [formData, validateForm, navigate]
  );

  return {
    formData,
    handleChange,
    error,
    isLoading,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleSubmit,
  };
}
