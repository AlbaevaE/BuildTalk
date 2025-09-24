import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

// Hook to get current user
export function useAuth() {
  return useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      const response = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.status === 401) {
        return null; // Not authenticated
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      
      const user = await response.json();
      return user as User;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401 (not authenticated)
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Hook to logout user
export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear();
      // Redirect to home page
      window.location.href = '/';
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Even if logout request fails, clear cache and redirect
      queryClient.clear();
      window.location.href = '/';
    },
  });
}

// Helper function to get login URL
export function getLoginUrl(): string {
  return '/auth/login';
}

// Helper function to get user display name
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Гость';
  
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  
  if (fullName) {
    return fullName;
  }
  
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return 'Пользователь';
}

// Helper function to get user avatar URL or fallback initials
export function getUserAvatar(user: User | null): { type: 'image' | 'initials'; value: string } {
  if (!user) {
    return { type: 'initials', value: 'Г' };
  }
  
  if (user.profileImageUrl) {
    return { type: 'image', value: user.profileImageUrl };
  }
  
  const displayName = getUserDisplayName(user);
  const initials = displayName
    .split(' ')
    .map(word => word[0]?.toUpperCase() || '')
    .slice(0, 2)
    .join('');
    
  return { type: 'initials', value: initials || 'П' };
}