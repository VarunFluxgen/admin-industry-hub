
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
        unitType: '',
        standardCategoryId: '',
        flowFactor: 1,
        deviceId: '',
        isDeployed: false,
        // IoT Hub settings
        iotHubConnectionString: '',
        deviceConnectionString: '',
        primaryKey: '',
        secondaryKey: '',
        // Additional settings
        autoSync: false,
        dataRetentionDays: 30,
        alertThreshold: 0,
        maintenanceMode: false,
    });
    const { toast } = useToast();

    useEffect(() => {
        if (unit) {
            setFormData({
                unitName: unit.unitName || '',
                unitType: unit.unitType || '',
                standardCategoryId: unit.standardCategoryId || '',
                flowFactor: unit.flowFactor || 1,
                deviceId: unit.deviceId || '',
                isDeployed: unit.isDeployed || false,
                iotHubConnectionString: unit.iotHubConnectionString || '',
                deviceConnectionString: unit.deviceConnectionString || '',
                primaryKey: unit.primaryKey || '',
                secondaryKey: unit.secondaryKey || '',
                autoSync: unit.autoSync || false,
                dataRetentionDays: unit.dataRetentionDays || 30,
                alertThreshold: unit.alertThreshold || 0,
                maintenanceMode: unit.maintenanceMode || false,
            });
        }
    }, [unit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!unit) return;

        setIsLoading(true);

        try {
            const updateData = {
                unitDetails: {
                    ...unit,
                    ...formData,
                },
            };

            const apiEndpoint = 'https://admin-aquagen-api-bfckdag2aydtegc2.southindia-01.azurewebsites.net/api/admin/industry/unit/';

            const response = await fetch(apiEndpoint, {
                method: 'PUT',
                headers: {
                    accept: 'application/json',
                    Authorization:
                        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6dHJ1ZSwiaWF0IjoxNzM0MzI2NDU2LCJqdGkiOiI0NmFhOTRhNS00MDY3LTQ0OWEtOWUxYy1kYTU5MWZkMDZhYmIiLCJ0eXBlIjoiYWNjZXNzIiwic3ViIjoiSU5URVJOQUwiLCJuYmYiOjE3MzQzMjY0NTYsImV4cCI6MTc2NTg2MjQ1NiwidXNlcklkIjoiSU5URVJOQUxfREVGQVVMVF92YXJ1biIsImVtYWlsIjoidmFydW5AYXF1YWdlbi5jb20iLCJ1c2VybmFtZSI6InZhcnVuIiwibG9naW5UeXBlIjoiQURNSU5fREVGQVVMVCIsInJvbGUiOiJ1c2VyIiwicGVybWlzc2lvbnMiOlsiU1VQRVJfVVNFUiJdfQ.GsEQUEHCyvAHgvcUDbrZfIclUQqoB6Z61Q8IltLqjiA',
                    targetIndustryId: industryId,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (response.ok) {
                // Log the API call
                await logApiCall(apiEndpoint, {
                    method: 'PUT',
                    targetIndustryId: industryId,
                    unitId: unit.unitId,
                    updateData: updateData,
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
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    if (!unit) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Edit Unit</DialogTitle>
                    <DialogDescription>
                        Update the unit details for {unit.unitId}.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        <TabsTrigger value="iot-hub">IoT Hub</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <form onSubmit={handleSubmit}>
                        <TabsContent value="basic" className="space-y-4 mt-4">
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

                            <div className='space-y-2'>
                                <Label htmlFor='unitType'>Unit Type</Label>
                                <Select
                                    value={formData.unitType}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            unitType: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select unit type' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='RO'>RO</SelectItem>
                                        <SelectItem value='UF'>UF</SelectItem>
                                        <SelectItem value='NF'>NF</SelectItem>
                                        <SelectItem value='MF'>MF</SelectItem>
                                        <SelectItem value='OTHER'>Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='standardCategoryId'>Category</Label>
                                <Input
                                    id='standardCategoryId'
                                    name='standardCategoryId'
                                    value={formData.standardCategoryId}
                                    onChange={handleInputChange}
                                    placeholder='Enter category ID'
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='flowFactor'>Flow Factor</Label>
                                <Input
                                    id='flowFactor'
                                    name='flowFactor'
                                    type='number'
                                    step='0.01'
                                    value={formData.flowFactor}
                                    onChange={handleInputChange}
                                    placeholder='Enter flow factor'
                                />
                            </div>

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
                                <Label htmlFor='isDeployed'>Is Deployed</Label>
                            </div>
                        </TabsContent>

                        <TabsContent value="iot-hub" className="space-y-4 mt-4">
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
                                <Label htmlFor='iotHubConnectionString'>IoT Hub Connection String</Label>
                                <Input
                                    id='iotHubConnectionString'
                                    name='iotHubConnectionString'
                                    value={formData.iotHubConnectionString}
                                    onChange={handleInputChange}
                                    placeholder='Enter IoT Hub connection string'
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='deviceConnectionString'>Device Connection String</Label>
                                <Input
                                    id='deviceConnectionString'
                                    name='deviceConnectionString'
                                    value={formData.deviceConnectionString}
                                    onChange={handleInputChange}
                                    placeholder='Enter device connection string'
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='primaryKey'>Primary Key</Label>
                                <Input
                                    id='primaryKey'
                                    name='primaryKey'
                                    type='password'
                                    value={formData.primaryKey}
                                    onChange={handleInputChange}
                                    placeholder='Enter primary key'
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='secondaryKey'>Secondary Key</Label>
                                <Input
                                    id='secondaryKey'
                                    name='secondaryKey'
                                    type='password'
                                    value={formData.secondaryKey}
                                    onChange={handleInputChange}
                                    placeholder='Enter secondary key'
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="settings" className="space-y-4 mt-4">
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='autoSync'
                                    checked={formData.autoSync}
                                    onCheckedChange={(checked) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            autoSync: checked as boolean,
                                        }))
                                    }
                                />
                                <Label htmlFor='autoSync'>Auto Sync</Label>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='dataRetentionDays'>Data Retention (Days)</Label>
                                <Input
                                    id='dataRetentionDays'
                                    name='dataRetentionDays'
                                    type='number'
                                    value={formData.dataRetentionDays}
                                    onChange={handleInputChange}
                                    placeholder='Enter data retention days'
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='alertThreshold'>Alert Threshold</Label>
                                <Input
                                    id='alertThreshold'
                                    name='alertThreshold'
                                    type='number'
                                    step='0.01'
                                    value={formData.alertThreshold}
                                    onChange={handleInputChange}
                                    placeholder='Enter alert threshold'
                                />
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='maintenanceMode'
                                    checked={formData.maintenanceMode}
                                    onCheckedChange={(checked) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            maintenanceMode: checked as boolean,
                                        }))
                                    }
                                />
                                <Label htmlFor='maintenanceMode'>Maintenance Mode</Label>
                            </div>
                        </TabsContent>

                        <div className='flex justify-end gap-3 pt-6 border-t'>
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
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
