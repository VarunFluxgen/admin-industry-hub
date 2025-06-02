import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';

interface CreateUnitDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    industryId: string;
    onSuccess: () => void;
}

export function CreateUnitDialog({
    open,
    onOpenChange,
    industryId,
    onSuccess,
}: CreateUnitDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [unitCounts, setUnitCounts] = useState({
        flow: 0,
        stock: 0,
        energy: 0,
        borewell: 0,
        quality: 0,
        manual: 0,
        virtual: 0,
    });
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(
                'https://admin-aquagen-api-bfckdag2aydtegc2.southindia-01.azurewebsites.net/api/admin/unit/',
                {
                    method: 'POST',
                    headers: {
                        accept: 'application/json',
                        Authorization:
                            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6dHJ1ZSwiaWF0IjoxNzM0MzI2NDU2LCJqdGkiOiI0NmFhOTRhNS00MDY3LTQ0OWEtOWUxYy1kYTU5MWZkMDZhYmIiLCJ0eXBlIjoiYWNjZXNzIiwic3ViIjoiSU5URVJOQUwiLCJuYmYiOjE3MzQzMjY0NTYsImV4cCI6MTc2NTg2MjQ1NiwidXNlcklkIjoiSU5URVJOQUxfREVGQVVMVF92YXJ1biIsImVtYWlsIjoidmFydW5AYXF1YWdlbi5jb20iLCJ1c2VybmFtZSI6InZhcnVuIiwibG9naW5UeXBlIjoiQURNSU5fREVGQVVMVCIsInJvbGUiOiJ1c2VyIiwicGVybWlzc2lvbnMiOlsiU1VQRVJfVVNFUiJdfQ.GsEQUEHCyvAHgvcUDbrZfIclUQqoB6Z61Q8IltLqjiA',
                        targetIndustryId: industryId,
                        flow: unitCounts.flow.toString(),
                        stock: unitCounts.stock.toString(),
                        energy: unitCounts.energy.toString(),
                        borewell: unitCounts.borewell.toString(),
                        quality: unitCounts.quality.toString(),
                        manual: unitCounts.manual.toString(),
                        virtual: unitCounts.virtual.toString(),
                    },
                }
            );

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Units created successfully!',
                });
                onSuccess();
                onOpenChange(false);
                setUnitCounts({
                    flow: 0,
                    stock: 0,
                    energy: 0,
                    borewell: 0,
                    quality: 0,
                    manual: 0,
                    virtual: 0,
                });
            } else {
                throw new Error('Failed to create units');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create units. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCountChange = (
        type: keyof typeof unitCounts,
        value: string
    ) => {
        const count = parseInt(value) || 0;
        setUnitCounts((prev) => ({ ...prev, [type]: count }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>Create New Units</DialogTitle>
                    <DialogDescription>
                        Specify the number of units to create for each type.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className='grid grid-cols-2 gap-4'>
                        {Object.entries(unitCounts).map(([type, count]) => (
                            <div key={type} className='space-y-2'>
                                <Label htmlFor={type} className='capitalize'>
                                    {type} Units
                                </Label>
                                <Input
                                    id={type}
                                    type='number'
                                    min='0'
                                    value={count}
                                    onChange={(e) =>
                                        handleCountChange(
                                            type as keyof typeof unitCounts,
                                            e.target.value
                                        )
                                    }
                                    placeholder='0'
                                />
                            </div>
                        ))}
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
                            {isLoading ? 'Creating...' : 'Create Units'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
