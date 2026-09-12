import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import App from './App';
import { LangProvider } from './i18n';
import { ProfileProvider } from './net/ProfileContext';
import { registerServiceWorker } from './pwa';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <MotionConfig reducedMotion="user">
        <ProfileProvider>
          <App />
        </ProfileProvider>
      </MotionConfig>
    </LangProvider>
  </StrictMode>,
);

void registerServiceWorker();
