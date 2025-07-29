import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import 'react-phone-number-input/style.css';

import AuthContext from '../src/context/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <AuthContext>
      <App />
    </AuthContext>
  // </StrictMode>,
);