
import { supabase } from '@/integrations/supabase/client';
import { rbacManager, Permission, Role } from './rbac-manager';
import { auditLogger } from './audit-logger';

export type TeamRole = 'owner' | 'admin' | 'manager' | 'member';
export type TeamResource = 'qr_codes' | 'folders' | 'members' | 'invitations' | 'settings';
export type TeamAction = 'create' | 'read' | 'update' | 'delete' | 'invite' | 'manage';

interface TeamPermissionMatrix {
  [key: string]: {
    [resource in TeamResource]?: TeamAction[];
  };
}

interface TeamAccessResult {
  allowed: boolean;
  reason?: string;
  requiredRole?: TeamRole;
}

class TeamAccessController {
  private permissionMatrix: TeamPermissionMatrix = {
    owner: {
      qr_codes: ['create', 'read', 'update', 'delete'],
      folders: ['create', 'read', 'update', 'delete'],
      members: ['read', 'invite', 'manage', 'delete'],
      invitations: ['create', 'read', 'delete'],
      settings: ['read', 'update', 'delete']
    },
    admin: {
      qr_codes: ['create', 'read', 'update', 'delete'],
      folders: ['create', 'read', 'update', 'delete'],
      members: ['read', 'invite', 'manage'],
      invitations: ['create', 'read', 'delete'],
      settings: ['read', 'update']
    },
    manager: {
      qr_codes: ['create', 'read', 'update', 'delete'],
      folders: ['create', 'read', 'update', 'delete'],
      members: ['read', 'invite'],
      invitations: ['create', 'read'],
      settings: ['read']
    },
    member: {
      qr_codes: ['create', 'read', 'update', 'delete'],
      folders: ['create', 'read', 'update'],
      members: ['read'],
      invitations: ['read'],
      settings: ['read']
    }
  };

  // Check if user has access to perform action on team resource
  async checkTeamAccess(
    userId: string,
    teamId: string,
    resource: TeamResource,
    action: TeamAction
  ): Promise<TeamAccessResult> {
    try {
      // Get user's role in the team
      const userRole = await this.getUserTeamRole(userId, teamId);
      
      if (!userRole) {
        auditLogger.log('privilege_escalation_attempt', {
          userId,
          teamId,
          resource,
          action,
          reason: 'User not member of team'
        }, 'high');

        return {
          allowed: false,
          reason: 'User is not a member of this team'
        };
      }

      // Check if the role has permission for this action on this resource
      const rolePermissions = this.permissionMatrix[userRole];
      const resourceActions = rolePermissions?.[resource] || [];

      if (!resourceActions.includes(action)) {
        auditLogger.log('privilege_escalation_attempt', {
          userId,
          teamId,
          resource,
          action,
          userRole,
          reason: 'Insufficient permissions'
        }, 'medium');

        return {
          allowed: false,
          reason: `Role '${userRole}' does not have '${action}' permission for '${resource}'`,
          requiredRole: this.getMinimumRoleForAction(resource, action)
        };
      }

      // Log successful access
      auditLogger.log('api_request', {
        userId,
        teamId,
        resource,
        action,
        userRole,
        success: true
      }, 'low');

      return { allowed: true };

    } catch (error: any) {
      auditLogger.log('privilege_escalation_attempt', {
        userId,
        teamId,
        resource,
        action,
        error: error.message
      }, 'high');

      return {
        allowed: false,
        reason: 'Access check failed'
      };
    }
  }

  // Get user's role in a specific team
  async getUserTeamRole(userId: string, teamId: string): Promise<TeamRole | null> {
    try {
      const { data, error } = await supabase
        .from('team_memberships')
        .select('role')
        .eq('user_id', userId)
        .eq('team_id', teamId)
        .not('joined_at', 'is', null)
        .single();

      if (error || !data) {
        return null;
      }

      return data.role as TeamRole;
    } catch (error) {
      console.error('Failed to get user team role:', error);
      return null;
    }
  }

  // Get minimum role required for an action
  private getMinimumRoleForAction(resource: TeamResource, action: TeamAction): TeamRole | undefined {
    const roles: TeamRole[] = ['member', 'manager', 'admin', 'owner'];
    
    for (const role of roles) {
      const permissions = this.permissionMatrix[role];
      if (permissions?.[resource]?.includes(action)) {
        return role;
      }
    }
    
    return undefined;
  }

  // Check if user can access team QR codes
  async canAccessTeamQRCodes(userId: string, teamId: string, action: TeamAction = 'read'): Promise<boolean> {
    const result = await this.checkTeamAccess(userId, teamId, 'qr_codes', action);
    return result.allowed;
  }

  // Check if user can manage team members
  async canManageTeamMembers(userId: string, teamId: string): Promise<boolean> {
    const result = await this.checkTeamAccess(userId, teamId, 'members', 'manage');
    return result.allowed;
  }

  // Check if user can invite to team
  async canInviteToTeam(userId: string, teamId: string): Promise<boolean> {
    const result = await this.checkTeamAccess(userId, teamId, 'members', 'invite');
    return result.allowed;
  }

  // Get user's effective permissions in team
  async getUserTeamPermissions(userId: string, teamId: string): Promise<{
    role: TeamRole | null;
    permissions: Record<TeamResource, TeamAction[]>;
  }> {
    const role = await this.getUserTeamRole(userId, teamId);
    
    if (!role) {
      return {
        role: null,
        permissions: {} as Record<TeamResource, TeamAction[]>
      };
    }

    const permissions = this.permissionMatrix[role] || {};
    
    return {
      role,
      permissions: permissions as Record<TeamResource, TeamAction[]>
    };
  }

  // Batch check multiple permissions
  async checkMultipleTeamAccess(
    userId: string,
    teamId: string,
    checks: Array<{ resource: TeamResource; action: TeamAction }>
  ): Promise<Record<string, TeamAccessResult>> {
    const results: Record<string, TeamAccessResult> = {};
    
    await Promise.all(
      checks.map(async ({ resource, action }) => {
        const key = `${resource}:${action}`;
        results[key] = await this.checkTeamAccess(userId, teamId, resource, action);
      })
    );
    
    return results;
  }

  // Create team access middleware
  createTeamAccessMiddleware(resource: TeamResource, action: TeamAction) {
    return async (userId: string, teamId: string): Promise<boolean> => {
      const result = await this.checkTeamAccess(userId, teamId, resource, action);
      return result.allowed;
    };
  }

  // Validate team ownership
  async validateTeamOwnership(userId: string, teamId: string): Promise<boolean> {
    const role = await this.getUserTeamRole(userId, teamId);
    return role === 'owner';
  }

  // Get teams user has access to with specific permission
  async getAccessibleTeams(userId: string, resource: TeamResource, action: TeamAction): Promise<string[]> {
    try {
      const { data: memberships, error } = await supabase
        .from('team_memberships')
        .select('team_id, role')
        .eq('user_id', userId)
        .not('joined_at', 'is', null);

      if (error || !memberships) {
        return [];
      }

      const accessibleTeams: string[] = [];

      for (const membership of memberships) {
        const rolePermissions = this.permissionMatrix[membership.role as TeamRole];
        const resourceActions = rolePermissions?.[resource] || [];

        if (resourceActions.includes(action)) {
          accessibleTeams.push(membership.team_id);
        }
      }

      return accessibleTeams;
    } catch (error) {
      console.error('Failed to get accessible teams:', error);
      return [];
    }
  }
}

export const teamAccessController = new TeamAccessController();
