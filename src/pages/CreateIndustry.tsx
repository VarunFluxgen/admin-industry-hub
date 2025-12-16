import { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { logApiCall } from '@/utils/apiLogger';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Copy } from 'lucide-react';

interface CreatedIndustryData {
    industryId: string;
    industryName: string;
    userName: string;
    password: string;
}

const CreateIndustry = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [createdIndustry, setCreatedIndustry] = useState<CreatedIndustryData | null>(null);
    const [formData, setFormData] = useState({
        industryName: '',
        userName: '',
        password: '',
    });
    const { toast } = useToast();
    const navigate = useNavigate();

    const validateField = (value: string, fieldName: string) => {
        if (value.includes(' ')) {
            toast({
                title: 'Validation Error',
                description: `${fieldName} cannot contain spaces`,
                variant: 'destructive',
            });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate username and password for spaces
        if (!validateField(formData.userName, 'Username') || !validateField(formData.password, 'Password')) {
            return;
        }

        setIsLoading(true);

        try {
            const apiEndpoint = 'https://admin-aquagen-api-bfckdag2aydtegc2.southindia-01.azurewebsites.net/api/admin/industry/';
            
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    Authorization:
                        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6dHJ1ZSwiaWF0IjoxNzY1ODcyMDk5LCJqdGkiOiIxM2IzNjgyZS1jNTBlLTRlOTQtYTQ1Yi04ODQwNTQ5MWU0YjIiLCJ0eXBlIjoiYWNjZXNzIiwic3ViIjoiSU5URVJOQUwiLCJuYmYiOjE3NjU4NzIwOTksImV4cCI6MTgzMDY3MjA5OSwidXNlcklkIjoiSU5URVJOQUxfREVGQVVMVF92YXJ1biIsImVtYWlsIjoidmFydW5AYXF1YWdlbi5jb20iLCJ1c2VybmFtZSI6InZhcnVuIiwibG9naW5UeXBlIjoiQURNSU5fREVGQVVMVCIsInJvbGUiOiJ1c2VyIiwicGVybWlzc2lvbnMiOlsiU1VQRVJfVVNFUiIsIkFMRVJUUyIsIkFDQ09VTlRfU0VUVElOR1MiXX0.II4LBKgTOffmj3nRwlc5ce25VJ4pK4hieML1ZNrt_DQ',
                    industryName: formData.industryName,
                    userName: formData.userName,
                    password: formData.password,
                },
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log('API Success Response:', responseData);

                // Log the API call for creating industry
                await logApiCall(apiEndpoint, {
                    method: 'POST',
                    industryName: formData.industryName,
                    userName: formData.userName,
                });

                // Set the created industry data to display with industryId from API response
                setCreatedIndustry({
                    industryId: responseData.data?.industryId || 'N/A',
                    industryName: responseData.data?.industryName || formData.industryName,
                    userName: responseData.data?.userName || formData.userName,
                    password: responseData.data?.password || formData.password,
                });

                toast({
                    title: 'Success',
                    description: 'Industry created successfully!',
                });

                // Reset form
                setFormData({
                    industryName: '',
                    userName: '',
                    password: '',
                });
            } else {
                // Extract actual error details from API response
                let errorMessage = 'Failed to create industry. Please try again.';
                let errorDetails = '';

                try {
                    const errorData = await response.json();
                    console.log('API Error Response:', errorData);
                    
                    // Extract error message from various possible response formats
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    } else if (errorData.error) {
                        errorMessage = errorData.error;
                    } else if (errorData.detail) {
                        errorMessage = errorData.detail;
                    } else if (errorData.msg) {
                        errorMessage = errorData.msg;
                    }

                    // Add additional error details if available
                    if (errorData.errors && Array.isArray(errorData.errors)) {
                        errorDetails = errorData.errors.join(', ');
                    } else if (errorData.validation_errors) {
                        errorDetails = JSON.stringify(errorData.validation_errors);
                    }

                    // Include status code and status text
                    errorDetails += ` (Status: ${response.status} ${response.statusText})`;
                } catch (parseError) {
                    console.error('Error parsing API response:', parseError);
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                    errorDetails = 'Unable to parse error response from server';
                }

                toast({
                    title: 'Error Creating Industry',
                    description: `${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''}`,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Network/Request Error:', error);
            
            let errorMessage = 'Network error occurred. Please check your connection and try again.';
            let errorDetails = '';

            if (error instanceof Error) {
                errorMessage = error.message;
                errorDetails = error.name;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }

            toast({
                title: 'Connection Error',
                description: `${errorMessage}${errorDetails ? ` (${errorDetails})` : ''}`,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        // Prevent spaces in username and password fields
        if ((name === 'userName' || name === 'password') && value.includes(' ')) {
            return;
        }
        
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const copyToClipboard = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: 'Copied!',
            description: `${fieldName} copied to clipboard`,
        });
    };

    const createNewIndustry = () => {
        setCreatedIndustry(null);
    };

    return (
        <div className='flex-1 space-y-4 p-8 pt-6'>
            <div className='flex items-center gap-4'>
                <SidebarTrigger />
                <div>
                    <h2 className='text-3xl font-bold tracking-tight'>
                        Create Industry
                    </h2>
                    <p className='text-muted-foreground'>
                        Add a new industry to the system
                    </p>
                </div>
            </div>

            {createdIndustry ? (
                <div className='space-y-4'>
                    <Alert className='border-green-200 bg-green-50'>
                        <CheckCircle className='h-4 w-4 text-green-600' />
                        <AlertDescription className='text-green-800'>
                            <strong>Industry Created Successfully!</strong>
                        </AlertDescription>
                    </Alert>

                    <Card className='max-w-2xl'>
                        <CardHeader>
                            <CardTitle className='text-green-700'>Industry Details</CardTitle>
                            <CardDescription>
                                Please save these details. The password will not be shown again.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='grid grid-cols-1 gap-4'>
                                <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                                    <div>
                                        <Label className='text-sm font-medium text-gray-600'>Industry ID</Label>
                                        <p className='text-lg font-semibold'>{createdIndustry.industryId}</p>
                                    </div>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => copyToClipboard(createdIndustry.industryId, 'Industry ID')}
                                    >
                                        <Copy className='h-4 w-4' />
                                    </Button>
                                </div>

                                <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                                    <div>
                                        <Label className='text-sm font-medium text-gray-600'>Industry Name</Label>
                                        <p className='text-lg font-semibold'>{createdIndustry.industryName}</p>
                                    </div>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => copyToClipboard(createdIndustry.industryName, 'Industry name')}
                                    >
                                        <Copy className='h-4 w-4' />
                                    </Button>
                                </div>

                                <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                                    <div>
                                        <Label className='text-sm font-medium text-gray-600'>Username</Label>
                                        <p className='text-lg font-semibold'>{createdIndustry.userName}</p>
                                    </div>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => copyToClipboard(createdIndustry.userName, 'Username')}
                                    >
                                        <Copy className='h-4 w-4' />
                                    </Button>
                                </div>

                                <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                                    <div>
                                        <Label className='text-sm font-medium text-gray-600'>Password</Label>
                                        <p className='text-lg font-semibold font-mono'>{createdIndustry.password}</p>
                                    </div>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => copyToClipboard(createdIndustry.password, 'Password')}
                                    >
                                        <Copy className='h-4 w-4' />
                                    </Button>
                                </div>
                            </div>

                            <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                                <p className='text-sm text-blue-800'>
                                    <strong>Important:</strong> A default logo will automatically be added. Use account settings in dashboard to update the logo. Without Unit Mapping user will not be able to login to dashboard.
                                </p>
                            </div>

                            <div className='flex gap-4 pt-4'>
                                <Button onClick={createNewIndustry}>
                                    Create Another Industry
                                </Button>
                                <Button
                                    variant='outline'
                                    onClick={() => navigate('/industries')}
                                >
                                    Go to Industries
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <Card className='max-w-2xl'>
                    <CardHeader>
                        <CardTitle>Industry Information</CardTitle>
                        <CardDescription>
                            Fill in the details to create a new industry
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                            <p className='text-sm text-blue-800'>
                                <strong>Important Note:</strong> Once a customer is created, please save the details of created user. A default logo will automatically be added. Use account settings in dashboard to update the logo. Without Unit Mapping user will not be able to login to dashboard.
                            </p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='industryName'>Industry Name</Label>
                                <Input
                                    id='industryName'
                                    name='industryName'
                                    value={formData.industryName}
                                    onChange={handleInputChange}
                                    placeholder='Enter industry name'
                                    required
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='userName'>Username</Label>
                                <Input
                                    id='userName'
                                    name='userName'
                                    value={formData.userName}
                                    onChange={handleInputChange}
                                    placeholder='Enter username (no spaces allowed)'
                                    required
                                />
                                <p className='text-xs text-muted-foreground'>
                                    Username must be unique and at least 6 characters long and contain both uppercase and lowercase letters. No spaces allowed.
                                </p>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='password'>Password</Label>
                                <Input
                                    id='password'
                                    name='password'
                                    type='text'
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder='Enter password (no spaces allowed)'
                                    required
                                />
                                <p className='text-xs text-muted-foreground'>
                                    Password must be at least 6 characters long and contain both uppercase, lowercase letters, Number and a special character. No spaces allowed.
                                </p>
                            </div>

                            <div className='flex gap-4 pt-4'>
                                <Button type='submit' disabled={isLoading}>
                                    {isLoading ? 'Creating...' : 'Create Industry'}
                                </Button>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={() => navigate('/industries')}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default CreateIndustry;
