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

const CreateIndustry = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        industryName: '',
        userName: '',
        password: '',
    });
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(
                'https://admin-aquagen-api-bfckdag2aydtegc2.southindia-01.azurewebsites.net/api/admin/industry/',
                {
                    method: 'POST',
                    headers: {
                        accept: 'application/json',
                        Authorization:
                            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6dHJ1ZSwiaWF0IjoxNzM0MzI2NDU2LCJqdGkiOiI0NmFhOTRhNS00MDY3LTQ0OWEtOWUxYy1kYTU5MWZkMDZhYmIiLCJ0eXBlIjoiYWNjZXNzIiwic3ViIjoiSU5URVJOQUwiLCJuYmYiOjE3MzQzMjY0NTYsImV4cCI6MTc2NTg2MjQ1NiwidXNlcklkIjoiSU5URVJOQUxfREVGQVVMVF92YXJ1biIsImVtYWlsIjoidmFydW5AYXF1YWdlbi5jb20iLCJ1c2VybmFtZSI6InZhcnVuIiwibG9naW5UeXBlIjoiQURNSU5fREVGQVVMVCIsInJvbGUiOiJ1c2VyIiwicGVybWlzc2lvbnMiOlsiU1VQRVJfVVNFUiJdfQ.GsEQUEHCyvAHgvcUDbrZfIclUQqoB6Z61Q8IltLqjiA',
                        industryName: formData.industryName,
                        userName: formData.userName,
                        password: formData.password,
                    },
                }
            );

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Industry created successfully!',
                });
                navigate('/industries');
            } else {
                throw new Error('Failed to create industry');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create industry. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
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

            <Card className='max-w-2xl'>
                <CardHeader>
                    <CardTitle>Industry Information</CardTitle>
                    <CardDescription>
                        Fill in the details to create a new industry
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                                placeholder='Enter username'
                                required
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='password'>Password</Label>
                            <Input
                                id='password'
                                name='password'
                                type='password'
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder='Enter password'
                                required
                            />
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
        </div>
    );
};

export default CreateIndustry;
