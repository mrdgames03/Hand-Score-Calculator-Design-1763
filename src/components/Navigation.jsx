import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiSave, FiGlobe, FiMenu, FiX, FiHome, FiBarChart2, FiPlay, FiAward } = FiIcons;

const translations = {
  en: {
    setup: 'Setup',
    game: 'Game',
    scoreboard: 'Scoreboard',
    results: 'Results',
    saved: 'Saved Games',
    achievements: 'Achievements',
    language: 'عربي',
    menu: 'Menu'
  },
  ar: {
    setup: 'الإعداد',
    game: 'اللعبة',
    scoreboard: 'النتائج',
    results: 'النتائج النهائية',
    saved: 'الألعاب المحفوظة',
    achievements: 'الإنجازات',
    language: 'English',
    menu: 'القائمة'
  }
};

function Navigation({ currentView, setCurrentView, language, toggleLanguage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { gameStarted, gameCompleted } = useGame();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = translations[language];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'setup', path: '/setup', label: t.setup, icon: FiHome, enabled: true },
    { id: 'game', path: '/game', label: t.game, icon: FiPlay, enabled: gameStarted },
    { id: 'scoreboard', path: '/scoreboard', label: t.scoreboard, icon: FiBarChart2, enabled: gameStarted },
    { id: 'results', path: '/results', label: t.results, icon: FiBarChart2, enabled: gameCompleted },
    { id: 'saved', path: '/saved', icon: FiSave, label: t.saved, enabled: true },
    { id: 'achievements', path: '/achievements', icon: FiAward, label: t.achievements, enabled: true }
  ];

  const handleNavigation = (item) => {
    if (item.enabled) {
      setCurrentView(item.id);
      navigate(item.path);
      setMobileMenuOpen(false);
    }
  };

  const handleToggleLanguage = () => {
    toggleLanguage();
    setMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 ${
        scrolled ? 'bg-white/95 shadow-md' : 'bg-white/90'
      } backdrop-blur-sm border-b border-gray-200 transition-all duration-300`}
    >
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col items-center justify-between">
          {/* Logo */}
          <div className="flex items-center justify-between w-full py-2">
            <img
              src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1752690093494-maysalward-primary-logo-landscape.png"
              alt="Maysalward Logo"
              className="h-8 w-auto"
              style={{ maxWidth: '140px' }}
            />
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                <SafeIcon icon={mobileMenuOpen ? FiX : FiMenu} className="text-xl" />
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-between w-full h-16">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const isEnabled = item.enabled;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item)}
                    disabled={!isEnabled}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isEnabled
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-gray-400 cursor-not-allowed'
                    } ${language === 'ar' ? 'font-cairo' : ''}`}
                  >
                    <SafeIcon icon={item.icon} className="text-lg" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <button
                onClick={handleToggleLanguage}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200 ${
                  language === 'ar' ? 'font-cairo' : ''
                }`}
              >
                <SafeIcon icon={FiGlobe} className="text-lg" />
                <span>{t.language}</span>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden w-full overflow-hidden"
              >
                <div className="py-2 space-y-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const isEnabled = item.enabled;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item)}
                        disabled={!isEnabled}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : isEnabled
                            ? 'text-gray-700 hover:bg-gray-100'
                            : 'text-gray-400 cursor-not-allowed'
                        } ${language === 'ar' ? 'font-cairo' : ''}`}
                      >
                        <div className="flex items-center space-x-3">
                          <SafeIcon icon={item.icon} className="text-lg" />
                          <span>{item.label}</span>
                        </div>
                        {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
                      </button>
                    );
                  })}

                  <button
                    onClick={handleToggleLanguage}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200 ${
                      language === 'ar' ? 'font-cairo' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiGlobe} className="text-lg" />
                      <span>{t.language}</span>
                    </div>
                  </button>
                </div>
                <div className="h-3 border-t border-gray-100 my-2"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}

export default Navigation;