import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface EditUnitDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    unit: any;
    industryId: string;
    onSuccess: () => void;
}

export function EditUnitDialog({
    open,
    onOpenChange,
    unit,
    industryId,
    onSuccess,
}: EditUnitDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        unitName: '',
        deviceId: '',
        flowFactor: 1,
        unitThreshold: 0,
        isDeployed: false,
        height: 0,
        maxCapacity: 0,
        maxFlowRate: 0,
        minFlowRate: 0,
        alertEnabled: true,
        manualMeterType: '',
        interpoaltionDisabled: false,
        unitType: '',
        // IoT Hub Config
        iothubdeviceId: '',
        iothubdeviceType: 'EXTERNAL',
        slaveId: 1,
        metertype: 'RS485',
        streamId: '',
        tankHeight: 0,
        sensorHeight: 0,
        // Quality parameters - now dynamic
        params: [] as string[],
        siUnit: {} as Record<string, string>,
        lowThreshold: {} as Record<string, number>,
        highThreshold: {} as Record<string, number>,
        min: {} as Record<string, number>,
        max: {} as Record<string, number>,
        alertEnabledParams: {} as Record<string, boolean>,
        // Virtual category meta
        virtualUnits: [] as string[],
        subCategories: [] as string[],
        calculations: '',
    });
    const { toast } = useToast();

    const allQualityParams = [
        'pH',
        'TDS',
        'COD',
        'TSS',
        'BOD',
        'DO',
        'Temp',
        'EC',
        'TBD',
    ];

    useEffect(() => {
        if (unit) {
            setFormData({
                unitName: unit.unitName || '',
                deviceId: unit.deviceId || '',
                flowFactor: unit.flowFactor || 1,
                unitThreshold: unit.unitThreshold || 0,
                isDeployed: unit.isDeployed || false,
                height: unit.height || 0,
                maxCapacity: unit.maxCapacity || 0,
                maxFlowRate: unit.maxFlowRate || 0,
                minFlowRate: unit.minFlowRate || 0,
                alertEnabled:
                    unit.alertEnabled !== undefined ? unit.alertEnabled : true,
                manualMeterType: unit.manualMeterType || '',
                interpoaltionDisabled: unit.interpoaltionDisabled || false,
                unitType: unit.unitType || '',
                // IoT Hub Config
                iothubdeviceId: unit.iothubConfig?.iothubdeviceId || '',
                iothubdeviceType:
                    unit.iothubConfig?.iothubdeviceType || 'EXTERNAL',
                slaveId: unit.iothubConfig?.slaveId || 1,
                metertype: unit.iothubConfig?.metertype || 'RS485',
                streamId: unit.iothubConfig?.streamId || '',
                tankHeight: unit.iothubConfig?.tankHeight || 0,
                sensorHeight: unit.iothubConfig?.sensorHeight || 0,
                // Quality parameters
                params: unit.params || [],
                siUnit: unit.siUnit || {},
                lowThreshold: unit.lowThreshold || {},
                highThreshold: unit.highThreshold || {},
                min: unit.min || {},
                max: unit.max || {},
                alertEnabledParams: unit.alertEnabled || {},
                // Virtual category meta
                virtualUnits: unit.meta?.units || [],
                subCategories: unit.meta?.subCategories || [],
                calculations: unit.meta?.calculations || '',
            });
        }
    }, [unit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!unit) return;

        setIsLoading(true);

        try {
            // Base unit model with common fields
            const baseUnitModel: any = {
                deviceId: formData.deviceId,
                unitId: unit.unitId,
                unitName: formData.unitName,
                isDeployed: formData.isDeployed,
                flowFactor: formData.flowFactor,
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

            // Add category-specific fields
            switch (unit.standardCategoryId) {
                case 'SOURCE_CATEGORY':
                case 'GROUND_WATER_LEVEL':
                    baseUnitModel.unitThreshold = formData.unitThreshold;
                    break;

                case 'STOCK_CATEGORY':
                    baseUnitModel.height = formData.height;
                    baseUnitModel.maxCapacity = formData.maxCapacity;
                    baseUnitModel.iothubConfig.tankHeight = formData.tankHeight;
                    baseUnitModel.iothubConfig.sensorHeight =
                        formData.sensorHeight;
                    break;

                case 'ENERGY_CATEGORY':
                    baseUnitModel.unitThreshold = formData.unitThreshold;
                    baseUnitModel.unitType = formData.unitType;
                    break;

                case 'QUALITY_CATEGORY':
                    baseUnitModel.params = formData.params;
                    baseUnitModel.siUnit = formData.siUnit;
                    baseUnitModel.lowThreshold = formData.lowThreshold;
                    baseUnitModel.highThreshold = formData.highThreshold;
                    baseUnitModel.min = formData.min;
                    baseUnitModel.max = formData.max;
                    baseUnitModel.alertEnabled = formData.alertEnabledParams;
                    break;

                case 'VIRTUAL_CATEGORY':
                    baseUnitModel.unitThreshold = formData.unitThreshold;
                    baseUnitModel.meta = {
                        units: formData.virtualUnits,
                        subCategories: formData.subCategories,
                        calculations: formData.calculations,
                    };
                    break;
            }

            const response = await fetch(
                'https://admin-aquagen-api-bfckdag2aydtegc2.southindia-01.azurewebsites.net/api/admin/unit/',
                {
                    method: 'PUT',
                    headers: {
                        accept: 'application/json',
                        Authorization:
                            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6dHJ1ZSwiaWF0IjoxNzM0MzI2NDU2LCJqdGkiOiI0NmFhOTRhNS00MDY3LTQ0OWEtOWUxYy1kYTU5MWZkMDZhYmIiLCJ0eXBlIjoiYWNjZXNzIiwic3ViIjoiSU5URVJOQUwiLCJuYmYiOjE3MzQzMjY0NTYsImV4cCI6MTc2NTg2MjQ1NiwidXNlcklkIjoiSU5URVJOQUxfREVGQVVMVF92YXJ1biIsImVtYWlsIjoidmFydW5AYXF1YWdlbi5jb20iLCJ1c2VybmFtZSI6InZhcnVuIiwibG9naW5UeXBlIjoiQURNSU5fREVGQVVMVCIsInJvbGUiOiJ1c2VyIiwicGVybWlzc2lvbnMiOlsiU1VQRVJfVVNFUiJdfQ.GsEQUEHCyvAHgvcUDbrZfIclUQqoB6Z61Q8IltLqjiA',
                        targetIndustryId: industryId,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ UnitModel: baseUnitModel }),
                }
            );

            if (response.ok) {
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

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleQualityParamChange = (
        param: string,
        field: string,
        value: any
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: {
                ...(prev[field as keyof typeof prev] as Record<string, any>),
                [param]: value,
            },
        }));
    };

    const addQualityParam = (param: string) => {
        setFormData((prev) => ({
            ...prev,
            params: [...prev.params, param],
            siUnit: { ...prev.siUnit, [param]: '' },
            lowThreshold: { ...prev.lowThreshold, [param]: 0 },
            highThreshold: { ...prev.highThreshold, [param]: 0 },
            min: { ...prev.min, [param]: 0 },
            max: { ...prev.max, [param]: 0 },
            alertEnabledParams: { ...prev.alertEnabledParams, [param]: false },
        }));
    };

    const removeQualityParam = (param: string) => {
        setFormData((prev) => {
            const newParams = prev.params.filter((p) => p !== param);
            const newSiUnit = { ...prev.siUnit };
            const newLowThreshold = { ...prev.lowThreshold };
            const newHighThreshold = { ...prev.highThreshold };
            const newMin = { ...prev.min };
            const newMax = { ...prev.max };
            const newAlertEnabled = { ...prev.alertEnabledParams };

            delete newSiUnit[param];
            delete newLowThreshold[param];
            delete newHighThreshold[param];
            delete newMin[param];
            delete newMax[param];
            delete newAlertEnabled[param];

            return {
                ...prev,
                params: newParams,
                siUnit: newSiUnit,
                lowThreshold: newLowThreshold,
                highThreshold: newHighThreshold,
                min: newMin,
                max: newMax,
                alertEnabledParams: newAlertEnabled,
            };
        });
    };

    const getAvailableTabs = () => {
        const tabs = [
            { value: 'basic', label: 'Basic' },
            { value: 'iothub', label: 'IoT Hub' },
        ];

        if (unit.standardCategoryId === 'QUALITY_CATEGORY') {
            tabs.push({ value: 'quality', label: 'Quality Params' });
        }

        if (unit.standardCategoryId === 'VIRTUAL_CATEGORY') {
            tabs.push({ value: 'virtual', label: 'Virtual Meta' });
        }

        tabs.push({ value: 'flags', label: 'Settings' });

        return tabs;
    };

    if (!unit) return null;

    const renderBasicFields = () => {
        const categorySpecificFields = [];

        // Common fields for all categories
        const commonFields = (
            <>
                <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='unitId'>Unit ID (Read Only)</Label>
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
                            required
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
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label htmlFor='flowFactor'>Flow Factor</Label>
                        <Input
                            id='flowFactor'
                            name='flowFactor'
                            type='number'
                            value={formData.flowFactor}
                            onChange={handleInputChange}
                            min='0'
                        />
                    </div>
                </div>
            </>
        );

        // Category-specific fields
        switch (unit.standardCategoryId) {
            case 'SOURCE_CATEGORY':
            case 'GROUND_WATER_LEVEL':
            case 'VIRTUAL_CATEGORY':
                categorySpecificFields.push(
                    <div key='unitThreshold' className='grid grid-cols-2 gap-4'>
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
                            />
                        </div>
                        <div></div>
                    </div>
                );
                break;

            case 'STOCK_CATEGORY':
                categorySpecificFields.push(
                    <div key='stockFields' className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='height'>Height</Label>
                            <Input
                                id='height'
                                name='height'
                                type='number'
                                value={formData.height}
                                onChange={handleInputChange}
                                min='0'
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='maxCapacity'>Max Capacity</Label>
                            <Input
                                id='maxCapacity'
                                name='maxCapacity'
                                type='number'
                                value={formData.maxCapacity}
                                onChange={handleInputChange}
                                min='0'
                            />
                        </div>
                    </div>
                );
                break;

            case 'ENERGY_CATEGORY':
                categorySpecificFields.push(
                    <div key='energyFields' className='grid grid-cols-2 gap-4'>
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
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='unitType'>Unit Type</Label>
                            <Input
                                id='unitType'
                                name='unitType'
                                value={formData.unitType}
                                onChange={handleInputChange}
                                placeholder='Enter unit type'
                            />
                        </div>
                    </div>
                );
                break;
        }

        return (
            <div className='space-y-4'>
                {commonFields}
                {categorySpecificFields}
            </div>
        );
    };

    const renderIotHubConfig = () => {
        return (
            <div className='space-y-4'>
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
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label htmlFor='iothubdeviceType'>
                            IoT Hub Device Type
                        </Label>
                        <Select
                            value={formData.iothubdeviceType}
                            onValueChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    iothubdeviceType: value,
                                }))
                            }
                        >
                            <SelectTrigger>
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
                                <SelectItem value='w-link'>W-Link</SelectItem>
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
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label htmlFor='metertype'>Meter Type</Label>
                        <Select
                            value={formData.metertype}
                            onValueChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    metertype: value,
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder='Select meter type' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='RS485'>RS485</SelectItem>
                                <SelectItem value='PULSE'>PULSE</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className='space-y-2'>
                    <Label htmlFor='streamId'>Stream ID</Label>
                    <Input
                        id='streamId'
                        name='streamId'
                        value={formData.streamId}
                        onChange={handleInputChange}
                        placeholder='Enter stream ID'
                    />
                </div>

                {unit.standardCategoryId === 'STOCK_CATEGORY' && (
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='tankHeight'>Tank Height</Label>
                            <Input
                                id='tankHeight'
                                name='tankHeight'
                                type='number'
                                value={formData.tankHeight}
                                onChange={handleInputChange}
                                min='0'
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='sensorHeight'>Sensor Height</Label>
                            <Input
                                id='sensorHeight'
                                name='sensorHeight'
                                type='number'
                                value={formData.sensorHeight}
                                onChange={handleInputChange}
                                min='0'
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderVirtualMeta = () => (
        <div className='space-y-4'>
            <div className='space-y-2'>
                <Label htmlFor='virtualUnits'>
                    Virtual Units (comma-separated)
                </Label>
                <Input
                    id='virtualUnits'
                    value={formData.virtualUnits.join(',')}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            virtualUnits: e.target.value
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean),
                        }))
                    }
                    placeholder='Enter unit IDs separated by commas'
                />
            </div>
            <div className='space-y-2'>
                <Label htmlFor='subCategories'>
                    Sub Categories (comma-separated)
                </Label>
                <Input
                    id='subCategories'
                    value={formData.subCategories.join(',')}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            subCategories: e.target.value
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean),
                        }))
                    }
                    placeholder='Enter sub-category IDs separated by commas'
                />
            </div>
            <div className='space-y-2'>
                <Label htmlFor='calculations'>Calculations</Label>
                <Textarea
                    id='calculations'
                    name='calculations'
                    value={formData.calculations}
                    onChange={handleInputChange}
                    placeholder='Enter calculation formula'
                    rows={3}
                />
            </div>
        </div>
    );

    const renderQualityParams = () => {
        const availableParams = allQualityParams.filter(
            (param) => !formData.params.includes(param)
        );

        return (
            <div className='space-y-4'>
                {/* Add new parameter */}
                <div className='flex gap-2 items-center'>
                    <Select
                        onValueChange={(param) => {
                            addQualityParam(param);
                        }}
                    >
                        <SelectTrigger className='w-48'>
                            <SelectValue placeholder='Add parameter' />
                        </SelectTrigger>
                        <SelectContent>
                            {availableParams.map((param) => (
                                <SelectItem key={param} value={param}>
                                    {param}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Plus className='h-4 w-4 text-gray-500' />
                </div>

                {/* Header row */}
                <div className='grid grid-cols-7 gap-2 text-sm font-medium border-b pb-2'>
                    <span>Parameter</span>
                    <span>Unit</span>
                    <span>Low Threshold</span>
                    <span>High Threshold</span>
                    <span>Max</span>
                    <span>Alert</span>
                    <span>Action</span>
                </div>

                {/* Parameter rows */}
                {formData.params.map((param) => (
                    <div
                        key={param}
                        className='grid grid-cols-7 gap-2 items-center'
                    >
                        <Label className='font-medium'>{param}</Label>
                        <Input
                            placeholder='Unit'
                            value={formData.siUnit[param] || ''}
                            onChange={(e) =>
                                handleQualityParamChange(
                                    param,
                                    'siUnit',
                                    e.target.value
                                )
                            }
                        />
                        <Input
                            placeholder='Low'
                            type='number'
                            value={formData.lowThreshold[param] || ''}
                            onChange={(e) =>
                                handleQualityParamChange(
                                    param,
                                    'lowThreshold',
                                    Number(e.target.value)
                                )
                            }
                        />
                        <Input
                            placeholder='High'
                            type='number'
                            value={formData.highThreshold[param] || ''}
                            onChange={(e) =>
                                handleQualityParamChange(
                                    param,
                                    'highThreshold',
                                    Number(e.target.value)
                                )
                            }
                        />
                        <Input
                            placeholder='Max'
                            type='number'
                            value={formData.max[param] || ''}
                            onChange={(e) =>
                                handleQualityParamChange(
                                    param,
                                    'max',
                                    Number(e.target.value)
                                )
                            }
                        />
                        <Checkbox
                            checked={
                                formData.alertEnabledParams[param] || false
                            }
                            onCheckedChange={(checked) =>
                                handleQualityParamChange(
                                    param,
                                    'alertEnabledParams',
                                    checked
                                )
                            }
                        />
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => removeQualityParam(param)}
                            className='h-8 w-8 p-0'
                        >
                            <Trash2 className='h-4 w-4' />
                        </Button>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-4xl max-h-[80vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>
                        Edit Unit - {unit.standardCategoryId}
                    </DialogTitle>
                    <DialogDescription>
                        Update the unit details below. Configuration varies by
                        category type.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className='space-y-6'>
                    <Tabs defaultValue='basic' className='w-full'>
                        <TabsList className='flex gap-2 w-full overflow-x-auto border-b border-gray-200 pb-2'>
                            {getAvailableTabs().map((tab) => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className='px-4 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-500'
                                >
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        <TabsContent value='basic' className='space-y-4'>
                            {renderBasicFields()}
                        </TabsContent>

                        <TabsContent value='iothub' className='space-y-4'>
                            {renderIotHubConfig()}
                        </TabsContent>

                        {unit.standardCategoryId === 'VIRTUAL_CATEGORY' && (
                            <TabsContent value='virtual' className='space-y-4'>
                                {renderVirtualMeta()}
                            </TabsContent>
                        )}

                        {unit.standardCategoryId === 'QUALITY_CATEGORY' && (
                            <TabsContent value='quality' className='space-y-4'>
                                {renderQualityParams()}
                            </TabsContent>
                        )}

                        <TabsContent value='flags' className='space-y-4'>
                            <div className='flex flex-col gap-4'>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='isDeployed'
                                        checked={formData.isDeployed}
                                        onCheckedChange={(checked) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                isDeployed: checked as boolean,
                                            }))
                                        }
                                    />
                                    <Label htmlFor='isDeployed'>
                                        Is Deployed
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='alertEnabled'
                                        checked={formData.alertEnabled}
                                        onCheckedChange={(checked) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                alertEnabled:
                                                    checked as boolean,
                                            }))
                                        }
                                    />
                                    <Label htmlFor='alertEnabled'>
                                        Alert Enabled
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='interpoaltionDisabled'
                                        checked={formData.interpoaltionDisabled}
                                        onCheckedChange={(checked) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                interpoaltionDisabled:
                                                    checked as boolean,
                                            }))
                                        }
                                    />
                                    <Label htmlFor='interpoaltionDisabled'>
                                        Interpolation Disabled
                                    </Label>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className='flex justify-end gap-3 pt-4'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type='submit' disabled={isLoading}>
                            {isLoading ? 'Updating...' : 'Update Unit'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
