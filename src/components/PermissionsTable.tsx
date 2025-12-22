
import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Edit, Users, Settings } from 'lucide-react';
import { logApiCall } from '@/utils/apiLogger';

interface User {
    id: string;
    userId: string;
    username: string;
    email: string;
    phoneNo: string;
    industryId: string;
    type: string;
    active: boolean;
    permissions?: string[] | string | null;
}

interface PermissionsTableProps {
    industryId: string;
}

const AVAILABLE_PERMISSIONS = [
    'WATER_BALANCE',
    'LANDING_PAGE',
    'ALERTS',
    'AQUAGPT',
    'DAILY_SUMMARY',
    'RWI',
    'RWI_EFFICIENCY_SAVINGS',
    'WATER_NEUTRALITY',
    'EFFICIENCY',
];

export function PermissionsTable({ industryId }: PermissionsTableProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editPermissions, setEditPermissions] = useState<string[]>([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, [industryId]);

    const fetchUsers = async () => {
        try {
            const response = await fetch(
                'https://admin-aquagen-api-bfckdag2aydtegc2.southindia-01.azurewebsites.net/api/admin/user/',
                {
                    headers: {
                        accept: 'application/json',
                        Authorization:
                            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6dHJ1ZSwiaWF0IjoxNzY2Mzg1NTA4LCJqdGkiOiI5NWU3MWQzMi03YzAxLTQ4ZmYtYjJjNi0zZTlmNzE5ZWI4YzUiLCJ0eXBlIjoiYWNjZXNzIiwic3ViIjoiSU5URVJOQUwiLCJuYmYiOjE3NjYzODU1MDgsImV4cCI6MTgyNjg2NTUwOCwidXNlcklkIjoiSU5URVJOQUxfREVGQVVMVF92YXJ1biIsImVtYWlsIjoidmFydW5AYXF1YWdlbi5jb20iLCJ1c2VybmFtZSI6InZhcnVuIiwibG9naW5UeXBlIjoiQURNSU5fREVGQVVMVCIsInJvbGUiOiJ1c2VyIiwicGVybWlzc2lvbnMiOlsiU1VQRVJfVVNFUiIsIkFMRVJUUyIsIkFDQ09VTlRfU0VUVElOR1MiXX0.KCsvr3P2hacGBu0zS7JXJBPbCnBa92PcaYmT9TnOpkk',
                        targetIndustryId: industryId,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setUsers(data.userDetails || []);
            } else {
                throw new Error('Failed to fetch users');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch users. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const normalizePermissions = (permissions: string[] | string | null | undefined): string[] => {
        if (!permissions) return [];
        if (Array.isArray(permissions)) return permissions;
        if (typeof permissions === 'string') return [permissions];
        return [];
    };

    const handleEditPermissions = (user: User) => {
        setSelectedUser(user);
        const userPermissions = normalizePermissions(user.permissions);
        setEditPermissions([...userPermissions]);
        setShowEditDialog(true);
    };

    const handlePermissionChange = (permission: string, checked: boolean) => {
        if (checked) {
            setEditPermissions((prev) => [...prev, permission]);
        } else {
            setEditPermissions((prev) => prev.filter((p) => p !== permission));
        }
    };

    const handleUpdatePermissions = async () => {
        if (!selectedUser) return;
        setIsUpdating(true);

        try {
            const permissionsQuery = editPermissions
                .map((p) => `permissions=${p}`)
                .join('&');
            const apiEndpoint = `https://admin-aquagen-api-bfckdag2aydtegc2.southindia-01.azurewebsites.net/api/admin/user/?userId=${selectedUser.id}&${permissionsQuery}`;
            
            const response = await fetch(apiEndpoint, {
                method: 'PUT',
                headers: {
                    accept: 'application/json',
                    Authorization:
                        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6dHJ1ZSwiaWF0IjoxNzY2Mzg1NTA4LCJqdGkiOiI5NWU3MWQzMi03YzAxLTQ4ZmYtYjJjNi0zZTlmNzE5ZWI4YzUiLCJ0eXBlIjoiYWNjZXNzIiwic3ViIjoiSU5URVJOQUwiLCJuYmYiOjE3NjYzODU1MDgsImV4cCI6MTgyNjg2NTUwOCwidXNlcklkIjoiSU5URVJOQUxfREVGQVVMVF92YXJ1biIsImVtYWlsIjoidmFydW5AYXF1YWdlbi5jb20iLCJ1c2VybmFtZSI6InZhcnVuIiwibG9naW5UeXBlIjoiQURNSU5fREVGQVVMVCIsInJvbGUiOiJ1c2VyIiwicGVybWlzc2lvbnMiOlsiU1VQRVJfVVNFUiIsIkFMRVJUUyIsIkFDQ09VTlRfU0VUVElOR1MiXX0.KCsvr3P2hacGBu0zS7JXJBPbCnBa92PcaYmT9TnOpkk',
                    targetIndustryId: industryId,
                },
            });

            if (response.ok) {
                // Log the API call
                await logApiCall(apiEndpoint, {
                    userId: selectedUser.id,
                    permissions: editPermissions,
                    method: 'PUT',
                    targetIndustryId: industryId
                });

                toast({
                    title: 'Success',
                    description: 'Permissions updated successfully!',
                });
                fetchUsers();
                setShowEditDialog(false);
            } else {
                throw new Error('Failed to update permissions');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update permissions. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return <div className='text-center py-4'>Loading users...</div>;
    }

    return (
        <>
            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Permissions</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => {
                            const userPermissions = normalizePermissions(user.permissions);
                            return (
                                <TableRow key={user.id}>
                                    <TableCell className='font-medium'>
                                        {user.userId}
                                    </TableCell>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant='outline'>
                                            {user.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                user.active
                                                    ? 'default'
                                                    : 'destructive'
                                            }
                                        >
                                            {user.active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className='flex flex-wrap gap-1'>
                                            {userPermissions.length > 0 ? (
                                                <>
                                                    {userPermissions
                                                        .slice(0, 3)
                                                        .map((permission) => (
                                                            <Badge
                                                                key={permission}
                                                                variant='secondary'
                                                                className='text-xs'
                                                            >
                                                                {permission}
                                                            </Badge>
                                                        ))}
                                                    {userPermissions.length >
                                                        3 && (
                                                        <Badge
                                                            variant='outline'
                                                            className='text-xs'
                                                        >
                                                            +
                                                            {userPermissions.length -
                                                                3}{' '}
                                                            more
                                                        </Badge>
                                                    )}
                                                </>
                                            ) : (
                                                <span className='text-sm text-muted-foreground'>
                                                    No permissions
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size='sm'
                                            variant='outline'
                                            onClick={() =>
                                                handleEditPermissions(user)
                                            }
                                        >
                                            <Settings className='h-4 w-4 mr-1' />
                                            Manage
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                {users.length === 0 && (
                    <div className='text-center py-8 text-muted-foreground'>
                        <Users className='mx-auto h-8 w-8 mb-2' />
                        No users found for this industry.
                    </div>
                )}
            </div>

            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                        <DialogTitle>Edit Permissions</DialogTitle>
                        <DialogDescription>
                            Update permissions for {selectedUser?.username}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-4 max-h-60 overflow-y-auto'>
                        {AVAILABLE_PERMISSIONS.map((permission) => (
                            <div
                                key={permission}
                                className='flex items-center space-x-2'
                            >
                                <Checkbox
                                    id={permission}
                                    checked={editPermissions.includes(
                                        permission
                                    )}
                                    onCheckedChange={(checked) =>
                                        handlePermissionChange(
                                            permission,
                                            checked as boolean
                                        )
                                    }
                                />
                                <Label htmlFor={permission} className='text-sm'>
                                    {permission}
                                </Label>
                            </div>
                        ))}
                    </div>

                    <div className='flex justify-end gap-3 pt-4'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => setShowEditDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdatePermissions}
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Updating...' : 'Update Permissions'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
