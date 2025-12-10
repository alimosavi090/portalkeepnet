import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from './queryClient';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  admin: { id: number; username: string } | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<{ id: number; username: string } | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/v1/auth/me'],
    retry: false,
  });

  useEffect(() => {
    if (data && typeof data === 'object' && 'id' in data) {
      setAdmin(data as { id: number; username: string });
    } else {
      setAdmin(null);
    }
  }, [data]);

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await apiRequest('POST', '/api/v1/auth/login', { username, password });
      return response;
    },
    onSuccess: () => {
      refetch();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/v1/auth/logout');
    },
    onSuccess: () => {
      setAdmin(null);
      queryClient.invalidateQueries({ queryKey: ['/api/v1/auth/me'] });
    },
  });

  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated: !!admin, 
        isLoading, 
        admin, 
        login, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
