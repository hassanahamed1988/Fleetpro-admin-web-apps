import { pgTable, text, boolean, integer, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  username: text('username'),
  role: text('role').notNull(),
  status: text('status').notNull(),
  avatarUrl: text('avatar_url'),
  phone: text('phone').notNull(),
  department: text('department').notNull(),
  joinDate: text('join_date').notNull(),
  lastLogin: text('last_login').notNull(),
  mustChangeCredentials: boolean('must_change_credentials').default(false),
  is2faEnabled: boolean('is_2fa_enabled').default(false),
  is2faSetupRequired: boolean('is_2fa_setup_required').default(false),
  totpSecretEncrypted: text('totp_secret_encrypted'),
  passwordHash: text('password_hash'),
  trustedDeviceTokens: jsonb('trusted_device_tokens').default([]),
  devices: jsonb('devices').default([]),
  loginHistory: jsonb('login_history').default([]),
  permissions: jsonb('permissions').notNull()
});

export const vehicles = pgTable('vehicles', {
  id: text('id').primaryKey(),
  plateNumber: text('plate_number').notNull(),
  model: text('model').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull(),
  driverId: text('driver_id'),
  driverName: text('driver_name'),
  fuelType: text('fuel_type').notNull(),
  lastService: text('last_service').notNull(),
  mileage: integer('mileage').notNull()
});

export const activityLogs = pgTable('activity_logs', {
  id: text('id').primaryKey(),
  timestamp: text('timestamp').notNull(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  userEmail: text('user_email').notNull(),
  action: text('action').notNull(),
  category: text('category').notNull(),
  details: text('details').notNull(),
  status: text('status').notNull(),
  ipAddress: text('ip_address').notNull()
});

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  timestamp: text('timestamp').notNull(),
  type: text('type').notNull(),
  read: boolean('read').notNull().default(false),
  category: text('category').notNull()
});

export const appSettings = pgTable('app_settings', {
  id: text('id').primaryKey(),
  appName: text('app_name').notNull(),
  systemEmail: text('system_email').notNull(),
  sessionTimeout: integer('session_timeout').notNull(),
  maintenanceMode: boolean('maintenance_mode').notNull().default(false),
  mfaRequired: boolean('mfa_required').notNull().default(false),
  allowSelfRegistration: boolean('allow_self_registration').notNull().default(true),
  backupFrequency: text('backup_frequency').notNull()
});

export const rolePermissions = pgTable('role_permissions', {
  role: text('role').primaryKey(),
  modules: jsonb('modules').notNull()
});
