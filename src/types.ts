/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Admin Owner' | 'Super Admin' | 'Admin' | 'Manager' | 'Operator' | 'Users';

export type UserStatus = 'Active' | 'Inactive' | 'Pending' | 'Blocked';

export interface UserDeviceRecord {
  id: string;
  deviceName: string;
  deviceType: 'Mobile (Android)' | 'Mobile (iOS)' | 'Desktop (Web)' | 'Tablet (iPad)' | 'Desktop (App)' | 'Other';
  deviceIdentifier: string;
  ipAddress: string;
  location?: string;
  firstLogin: string;
  lastActive: string;
  status: 'Approved' | 'Pending' | 'Revoked';
  browserOrApp?: string;
}

export interface UserLoginHistoryRecord {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  deviceName: string;
  deviceType: string;
  ipAddress: string;
  location?: string;
  status: 'Success' | 'Failed' | 'Blocked' | 'MFA Challenge';
  browserOrApp?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  phone: string;
  department: string;
  joinDate: string;
  lastLogin: string;
  mustChangeCredentials?: boolean;
  is2faEnabled?: boolean;
  is2faSetupRequired?: boolean;
  totpSecretEncrypted?: string;
  passwordHash?: string;
  trustedDeviceTokens?: string[];
  devices?: UserDeviceRecord[];
  loginHistory?: UserLoginHistoryRecord[];
  permissions: {
    dashboard: boolean;
    users: boolean;
    vehicles: boolean;
    settings: boolean;
    auditLogs: boolean;
  };
  mobileModulePermissions?: Record<string, boolean>;
  adminOwnerId?: string;
  createdBy?: string;
  accountType?: 'MOBILE_APP' | 'ADMIN_PANEL';
  [key: string]: any;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  type: 'Truck' | 'Sedan' | 'SUV' | 'Van' | 'Motorcycle';
  status: 'Active' | 'Maintenance' | 'Inactive';
  driverId?: string;
  driverName?: string;
  fuelType: 'Octane' | 'Diesel' | 'Electric' | 'CNG';
  lastService: string;
  mileage: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  category: 'User Management' | 'Vehicle' | 'Settings' | 'Security' | 'Backup' | 'System';
  details: string;
  status: 'Success' | 'Failed';
  ipAddress: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  category: string;
}

export type ThemeColor = 'blue' | 'emerald' | 'red' | 'amber' | 'purple';

export type DisplayMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  appName: string;
  systemEmail: string;
  sessionTimeout: number; // in minutes
  maintenanceMode: boolean;
  mfaRequired: boolean;
  allowSelfRegistration: boolean;
  backupFrequency: 'Daily' | 'Weekly' | 'Monthly';
}

export interface RolePermission {
  role: UserRole;
  modules: {
    dashboard: 'none' | 'read' | 'write';
    users: 'none' | 'read' | 'write';
    vehicles: 'none' | 'read' | 'write';
    settings: 'none' | 'read' | 'write';
    auditLogs: 'none' | 'read' | 'write';
  };
}
