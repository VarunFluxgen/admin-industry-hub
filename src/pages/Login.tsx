
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building2 } from 'lucide-react';

const Login = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(
                'http://127.0.0.1:5001/api/admin/user/login?format=v1',
                {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        username: credentials.username,
                        password: credentials.password,
                        LoginType: 'DEFAULT',
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log('Login response:', data);
                
                if (data.industryId === 'ADMINAPP') {
                    // Store user data in localStorage
                    localStorage.setItem('adminUser', JSON.stringify(data));
                    localStorage.setItem('authToken', data.token || '');
                    
                    toast({
                        title: 'Login Successful',
                        description: 'Welcome to Admin Panel',
                    });
                    
                    console.log('Redirecting to dashboard...');
                    // Force redirect to dashboard
                    window.location.href = '/';
                } else {
                    toast({
                        title: 'Access Denied',
                        description: 'You do not have admin access to this application.',
                        variant: 'destructive',
                    });
                }
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast({
                title: 'Login Failed',
                description: 'Invalid username or password. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                        <Building2 className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl">Admin Login</CardTitle>
                    <CardDescription>
                        Enter your credentials to access the admin panel
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                value={credentials.username}
                                onChange={(e) =>
                                    setCredentials({
                                        ...credentials,
                                        username: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={credentials.password}
                                onChange={(e) =>
                                    setCredentials({
                                        ...credentials,
                                        password: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
