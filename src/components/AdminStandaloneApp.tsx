import React from 'react';
import { AdminAuthGuard } from './AdminAuthGuard';
import { AdminCMSPanel } from './AdminCMSPanel';
import { AuthUserProfile } from '../lib/firebase';

export const AdminStandaloneApp: React.FC = () => {
  return (
    <AdminAuthGuard>
      {(profile: AuthUserProfile) => (
        <AdminCMSPanel
          onBackToSite={() => {
            window.location.reload();
          }}
          currentAdminProfile={profile}
        />
      )}
    </AdminAuthGuard>
  );
};
