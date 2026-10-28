import React, { useState, useEffect } from 'react';
import { AstrologerAuthGuard } from './AstrologerAuthGuard';
import { AstroboardView } from './AstroboardView';
import { AuthUserProfile } from '../lib/firebase';
import { Reader } from '../types';

interface AstrologerStandaloneAppProps {
  onBackToSite?: () => void;
}

export const AstrologerStandaloneApp: React.FC<AstrologerStandaloneAppProps> = ({ onBackToSite }) => {
  const [readers, setReaders] = useState<Reader[]>([]);

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
    fetch(`/api/readers/${readerId}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
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
      {(_profile: AuthUserProfile, _matchedReader: Reader | null) => (
        <AstroboardView
          onBackToSite={handleExit}
          readers={readers}
          onToggleReaderOnline={handleToggleOnline}
        />
      )}
    </AstrologerAuthGuard>
  );
};
