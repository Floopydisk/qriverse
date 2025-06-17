
export type Permission = 
  | 'qr:create' | 'qr:read' | 'qr:update' | 'qr:delete'
  | 'team:create' | 'team:read' | 'team:update' | 'team:delete'
  | 'team:invite' | 'team:manage_members'
  | 'api:create' | 'api:read' | 'api:delete'
  | 'webhook:create' | 'webhook:read' | 'webhook:update' | 'webhook:delete'
  | 'analytics:read' | 'admin:access' | 'admin:manage_users';

export type Role = 'super_admin' | 'admin' | 'team_owner' | 'team_admin' | 'team_manager' | 'team_member' | 'user' | 'guest';

interface RoleDefinition {
  name: Role;
  permissions: Permission[];
  inherits?: Role[];
}

class RBACManager {
  private roles: Map<Role, RoleDefinition> = new Map();
  private userRoles: Map<string, Role[]> = new Map();
  private userPermissions: Map<string, Permission[]> = new Map();

  constructor() {
    this.initializeRoles();
  }

  private initializeRoles() {
    // Define role hierarchy and permissions
    const roleDefinitions: RoleDefinition[] = [
      {
        name: 'guest',
        permissions: []
      },
      {
        name: 'user',
        permissions: [
          'qr:create', 'qr:read', 'qr:update', 'qr:delete',
          'api:create', 'api:read', 'api:delete',
          'webhook:create', 'webhook:read', 'webhook:update', 'webhook:delete',
          'analytics:read'
        ]
      },
      {
        name: 'team_member',
        permissions: ['team:read'],
        inherits: ['user']
      },
      {
        name: 'team_manager',
        permissions: ['team:update', 'team:invite'],
        inherits: ['team_member']
      },
      {
        name: 'team_admin',
        permissions: ['team:manage_members'],
        inherits: ['team_manager']
      },
      {
        name: 'team_owner',
        permissions: ['team:create', 'team:delete'],
        inherits: ['team_admin']
      },
      {
        name: 'admin',
        permissions: ['admin:access'],
        inherits: ['team_owner']
      },
      {
        name: 'super_admin',
        permissions: ['admin:manage_users'],
        inherits: ['admin']
      }
    ];

    roleDefinitions.forEach(role => {
      this.roles.set(role.name, role);
    });
  }

  // Get all permissions for a role (including inherited)
  getRolePermissions(role: Role): Permission[] {
    const roleDefinition = this.roles.get(role);
    if (!roleDefinition) return [];

    let permissions = [...roleDefinition.permissions];

    // Add inherited permissions
    if (roleDefinition.inherits) {
      roleDefinition.inherits.forEach(inheritedRole => {
        permissions.push(...this.getRolePermissions(inheritedRole));
      });
    }

    // Remove duplicates
    return [...new Set(permissions)];
  }

  // Assign role to user
  assignRole(userId: string, role: Role): void {
    const currentRoles = this.userRoles.get(userId) || [];
    if (!currentRoles.includes(role)) {
      currentRoles.push(role);
      this.userRoles.set(userId, currentRoles);
      this.updateUserPermissions(userId);
    }
  }

  // Remove role from user
  removeRole(userId: string, role: Role): void {
    const currentRoles = this.userRoles.get(userId) || [];
    const updatedRoles = currentRoles.filter(r => r !== role);
    this.userRoles.set(userId, updatedRoles);
    this.updateUserPermissions(userId);
  }

  // Get user roles
  getUserRoles(userId: string): Role[] {
    return this.userRoles.get(userId) || ['user']; // Default to 'user' role
  }

  // Update user permissions based on roles
  private updateUserPermissions(userId: string): void {
    const roles = this.getUserRoles(userId);
    let permissions: Permission[] = [];

    roles.forEach(role => {
      permissions.push(...this.getRolePermissions(role));
    });

    // Remove duplicates
    permissions = [...new Set(permissions)];
    this.userPermissions.set(userId, permissions);
  }

  // Check if user has permission
  hasPermission(userId: string, permission: Permission): boolean {
    const userPermissions = this.userPermissions.get(userId);
    if (!userPermissions) {
      this.updateUserPermissions(userId);
      return this.userPermissions.get(userId)?.includes(permission) || false;
    }
    return userPermissions.includes(permission);
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(userId: string, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(userId, permission));
  }

  // Check if user has all specified permissions
  hasAllPermissions(userId: string, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(userId, permission));
  }

  // Check if user has role
  hasRole(userId: string, role: Role): boolean {
    return this.getUserRoles(userId).includes(role);
  }

  // Check if user has minimum role level
  hasMinimumRole(userId: string, minimumRole: Role): boolean {
    const userRoles = this.getUserRoles(userId);
    const roleHierarchy: Role[] = ['guest', 'user', 'team_member', 'team_manager', 'team_admin', 'team_owner', 'admin', 'super_admin'];
    
    const minimumLevel = roleHierarchy.indexOf(minimumRole);
    return userRoles.some(role => roleHierarchy.indexOf(role) >= minimumLevel);
  }

  // Get user permissions
  getUserPermissions(userId: string): Permission[] {
    const permissions = this.userPermissions.get(userId);
    if (!permissions) {
      this.updateUserPermissions(userId);
      return this.userPermissions.get(userId) || [];
    }
    return permissions;
  }

  // Create permission check middleware for API calls
  createPermissionMiddleware(requiredPermission: Permission) {
    return (userId: string): boolean => {
      return this.hasPermission(userId, requiredPermission);
    };
  }

  // Batch permission check
  checkPermissions(userId: string, permissions: Permission[]): Record<Permission, boolean> {
    const result: Record<Permission, boolean> = {} as Record<Permission, boolean>;
    permissions.forEach(permission => {
      result[permission] = this.hasPermission(userId, permission);
    });
    return result;
  }
}

export const rbacManager = new RBACManager();
