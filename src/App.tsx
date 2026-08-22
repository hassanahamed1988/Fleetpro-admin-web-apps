import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Users, Car, Settings, ShieldAlert, 
  Activity, Bell, Moon, Sun, Monitor, Palette, 
  UserCircle, Menu, X, LogOut, ChevronRight, LogIn, Lock, Languages, Coins,
  PanelLeftClose, PanelLeftOpen, Sliders, Smartphone, Building2
} from 'lucide-react';

import { User, Vehicle, ActivityLog, SystemNotification, AppSettings, RolePermission, ThemeColor, DisplayMode } from './types';
import { initialUsers, initialVehicles, initialActivityLogs, 
  initialNotifications, initialAppSettings, initialRolePermissions 
} from './data';

import { useLanguage } from './contexts/LanguageContext';

// Components
import { ProfileView } from "./components/ProfileView";
import { DashboardView } from './components/DashboardView';
import { UserManagementView } from './components/UserManagementView';
import { VehiclesView } from './components/VehiclesView';
import { SettingsView } from './components/SettingsView';
import { AdminRoleView } from './components/AdminRoleView';
import { ActivityLogView } from './components/ActivityLogView';
import { NotificationView } from './components/NotificationView';
import { Toast, ToastMessage } from './components/Toast';
import { IOSModal } from './components/IOSModal';
import { LoginView } from './components/LoginView';
import { TwoFactorSetupModal } from './components/TwoFactorSetupModal';
import { MustChangeCredentialsModal } from './components/MustChangeCredentialsModal';
import { ControlPanelView } from './components/ControlPanelView';
import { MobileTripsView } from './components/MobileApp';
import { CompanyManagementView } from './components/CompanyManagementView';

export default function App() {
  const { 
    language, 
    setLanguage, 
    currency, 
    setCurrency, 
    supportedCurrencies, 
    t, 
    supportedLanguages, 
    toDigits 
  } = useLanguage();

  // Versioned migration to wipe out old demo mock data from localStorage
  useEffect(() => {
    const isDemoPurged = localStorage.getItem('fleetpro_demo_purged_v2');
    if (!isDemoPurged) {
      setUsers(initialUsers);
      setVehicles(initialVehicles);
      setActivityLogs(initialActivityLogs);
      setNotifications(initialNotifications);
      localStorage.setItem('fleetpro_users', JSON.stringify(initialUsers));
      localStorage.setItem('fleetpro_vehicles', JSON.stringify(initialVehicles));
      localStorage.setItem('fleetpro_logs', JSON.stringify(initialActivityLogs));
      localStorage.setItem('fleetpro_notifications', JSON.stringify(initialNotifications));
      localStorage.setItem('fleetpro_demo_purged_v2', 'true');
    }
  }, []);

  // State Databases (Load from localStorage or fallback to defaults)
  const [users, setUsers] = useState<User[]>(() => {
    const isDemoPurged = localStorage.getItem('fleetpro_demo_purged_v2');
    if (!isDemoPurged) return initialUsers;
    const saved = localStorage.getItem('fleetpro_users');
    if (!saved || saved === 'undefined') return initialUsers;
    try {
      return JSON.parse(saved);
    } catch {
      return initialUsers;
    }
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const isDemoPurged = localStorage.getItem('fleetpro_demo_purged_v2');
    if (!isDemoPurged) return initialVehicles;
    const saved = localStorage.getItem('fleetpro_vehicles');
    if (!saved || saved === 'undefined') return initialVehicles;
    try {
      return JSON.parse(saved);
    } catch {
      return initialVehicles;
    }
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const isDemoPurged = localStorage.getItem('fleetpro_demo_purged_v2');
    if (!isDemoPurged) return initialActivityLogs;
    const saved = localStorage.getItem('fleetpro_logs');
    if (!saved || saved === 'undefined') return initialActivityLogs;
    try {
      return JSON.parse(saved);
    } catch {
      return initialActivityLogs;
    }
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const isDemoPurged = localStorage.getItem('fleetpro_demo_purged_v2');
    if (!isDemoPurged) return initialNotifications;
    const saved = localStorage.getItem('fleetpro_notifications');
    if (!saved || saved === 'undefined') return initialNotifications;
    try {
      return JSON.parse(saved);
    } catch {
      return initialNotifications;
    }
  });

  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('fleetpro_settings');
    if (saved && saved !== 'undefined') {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.appName && (parsed.appName.includes('H8K') || parsed.appName.includes('h8k'))) {
          return initialAppSettings;
        }
        return parsed;
      } catch {
        return initialAppSettings;
      }
    }
    return initialAppSettings;
  });

  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(() => {
    const saved = localStorage.getItem('fleetpro_permissions');
    if (!saved || saved === 'undefined') return initialRolePermissions;
    try {
      const parsed = JSON.parse(saved) as RolePermission[];
      if (Array.isArray(parsed) && !parsed.some(p => p.role === 'Users')) {
        const usersDefault = initialRolePermissions.find(p => p.role === 'Users');
        if (usersDefault) {
          parsed.push(usersDefault);
        }
      }
      return parsed;
    } catch {
      return initialRolePermissions;
    }
  });

  // UI preferences (Saved to localStorage)
  const [themeColor, setThemeColor] = useState<ThemeColor>(() => {
    return (localStorage.getItem('fleetpro_theme_color') as ThemeColor) || 'blue';
  });

  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
    return (localStorage.getItem('fleetpro_display_mode') as DisplayMode) || 'light';
  });

  // General UI States
  const [currentView, setCurrentView] = useState<string>('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarExpanded, setDesktopSidebarExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('fleetpro_sidebar_expanded');
    if (saved === null || saved === 'undefined') return true;
    try {
      return JSON.parse(saved);
    } catch {
      return true;
    }
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<User>(() => {
    return initialUsers.find(u => u.role === 'Admin Owner') || initialUsers[0];
  });

  useEffect(() => {
    if (!isLoggedIn) return;
    
    fetch('/api/auth/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setUsers(data);
      })
      .catch(console.error);

    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setVehicles(data);
      })
      .catch(console.error);

    fetch('/api/auth/logs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setActivityLogs(data);
      })
      .catch(console.error);

    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(console.error);

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.appName) setAppSettings(data);
      })
      .catch(console.error);

    fetch('/api/permissions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setRolePermissions(data.map((r: any) => ({ role: r.role, modules: r.modules })));
      })
      .catch(console.error);
  }, [isLoggedIn]);

  // Persist State Changes
  useEffect(() => {
    localStorage.setItem('fleetpro_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('fleetpro_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('fleetpro_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('fleetpro_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('fleetpro_settings', JSON.stringify(appSettings));
  }, [appSettings]);

  useEffect(() => {
    localStorage.setItem('fleetpro_permissions', JSON.stringify(rolePermissions));
  }, [rolePermissions]);

  // Guard against Vehicles view for Admin Owner
  useEffect(() => {
    if (authenticatedUser.role === 'Admin Owner' && currentView === 'Vehicles') {
      setCurrentView('Dashboard');
    }
  }, [authenticatedUser.role, currentView]);

  // Global fetch interceptor to append multi-tenant headers transparently
  useEffect(() => {
    const originalFetch = window.fetch;
    const newFetch = function (this: any, input: RequestInfo | URL, init?: RequestInit) {
      if (typeof input === 'string' && input.startsWith('/api/')) {
        init = init || {};
        const headers = new Headers(init.headers || {});
        if (authenticatedUser) {
          headers.set('x-user-role', authenticatedUser.role || '');
          headers.set('x-user-company-id', authenticatedUser.companyId || '');
          headers.set('x-user-id', authenticatedUser.id || '');
        }
        init.headers = headers;
      }
      return originalFetch.call(this, input, init);
    };

    try {
      Object.defineProperty(window, 'fetch', {
        value: newFetch,
        configurable: true,
        writable: true,
        enumerable: true
      });
    } catch (e) {
      console.warn("Failed to redefine window.fetch, falling back to prototype override", e);
      try {
        Object.defineProperty(Object.getPrototypeOf(window), 'fetch', {
          value: newFetch,
          configurable: true,
          writable: true,
          enumerable: true
        });
      } catch (err) {
        console.error("Failed to intercept fetch:", err);
      }
    }

    return () => {
      try {
        Object.defineProperty(window, 'fetch', {
          value: originalFetch,
          configurable: true,
          writable: true,
          enumerable: true
        });
      } catch (e) {
        try {
          Object.defineProperty(Object.getPrototypeOf(window), 'fetch', {
            value: originalFetch,
            configurable: true,
            writable: true,
            enumerable: true
          });
        } catch (err) {
          console.error("Failed to restore fetch:", err);
        }
      }
    };
  }, [authenticatedUser]);

  // Check if active mode is dark
  const isDarkMode = displayMode === 'dark' || (displayMode === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Handle Display Mode (Dark Mode)
  useEffect(() => {
    const handleThemeChange = () => {
      const isDark = displayMode === 'dark' || (displayMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('fleetpro_display_mode', displayMode);
    };
    handleThemeChange();
  }, [displayMode]);

  // Save Theme Color preference
  useEffect(() => {
    localStorage.setItem('fleetpro_theme_color', themeColor);
  }, [themeColor]);

  // Save Desktop Sidebar Expanded preference
  useEffect(() => {
    localStorage.setItem('fleetpro_sidebar_expanded', JSON.stringify(desktopSidebarExpanded));
  }, [desktopSidebarExpanded]);

  // Toast System State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const triggerToast = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, title, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Confirm Modal System State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Helper to log admin actions
  const logAdminAction = async (action: string, category: ActivityLog['category'], details: string) => {
    const newLog: ActivityLog = {
      id: `LOG-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: authenticatedUser.id,
      userName: authenticatedUser.name,
      userEmail: authenticatedUser.email,
      action,
      category,
      details,
      status: 'Success',
      ipAddress: '192.168.1.' + Math.floor(10 + Math.random() * 90),
    };
    setActivityLogs(prev => [newLog, ...prev]);

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
    } catch (err) {
      console.error('Failed to save log to backend', err);
    }
  };

  // Navigation Items
  const navItems = [
    { id: 'Profile', key: 'My Profile', icon: <UserCircle className="w-5 h-5" /> },
    { id: 'Dashboard', key: 'nav.dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'Company Management', key: 'Company Management', icon: <Building2 className="w-5 h-5" /> },
    { id: 'Control Panel', key: 'Control Panel', icon: <Sliders className="w-5 h-5" /> },
    { id: 'Mobile Trips', key: 'Mobile App Controls', icon: <Smartphone className="w-5 h-5" /> },
    { id: 'User Management', key: 'nav.userManagement', icon: <Users className="w-5 h-5" /> },
    { id: 'Vehicles', key: 'nav.vehicles', icon: <Car className="w-5 h-5" /> },
    { id: 'Application Settings', key: 'nav.applicationSettings', icon: <Settings className="w-5 h-5" /> },
    { id: 'Role Permissions', key: 'nav.rolePermissions', icon: <ShieldAlert className="w-5 h-5" /> },
    { id: 'Activity Logs', key: 'nav.activityLogs', icon: <Activity className="w-5 h-5" /> },
    { id: 'Notifications', key: 'nav.notifications', icon: <Bell className="w-5 h-5" /> },
  ].filter((item) => {
    const isUserAdmin = authenticatedUser.role === 'Admin Owner' || authenticatedUser.role === 'Super Admin' || authenticatedUser.role === 'Admin';
    if (item.id === 'Control Panel' && !isUserAdmin) {
      return false;
    }
    if (item.id === 'Company Management' && authenticatedUser.role !== 'Admin Owner') {
      return false;
    }
    if (authenticatedUser.role === 'Admin Owner' && item.id === 'Vehicles') {
      return false;
    }
    return true;
  });

  // Dynamic Theme Styling Mapping
  const themeAccentBg = {
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-600',
    red: 'bg-rose-600',
    amber: 'bg-amber-600',
    purple: 'bg-purple-650',
  }[themeColor] || 'bg-blue-600';

  const themeTextActive = {
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
    red: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10',
  }[themeColor] || 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10';

  // If not logged in, render Secure Login view
  const mainContent = !isLoggedIn ? (
    <LoginView
      users={users}
      onLoginSuccess={(user) => {
        setAuthenticatedUser(user);
        setIsLoggedIn(true);
        // Clear any leftover toasts from previous session
        setToasts([]);
        triggerToast(
          t('✓ Authentication Successful'),
          t('Welcome back, {name} ({role})', { name: user.name, role: t(user.role) }),
          'success'
        );
      }}
      triggerToast={triggerToast}
    />
  ) : (
    <div className={`min-h-screen flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased selection:${themeColor === 'emerald' ? 'bg-emerald-500/20' : themeColor === 'red' ? 'bg-rose-500/20' : themeColor === 'amber' ? 'bg-amber-500/20' : themeColor === 'purple' ? 'bg-purple-500/20' : 'bg-blue-500/20'}`}>
      
      {/* Desktop Sidebar (Collapsible) */}
      <aside 
        className={`hidden md:flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-300 z-30 ${
          desktopSidebarExpanded ? 'w-64' : 'w-20'
        }`}
      >
        {/* Sidebar Header / Logo */}
        <div className={`p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center ${desktopSidebarExpanded ? 'justify-between' : 'justify-center'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <button
              onClick={() => setDesktopSidebarExpanded(!desktopSidebarExpanded)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 hover:opacity-90 active:scale-95 transition-all ${themeAccentBg}`}
              title={desktopSidebarExpanded ? t('Collapse Sidebar') : t('Expand Sidebar')}
            >
              <Menu className="w-5 h-5" />
            </button>
            {desktopSidebarExpanded && (
              <div className="truncate">
                <h1 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                  {appSettings.appName}
                </h1>
                <p className="text-[11px] text-zinc-400 capitalize">
                  {authenticatedUser.role}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive 
                    ? themeTextActive + ' shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-white'
                }`}
                title={desktopSidebarExpanded ? '' : t(item.key)}
              >
                <span className="shrink-0">{item.icon}</span>
                {desktopSidebarExpanded && (
                  <span className="truncate">{t(item.key)}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Desktop Sidebar Localization */}
        {desktopSidebarExpanded && (
          <div className="p-4 space-y-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                <Languages className="w-3 h-3" />
                {t('Language')}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full h-8 px-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 outline-none"
              >
                {supportedLanguages.map(l => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                <Coins className="w-3 h-3" />
                {t('Currency')}
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full h-8 px-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 outline-none"
              >
                {supportedCurrencies.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.name[language]} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Sidebar Footer / User Info */}
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800">
          <div className={`flex items-center gap-3 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 ${!desktopSidebarExpanded && 'flex-col justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-xs shrink-0">
              {authenticatedUser.name.charAt(0)}
            </div>
            {desktopSidebarExpanded ? (
              <>
                <div className="flex-1 truncate">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                    {authenticatedUser.name}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate">
                    {authenticatedUser.email}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setDesktopSidebarExpanded(false)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors"
                    title={t('Collapse Sidebar')}
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title={t('Sign Out')}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 mt-1 w-full">
                <button
                  onClick={() => setDesktopSidebarExpanded(true)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title={t('Expand Sidebar')}
                >
                  <PanelLeftOpen className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title={t('Sign Out')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-zinc-950/60 z-40 backdrop-blur-xs cursor-pointer"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col md:hidden transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${themeAccentBg}`}>
              <Menu className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-zinc-900 dark:text-white">
                {appSettings.appName}
              </h1>
              <p className="text-[11px] text-zinc-400 capitalize">
                {authenticatedUser.role}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive 
                    ? themeTextActive + ' shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <span>{item.icon}</span>
                <span>{t(item.key)}</span>
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
            <div className="space-y-1.5 px-1">
              <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                <Languages className="w-3 h-3" />
                {t('Language')}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 outline-none"
              >
                {supportedLanguages.map(l => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 px-1">
              <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                <Coins className="w-3 h-3" />
                {t('Currency')}
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 outline-none"
              >
                {supportedCurrencies.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.name[language]} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => {
              setShowLogoutConfirm(true);
              setSidebarOpen(false);
            }}
            className="w-full h-10 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t('Sign Out')}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        onClick={() => { if (sidebarOpen) setSidebarOpen(false); }}
        className="flex-1 flex flex-col min-w-0"
      >
        
        {/* Top Header Navbar */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                {t(navItems.find(n => n.id === currentView)?.key || currentView)}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button
              onClick={() => setCurrentView('Notifications')}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative"
              title={t('nav.notifications')}
            >
              <Bell className="w-4 h-4" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => {
                const nextMode = displayMode === 'light' ? 'dark' : 'light';
                setDisplayMode(nextMode);
              }}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title={displayMode === 'light' ? t('Switch to Dark Mode') : t('Switch to Light Mode')}
            >
              {displayMode === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          </div>
        </header>

        {/* View content container */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          <AnimatePresence mode="wait">
            {currentView === 'Profile' && (
              <ProfileView
                user={authenticatedUser}
                themeColor={themeColor}
              />
            )}
            {currentView === 'Dashboard' && (
              <DashboardView
                users={users}
                vehicles={vehicles}
                activityLogs={activityLogs}
                notifications={notifications}
                themeColor={themeColor}
                currentUserRole={authenticatedUser.role}
                onNavigate={(v) => setCurrentView(v)}
                onUpdateUser={async (uu) => {
                  setUsers((prev) => prev.map(u => u.id === uu.id ? uu : u));
                  const actionLabel = uu.status === 'Active' ? 'Approve User Registration' : 'Reject User Registration';
                  logAdminAction(actionLabel, 'User Management', `${uu.status === 'Active' ? 'Approved' : 'Rejected'} registration request for ${uu.name} (${uu.id}).`);
                  try {
                    await fetch(`/api/auth/users/${uu.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(uu),
                    });
                  } catch (err) {
                    console.error('Failed to sync updated user to backend', err);
                  }
                }}
              />
            )}
            {currentView === 'User Management' && (
              <UserManagementView
                users={users}
                onAddUser={async (nu) => {
                  setUsers((prev) => [nu, ...prev]);
                  logAdminAction('Create User Record', 'User Management', `Created new user record for ${nu.name} (${nu.id}).`);
                  try {
                    const res = await fetch('/api/auth/users', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(nu),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      triggerToast('Registration Failed', data.error || 'Failed to create user', 'error');
                      setUsers((prev) => prev.filter(u => u.id !== nu.id));
                    } else if (data.user) {
                      setUsers((prev) => prev.map(u => u.id === nu.id ? data.user : u));
                    }
                  } catch (err) {
                    console.error('Failed to sync new user to backend', err);
                  }
                }}
                onUpdateUser={async (uu) => {
                  setUsers((prev) => prev.map(u => u.id === uu.id ? uu : u));
                  logAdminAction('Update User Record', 'User Management', `Updated user record for ${uu.name} (${uu.id}).`);
                  try {
                    await fetch(`/api/auth/users/${uu.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(uu),
                    });
                  } catch (err) {
                    console.error('Failed to sync updated user to backend', err);
                  }
                }}
                onDeleteUser={async (id) => {
                  const targetUser = users.find(u => u.id === id);
                  setUsers((prev) => prev.filter(u => u.id !== id));
                  if (targetUser) {
                    logAdminAction('Delete User Record', 'User Management', `Deleted user ${targetUser.name} (${targetUser.id}).`);
                  }
                  try {
                    await fetch(`/api/auth/users/${id}`, { method: 'DELETE' });
                  } catch (err) {
                    console.error('Failed to sync user deletion to backend', err);
                  }
                }}
                themeColor={themeColor}
                triggerToast={triggerToast}
                triggerConfirm={triggerConfirm}
                isAdmin={authenticatedUser.role === 'Admin Owner' || authenticatedUser.role === 'Super Admin' || authenticatedUser.role === 'Admin'}
              />
            )}
            {currentView === 'Company Management' && (
              <CompanyManagementView
                themeColor={themeColor}
                triggerToast={triggerToast}
                triggerConfirm={triggerConfirm}
              />
            )}
            {currentView === 'Vehicles' && (
              <VehiclesView
                vehicles={vehicles}
                onAddVehicle={async (nv) => {
                  setVehicles((prev) => [nv, ...prev]);
                  logAdminAction('Register Fleet Vehicle', 'Vehicle', `Registered vehicle ${nv.plateNumber} to the database.`);
                  try {
                    await fetch('/api/vehicles', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(nv)
                    });
                  } catch (err) {
                    console.error('Failed to sync new vehicle', err);
                  }
                }}
                onUpdateVehicle={async (uv) => {
                  setVehicles((prev) => prev.map(v => v.id === uv.id ? uv : v));
                  logAdminAction('Update Fleet Vehicle', 'Vehicle', `Updated vehicle ${uv.plateNumber}.`);
                  try {
                    await fetch(`/api/vehicles/${uv.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(uv)
                    });
                  } catch (err) {
                    console.error('Failed to sync updated vehicle', err);
                  }
                }}
                onDeleteVehicle={async (id) => {
                  setVehicles((prev) => prev.filter(v => v.id !== id));
                  logAdminAction('Decommission Vehicle', 'Vehicle', `Decommissioned vehicle ${id}.`);
                  try {
                    await fetch(`/api/vehicles/${id}`, {
                      method: 'DELETE'
                    });
                  } catch (err) {
                    console.error('Failed to sync deleted vehicle', err);
                  }
                }}
                themeColor={themeColor}
                triggerToast={triggerToast}
                triggerConfirm={triggerConfirm}
                isAdmin={authenticatedUser.role === 'Admin Owner' || authenticatedUser.role === 'Super Admin' || authenticatedUser.role === 'Admin'}
              />
            )}
            {currentView === 'Application Settings' && (
              <SettingsView
                user={authenticatedUser}
                settings={appSettings}
                onUpdateUser={setAuthenticatedUser}
                onUpdateSettings={async (newSettings) => {
                  setAppSettings(newSettings);
                  logAdminAction('Update App Settings', 'Settings', 'Modified global application configurations.');
                  try {
                    await fetch('/api/settings', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(newSettings)
                    });
                  } catch (err) {
                    console.error('Failed to sync settings update', err);
                  }
                }}
                themeColor={themeColor}
                displayMode={displayMode}
                onChangeThemeColor={setThemeColor}
                onChangeDisplayMode={setDisplayMode}
                triggerToast={triggerToast}
                triggerConfirm={triggerConfirm}
                isAdmin={authenticatedUser.role === 'Admin Owner' || authenticatedUser.role === 'Super Admin' || authenticatedUser.role === 'Admin'}
              />
            )}
            {currentView === 'Role Permissions' && (
              <AdminRoleView
                permissions={rolePermissions}
                onUpdatePermissions={async (perms) => {
                  setRolePermissions(perms);
                  logAdminAction('Update RBAC Permissions', 'Security', 'Modified role-based access control permission matrix.');
                  try {
                    await fetch('/api/permissions', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ permissions: perms })
                    });
                  } catch (err) {
                    console.error('Failed to sync permissions update', err);
                  }
                }}
                themeColor={themeColor}
                triggerToast={triggerToast}
                triggerConfirm={triggerConfirm}
              />
            )}
            {currentView === 'Activity Logs' && (
              <ActivityLogView
                logs={activityLogs}
                themeColor={themeColor}
                triggerToast={triggerToast}
              />
            )}
            {currentView === 'Control Panel' && (
              <ControlPanelView
                themeColor={themeColor}
                triggerToast={triggerToast}
                triggerConfirm={triggerConfirm}
              />
            )}
            {currentView === 'Mobile Trips' && (
              <MobileTripsView
                users={users}
                currentUser={authenticatedUser}
                onAddUser={async (nu) => {
                  setUsers((prev) => [nu, ...prev]);
                  logAdminAction('Create Mobile User Record', 'User Management', `Created new mobile user record for ${nu.name} (${nu.id}).`);
                  try {
                    const res = await fetch('/api/auth/users', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(nu),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      triggerToast('Registration Failed', data.error || 'Failed to create mobile user', 'error');
                      setUsers((prev) => prev.filter(u => u.id !== nu.id));
                    } else if (data.user) {
                      setUsers((prev) => prev.map(u => u.id === nu.id ? data.user : u));
                    }
                  } catch (err) {
                    console.error('Failed to sync new mobile user to backend', err);
                  }
                }}
                onUpdateUser={async (uu) => {
                  setUsers((prev) => prev.map(u => u.id === uu.id ? uu : u));
                  logAdminAction('Update Mobile User Record', 'User Management', `Updated mobile user record for ${uu.name} (${uu.id}).`);
                  try {
                    await fetch(`/api/auth/users/${uu.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(uu),
                    });
                  } catch (err) {
                    console.error('Failed to sync updated mobile user to backend', err);
                  }
                }}
                onDeleteUser={async (id) => {
                  const targetUser = users.find(u => u.id === id);
                  setUsers((prev) => prev.filter(u => u.id !== id));
                  if (targetUser) {
                    logAdminAction('Delete Mobile User Record', 'User Management', `Deleted mobile user ${targetUser.name} (${targetUser.id}).`);
                  }
                  try {
                    await fetch(`/api/auth/users/${id}`, { method: 'DELETE' });
                  } catch (err) {
                    console.error('Failed to sync mobile user deletion to backend', err);
                  }
                }}
                themeColor={themeColor}
                triggerToast={triggerToast}
                triggerConfirm={triggerConfirm}
              />
            )}
            {currentView === 'Notifications' && (
              <NotificationView
                notifications={notifications}
                onMarkRead={async (id) => {
                  setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
                  try {
                    await fetch(`/api/notifications/${id}`, {
                      method: 'PUT'
                    });
                  } catch (err) {
                    console.error('Failed to sync notification mark read', err);
                  }
                }}
                onClearAll={async () => {
                  setNotifications([]);
                  triggerToast(t('Cleared'), t('All system notifications cleared.'), 'info');
                  try {
                    await fetch('/api/notifications/clear', {
                      method: 'POST'
                    });
                  } catch (err) {
                    console.error('Failed to sync notification clear', err);
                  }
                }}
                themeColor={themeColor}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased`}>
      {mainContent}

      {/* Global Confirmation UI for Logout - Center card style */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="fixed inset-0 bg-zinc-950/20 dark:bg-black/40 backdrop-blur-[2px] z-[110] pointer-events-auto"
            />
            <div className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 400, 
                  damping: 30 
                }}
                className="pointer-events-auto bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col items-center gap-5 max-w-xs w-full text-center"
              >
                <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                  <LogOut className="w-6 h-6" />
                </div>
                
                <div className="flex flex-col items-center">
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {t('Confirm Sign Out?')}
                  </h4>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
                    {t('Are you sure you want to end your session?')}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full mt-2">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="w-full h-11 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    onClick={() => {
                      setShowLogoutConfirm(false);
                      setIsLoggedIn(false);
                      // Trigger the toast which will now show in the center modal style
                      triggerToast(t('Logged Out'), t('Secure session terminated successfully.'), 'info');
                    }}
                    className="w-full h-11 rounded-xl bg-rose-500 text-white text-sm font-semibold shadow-lg shadow-rose-500/25 hover:bg-rose-600 transition-colors"
                  >
                    {t('Sign Out')}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notification Container */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Confirmation Modal */}
      <IOSModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        confirmText={t('Confirm')}
        cancelText={t('Cancel')}
      />
    </div>
  );
}
