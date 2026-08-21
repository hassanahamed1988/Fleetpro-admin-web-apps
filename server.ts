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
import { users, vehicles, activityLogs, notifications, appSettings, rolePermissions } from './src/db/schema.ts';
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
      const { initialRolePermissions } = require('./src/data');
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
      const { initialAppSettings } = require('./src/data');
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
  const cleanIdent = identifier.trim().toLowerCase();
  try {
    const allUsers = await db.select().from(users);
    for (const u of allUsers) {
      if (u.email?.toLowerCase() === cleanIdent || u.username?.toLowerCase() === cleanIdent) {
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
    const adminUsers = await db.select().from(users);
    res.json(adminUsers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/auth/users', async (req, res) => {
  try {
    const newUser = req.body;
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
      console.error('Failed to create user in Firebase Auth:', authErr);
      if (authErr.code === 'auth/email-already-exists') {
        try {
          const auth = getFirebaseAuth();
          const existingRecord = await auth.getUserByEmail(newUser.email);
          await auth.updateUser(existingRecord.uid, { password: rawPassword });
        } catch(e) {}
      }
    }

    await db.insert(users).values(newUser);
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
      console.error('Failed to update user in Firebase Auth:', authErr);
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
