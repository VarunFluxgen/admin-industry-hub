
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { logApiCall } from '@/utils/apiLogger';

interface CreateCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    industryId: string;
    onSuccess: () => void;
}

export function CreateCategoryDialog({
    open,
    onOpenChange,
    industryId,
    onSuccess,
}: CreateCategoryDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        categoryName: '',
        standardCategoryId: 'SOURCE_CATEGORY',
    });
    const { toast } = useToast();

    const categoryOptions = [
        { value: 'SOURCE_CATEGORY', label: 'Source Category' },
        { value: 'ENERGY_CATEGORY', label: 'Energy Category' },
        { value: 'STOCK_CATEGORY', label: 'Stock Category' },
        { value: 'GROUND_WATER_LEVEL', label: 'Ground Water Level' },
        { value: 'QUALITY_CATEGORY', label: 'Quality Category' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const apiEndpoint = `https://admin-aquagen-api-bfckdag2aydtegc2.southindia-01.azurewebsites.net/api/admin/Category/?standardCategoryId=${formData.standardCategoryId}`;
            
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    Authorization:
                        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6dHJ1ZSwiaWF0IjoxNzY1ODcyMDk5LCJqdGkiOiIxM2IzNjgyZS1jNTBlLTRlOTQtYTQ1Yi04ODQwNTQ5MWU0YjIiLCJ0eXBlIjoiYWNjZXNzIiwic3ViIjoiSU5URVJOQUwiLCJuYmYiOjE3NjU4NzIwOTksImV4cCI6MTgzMDY3MjA5OSwidXNlcklkIjoiSU5URVJOQUxfREVGQVVMVF92YXJ1biIsImVtYWlsIjoidmFydW5AYXF1YWdlbi5jb20iLCJ1c2VybmFtZSI6InZhcnVuIiwibG9naW5UeXBlIjoiQURNSU5fREVGQVVMVCIsInJvbGUiOiJ1c2VyIiwicGVybWlzc2lvbnMiOlsiU1VQRVJfVVNFUiIsIkFMRVJUUyIsIkFDQ09VTlRfU0VUVElOR1MiXX0.II4LBKgTOffmj3nRwlc5ce25VJ4pK4hieML1ZNrt_DQ',
                    targetIndustryId: industryId,
                    categoryName: formData.categoryName,
                },
            });

            if (response.ok) {
                // Log the API call
                await logApiCall(apiEndpoint, {
                    method: 'POST',
                    targetIndustryId: industryId,
                    categoryName: formData.categoryName,
                    standardCategoryId: formData.standardCategoryId,
                });

                toast({
                    title: 'Success',
                    description: 'Category created successfully!',
                });
                onSuccess();
                onOpenChange(false);
                setFormData({
                    categoryName: '',
                    standardCategoryId: 'SOURCE_CATEGORY',
                });
            } else {
                throw new Error('Failed to create category');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create category. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                    <DialogDescription>
                        Add a new category to organize your units.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='categoryName'>Category Name</Label>
                        <Input
                            id='categoryName'
                            name='categoryName'
                            value={formData.categoryName}
                            onChange={handleInputChange}
                            placeholder='Enter category name'
                            required
                        />
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='standardCategoryId'>
                            Standard Category
                        </Label>
                        <Select
                            value={formData.standardCategoryId}
                            onValueChange={(value) =>
                                setFormData({
                                    ...formData,
                                    standardCategoryId: value,
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder='Select standard category' />
                            </SelectTrigger>
                            <SelectContent>
                                {categoryOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                            {isLoading ? 'Creating...' : 'Create Category'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
