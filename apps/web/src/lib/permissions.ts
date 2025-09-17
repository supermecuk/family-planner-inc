import { FamilyMember } from "@repo/shared/types/user";

/**
 * Check if a user has permission to perform an action
 */
export const hasPermission = (
  userRole: string | null,
  requiredRoles: string[]
): boolean => {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
};

/**
 * Check if user can manage invites (create, revoke)
 */
export const canManageInvites = (userRole: string | null): boolean => {
  return hasPermission(userRole, ["owner", "editor"]);
};

/**
 * Check if user can approve tasks
 */
export const canApproveTasks = (userRole: string | null): boolean => {
  return hasPermission(userRole, ["owner", "approver"]);
};

/**
 * Check if user can edit tasks
 */
export const canEditTasks = (userRole: string | null): boolean => {
  return hasPermission(userRole, ["owner", "editor"]);
};

/**
 * Check if user can view tasks
 */
export const canViewTasks = (userRole: string | null): boolean => {
  return hasPermission(userRole, ["owner", "editor", "approver", "viewer"]);
};

/**
 * Get role hierarchy level (higher number = more permissions)
 */
export const getRoleLevel = (role: string): number => {
  const levels: Record<string, number> = {
    viewer: 1,
    approver: 2,
    editor: 3,
    owner: 4,
  };
  return levels[role] || 0;
};

/**
 * Check if user role is higher than or equal to required role
 */
export const hasRoleOrHigher = (
  userRole: string | null,
  requiredRole: string
): boolean => {
  if (!userRole) return false;
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
};
