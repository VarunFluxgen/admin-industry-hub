import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
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
import { useToast } from '@/hooks/use-toast';
import { UnitsTable } from '@/components/UnitsTable';
import { CategoriesTable } from '@/components/CategoriesTable';
import { CreateUnitDialog } from '@/components/CreateUnitDialog';
import { CreateCategoryDialog } from '@/components/CreateCategoryDialog';
import { EditUnitDialog } from '@/components/EditUnitDialog';
import { EditIndustryDialog } from '@/components/EditIndustryDialog';
import {
    Building2,
    Clock,
    MapPin,
    Plus,
    Users,
    Settings,
    CheckCircle,
    Edit,
} from 'lucide-react';
import { PermissionsTable } from '@/components/PermissionsTable';
import { UnitsMetaManager } from '@/components/UnitsMetaManager';
import { DataValidationCard } from '@/components/DataValidationCard';
import { useAuth } from '@/contexts/AuthContext';

interface IndustryDetails {
    industryDetails: {
        id: string;
        industryId: string;
        industryName: string;
        place: string;
        meta: {
            shift: {
                startAt: string;
                endAt: string;
                shiftName: string;
            };
            timezone: string;
        };
        categories: any;
        units: any[];
    };
}

const IndustryDetails = () => {
    const { industryId } = useParams();
    const { hasFullAccess, canOnlyViewAndUpdateUnitMeta } = useAuth();
    const [industryData, setIndustryData] = useState<IndustryDetails | null>(
        null
    );
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateUnit, setShowCreateUnit] = useState(false);
    const [showCreateCategory, setShowCreateCategory] = useState(false);
    const [showEditUnit, setShowEditUnit] = useState(false);
    const [showEditIndustry, setShowEditIndustry] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const { toast } = useToast();

    // Refs for scrolling to sections
    const permissionsRef = useRef<HTMLDivElement>(null);
    const unitsMetaRef = useRef<HTMLDivElement>(null);
    const dataValidationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (industryId) {
            fetchIndustryDetails();
        }
    }, [industryId]);

    const fetchIndustryDetails = async () => {
        try {
            const response = await fetch(
                'https://admin-aquagen-api-bfckdag2aydtegc2.southindia-01.azurewebsites.net/api/admin/industry/',
                {
                    headers: {
                        accept: 'application/json',
                        Authorization:
                            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6dHJ1ZSwiaWF0IjoxNzY1ODcyMDk5LCJqdGkiOiIxM2IzNjgyZS1jNTBlLTRlOTQtYTQ1Yi04ODQwNTQ5MWU0YjIiLCJ0eXBlIjoiYWNjZXNzIiwic3ViIjoiSU5URVJOQUwiLCJuYmYiOjE3NjU4NzIwOTksImV4cCI6MTgzMDY3MjA5OSwidXNlcklkIjoiSU5URVJOQUxfREVGQVVMVF92YXJ1biIsImVtYWlsIjoidmFydW5AYXF1YWdlbi5jb20iLCJ1c2VybmFtZSI6InZhcnVuIiwibG9naW5UeXBlIjoiQURNSU5fREVGQVVMVCIsInJvbGUiOiJ1c2VyIiwicGVybWlzc2lvbnMiOlsiU1VQRVJfVVNFUiIsIkFMRVJUUyIsIkFDQ09VTlRfU0VUVElOR1MiXX0.II4LBKgTOffmj3nRwlc5ce25VJ4pK4hieML1ZNrt_DQ',
                        targetIndustryId: industryId!,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setIndustryData(data);
            } else {
                throw new Error('Failed to fetch industry details');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description:
                    'Failed to fetch industry details. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditUnit = (unit: any) => {
        // Allow viewing unit details for all users, but editing only for full access users
        setSelectedUnit(unit);
        setShowEditUnit(true);
    };

    const handleRefresh = () => {
        fetchIndustryDetails();
    };

    const scrollToPermissions = () => {
        permissionsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToUnitsMeta = () => {
        unitsMetaRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToDataValidation = () => {
        dataValidationRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (isLoading) {
        return (
            <div className='flex-1 space-y-4 p-4 md:p-8 pt-6 w-full max-w-full overflow-x-hidden'>
                <div className='flex items-center gap-4'>
                    <SidebarTrigger />
                    <div>
                        <h2 className='text-3xl font-bold tracking-tight'>
                            Industry Details
                        </h2>
                        <p className='text-muted-foreground'>
                            Loading industry details...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!industryData) {
        return (
            <div className='flex-1 space-y-4 p-4 md:p-8 pt-6 w-full max-w-full overflow-x-hidden'>
                <div className='flex items-center gap-4'>
                    <SidebarTrigger />
                    <div>
                        <h2 className='text-3xl font-bold tracking-tight'>
                            Industry Not Found
                        </h2>
                        <p className='text-muted-foreground'>
                            The requested industry could not be found.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const { industryDetails } = industryData;

    return (
        <div className='flex-1 space-y-6 p-4 md:p-8 pt-6 w-full max-w-full overflow-x-hidden'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>
                <SidebarTrigger />
                <div className='flex-1 min-w-0'>
                    <h2 className='text-2xl md:text-3xl font-bold tracking-tight truncate'>
                        {industryDetails.industryName}
                    </h2>
                    <p className='text-muted-foreground text-sm md:text-base'>
                        Industry ID: {industryDetails.industryId}
                    </p>
                </div>
                <Button
                    onClick={() => setShowEditIndustry(true)}
                    variant='outline'
                    size='sm'
                    disabled={canOnlyViewAndUpdateUnitMeta()}
                    className="shrink-0"
                >
                    <Edit className='h-4 w-4 mr-2' />
                    Edit Industry
                </Button>
            </div>

            {/* Industry Overview */}
            <div className='grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3'>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Location
                        </CardTitle>
                        <MapPin className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-xl md:text-2xl font-bold'>
                            {industryDetails.place}
                        </div>
                        <p className='text-xs text-muted-foreground'>
                            Timezone: {industryDetails.meta.timezone}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Shift Details
                        </CardTitle>
                        <Clock className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-lg font-bold'>
                            {industryDetails.meta.shift.shiftName}
                        </div>
                        <p className='text-xs text-muted-foreground'>
                            {industryDetails.meta.shift.startAt} -{' '}
                            {industryDetails.meta.shift.endAt}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Units Count
                        </CardTitle>
                        <Building2 className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-xl md:text-2xl font-bold'>
                            {industryDetails.units.length}
                        </div>
                        <p className='text-xs text-muted-foreground'>
                            Active units
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className='grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5'>
                <Button
                    onClick={() => setShowCreateUnit(true)}
                    className='h-20 flex-col gap-2'
                    disabled={canOnlyViewAndUpdateUnitMeta()}
                >
                    <Plus className='h-6 w-6' />
                    <span className="text-xs text-center">Create Unit</span>
                </Button>
                <Button
                    onClick={() => setShowCreateCategory(true)}
                    variant='outline'
                    className='h-20 flex-col gap-2'
                    disabled={canOnlyViewAndUpdateUnitMeta()}
                >
                    <Plus className='h-6 w-6' />
                    <span className="text-xs text-center">Add Category</span>
                </Button>
                <Button
                    onClick={scrollToPermissions}
                    variant='outline'
                    className='h-20 flex-col gap-2'
                    disabled={canOnlyViewAndUpdateUnitMeta()}
                >
                    <Users className='h-6 w-6' />
                    <span className="text-xs text-center">Manage Permissions</span>
                </Button>
                <Button
                    onClick={scrollToDataValidation}
                    variant='outline'
                    className='h-20 flex-col gap-2'
                >
                    <CheckCircle className='h-6 w-6' />
                    <span className="text-xs text-center">Data Validation</span>
                </Button>
                <Button
                    onClick={scrollToUnitsMeta}
                    variant='outline'
                    className='h-20 flex-col gap-2'
                >
                    <Settings className='h-6 w-6' />
                    <span className="text-xs text-center">Edit Meta Data</span>
                </Button>
            </div>

            {/* Limited Access Notice */}
            {canOnlyViewAndUpdateUnitMeta() && (
                <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-amber-800">
                            <Settings className="h-5 w-5" />
                            <div>
                                <p className="font-medium">Limited Access Mode</p>
                                <p className="text-sm text-amber-700">
                                    You can view all details and update unit metadata only. Other editing functions are restricted.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Units Table */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Units</CardTitle>
                    <CardDescription>
                        {hasFullAccess() ? 'Manage all units for this industry' : 'View units for this industry'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 md:p-6">
                    <UnitsTable
                        units={industryDetails.units}
                        onEditUnit={handleEditUnit}
                    />
                </CardContent>
            </Card>

            {/* Categories Table */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Categories</CardTitle>
                    <CardDescription>
                        {hasFullAccess() ? 'Manage categories and subcategories' : 'View categories and subcategories'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 md:p-6">
                    <CategoriesTable
                        categories={industryDetails.categories}
                        allUnits={industryDetails.units}
                        industryId={industryId!}
                        onRefresh={handleRefresh}
                    />
                </CardContent>
            </Card>

            {/* Permissions Management - Only show for full access users */}
            {hasFullAccess() && (
                <div ref={permissionsRef} className="w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Permissions</CardTitle>
                            <CardDescription>
                                Manage user access and permissions for this industry
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PermissionsTable industryId={industryId!} />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Data Validation Card - Show for all users */}
            <div ref={dataValidationRef} className="w-full">
                <DataValidationCard
                    industryId={industryId!}
                    units={industryDetails.units.map((unit) => ({
                        unitId: unit.unitId,
                        unitName: unit.unitName,
                    }))}
                />
            </div>

            {/* Units Meta Management - Always show */}
            <div ref={unitsMetaRef} className="w-full">
                <UnitsMetaManager
                    industryId={industryId!}
                    units={industryDetails.units.map((unit) => ({
                        unitId: unit.unitId,
                        unitName: unit.unitName,
                    }))}
                />
            </div>

            {/* Dialogs - Show edit unit dialog for all users, others only for full access */}
            <EditUnitDialog
                open={showEditUnit}
                onOpenChange={setShowEditUnit}
                unit={selectedUnit}
                industryId={industryId!}
                onSuccess={handleRefresh}
            />

            {hasFullAccess() && (
                <>
                    <CreateUnitDialog
                        open={showCreateUnit}
                        onOpenChange={setShowCreateUnit}
                        industryId={industryId!}
                        onSuccess={handleRefresh}
                    />

                    <CreateCategoryDialog
                        open={showCreateCategory}
                        onOpenChange={setShowCreateCategory}
                        industryId={industryId!}
                        onSuccess={handleRefresh}
                    />

                    <EditIndustryDialog
                        open={showEditIndustry}
                        onOpenChange={setShowEditIndustry}
                        industryData={industryDetails}
                        onSuccess={handleRefresh}
                    />
                </>
            )}
        </div>
    );
};

export default IndustryDetails;
