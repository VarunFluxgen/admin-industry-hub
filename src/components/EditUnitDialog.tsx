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
import { useToast } from '@/hooks/use-toast';
import { logApiCall } from '@/utils/apiLogger';
import { useAuth } from '@/contexts/AuthContext';

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
    const { hasFullAccess } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        unitName: '',
        deviceId: '',
        flowFactor: 1,
        unitThreshold: 0,
        isDeployed: false,
        alertEnabled: true,
        interpoaltionDisabled: false,
        // IoT Hub Config
        iothubdeviceId: '',
        iothubdeviceType: 'EXTERNAL',
        slaveId: 1,
        metertype: 'RS485',
        streamId: '',
    });
    const { toast } = useToast();

    useEffect(() => {
        if (unit) {
            setFormData({
                unitName: unit.unitName || '',
                deviceId: unit.deviceId || '',
                flowFactor: unit.flowFactor || 1,
                unitThreshold: unit.unitThreshold || 0,
                isDeployed: unit.isDeployed || false,
                alertEnabled: unit.alertEnabled !== undefined ? unit.alertEnabled : true,
                interpoaltionDisabled: unit.interpoaltionDisabled || false,
                // IoT Hub Config
                iothubdeviceId: unit.iothubConfig?.iothubdeviceId || '',
                iothubdeviceType: unit.iothubConfig?.iothubdeviceType || 'EXTERNAL',
                slaveId: unit.iothubConfig?.slaveId || 1,
                metertype: unit.iothubConfig?.metertype || 'RS485',
                streamId: unit.iothubConfig?.streamId || '',
            });
        }
    }, [unit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!unit || !hasFullAccess()) return;

        setIsLoading(true);

        try {
            const apiEndpoint = 'https://admin-aquagen-api-bfckdag2aydtegc2.southindia-01.azurewebsites.net/api/admin/unit/';
            
            const unitModel = {
                deviceId: formData.deviceId,
                unitId: unit.unitId,
                unitName: formData.unitName,
                isDeployed: formData.isDeployed,
                flowFactor: formData.flowFactor,
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
                // Log the API call for updating unit with full unit object
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

    if (!unit) return null;

    const isReadOnly = !hasFullAccess();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-2xl max-h-[80vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>{isReadOnly ? 'View Unit Details' : 'Edit Unit'}</DialogTitle>
                    <DialogDescription>
                        {isReadOnly ? 'View the unit details below.' : 'Update the unit details below.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className='space-y-6'>
                    <Tabs defaultValue='basic' className='w-full'>
                        <TabsList className='grid w-full grid-cols-3'>
                            <TabsTrigger value='basic'>Basic</TabsTrigger>
                            <TabsTrigger value='iothub'>IoT Hub</TabsTrigger>
                            <TabsTrigger value='settings'>Settings</TabsTrigger>
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
                                        className={isReadOnly ? 'bg-gray-100' : ''}
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
                                        className={isReadOnly ? 'bg-gray-100' : ''}
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
                                        disabled={isReadOnly}
                                        className={isReadOnly ? 'bg-gray-100' : ''}
                                    />
                                </div>
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='unitThreshold'>Unit Threshold</Label>
                                <Input
                                    id='unitThreshold'
                                    name='unitThreshold'
                                    type='number'
                                    value={formData.unitThreshold}
                                    onChange={handleInputChange}
                                    min='0'
                                    disabled={isReadOnly}
                                    className={isReadOnly ? 'bg-gray-100' : ''}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value='iothub' className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='iothubdeviceId'>IoT Hub Device ID</Label>
                                    <Input
                                        id='iothubdeviceId'
                                        name='iothubdeviceId'
                                        value={formData.iothubdeviceId}
                                        onChange={handleInputChange}
                                        placeholder='Enter IoT Hub Device ID'
                                        disabled={isReadOnly}
                                        className={isReadOnly ? 'bg-gray-100' : ''}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='iothubdeviceType'>IoT Hub Device Type</Label>
                                    <Select
                                        value={formData.iothubdeviceType}
                                        onValueChange={(value) =>
                                            !isReadOnly && setFormData((prev) => ({
                                                ...prev,
                                                iothubdeviceType: value,
                                            }))
                                        }
                                        disabled={isReadOnly}
                                    >
                                        <SelectTrigger className={isReadOnly ? 'bg-gray-100' : ''}>
                                            <SelectValue placeholder='Select device type' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='EXTERNAL'>External</SelectItem>
                                            <SelectItem value='teltonika'>Teltonika</SelectItem>
                                            <SelectItem value='aquagen lite'>Aquagen Lite</SelectItem>
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
                                        disabled={isReadOnly}
                                        className={isReadOnly ? 'bg-gray-100' : ''}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='metertype'>Meter Type</Label>
                                    <Select
                                        value={formData.metertype}
                                        onValueChange={(value) =>
                                            !isReadOnly && setFormData((prev) => ({
                                                ...prev,
                                                metertype: value,
                                            }))
                                        }
                                        disabled={isReadOnly}
                                    >
                                        <SelectTrigger className={isReadOnly ? 'bg-gray-100' : ''}>
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
                                            !isReadOnly && setFormData((prev) => ({
                                                ...prev,
                                                isDeployed: checked as boolean,
                                            }))
                                        }
                                        disabled={isReadOnly}
                                    />
                                    <Label htmlFor='isDeployed'>Is Deployed</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='alertEnabled'
                                        checked={formData.alertEnabled}
                                        onCheckedChange={(checked) =>
                                            !isReadOnly && setFormData((prev) => ({
                                                ...prev,
                                                alertEnabled: checked as boolean,
                                            }))
                                        }
                                        disabled={isReadOnly}
                                    />
                                    <Label htmlFor='alertEnabled'>Alert Enabled</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='interpoaltionDisabled'
                                        checked={formData.interpoaltionDisabled}
                                        onCheckedChange={(checked) =>
                                            !isReadOnly && setFormData((prev) => ({
                                                ...prev,
                                                interpoaltionDisabled: checked as boolean,
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
