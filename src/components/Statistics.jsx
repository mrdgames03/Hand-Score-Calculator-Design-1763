import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const {
  FiTrendingUp,
  FiTrendingDown,
  FiTrophy,
  FiUsers,
  FiBarChart2,
  FiPieChart,
  FiActivity,
  FiAward,
  FiTarget,
  FiClock,
  FiRefreshCw,
  FiFilter,
  FiDownload,
  FiZap,
  FiCheck,
  FiX
} = FiIcons;

const translations = {
  en: {
    title: 'Game Statistics',
    overview: 'Overview',
    playerStats: 'Player Statistics',
    highlights: 'Highlights',
    partnershipStats: 'Partnership Stats',
    totalGames: 'Total Games',
    totalRounds: 'Total Rounds',
    totalPlayers: 'Total Players',
    avgGameDuration: 'Avg Game Duration',
    winRate: 'Win Rate',
    bestScore: 'Best Score',
    worstScore: 'Worst Score',
    avgScore: 'Average Score',
    gamesPlayed: 'Games Played',
    roundsPlayed: 'Rounds Played',
    wins: 'Wins',
    losses: 'Losses',
    winPercentage: 'Win %',
    recentPerformance: 'Recent Performance',
    last7Days: 'Last 7 Days',
    last30Days: 'Last 30 Days',
    allTime: 'All Time',
    last5Games: 'Last 5 Games',
    last10Games: 'Last 10 Games',
    soloGames: 'Solo Games',
    partnershipGames: 'Partnership Games',
    gameMode: 'Game Mode',
    filterBy: 'Filter By',
    sortBy: 'Sort By',
    mostWins: 'Most Wins',
    bestAverage: 'Best Average',
    mostGames: 'Most Games',
    noData: 'No statistics available yet',
    playGames: 'Play some games to see your statistics!',
    resetStats: 'Reset Statistics',
    exportStats: 'Export Statistics',
    confirmReset: 'Are you sure you want to reset all statistics? This cannot be undone.',
    cancel: 'Cancel',
    reset: 'Reset',
    statsReset: 'Statistics have been reset',
    exportSuccess: 'Statistics exported successfully',
    exportError: 'Failed to export statistics',
    improvingTrend: 'Improving',
    decliningTrend: 'Declining',
    stableTrend: 'Stable',
    minutes: 'min',
    seconds: 'sec',
    topPerformers: 'Top Performers',
    recentGames: 'Recent Games',
    gameDetails: 'Game Details',
    showDetails: 'Show Details',
    hideDetails: 'Hide Details',
    date: 'Date',
    players: 'Players',
    winner: 'Winner',
    score: 'Score',
    duration: 'Duration',
    rounds: 'Rounds',
    fullHandFinishes: 'Full Hand Finishes',
    highestPenalty: 'Highest Penalty',
    fastestWin: 'Fastest Win',
    largestWinMargin: 'Largest Win Margin',
    mostConsistentPlayer: 'Most Consistent Player',
    teamWithMostWins: 'Team With Most Wins',
    avgTeamScore: 'Average Team Score',
    mostCommonWinningPair: 'Most Common Winning Pair',
    teamA: 'Team A',
    teamB: 'Team B',
    scoreDistribution: 'Score Distribution',
    winsByMode: 'Wins By Mode',
    roundsPerGame: 'Rounds Per Game',
    downloadCSV: 'Download as CSV',
    downloadPNG: 'Download as PNG',
    loading: 'Loading statistics...',
    errorLoading: 'Error loading statistics',
    debugInfo: 'Debug Info',
    retryLoading: 'Retry Loading'
  },
  ar: {
    title: 'إحصائيات اللعبة',
    overview: 'نظرة عامة',
    playerStats: 'إحصائيات اللاعبين',
    highlights: 'الإنجازات البارزة',
    partnershipStats: 'إحصائيات الشراكة',
    totalGames: 'إجمالي الألعاب',
    totalRounds: 'إجمالي الجولات',
    totalPlayers: 'إجمالي اللاعبين',
    avgGameDuration: 'متوسط مدة اللعبة',
    winRate: 'معدل الفوز',
    bestScore: 'أفضل نتيجة',
    worstScore: 'أسوأ نتيجة',
    avgScore: 'متوسط النتيجة',
    gamesPlayed: 'الألعاب المُلعبة',
    roundsPlayed: 'الجولات المُلعبة',
    wins: 'الانتصارات',
    losses: 'الهزائم',
    winPercentage: '% الفوز',
    recentPerformance: 'الأداء الأخير',
    last7Days: 'آخر 7 أيام',
    last30Days: 'آخر 30 يوم',
    allTime: 'كل الوقت',
    last5Games: 'آخر 5 ألعاب',
    last10Games: 'آخر 10 ألعاب',
    soloGames: 'الألعاب الفردية',
    partnershipGames: 'ألعاب الشراكة',
    gameMode: 'نمط اللعب',
    filterBy: 'تصفية حسب',
    sortBy: 'ترتيب حسب',
    mostWins: 'الأكثر فوزاً',
    bestAverage: 'أفضل متوسط',
    mostGames: 'الأكثر لعباً',
    noData: 'لا توجد إحصائيات متاحة بعد',
    playGames: 'العب بعض الألعاب لرؤية إحصائياتك!',
    resetStats: 'إعادة تعيين الإحصائيات',
    exportStats: 'تصدير الإحصائيات',
    confirmReset: 'هل أنت متأكد من إعادة تعيين جميع الإحصائيات؟ لا يمكن التراجع عن هذا الإجراء.',
    cancel: 'إلغاء',
    reset: 'إعادة تعيين',
    statsReset: 'تم إعادة تعيين الإحصائيات',
    exportSuccess: 'تم تصدير الإحصائيات بنجاح',
    exportError: 'فشل تصدير الإحصائيات',
    improvingTrend: 'تحسن',
    decliningTrend: 'تراجع',
    stableTrend: 'مستقر',
    minutes: 'دقيقة',
    seconds: 'ثانية',
    topPerformers: 'أفضل الأداءات',
    recentGames: 'الألعاب الأخيرة',
    gameDetails: 'تفاصيل اللعبة',
    showDetails: 'عرض التفاصيل',
    hideDetails: 'إخفاء التفاصيل',
    date: 'التاريخ',
    players: 'اللاعبين',
    winner: 'الفائز',
    score: 'النتيجة',
    duration: 'المدة',
    rounds: 'الجولات',
    fullHandFinishes: 'إنهاءات اليد الكاملة',
    highestPenalty: 'أعلى عقوبة',
    fastestWin: 'أسرع فوز',
    largestWinMargin: 'أكبر فارق فوز',
    mostConsistentPlayer: 'اللاعب الأكثر ثباتاً',
    teamWithMostWins: 'الفريق الأكثر فوزاً',
    avgTeamScore: 'متوسط نقاط الفريق',
    mostCommonWinningPair: 'الثنائي الأكثر فوزاً',
    teamA: 'الفريق أ',
    teamB: 'الفريق ب',
    scoreDistribution: 'توزيع النقاط',
    winsByMode: 'الانتصارات حسب النمط',
    roundsPerGame: 'الجولات لكل لعبة',
    downloadCSV: 'تنزيل كملف CSV',
    downloadPNG: 'تنزيل كصورة PNG',
    loading: 'جاري تحميل الإحصائيات...',
    errorLoading: 'خطأ في تحميل الإحصائيات',
    debugInfo: 'معلومات التصحيح',
    retryLoading: 'إعادة المحاولة'
  }
};

// Default empty stats structure
const DEFAULT_GAME_STATS = {
  totalGames: 0,
  totalRounds: 0,
  totalPlayers: 0,
  soloGames: 0,
  partnershipGames: 0,
  avgDuration: 0,
  fullHandFinishes: 0,
  highestPenalty: 0,
  fastestWin: { rounds: Infinity, gameId: null },
  largestMargin: { margin: 0, gameId: null },
  teamStats: {
    A: { wins: 0, totalScore: 0, gamesPlayed: 0 },
    B: { wins: 0, totalScore: 0, gamesPlayed: 0 }
  },
  winningPairs: {}
};

function Statistics({ language }) {
  const [savedGames, setSavedGames] = useState([]);
  const [playerStats, setPlayerStats] = useState({});
  const [gameStats, setGameStats] = useState(DEFAULT_GAME_STATS);
  const [activeTab, setActiveTab] = useState('overview');
  const [sortBy, setSortBy] = useState('mostWins');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [debugInfo, setDebugInfo] = useState({
    savedGamesCount: 0,
    playerStatsCount: 0,
    loadingAttempts: 0,
    lastError: null
  });

  const t = translations[language] || translations.en;
  
  // Safe localStorage operations with more detailed error logging
  const safeGetFromStorage = (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        console.log(`Key "${key}" not found in localStorage, using default value`);
        return defaultValue;
      }
      
      const parsed = JSON.parse(item);
      console.log(`Successfully retrieved "${key}" from localStorage:`, 
        Array.isArray(parsed) ? `${parsed.length} items` : typeof parsed === 'object' ? `object with ${Object.keys(parsed).length} keys` : parsed);
      return parsed;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  };

  const safeSetToStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      return false;
    }
  };

  // Load game data safely with improved error handling
  const loadGameData = () => {
    setDebugInfo(prev => ({ ...prev, loadingAttempts: prev.loadingAttempts + 1 }));
    
    try {
      setIsLoading(true);
      setHasError(false);

      console.log('Loading game data...');
      
      // Load saved games
      const games = safeGetFromStorage('savedGames', []);
      console.log(`Loaded ${games.length} games from localStorage`);
      
      setDebugInfo(prev => ({ ...prev, savedGamesCount: games.length }));
      setSavedGames(games);

      if (games && games.length > 0) {
        // Process games synchronously to avoid timing issues
        const playerStatsData = calculatePlayerStats(games);
        const gameStatsData = calculateGameStats(games);
        
        setPlayerStats(playerStatsData);
        setGameStats(gameStatsData);
        
        setDebugInfo(prev => ({ 
          ...prev, 
          playerStatsCount: Object.keys(playerStatsData).length 
        }));
      } else {
        console.log('No games found, using default empty stats');
        setPlayerStats({});
        setGameStats(DEFAULT_GAME_STATS);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading game data:', error);
      setDebugInfo(prev => ({ ...prev, lastError: error.message }));
      setHasError(true);
      setPlayerStats({});
      setSavedGames([]);
      setGameStats(DEFAULT_GAME_STATS);
      setIsLoading(false);
    }
  };

  // Calculate player statistics - now synchronous for better reliability
  const calculatePlayerStats = (games) => {
    try {
      console.log('Calculating player stats for', games.length, 'games');
      const stats = {};

      games.forEach((game, gameIndex) => {
        try {
          if (!game || !game.players || !Array.isArray(game.players) || !game.finalScores) {
            console.warn(`Skipping invalid game at index ${gameIndex}`);
            return;
          }

          // Find winner (lowest score)
          const sortedPlayers = game.players
            .filter(player => player && player.id)
            .map(player => ({
              ...player,
              score: (game.finalScores && game.finalScores[player.id]) || 0
            }))
            .sort((a, b) => a.score - b.score);

          const winner = sortedPlayers.length > 0 ? sortedPlayers[0] : null;
          const gameDate = new Date(game.date || game.createdAt || Date.now());
          const gameDuration = game.duration || 0;

          game.players.forEach(player => {
            try {
              if (!player || !player.name) {
                return;
              }

              if (!stats[player.name]) {
                stats[player.name] = {
                  gamesPlayed: 0,
                  roundsPlayed: 0,
                  wins: 0,
                  totalScore: 0,
                  bestScore: Infinity,
                  worstScore: -Infinity,
                  scores: [],
                  recentGames: [],
                  soloGames: 0,
                  partnershipGames: 0,
                  totalDuration: 0,
                  fullHandFinishes: 0,
                  scoreDeviation: []
                };
              }

              const playerScore = (game.finalScores && game.finalScores[player.id]) || 0;
              const isWinner = winner && winner.id === player.id;

              // Check if this was a full hand finish
              const wasFullHand = isWinner && 
                game.scores && 
                game.scores[player.id] && 
                Array.isArray(game.scores[player.id]) && 
                game.scores[player.id].some(score => typeof score === 'number' && score <= -60);

              stats[player.name].gamesPlayed++;
              stats[player.name].roundsPlayed += (game.rounds || 0);
              if (isWinner) stats[player.name].wins++;
              stats[player.name].totalScore += playerScore;
              if (playerScore < stats[player.name].bestScore) stats[player.name].bestScore = playerScore;
              if (playerScore > stats[player.name].worstScore) stats[player.name].worstScore = playerScore;
              if (wasFullHand) stats[player.name].fullHandFinishes++;

              stats[player.name].scores.push({
                score: playerScore,
                date: gameDate,
                isWinner,
                gameMode: game.gameMode || 'solo',
                rounds: game.rounds || 0
              });

              stats[player.name].scoreDeviation.push(playerScore);

              if (game.gameMode === 'solo') {
                stats[player.name].soloGames++;
              } else {
                stats[player.name].partnershipGames++;
              }

              stats[player.name].totalDuration += gameDuration;

              // Keep recent games (last 10)
              stats[player.name].recentGames.push({
                date: gameDate,
                score: playerScore,
                isWinner,
                gameMode: game.gameMode || 'solo',
                rounds: game.rounds || 0
              });

              if (stats[player.name].recentGames.length > 10) {
                stats[player.name].recentGames = stats[player.name].recentGames
                  .sort((a, b) => b.date - a.date)
                  .slice(0, 10);
              }
            } catch (playerError) {
              console.error('Error processing player:', playerError);
            }
          });
        } catch (gameError) {
          console.error('Error processing game:', gameError);
        }
      });

      // Calculate derived stats
      Object.keys(stats).forEach(playerName => {
        try {
          const playerData = stats[playerName];
          
          // Calculate win rate
          playerData.winRate = playerData.gamesPlayed > 0 ? (playerData.wins / playerData.gamesPlayed) * 100 : 0;
          
          // Calculate average score
          playerData.avgScore = playerData.gamesPlayed > 0 ? playerData.totalScore / playerData.gamesPlayed : 0;
          
          // Calculate average duration
          playerData.avgDuration = playerData.gamesPlayed > 0 ? playerData.totalDuration / playerData.gamesPlayed : 0;

          // Calculate score consistency (standard deviation)
          if (playerData.scoreDeviation && playerData.scoreDeviation.length > 1) {
            const mean = playerData.avgScore;
            const squareDiffs = playerData.scoreDeviation.map(score => {
              const diff = score - mean;
              return diff * diff;
            });
            const avgSquareDiff = squareDiffs.reduce((sum, diff) => sum + diff, 0) / squareDiffs.length;
            playerData.consistency = Math.sqrt(avgSquareDiff);
          } else {
            playerData.consistency = 0;
          }

          // Fix infinite values
          if (playerData.bestScore === Infinity) playerData.bestScore = 0;
          if (playerData.worstScore === -Infinity) playerData.worstScore = 0;
        } catch (derivedError) {
          console.error('Error calculating derived stats for player:', playerName, derivedError);
        }
      });

      console.log('Player stats calculated:', Object.keys(stats).length, 'players');
      return stats;
    } catch (error) {
      console.error('Error in calculatePlayerStats:', error);
      return {};
    }
  };

  // Calculate game statistics - now synchronous for better reliability
  const calculateGameStats = (games) => {
    try {
      console.log('Calculating game stats for', games.length, 'games');
      
      if (!games || games.length === 0) {
        return DEFAULT_GAME_STATS;
      }

      const allPlayers = new Set();
      let totalRounds = 0;
      let totalDuration = 0;
      let fullHandFinishes = 0;
      let highestPenalty = 0;
      let fastestWin = { rounds: Infinity, gameId: null };
      let largestMargin = { margin: 0, gameId: null };
      let teamStats = {
        A: { wins: 0, totalScore: 0, gamesPlayed: 0 },
        B: { wins: 0, totalScore: 0, gamesPlayed: 0 }
      };
      let winningPairs = {};
      let soloGames = 0;
      let partnershipGames = 0;

      games.forEach((game, gameIndex) => {
        try {
          if (!game || !game.players || !Array.isArray(game.players)) {
            console.warn(`Skipping invalid game at index ${gameIndex}`);
            return;
          }

          // Count game mode
          if (game.gameMode === 'partnership') {
            partnershipGames++;
          } else {
            soloGames++;
          }

          // Count rounds
          totalRounds += (game.rounds || 0);

          // Count unique players
          game.players.forEach(player => {
            if (player && player.name) {
              allPlayers.add(player.name);
            }
          });

          // Game duration
          const duration = game.duration || 0;
          totalDuration += duration;

          // Find winner if finalScores exists
          if (game.finalScores && Object.keys(game.finalScores).length > 0) {
            const sortedPlayers = game.players
              .filter(player => player && player.id && game.finalScores[player.id] !== undefined)
              .map(player => ({
                ...player,
                score: game.finalScores[player.id] || 0
              }))
              .sort((a, b) => a.score - b.score);

            if (sortedPlayers.length > 0) {
              const winner = sortedPlayers[0];

              // Check for full hand finishes
              if (game.scores && winner && game.scores[winner.id]) {
                const winnerScores = game.scores[winner.id] || [];
                if (Array.isArray(winnerScores) && winnerScores.some(score => typeof score === 'number' && score <= -60)) {
                  fullHandFinishes++;
                }
              }

              // Find highest penalty
              if (game.scores) {
                Object.values(game.scores).forEach(playerScores => {
                  if (Array.isArray(playerScores)) {
                    playerScores.forEach(score => {
                      if (typeof score === 'number' && score > highestPenalty) {
                        highestPenalty = score;
                      }
                    });
                  }
                });
              }

              // Track fastest win
              if (winner && game.rounds && typeof game.rounds === 'number' && game.rounds < fastestWin.rounds) {
                fastestWin = {
                  rounds: game.rounds,
                  gameId: game.id,
                  winner: winner.name
                };
              }

              // Track largest win margin
              if (sortedPlayers.length > 1) {
                const margin = Math.abs(sortedPlayers[0].score - sortedPlayers[1].score);
                if (margin > largestMargin.margin) {
                  largestMargin = {
                    margin,
                    gameId: game.id,
                    winner: winner.name,
                    runnerUp: sortedPlayers[1].name
                  };
                }
              }

              // Track team stats for partnership games
              if (game.gameMode === 'partnership' && game.teamScores) {
                const teamAScore = game.teamScores.A || 0;
                const teamBScore = game.teamScores.B || 0;
                const winningTeam = teamAScore < teamBScore ? 'A' : 'B';
                
                teamStats[winningTeam].wins++;
                teamStats.A.totalScore += teamAScore;
                teamStats.B.totalScore += teamBScore;
                teamStats.A.gamesPlayed++;
                teamStats.B.gamesPlayed++;

                // Track winning pairs
                if (game.teams && game.teams[winningTeam] && Array.isArray(game.teams[winningTeam])) {
                  const winningPlayers = game.players
                    .filter(p => p && p.id && game.teams[winningTeam].includes(p.id))
                    .map(p => p.name)
                    .filter(Boolean)
                    .sort();

                  if (winningPlayers.length === 2) {
                    const pairKey = `${winningPlayers[0]} & ${winningPlayers[1]}`;
                    if (!winningPairs[pairKey]) {
                      winningPairs[pairKey] = { wins: 0, gamesPlayed: 0 };
                    }
                    winningPairs[pairKey].wins++;
                    winningPairs[pairKey].gamesPlayed = (winningPairs[pairKey].gamesPlayed || 0) + 1;
                  }
                }
              }
            }
          }
        } catch (gameError) {
          console.error('Error processing game for stats:', gameError);
        }
      });

      // Get most common winning pair
      let mostCommonWinningPair = null;
      let mostWins = 0;
      Object.entries(winningPairs).forEach(([pair, stats]) => {
        if (stats.wins > mostWins) {
          mostWins = stats.wins;
          mostCommonWinningPair = {
            pair,
            wins: stats.wins,
            gamesPlayed: stats.gamesPlayed,
            winRate: stats.gamesPlayed > 0 ? (stats.wins / stats.gamesPlayed) * 100 : 0
          };
        }
      });

      const calculatedStats = {
        totalGames: games.length,
        totalRounds,
        totalPlayers: allPlayers.size,
        soloGames,
        partnershipGames,
        avgDuration: games.length > 0 ? Math.round(totalDuration / games.length) : 0,
        fullHandFinishes,
        highestPenalty,
        fastestWin,
        largestMargin,
        teamStats,
        winningPairs,
        mostCommonWinningPair
      };

      console.log('Game stats calculated successfully');
      return calculatedStats;
    } catch (error) {
      console.error('Error calculating game stats:', error);
      return DEFAULT_GAME_STATS;
    }
  };

  // Get sorted players safely
  const getSortedPlayers = () => {
    try {
      if (!playerStats || typeof playerStats !== 'object') {
        return [];
      }
      
      const players = Object.entries(playerStats);
      if (players.length === 0) {
        return [];
      }
      
      return players.sort(([, a], [, b]) => {
        switch (sortBy) {
          case 'mostWins':
            return (b.wins || 0) - (a.wins || 0);
          case 'bestAverage':
            return (a.avgScore || 0) - (b.avgScore || 0); // Lower is better
          case 'mostGames':
            return (b.gamesPlayed || 0) - (a.gamesPlayed || 0);
          case 'mostConsistent':
            return (a.consistency || 0) - (b.consistency || 0); // Lower is more consistent
          default:
            return (b.wins || 0) - (a.wins || 0);
        }
      });
    } catch (error) {
      console.error('Error sorting players:', error);
      return [];
    }
  };

  // Export statistics as CSV
  const exportStatisticsCSV = () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";

      // General stats
      csvContent += "Game Statistics Summary\r\n";
      csvContent += `Total Games,${gameStats.totalGames}\r\n`;
      csvContent += `Total Rounds,${gameStats.totalRounds}\r\n`;
      csvContent += `Total Players,${gameStats.totalPlayers}\r\n`;
      csvContent += `Solo Games,${gameStats.soloGames}\r\n`;
      csvContent += `Partnership Games,${gameStats.partnershipGames}\r\n`;
      csvContent += `Full Hand Finishes,${gameStats.fullHandFinishes}\r\n`;
      csvContent += `Average Duration,${formatDuration(gameStats.avgDuration)}\r\n\r\n`;

      // Player stats
      csvContent += "Player Statistics\r\n";
      csvContent += "Name,Games Played,Wins,Win Rate,Average Score,Best Score,Worst Score,Full Hand Finishes\r\n";
      
      Object.entries(playerStats).forEach(([name, stats]) => {
        csvContent += `${name},${stats.gamesPlayed || 0},${stats.wins || 0},${(stats.winRate || 0).toFixed(1)}%,`;
        csvContent += `${(stats.avgScore || 0).toFixed(1)},${stats.bestScore || 0},${stats.worstScore || 0},${stats.fullHandFinishes || 0}\r\n`;
      });

      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `hand_game_statistics_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);

      // Trigger download and remove link
      link.click();
      document.body.removeChild(link);

      showStatusMessage(t.exportSuccess);
    } catch (error) {
      console.error('Error exporting statistics:', error);
      showStatusMessage(t.exportError, true);
    }
  };

  // Get trend icon
  const getTrendIcon = (recentGames) => {
    try {
      if (!recentGames || !Array.isArray(recentGames) || recentGames.length < 3) return FiActivity;

      const recent = recentGames.slice(0, 3);
      const older = recentGames.slice(3, 6);

      if (older.length === 0) return FiActivity;

      const recentAvg = recent.reduce((sum, game) => sum + (game.score || 0), 0) / recent.length;
      const olderAvg = older.reduce((sum, game) => sum + (game.score || 0), 0) / older.length;

      if (recentAvg < olderAvg - 5) return FiTrendingUp; // Improving (lower scores)
      if (recentAvg > olderAvg + 5) return FiTrendingDown; // Declining
      return FiActivity; // Stable
    } catch (error) {
      console.error('Error getting trend icon:', error);
      return FiActivity;
    }
  };

  // Show status message
  const showStatusMessage = (message, isError = false) => {
    setStatusMessage({ text: message, isError });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Get most consistent player
  const getMostConsistentPlayer = () => {
    try {
      if (!playerStats || typeof playerStats !== 'object' || Object.keys(playerStats).length === 0) {
        return null;
      }
      
      let mostConsistent = null;
      let lowestDeviation = Infinity;

      Object.entries(playerStats).forEach(([name, stats]) => {
        if ((stats.gamesPlayed || 0) >= 3 && (stats.consistency || 0) < lowestDeviation) {
          lowestDeviation = stats.consistency || 0;
          mostConsistent = {
            name,
            consistency: stats.consistency || 0
          };
        }
      });

      return mostConsistent;
    } catch (error) {
      console.error('Error getting most consistent player:', error);
      return null;
    }
  };

  // Format duration
  const formatDuration = (minutes) => {
    try {
      if (!minutes || minutes <= 0) return '0m';
      if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
      }
      return `${minutes}${t.minutes}`;
    } catch (error) {
      console.error('Error formatting duration:', error);
      return '0m';
    }
  };

  // Handle reset stats
  const handleResetStats = () => {
    try {
      safeSetToStorage('savedGames', []);
      setSavedGames([]);
      setPlayerStats({});
      setGameStats(DEFAULT_GAME_STATS);
      setShowResetConfirm(false);
      showStatusMessage(t.statsReset);
    } catch (error) {
      console.error('Error resetting stats:', error);
      showStatusMessage(t.exportError, true);
    }
  };

  // Load data on component mount
  useEffect(() => {
    console.log('Statistics component mounted, loading data...');
    loadGameData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="spinner mb-4"></div>
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  // Error state with debug info
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white"
        >
          <SafeIcon icon={FiX} className="text-6xl mx-auto mb-4 text-red-400" />
          <h1 className="text-3xl font-bold mb-2">{t.errorLoading}</h1>
          <button 
            onClick={loadGameData}
            className="btn-primary mt-4"
          >
            {t.retryLoading}
          </button>
          
          {/* Debug info for troubleshooting */}
          <div className="mt-6 p-4 bg-gray-800 rounded-lg text-left text-xs opacity-80">
            <h3 className="font-bold mb-2">{t.debugInfo}:</h3>
            <p>Loading attempts: {debugInfo.loadingAttempts}</p>
            <p>Saved games found: {debugInfo.savedGamesCount}</p>
            <p>Player stats found: {debugInfo.playerStatsCount}</p>
            {debugInfo.lastError && <p>Last error: {debugInfo.lastError}</p>}
          </div>
        </motion.div>
      </div>
    );
  }

  // No data state
  if (!savedGames || savedGames.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white"
        >
          <SafeIcon icon={FiBarChart2} className="text-6xl mx-auto mb-4 opacity-50" />
          <h1 className="text-3xl font-bold mb-2">{t.noData}</h1>
          <p className="text-lg opacity-80">{t.playGames}</p>
        </motion.div>
      </div>
    );
  }

  const mostConsistentPlayer = getMostConsistentPlayer();
  const sortedPlayers = getSortedPlayers();

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">{t.title}</h1>
            <div className="flex space-x-2">
              <button
                onClick={exportStatisticsCSV}
                className="btn-secondary flex items-center space-x-2 px-4 py-2 rounded-lg"
              >
                <SafeIcon icon={FiDownload} />
                <span className="hidden sm:inline">{t.downloadCSV}</span>
              </button>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="btn-danger flex items-center space-x-2 px-4 py-2 rounded-lg"
              >
                <SafeIcon icon={FiRefreshCw} />
                <span className="hidden sm:inline">{t.resetStats}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 shadow-lg mb-6"
        >
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              {/* Sort Options */}
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiFilter} className="text-gray-600" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mostWins">{t.mostWins}</option>
                  <option value="bestAverage">{t.bestAverage}</option>
                  <option value="mostGames">{t.mostGames}</option>
                  <option value="mostConsistent">{t.mostConsistentPlayer}</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center mb-6">
          <div className="bg-white rounded-lg p-1 inline-flex">
            {['overview', 'playerStats', 'highlights', 'partnershipStats'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {t[tab]}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-lg text-center">
                  <SafeIcon icon={FiBarChart2} className="text-3xl text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">{gameStats.totalGames}</div>
                  <div className="text-sm text-gray-600">{t.totalGames}</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg text-center">
                  <SafeIcon icon={FiTarget} className="text-3xl text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">{gameStats.totalRounds}</div>
                  <div className="text-sm text-gray-600">{t.totalRounds}</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg text-center">
                  <SafeIcon icon={FiUsers} className="text-3xl text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">{gameStats.totalPlayers}</div>
                  <div className="text-sm text-gray-600">{t.totalPlayers}</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg text-center">
                  <SafeIcon icon={FiAward} className="text-3xl text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">{gameStats.fullHandFinishes}</div>
                  <div className="text-sm text-gray-600">{t.fullHandFinishes}</div>
                </div>
              </div>

              {/* Game Duration & Mode Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-lg text-center">
                  <SafeIcon icon={FiClock} className="text-2xl text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">
                    {formatDuration(gameStats.avgDuration)}
                  </div>
                  <div className="text-sm text-gray-600">{t.avgGameDuration}</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg text-center">
                  <SafeIcon icon={FiPieChart} className="text-2xl text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-gray-800">
                    {gameStats.soloGames}/{gameStats.partnershipGames}
                  </div>
                  <div className="text-sm text-gray-600">Solo/Partnership</div>
                  <div className="mt-4 h-20 flex justify-center items-center">
                    <div className="flex space-x-2 items-center">
                      <div className="w-4 h-4 rounded-full bg-red-400"></div>
                      <span className="text-sm">{t.soloGames}: {gameStats.soloGames}</span>
                    </div>
                    <div className="mx-4">|</div>
                    <div className="flex space-x-2 items-center">
                      <div className="w-4 h-4 rounded-full bg-blue-400"></div>
                      <span className="text-sm">{t.partnershipGames}: {gameStats.partnershipGames}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Performers */}
              {sortedPlayers.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <SafeIcon icon={FiTrophy} className="text-yellow-500 mr-2" />
                    {t.topPerformers}
                  </h3>
                  <div className="mb-6">
                    {/* Simple bar chart replacement */}
                    <div className="space-y-3">
                      {sortedPlayers.slice(0, 5).map(([playerName, stats]) => (
                        <div key={playerName} className="flex items-center">
                          <div className="w-24 text-sm font-medium">{playerName}</div>
                          <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${Math.min(100, ((stats.wins || 0) / (sortedPlayers[0][1].wins || 1)) * 100)}%`
                              }}
                            ></div>
                          </div>
                          <div className="w-8 text-right font-bold text-gray-700 ml-2">{stats.wins || 0}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-center text-xs text-gray-500">{t.wins}</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {sortedPlayers.slice(0, 3).map(([playerName, stats], index) => (
                      <div key={playerName} className="text-center p-4 bg-gray-50 rounded-lg">
                        <div
                          className={`text-3xl mb-2 ${
                            index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-orange-600'
                          }`}
                        >
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                        <div className="font-bold text-gray-800">{playerName}</div>
                        <div className="text-sm text-gray-600">
                          {stats.wins || 0} {t.wins} • {((stats.winRate || 0)).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          Avg: {((stats.avgScore || 0)).toFixed(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'playerStats' && (
            <motion.div
              key="playerStats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {sortedPlayers.length > 0 ? (
                sortedPlayers.map(([playerName, stats]) => (
                  <div key={playerName} className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xl font-bold text-blue-600">
                            {playerName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{playerName}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <SafeIcon icon={getTrendIcon(stats.recentGames)} />
                            <span>{t.recentPerformance}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{stats.wins || 0}</div>
                        <div className="text-sm text-gray-600">{t.wins}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{stats.gamesPlayed || 0}</div>
                        <div className="text-xs text-gray-600">{t.gamesPlayed}</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{stats.roundsPlayed || 0}</div>
                        <div className="text-xs text-gray-600">{t.roundsPlayed}</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">{((stats.avgScore || 0)).toFixed(1)}</div>
                        <div className="text-xs text-gray-600">{t.avgScore}</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-lg font-bold text-orange-600">{stats.fullHandFinishes || 0}</div>
                        <div className="text-xs text-gray-600">{t.fullHandFinishes}</div>
                      </div>
                    </div>

                    {/* Score Range */}
                    <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-gray-600">{t.bestScore}</div>
                          <div className="font-bold text-green-600">{stats.bestScore || 0}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">{t.worstScore}</div>
                          <div className="font-bold text-red-600">{stats.worstScore || 0}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">{t.avgGameDuration}</div>
                          <div className="font-bold">{formatDuration(stats.avgDuration || 0)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Games Mini Chart */}
                    {stats.recentGames && Array.isArray(stats.recentGames) && stats.recentGames.length > 0 && (
                      <div className="mt-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">{t.recentGames}</div>
                        <div className="flex space-x-1">
                          {stats.recentGames.slice(0, 10).map((game, index) => (
                            <div
                              key={index}
                              className={`w-4 h-8 rounded-sm ${game.isWinner ? 'bg-green-400' : 'bg-red-400'}`}
                              title={`${game.score} ${game.isWinner ? '(Won)' : ''}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-white p-8">
                  <p>No player statistics available.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'highlights' && (
            <motion.div
              key="highlights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Highlights Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Highest Penalty */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-red-100 rounded-full">
                      <SafeIcon icon={FiZap} className="text-2xl text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{t.highestPenalty}</h3>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-red-600">{gameStats.highestPenalty}</div>
                    <div className="text-sm text-gray-600">Points</div>
                  </div>
                </div>

                {/* Full Hand Finishes */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <SafeIcon icon={FiAward} className="text-2xl text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{t.fullHandFinishes}</h3>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600">{gameStats.fullHandFinishes}</div>
                    <div className="text-sm text-gray-600">Times</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fastest Win */}
                {gameStats.fastestWin && gameStats.fastestWin.gameId && (
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <SafeIcon icon={FiClock} className="text-2xl text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">{t.fastestWin}</h3>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-gray-700">{gameStats.fastestWin.winner}</div>
                        <div className="text-sm text-gray-600">Winner</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{gameStats.fastestWin.rounds}</div>
                        <div className="text-sm text-gray-600">{t.rounds}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Largest Win Margin */}
                {gameStats.largestMargin && gameStats.largestMargin.gameId && (
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-3 bg-purple-100 rounded-full">
                        <SafeIcon icon={FiTrendingUp} className="text-2xl text-purple-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">{t.largestWinMargin}</h3>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-gray-700">
                          {gameStats.largestMargin.winner} vs {gameStats.largestMargin.runnerUp}
                        </div>
                        <div className="text-sm text-gray-600">Players</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">{gameStats.largestMargin.margin}</div>
                        <div className="text-sm text-gray-600">Points</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Most Consistent Player */}
              {mostConsistentPlayer && (
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <SafeIcon icon={FiActivity} className="text-2xl text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{t.mostConsistentPlayer}</h3>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-yellow-600">
                          {mostConsistentPlayer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="font-bold text-gray-700">{mostConsistentPlayer.name}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-yellow-600">
                        ±{mostConsistentPlayer.consistency.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Score Deviation</div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'partnershipStats' && (
            <motion.div
              key="partnershipStats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {gameStats.partnershipGames > 0 ? (
                <>
                  {/* Team Performance */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">{t.teamWithMostWins}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className={`p-4 rounded-lg ${
                          gameStats.teamStats.A.wins > gameStats.teamStats.B.wins
                            ? 'bg-blue-100 border-2 border-blue-300'
                            : 'bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-lg text-gray-700">{t.teamA}</div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {gameStats.teamStats.A.wins}
                            </div>
                            <div className="text-sm text-gray-600">{t.wins}</div>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          {t.avgScore}: {gameStats.teamStats.A.gamesPlayed > 0
                            ? Math.round(gameStats.teamStats.A.totalScore / gameStats.teamStats.A.gamesPlayed)
                            : 0}
                        </div>
                      </div>

                      <div
                        className={`p-4 rounded-lg ${
                          gameStats.teamStats.B.wins > gameStats.teamStats.A.wins
                            ? 'bg-green-100 border-2 border-green-300'
                            : 'bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-lg text-gray-700">{t.teamB}</div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {gameStats.teamStats.B.wins}
                            </div>
                            <div className="text-sm text-gray-600">{t.wins}</div>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          {t.avgScore}: {gameStats.teamStats.B.gamesPlayed > 0
                            ? Math.round(gameStats.teamStats.B.totalScore / gameStats.teamStats.B.gamesPlayed)
                            : 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Most Common Winning Pair */}
                  {gameStats.mostCommonWinningPair && (
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-3 bg-yellow-100 rounded-full">
                          <SafeIcon icon={FiUsers} className="text-2xl text-yellow-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">{t.mostCommonWinningPair}</h3>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <div className="font-bold text-lg text-gray-700 mb-2">
                          {gameStats.mostCommonWinningPair.pair}
                        </div>
                        <div className="flex justify-between">
                          <div>
                            <div className="text-2xl font-bold text-yellow-600">
                              {gameStats.mostCommonWinningPair.wins}
                            </div>
                            <div className="text-sm text-gray-600">{t.wins}</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-600">
                              {gameStats.mostCommonWinningPair.winRate.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600">{t.winPercentage}</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-purple-600">
                              {gameStats.mostCommonWinningPair.gamesPlayed}
                            </div>
                            <div className="text-sm text-gray-600">{t.gamesPlayed}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-xl p-8 shadow-lg text-center">
                  <SafeIcon icon={FiUsers} className="text-4xl text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No Partnership Games</h3>
                  <p className="text-gray-500">
                    Play some games in partnership mode to see team statistics.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reset Confirmation Modal */}
        <AnimatePresence>
          {showResetConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl p-6 max-w-md w-full"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {t.confirmReset}
                </h3>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="btn-secondary flex-1"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleResetStats}
                    className="btn-danger flex-1"
                  >
                    {t.reset}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Message */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 ${
                statusMessage.isError ? 'bg-red-500' : 'bg-green-500'
              } text-white`}
            >
              <SafeIcon icon={statusMessage.isError ? FiX : FiCheck} className="text-xl" />
              <span className="text-sm font-medium">{statusMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Statistics;