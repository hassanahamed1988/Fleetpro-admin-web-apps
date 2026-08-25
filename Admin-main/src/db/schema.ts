import { pgTable, text, boolean, integer, jsonb, real } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  username: text('username'),
  role: text('role').notNull(), // 'USER' | 'ADMIN' | 'Admin Owner' | 'Users' etc.
  status: text('status').notNull(), // 'Active' | 'Inactive' | 'Pending' | 'Blocked'
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
  permissions: jsonb('permissions').notNull(),

  // Mobile App UserProfile Extensions
  firstName: text('first_name'),
  lastName: text('last_name'),
  loginEmail: text('login_email'),
  mobileNumber: text('mobile_number'),
  idType: text('id_type'),
  idNumber: text('id_number'),
  idIssueCountry: text('id_issue_country'),
  idIssueDate: text('id_issue_date'),
  idExpiryDate: text('id_expiry_date'),
  country: text('country'),
  state: text('state'),
  city: text('city'),
  policeStation: text('police_station'),
  postOffice: text('post_office'),
  postalCode: text('postal_code'),
  addressLine1: text('address_line_1'),
  buildingNumber: text('building_number'),
  zoneNumber: text('zone_number'),
  mobileModulePermissions: jsonb('mobile_module_permissions').default({}),
  adminOwnerId: text('admin_owner_id'),
  createdBy: text('created_by'),
  accountType: text('account_type').default('MOBILE_APP'),
  employeeId: text('employee_id'),
  generatedUserId: text('generated_user_id'),

  // Company Owner & Tenant Mapping Extensions
  companyId: text('company_id'),
  alternativeMobileNumber: text('alternative_mobile_number'),
  dateOfBirth: text('date_of_birth'),
  nationality: text('nationality'),
  nationalId: text('national_id'),
  address: text('address')
});

export const companies = pgTable('companies', {
  id: text('id').primaryKey(),
  companyName: text('company_name').notNull(),
  companyRegistrationNumber: text('company_registration_number'),
  companyType: text('company_type'),
  businessCategory: text('business_category'),
  companyEmail: text('company_email'),
  companyPhone: text('company_phone'),
  alternativePhone: text('alternative_phone'),
  companyWebsite: text('company_website'),
  taxVatRegistrationNumber: text('tax_vat_registration_number'),
  tradeLicenseNumber: text('trade_license_number'),
  companyAddress: text('company_address'),
  country: text('country'),
  state: text('state'),
  city: text('city'),
  postalCode: text('postal_code'),
  companyDescription: text('company_description'),
  companyLogo: text('company_logo'),
  createdAt: text('created_at').notNull()
});

export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull(),
  subscriptionPackage: text('subscription_package'),
  billingType: text('billing_type'),
  subscriptionPrice: text('subscription_price'),
  subscriptionDuration: text('subscription_duration'),
  startDate: text('start_date'),
  expiryDate: text('expiry_date'),
  paymentStatus: text('payment_status'),
  subscriptionStatus: text('subscription_status'),
  maxUserLimit: integer('max_user_limit'),
  maxVehicleLimit: integer('max_vehicle_limit'),
  notes: text('notes'),
  createdAt: text('created_at').notNull()
});

export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull(),
  subscriptionId: text('subscription_id').notNull(),
  totalAmount: text('total_amount'),
  paymentMethod: text('payment_method'), // Cash, Cheque, Bank Transfer
  cashInfo: text('cash_info'),
  chequeNumber: text('cheque_number'),
  bankName: text('bank_name'),
  bankAccountNumber: text('bank_account_number'),
  accountHolderName: text('account_holder_name'),
  transactionId: text('transaction_id'),
  createdAt: text('created_at').notNull()
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

export const tripLogs = pgTable('trip_logs', {
  id: text('id').primaryKey(),
  driverId: text('driver_id').notNull(),
  vehicleNumber: text('vehicle_number').notNull(),
  startLocation: jsonb('start_location').notNull(), // { latitude, longitude, address }
  endLocation: jsonb('end_location'), // { latitude, longitude, address }
  startTime: text('start_time').notNull(),
  endTime: text('end_time'),
  currentSpeed: real('current_speed').notNull(),
  totalDistance: real('total_distance').notNull(),
  status: text('status').notNull() // 'Started' | 'Completed' | 'Cancelled'
});
