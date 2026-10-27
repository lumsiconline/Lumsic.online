import React, { useState, useEffect } from 'react';
import { AstrologerAuthGuard } from './AstrologerAuthGuard';
import { AstroboardView } from './AstroboardView';
import { AuthUserProfile } from '../lib/firebase';
import { Reader } from '../types';

export const AstrologerStandaloneApp: React.FC = () => {
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

  return (
    <AstrologerAuthGuard>
      {(profile: AuthUserProfile, matchedReader: Reader | null) => (
        <AstroboardView
          onBackToSite={() => {
            window.location.reload();
          }}
          readers={readers}
          onToggleReaderOnline={handleToggleOnline}
        />
      )}
    </AstrologerAuthGuard>
  );
};
