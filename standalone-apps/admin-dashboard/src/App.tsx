import React from 'react';
import { AdminAuthGuard } from '../../../src/components/AdminAuthGuard';
import { AdminCMSPanel } from '../../../src/components/AdminCMSPanel';
import { AuthUserProfile } from '../../../src/lib/firebase';

export default function App() {
  return (
    <AdminAuthGuard>
      {(profile: AuthUserProfile) => (
        <AdminCMSPanel
          onBackToSite={() => {
            window.location.reload();
          }}
        />
      )}
    </AdminAuthGuard>
  );
}
