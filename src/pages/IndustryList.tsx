import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Building2, Search } from 'lucide-react';

interface Industry {
    industryId: string;
    industryName: string;
    logo: string;
    sector: string;
    subSector: string;
}

const IndustryList = () => {
    const [industries, setIndustries] = useState<Industry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        fetchIndustries();
    }, []);

    const fetchIndustries = async () => {
        try {
            const response = await fetch(
                'https://admin-aquagen-api-bfckdag2aydtegc2.southindia-01.azurewebsites.net/api/admin/workspace/',
                {
                    headers: {
                        accept: 'application/json',
                        Authorization:
                            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6dHJ1ZSwiaWF0IjoxNzM0MzI2NDU2LCJqdGkiOiI0NmFhOTRhNS00MDY3LTQ0OWEtOWUxYy1kYTU5MWZkMDZhYmIiLCJ0eXBlIjoiYWNjZXNzIiwic3ViIjoiSU5URVJOQUwiLCJuYmYiOjE3MzQzMjY0NTYsImV4cCI6MTc2NTg2MjQ1NiwidXNlcklkIjoiSU5URVJOQUxfREVGQVVMVF92YXJ1biIsImVtYWlsIjoidmFydW5AYXF1YWdlbi5jb20iLCJ1c2VybmFtZSI6InZhcnVuIiwibG9naW5UeXBlIjoiQURNSU5fREVGQVVMVCIsInJvbGUiOiJ1c2VyIiwicGVybWlzc2lvbnMiOlsiU1VQRVJfVVNFUiJdfQ.GsEQUEHCyvAHgvcUDbrZfIclUQqoB6Z61Q8IltLqjiA',
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setIndustries(data.data);
            } else {
                throw new Error('Failed to fetch industries');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch industries. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const filteredIndustries = industries.filter(
        (industry) =>
            industry.industryName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            industry.industryId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className='flex-1 flex flex-col h-screen relative'>
                <div className='fixed top-0 left-64 right-0 bg-background border-b z-10 p-8 pb-6'>
                    <div className='flex items-center gap-4'>
                        <SidebarTrigger />
                        <div>
                            <h2 className='text-3xl font-bold tracking-tight'>
                                Industries
                            </h2>
                            <p className='text-muted-foreground'>
                                Loading industries...
                            </p>
                        </div>
                    </div>
                </div>
                <div className='pt-32' />
            </div>
        );
    }

    return (
        <div className='flex-1 flex flex-col h-screen relative'>
            {/* Fixed Header */}
            <div className='fixed top-0 left-64 right-0 bg-background border-b z-10 p-8 pb-6 space-y-6'>
                <div className='flex items-center gap-4'>
                    <SidebarTrigger />
                    <div className='flex-1'>
                        <h2 className='text-3xl font-bold tracking-tight'>
                            Industries
                        </h2>
                        <p className='text-muted-foreground'>
                            Manage your industries and their configurations
                        </p>
                    </div>
                    <Button asChild>
                        <Link to='/industries/create'>Add New Industry</Link>
                    </Button>
                </div>

                <div className='flex items-center gap-2 max-w-md'>
                    <div className='relative flex-1'>
                        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                        <Input
                            placeholder='Search by name or ID...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='pl-10'
                        />
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className='flex-1 overflow-y-auto pt-48 px-8 pb-8'>
                <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {filteredIndustries.map((industry) => (
                        <Card
                            key={industry.industryId}
                            className='hover:shadow-lg transition-shadow'
                        >
                            <CardHeader>
                                <div className='flex items-center gap-4'>
                                    {industry.logo && (
                                        <img
                                            src={industry.logo}
                                            alt={`${industry.industryName} logo`}
                                            className='w-12 h-12 rounded-lg object-cover bg-gray-100'
                                            onError={(e) => {
                                                e.currentTarget.style.display =
                                                    'none';
                                            }}
                                        />
                                    )}
                                    <div className='flex-1'>
                                        <CardTitle className='text-lg'>
                                            {industry.industryName}
                                        </CardTitle>
                                        <CardDescription>
                                            ID: {industry.industryId}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div className='flex items-center gap-2'>
                                    <Building2 className='h-4 w-4 text-muted-foreground' />
                                    <span className='text-sm'>
                                        {industry.sector}
                                    </span>
                                    {industry.subSector && (
                                        <Badge variant='outline'>
                                            {industry.subSector}
                                        </Badge>
                                    )}
                                </div>

                                <Button asChild className='w-full'>
                                    <Link
                                        to={`/industries/${industry.industryId}`}
                                    >
                                        Manage Industry
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredIndustries.length === 0 && industries.length > 0 && (
                    <div className='text-center py-12'>
                        <Search className='mx-auto h-12 w-12 text-muted-foreground' />
                        <h3 className='mt-2 text-sm font-semibold text-gray-900'>
                            No matching industries
                        </h3>
                        <p className='mt-1 text-sm text-muted-foreground'>
                            Try adjusting your search terms or clear the search
                            to see all industries.
                        </p>
                    </div>
                )}

                {filteredIndustries.length === 0 && industries.length === 0 && (
                    <div className='text-center py-12'>
                        <Building2 className='mx-auto h-12 w-12 text-muted-foreground' />
                        <h3 className='mt-2 text-sm font-semibold text-gray-900'>
                            No industries
                        </h3>
                        <p className='mt-1 text-sm text-muted-foreground'>
                            Get started by creating a new industry.
                        </p>
                        <div className='mt-6'>
                            <Button asChild>
                                <Link to='/industries/create'>
                                    Add Industry
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IndustryList;
