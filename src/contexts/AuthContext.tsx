
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

// Helper function to check if JWT token is expired
const isTokenExpired = (token: string): boolean => {
    try {
        // Remove 'Bearer ' prefix if present
        const cleanToken = token.replace('Bearer ', '');
        
        // Decode JWT payload (base64)
        const payload = JSON.parse(atob(cleanToken.split('.')[1]));
        
        // Check if token has expired (exp is in seconds, Date.now() is in milliseconds)
        const currentTime = Math.floor(Date.now() / 1000);
        
        return payload.exp < currentTime;
    } catch (error) {
        console.error('Error decoding JWT token:', error);
        // If we can't decode the token, consider it expired
        return true;
    }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const adminUser = localStorage.getItem('adminUser');
        const authToken = localStorage.getItem('authToken');

        if (adminUser && authToken) {
            try {
                // Check if token is expired
                if (isTokenExpired(authToken)) {
                    console.log('Auth token has expired, logging out...');
                    localStorage.removeItem('adminUser');
                    localStorage.removeItem('authToken');
                    return;
                }

                const userData = JSON.parse(adminUser);
                if (userData.industryId === 'ADMINAPP') {
                    setUser({
                        ...userData,
                        token: authToken,
                        permissions: userData.permissions || [],
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
        return user.permissions.some(
            (permission) =>
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
                canOnlyViewAndUpdateUnitMeta,
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
