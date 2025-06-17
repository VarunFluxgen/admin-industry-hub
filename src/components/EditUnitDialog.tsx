import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { logApiCall } from '@/utils/apiLogger';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, X } from 'lucide-react';

interface EditUnitDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    unit: any;
    industryId: string;
    onSuccess: () => void;
}

const QUALITY_PARAMS = [
    { key: 'pH', label: 'pH', unit: '' },
    { key: 'TDS', label: 'TDS', unit: 'ppm' },
    { key: 'COD', label: 'COD', unit: 'mg/L' },
    { key: 'TSS', label: 'TSS', unit: 'mg/L' },
    { key: 'BOD', label: 'BOD', unit: 'mg/L' },
    { key: 'DO', label: 'DO', unit: 'ppm' },
    { key: 'Temp', label: 'Temperature', unit: '°' },
    { key: 'EC', label: 'EC', unit: 'μs/cm' },
    { key: 'TBD', label: 'TBD', unit: 'NTU' },
];

export function EditUnitDialog({
    open,
    onOpenChange,
    unit,
    industryId,
    onSuccess,
}: EditUnitDialogProps) {
    const { hasFullAccess } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [industryData, setIndustryData] = useState<any>(null);
    const [newUnitInput, setNewUnitInput] = useState('');
    const [newSubCategoryInput, setNewSubCategoryInput] = useState('');
    const [formData, setFormData] = useState({
        unitName: '',
        deviceId: '',
        unitType: 'ENERGY',
        flowFactor: 1,
        unitThreshold: 0,
        isDeployed: false,
        alertEnabled: true,
        interpoaltionDisabled: false,
        // Stock-specific fields
        height: 0,
        maxCapacity: 0,
        // IoT Hub Config
        iothubdeviceId: '',
        iothubdeviceType: 'EXTERNAL',
        slaveId: 1,
        metertype: 'RS485',
        streamId: '',
        tankHeight: 0,
        sensorHeight: 0,
        // Virtual node meta
        metaUnits: [] as string[],
        metaCalculations: '',
        metaSubCategories: [] as string[],
        // Quality params
        params: [] as string[],
        siUnit: {} as Record<string, string>,
        lowThreshold: {} as Record<string, number>,
        highThreshold: {} as Record<string, number>,
        min: {} as Record<string, number>,
        max: {} as Record<string, number>,
        alertEnabledParams: {} as Record<string, boolean>,
    });
    const { toast } = useToast();

    const isStockUnit = unit?.standardCategoryId === 'STOCK_CATEGORY';
    const isVirtualNode =
        unit?.standardCategoryId === 'VIRTUAL_CATEGORY' ||
        unit?.standardCategoryId === 'VIRTUAL_NODE';
    const isQualityUnit = unit?.standardCategoryId === 'QUALITY_CATEGORY';
    const isEnergyUnit = unit?.standardCategoryId === 'ENERGY_CATEGORY';

    // Fetch industry data
    useEffect(() => {
        const fetchIndustryData = async () => {
            if (!industryId) return;

            try {
                const response = await fetch(
                    `https://admin-aquagen-api-bfckdag2aydtegc2.southindia-01.azurewebsites.net/api/admin/industry/${industryId}`,
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
                    setIndustryData(data.industryDetails);
                }
            } catch (error) {
                console.error('Failed to fetch industry data:', error);
            }
        };

        fetchIndustryData();
    }, [industryId]);

    useEffect(() => {
        if (unit) {
            setFormData({
                unitName: unit.unitName || '',
                deviceId: unit.deviceId || '',
                unitType: unit.unitType || 'ENERGY',
                flowFactor: unit.flowFactor || 1,
                unitThreshold: unit.unitThreshold || 0,
                isDeployed: unit.isDeployed || false,
                alertEnabled:
                    unit.alertEnabled !== undefined ? unit.alertEnabled : true,
                interpoaltionDisabled: unit.interpoaltionDisabled || false,
                // Stock-specific fields
                height: unit.height || 0,
                maxCapacity: unit.maxCapacity || 0,
                // IoT Hub Config
                iothubdeviceId: unit.iothubConfig?.iothubdeviceId || '',
                iothubdeviceType:
                    unit.iothubConfig?.iothubdeviceType || 'EXTERNAL',
                slaveId: unit.iothubConfig?.slaveId || 1,
                metertype: unit.iothubConfig?.metertype || 'RS485',
                streamId: unit.iothubConfig?.streamId || '',
                tankHeight: unit.iothubConfig?.tankHeight || 0,
                sensorHeight: unit.iothubConfig?.sensorHeight || 0,
                // Virtual node meta
                metaUnits: unit.meta?.units || [],
                metaCalculations: unit.meta?.calculations || '',
                metaSubCategories: unit.meta?.subCategories || [],
                // Quality params
                params: unit.params || [],
                siUnit: unit.siUnit || {},
                lowThreshold: unit.lowThreshold || {},
                highThreshold: unit.highThreshold || {},
                min: unit.min || {},
                max: unit.max || {},
                alertEnabledParams: unit.alertEnabled || {},
            });
        }
    }, [unit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!unit || !hasFullAccess()) return;

        setIsLoading(true);

        try {
            const apiEndpoint =
                'https://admin-aquagen-api-bfckdag2aydtegc2.southindia-01.azurewebsites.net/api/admin/unit/';

            let unitModel: any = {
                deviceId: formData.deviceId,
                unitId: unit.unitId,
                unitName: formData.unitName,
                isDeployed: formData.isDeployed,
                unitThreshold: formData.unitThreshold,
                alertEnabled: formData.alertEnabled,
                interpoaltionDisabled: formData.interpoaltionDisabled,
                createdTime: unit.createdTime,
                standardCategoryId: unit.standardCategoryId,
                iothubConfig: {
                    iothubdeviceId: formData.iothubdeviceId,
                    iothubdeviceType: formData.iothubdeviceType,
                    slaveId: formData.slaveId,
                    metertype: formData.metertype,
                    streamId: formData.streamId,
                },
            };

            // Add unitType and flowFactor for energy units
            if (isEnergyUnit) {
                unitModel.unitType = formData.unitType;
                unitModel.flowFactor = formData.flowFactor;
            }

            // Add flow factor for non-stock and non-energy units
            if (!isStockUnit && !isEnergyUnit) {
                unitModel.flowFactor = formData.flowFactor;
            }

            // Add stock-specific fields
            if (isStockUnit) {
                unitModel.height = formData.height;
                unitModel.maxCapacity = formData.maxCapacity;
                unitModel.iothubConfig.tankHeight = formData.tankHeight;
                unitModel.iothubConfig.sensorHeight = formData.sensorHeight;
            }

            // Add virtual node meta
            if (isVirtualNode) {
                unitModel.meta = {
                    units: formData.metaUnits,
                    calculations: formData.metaCalculations,
                    subCategories: formData.metaSubCategories,
                };
            }

            // Add quality-specific fields
            if (isQualityUnit) {
                unitModel.params = formData.params;
                unitModel.siUnit = formData.siUnit;
                unitModel.lowThreshold = formData.lowThreshold;
                unitModel.highThreshold = formData.highThreshold;
                unitModel.min = formData.min;
                unitModel.max = formData.max;
                unitModel.alertEnabled = formData.alertEnabledParams;
            }

            const response = await fetch(apiEndpoint, {
                method: 'PUT',
                headers: {
                    accept: 'application/json',
                    Authorization:
                        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6dHJ1ZSwiaWF0IjoxNzM0MzI2NDU2LCJqdGkiOiI0NmFhOTRhNS00MDY3LTQ0OWEtOWUxYy1kYTU5MWZkMDZhYmIiLCJ0eXBlIjoiYWNjZXNzIiwic3ViIjoiSU5URVJOQUwiLCJuYmYiOjE3MzQzMjY0NTYsImV4cCI6MTc2NTg2MjQ1NiwidXNlcklkIjoiSU5URVJOQUxfREVGQVVMVF92YXJ1biIsImVtYWlsIjoidmFydW5AYXF1YWdlbi5jb20iLCJ1c2VybmFtZSI6InZhcnVuIiwibG9naW5UeXBlIjoiQURNSU5fREVGQVVMVCIsInJvbGUiOiJ1c2VyIiwicGVybWlzc2lvbnMiOlsiU1VQRVJfVVNFUiJdfQ.GsEQUEHCyvAHgvcUDbrZfIclUQqoB6Z61Q8IltLqjiA',
                    targetIndustryId: industryId,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ UnitModel: unitModel }),
            });

            if (response.ok) {
                await logApiCall(apiEndpoint, {
                    method: 'PUT',
                    targetIndustryId: industryId,
                    unitObject: unitModel,
                });

                toast({
                    title: 'Success',
                    description: 'Unit updated successfully!',
                });
                onSuccess();
                onOpenChange(false);
            } else {
                throw new Error('Failed to update unit');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update unit. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!hasFullAccess()) return;

        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    const addMetaUnit = () => {
        if (
            !hasFullAccess() ||
            !newUnitInput.trim() ||
            formData.metaUnits.includes(newUnitInput.trim())
        )
            return;
        setFormData((prev) => ({
            ...prev,
            metaUnits: [...prev.metaUnits, newUnitInput.trim()],
        }));
        setNewUnitInput('');
    };

    const removeMetaUnit = (unitId: string) => {
        if (!hasFullAccess()) return;
        setFormData((prev) => ({
            ...prev,
            metaUnits: prev.metaUnits.filter((id) => id !== unitId),
        }));
    };

    const addMetaSubCategory = () => {
        if (
            !hasFullAccess() ||
            !newSubCategoryInput.trim() ||
            formData.metaSubCategories.includes(newSubCategoryInput.trim())
        )
            return;
        setFormData((prev) => ({
            ...prev,
            metaSubCategories: [
                ...prev.metaSubCategories,
                newSubCategoryInput.trim(),
            ],
        }));
        setNewSubCategoryInput('');
    };

    const removeMetaSubCategory = (subCategoryId: string) => {
        if (!hasFullAccess()) return;
        setFormData((prev) => ({
            ...prev,
            metaSubCategories: prev.metaSubCategories.filter(
                (id) => id !== subCategoryId
            ),
        }));
    };

    const addQualityParam = (paramKey: string) => {
        if (!hasFullAccess() || formData.params.includes(paramKey)) return;

        const param = QUALITY_PARAMS.find((p) => p.key === paramKey);
        if (!param) return;

        setFormData((prev) => ({
            ...prev,
            params: [...prev.params, paramKey],
            siUnit: { ...prev.siUnit, [paramKey]: param.unit },
            lowThreshold: { ...prev.lowThreshold, [paramKey]: 0 },
            highThreshold: { ...prev.highThreshold, [paramKey]: 100 },
            min: { ...prev.min, [paramKey]: 0 },
            max: { ...prev.max, [paramKey]: 1000 },
            alertEnabledParams: {
                ...prev.alertEnabledParams,
                [paramKey]: false,
            },
        }));
    };

    const removeQualityParam = (paramKey: string) => {
        if (!hasFullAccess()) return;

        setFormData((prev) => ({
            ...prev,
            params: prev.params.filter((p) => p !== paramKey),
            siUnit: Object.fromEntries(
                Object.entries(prev.siUnit).filter(([key]) => key !== paramKey)
            ),
            lowThreshold: Object.fromEntries(
                Object.entries(prev.lowThreshold).filter(
                    ([key]) => key !== paramKey
                )
            ),
            highThreshold: Object.fromEntries(
                Object.entries(prev.highThreshold).filter(
                    ([key]) => key !== paramKey
                )
            ),
            min: Object.fromEntries(
                Object.entries(prev.min).filter(([key]) => key !== paramKey)
            ),
            max: Object.fromEntries(
                Object.entries(prev.max).filter(([key]) => key !== paramKey)
            ),
            alertEnabledParams: Object.fromEntries(
                Object.entries(prev.alertEnabledParams).filter(
                    ([key]) => key !== paramKey
                )
            ),
        }));
    };

    const updateQualityParam = (
        paramKey: string,
        field: string,
        value: any
    ) => {
        if (!hasFullAccess()) return;

        setFormData((prev) => {
            const currentFieldValue = prev[field as keyof typeof prev];
            // Ensure we're spreading from an object type
            const safeFieldValue =
                typeof currentFieldValue === 'object' &&
                currentFieldValue !== null
                    ? currentFieldValue
                    : {};

            return {
                ...prev,
                [field]: { ...safeFieldValue, [paramKey]: value },
            };
        });
    };

    if (!unit) return null;

    const isReadOnly = !hasFullAccess();

    const getTabsList = () => {
        const tabs = ['basic', 'iothub', 'settings'];
        if (isVirtualNode) tabs.push('meta');
        if (isQualityUnit) tabs.push('params');
        return tabs;
    };

    const tabsList = getTabsList();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-4xl max-h-[80vh] overflow-y-auto'>
                <div className='flex items-center justify-between mb-4'>
                    <h2 className='text-lg font-semibold'>
                        {isReadOnly ? 'View Unit Details' : 'Edit Unit'}
                    </h2>
                    <p className='text-sm text-muted-foreground'>
                        {isReadOnly
                            ? 'View the unit details below.'
                            : 'Update the unit details below.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className='space-y-6'>
                    <Tabs defaultValue='basic' className='w-full'>
                        <TabsList
                            className={`flex w-full justify-evenly center gap-1`}
                        >
                            <TabsTrigger value='basic' className='flex-1'>
                                Basic
                            </TabsTrigger>
                            <TabsTrigger value='iothub' className='flex-1'>
                                IoT Hub
                            </TabsTrigger>
                            <TabsTrigger value='settings' className='flex-1'>
                                Settings
                            </TabsTrigger>
                            {isVirtualNode && (
                                <TabsTrigger value='meta' className='flex-1'>
                                    Meta
                                </TabsTrigger>
                            )}
                            {isQualityUnit && (
                                <TabsTrigger value='params' className='flex-1'>
                                    Parameters
                                </TabsTrigger>
                            )}
                        </TabsList>

                        <TabsContent value='basic' className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='unitId'>Unit ID</Label>
                                    <Input
                                        id='unitId'
                                        value={unit.unitId}
                                        disabled
                                        className='bg-gray-100'
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='unitName'>Unit Name</Label>
                                    <Input
                                        id='unitName'
                                        name='unitName'
                                        value={formData.unitName}
                                        onChange={handleInputChange}
                                        placeholder='Enter unit name'
                                        disabled={isReadOnly}
                                        className={
                                            isReadOnly ? 'bg-gray-100' : ''
                                        }
                                        required={!isReadOnly}
                                    />
                                </div>
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='deviceId'>Device ID</Label>
                                    <Input
                                        id='deviceId'
                                        name='deviceId'
                                        value={formData.deviceId}
                                        onChange={handleInputChange}
                                        placeholder='Enter device ID'
                                        disabled={isReadOnly}
                                        className={
                                            isReadOnly ? 'bg-gray-100' : ''
                                        }
                                    />
                                </div>
                                {isEnergyUnit && (
                                    <div className='space-y-2'>
                                        <Label htmlFor='unitType'>
                                            Unit Type
                                        </Label>
                                        <Input
                                            id='unitType'
                                            name='unitType'
                                            value={formData.unitType}
                                            onChange={handleInputChange}
                                            placeholder='Enter unit type (e.g., ENERGY)'
                                            disabled
                                            className={
                                                isReadOnly ? 'bg-gray-100' : ''
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                {(isEnergyUnit ||
                                    (!isStockUnit && !isEnergyUnit)) && (
                                    <div className='space-y-2'>
                                        <Label htmlFor='flowFactor'>
                                            Flow Factor
                                        </Label>
                                        <Input
                                            id='flowFactor'
                                            name='flowFactor'
                                            type='number'
                                            value={formData.flowFactor}
                                            onChange={handleInputChange}
                                            min='0'
                                            disabled={isReadOnly}
                                            className={
                                                isReadOnly ? 'bg-gray-100' : ''
                                            }
                                        />
                                    </div>
                                )}
                                <div className='space-y-2'>
                                    <Label htmlFor='unitThreshold'>
                                        Unit Threshold
                                    </Label>
                                    <Input
                                        id='unitThreshold'
                                        name='unitThreshold'
                                        type='number'
                                        value={formData.unitThreshold}
                                        onChange={handleInputChange}
                                        min='0'
                                        disabled={isReadOnly}
                                        className={
                                            isReadOnly ? 'bg-gray-100' : ''
                                        }
                                    />
                                </div>
                            </div>

                            {isStockUnit && (
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='height'>Height</Label>
                                        <Input
                                            id='height'
                                            name='height'
                                            type='number'
                                            value={formData.height}
                                            onChange={handleInputChange}
                                            min='0'
                                            disabled={isReadOnly}
                                            className={
                                                isReadOnly ? 'bg-gray-100' : ''
                                            }
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label htmlFor='maxCapacity'>
                                            Max Capacity
                                        </Label>
                                        <Input
                                            id='maxCapacity'
                                            name='maxCapacity'
                                            type='number'
                                            value={formData.maxCapacity}
                                            onChange={handleInputChange}
                                            min='0'
                                            disabled={isReadOnly}
                                            className={
                                                isReadOnly ? 'bg-gray-100' : ''
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value='iothub' className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='iothubdeviceId'>
                                        IoT Hub Device ID
                                    </Label>
                                    <Input
                                        id='iothubdeviceId'
                                        name='iothubdeviceId'
                                        value={formData.iothubdeviceId}
                                        onChange={handleInputChange}
                                        placeholder='Enter IoT Hub Device ID'
                                        disabled={isReadOnly}
                                        className={
                                            isReadOnly ? 'bg-gray-100' : ''
                                        }
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='iothubdeviceType'>
                                        IoT Hub Device Type
                                    </Label>
                                    <Select
                                        value={formData.iothubdeviceType}
                                        onValueChange={(value) =>
                                            !isReadOnly &&
                                            setFormData((prev) => ({
                                                ...prev,
                                                iothubdeviceType: value,
                                            }))
                                        }
                                        disabled={isReadOnly}
                                    >
                                        <SelectTrigger
                                            className={
                                                isReadOnly ? 'bg-gray-100' : ''
                                            }
                                        >
                                            <SelectValue placeholder='Select device type' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='EXTERNAL'>
                                                External
                                            </SelectItem>
                                            <SelectItem value='teltonika'>
                                                Teltonika
                                            </SelectItem>
                                            <SelectItem value='aquagen lite'>
                                                Aquagen Lite
                                            </SelectItem>
                                            <SelectItem value='w-link'>
                                                W-Link
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='slaveId'>Slave ID</Label>
                                    <Input
                                        id='slaveId'
                                        name='slaveId'
                                        type='number'
                                        value={formData.slaveId}
                                        onChange={handleInputChange}
                                        min='0'
                                        disabled={isReadOnly}
                                        className={
                                            isReadOnly ? 'bg-gray-100' : ''
                                        }
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='metertype'>
                                        Meter Type
                                    </Label>
                                    <Select
                                        value={formData.metertype}
                                        onValueChange={(value) =>
                                            !isReadOnly &&
                                            setFormData((prev) => ({
                                                ...prev,
                                                metertype: value,
                                            }))
                                        }
                                        disabled={isReadOnly}
                                    >
                                        <SelectTrigger
                                            className={
                                                isReadOnly ? 'bg-gray-100' : ''
                                            }
                                        >
                                            <SelectValue placeholder='Select meter type' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='RS485'>
                                                RS485
                                            </SelectItem>
                                            <SelectItem value='PULSE'>
                                                PULSE
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {isStockUnit && (
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='tankHeight'>
                                            Tank Height
                                        </Label>
                                        <Input
                                            id='tankHeight'
                                            name='tankHeight'
                                            type='number'
                                            value={formData.tankHeight}
                                            onChange={handleInputChange}
                                            min='0'
                                            disabled={isReadOnly}
                                            className={
                                                isReadOnly ? 'bg-gray-100' : ''
                                            }
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label htmlFor='sensorHeight'>
                                            Sensor Height
                                        </Label>
                                        <Input
                                            id='sensorHeight'
                                            name='sensorHeight'
                                            type='number'
                                            value={formData.sensorHeight}
                                            onChange={handleInputChange}
                                            min='0'
                                            disabled={isReadOnly}
                                            className={
                                                isReadOnly ? 'bg-gray-100' : ''
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            <div className='space-y-2'>
                                <Label htmlFor='streamId'>Stream ID</Label>
                                <Input
                                    id='streamId'
                                    name='streamId'
                                    value={formData.streamId}
                                    onChange={handleInputChange}
                                    placeholder='Enter stream ID'
                                    disabled={isReadOnly}
                                    className={isReadOnly ? 'bg-gray-100' : ''}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value='settings' className='space-y-4'>
                            <div className='flex flex-col gap-4'>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='isDeployed'
                                        checked={formData.isDeployed}
                                        onCheckedChange={(checked) =>
                                            !isReadOnly &&
                                            setFormData((prev) => ({
                                                ...prev,
                                                isDeployed: checked as boolean,
                                            }))
                                        }
                                        disabled={isReadOnly}
                                    />
                                    <Label htmlFor='isDeployed'>
                                        Is Deployed
                                    </Label>
                                </div>
                                {!isQualityUnit && (
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox
                                            id='alertEnabled'
                                            checked={formData.alertEnabled}
                                            onCheckedChange={(checked) =>
                                                !isReadOnly &&
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    alertEnabled:
                                                        checked as boolean,
                                                }))
                                            }
                                            disabled={isReadOnly}
                                        />
                                        <Label htmlFor='alertEnabled'>
                                            Alert Enabled
                                        </Label>
                                    </div>
                                )}
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='interpoaltionDisabled'
                                        checked={formData.interpoaltionDisabled}
                                        onCheckedChange={(checked) =>
                                            !isReadOnly &&
                                            setFormData((prev) => ({
                                                ...prev,
                                                interpoaltionDisabled:
                                                    checked as boolean,
                                            }))
                                        }
                                        disabled={isReadOnly}
                                    />
                                    <Label htmlFor='interpoaltionDisabled'>
                                        Interpolation Disabled
                                    </Label>
                                </div>
                            </div>
                        </TabsContent>

                        {isVirtualNode && (
                            <TabsContent value='meta' className='space-y-4'>
                                <div className='space-y-6'>
                                    <div className='space-y-3'>
                                        <Label className='text-base font-medium'>
                                            Units
                                        </Label>

                                        {!isReadOnly && (
                                            <div className='flex gap-2'>
                                                <Input
                                                    value={newUnitInput}
                                                    onChange={(e) =>
                                                        setNewUnitInput(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder='Enter unit ID'
                                                    className='flex-1'
                                                />
                                                <Button
                                                    type='button'
                                                    onClick={addMetaUnit}
                                                    size='sm'
                                                >
                                                    <Plus className='h-4 w-4' />
                                                    Add
                                                </Button>
                                            </div>
                                        )}

                                        <div className='min-h-20 border rounded-lg p-3'>
                                            {formData.metaUnits.length > 0 ? (
                                                <div className='space-y-2'>
                                                    {formData.metaUnits.map(
                                                        (unitId) => (
                                                            <div
                                                                key={unitId}
                                                                className='flex items-center justify-between p-2 bg-gray-50 rounded'
                                                            >
                                                                <span className='font-medium text-sm'>
                                                                    {unitId}
                                                                </span>
                                                                {!isReadOnly && (
                                                                    <Button
                                                                        type='button'
                                                                        size='sm'
                                                                        variant='outline'
                                                                        onClick={() =>
                                                                            removeMetaUnit(
                                                                                unitId
                                                                            )
                                                                        }
                                                                    >
                                                                        <X className='h-4 w-4' />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <p className='text-sm text-gray-500 italic text-center py-4'>
                                                    No units added
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className='space-y-2'>
                                        <Label
                                            htmlFor='metaCalculations'
                                            className='text-base font-medium'
                                        >
                                            Calculations
                                        </Label>
                                        <Input
                                            id='metaCalculations'
                                            name='metaCalculations'
                                            value={formData.metaCalculations}
                                            onChange={handleInputChange}
                                            placeholder='Format: {unitId1} + {unitId2} - {subCategoryId}'
                                            disabled={isReadOnly}
                                            className={
                                                isReadOnly ? 'bg-gray-100' : ''
                                            }
                                        />
                                    </div>

                                    <div className='space-y-3'>
                                        <Label className='text-base font-medium'>
                                            Sub Categories
                                        </Label>

                                        {!isReadOnly && (
                                            <div className='flex gap-2'>
                                                <Input
                                                    value={newSubCategoryInput}
                                                    onChange={(e) =>
                                                        setNewSubCategoryInput(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder='Enter subcategory ID'
                                                    className='flex-1'
                                                />
                                                <Button
                                                    type='button'
                                                    onClick={addMetaSubCategory}
                                                    size='sm'
                                                >
                                                    <Plus className='h-4 w-4' />
                                                    Add
                                                </Button>
                                            </div>
                                        )}

                                        <div className='min-h-20 border rounded-lg p-3'>
                                            {formData.metaSubCategories.length >
                                            0 ? (
                                                <div className='space-y-2'>
                                                    {formData.metaSubCategories.map(
                                                        (subCat) => (
                                                            <div
                                                                key={subCat}
                                                                className='flex items-center justify-between p-2 bg-gray-50 rounded'
                                                            >
                                                                <span className='font-medium text-sm'>
                                                                    {subCat}
                                                                </span>
                                                                {!isReadOnly && (
                                                                    <Button
                                                                        type='button'
                                                                        size='sm'
                                                                        variant='outline'
                                                                        onClick={() =>
                                                                            removeMetaSubCategory(
                                                                                subCat
                                                                            )
                                                                        }
                                                                    >
                                                                        <X className='h-4 w-4' />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <p className='text-sm text-gray-500 italic text-center py-4'>
                                                    No subcategories added
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        )}

                        {isQualityUnit && (
                            <TabsContent value='params' className='space-y-4'>
                                <div className='space-y-4'>
                                    <div className='flex items-center justify-between'>
                                        <Label>Parameters</Label>
                                        {!isReadOnly && (
                                            <Select
                                                onValueChange={addQualityParam}
                                            >
                                                <SelectTrigger className='w-48'>
                                                    <SelectValue placeholder='Add parameter...' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {QUALITY_PARAMS.filter(
                                                        (p) =>
                                                            !formData.params.includes(
                                                                p.key
                                                            )
                                                    ).map((param) => (
                                                        <SelectItem
                                                            key={param.key}
                                                            value={param.key}
                                                        >
                                                            {param.label} (
                                                            {param.unit})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>

                                    {formData.params.map((paramKey) => {
                                        const param = QUALITY_PARAMS.find(
                                            (p) => p.key === paramKey
                                        );
                                        if (!param) return null;

                                        return (
                                            <div
                                                key={paramKey}
                                                className='border rounded-lg p-4 space-y-3'
                                            >
                                                <div className='flex items-center justify-between'>
                                                    <h4 className='font-medium'>
                                                        {param.label}
                                                    </h4>
                                                    {!isReadOnly && (
                                                        <Button
                                                            type='button'
                                                            size='sm'
                                                            variant='outline'
                                                            onClick={() =>
                                                                removeQualityParam(
                                                                    paramKey
                                                                )
                                                            }
                                                        >
                                                            <X className='h-4 w-4' />
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className='grid grid-cols-2 gap-3'>
                                                    <div className='space-y-2'>
                                                        <Label>
                                                            Low Threshold
                                                        </Label>
                                                        <Input
                                                            type='number'
                                                            value={
                                                                formData
                                                                    .lowThreshold[
                                                                    paramKey
                                                                ] || 0
                                                            }
                                                            onChange={(e) =>
                                                                updateQualityParam(
                                                                    paramKey,
                                                                    'lowThreshold',
                                                                    Number(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                            disabled={
                                                                isReadOnly
                                                            }
                                                            className={
                                                                isReadOnly
                                                                    ? 'bg-gray-100'
                                                                    : ''
                                                            }
                                                        />
                                                    </div>
                                                    <div className='space-y-2'>
                                                        <Label>
                                                            High Threshold
                                                        </Label>
                                                        <Input
                                                            type='number'
                                                            value={
                                                                formData
                                                                    .highThreshold[
                                                                    paramKey
                                                                ] || 0
                                                            }
                                                            onChange={(e) =>
                                                                updateQualityParam(
                                                                    paramKey,
                                                                    'highThreshold',
                                                                    Number(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                            disabled={
                                                                isReadOnly
                                                            }
                                                            className={
                                                                isReadOnly
                                                                    ? 'bg-gray-100'
                                                                    : ''
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                <div className='grid grid-cols-2 gap-3'>
                                                    <div className='space-y-2'>
                                                        <Label>Min Value</Label>
                                                        <Input
                                                            type='number'
                                                            value={
                                                                formData.min[
                                                                    paramKey
                                                                ] || 0
                                                            }
                                                            onChange={(e) =>
                                                                updateQualityParam(
                                                                    paramKey,
                                                                    'min',
                                                                    Number(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                            disabled={
                                                                isReadOnly
                                                            }
                                                            className={
                                                                isReadOnly
                                                                    ? 'bg-gray-100'
                                                                    : ''
                                                            }
                                                        />
                                                    </div>
                                                    <div className='space-y-2'>
                                                        <Label>Max Value</Label>
                                                        <Input
                                                            type='number'
                                                            value={
                                                                formData.max[
                                                                    paramKey
                                                                ] || 0
                                                            }
                                                            onChange={(e) =>
                                                                updateQualityParam(
                                                                    paramKey,
                                                                    'max',
                                                                    Number(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                            disabled={
                                                                isReadOnly
                                                            }
                                                            className={
                                                                isReadOnly
                                                                    ? 'bg-gray-100'
                                                                    : ''
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                <div className='flex items-center space-x-2'>
                                                    <Checkbox
                                                        checked={
                                                            formData
                                                                .alertEnabledParams[
                                                                paramKey
                                                            ] || false
                                                        }
                                                        onCheckedChange={(
                                                            checked
                                                        ) =>
                                                            updateQualityParam(
                                                                paramKey,
                                                                'alertEnabledParams',
                                                                checked
                                                            )
                                                        }
                                                        disabled={isReadOnly}
                                                    />
                                                    <Label>Alert Enabled</Label>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </TabsContent>
                        )}
                    </Tabs>

                    <div className='flex justify-end gap-3 pt-4'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => onOpenChange(false)}
                        >
                            {isReadOnly ? 'Close' : 'Cancel'}
                        </Button>
                        {hasFullAccess() && (
                            <Button type='submit' disabled={isLoading}>
                                {isLoading ? 'Updating...' : 'Update Unit'}
                            </Button>
                        )}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
