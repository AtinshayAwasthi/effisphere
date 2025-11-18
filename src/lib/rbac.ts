import { supabase } from './supabase';

interface Permission {
  resource: string;
  actions: string[];
}

interface Role {
  id: string;
  name: string;
  permissions: Record<string, string[] | boolean>;
}

class RBACService {
  private userPermissions: Record<string, string[] | boolean> = {};

  async loadUserPermissions(userId: string): Promise<void> {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select(`
          roles!inner(name, permissions)
        `)
        .eq('user_id', userId);

      // Merge permissions from all roles
      const permissions: Record<string, string[] | boolean> = {};
      
      data?.forEach(userRole => {
        const role = userRole.roles as any;
        Object.entries(role.permissions).forEach(([resource, actions]) => {
          if (actions === true) {
            permissions[resource] = true;
          } else if (Array.isArray(actions)) {
            if (!permissions[resource] || permissions[resource] === true) {
              permissions[resource] = [...actions];
            } else if (Array.isArray(permissions[resource])) {
              permissions[resource] = [...new Set([...(permissions[resource] as string[]), ...actions])];
            }
          }
        });
      });

      this.userPermissions = permissions;
    } catch (error) {
      console.error('Error loading user permissions:', error);
    }
  }

  hasPermission(resource: string, action: string): boolean {
    const resourcePermissions = this.userPermissions[resource];
    
    if (resourcePermissions === true) return true;
    if (Array.isArray(resourcePermissions)) {
      return resourcePermissions.includes(action);
    }
    
    return false;
  }

  async assignRole(userId: string, roleName: string, assignedBy: string): Promise<boolean> {
    try {
      // Get role ID
      const { data: role } = await supabase
        .from('roles')
        .select('id')
        .eq('name', roleName)
        .single();

      if (!role) return false;

      // Assign role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: role.id,
          assigned_by: assignedBy
        });

      return !error;
    } catch (error) {
      return false;
    }
  }

  async logAction(userId: string, action: string, resourceType: string, resourceId?: string, oldValues?: any, newValues?: any): Promise<void> {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          old_values: oldValues,
          new_values: newValues,
          ip_address: '127.0.0.1', // In production, get real IP
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Error logging action:', error);
    }
  }
}

export const rbacService = new RBACService();