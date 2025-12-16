
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import { logApiCall } from '@/utils/apiLogger';

interface EditIndustryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    industryData: any;
    onSuccess: () => void;
}

export function EditIndustryDialog({
    open,
    onOpenChange,
    industryData,
    onSuccess,
}: EditIndustryDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        industryName: '',
        shiftName: '',
        startAt: '',
        endAt: '',
        reportsEnabled: false,
        reportsEmailIds: [] as string[],
        alertsEnabled: false,
        alertsEmailIds: [] as string[],
        subscriptionEndDate: '',
        subscriptionEmailIds: [] as string[],
    });
    const [newReportEmail, setNewReportEmail] = useState('');
    const [newAlertEmail, setNewAlertEmail] = useState('');
    const [newSubscriptionEmail, setNewSubscriptionEmail] = useState('');
    const { toast } = useToast();

    // Reset form data when dialog opens/closes or industry data changes
    useEffect(() => {
        if (open && industryData) {
            setFormData({
                industryName: industryData.industryName || '',
                shiftName: industryData.meta?.shift?.shiftName || '',
                startAt: industryData.meta?.shift?.startAt || '',
                endAt: industryData.meta?.shift?.endAt || '',
                reportsEnabled: industryData.meta?.reports?.enabled || false,
                reportsEmailIds: industryData.meta?.reports?.emailIds || [],
                alertsEnabled:
                    industryData.meta?.alerts?.email?.enabled || false,
                alertsEmailIds:
                    industryData.meta?.alerts?.email?.emailIds || [],
                subscriptionEndDate:
                    industryData.meta?.subscription?.endDate || '',
                subscriptionEmailIds:
                    industryData.meta?.subscription?.emailIds || [],
            });
            // Clear new email inputs
            setNewReportEmail('');
            setNewAlertEmail('');
            setNewSubscriptionEmail('');
        }
    }, [open, industryData]);

    const handleCancel = () => {
        // Reset form to original data
        if (industryData) {
            setFormData({
                industryName: industryData.industryName || '',
                shiftName: industryData.meta?.shift?.shiftName || '',
                startAt: industryData.meta?.shift?.startAt || '',
                endAt: industryData.meta?.shift?.endAt || '',
                reportsEnabled: industryData.meta?.reports?.enabled || false,
                reportsEmailIds: industryData.meta?.reports?.emailIds || [],
                alertsEnabled:
                    industryData.meta?.alerts?.email?.enabled || false,
                alertsEmailIds:
                    industryData.meta?.alerts?.email?.emailIds || [],
                subscriptionEndDate:
                    industryData.meta?.subscription?.endDate || '',
                subscriptionEmailIds:
                    industryData.meta?.subscription?.emailIds || [],
            });
            setNewReportEmail('');
            setNewAlertEmail('');
            setNewSubscriptionEmail('');
        }
        onOpenChange(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!industryData) return;

        setIsLoading(true);

        try {
            const updateData = {
                industryDetails: {
                    ...industryData,
                    industryName: formData.industryName,
                    meta: {
                        ...industryData.meta,
                        shift: {
                            shiftName: formData.shiftName,
                            startAt: formData.startAt,
                            endAt: formData.endAt,
                        },
                        reports: {
                            enabled: formData.reportsEnabled,
                            emailIds: formData.reportsEmailIds,
                            services:
                                industryData.meta?.reports?.services || {},
                        },
                        alerts: {
                            email: {
                                enabled: formData.alertsEnabled,
                                emailIds: formData.alertsEmailIds,
                            },
                        },
                        subscription: {
                            endDate: formData.subscriptionEndDate,
                            emailIds: formData.subscriptionEmailIds,
                        },
                    },
                },
            };

            const apiEndpoint = 'https://admin-aquagen-api-bfckdag2aydtegc2.southindia-01.azurewebsites.net/api/admin/industry/';

            const response = await fetch(apiEndpoint, {
                method: 'PUT',
                headers: {
                    accept: 'application/json',
                    Authorization:
                        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6dHJ1ZSwiaWF0IjoxNzY1ODcyMDk5LCJqdGkiOiIxM2IzNjgyZS1jNTBlLTRlOTQtYTQ1Yi04ODQwNTQ5MWU0YjIiLCJ0eXBlIjoiYWNjZXNzIiwic3ViIjoiSU5URVJOQUwiLCJuYmYiOjE3NjU4NzIwOTksImV4cCI6MTgzMDY3MjA5OSwidXNlcklkIjoiSU5URVJOQUxfREVGQVVMVF92YXJ1biIsImVtYWlsIjoidmFydW5AYXF1YWdlbi5jb20iLCJ1c2VybmFtZSI6InZhcnVuIiwibG9naW5UeXBlIjoiQURNSU5fREVGQVVMVCIsInJvbGUiOiJ1c2VyIiwicGVybWlzc2lvbnMiOlsiU1VQRVJfVVNFUiIsIkFMRVJUUyIsIkFDQ09VTlRfU0VUVElOR1MiXX0.II4LBKgTOffmj3nRwlc5ce25VJ4pK4hieML1ZNrt_DQ',
                    targetIndustryId: industryData.industryId,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (response.ok) {
                // Log the API call
                await logApiCall(apiEndpoint, {
                    method: 'PUT',
                    targetIndustryId: industryData.industryId,
                    updateData: updateData,
                });

                toast({
                    title: 'Success',
                    description: 'Industry details updated successfully!',
                });
                onSuccess();
                onOpenChange(false);
            } else {
                throw new Error('Failed to update industry details');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description:
                    'Failed to update industry details. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const addEmail = (type: 'reports' | 'alerts' | 'subscription') => {
        const emailInput =
            type === 'reports'
                ? newReportEmail
                : type === 'alerts'
                ? newAlertEmail
                : newSubscriptionEmail;

        if (!emailInput.trim()) return;

        const fieldName = `${type}EmailIds` as keyof typeof formData;
        const currentEmails = formData[fieldName] as string[];

        if (!currentEmails.includes(emailInput.trim())) {
            setFormData((prev) => ({
                ...prev,
                [fieldName]: [...currentEmails, emailInput.trim()],
            }));
        }

        // Clear the input
        if (type === 'reports') setNewReportEmail('');
        else if (type === 'alerts') setNewAlertEmail('');
        else setNewSubscriptionEmail('');
    };

    const removeEmail = (
        type: 'reports' | 'alerts' | 'subscription',
        email: string
    ) => {
        const fieldName = `${type}EmailIds` as keyof typeof formData;
        const currentEmails = formData[fieldName] as string[];

        setFormData((prev) => ({
            ...prev,
            [fieldName]: currentEmails.filter((e) => e !== email),
        }));
    };

    if (!industryData) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-2xl max-h-[80vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Edit Industry Details</DialogTitle>
                    <DialogDescription>
                        Update the industry configuration and settings.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className='space-y-6'>
                    {/* Basic Details */}
                    <div className='space-y-4'>
                        <h3 className='text-lg font-medium'>
                            Basic Information
                        </h3>
                        <div className='space-y-2'>
                            <Label htmlFor='industryName'>Industry Name</Label>
                            <Input
                                id='industryName'
                                name='industryName'
                                value={formData.industryName}
                                onChange={handleInputChange}
                                placeholder='Enter industry name'
                                required
                            />
                        </div>
                    </div>

                    {/* Shift Details */}
                    <div className='space-y-4'>
                        <h3 className='text-lg font-medium'>
                            Shift Configuration
                        </h3>
                        <div className='space-y-2'>
                            <Label htmlFor='shiftName'>Shift Name</Label>
                            <Input
                                id='shiftName'
                                name='shiftName'
                                value={formData.shiftName}
                                onChange={handleInputChange}
                                placeholder='Enter shift name'
                            />
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='startAt'>
                                    Start Time (HH:MM:SS)
                                </Label>
                                <Input
                                    id='startAt'
                                    name='startAt'
                                    value={formData.startAt}
                                    onChange={handleInputChange}
                                    placeholder='00:00:00'
                                    pattern='^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='endAt'>
                                    End Time (HH:MM:SS)
                                </Label>
                                <Input
                                    id='endAt'
                                    name='endAt'
                                    value={formData.endAt}
                                    onChange={handleInputChange}
                                    placeholder='00:00:00'
                                    pattern='^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
                                />
                            </div>
                        </div>
                    </div>

                    {/* Reports Configuration */}
                    <div className='space-y-4'>
                        <h3 className='text-lg font-medium'>
                            Reports Configuration
                        </h3>
                        <div className='flex items-center space-x-2'>
                            <Checkbox
                                id='reportsEnabled'
                                checked={formData.reportsEnabled}
                                onCheckedChange={(checked) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        reportsEnabled: checked as boolean,
                                    }))
                                }
                            />
                            <Label htmlFor='reportsEnabled'>
                                Enable Reports
                            </Label>
                        </div>

                        <div className='space-y-2'>
                            <Label>Report Email IDs</Label>
                            <p className='text-xs text-muted-foreground mb-2'>
                                Enter email addresses to receive automated reports. Press the + button to add each email ID.
                            </p>
                            <div className='flex gap-2'>
                                <Input
                                    value={newReportEmail}
                                    onChange={(e) =>
                                        setNewReportEmail(e.target.value)
                                    }
                                    placeholder='Enter email ID'
                                    type='email'
                                />
                                <Button
                                    type='button'
                                    onClick={() => addEmail('reports')}
                                    size='sm'
                                    title='Add email ID'
                                >
                                    <Plus className='h-4 w-4' />
                                </Button>
                            </div>
                            <div className='flex flex-wrap gap-2'>
                                {formData.reportsEmailIds.map(
                                    (email, index) => (
                                        <div
                                            key={index}
                                            className='flex items-center gap-1 bg-gray-100 px-2 py-1 rounded'
                                        >
                                            <span className='text-sm'>
                                                {email}
                                            </span>
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='sm'
                                                onClick={() =>
                                                    removeEmail(
                                                        'reports',
                                                        email
                                                    )
                                                }
                                                className='h-4 w-4 p-0'
                                            >
                                                <Trash2 className='h-3 w-3' />
                                            </Button>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Alerts Configuration */}
                    <div className='space-y-4'>
                        <h3 className='text-lg font-medium'>
                            Alerts Configuration
                        </h3>
                        <div className='flex items-center space-x-2'>
                            <Checkbox
                                id='alertsEnabled'
                                checked={formData.alertsEnabled}
                                onCheckedChange={(checked) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        alertsEnabled: checked as boolean,
                                    }))
                                }
                            />
                            <Label htmlFor='alertsEnabled'>
                                Enable Email Alerts
                            </Label>
                        </div>

                        <div className='space-y-2'>
                            <Label>Alert Email IDs</Label>
                            <p className='text-xs text-muted-foreground mb-2'>
                                Enter email addresses to receive system alerts and notifications. Press the + button to add each email ID.
                            </p>
                            <div className='flex gap-2'>
                                <Input
                                    value={newAlertEmail}
                                    onChange={(e) =>
                                        setNewAlertEmail(e.target.value)
                                    }
                                    placeholder='Enter email ID'
                                    type='email'
                                />
                                <Button
                                    type='button'
                                    onClick={() => addEmail('alerts')}
                                    size='sm'
                                    title='Add email ID'
                                >
                                    <Plus className='h-4 w-4' />
                                </Button>
                            </div>
                            <div className='flex flex-wrap gap-2'>
                                {formData.alertsEmailIds.map((email, index) => (
                                    <div
                                        key={index}
                                        className='flex items-center gap-1 bg-gray-100 px-2 py-1 rounded'
                                    >
                                        <span className='text-sm'>{email}</span>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            size='sm'
                                            onClick={() =>
                                                removeEmail('alerts', email)
                                            }
                                            className='h-4 w-4 p-0'
                                        >
                                            <Trash2 className='h-3 w-3' />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Subscription Configuration */}
                    <div className='space-y-4'>
                        <h3 className='text-lg font-medium'>
                            Subscription Configuration
                        </h3>
                        <div className='space-y-2'>
                            <Label htmlFor='subscriptionEndDate'>
                                End Date (YYYY-MM-DD)
                            </Label>
                            <Input
                                id='subscriptionEndDate'
                                name='subscriptionEndDate'
                                type='date'
                                value={formData.subscriptionEndDate}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>Subscription Email IDs</Label>
                            <p className='text-xs text-muted-foreground mb-2'>
                                Enter email addresses to receive subscription-related notifications. Press the + button to add each email ID.
                            </p>
                            <div className='flex gap-2'>
                                <Input
                                    value={newSubscriptionEmail}
                                    onChange={(e) =>
                                        setNewSubscriptionEmail(e.target.value)
                                    }
                                    placeholder='Enter email ID'
                                    type='email'
                                />
                                <Button
                                    type='button'
                                    onClick={() => addEmail('subscription')}
                                    size='sm'
                                    title='Add email ID'
                                >
                                    <Plus className='h-4 w-4' />
                                </Button>
                            </div>
                            <div className='flex flex-wrap gap-2'>
                                {formData.subscriptionEmailIds.map(
                                    (email, index) => (
                                        <div
                                            key={index}
                                            className='flex items-center gap-1 bg-gray-100 px-2 py-1 rounded'
                                        >
                                            <span className='text-sm'>
                                                {email}
                                            </span>
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='sm'
                                                onClick={() =>
                                                    removeEmail(
                                                        'subscription',
                                                        email
                                                    )
                                                }
                                                className='h-4 w-4 p-0'
                                            >
                                                <Trash2 className='h-3 w-3' />
                                            </Button>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-end gap-3 pt-4'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button type='submit' disabled={isLoading}>
                            {isLoading ? 'Updating...' : 'Update Industry'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
