import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { updateServiceWorker } from './registerSW';

const { FiRefreshCw } = FiIcons;

function UpdatePrompt({ registration, onDismiss, language }) {
  const translations = {
    en: {
      newVersion: 'New version available!',
      update: 'Update now',
      dismiss: 'Later'
    },
    ar: {
      newVersion: 'إصدار جديد متاح!',
      update: 'تحديث الآن',
      dismiss: 'لاحقاً'
    }
  };

  const t = translations[language] || translations.en;

  const handleUpdate = () => {
    updateServiceWorker(registration);
    onDismiss();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 z-50 w-11/12 max-w-sm"
    >
      <div className="flex items-center">
        <div className="bg-blue-100 p-2 rounded-full mr-3">
          <SafeIcon icon={FiRefreshCw} className="text-blue-600 text-lg" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{t.newVersion}</h3>
        </div>
      </div>
      <div className="flex mt-3 space-x-3 rtl:space-x-reverse">
        <button
          onClick={handleUpdate}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {t.update}
        </button>
        <button
          onClick={onDismiss}
          className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
        >
          {t.dismiss}
        </button>
      </div>
    </motion.div>
  );
}

export default UpdatePrompt;