import React from 'react';
import { AdminAuthGuard } from './AdminAuthGuard';
import { AdminCMSPanel } from './AdminCMSPanel';
import { AuthUserProfile } from '../lib/firebase';

interface AdminStandaloneAppProps {
  onBackToSite?: () => void;
  initialTab?: string;
}

export const AdminStandaloneApp: React.FC<AdminStandaloneAppProps> = ({ onBackToSite, initialTab = 'overview' }) => {
  return (
    <AdminAuthGuard onBackToSite={onBackToSite}>
      {(profile: AuthUserProfile) => (
        <AdminCMSPanel
          onBackToSite={onBackToSite || (() => {
            window.location.href = '/';
          })}
          currentAdminProfile={profile}
          initialTab={initialTab}
        />
      )}
    </AdminAuthGuard>
  );
};

