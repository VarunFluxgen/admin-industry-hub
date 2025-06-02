
import React, { createContext, useContext, useState, useEffect } from 'react';
import { setCookie, getCookie, removeCookie, isTokenValid } from '@/utils/cookieUtils';

interface User {
    username: string;
    industryId: string;
    token?: string;
    refreshToken?: string;
    permissions: string[];
    email: string;
    userId: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    logout: () => void;
    hasFullAccess: () => boolean;
    canOnlyView: () => boolean;
    canEditUnitMeta: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = getCookie('authToken');
        const userData = getCookie('adminUser');
        
        if (token && userData && isTokenValid(token)) {
            try {
                const parsedUser = JSON.parse(userData);
                if (parsedUser.industryId === 'ADMINAPP') {
                    setUser({
                        ...parsedUser,
                        token,
                        permissions: parsedUser.permissions || []
                    });
                } else {
                    logout();
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                logout();
            }
        } else {
            logout();
        }
    }, []);

    const logout = () => {
        removeCookie('adminUser');
        removeCookie('authToken');
        removeCookie('refreshToken');
        setUser(null);
        window.location.href = '/login';
    };

    const hasFullAccess = (): boolean => {
        if (!user) return false;
        return user.permissions.includes('SUPER_USER') || user.permissions.includes('ADMIN');
    };

    const canOnlyView = (): boolean => {
        if (!user) return false;
        return user.permissions.includes('USER') && !hasFullAccess();
    };

    const canEditUnitMeta = (): boolean => {
        if (!user) return false;
        return user.permissions.includes('USER') || hasFullAccess();
    };

    return (
        <AuthContext.Provider 
            value={{ 
                user, 
                isAuthenticated: !!user,
                setUser,
                logout,
                hasFullAccess,
                canOnlyView,
                canEditUnitMeta
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
