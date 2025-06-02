
import React, { createContext, useContext, useState, useEffect } from 'react';

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
    hasFullAccess: () => boolean;
    canOnlyViewAndUpdateUnitMeta: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const adminUser = localStorage.getItem('adminUser');
        const authToken = localStorage.getItem('authToken');
        
        if (adminUser && authToken) {
            try {
                const userData = JSON.parse(adminUser);
                if (userData.industryId === 'ADMINAPP') {
                    setUser({
                        ...userData,
                        token: authToken,
                        permissions: userData.permissions || []
                    });
                }
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                localStorage.removeItem('adminUser');
                localStorage.removeItem('authToken');
            }
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('adminUser');
        localStorage.removeItem('authToken');
        setUser(null);
        window.location.href = '/login';
    };

    const hasFullAccess = (): boolean => {
        if (!user) return false;
        return user.permissions.some(permission => 
            permission === 'SUPER_USER' || permission === 'ADMIN'
        );
    };

    const canOnlyViewAndUpdateUnitMeta = (): boolean => {
        if (!user) return false;
        return user.permissions.includes('USER') && !hasFullAccess();
    };

    return (
        <AuthContext.Provider 
            value={{ 
                user, 
                isAuthenticated: !!user,
                setUser,
                logout,
                hasFullAccess,
                canOnlyViewAndUpdateUnitMeta
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
