import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useVersion } from '../hooks/useVersion'; // Import the new hook

const { FiInfo, FiHeart } = FiIcons;

const translations = {
  en: {
    version: 'Version',
    madeWith: 'Made with',
    by: 'by Maysalward',
    lastUpdated: 'Last Updated'
  },
  ar: {
    version: 'الإصدار',
    madeWith: 'صنع بـ',
    by: 'من قبل ميسالورد',
    lastUpdated: 'آخر تحديث'
  }
};

function Footer({ language }) {
  const { version, lastUpdated } = useVersion();
  const t = translations[language];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-sm border-t border-white/20 mt-16"
    >
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Version Info */}
          <div className="flex items-center space-x-3 text-white/80">
            <SafeIcon icon={FiInfo} className="text-lg" />
            <div className="text-center md:text-left">
              <div className="text-sm font-medium">
                {t.version} {version}
              </div>
              <div className="text-xs opacity-70">
                {t.lastUpdated}: {lastUpdated}
              </div>
            </div>
          </div>

          {/* Made with Love */}
          <div className="flex items-center space-x-2 text-white/80 text-sm">
            <span>{t.madeWith}</span>
            <SafeIcon icon={FiHeart} className="text-red-400 animate-pulse" />
            <span>{t.by}</span>
          </div>

          {/* Company Logo */}
          <div className="flex items-center">
            <img
              src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1752690093494-maysalward-primary-logo-landscape.png"
              alt="Maysalward Logo"
              className="h-6 w-auto opacity-80 hover:opacity-100 transition-opacity duration-200"
            />
          </div>
        </div>

        {/* Build Info - Only show in development */}
        {import.meta.env.DEV && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-center text-xs text-white/50">
              Development Build • React {React.version} • Vite
            </div>
          </div>
        )}
      </div>
    </motion.footer>
  );
}

export default Footer;