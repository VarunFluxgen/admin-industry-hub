
import React, { createContext, useContext, useState, useEffect } from 'react';
import { setCookie, getCookie, removeCookie, isTokenValid } from '@/utils/cookieUtils';

interface User {
    username: string;
    industryId: string;
    token?: string;
    permissions: string[];
    email?: string;
    userId?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Check for stored user data in cookies
        const storedUser = getCookie('adminUser');
        const storedToken = getCookie('authToken');
        
        if (storedUser && storedToken) {
            try {
                const userData = JSON.parse(storedUser);
                
                // Validate token
                if (isTokenValid(storedToken) && userData.industryId === 'ADMINAPP') {
                    setUser({
                        ...userData,
                        token: storedToken
                    });
                } else {
                    // Token expired or invalid, logout
                    logout();
                }
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                logout();
            }
        }
    }, []);

    const logout = () => {
        removeCookie('adminUser');
        removeCookie('authToken');
        removeCookie('refreshToken');
        setUser(null);
        window.location.href = '/login';
    };

    const setUserAndStore = (userData: User | null) => {
        if (userData) {
            // Store in cookies
            setCookie('adminUser', JSON.stringify(userData), 7);
            if (userData.token) {
                setCookie('authToken', userData.token, 7);
            }
        }
        setUser(userData);
    };

    return (
        <AuthContext.Provider 
            value={{ 
                user, 
                isAuthenticated: !!user,
                setUser: setUserAndStore,
                logout 
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
