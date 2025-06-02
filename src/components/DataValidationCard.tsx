import { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface Unit {
    unitId: string;
    unitName: string;
}

interface DataValidationCardProps {
    industryId: string;
    units: Unit[];
}

interface ValidationData {
    unitId: string;
    locationName: string;
    totlaizer: any;
    last5Mins: any;
    multiplicationFactor: number;
    createdOn: string;
    deviceId: string | null;
    streamId: string;
    displayUnit: any;
    interpolated: boolean;
    reverse: boolean;
    maxCapacity: number | null;
}

export function DataValidationCard({
    industryId,
    units,
}: DataValidationCardProps) {
    const [selectedUnitId, setSelectedUnitId] = useState<string>('');
    const [validationData, setValidationData] = useState<
        ValidationData[] | null
    >(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasNoData, setHasNoData] = useState(false);
    const { toast } = useToast();

    const fetchValidationData = async (unitId?: string) => {
        setIsLoading(true);
        setHasNoData(false);

        // Use specific unit ID if provided, otherwise fetch for all units
        const queryUnitId = unitId || selectedUnitId || 'ALL';

        try {
            const response = await fetch(
                `https://admin-aquagen-api-bfckdag2aydtegc2.southindia-01.azurewebsites.net/api/admin/latest/unit?unitId=${queryUnitId}`,
                {
                    headers: {
                        accept: 'application/json',
                        Authorization:
                            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6dHJ1ZSwiaWF0IjoxNzM0MzI2NDU2LCJqdGkiOiI0NmFhOTRhNS00MDY3LTQ0OWEtOWUxYy1kYTU5MWZkMDZhYmIiLCJ0eXBlIjoiYWNjZXNzIiwic3ViIjoiSU5URVJOQUwiLCJuYmYiOjE3MzQzMjY0NTYsImV4cCI6MTc2NTg2MjQ1NiwidXNlcklkIjoiSU5URVJOQUxfREVGQVVMVF92YXJ1biIsImVtYWlsIjoidmFydW5AYXF1YWdlbi5jb20iLCJ1c2VybmFtZSI6InZhcnVuIiwibG9naW5UeXBlIjoiQURNSU5fREVGQVVMVCIsInJvbGUiOiJ1c2VyIiwicGVybWlzc2lvbnMiOlsiU1VQRVJfVVNFUiJdfQ.GsEQUEHCyvAHgvcUDbrZfIclUQqoB6Z61Q8IltLqjiA',
                        targetIndustryId: industryId,
                    },
                }
            );

            if (response.ok) {
                const result = await response.json();
                console.log('Data validation response:', result);

                if (
                    result.data &&
                    Array.isArray(result.data) &&
                    result.data.length > 0
                ) {
                    setValidationData(result.data);
                    setHasNoData(false);
                } else {
                    setHasNoData(true);
                    setValidationData(null);
                }
            } else {
                setHasNoData(true);
                setValidationData(null);
            }
        } catch (error) {
            console.error('Error fetching validation data:', error);
            setHasNoData(true);
            setValidationData(null);
            toast({
                title: 'Error',
                description:
                    'Failed to fetch validation data. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnitChange = (unitId: string) => {
        setSelectedUnitId(unitId);
        setValidationData(null);
        setHasNoData(false);
    };

    const handleFetchData = () => {
        if (selectedUnitId) {
            fetchValidationData();
        } else {
            toast({
                title: 'Select Unit',
                description:
                    "Please select a unit or choose 'All Units' to fetch data.",
                variant: 'destructive',
            });
        }
    };

    const formatValue = (value: any) => {
        if (value === null || value === undefined) return 'N/A';
        if (typeof value === 'object') {
            return Object.entries(value)
                .map(([key, val]) => `${key}: ${val}`)
                .join(', ');
        }
        return value.toString();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <CheckCircle className='h-5 w-5' />
                    Data Validation
                </CardTitle>
                <CardDescription>
                    Select a unit and validate its latest data
                </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className='space-y-2'>
                    <Label htmlFor='unitSelect'>Select Unit</Label>
                    <Select
                        value={selectedUnitId}
                        onValueChange={handleUnitChange}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder='Choose a unit to validate' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='ALL'>All Units</SelectItem>
                            {units.map((unit) => (
                                <SelectItem
                                    key={unit.unitId}
                                    value={unit.unitId}
                                >
                                    {unit.unitName} ({unit.unitId})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    onClick={handleFetchData}
                    className='w-full'
                    disabled={isLoading || !selectedUnitId}
                >
                    <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                            isLoading ? 'animate-spin' : ''
                        }`}
                    />
                    {isLoading ? 'Loading...' : 'Fetch Validation Data'}
                </Button>

                {hasNoData && selectedUnitId && (
                    <div className='text-center py-8 text-muted-foreground'>
                        <AlertCircle className='mx-auto h-8 w-8 mb-2' />
                        No data found for the selected unit(s).
                    </div>
                )}

                {validationData && validationData.length > 0 && (
                    <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                            <h3 className='text-lg font-semibold'>
                                Validation Results
                            </h3>
                            <Badge variant='outline'>
                                {validationData.length} records found
                            </Badge>
                        </div>

                        <div className='rounded-md border overflow-x-auto'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Unit ID</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Totalizer</TableHead>
                                        <TableHead>Last 5 Mins</TableHead>
                                        <TableHead>
                                            Multiplication Factor
                                        </TableHead>
                                        <TableHead>Device ID</TableHead>
                                        <TableHead>Stream ID</TableHead>
                                        <TableHead>Display Unit</TableHead>
                                        <TableHead>Interpolated</TableHead>
                                        <TableHead>Reverse</TableHead>
                                        <TableHead>Max Capacity</TableHead>
                                        <TableHead>Created On</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {validationData.map((item, index) => (
                                        <TableRow
                                            key={`${item.unitId}-${index}`}
                                        >
                                            <TableCell className='font-medium'>
                                                {item.unitId}
                                            </TableCell>
                                            <TableCell>
                                                {item.locationName}
                                            </TableCell>
                                            <TableCell>
                                                {formatValue(item.totlaizer)}
                                            </TableCell>
                                            <TableCell>
                                                {formatValue(item.last5Mins)}
                                            </TableCell>
                                            <TableCell>
                                                {item.multiplicationFactor}
                                            </TableCell>
                                            <TableCell>
                                                {item.deviceId || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {item.streamId}
                                            </TableCell>
                                            <TableCell>
                                                {formatValue(item.displayUnit)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        item.interpolated
                                                            ? 'secondary'
                                                            : 'outline'
                                                    }
                                                >
                                                    {item.interpolated
                                                        ? 'Yes'
                                                        : 'No'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        item.reverse
                                                            ? 'secondary'
                                                            : 'outline'
                                                    }
                                                >
                                                    {item.reverse
                                                        ? 'Yes'
                                                        : 'No'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {item.maxCapacity || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {item.createdOn}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
