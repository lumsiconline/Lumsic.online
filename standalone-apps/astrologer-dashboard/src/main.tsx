import { createRoot } from 'react-dom/client';
import '../../../src/lib/apiBase';
import App from './App';
import '../../../src/index.css';

createRoot(document.getElementById('root')!).render(<App />);
