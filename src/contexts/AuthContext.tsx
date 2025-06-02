
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    username: string;
    industryId: string;
    token?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const adminUser = localStorage.getItem('adminUser');
        if (adminUser) {
            try {
                const userData = JSON.parse(adminUser);
                if (userData.industryId === 'ADMINAPP') {
                    setUser(userData);
                }
            } catch (error) {
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

    return (
        <AuthContext.Provider 
            value={{ 
                user, 
                isAuthenticated: !!user,
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
