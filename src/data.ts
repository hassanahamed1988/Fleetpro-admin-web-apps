/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Vehicle, ActivityLog, SystemNotification, AppSettings, RolePermission } from './types';

// Clean initial state without mock / demo entries
export const initialUsers: User[] = [
  {
    id: 'USR-000',
    name: 'Admin Owner',
    email: 'adminownerhassan@gmail.com',
    role: 'Admin Owner',
    status: 'Active',
    phone: '+880 1700-000000',
    department: 'Executive Owner',
    joinDate: new Date().toISOString().split('T')[0],
    lastLogin: 'Today',
    permissions: { dashboard: true, users: true, vehicles: false, settings: true, auditLogs: true }
  }
];

export const initialVehicles: Vehicle[] = [];

export const initialActivityLogs: ActivityLog[] = [];

export const initialNotifications: SystemNotification[] = [];

export const initialAppSettings: AppSettings = {
  appName: 'FLEETPRO MANAGEMENT',
  systemEmail: 'adminownerhassan@gmail.com',
  sessionTimeout: 30,
  maintenanceMode: false,
  mfaRequired: true,
  allowSelfRegistration: true,
  backupFrequency: 'Daily'
};

export const initialRolePermissions: RolePermission[] = [
  {
    role: 'Admin Owner',
    modules: {
      dashboard: 'write',
      users: 'write',
      vehicles: 'none',
      settings: 'write',
      auditLogs: 'read'
    }
  },
  {
    role: 'Super Admin',
    modules: {
      dashboard: 'write',
      users: 'write',
      vehicles: 'write',
      settings: 'write',
      auditLogs: 'write'
    }
  },
  {
    role: 'Admin',
    modules: {
      dashboard: 'write',
      users: 'write',
      vehicles: 'write',
      settings: 'read',
      auditLogs: 'read'
    }
  },
  {
    role: 'Manager',
    modules: {
      dashboard: 'read',
      users: 'read',
      vehicles: 'write',
      settings: 'none',
      auditLogs: 'none'
    }
  },
  {
    role: 'Operator',
    modules: {
      dashboard: 'read',
      users: 'none',
      vehicles: 'read',
      settings: 'none',
      auditLogs: 'none'
    }
  },
  {
    role: 'Users',
    modules: {
      dashboard: 'read',
      users: 'none',
      vehicles: 'none',
      settings: 'none',
      auditLogs: 'none'
    }
  }
];

