import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  profile?: {
    date_of_birth?: string;
    country?: string;
    contact_number?: string;
    pincode?: string;
    address_line1?: string;
    address_line2?: string;
    landmark?: string;
    city?: string;
    state?: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (isOpen: boolean) => void;
  registrationSuccess: boolean;
  setRegistrationSuccess: (success: boolean) => void;
  pendingCheckout: boolean;
  setPendingCheckout: (value: boolean) => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<User['profile']>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [logoutTimer, setLogoutTimer] = useState<NodeJS.Timeout | null>(null);

  const setAutoLogout = (expirationTime: number) => {
    if (logoutTimer) clearTimeout(logoutTimer);
    const timer = setTimeout(() => {
      logout();
    }, expirationTime - Date.now());
    setLogoutTimer(timer);
  };

  const handleAuthResponse = async (response: Response) => {
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    
    if (!response.ok) {
      if (response.status === 401) logout();
      throw new Error(data.detail || text || 'Request failed');
    }
    return data;
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8000/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const userData = await handleAuthResponse(response);
      setUser({
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        name: userData.first_name,
        profile: userData.profile
      });
    } catch (error) {
      logout();
      throw error;
    }
  };

  const initializeAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decoded = parseJwt(token);
      if (!decoded?.exp || decoded.exp * 1000 < Date.now()) {
        logout();
        return;
      }

      setAutoLogout(decoded.exp * 1000);
      await fetchProfile();
    } catch (error) {
      logout();
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await handleAuthResponse(response);
      localStorage.setItem('token', data.access_token);
      
      const decoded = parseJwt(data.access_token);
      setAutoLogout(decoded.exp * 1000);
      
      await fetchProfile();
      setIsLoginModalOpen(false);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          password,
          first_name: firstName,
          last_name: lastName
        }),
      });

      await handleAuthResponse(response);
      setRegistrationSuccess(true);
      setIsLoginModalOpen(true);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    if (logoutTimer) {
      clearTimeout(logoutTimer);
      setLogoutTimer(null);
    }
  };

  const updateProfile = async (profileData: Partial<User['profile']>) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('User not authenticated');

    try {
      const response = await fetch('http://localhost:8000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      await handleAuthResponse(response);
      await fetchProfile();
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isLoginModalOpen, 
      setIsLoginModalOpen,
      registrationSuccess, 
      setRegistrationSuccess,
      pendingCheckout,
      setPendingCheckout,
      fetchProfile,
      updateProfile
    }}>
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