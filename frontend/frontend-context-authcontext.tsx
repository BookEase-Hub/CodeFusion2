import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  subscriptionPlan: 'free' | 'premium';
  subscriptionStatus: 'active' | 'inactive' | 'trial';
  trialEndsAt?: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateAvatar: (imageUrl: string) => Promise<void>;
  updateSubscription: (plan: 'free' | 'premium') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('codefusion_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();  
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {  
        throw new Error('Login failed');  
      }  

      const data = await response.json();  
      setUser(data.user);  
      localStorage.setItem('codefusion_user', JSON.stringify(data.user));  
      localStorage.setItem('codefusion_token', data.token);  
      router.push('/dashboard');  
    } catch (error) {  
      console.error('Login error:', error);  
      throw error;  
    } finally {  
      setIsLoading(false);  
    }  
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {  
        throw new Error('Signup failed');  
      }  

      const data = await response.json();  
      setUser(data.user);  
      localStorage.setItem('codefusion_user', JSON.stringify(data.user));  
      localStorage.setItem('codefusion_token', data.token);  
      router.push('/dashboard');  
    } catch (error) {  
      console.error('Signup error:', error);  
      throw error;  
    } finally {  
      setIsLoading(false);  
    }  
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('codefusion_user');
    localStorage.removeItem('codefusion_token');
    router.push('/login');
  };

  const resetPassword = async (email: string) => {
    try {
      const response = await fetch('/api/v1/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {  
        throw new Error('Password reset failed');  
      }  
    } catch (error) {  
      console.error('Password reset error:', error);  
      throw error;  
    }  
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const token = localStorage.getItem('codefusion_token');
      const response = await fetch('/api/v1/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: Bearer ${token},
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {  
        throw new Error('Profile update failed');  
      }  

      const updatedUser = await response.json();  
      setUser(updatedUser);  
      localStorage.setItem('codefusion_user', JSON.stringify(updatedUser));  
    } catch (error) {  
      console.error('Profile update error:', error);  
      throw error;  
    }  
  };

  const updateAvatar = async (imageUrl: string) => {
    try {
      const token = localStorage.getItem('codefusion_token');
      const response = await fetch('/api/v1/avatar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: Bearer ${token},
        },
        body: JSON.stringify({ avatar: imageUrl }),
      });

      if (!response.ok) {  
        throw new Error('Avatar update failed');  
      }  

      const updatedUser = await response.json();  
      setUser(updatedUser);  
      localStorage.setItem('codefusion_user', JSON.stringify(updatedUser));  
    } catch (error) {  
      console.error('Avatar update error:', error);  
      throw error;  
    }  
  };

  const updateSubscription = async (plan: 'free' | 'premium') => {
    try {
      const token = localStorage.getItem('codefusion_token');
      const response = await fetch('/api/v1/subscription', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: Bearer ${token},
        },
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {  
        throw new Error('Subscription update failed');  
      }  

      const updatedUser = await response.json();  
      setUser(updatedUser);  
      localStorage.setItem('codefusion_user', JSON.stringify(updatedUser));  
    } catch (error) {  
      console.error('Subscription update error:', error);  
      throw error;  
    }  
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    resetPassword,
    updateProfile,
    updateAvatar,
    updateSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};