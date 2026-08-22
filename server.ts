import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { 
  hashPassword, verifyPassword, encryptSecret, decryptSecret, 
  createTotpSecret, getTotpUri, generateQrCodeDataUrl, verifyTotpToken 
} from './src/lib/authSecurity';
import { getFirebaseAuth } from './src/lib/firebaseAdmin';
import { db } from './src/db/index.ts';
import { users, vehicles, activityLogs, notifications, appSettings, rolePermissions, tripLogs, companies, subscriptions, payments } from './src/db/schema.ts';
import { initialAppSettings, initialRolePermissions } from './src/data.ts';
import { eq, desc } from 'drizzle-orm';

const app = express();
const PORT = 3000;

app.use(express.json());

// Seed initial admin users if database is empty
async function seedDatabase() {
  try {
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length === 0) {
      console.log('Database empty: Seeding initial admin users...');
      const defaultUser = {
        id: 'USR-000',
        name: 'Admin Owner',
        email: 'adminownerhassan@gmail.com',
        username: 'adminownerhassan@gmail.com',
        role: 'Admin Owner',
        status: 'Active',
        phone: '+880 1700-000000',
        department: 'Executive Owner',
        joinDate: new Date().toISOString().split('T')[0],
        lastLogin: 'Today',
        mustChangeCredentials: false,
        is2faEnabled: false,
        is2faSetupRequired: true,
        totpSecretEncrypted: '',
        passwordHash: hashPassword('admin'),
        permissions: { dashboard: true, users: true, vehicles: false, settings: true, auditLogs: true },
        trustedDeviceTokens: [],
        devices: [],
        loginHistory: []
      };
      await db.insert(users).values(defaultUser);
      console.log('Seeding users completed.');
    }

    // Seed default role permissions
    const existingRoles = await db.select().from(rolePermissions).limit(1);
    if (existingRoles.length === 0) {
      console.log('Seeding default role permissions...');
      for (const rp of initialRolePermissions) {
        await db.insert(rolePermissions).values({
          role: rp.role,
          modules: rp.modules
        });
      }
    }

    // Seed default app settings
    const existingSettings = await db.select().from(appSettings).limit(1);
    if (existingSettings.length === 0) {
      console.log('Seeding default app settings...');
      await db.insert(appSettings).values({
        id: 'default',
        ...initialAppSettings
      });
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

async function addAuditLog(userId: string, userName: string, userEmail: string, action: string, category: string, details: string, status: 'Success' | 'Failed' = 'Success') {
  try {
    const log = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId,
      userName,
      userEmail,
      action,
      category,
      details,
      status,
      ipAddress: '127.0.0.1'
    };
    await db.insert(activityLogs).values(log);
    return log;
  } catch (err) {
    console.error('Failed to write audit log', err);
  }
}

async function getUserByEmailOrUsername(identifier: string) {
  if (!identifier) return null;
  const cleanIdent = identifier.trim().toLowerCase();
  const cleanPhone = identifier.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
  try {
    const allUsers = await db.select().from(users);
    for (const u of (allUsers as any[])) {
      const uEmail = (u.email || '').trim().toLowerCase();
      const uUsername = (u.username || '').trim().toLowerCase();
      const uLoginEmail = (u.loginEmail || u.login_email || '').trim().toLowerCase();
      const uId = (u.id || '').trim().toLowerCase();
      const uEmployeeId = (u.employeeId || u.employee_id || '').trim().toLowerCase();
      const uPhone = (u.phone || '').replace(/\s+/g, '').replace(/[^0-9+]/g, '');
      const uMobileNumber = (u.mobileNumber || u.mobile_number || '').replace(/\s+/g, '').replace(/[^0-9+]/g, '');

      if (
        uEmail === cleanIdent || 
        uUsername === cleanIdent ||
        uLoginEmail === cleanIdent ||
        uId === cleanIdent ||
        uEmployeeId === cleanIdent ||
        (cleanPhone.length >= 6 && (
          uPhone === cleanPhone || 
          uPhone.endsWith(cleanPhone) || 
          uMobileNumber === cleanPhone || 
          uMobileNumber.endsWith(cleanPhone)
        ))
      ) {
        return u;
      }
    }
  } catch (err) {
    console.error('Error fetching user by identifier:', err);
  }
  return null;
}

// ==================== VEHICLES API ROUTES ====================
app.get('/api/vehicles', async (req, res) => {
  try {
    const list = await db.select().from(vehicles);
    res.json(list);
  } catch (err) {
    console.error('Failed to fetch vehicles:', err);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

app.post('/api/vehicles', async (req, res) => {
  try {
    const newVehicle = req.body;
    await db.insert(vehicles).values(newVehicle);
    res.json({ success: true, vehicle: newVehicle });
  } catch (err) {
    console.error('Failed to create vehicle:', err);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

app.put('/api/vehicles/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updated = req.body;
    await db.update(vehicles).set(updated).where(eq(vehicles.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to update vehicle:', err);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await db.delete(vehicles).where(eq(vehicles.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete vehicle:', err);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

// ==================== APP SETTINGS & PERMISSIONS ROUTES ====================
app.get('/api/settings', async (req, res) => {
  try {
    const [settings] = await db.select().from(appSettings).where(eq(appSettings.id, 'default'));
    if (settings) {
      res.json(settings);
    } else {
      res.status(404).json({ error: 'Settings not found' });
    }
  } catch (err) {
    console.error('Failed to fetch settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const newSettings = req.body;
    await db.update(appSettings).set(newSettings).where(eq(appSettings.id, 'default'));
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to save settings:', err);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

app.get('/api/permissions', async (req, res) => {
  try {
    const perms = await db.select().from(rolePermissions);
    res.json(perms);
  } catch (err) {
    console.error('Failed to fetch permissions:', err);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

app.post('/api/permissions', async (req, res) => {
  try {
    const { permissions } = req.body;
    if (Array.isArray(permissions)) {
      for (const rp of permissions) {
        await db.insert(rolePermissions)
          .values({ role: rp.role, modules: rp.modules })
          .onConflictDoUpdate({
            target: rolePermissions.role,
            set: { modules: rp.modules }
          });
      }
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to update permissions:', err);
    res.status(500).json({ error: 'Failed to update permissions' });
  }
});

// ==================== NOTIFICATIONS API ROUTES ====================
app.get('/api/notifications', async (req, res) => {
  try {
    const list = await db.select().from(notifications);
    res.json(list);
  } catch (err) {
    console.error('Failed to fetch notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const newNotification = req.body;
    await db.insert(notifications).values(newNotification);
    res.json({ success: true, notification: newNotification });
  } catch (err) {
    console.error('Failed to create notification:', err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

app.post('/api/notifications/clear', async (req, res) => {
  try {
    await db.delete(notifications);
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to clear notifications:', err);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

app.put('/api/notifications/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to update notification:', err);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// ==================== COMPANY MANAGEMENT API ROUTES ====================
app.get('/api/companies', async (req, res) => {
  try {
    const userRole = req.headers['x-user-role'] as string;
    if (userRole !== 'Admin Owner') {
      return res.status(403).json({ error: 'Access Denied: Only Admin Owner can access Company list.' });
    }

    const comps = await db.select().from(companies);
    const subs = await db.select().from(subscriptions);
    const pmts = await db.select().from(payments);
    const usrs = await db.select().from(users);

    const fullCompanies = comps.map(c => {
      const sub = subs.find(s => s.companyId === c.id) || null;
      const pmt = pmts.find(p => p.companyId === c.id) || null;
      const owner = usrs.find(u => u.companyId === c.id && u.role === 'Manager') || null;
      return {
        ...c,
        subscription: sub,
        payment: pmt,
        owner: owner
      };
    });

    res.json(fullCompanies);
  } catch (err) {
    console.error('Failed to fetch companies:', err);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    const userRole = req.headers['x-user-role'] as string;
    const adminId = req.headers['x-user-id'] as string || 'USR-000';
    if (userRole !== 'Admin Owner') {
      return res.status(403).json({ error: 'Access Denied: Only Admin Owner can register companies.' });
    }

    const { ownerInfo, companyInfo, subscription, password, payment } = req.body;

    // Check if owner email/username already exists
    const emailExist = await getUserByEmailOrUsername(ownerInfo.email);
    if (emailExist) {
      return res.status(400).json({ error: 'Email already registered. Please use a unique Email ID.' });
    }

    const companyId = 'COM-' + Math.floor(100000 + Math.random() * 900000);
    const subscriptionId = 'SUB-' + Math.floor(100000 + Math.random() * 900000);
    const paymentId = 'PMT-' + Math.floor(100000 + Math.random() * 900000);
    const ownerUserId = 'USR-' + Math.floor(100000 + Math.random() * 900000);

    // 1. Insert Company
    await db.insert(companies).values({
      id: companyId,
      companyName: companyInfo.companyName,
      companyRegistrationNumber: companyInfo.companyRegistrationNumber || null,
      companyType: companyInfo.companyType || null,
      businessCategory: companyInfo.businessCategory || null,
      companyEmail: companyInfo.companyEmail || null,
      companyPhone: companyInfo.companyPhone || null,
      alternativePhone: companyInfo.alternativePhone || null,
      companyWebsite: companyInfo.companyWebsite || null,
      taxVatRegistrationNumber: companyInfo.taxVatRegistrationNumber || null,
      tradeLicenseNumber: companyInfo.tradeLicenseNumber || null,
      companyAddress: companyInfo.companyAddress || null,
      country: companyInfo.country || null,
      state: companyInfo.state || null,
      city: companyInfo.city || null,
      postalCode: companyInfo.postalCode || null,
      companyDescription: companyInfo.companyDescription || null,
      companyLogo: companyInfo.companyLogo || null,
      createdAt: new Date().toISOString()
    });

    // 2. Insert Subscription
    await db.insert(subscriptions).values({
      id: subscriptionId,
      companyId: companyId,
      subscriptionPackage: subscription.subscriptionPackage || null,
      billingType: subscription.billingType || null,
      subscriptionPrice: subscription.subscriptionPrice || null,
      subscriptionDuration: subscription.subscriptionDuration || null,
      startDate: subscription.startDate || null,
      expiryDate: subscription.expiryDate || null,
      paymentStatus: subscription.paymentStatus || null,
      subscriptionStatus: subscription.subscriptionStatus || null,
      maxUserLimit: subscription.maxUserLimit ? parseInt(subscription.maxUserLimit) : null,
      maxVehicleLimit: subscription.maxVehicleLimit ? parseInt(subscription.maxVehicleLimit) : null,
      notes: subscription.notes || null,
      createdAt: new Date().toISOString()
    });

    // 3. Insert Payment
    await db.insert(payments).values({
      id: paymentId,
      companyId: companyId,
      subscriptionId: subscriptionId,
      totalAmount: payment.totalAmount || null,
      paymentMethod: payment.paymentMethod || null,
      cashInfo: payment.cashInfo || null,
      chequeNumber: payment.chequeNumber || null,
      bankName: payment.bankName || null,
      bankAccountNumber: payment.bankAccountNumber || null,
      accountHolderName: payment.accountHolderName || null,
      transactionId: payment.transactionId || null,
      createdAt: new Date().toISOString()
    });

    // 4. Insert Owner User
    await db.insert(users).values({
      id: ownerUserId,
      name: ownerInfo.name,
      email: ownerInfo.email,
      username: ownerInfo.username || ownerInfo.email,
      role: 'Manager', // Map Company Owner role to 'Manager'
      status: 'Active',
      phone: ownerInfo.phone,
      department: 'Executive',
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      mustChangeCredentials: true,
      is2faEnabled: false,
      is2faSetupRequired: true,
      passwordHash: hashPassword(password),
      permissions: { dashboard: true, users: true, vehicles: true, settings: true, auditLogs: true },
      companyId: companyId,
      alternativeMobileNumber: ownerInfo.alternativeMobileNumber || null,
      dateOfBirth: ownerInfo.dateOfBirth || null,
      nationality: ownerInfo.nationality || null,
      nationalId: ownerInfo.nationalId || null,
      address: ownerInfo.address || null,
      country: ownerInfo.country || null,
      state: ownerInfo.state || null,
      city: ownerInfo.city || null,
      postalCode: ownerInfo.postalCode || null,
      accountType: 'ADMIN_PANEL'
    });

    await addAuditLog(adminId, 'Admin Owner', 'adminownerhassan@gmail.com', 'Register Company', 'User Management', `Registered company ${companyInfo.companyName} with ID ${companyId}.`);

    res.json({
      success: true,
      companyId,
      subscriptionId,
      paymentId,
      ownerUserId
    });
  } catch (err) {
    console.error('Failed to create company:', err);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

app.put('/api/companies/:id', async (req, res) => {
  try {
    const userRole = req.headers['x-user-role'] as string;
    const userCompanyId = req.headers['x-user-company-id'] as string;
    const adminId = req.headers['x-user-id'] as string || 'USR-000';
    const { id } = req.params;

    if (userRole !== 'Admin Owner' && userCompanyId !== id) {
      return res.status(403).json({ error: 'Access Denied: Unauthorized company update attempt.' });
    }

    const { companyInfo, subscription, payment } = req.body;

    if (companyInfo) {
      await db.update(companies).set({
        companyName: companyInfo.companyName,
        companyRegistrationNumber: companyInfo.companyRegistrationNumber,
        companyType: companyInfo.companyType,
        businessCategory: companyInfo.businessCategory,
        companyEmail: companyInfo.companyEmail,
        companyPhone: companyInfo.companyPhone,
        alternativePhone: companyInfo.alternativePhone,
        companyWebsite: companyInfo.companyWebsite,
        taxVatRegistrationNumber: companyInfo.taxVatRegistrationNumber,
        tradeLicenseNumber: companyInfo.tradeLicenseNumber,
        companyAddress: companyInfo.companyAddress,
        country: companyInfo.country,
        state: companyInfo.state,
        city: companyInfo.city,
        postalCode: companyInfo.postalCode,
        companyDescription: companyInfo.companyDescription,
        companyLogo: companyInfo.companyLogo
      }).where(eq(companies.id, id));
    }

    if (subscription) {
      await db.update(subscriptions).set({
        subscriptionPackage: subscription.subscriptionPackage,
        billingType: subscription.billingType,
        subscriptionPrice: subscription.subscriptionPrice,
        subscriptionDuration: subscription.subscriptionDuration,
        startDate: subscription.startDate,
        expiryDate: subscription.expiryDate,
        paymentStatus: subscription.paymentStatus,
        subscriptionStatus: subscription.subscriptionStatus,
        maxUserLimit: subscription.maxUserLimit ? parseInt(subscription.maxUserLimit) : null,
        maxVehicleLimit: subscription.maxVehicleLimit ? parseInt(subscription.maxVehicleLimit) : null,
        notes: subscription.notes
      }).where(eq(subscriptions.companyId, id));
    }

    if (payment) {
      await db.update(payments).set({
        totalAmount: payment.totalAmount,
        paymentMethod: payment.paymentMethod,
        cashInfo: payment.cashInfo,
        chequeNumber: payment.chequeNumber,
        bankName: payment.bankName,
        bankAccountNumber: payment.bankAccountNumber,
        accountHolderName: payment.accountHolderName,
        transactionId: payment.transactionId
      }).where(eq(payments.companyId, id));
    }

    await addAuditLog(adminId, 'Admin Owner', 'adminownerhassan@gmail.com', 'Update Company Details', 'User Management', `Updated details for company ${id}.`);

    res.json({ success: true });
  } catch (err) {
    console.error('Failed to update company:', err);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

app.delete('/api/companies/:id', async (req, res) => {
  try {
    const userRole = req.headers['x-user-role'] as string;
    const adminId = req.headers['x-user-id'] as string || 'USR-000';
    if (userRole !== 'Admin Owner') {
      return res.status(403).json({ error: 'Access Denied: Only Admin Owner can delete companies.' });
    }

    const { id } = req.params;
    await db.delete(companies).where(eq(companies.id, id));
    await db.delete(subscriptions).where(eq(subscriptions.companyId, id));
    await db.delete(payments).where(eq(payments.companyId, id));
    await db.delete(users).where(eq(users.companyId, id));

    await addAuditLog(adminId, 'Admin Owner', 'adminownerhassan@gmail.com', 'Delete Company Record', 'User Management', `Deleted company ${id} and all related accounts/subscriptions.`);

    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete company:', err);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

// ==================== AUTH SECURITY API ROUTES ====================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password, totpCode, trustedDeviceToken } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifier and password are required' });
    }

    const user: any = await getUserByEmailOrUsername(identifier);

    if (!user) {
      await addAuditLog('UNKNOWN', 'Unknown', identifier, 'Failed Login Attempt', 'Security', `No account found for identifier: ${identifier}`, 'Failed');
      return res.status(401).json({ error: 'Invalid User ID/Email or Password' });
    }

    const isValidPassword = verifyPassword(password, user.passwordHash || '');
    if (!isValidPassword) {
      await addAuditLog(user.id, user.name, user.email, 'Failed Login Attempt', 'Security', 'Invalid password entered', 'Failed');
      return res.status(401).json({ error: 'Invalid User ID/Email or Password' });
    }

    // SCOPE CONTROL: Mobile Application accounts (AccountType = MOBILE_APP) CANNOT log into Admin Panel
    if (user.accountType === 'MOBILE_APP' || user.role === 'Users' || user.role === 'USER') {
      if (user.role !== 'Admin Owner' && user.role !== 'ADMIN' && user.role !== 'Super Admin') {
        await addAuditLog(user.id, user.name, user.email, 'Admin Panel Login Blocked', 'Security', 'MOBILE_APP account blocked from Admin Panel authentication', 'Failed');
        return res.status(403).json({ 
          error: 'Access Denied: Mobile Application accounts (AccountType = MOBILE_APP) cannot log into the Admin Panel. Mobile credentials are restricted exclusively to the Mobile Application.' 
        });
      }
    }

    let newDeviceToken = undefined;

    if (user.is2faEnabled) {
      const trustedTokens = user.trustedDeviceTokens || [];
      const isTrustedDevice = trustedDeviceToken && trustedTokens.includes(trustedDeviceToken);
      
      if (!isTrustedDevice) {
        if (!totpCode) {
          return res.json({ requires2fa: true, userId: user.id });
        }
        const rawSecret = decryptSecret(user.totpSecretEncrypted || '');
        if (!rawSecret) {
          return res.status(500).json({ error: '2FA verification failed internally.' });
        }
        const isValidTotp = verifyTotpToken(rawSecret, totpCode);
        if (!isValidTotp) {
          await addAuditLog(user.id, user.name, user.email, 'Failed Login Attempt', 'Security', 'Invalid 2FA TOTP code entered', 'Failed');
          return res.status(401).json({ error: 'Invalid 2FA Verification Code' });
        }
        
        newDeviceToken = crypto.randomBytes(32).toString('hex');
        trustedTokens.push(newDeviceToken);
        user.trustedDeviceTokens = trustedTokens;
      }
    }

    user.lastLogin = new Date().toISOString().split('T')[0];
    await db.update(users)
      .set({
        lastLogin: user.lastLogin,
        trustedDeviceTokens: user.trustedDeviceTokens || []
      })
      .where(eq(users.id, user.id));

    await addAuditLog(user.id, user.name, user.email, 'User Login', 'Security', 'User authenticated successfully');

    return res.json({
      success: true,
      newDeviceToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        phone: user.phone,
        department: user.department,
        joinDate: user.joinDate,
        lastLogin: user.lastLogin,
        mustChangeCredentials: user.mustChangeCredentials,
        is2faEnabled: user.is2faEnabled,
        is2faSetupRequired: user.is2faSetupRequired || (!user.is2faEnabled && user.role.includes('Admin')),
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/auth/setup-2fa', async (req, res) => {
  try {
    const { userId, email } = req.body;
    let userEmail = email || 'admin@fleetpro.com';
    if (userId) {
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (user) {
        userEmail = user.email || userEmail;
      }
    }

    const secret = createTotpSecret();
    const uri = getTotpUri(secret, userEmail);
    const qrCodeUrl = await generateQrCodeDataUrl(uri);

    res.json({
      success: true,
      secret,
      qrCodeUrl,
      userEmail
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate 2FA secret' });
  }
});

app.post('/api/auth/verify-and-enable-2fa', async (req, res) => {
  try {
    const { userId, secret, totpCode } = req.body;
    if (!userId || !secret || !totpCode) {
      return res.status(400).json({ error: 'User ID, secret, and TOTP code are required' });
    }

    const isValid = verifyTotpToken(secret, totpCode);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid 2FA Verification Code. Please check Google Authenticator.' });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newDeviceToken = crypto.randomBytes(32).toString('hex');
    const trustedTokens: any = user.trustedDeviceTokens || [];
    trustedTokens.push(newDeviceToken);

    await db.update(users)
      .set({
        is2faEnabled: true,
        is2faSetupRequired: false,
        totpSecretEncrypted: encryptSecret(secret),
        trustedDeviceTokens: trustedTokens
      })
      .where(eq(users.id, userId));

    await addAuditLog(user.id, user.name, user.email, '2FA Enabled', 'Security', 'Google Authenticator 2FA enabled successfully');

    return res.json({
      success: true,
      newDeviceToken,
      message: 'Google Authenticator 2FA enabled successfully.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/auth/disable-2fa', async (req, res) => {
  try {
    const { userId, password, totpCode } = req.body;
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!verifyPassword(password, user.passwordHash || '')) {
      await addAuditLog(user.id, user.name, user.email, 'Disable 2FA Failed', 'Security', 'Incorrect password during 2FA disable attempt', 'Failed');
      return res.status(400).json({ error: 'Incorrect Password. Cannot disable 2FA.' });
    }

    const rawSecret = decryptSecret(user.totpSecretEncrypted || '');
    if (!rawSecret || !verifyTotpToken(rawSecret, totpCode)) {
      await addAuditLog(user.id, user.name, user.email, 'Disable 2FA Failed', 'Security', 'Incorrect 2FA TOTP code during disable attempt', 'Failed');
      return res.status(400).json({ error: 'Invalid TOTP 2FA Verification Code.' });
    }

    await db.update(users)
      .set({
        is2faEnabled: false,
        totpSecretEncrypted: ''
      })
      .where(eq(users.id, userId));

    await addAuditLog(user.id, user.name, user.email, '2FA Disabled', 'Security', 'Google Authenticator 2FA disabled after verification');

    return res.json({
      success: true,
      message: 'Google Authenticator 2FA has been disabled.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/revoke-trusted-devices', async (req, res) => {
  try {
    const { userId } = req.body;
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await db.update(users)
      .set({ trustedDeviceTokens: [] })
      .where(eq(users.id, userId));

    await addAuditLog(user.id, user.name, user.email, 'Trusted Devices Revoked', 'Security', 'Revoked all trusted devices for user');

    return res.json({
      success: true,
      message: 'All trusted devices have been successfully revoked.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!verifyPassword(currentPassword, user.passwordHash || '')) {
      await addAuditLog(user.id, user.name, user.email, 'Password Change Failed', 'Security', 'Current password mismatch', 'Failed');
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    await db.update(users)
      .set({ passwordHash: hashPassword(newPassword) })
      .where(eq(users.id, userId));

    await addAuditLog(user.id, user.name, user.email, 'Password Changed', 'Security', 'Password updated securely via Settings');

    return res.json({
      success: true,
      message: 'Password updated successfully.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/update-initial-credentials', async (req, res) => {
  try {
    const { userId, newUsername, newEmail, newPassword } = req.body;
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const updates: any = {
      passwordHash: hashPassword(newPassword),
      mustChangeCredentials: false
    };

    if (newUsername) updates.username = newUsername.trim();
    if (newEmail) updates.email = newEmail.trim();

    await db.update(users).set(updates).where(eq(users.id, userId));

    await addAuditLog(user.id, user.name, user.email, 'Initial Credentials Updated', 'Security', 'Owner-created admin set new permanent User ID & Password');

    return res.json({
      success: true,
      message: 'New User ID and Password saved successfully.',
      user: { ...user, ...updates }
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/forgot-verify-info', async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email || !phone) {
      return res.status(400).json({ error: 'Email and Mobile phone number are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');

    const snapshot = await db.select().from(users);
    
    let matchedUser: any = null;

    for (const u of snapshot) {
      const uEmail = (u.email || '').trim().toLowerCase();
      const uPhone = (u.phone || '').replace(/\s+/g, '').replace(/[^0-9+]/g, '');
      if (uEmail === cleanEmail && (uPhone === cleanPhone || uPhone.endsWith(cleanPhone.slice(-8)))) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser) {
      await addAuditLog('UNKNOWN', 'Recovery', email, 'Forgot Password Check Failed', 'Security', `No account matches email (${email}) and phone (${phone})`, 'Failed');
      return res.status(400).json({ error: 'No matching Admin account found for the provided Email and Mobile Number.' });
    }

    return res.json({
      success: true,
      userId: matchedUser.id,
      userName: matchedUser.name,
      userEmail: matchedUser.email,
      is2faEnabled: matchedUser.is2faEnabled,
      totpSecretEncrypted: matchedUser.totpSecretEncrypted
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/forgot-reset-password', async (req, res) => {
  try {
    const { userId, totpCode, newPassword, newUsername } = req.body;
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }

    const rawSecret = decryptSecret(user.totpSecretEncrypted || '');
    if (user.is2faEnabled && rawSecret) {
      const isValidTotp = verifyTotpToken(rawSecret, totpCode);
      if (!isValidTotp) {
        await addAuditLog(user.id, user.name, user.email, 'Password Reset Failed', 'Security', 'Invalid Google Authenticator TOTP code', 'Failed');
        return res.status(400).json({ error: 'Invalid Google Authenticator TOTP code. Access denied.' });
      }
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const updates: any = {
      passwordHash: hashPassword(newPassword),
      mustChangeCredentials: false
    };
    if (newUsername) updates.username = newUsername.trim();

    await db.update(users).set(updates).where(eq(users.id, userId));

    await addAuditLog(user.id, user.name, user.email, 'Forgot Password Reset', 'Security', 'Password reset successfully via Email + Phone + Google Authenticator TOTP verification');

    return res.json({
      success: true,
      message: 'Your User ID and Password have been reset successfully. Please log in with your new credentials.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/users', async (req, res) => {
  try {
    const userRole = req.headers['x-user-role'] as string;
    const userCompanyId = req.headers['x-user-company-id'] as string;

    const adminUsers = await db.select().from(users);
    
    // Multi-tenant filter: if not global Admin Owner and has a companyId, only return users of that company
    let filteredUsers = adminUsers;
    if (userRole !== 'Admin Owner' && userCompanyId) {
      filteredUsers = adminUsers.filter((u: any) => u.companyId === userCompanyId);
    }

    // Ensure Admin Owner users have a valid adminOwnerId
    const mappedUsers = filteredUsers.map((u: any) => {
      if (u.role === 'Admin Owner' && !u.adminOwnerId) {
        return { ...u, adminOwnerId: 'AO-000' };
      }
      return u;
    });
    res.json(mappedUsers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Admin Owner ID Validation Helper Endpoint
app.get('/api/admin-owner/validate/:adminOwnerId', async (req, res) => {
  try {
    const { adminOwnerId } = req.params;
    if (!adminOwnerId) {
      return res.status(400).json({ valid: false, error: 'Admin Owner ID is required' });
    }

    const allUsers = await db.select().from(users);
    const owner = allUsers.find((u: any) => 
      (u.adminOwnerId === adminOwnerId || u.id === adminOwnerId || adminOwnerId === 'AO-000') &&
      (u.role === 'Admin Owner' || u.role === 'ADMIN' || u.role === 'Super Admin')
    );

    if (owner) {
      return res.json({
        valid: true,
        adminOwnerId: owner.adminOwnerId || 'AO-000',
        ownerName: owner.name,
        ownerEmail: owner.email
      });
    } else {
      return res.status(404).json({ valid: false, error: 'Admin Owner ID not found or unauthorized' });
    }
  } catch (err) {
    res.status(500).json({ valid: false, error: 'Server error validating Admin Owner ID' });
  }
});

app.post('/api/auth/users', async (req, res) => {
  try {
    const newUser = req.body;
    const userCompanyId = req.headers['x-user-company-id'] as string;
    if (userCompanyId) {
      newUser.companyId = userCompanyId;
    }
    const isMobileRegistration = newUser.role === 'Users' || newUser.role === 'USER';
    const reqAdminOwnerId = (req.headers['x-admin-owner-id'] as string) || newUser.adminOwnerId || newUser.createdBy;

    // MANDATORY BACKEND VALIDATION: Mobile User Registration MUST be mapped under a valid Admin Owner ID
    if (isMobileRegistration) {
      if (!reqAdminOwnerId) {
        return res.status(403).json({
          error: 'Mobile User Registration Rejected: Admin Owner ID is required. Mobile Users cannot be created without an Admin Owner.',
          code: 'ADMIN_OWNER_ID_REQUIRED'
        });
      }

      // Check if provided Admin Owner ID corresponds to a valid Admin Owner in DB
      const allUsers = await db.select().from(users);
      const adminOwner = allUsers.find((u: any) => 
        (u.adminOwnerId === reqAdminOwnerId || u.id === reqAdminOwnerId || reqAdminOwnerId === 'AO-000') &&
        (u.role === 'Admin Owner' || u.role === 'ADMIN' || u.role === 'Super Admin')
      );

      if (!adminOwner) {
        return res.status(403).json({
          error: `Mobile User Registration Rejected: Admin Owner ID '${reqAdminOwnerId}' is invalid or does not belong to an active Admin Owner.`,
          code: 'INVALID_ADMIN_OWNER_ID'
        });
      }

      // Automatically map AccountType, AdminOwnerID and CreatedBy to the newly registered mobile user
      newUser.accountType = 'MOBILE_APP';
      newUser.adminOwnerId = adminOwner.adminOwnerId || 'AO-000';
      newUser.createdBy = adminOwner.name || adminOwner.email || 'Admin Owner';
    } else {
      newUser.accountType = newUser.accountType || 'ADMIN_PANEL';
      if (newUser.role === 'Admin Owner') {
        newUser.adminOwnerId = newUser.adminOwnerId || `AO-${newUser.id || Math.floor(1000 + Math.random() * 9000)}`;
        newUser.createdBy = 'SYSTEM';
      }
    }

    // Check duplicate email
    if (newUser.email) {
      const existingUser = await db.select().from(users).where(eq(users.email, newUser.email));
      if (existingUser.length > 0) {
        return res.status(400).json({
          error: `User with email '${newUser.email}' already exists. Please use a unique email address.`
        });
      }
    }

    const rawPassword = newUser.password || 'default123456';
    
    if (newUser.password) {
      newUser.passwordHash = hashPassword(newUser.password);
      delete newUser.password;
    } else {
      newUser.passwordHash = hashPassword('default123456');
    }

    try {
      const auth = getFirebaseAuth();
      await auth.createUser({
        uid: newUser.id,
        email: newUser.email,
        password: rawPassword,
        displayName: newUser.name,
      });
    } catch (authErr: any) {
      if (authErr.code === 'auth/email-already-exists') {
        try {
          const auth = getFirebaseAuth();
          const existingRecord = await auth.getUserByEmail(newUser.email);
          await auth.updateUser(existingRecord.uid, { password: rawPassword });
        } catch(e) {}
      } else {
        console.warn('Firebase Auth sync skipped (Identity Toolkit API not active in GCP project):', authErr.message || authErr);
      }
    }

    await db.insert(users).values(newUser);

    // Audit History Logging for Admin Owner ID Registration Control
    await addAuditLog(
      newUser.id,
      newUser.name,
      newUser.email,
      'Mobile User Registration',
      'User Management',
      `Mobile user account created and mapped under Admin Owner ID: ${newUser.adminOwnerId || 'N/A'} (CreatedBy: ${newUser.createdBy || 'N/A'}).`
    );

    res.json({ success: true, user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/auth/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updatedUser = req.body;
    
    // Retrieve existing user from DB to enforce ownership immutability
    const [existingUser] = await db.select().from(users).where(eq(users.id, id));
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const requesterRole = (req.headers['x-user-role'] as string) || '';
    const requesterAdminOwnerId = (req.headers['x-admin-owner-id'] as string) || '';

    // IMMUTABILITY & TRANSFER RESTRICTIONS:
    // Once a Mobile User is registered under an Admin Owner ID, the AdminOwnerID/CreatedBy cannot be changed
    // unless explicitly executed by an authorized Admin Owner operation.
    if (existingUser.adminOwnerId) {
      const isAttemptingOwnershipTransfer = 
        (updatedUser.adminOwnerId && updatedUser.adminOwnerId !== existingUser.adminOwnerId) ||
        (updatedUser.createdBy && updatedUser.createdBy !== existingUser.createdBy);

      if (isAttemptingOwnershipTransfer) {
        if (requesterRole !== 'Admin Owner' && requesterAdminOwnerId !== existingUser.adminOwnerId) {
          return res.status(403).json({
            error: 'Ownership Transfer Denied: CreatedBy / AdminOwnerID record is immutable and cannot be transferred to another Admin or User except by authorized Admin Owner operations.',
            code: 'OWNERSHIP_TRANSFER_FORBIDDEN'
          });
        }
      }

      // Preserve existing ownership mapping if not explicitly authorized to transfer
      if (!updatedUser.adminOwnerId) updatedUser.adminOwnerId = existingUser.adminOwnerId;
      if (!updatedUser.createdBy) updatedUser.createdBy = existingUser.createdBy;
    }

    let rawPassword = null;
    if (updatedUser.password) {
      rawPassword = updatedUser.password;
      updatedUser.passwordHash = hashPassword(updatedUser.password);
      delete updatedUser.password;
    }

    try {
      const auth = getFirebaseAuth();
      const authUpdate: any = {};
      if (updatedUser.email) authUpdate.email = updatedUser.email;
      if (updatedUser.name) authUpdate.displayName = updatedUser.name;
      if (rawPassword) authUpdate.password = rawPassword;
      
      if (Object.keys(authUpdate).length > 0) {
        await auth.updateUser(id, authUpdate);
      }
    } catch (authErr: any) {
      console.warn('Firebase Auth update skipped (Identity Toolkit API not active in GCP project):', authErr.message || authErr);
    }

    await db.update(users).set(updatedUser).where(eq(users.id, id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/auth/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [user] = await db.select().from(users).where(eq(users.id, id));
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.role === 'Admin Owner') {
      return res.status(403).json({ error: 'Admin Owner account cannot be deleted.' });
    }

    await db.delete(users).where(eq(users.id, id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.get('/api/auth/logs', async (req, res) => {
  try {
    const logs = await db.select().from(activityLogs).orderBy(desc(activityLogs.timestamp));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

app.post('/api/auth/logs', async (req, res) => {
  try {
    const newLog = req.body;
    await db.insert(activityLogs).values(newLog);
    res.json({ success: true, log: newLog });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create log' });
  }
});

// ==================== MOBILE APP API ENDPOINTS ====================

function mapToUserProfile(user: any) {
  return {
    id: user.id,
    firstName: user.firstName || user.name.split(' ')[0] || '',
    lastName: user.lastName || user.name.split(' ').slice(1).join(' ') || '',
    name: user.name,
    userId: user.username || user.email || '',
    email: user.email,
    loginEmail: user.loginEmail || user.email,
    mobileNumber: user.mobileNumber || user.phone || '',
    role: (user.role === 'Admin Owner' || user.role === 'ADMIN') ? 'ADMIN' : 'USER',
    status: user.status || 'Active',
    idType: user.idType || 'NID',
    idNumber: user.idNumber || '',
    idIssueCountry: user.idIssueCountry || '',
    idIssueDate: user.idIssueDate || '',
    idExpiryDate: user.idExpiryDate || '',
    country: user.country || '',
    state: user.state || '',
    city: user.city || '',
    policeStation: user.policeStation || '',
    postOffice: user.postOffice || '',
    postalCode: user.postalCode || '',
    addressLine1: user.addressLine1 || '',
    buildingNumber: user.buildingNumber || '',
    zoneNumber: user.zoneNumber || '',
    mobileModulePermissions: user.mobileModulePermissions || {},
    adminOwnerId: user.adminOwnerId || (user.role === 'Admin Owner' ? (user.adminOwnerId || 'AO-000') : ''),
    createdBy: user.createdBy || '',
    accountType: user.accountType || (user.role === 'Users' || user.role === 'USER' ? 'MOBILE_APP' : 'ADMIN_PANEL')
  };
}

// Mobile App Module Permission Validation API Routes
app.get('/api/mobile/user-modules/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const permissions = (user as any).mobileModulePermissions || {};
    res.json({
      userId: user.id,
      userName: user.name,
      mobileModulePermissions: permissions
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user module permissions' });
  }
});

app.post('/api/mobile/validate-access', async (req, res) => {
  try {
    const { userId, moduleId } = req.body;
    if (!userId || !moduleId) {
      return res.status(400).json({ error: 'Missing userId or moduleId' });
    }
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return res.status(404).json({ error: 'Mobile user not found' });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({
        allowed: false,
        code: 'ACCOUNT_INACTIVE',
        error: `Account is currently ${user.status}. Mobile access blocked.`
      });
    }

    const permissions = (user as any).mobileModulePermissions || {};
    const isAllowed = permissions[moduleId] === true;

    if (!isAllowed) {
      return res.status(403).json({
        allowed: false,
        code: 'MODULE_PERMISSION_DENIED',
        moduleId,
        error: `Access Denied: You do not have permission for module '${moduleId}'.`
      });
    }

    return res.json({
      allowed: true,
      userId: user.id,
      moduleId,
      message: `Permission verified for module '${moduleId}'.`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to validate module permission' });
  }
});

app.get('/api/mobile/data/:moduleId', async (req, res) => {
  try {
    const { moduleId } = req.params;
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID required for Mobile Module Access' });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return res.status(404).json({ error: 'Mobile user not found' });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({ error: `Account status is ${user.status}. Mobile module access blocked.` });
    }

    const permissions = (user as any).mobileModulePermissions || {};
    if (!permissions[moduleId]) {
      return res.status(403).json({
        error: `Access Denied: Backend permission check failed for module '${moduleId}'.`,
        code: 'MODULE_PERMISSION_DENIED',
        allowed: false
      });
    }

    res.json({
      success: true,
      moduleId,
      userId: user.id,
      timestamp: new Date().toISOString(),
      data: {
        moduleName: moduleId,
        status: 'Authorized',
        notice: `Access granted to ${moduleId} module for user ${user.name}.`
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process mobile module data request' });
  }
});

// 1. Mobile Driver Authentication (Login)
app.post('/api/mobile/login', async (req, res) => {
  try {
    const identifier = req.body.loginEmail || req.body.email || req.body.username || req.body.identifier || req.body.userId || req.body.phone || req.body.user;
    const password = req.body.password;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'User ID/Email and password are required' });
    }

    const user: any = await getUserByEmailOrUsername(identifier);
    if (!user) {
      return res.status(401).json({ error: 'User profile not found. Please verify your User ID or Email.' });
    }

    const isValid = verifyPassword(password, user.passwordHash || '') || (password === 'default123456' && !user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect credentials. Please verify your password.' });
    }

    // SCOPE CONTROL: Admin Panel credentials (Admin Owner / Super Admin / Sub Admin) CANNOT log into Mobile Application
    const isAdminAccount = user.accountType === 'ADMIN_PANEL' || ['Admin Owner', 'ADMIN', 'Super Admin', 'Manager', 'Operator'].includes(user.role);
    if (isAdminAccount && user.accountType !== 'MOBILE_APP') {
      await addAuditLog(user.id, user.name, user.email, 'Mobile Login Blocked', 'Security', 'Admin Panel credential blocked from Mobile App authentication', 'Failed');
      return res.status(403).json({ 
        error: 'Access Denied: Admin Panel credentials (Admin Owner / Super Admin / Sub Admin) cannot log into the Mobile Application. Only MOBILE_APP accounts are permitted.' 
      });
    }

    if (user.status === 'Blocked' || user.status === 'Inactive') {
      return res.status(403).json({ error: 'Your mobile driver account is suspended. Contact Administrator.' });
    }

    // Return exact UserProfile format expected by mobile app
    const profile = mapToUserProfile(user);
    await addAuditLog(user.id, user.name, user.email, 'Mobile Driver Login', 'Security', 'Driver logged in from mobile device.');
    
    res.json({ success: true, profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. Mobile Profile Fetching
app.get('/api/mobile/profile/:id', async (req, res) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.params.id));
    if (!user) {
      return res.status(404).json({ error: 'Driver profile not found.' });
    }
    res.json(mapToUserProfile(user));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Mobile Profile Updates
app.put('/api/mobile/profile/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    const updatableFields = [
      'firstName', 'lastName', 'mobileNumber', 'idType', 'idNumber',
      'idIssueCountry', 'idIssueDate', 'idExpiryDate', 'country', 'state',
      'city', 'policeStation', 'postOffice', 'postalCode', 'addressLine1',
      'buildingNumber', 'zoneNumber'
    ];

    const updates: any = {};
    for (const field of updatableFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (body.name) updates.name = body.name;
    if (body.mobileNumber) updates.phone = body.mobileNumber;

    await db.update(users).set(updates).where(eq(users.id, id));
    
    await addAuditLog(id, user.name, user.email, 'Mobile Profile Updated', 'User', 'Driver updated their registration credentials.');
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Mobile Driver Trip - START
app.post('/api/mobile/trips/start', async (req, res) => {
  try {
    const { id, driverId, vehicleNumber, startLocation, startTime, currentSpeed, totalDistance } = req.body;
    if (!id || !driverId || !vehicleNumber || !startLocation || !startTime) {
      return res.status(400).json({ error: 'id, driverId, vehicleNumber, startLocation, and startTime are required.' });
    }

    const newTrip = {
      id,
      driverId,
      vehicleNumber,
      startLocation,
      startTime,
      currentSpeed: Number(currentSpeed || 0),
      totalDistance: Number(totalDistance || 0),
      status: 'Started' as const
    };

    await db.insert(tripLogs).values(newTrip);

    // Write alert log
    const [driver] = await db.select().from(users).where(eq(users.id, driverId));
    await addAuditLog(driverId, driver?.name || 'Driver', driver?.email || 'driver@fleetpro.com', 'Trip Started', 'Vehicle', `Started trip on vehicle ${vehicleNumber}`);

    res.json({ success: true, trip: newTrip });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to start trip log' });
  }
});

// 5. Mobile Driver Trip - UPDATE (Telemetry & Location stream)
app.post('/api/mobile/trips/update', async (req, res) => {
  try {
    const { id, currentSpeed, totalDistance, location } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'id is required to update trip log.' });
    }

    const [activeTrip] = await db.select().from(tripLogs).where(eq(tripLogs.id, id));
    if (!activeTrip) {
      return res.status(404).json({ error: 'Active trip log not found.' });
    }

    const updates: any = {
      currentSpeed: Number(currentSpeed || 0),
      totalDistance: Number(totalDistance || 0)
    };
    if (location) {
      updates.startLocation = location; // Update current tracking location in startLocation property
    }

    await db.update(tripLogs).set(updates).where(eq(tripLogs.id, id));

    // Check for speed limit violations (Speed Alert Alarm)
    const speedLimit = 80; // default speed alert threshold
    if (Number(currentSpeed || 0) > speedLimit) {
      const [driver] = await db.select().from(users).where(eq(users.id, activeTrip.driverId));
      
      // Post warning notification to app notifications table
      const warningNotification = {
        id: `NOTIF-${Date.now()}`,
        title: 'Speed Alarm Triggered',
        message: `Driver ${driver?.name || activeTrip.driverId} exceeded speed limits on vehicle ${activeTrip.vehicleNumber}: ${currentSpeed} km/h!`,
        timestamp: new Date().toISOString(),
        type: 'error',
        category: 'Vehicle',
        read: false
      };
      await db.insert(notifications).values(warningNotification);
      await addAuditLog(activeTrip.driverId, driver?.name || 'Driver', driver?.email || '', 'Speed Limit Alarm Exceeded', 'Security', `Vehicle ${activeTrip.vehicleNumber} moving at dangerous speed of ${currentSpeed} km/h`, 'Failed');
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update trip telemetry.' });
  }
});

// 6. Mobile Driver Trip - END
app.post('/api/mobile/trips/end', async (req, res) => {
  try {
    const { id, endLocation, endTime, totalDistance, currentSpeed, status } = req.body;
    if (!id || !endLocation || !endTime) {
      return res.status(400).json({ error: 'id, endLocation, and endTime are required.' });
    }

    const [activeTrip] = await db.select().from(tripLogs).where(eq(tripLogs.id, id));
    if (!activeTrip) {
      return res.status(404).json({ error: 'Active trip not found.' });
    }

    await db.update(tripLogs)
      .set({
        endLocation,
        endTime,
        totalDistance: Number(totalDistance || activeTrip.totalDistance),
        currentSpeed: Number(currentSpeed || 0),
        status: status || 'Completed'
      })
      .where(eq(tripLogs.id, id));

    const [driver] = await db.select().from(users).where(eq(users.id, activeTrip.driverId));
    await addAuditLog(activeTrip.driverId, driver?.name || 'Driver', driver?.email || '', 'Trip Completed', 'Vehicle', `Finished trip logs on vehicle ${activeTrip.vehicleNumber}. Travelled ${totalDistance} km.`);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to complete trip log.' });
  }
});

// 7. Get all mobile trips
app.get('/api/mobile/trips', async (req, res) => {
  try {
    const list = await db.select().from(tripLogs).orderBy(desc(tripLogs.startTime));
    res.json(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve trip logs list.' });
  }
});

// ==================== VITE & EXPRESS SERVER SETUP ====================

async function startServer() {
  await seedDatabase();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
