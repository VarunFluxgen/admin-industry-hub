import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface EditCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: any;
    subCategory: any;
    allUnits: any[];
    industryId: string;
    onSuccess: () => void;
}

export function EditCategoryDialog({
    open,
    onOpenChange,
    category,
    subCategory,
    allUnits,
    industryId,
    onSuccess,
}: EditCategoryDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
    const { toast } = useToast();

    // Filter units that belong to the same standard category or allow virtual units to be added to source category
    const categoryUnits = allUnits.filter(
        (unit) =>
            unit.standardCategoryId === category?.standardCategoryId ||
            (category?.standardCategoryId === 'SOURCE_CATEGORY' &&
                unit.standardCategoryId === 'VIRTUAL_CATEGORY')
    );

    useEffect(() => {
        if (subCategory?.units) {
            setSelectedUnits([...subCategory.units]);
        }
    }, [subCategory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category || !subCategory) return;

        setIsLoading(true);

        try {
            const unitIds = selectedUnits.join(',');
            const response = await fetch(
                `https://admin-aquagen-api-bfckdag2aydtegc2.southindia-01.azurewebsites.net/api/admin/Category/?unitIds=${unitIds}`,
                {
                    method: 'PUT',
                    headers: {
                        accept: 'application/json',
                        Authorization:
                            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6dHJ1ZSwiaWF0IjoxNzM0MzI2NDU2LCJqdGkiOiI0NmFhOTRhNS00MDY3LTQ0OWEtOWUxYy1kYTU5MWZkMDZhYmIiLCJ0eXBlIjoiYWNjZXNzIiwic3ViIjoiSU5URVJOQUwiLCJuYmYiOjE3MzQzMjY0NTYsImV4cCI6MTc2NTg2MjQ1NiwidXNlcklkIjoiSU5URVJOQUxfREVGQVVMVF92YXJ1biIsImVtYWlsIjoidmFydW5AYXF1YWdlbi5jb20iLCJ1c2VybmFtZSI6InZhcnVuIiwibG9naW5UeXBlIjoiQURNSU5fREVGQVVMVCIsInJvbGUiOiJ1c2VyIiwicGVybWlzc2lvbnMiOlsiU1VQRVJfVVNFUiJdfQ.GsEQUEHCyvAHgvcUDbrZfIclUQqoB6Z61Q8IltLqjiA',
                        targetIndustryId: industryId,
                        categoryId: category.standardCategoryId,
                        subCategoryId: subCategory.id,
                    },
                }
            );

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Category updated successfully!',
                });
                onSuccess();
                onOpenChange(false);
            } else {
                throw new Error('Failed to update category');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update category. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnitToggle = (unitId: string, checked: boolean) => {
        if (checked) {
            setSelectedUnits((prev) => [...prev, unitId]);
        } else {
            setSelectedUnits((prev) => prev.filter((id) => id !== unitId));
        }
    };

    if (!category || !subCategory) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-md max-h-[80vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Edit Category</DialogTitle>
                    <DialogDescription>
                        Manage units for {category.displayName} -{' '}
                        {subCategory.displayName}
                        {category.standardCategoryId === 'SOURCE_CATEGORY' && (
                            <div className='text-sm text-muted-foreground mt-1'>
                                Virtual units can also be added to source
                                category
                            </div>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className='space-y-4'>
                        <div>
                            <Label className='text-sm font-medium'>
                                Category: {category.displayName}
                            </Label>
                            <p className='text-sm text-muted-foreground'>
                                Sub-category: {subCategory.displayName}
                            </p>
                        </div>

                        <div className='space-y-3'>
                            <Label className='text-sm font-medium'>
                                Select Units:
                            </Label>
                            {categoryUnits.length > 0 ? (
                                <div className='space-y-2 max-h-40 overflow-y-auto'>
                                    {categoryUnits.map((unit) => (
                                        <div
                                            key={unit.unitId}
                                            className='flex items-center space-x-2'
                                        >
                                            <Checkbox
                                                id={unit.unitId}
                                                checked={selectedUnits.includes(
                                                    unit.unitId
                                                )}
                                                onCheckedChange={(checked) =>
                                                    handleUnitToggle(
                                                        unit.unitId,
                                                        checked as boolean
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor={unit.unitId}
                                                className='text-sm'
                                            >
                                                {unit.unitName} ({unit.unitId})
                                                {unit.standardCategoryId ===
                                                    'VIRTUAL_CATEGORY' && (
                                                    <span className='text-xs text-blue-600 ml-1'>
                                                        [Virtual]
                                                    </span>
                                                )}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className='text-sm text-muted-foreground'>
                                    No units available for this category.
                                </p>
                            )}
                        </div>
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
                            {isLoading ? 'Updating...' : 'Update Category'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
