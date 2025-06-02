
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    const logout = () => {
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider 
            value={{ 
                user, 
                isAuthenticated: !!user,
                setUser,
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
