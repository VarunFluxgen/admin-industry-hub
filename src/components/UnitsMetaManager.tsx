import { useState, useEffect } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Edit, Plus, Calendar, AlertCircle } from 'lucide-react';
import { logApiCall } from '@/utils/apiLogger';
import { SearchableUnitSelect } from '@/components/SearchableUnitSelect';

interface Unit {
    unitId: string;
    unitName: string;
}

interface UnitMeta {
    id?: string;
    unitId: string;
    unitName: string;
    industryId: string;
    flowFactor: string;
    createdOn: string;
    meterOutputType: string;
    meterMake: string;
    meterType: string;
    meterSize: string;
    piezoLen: string;
    piezoCableLength: string;
    serialNo: string;
    sensorSize: string;
    iotMake: string;
    deviceId: string;
    deviceImei: string;
    slaveId: string;
    networkProvider: string;
    simNumber: string;
    mobileNumber: string;
    description: string;
    problemsFaced: string;
    remarks: string;
    imageUrl: string[] | string;
}

interface UnitsMetaManagerProps {
    industryId: string;
    units: Unit[];
}

export function UnitsMetaManager({ industryId, units }: UnitsMetaManagerProps) {
    const [selectedUnitId, setSelectedUnitId] = useState<string>('');
    const [unitMetaRecords, setUnitMetaRecords] = useState<UnitMeta[]>([]);
    const [editingRecord, setEditingRecord] = useState<UnitMeta | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [hasNoData, setHasNoData] = useState(false);
    const { toast } = useToast();

    const dropdownOptions = {
        meterOutputType: ['RS485', 'pulse'],
        meterMake: [
            'T-Measurement',
            'Shangai Panda',
            'Zest',
            'techtrol',
            'holykell',
            'Philemon',
            'Aquagen Float',
            'Dheewan Enterprises',
            'Aster',
            'Daisun',
            'Schneider Electric',
        ],
        meterType: [
            'Ultrasonic Inline',
            'Electromagnetic Inline',
            'Ultrasonic Clampon',
            'Ultrasonic Inline Seprate Head',
            'Electromagnetic Inline',
            'Separate Head',
            'Ultrasonic Insertion',
            'ultrasonic',
            'radar',
        ],
        meterSize: [
            'DN 15',
            '20',
            '25',
            '32',
            '40',
            '50',
            '65',
            '80',
            '100',
            '125',
            '150',
            '200',
            '250',
            '300',
            '400',
        ],
        piezoLen: ['100m', '150m', '200m', '250m', '300'],
        piezoCableLength: ['100m', '150m', '200m', '250m', '300'],
        sensorSize: ['s', 'm', 'L'],
        iotMake: ['teltonika', 'aquagen', 'w-link', 'santeliquip'],
        networkProvider: ['Airtel', 'Vodafone', 'jio'],
    };

    const fetchUnitMeta = async (unitId: string) => {
        setIsLoading(true);
        setHasNoData(false);
        try {
            const response = await fetch(
                'https://admin-aquagen-api-bfckdag2aydtegc2.southindia-01.azurewebsites.net/api/admin/units_meta/',
                {
                    headers: {
                        accept: 'application/json',
                        Authorization:
                            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6dHJ1ZSwiaWF0IjoxNzY1ODcyMDk5LCJqdGkiOiIxM2IzNjgyZS1jNTBlLTRlOTQtYTQ1Yi04ODQwNTQ5MWU0YjIiLCJ0eXBlIjoiYWNjZXNzIiwic3ViIjoiSU5URVJOQUwiLCJuYmYiOjE3NjU4NzIwOTksImV4cCI6MTgzMDY3MjA5OSwidXNlcklkIjoiSU5URVJOQUxfREVGQVVMVF92YXJ1biIsImVtYWlsIjoidmFydW5AYXF1YWdlbi5jb20iLCJ1c2VybmFtZSI6InZhcnVuIiwibG9naW5UeXBlIjoiQURNSU5fREVGQVVMVCIsInJvbGUiOiJ1c2VyIiwicGVybWlzc2lvbnMiOlsiU1VQRVJfVVNFUiIsIkFMRVJUUyIsIkFDQ09VTlRfU0VUVElOR1MiXX0.II4LBKgTOffmj3nRwlc5ce25VJ4pK4hieML1ZNrt_DQ',
                        targetIndustryId: industryId,
                        unitId: unitId,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log('Units meta response:', data);

                if (data.unitDetails) {
                    // Handle both single object and array responses
                    const records = Array.isArray(data.unitDetails)
                        ? data.unitDetails
                        : [data.unitDetails];

                    // If we have unitDetails object, it means the unit exists in the system
                    // Even if all fields are empty, we should show the record for editing
                    if (records.length > 0 && records[0].unitId) {
                        setUnitMetaRecords(records);
                        setHasNoData(false);
                    } else {
                        setHasNoData(true);
                        setUnitMetaRecords([]);
                    }
                } else {
                    setHasNoData(true);
                    setUnitMetaRecords([]);
                }
            } else {
                setHasNoData(true);
                setUnitMetaRecords([]);
            }
        } catch (error) {
            console.error('Error fetching unit meta:', error);
            setHasNoData(true);
            setUnitMetaRecords([]);
            toast({
                title: 'Error',
                description: 'Failed to fetch unit meta. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnitChange = (unitId: string) => {
        setSelectedUnitId(unitId);
        setShowEditForm(false);
        setUnitMetaRecords([]);
        setEditingRecord(null);
        if (unitId) {
            fetchUnitMeta(unitId);
        } else {
            setUnitMetaRecords([]);
            setHasNoData(false);
        }
    };

    const handleEditRecord = (record: UnitMeta) => {
        setEditingRecord(record);
        setShowEditForm(true);
    };

    const handleInputChange = (field: keyof UnitMeta, value: string) => {
        if (editingRecord) {
            setEditingRecord({ ...editingRecord, [field]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRecord) return;

        setIsUpdating(true);
        try {
            const formData = new FormData();
            if (selectedImage) {
                formData.append('image', selectedImage);
            }

            const headers: Record<string, string> = {
                accept: 'application/json',
                Authorization:
                    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6dHJ1ZSwiaWF0IjoxNzY1ODcyMDk5LCJqdGkiOiIxM2IzNjgyZS1jNTBlLTRlOTQtYTQ1Yi04ODQwNTQ5MWU0YjIiLCJ0eXBlIjoiYWNjZXNzIiwic3ViIjoiSU5URVJOQUwiLCJuYmYiOjE3NjU4NzIwOTksImV4cCI6MTgzMDY3MjA5OSwidXNlcklkIjoiSU5URVJOQUxfREVGQVVMVF92YXJ1biIsImVtYWlsIjoidmFydW5AYXF1YWdlbi5jb20iLCJ1c2VybmFtZSI6InZhcnVuIiwibG9naW5UeXBlIjoiQURNSU5fREVGQVVMVCIsInJvbGUiOiJ1c2VyIiwicGVybWlzc2lvbnMiOlsiU1VQRVJfVVNFUiIsIkFMRVJUUyIsIkFDQ09VTlRfU0VUVElOR1MiXX0.II4LBKgTOffmj3nRwlc5ce25VJ4pK4hieML1ZNrt_DQ',
                targetIndustryId: industryId,
                unitId: editingRecord.unitId,
                meterOutputType: editingRecord.meterOutputType,
                meterMake: editingRecord.meterMake,
                meterType: editingRecord.meterType,
                meterSize: editingRecord.meterSize,
                piezoLen: editingRecord.piezoLen,
                piezoCableLength: editingRecord.piezoCableLength,
                serialNo: editingRecord.serialNo,
                sensorSize: editingRecord.sensorSize,
                iotMake: editingRecord.iotMake,
                deviceId: editingRecord.deviceId,
                deviceImei: editingRecord.deviceImei,
                slaveId: editingRecord.slaveId,
                networkProvider: editingRecord.networkProvider,
                simNumber: editingRecord.simNumber,
                mobileNumber: editingRecord.mobileNumber,
                description: editingRecord.description,
                problemsFaced: editingRecord.problemsFaced,
                remarks: editingRecord.remarks,
                imageUrls: Array.isArray(editingRecord.imageUrl)
                    ? editingRecord.imageUrl.join(', ')
                    : editingRecord.imageUrl,
            };

            const apiEndpoint = 'https://admin-aquagen-api-bfckdag2aydtegc2.southindia-01.azurewebsites.net/api/admin/units_meta/';

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers,
                body: formData,
            });

            if (response.ok) {
                // Log the API call
                await logApiCall(apiEndpoint, {
                    method: 'POST',
                    targetIndustryId: industryId,
                    unitId: editingRecord.unitId,
                    unitMetaData: editingRecord,
                    hasImage: !!selectedImage,
                });

                toast({
                    title: 'Success',
                    description: 'Unit meta updated successfully!',
                });
                setShowEditForm(false);
                setEditingRecord(null);
                fetchUnitMeta(selectedUnitId);
            } else {
                throw new Error('Failed to update unit meta');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update unit meta. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Units Meta Management</CardTitle>
                <CardDescription>
                    Manage detailed metadata for units - view and edit unit meta
                    information
                </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
                <SearchableUnitSelect
                    units={units}
                    selectedUnitId={selectedUnitId}
                    onUnitChange={handleUnitChange}
                    placeholder="Choose a unit to manage"
                    label="Select Unit"
                />

                {isLoading && (
                    <div className='text-center py-4'>Loading unit meta...</div>
                )}

                {hasNoData && selectedUnitId && (
                    <div className='text-center py-8 text-muted-foreground'>
                        <AlertCircle className='mx-auto h-8 w-8 mb-2' />
                        No data found for this unit.
                    </div>
                )}

                {unitMetaRecords.length > 0 && !showEditForm && (
                    <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                            <h3 className='text-lg font-semibold'>
                                Meta Records
                            </h3>
                            <Badge variant='outline'>
                                {unitMetaRecords.length} records found
                            </Badge>
                        </div>

                        <div className='w-full overflow-x-auto'>
                            <div className='rounded-md border min-w-full'>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[120px]">Created On</TableHead>
                                            <TableHead className="min-w-[120px]">Meter Make</TableHead>
                                            <TableHead className="min-w-[120px]">Meter Type</TableHead>
                                            <TableHead className="min-w-[100px]">Device ID</TableHead>
                                            <TableHead className="min-w-[100px]">Serial No</TableHead>
                                            <TableHead className="min-w-[100px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {unitMetaRecords.map((record, index) => (
                                            <TableRow
                                                key={`${record.unitId}-${index}`}
                                            >
                                                <TableCell>
                                                    {record.createdOn || 'Not set'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.meterMake || 'Not set'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.meterType || 'Not set'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.deviceId || 'Not set'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.serialNo || 'Not set'}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant='outline'
                                                        size='sm'
                                                        onClick={() =>
                                                            handleEditRecord(record)
                                                        }
                                                    >
                                                        <Edit className='h-4 w-4 mr-1' />
                                                        Manage
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                )}

                {showEditForm && editingRecord && (
                    <div className='space-y-4 w-full'>
                        <div className='flex items-center justify-between'>
                            <h3 className='text-lg font-semibold'>
                                Edit Meta Record
                            </h3>
                            <Button
                                variant='outline'
                                onClick={() => {
                                    setShowEditForm(false);
                                    setEditingRecord(null);
                                }}
                            >
                                Back to List
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className='space-y-4 w-full'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full'>
                                {/* Dropdown fields */}
                                {Object.entries(dropdownOptions).map(
                                    ([field, options]) => (
                                        <div key={field} className='space-y-2'>
                                            <Label
                                                htmlFor={field}
                                                className='capitalize'
                                            >
                                                {field
                                                    .replace(/([A-Z])/g, ' $1')
                                                    .trim()}
                                            </Label>
                                            <Select
                                                value={
                                                    editingRecord[
                                                        field as keyof UnitMeta
                                                    ] as string
                                                }
                                                onValueChange={(value) =>
                                                    handleInputChange(
                                                        field as keyof UnitMeta,
                                                        value
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue
                                                        placeholder={`Select ${field}`}
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {options.map((option) => (
                                                        <SelectItem
                                                            key={option}
                                                            value={option}
                                                        >
                                                            {option}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )
                                )}

                                {/* Text input fields */}
                                {[
                                    'serialNo',
                                    'deviceId',
                                    'deviceImei',
                                    'slaveId',
                                    'simNumber',
                                    'mobileNumber',
                                    'description',
                                    'problemsFaced',
                                    'remarks',
                                ].map((field) => (
                                    <div key={field} className='space-y-2'>
                                        <Label
                                            htmlFor={field}
                                            className='capitalize'
                                        >
                                            {field
                                                .replace(/([A-Z])/g, ' $1')
                                                .trim()}
                                        </Label>
                                        <Input
                                            id={field}
                                            className="w-full"
                                            value={
                                                editingRecord[
                                                    field as keyof UnitMeta
                                                ] as string
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    field as keyof UnitMeta,
                                                    e.target.value
                                                )
                                            }
                                            placeholder={`Enter ${field}`}
                                        />
                                    </div>
                                ))}

                                <div className='space-y-2 md:col-span-2'>
                                    <Label htmlFor='image'>Upload Image</Label>
                                    <Input
                                        id='image'
                                        type='file'
                                        accept='image/*'
                                        className="w-full"
                                        onChange={(e) =>
                                            setSelectedImage(
                                                e.target.files?.[0] || null
                                            )
                                        }
                                    />
                                    {editingRecord.imageUrl && (
                                        <div className='text-sm text-muted-foreground'>
                                            Current images:{' '}
                                            {Array.isArray(
                                                editingRecord.imageUrl
                                            )
                                                ? editingRecord.imageUrl.join(
                                                      ', '
                                                  )
                                                : editingRecord.imageUrl}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button
                                type='submit'
                                disabled={isUpdating}
                                className='w-full'
                            >
                                {isUpdating
                                    ? 'Updating...'
                                    : 'Update Meta Record'}
                            </Button>
                        </form>
                    </div>
                )}

                {selectedUnitId &&
                    unitMetaRecords.length === 0 &&
                    !isLoading &&
                    !hasNoData && (
                        <div className='text-center py-8 text-muted-foreground'>
                            <Plus className='mx-auto h-8 w-8 mb-2' />
                            No meta record found for this unit.
                        </div>
                    )}
            </CardContent>
        </Card>
    );
}
