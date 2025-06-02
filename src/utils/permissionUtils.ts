
export type UserRole = 'SUPER_USER' | 'ADMIN' | 'USER';

export const hasFullAccess = (permissions: string[]): boolean => {
  return permissions.includes('SUPER_USER') || permissions.includes('ADMIN');
};

export const canOnlyView = (permissions: string[]): boolean => {
  return permissions.includes('USER') && !hasFullAccess(permissions);
};

export const canEditUnitMeta = (permissions: string[]): boolean => {
  // All roles can edit unit meta
  return permissions.includes('USER') || hasFullAccess(permissions);
};
