
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { rbacManager, Permission } from '@/lib/security/rbac-manager';
import { teamAccessController, TeamResource, TeamAction, TeamRole } from '@/lib/security/team-access-control';
import { apiKeySecurityManager } from '@/lib/security/api-key-security';

interface AccessControlState {
  userPermissions: Permission[];
  isLoading: boolean;
  error: string | null;
}

interface TeamAccessState {
  teamRole: TeamRole | null;
  teamPermissions: Record<TeamResource, TeamAction[]>;
  isLoading: boolean;
}

export const useAccessControl = () => {
  const { user } = useAuth();
  const [state, setState] = useState<AccessControlState>({
    userPermissions: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    if (user) {
      try {
        const permissions = rbacManager.getUserPermissions(user.id);
        setState({
          userPermissions: permissions,
          isLoading: false,
          error: null
        });
      } catch (error: any) {
        setState({
          userPermissions: [],
          isLoading: false,
          error: error.message
        });
      }
    } else {
      setState({
        userPermissions: [],
        isLoading: false,
        error: null
      });
    }
  }, [user]);

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    return rbacManager.hasPermission(user.id, permission);
  }, [user]);

  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    if (!user) return false;
    return rbacManager.hasAnyPermission(user.id, permissions);
  }, [user]);

  const hasAllPermissions = useCallback((permissions: Permission[]): boolean => {
    if (!user) return false;
    return rbacManager.hasAllPermissions(user.id, permissions);
  }, [user]);

  const checkPermissions = useCallback((permissions: Permission[]): Record<Permission, boolean> => {
    if (!user) {
      return permissions.reduce((acc, permission) => {
        acc[permission] = false;
        return acc;
      }, {} as Record<Permission, boolean>);
    }
    return rbacManager.checkPermissions(user.id, permissions);
  }, [user]);

  return {
    ...state,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    checkPermissions
  };
};

export const useTeamAccess = (teamId: string | null) => {
  const { user } = useAuth();
  const [state, setState] = useState<TeamAccessState>({
    teamRole: null,
    teamPermissions: {} as Record<TeamResource, TeamAction[]>,
    isLoading: true
  });

  useEffect(() => {
    const loadTeamAccess = async () => {
      if (!user || !teamId) {
        setState({
          teamRole: null,
          teamPermissions: {} as Record<TeamResource, TeamAction[]>,
          isLoading: false
        });
        return;
      }

      try {
        const { role, permissions } = await teamAccessController.getUserTeamPermissions(user.id, teamId);
        setState({
          teamRole: role,
          teamPermissions: permissions,
          isLoading: false
        });
      } catch (error) {
        console.error('Failed to load team access:', error);
        setState({
          teamRole: null,
          teamPermissions: {} as Record<TeamResource, TeamAction[]>,
          isLoading: false
        });
      }
    };

    loadTeamAccess();
  }, [user, teamId]);

  const canAccessResource = useCallback(async (resource: TeamResource, action: TeamAction): Promise<boolean> => {
    if (!user || !teamId) return false;
    const result = await teamAccessController.checkTeamAccess(user.id, teamId, resource, action);
    return result.allowed;
  }, [user, teamId]);

  const canManageMembers = useCallback(async (): Promise<boolean> => {
    if (!user || !teamId) return false;
    return teamAccessController.canManageTeamMembers(user.id, teamId);
  }, [user, teamId]);

  const canInviteMembers = useCallback(async (): Promise<boolean> => {
    if (!user || !teamId) return false;
    return teamAccessController.canInviteToTeam(user.id, teamId);
  }, [user, teamId]);

  const isTeamOwner = useCallback(async (): Promise<boolean> => {
    if (!user || !teamId) return false;
    return teamAccessController.validateTeamOwnership(user.id, teamId);
  }, [user, teamId]);

  return {
    ...state,
    canAccessResource,
    canManageMembers,
    canInviteMembers,
    isTeamOwner
  };
};

export const useApiKeySecurity = () => {
  const { user } = useAuth();

  const validateApiKey = useCallback(async (apiKey: string) => {
    return apiKeySecurityManager.validateApiKey(apiKey);
  }, []);

  const generateApiKey = useCallback(() => {
    return apiKeySecurityManager.generateSecureApiKey();
  }, []);

  const getApiKeyMetrics = useCallback(async (apiKeyId: string) => {
    return apiKeySecurityManager.getApiKeyMetrics(apiKeyId);
  }, []);

  const revokeApiKey = useCallback(async (apiKeyId: string, reason: string) => {
    return apiKeySecurityManager.revokeApiKey(apiKeyId, reason);
  }, []);

  return {
    validateApiKey,
    generateApiKey,
    getApiKeyMetrics,
    revokeApiKey
  };
};
