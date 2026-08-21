import React from 'react';
import { User } from '../types';
import { UserManagementView } from './UserManagementView';

interface MobileTripsViewProps {
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  themeColor: 'blue' | 'emerald' | 'red' | 'amber' | 'purple';
  triggerToast: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  triggerConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export function MobileTripsView({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  themeColor,
  triggerToast,
  triggerConfirm,
}: MobileTripsViewProps) {
  return (
    <div className="space-y-6">
      <UserManagementView
        users={users}
        onAddUser={onAddUser}
        onUpdateUser={onUpdateUser}
        onDeleteUser={onDeleteUser}
        themeColor={themeColor}
        triggerToast={triggerToast}
        triggerConfirm={triggerConfirm}
        isMobileOnly={true}
      />
    </div>
  );
}
