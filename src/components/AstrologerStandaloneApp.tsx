import React, { useState, useEffect } from 'react';
import { AstrologerAuthGuard } from './AstrologerAuthGuard';
import { AstroboardView } from './AstroboardView';
import { AuthUserProfile } from '../lib/firebase';
import { Reader } from '../types';
import { READERS } from '../data/readers';

interface AstrologerStandaloneAppProps {
  onBackToSite?: () => void;
}

export const AstrologerStandaloneApp: React.FC<AstrologerStandaloneAppProps> = ({ onBackToSite }) => {
  const [readers, setReaders] = useState<Reader[]>(READERS);

  useEffect(() => {
    fetch('/api/readers')
      .then(res => res.json())
      .then(data => {
        if (data.readers && Array.isArray(data.readers)) {
          setReaders(data.readers);
        }
      })
      .catch(console.error);
  }, []);

  const handleToggleOnline = (readerId: string, isOnline: boolean) => {
    const astroToken = localStorage.getItem('astrodashboard_token') || '';
    fetch(`/api/readers/${readerId}/toggle`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(astroToken ? { 'x-astrologer-token': astroToken, Authorization: `Bearer ${astroToken}` } : {})
      },
      body: JSON.stringify({ field: 'isOnline', value: isOnline })
    })
      .then(res => res.json())
      .then(data => {
        if (data.reader) {
          setReaders(prev => prev.map(r => r.id === data.reader.id ? data.reader : r));
        }
      })
      .catch(console.error);
  };

  const handleExit = onBackToSite || (() => {
    window.location.href = '/';
  });

  return (
    <AstrologerAuthGuard onBackToSite={handleExit}>
      {(_profile: AuthUserProfile, matchedReader: Reader | null) => (
        <AstroboardView
          onBackToSite={handleExit}
          readers={readers}
          authenticatedReader={matchedReader}
          onToggleReaderOnline={handleToggleOnline}
        />
      )}
    </AstrologerAuthGuard>
  );
};
