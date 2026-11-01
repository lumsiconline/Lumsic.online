import './lib/apiBase';
import { createRoot } from 'react-dom/client';
import { AdminStandaloneApp } from './components/AdminStandaloneApp';
import './index.css';

const params = new URLSearchParams(window.location.search);
const initialTab = params.get('tab') || 'overview';
createRoot(document.getElementById('root')!).render(<AdminStandaloneApp initialTab={initialTab} />);
