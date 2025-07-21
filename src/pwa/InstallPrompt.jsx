import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiDownload, FiX } = FiIcons;

function InstallPrompt({ language }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const translations = {
    en: {
      title: 'Install App',
      description: 'Install Hand Score Calculator for faster access and offline use',
      install: 'Install',
      dismiss: 'Not now'
    },
    ar: {
      title: 'تثبيت التطبيق',
      description: 'قم بتثبيت حاسبة نتائج لعبة هاند للوصول السريع والاستخدام دون إنترنت',
      install: 'تثبيت',
      dismiss: 'ليس الآن'
    }
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const hasUserDismissedPrompt = localStorage.getItem('installPromptDismissed');
    
    // Check if the app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches;
    
    if (hasUserDismissedPrompt || isAppInstalled) {
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      
      // Show the prompt to the user after a short delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // Reset the deferred prompt variable
    setDeferredPrompt(null);
    
    // Hide the install prompt
    setShowPrompt(false);
    
    // Log the outcome
    console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`);
  };

  const handleDismiss = () => {
    // Store that the user has dismissed the prompt
    localStorage.setItem('installPromptDismissed', 'true');
    
    // Hide the prompt
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 z-50 w-11/12 max-w-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <SafeIcon icon={FiDownload} className="text-blue-600 text-lg" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{t.title}</h3>
              <p className="text-sm text-gray-600">{t.description}</p>
            </div>
          </div>
          <button 
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Dismiss"
          >
            <SafeIcon icon={FiX} />
          </button>
        </div>
        <div className="mt-3 flex space-x-3 rtl:space-x-reverse">
          <button
            onClick={handleInstall}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            {t.install}
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
          >
            {t.dismiss}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default InstallPrompt;