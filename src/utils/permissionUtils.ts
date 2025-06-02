
export type UserPermission = 'SUPER_USER' | 'ADMIN' | 'USER';

export const hasFullAccess = (permissions: string[]): boolean => {
  return permissions.some(permission => 
    permission === 'SUPER_USER' || permission === 'ADMIN'
  );
};

export const canOnlyViewAndUpdateUnitMeta = (permissions: string[]): boolean => {
  return permissions.includes('USER') && !hasFullAccess(permissions);
};

export const canViewDetails = (permissions: string[]): boolean => {
  return permissions.length > 0; // All authenticated users can view details
};

export const canUpdateUnitMeta = (permissions: string[]): boolean => {
  return permissions.length > 0; // All authenticated users can update unit meta
};

export const canCreateOrEdit = (permissions: string[]): boolean => {
  return hasFullAccess(permissions);
};
