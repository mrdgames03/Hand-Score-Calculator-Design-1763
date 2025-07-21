import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiAward, FiStar, FiTrendingUp, FiZap, FiTarget, FiUsers, FiTrophy } = FiIcons;

const translations = {
  en: {
    title: 'Achievements',
    unlocked: 'Unlocked',
    locked: 'Locked',
    progress: 'Progress',
  },
  ar: {
    title: 'الإنجازات',
    unlocked: 'مفتوح',
    locked: 'مغلق',
    progress: 'التقدم',
  }
};

const achievements = [
  {
    id: 'first_win',
    icon: FiTrophy,
    title: { en: 'First Victory', ar: 'الفوز الأول' },
    description: { 
      en: 'Win your first game',
      ar: 'الفوز في أول لعبة'
    },
    requirement: 1,
    points: 100
  },
  {
    id: 'winning_streak',
    icon: FiTrendingUp,
    title: { en: 'Winning Streak', ar: 'سلسلة انتصارات' },
    description: {
      en: 'Win 3 games in a row',
      ar: 'الفوز في 3 ألعاب متتالية'
    },
    requirement: 3,
    points: 300
  },
  {
    id: 'team_player',
    icon: FiUsers,
    title: { en: 'Team Player', ar: 'لاعب الفريق' },
    description: {
      en: 'Win 5 partnership games',
      ar: 'الفوز في 5 ألعاب شراكة'
    },
    requirement: 5,
    points: 500
  },
  {
    id: 'high_scorer',
    icon: FiTarget,
    title: { en: 'High Scorer', ar: 'المسجل الأعلى' },
    description: {
      en: 'Score over 100 points in a single game',
      ar: 'تسجيل أكثر من 100 نقطة في لعبة واحدة'
    },
    requirement: 100,
    points: 200
  }
];

function Achievements({ language }) {
  const t = translations[language];
  const [unlockedAchievements, setUnlockedAchievements] = React.useState({});

  // Load achievements from localStorage on component mount
  React.useEffect(() => {
    try {
      const savedAchievements = JSON.parse(localStorage.getItem('handGameAchievements')) || {};
      setUnlockedAchievements(savedAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
      setUnlockedAchievements({});
    }
  }, []);

  const getProgress = (achievementId) => {
    try {
      return unlockedAchievements[achievementId]?.progress || 0;
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      return 0;
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">{t.title}</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {achievements.map((achievement) => {
            const isUnlocked = getProgress(achievement.id) >= achievement.requirement;
            const progress = getProgress(achievement.id);
            const progressPercentage = Math.min(
              (progress / achievement.requirement) * 100,
              100
            );

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-white rounded-xl p-6 shadow-lg ${
                  isUnlocked ? 'border-2 border-yellow-400' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-full ${
                    isUnlocked ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    <SafeIcon
                      icon={achievement.icon}
                      className={`text-2xl ${
                        isUnlocked ? 'text-yellow-500' : 'text-gray-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">
                      {achievement.title[language]}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {achievement.description[language]}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-medium ${
                        isUnlocked ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {isUnlocked ? t.unlocked : t.locked}
                      </span>
                      <span className="text-blue-600 font-semibold">
                        {achievement.points} pts
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 0.5 }}
                          className={`h-full ${
                            isUnlocked ? 'bg-yellow-400' : 'bg-blue-500'
                          }`}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>{t.progress}</span>
                        <span>{progress}/{achievement.requirement}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

export default Achievements;