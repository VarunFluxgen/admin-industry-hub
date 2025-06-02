
export type Permission = 'SUPER_USER' | 'ADMIN' | 'USER' | 'ALERTS';

export const hasPermission = (userPermissions: string[], requiredPermission: Permission): boolean => {
  return userPermissions.includes(requiredPermission);
};

export const isAdmin = (userPermissions: string[]): boolean => {
  return hasPermission(userPermissions, 'SUPER_USER') || hasPermission(userPermissions, 'ADMIN');
};

export const canEditAll = (userPermissions: string[]): boolean => {
  return isAdmin(userPermissions);
};

export const canOnlyEditUnitMeta = (userPermissions: string[]): boolean => {
  return hasPermission(userPermissions, 'USER') && !isAdmin(userPermissions);
};
