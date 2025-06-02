
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
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>Edit Unit</DialogTitle>
                    <DialogDescription>
                        Update the unit details for {unit.unitId}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className='space-y-4'>
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
