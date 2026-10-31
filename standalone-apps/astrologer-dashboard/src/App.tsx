import React from 'react';
import { AstrologerStandaloneApp } from '../../../../src/components/AstrologerStandaloneApp';

// Keep the standalone dashboard on the exact same authentication, reader identity,
// session polling, SSE, and chat implementation as the production astrologer portal.
export default function App() {
  return <AstrologerStandaloneApp onBackToSite={() => { window.location.href = 'https://lumsic.online'; }} />;
}
