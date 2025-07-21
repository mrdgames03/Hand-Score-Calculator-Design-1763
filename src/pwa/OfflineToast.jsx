import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiWifi, FiWifiOff } = FiIcons;

function OfflineToast({ isOffline, onDismiss, language }) {
  const translations = {
    en: {
      offline: 'You are offline. The app will continue to work.',
      online: 'You are back online!'
    },
    ar: {
      offline: 'أنت غير متصل بالإنترنت. سيستمر التطبيق في العمل.',
      online: 'لقد عدت متصلاً بالإنترنت!'
    }
  };

  const t = translations[language] || translations.en;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 rtl:space-x-reverse ${
        isOffline ? 'bg-amber-500' : 'bg-green-500'
      } text-white`}
    >
      <SafeIcon icon={isOffline ? FiWifiOff : FiWifi} className="text-xl" />
      <span className="text-sm font-medium">
        {isOffline ? t.offline : t.online}
      </span>
    </motion.div>
  );
}

export default OfflineToast;