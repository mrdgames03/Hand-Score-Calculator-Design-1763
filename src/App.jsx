import React, { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GameSetup from './components/GameSetup';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import SharePreview from './components/SharePreview';
import { GameProvider } from './context/GameContext';
import { registerServiceWorker, checkForUpdates } from './pwa/registerSW';
import { useOfflineStatus } from './pwa/useOfflineStatus';
import OfflineToast from './pwa/OfflineToast';
import UpdatePrompt from './pwa/UpdatePrompt';
import InstallPrompt from './pwa/InstallPrompt';
import './App.css';

// Lazy load components for better performance
const ScoreEntry = lazy(() => import('./components/ScoreEntry'));
const LiveScoreboard = lazy(() => import('./components/LiveScoreboard'));
const GameResults = lazy(() => import('./components/GameResults'));
const SavedGames = lazy(() => import('./components/SavedGames'));
const Achievements = lazy(() => import('./components/Achievements'));

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="spinner"></div>
  </div>
);

function App() {
  const [currentView, setCurrentView] = useState('setup');
  const [language, setLanguage] = useState(() => {
    try {
      const savedLanguage = localStorage.getItem('handScoreLanguage');
      return savedLanguage || 'en';
    } catch (e) {
      console.error('Error accessing localStorage:', e);
      return 'en';
    }
  });
  const [swRegistration, setSwRegistration] = useState(null);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const { isOffline, showOfflineToast, showOnlineToast, dismissOfflineToast, dismissOnlineToast } = useOfflineStatus();

  // Register service worker and listen for updates
  useEffect(() => {
    const registerSW = async () => {
      const registration = await registerServiceWorker();
      if (registration) {
        setSwRegistration(registration);
      }
    };
    registerSW();

    // Listen for service worker updates
    const handleSWUpdate = (event) => {
      const registration = event.detail;
      if (registration) {
        setSwRegistration(registration);
        setShowUpdatePrompt(true);
      }
    };
    window.addEventListener('swUpdate', handleSWUpdate);

    // Check for updates periodically
    const updateInterval = setInterval(() => {
      checkForUpdates();
    }, 60 * 60 * 1000); // Check once per hour

    return () => {
      window.removeEventListener('swUpdate', handleSWUpdate);
      clearInterval(updateInterval);
    };
  }, []);

  const toggleLanguage = () => {
    try {
      const newLanguage = language === 'en' ? 'ar' : 'en';
      setLanguage(newLanguage);
      localStorage.setItem('handScoreLanguage', newLanguage);
      document.documentElement.lang = newLanguage;
      document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
    } catch (e) {
      console.error('Error saving language preference:', e);
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  return (
    <GameProvider>
      <div className={`app ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <Router>
          <Navigation
            currentView={currentView}
            setCurrentView={setCurrentView}
            language={language}
            toggleLanguage={toggleLanguage}
          />
          
          {/* Dynamic meta tags for sharing */}
          <SharePreview />
          
          <main className="main-content pt-32 min-h-screen">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Navigate to="/setup" replace />} />
                <Route
                  path="/setup"
                  element={
                    <motion.div
                      key="setup"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <GameSetup onGameStart={() => setCurrentView('game')} language={language} />
                    </motion.div>
                  }
                />
                <Route
                  path="/game"
                  element={
                    <motion.div
                      key="game"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Suspense fallback={<LoadingFallback />}>
                        <ScoreEntry onGameComplete={() => setCurrentView('results')} language={language} />
                      </Suspense>
                    </motion.div>
                  }
                />
                <Route
                  path="/scoreboard"
                  element={
                    <motion.div
                      key="scoreboard"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Suspense fallback={<LoadingFallback />}>
                        <LiveScoreboard language={language} />
                      </Suspense>
                    </motion.div>
                  }
                />
                <Route
                  path="/results"
                  element={
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Suspense fallback={<LoadingFallback />}>
                        <GameResults onPlayAgain={() => setCurrentView('setup')} language={language} />
                      </Suspense>
                    </motion.div>
                  }
                />
                <Route
                  path="/saved"
                  element={
                    <motion.div
                      key="saved"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Suspense fallback={<LoadingFallback />}>
                        <SavedGames language={language} />
                      </Suspense>
                    </motion.div>
                  }
                />
                <Route
                  path="/achievements"
                  element={
                    <motion.div
                      key="achievements"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Suspense fallback={<LoadingFallback />}>
                        <Achievements language={language} />
                      </Suspense>
                    </motion.div>
                  }
                />
              </Routes>
            </AnimatePresence>
          </main>

          <Footer language={language} />

          {/* PWA-specific UI elements */}
          <AnimatePresence>
            {showOfflineToast && (
              <OfflineToast isOffline={true} onDismiss={dismissOfflineToast} language={language} />
            )}
            {showOnlineToast && (
              <OfflineToast isOffline={false} onDismiss={dismissOnlineToast} language={language} />
            )}
            {showUpdatePrompt && (
              <UpdatePrompt
                registration={swRegistration}
                onDismiss={() => setShowUpdatePrompt(false)}
                language={language}
              />
            )}
          </AnimatePresence>

          {/* Install Prompt */}
          <InstallPrompt language={language} />
        </Router>
      </div>
    </GameProvider>
  );
}

export default App;