import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const {
  FiCalendar,
  FiUsers,
  FiTrophy,
  FiTrash2,
  FiEye,
  FiDownload,
  FiUser,
  FiRefreshCw,
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiFilter,
  FiSearch,
  FiCheck,
  FiX
} = FiIcons;

const translations = {
  en: {
    title: 'Saved Games',
    noGames: 'No saved games yet',
    playFirstGame: 'Play your first game to see results here!',
    winner: 'Winner',
    players: 'Players',
    rounds: 'Rounds',
    date: 'Date',
    time: 'Time',
    viewDetails: 'View Details',
    deleteGame: 'Delete Game',
    exportGame: 'Export Game',
    confirmDelete: 'Are you sure you want to delete this game?',
    confirmResetAll: 'Are you sure you want to delete all saved games? This action cannot be undone.',
    cancel: 'Cancel',
    delete: 'Delete',
    resetAll: 'Reset All',
    gameDeleted: 'Game deleted successfully',
    allGamesDeleted: 'All games have been deleted',
    filterBy: 'Filter by',
    sortBy: 'Sort by',
    searchPlayers: 'Search players...',
    newest: 'Newest First',
    oldest: 'Oldest First',
    highestScore: 'Highest Score',
    lowestScore: 'Lowest Score',
    allModes: 'All Game Modes',
    soloMode: 'Solo Mode',
    partnershipMode: 'Partnership Mode',
    showDetails: 'Show Details',
    hideDetails: 'Hide Details',
    gameMode: 'Game Mode',
    duration: 'Duration',
    finalScores: 'Final Scores',
    teamScores: 'Team Scores',
    team: 'Team',
    exportSuccess: 'Game exported successfully',
    exportError: 'Failed to export game',
    downloadImage: 'Download as Image',
    downloadSuccess: 'Image downloaded successfully',
    downloadError: 'Failed to download image',
    preparing: 'Preparing image...'
  },
  ar: {
    title: 'الألعاب المحفوظة',
    noGames: 'لا توجد ألعاب محفوظة بعد',
    playFirstGame: 'العب أول لعبة لرؤية النتائج هنا!',
    winner: 'الفائز',
    players: 'اللاعبين',
    rounds: 'الجولات',
    date: 'التاريخ',
    time: 'الوقت',
    viewDetails: 'عرض التفاصيل',
    deleteGame: 'حذف اللعبة',
    exportGame: 'تصدير اللعبة',
    confirmDelete: 'هل أنت متأكد من حذف هذه اللعبة؟',
    confirmResetAll: 'هل أنت متأكد من حذف جميع الألعاب المحفوظة؟ لا يمكن التراجع عن هذا الإجراء.',
    cancel: 'إلغاء',
    delete: 'حذف',
    resetAll: 'حذف الكل',
    gameDeleted: 'تم حذف اللعبة بنجاح',
    allGamesDeleted: 'تم حذف جميع الألعاب',
    filterBy: 'تصفية حسب',
    sortBy: 'ترتيب حسب',
    searchPlayers: 'البحث عن لاعبين...',
    newest: 'الأحدث أولاً',
    oldest: 'الأقدم أولاً',
    highestScore: 'أعلى نتيجة',
    lowestScore: 'أقل نتيجة',
    allModes: 'جميع أنماط اللعب',
    soloMode: 'نمط فردي',
    partnershipMode: 'نمط الشراكة',
    showDetails: 'عرض التفاصيل',
    hideDetails: 'إخفاء التفاصيل',
    gameMode: 'نمط اللعب',
    duration: 'المدة',
    finalScores: 'النتائج النهائية',
    teamScores: 'نقاط الفرق',
    team: 'فريق',
    exportSuccess: 'تم تصدير اللعبة بنجاح',
    exportError: 'فشل تصدير اللعبة',
    downloadImage: 'تنزيل كصورة',
    downloadSuccess: 'تم تنزيل الصورة بنجاح',
    downloadError: 'فشل تنزيل الصورة',
    preparing: 'جاري تحضير الصورة...'
  }
};

function SavedGames({ language }) {
  const [savedGames, setSavedGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [expandedGame, setExpandedGame] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [gameModeFilter, setGameModeFilter] = useState('all');
  const [statusMessage, setStatusMessage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const gameDetailsRef = useRef({});

  const t = translations[language];

  useEffect(() => {
    loadSavedGames();
  }, []);

  useEffect(() => {
    filterAndSortGames();
  }, [savedGames, searchTerm, sortBy, gameModeFilter]);

  const loadSavedGames = () => {
    try {
      const games = JSON.parse(localStorage.getItem('savedGames') || '[]');
      setSavedGames(games);
    } catch (error) {
      console.error('Error loading saved games:', error);
      setSavedGames([]);
    }
  };

  const filterAndSortGames = () => {
    let filtered = [...savedGames];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(game =>
        game.players?.some(player =>
          player.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        game.winner?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by game mode
    if (gameModeFilter !== 'all') {
      filtered = filtered.filter(game => game.gameMode === gameModeFilter);
    }

    // Sort games
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date) - new Date(a.date);
        case 'oldest':
          return new Date(a.date) - new Date(b.date);
        case 'highestScore':
          return (b.winner?.score || 0) - (a.winner?.score || 0);
        case 'lowestScore':
          return (a.winner?.score || 0) - (b.winner?.score || 0);
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

    setFilteredGames(filtered);
  };

  const showStatusMessage = (message, isError = false) => {
    setStatusMessage({ text: message, isError });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDeleteGame = (gameId) => {
    const updatedGames = savedGames.filter(game => game.id !== gameId);
    setSavedGames(updatedGames);
    localStorage.setItem('savedGames', JSON.stringify(updatedGames));
    setDeleteConfirm(null);
    showStatusMessage(t.gameDeleted);
  };

  const handleResetAll = () => {
    localStorage.setItem('savedGames', '[]');
    setSavedGames([]);
    setResetConfirm(false);
    showStatusMessage(t.allGamesDeleted);
  };

  const handleExportGame = (game) => {
    try {
      const exportData = {
        date: game.date,
        completedAt: game.completedAt,
        players: game.players.map(p => ({
          name: p.name,
          avatar: p.avatar
        })),
        rounds: game.rounds,
        scores: game.scores,
        finalScores: game.finalScores,
        gameMode: game.gameMode,
        winner: game.winner,
        duration: game.duration
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hand-score-game-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      showStatusMessage(t.exportSuccess);
    } catch (error) {
      console.error('Error exporting game:', error);
      showStatusMessage(t.exportError, true);
    }
  };

  const handleDownloadGameAsImage = async (game, index) => {
    try {
      setIsCapturing(true);
      showStatusMessage(t.preparing, false);

      // Make sure the game details are expanded
      if (expandedGame !== index) {
        setExpandedGame(index);
        // Wait for the DOM to update
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const gameElement = gameDetailsRef.current[game.id];
      if (!gameElement) {
        throw new Error('Game element not found');
      }

      // Create a wrapper with specific styling for the image
      const wrapper = document.createElement('div');
      wrapper.style.padding = '32px';
      wrapper.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      wrapper.style.color = 'white';
      wrapper.style.fontFamily = language === 'ar' ? 'Cairo, sans-serif' : 'Roboto, sans-serif';
      wrapper.style.width = '800px';
      wrapper.style.borderRadius = '12px';

      // Clone the game element
      const clone = gameElement.cloneNode(true);

      // Add title to the top
      const title = document.createElement('h1');
      title.textContent = 'Hand Game Results';
      title.style.fontSize = '24px';
      title.style.fontWeight = 'bold';
      title.style.textAlign = 'center';
      title.style.marginBottom = '16px';
      title.style.color = 'white';

      // Add logo to the bottom
      const logoContainer = document.createElement('div');
      logoContainer.style.textAlign = 'center';
      logoContainer.style.marginTop = '20px';
      logoContainer.style.opacity = '0.7';
      logoContainer.textContent = 'Developed by Maysalward';

      // Append everything to the wrapper
      wrapper.appendChild(title);
      wrapper.appendChild(clone);
      wrapper.appendChild(logoContainer);

      // Add wrapper to the document temporarily
      document.body.appendChild(wrapper);

      // Capture the image
      const canvas = await html2canvas(wrapper, {
        backgroundColor: null,
        useCORS: true,
        scale: 2,
        logging: false
      });

      // Remove the wrapper from the document
      document.body.removeChild(wrapper);

      // Convert to blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(blob => resolve(blob), 'image/png', 1.0);
      });

      // Download the image
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hand-game-${game.id || new Date().getTime()}.png`;
      a.click();
      URL.revokeObjectURL(url);

      setIsCapturing(false);
      showStatusMessage(t.downloadSuccess);
    } catch (error) {
      console.error('Error downloading game as image:', error);
      setIsCapturing(false);
      showStatusMessage(t.downloadError, true);
    }
  };

  const formatGameDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return format(date, language === 'ar' ? 'dd/MM/yyyy' : 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const formatGameTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return format(date, language === 'ar' ? 'hh:mm a' : 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid time';
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes <= 0) return '-';
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  };

  if (savedGames.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white"
        >
          <SafeIcon icon={FiTrophy} className="text-6xl mx-auto mb-4 opacity-50" />
          <h1 className="text-3xl font-bold mb-2">{t.noGames}</h1>
          <p className="text-lg opacity-80">{t.playFirstGame}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">{t.title}</h1>
            <button
              onClick={() => setResetConfirm(true)}
              className="btn-danger flex items-center space-x-2 px-4 py-2 rounded-lg"
            >
              <SafeIcon icon={FiRefreshCw} />
              <span className="hidden sm:inline">{t.resetAll}</span>
            </button>
          </div>
          <p className="text-white opacity-80 mt-2">
            {filteredGames.length} {language === 'ar' ? 'لعبة محفوظة' : 'saved games'}
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 shadow-lg mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t.searchPlayers}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Game Mode Filter */}
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiFilter} className="text-gray-600" />
              <select
                value={gameModeFilter}
                onChange={(e) => setGameModeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t.allModes}</option>
                <option value="solo">{t.soloMode}</option>
                <option value="partnership">{t.partnershipMode}</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{t.sortBy}:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">{t.newest}</option>
                <option value="oldest">{t.oldest}</option>
                <option value="highestScore">{t.highestScore}</option>
                <option value="lowestScore">{t.lowestScore}</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Games List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {filteredGames.map((game, index) => {
            const winner = game.winner || (game.players && game.finalScores ?
              game.players
                .map(p => ({ ...p, score: game.finalScores[p.id] || 0 }))
                .sort((a, b) => a.score - b.score)[0]
              : null);

            const duration = game.duration || (game.completedAt && game.date ?
              Math.round((new Date(game.completedAt) - new Date(game.date)) / (1000 * 60)) : 0);

            return (
              <motion.div
                key={game.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card-hover bg-white rounded-xl shadow-lg p-4 md:p-6"
              >
                <div className="flex flex-col">
                  {/* Game Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      {/* Date and Time */}
                      <div className="flex items-center space-x-2 mb-2 text-gray-500 text-sm">
                        <SafeIcon icon={FiCalendar} className="text-blue-500" />
                        <span>{formatGameDate(game.date)}</span>
                        <span>•</span>
                        <SafeIcon icon={FiClock} className="text-blue-500 ml-1" />
                        <span>{formatGameTime(game.date)}</span>
                      </div>

                      {/* Game Mode and Stats */}
                      <div className="flex items-center space-x-4 mb-3">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          game.gameMode === 'solo' ?
                            'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                        }`}>
                          {game.gameMode === 'solo' ? t.soloMode : t.partnershipMode}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <SafeIcon icon={FiUsers} />
                            <span>{game.players?.length || 0} {t.players}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>•</span>
                            <span>{game.rounds || 0} {t.rounds}</span>
                          </div>
                          {duration > 0 && (
                            <>
                              <span>•</span>
                              <span>{formatDuration(duration)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Winner Info */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <SafeIcon icon={FiTrophy} className="text-yellow-500" />
                          <span className="font-medium text-gray-700">{t.winner}:</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                            {winner?.avatar ? (
                              <img
                                src={winner.avatar}
                                alt={winner.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <SafeIcon icon={FiUser} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <span className="font-semibold">{winner?.name || 'Unknown'}</span>
                          <span className="font-bold text-green-600">{winner?.score || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setExpandedGame(expandedGame === index ? null : index)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                        title={expandedGame === index ? t.hideDetails : t.showDetails}
                      >
                        <SafeIcon icon={expandedGame === index ? FiChevronUp : FiChevronDown} />
                      </button>
                      <button
                        onClick={() => handleDownloadGameAsImage(game, index)}
                        className="btn-secondary py-2 px-3 text-sm"
                        title={t.downloadImage}
                        disabled={isCapturing}
                      >
                        <SafeIcon icon={FiDownload} className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleExportGame(game)}
                        className="btn-secondary py-2 px-3 text-sm"
                        title={t.exportGame}
                      >
                        <SafeIcon icon={FiEye} className="text-lg" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(game.id)}
                        className="btn-danger py-2 px-3 text-sm"
                        title={t.deleteGame}
                      >
                        <SafeIcon icon={FiTrash2} className="text-lg" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Game Details */}
                  <AnimatePresence>
                    {expandedGame === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-gray-200 pt-4"
                        ref={el => { gameDetailsRef.current[game.id] = el; }}
                      >
                        <h4 className="font-medium text-gray-800 mb-3">{t.finalScores}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          {game.players?.map(player => (
                            <div key={player.id} className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 mx-auto mb-2">
                                {player.avatar ? (
                                  <img
                                    src={player.avatar}
                                    alt={player.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <SafeIcon icon={FiUser} className="text-gray-400 text-sm" />
                                  </div>
                                )}
                              </div>
                              <div className="font-medium text-gray-800 text-sm truncate">{player.name}</div>
                              <div className={`text-lg font-bold ${
                                player.id === winner?.id ? 'text-green-600' : 'text-gray-600'
                              }`}>
                                {game.finalScores?.[player.id] || 0}
                              </div>
                              {player.id === winner?.id && (
                                <SafeIcon icon={FiTrophy} className="text-yellow-500 mx-auto mt-1" />
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Team Scores for Partnership Mode */}
                        {game.gameMode === 'partnership' && game.teamScores && (
                          <div>
                            <h4 className="font-medium text-gray-800 mb-3">{t.teamScores}</h4>
                            <div className="grid grid-cols-2 gap-3">
                              {['A', 'B'].map(teamId => (
                                <div key={teamId} className="text-center p-3 bg-blue-50 rounded-lg">
                                  <div className="font-medium text-gray-800">{t.team} {teamId}</div>
                                  <div className="text-xl font-bold text-blue-600">
                                    {game.teamScores[teamId] || 0}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Round-by-round scores */}
                        {game.scores && (
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-800 mb-3">Round by Round</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full table-auto">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-3 py-2 text-left font-medium text-gray-700">Player</th>
                                    {Array.from({ length: game.rounds || 0 }, (_, i) => (
                                      <th key={i} className="px-2 py-2 text-center font-medium text-gray-700">
                                        R{i + 1}
                                      </th>
                                    ))}
                                    <th className="px-3 py-2 text-center font-medium text-gray-700">Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {game.players?.map(player => {
                                    const playerScores = game.scores[player.id] || [];
                                    const totalScore = game.finalScores?.[player.id] || 0;

                                    return (
                                      <tr key={player.id} className="border-t border-gray-200">
                                        <td className="px-3 py-2 font-medium">{player.name}</td>
                                        {Array.from({ length: game.rounds || 0 }, (_, roundIndex) => (
                                          <td key={roundIndex} className="px-2 py-2 text-center">
                                            <span className={`${
                                              (playerScores[roundIndex] || 0) < 0 ? 'text-green-600' :
                                              (playerScores[roundIndex] || 0) > 0 ? 'text-red-600' : 'text-gray-500'
                                            }`}>
                                              {playerScores[roundIndex] || 0}
                                            </span>
                                          </td>
                                        ))}
                                        <td className="px-3 py-2 text-center font-bold">
                                          <span className={`${
                                            totalScore < 0 ? 'text-green-600' :
                                            totalScore > 0 ? 'text-red-600' : 'text-gray-600'
                                          }`}>
                                            {totalScore}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* No Results Message */}
        {filteredGames.length === 0 && savedGames.length > 0 && (
          <div className="text-center text-white p-8">
            <SafeIcon icon={FiSearch} className="text-4xl mx-auto mb-4 opacity-50" />
            <p className="text-lg">No games match your search criteria.</p>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
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
                  {t.confirmDelete}
                </h3>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="btn-secondary flex-1"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={() => handleDeleteGame(deleteConfirm)}
                    className="btn-danger flex-1"
                  >
                    {t.delete}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reset All Confirmation Modal */}
        <AnimatePresence>
          {resetConfirm && (
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
                  {t.confirmResetAll}
                </h3>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setResetConfirm(false)}
                    className="btn-secondary flex-1"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleResetAll}
                    className="btn-danger flex-1"
                  >
                    {t.resetAll}
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

export default SavedGames;