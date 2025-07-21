import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlay, FiUser, FiX, FiUsers, FiCamera, FiTrash2, FiBarChart2, FiClock, FiAward, FiTrophy } = FiIcons;

const translations = {
  en: {
    title: 'Hand Game',
    playersLabel: 'Number of Players',
    roundsLabel: 'Number of Rounds',
    playerName: 'Player Name',
    startGame: 'Start Game',
    rounds7: '7 Rounds',
    rounds9: '9 Rounds',
    playerPlaceholder: 'Enter player name',
    uploadPhoto: 'Upload Photo',
    removePhoto: 'Remove Photo',
    changePhoto: 'Change Photo',
    gameMode: 'Game Mode',
    soloMode: 'Solo Mode',
    partnershipMode: 'Partnership Mode',
    partnershipRequired: 'Partnership mode requires exactly 4 players',
    teamA: 'Team A',
    teamB: 'Team B',
    team: 'Team',
    photoError: 'Error uploading photo. Please try again.',
    photoSizeError: 'Photo must be smaller than 1MB.',
    statsTitle: 'Game Statistics',
    totalGames: 'Games',
    totalPlayers: 'Players',
    totalRounds: 'Rounds',
    avgDuration: 'Avg Time',
    bestPlayer: 'Top Player',
    noStats: 'No game statistics yet'
  },
  ar: {
    title: 'لعبة هاند',
    playersLabel: 'عدد اللاعبين',
    roundsLabel: 'عدد الجولات',
    playerName: 'اسم اللاعب',
    startGame: 'بدء اللعبة',
    rounds7: '7 جولات',
    rounds9: '9 جولات',
    playerPlaceholder: 'أدخل اسم اللاعب',
    uploadPhoto: 'رفع صورة',
    removePhoto: 'إزالة الصورة',
    changePhoto: 'تغيير الصورة',
    gameMode: 'نمط اللعب',
    soloMode: 'نمط فردي',
    partnershipMode: 'نمط الشراكة',
    partnershipRequired: 'يتطلب نمط الشراكة 4 لاعبين بالضبط',
    teamA: 'الفريق أ',
    teamB: 'الفريق ب',
    team: 'فريق',
    photoError: 'خطأ في رفع الصورة. يرجى المحاولة مرة أخرى.',
    photoSizeError: 'يجب أن يكون حجم الصورة أقل من 1 ميجابايت.',
    statsTitle: 'إحصائيات اللعبة',
    totalGames: 'ألعاب',
    totalPlayers: 'لاعبين',
    totalRounds: 'جولات',
    avgDuration: 'متوسط',
    bestPlayer: 'أفضل لاعب',
    noStats: 'لا توجد إحصائيات بعد'
  }
};

// Memoized Player Input Component to prevent unnecessary re-renders
const PlayerInput = memo(({
  player,
  index,
  teamColor = 'gray',
  onNameChange,
  onRemove,
  onPhotoUpload,
  onPhotoRemove,
  error,
  language,
  canRemove
}) => {
  const t = translations[language];
  const inputRef = useRef(null);

  const borderColor = teamColor === 'blue' ? 'border-blue-200' : teamColor === 'green' ? 'border-green-200' : 'border-gray-200';
  const bgColor = teamColor === 'blue' ? 'bg-blue-100' : teamColor === 'green' ? 'bg-green-100' : 'bg-gray-100';
  const textColor = teamColor === 'blue' ? 'text-blue-400' : teamColor === 'green' ? 'text-green-400' : 'text-gray-400';
  const inputBorderColor = error ? 'border-red-500' : teamColor === 'blue' ? 'border-blue-200' : teamColor === 'green' ? 'border-green-200' : '';

  const handleChange = (e) => {
    onNameChange(player.id, e.target.value);
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Player Avatar with Upload/Remove options */}
      <div className="relative">
        <div className={`w-12 h-12 rounded-full overflow-hidden ${bgColor} border-2 ${borderColor} flex items-center justify-center`}>
          {player.avatar ? (
            <img
              src={player.avatar}
              alt={player.name || `Player ${index + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <SafeIcon icon={FiUser} className={`text-lg ${textColor}`} />
          )}
        </div>

        {/* Photo Upload Button */}
        <button
          onClick={() => onPhotoUpload(player.id)}
          className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
          title={player.avatar ? t.changePhoto : t.uploadPhoto}
          aria-label={player.avatar ? t.changePhoto : t.uploadPhoto}
          type="button"
        >
          <SafeIcon icon={FiCamera} className="text-xs text-gray-600" />
        </button>

        {/* Photo Remove Button (only if there's a photo) */}
        {player.avatar && (
          <button
            onClick={() => onPhotoRemove(player.id)}
            className="absolute -bottom-1 -left-1 bg-white rounded-full p-1 shadow-md hover:bg-red-100 transition-colors"
            title={t.removePhoto}
            aria-label={t.removePhoto}
            type="button"
          >
            <SafeIcon icon={FiTrash2} className="text-xs text-red-600" />
          </button>
        )}
      </div>

      {/* Player Name Input - Fixed focus issue */}
      <div className="flex-1">
        <input
          ref={inputRef}
          type="text"
          value={player.name}
          onChange={handleChange}
          placeholder={`${t.playerPlaceholder} ${index + 1}`}
          className={`input-field ${inputBorderColor}`}
          aria-label={`${t.playerName} ${index + 1}`}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
        {error && (
          <p className="text-red-500 text-xs mt-1">{error}</p>
        )}
      </div>

      {/* Remove Player Button - Only show if can remove */}
      {canRemove && (
        <button
          onClick={() => onRemove(player.id)}
          className="text-red-500 hover:text-red-700"
          aria-label="Remove player"
          type="button"
        >
          <SafeIcon icon={FiX} />
        </button>
      )}
    </div>
  );
});

// Set display name for debugging
PlayerInput.displayName = 'PlayerInput';

function GameSetup({ onGameStart, language }) {
  const navigate = useNavigate();
  const { dispatch } = useGame();
  const [players, setPlayers] = useState([
    { id: '1', name: '', avatar: null, team: 'A' },
    { id: '2', name: '', avatar: null, team: 'B' },
  ]);
  const [rounds, setRounds] = useState(7);
  const [gameMode, setGameMode] = useState('solo');
  const [errors, setErrors] = useState({});
  const [photoError, setPhotoError] = useState(null);
  const fileInputRef = useRef(null);
  const [gameStats, setGameStats] = useState({
    totalGames: 0,
    totalPlayers: 0,
    totalRounds: 0,
    avgDuration: 0,
    bestPlayer: null
  });

  const t = translations[language];

  // Load game statistics
  useEffect(() => {
    try {
      // Get saved games
      const savedGamesStr = localStorage.getItem('savedGames');
      if (!savedGamesStr) return;
      
      const savedGames = JSON.parse(savedGamesStr);
      if (!Array.isArray(savedGames) || savedGames.length === 0) return;
      
      // Get player statistics
      const playerStatsStr = localStorage.getItem('playerStatistics');
      const playerStats = playerStatsStr ? JSON.parse(playerStatsStr) : {};
      
      // Calculate basic stats
      let totalRounds = 0;
      let totalDuration = 0;
      const uniquePlayers = new Set();
      
      savedGames.forEach(game => {
        totalRounds += game.rounds || 0;
        totalDuration += game.duration || 0;
        if (game.players) {
          game.players.forEach(player => {
            if (player && player.name) uniquePlayers.add(player.name);
          });
        }
      });
      
      // Find best player
      let bestPlayer = null;
      let highestWins = 0;
      
      Object.entries(playerStats).forEach(([name, stats]) => {
        if (stats.wins > highestWins) {
          highestWins = stats.wins;
          bestPlayer = { name, wins: stats.wins };
        }
      });
      
      setGameStats({
        totalGames: savedGames.length,
        totalPlayers: uniquePlayers.size,
        totalRounds,
        avgDuration: savedGames.length > 0 ? Math.round(totalDuration / savedGames.length) : 0,
        bestPlayer
      });
    } catch (error) {
      console.error('Error loading game statistics:', error);
    }
  }, []);

  const handleAddPlayer = useCallback(() => {
    if (players.length < 4) {
      // Alternate team assignment for new players
      const newTeam = players.length % 2 === 0 ? 'A' : 'B';
      setPlayers(prevPlayers => [
        ...prevPlayers,
        { id: Date.now().toString(), name: '', avatar: null, team: newTeam }
      ]);
    }
  }, [players.length]);

  const handleRemovePlayer = useCallback((id) => {
    if (players.length > 2) {
      setPlayers(prevPlayers => prevPlayers.filter(player => player.id !== id));
    }
  }, [players.length]);

  const handlePlayerNameChange = useCallback((id, name) => {
    setPlayers(prevPlayers =>
      prevPlayers.map(player => player.id === id ? { ...player, name } : player)
    );

    // Clear error for this player when they type
    setErrors(prevErrors => {
      if (prevErrors[id]) {
        const newErrors = { ...prevErrors };
        delete newErrors[id];
        return newErrors;
      }
      return prevErrors;
    });
  }, []);

  const handleGameModeChange = useCallback((mode) => {
    setGameMode(mode);

    if (mode === 'partnership') {
      // Create exactly 4 players for partnership mode with proper team assignments
      setPlayers(prevPlayers => {
        const currentPlayers = [...prevPlayers];
        const newPlayers = [];

        // Add or keep first two players (Team A)
        for (let i = 0; i < 2; i++) {
          if (currentPlayers[i]) {
            newPlayers.push({ ...currentPlayers[i], team: 'A' });
          } else {
            newPlayers.push({ id: Date.now().toString() + i, name: '', avatar: null, team: 'A' });
          }
        }

        // Add or keep next two players (Team B)
        for (let i = 2; i < 4; i++) {
          if (currentPlayers[i]) {
            newPlayers.push({ ...currentPlayers[i], team: 'B' });
          } else {
            newPlayers.push({ id: Date.now().toString() + i, name: '', avatar: null, team: 'B' });
          }
        }

        return newPlayers;
      });
    } else {
      // For solo mode, keep only the minimum 2 players if we're switching from partnership
      setPlayers(prevPlayers => {
        if (prevPlayers.length > 2) {
          return prevPlayers.slice(0, 2).map(p => ({ ...p, team: null }));
        }
        return prevPlayers;
      });
    }
  }, []);

  const handlePhotoUpload = useCallback((playerId) => {
    // Create a hidden file input and trigger it
    if (fileInputRef.current) {
      fileInputRef.current.playerId = playerId;
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    const playerId = fileInputRef.current.playerId;

    if (!file) return;

    // Check file size (limit to 1MB)
    if (file.size > 1024 * 1024) {
      setPhotoError(t.photoSizeError);
      setTimeout(() => setPhotoError(null), 3000);
      return;
    }

    // Reset file input
    event.target.value = '';

    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        setPlayers(prevPlayers =>
          prevPlayers.map(player => player.id === playerId ? { ...player, avatar: reader.result } : player)
        );
      } catch (error) {
        console.error('Error processing image:', error);
        setPhotoError(t.photoError);
        setTimeout(() => setPhotoError(null), 3000);
      }
    };
    reader.onerror = () => {
      setPhotoError(t.photoError);
      setTimeout(() => setPhotoError(null), 3000);
    };
    reader.readAsDataURL(file);
  }, [t]);

  const handleRemovePhoto = useCallback((playerId) => {
    setPlayers(prevPlayers =>
      prevPlayers.map(player => player.id === playerId ? { ...player, avatar: null } : player)
    );
  }, []);

  const handleStartGame = useCallback(() => {
    // Validate player names
    const newErrors = {};
    let isValid = true;

    players.forEach(player => {
      if (!player.name.trim()) {
        newErrors[player.id] = 'Name required';
        isValid = false;
      }
    });

    // Check for duplicate names
    const names = players.map(p => p.name.trim().toLowerCase());
    const duplicates = names.filter((name, index) => name && names.indexOf(name) !== index);
    if (duplicates.length > 0) {
      players.forEach(player => {
        if (duplicates.includes(player.name.trim().toLowerCase())) {
          newErrors[player.id] = 'Duplicate name';
          isValid = false;
        }
      });
    }

    if (gameMode === 'partnership' && players.length !== 4) {
      setErrors({ mode: t.partnershipRequired });
      return;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    // Start the game
    try {
      dispatch({
        type: 'START_GAME',
        payload: {
          players: players.map(p => ({ ...p, name: p.name.trim() })),
          rounds,
          gameMode
        }
      });
      onGameStart();
      navigate('/game');
    } catch (error) {
      console.error('Error starting game:', error);
      setErrors({ general: 'Failed to start game. Please try again.' });
    }
  }, [players, rounds, gameMode, dispatch, onGameStart, navigate, t]);

  // Format duration for display
  const formatDuration = (minutes) => {
    if (!minutes || minutes <= 0) return '0m';
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  };

  // Group players by team for partnership mode display
  const teamAPlayers = players.filter(p => p.team === 'A');
  const teamBPlayers = players.filter(p => p.team === 'B');

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-4xl font-bold text-white mb-1">{t.title}</h1>
        </motion.div>

        {/* Compact Statistics Section */}
        {gameStats.totalGames > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/20 backdrop-blur-sm rounded-lg p-3 shadow-md mb-6 border border-white/30"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiBarChart2} className="text-white" />
                <span className="text-sm font-medium text-white">{t.statsTitle}</span>
              </div>
              
              <div className="flex space-x-3">
                <div className="text-center">
                  <div className="text-xs text-white/80">{t.totalGames}</div>
                  <div className="text-sm font-bold text-white">{gameStats.totalGames}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xs text-white/80">{t.totalPlayers}</div>
                  <div className="text-sm font-bold text-white">{gameStats.totalPlayers}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xs text-white/80">{t.avgDuration}</div>
                  <div className="text-sm font-bold text-white">{formatDuration(gameStats.avgDuration)}</div>
                </div>
                
                {gameStats.bestPlayer && (
                  <div className="text-center flex flex-col items-center">
                    <div className="text-xs text-white/80">{t.bestPlayer}</div>
                    <div className="text-sm font-bold text-white flex items-center">
                      <SafeIcon icon={FiTrophy} className="text-yellow-300 mr-1 text-xs" />
                      <span className="truncate max-w-[60px]" title={gameStats.bestPlayer.name}>
                        {gameStats.bestPlayer.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Game Setup Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          {/* Game Mode Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.gameMode}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleGameModeChange('solo')}
                className={`py-3 px-4 rounded-lg text-center transition-colors ${
                  gameMode === 'solo'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
                aria-pressed={gameMode === 'solo'}
                type="button"
              >
                {t.soloMode}
              </button>
              <button
                onClick={() => handleGameModeChange('partnership')}
                className={`py-3 px-4 rounded-lg text-center transition-colors ${
                  gameMode === 'partnership'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
                aria-pressed={gameMode === 'partnership'}
                type="button"
              >
                {t.partnershipMode}
              </button>
            </div>
            {errors.mode && (
              <p className="text-red-500 text-sm mt-2">{errors.mode}</p>
            )}
          </div>

          {/* Rounds Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.roundsLabel}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setRounds(7)}
                className={`py-3 px-4 rounded-lg text-center transition-colors ${
                  rounds === 7
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
                aria-pressed={rounds === 7}
                type="button"
              >
                {t.rounds7}
              </button>
              <button
                onClick={() => setRounds(9)}
                className={`py-3 px-4 rounded-lg text-center transition-colors ${
                  rounds === 9
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
                aria-pressed={rounds === 9}
                type="button"
              >
                {t.rounds9}
              </button>
            </div>
          </div>

          {/* Players */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.playersLabel} ({players.length})
            </label>

            {/* Hidden file input for photo uploads */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              aria-hidden="true"
            />

            {/* Photo upload error message */}
            {photoError && (
              <div className="mb-3 p-2 bg-red-100 text-red-700 text-sm rounded">
                {photoError}
              </div>
            )}

            {gameMode === 'partnership' ? (
              /* Partnership Mode Layout - Team-based */
              <div className="space-y-6">
                {/* Team A */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <SafeIcon icon={FiUsers} className="text-blue-600" />
                    <h3 className="font-medium text-blue-800">{t.teamA}</h3>
                  </div>
                  <div className="space-y-3">
                    {teamAPlayers.map((player, index) => (
                      <PlayerInput
                        key={player.id}
                        player={player}
                        index={index}
                        teamColor="blue"
                        onNameChange={handlePlayerNameChange}
                        onRemove={handleRemovePlayer}
                        onPhotoUpload={handlePhotoUpload}
                        onPhotoRemove={handleRemovePhoto}
                        error={errors[player.id]}
                        language={language}
                        canRemove={false} // Can't remove in partnership mode
                      />
                    ))}
                  </div>
                </div>

                {/* Team B */}
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <SafeIcon icon={FiUsers} className="text-green-600" />
                    <h3 className="font-medium text-green-800">{t.teamB}</h3>
                  </div>
                  <div className="space-y-3">
                    {teamBPlayers.map((player, index) => (
                      <PlayerInput
                        key={player.id}
                        player={player}
                        index={index}
                        teamColor="green"
                        onNameChange={handlePlayerNameChange}
                        onRemove={handleRemovePlayer}
                        onPhotoUpload={handlePhotoUpload}
                        onPhotoRemove={handleRemovePhoto}
                        error={errors[player.id]}
                        language={language}
                        canRemove={false} // Can't remove in partnership mode
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Solo Mode Layout - Standard List */
              <div>
                <div className="space-y-3">
                  {players.map((player, index) => (
                    <PlayerInput
                      key={player.id}
                      player={player}
                      index={index}
                      onNameChange={handlePlayerNameChange}
                      onRemove={handleRemovePlayer}
                      onPhotoUpload={handlePhotoUpload}
                      onPhotoRemove={handleRemovePhoto}
                      error={errors[player.id]}
                      language={language}
                      canRemove={players.length > 2} // Can remove only if more than 2 players
                    />
                  ))}
                </div>

                {/* Add Player Button - Only show if less than maximum players */}
                {players.length < 4 && (
                  <button
                    onClick={handleAddPlayer}
                    className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                    aria-label="Add player"
                    type="button"
                  >
                    + {language === 'ar' ? 'إضافة لاعب' : 'Add Player'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* General Error */}
          {errors.general && (
            <p className="text-red-500 text-sm mb-4">{errors.general}</p>
          )}

          {/* Start Game Button */}
          <button
            onClick={handleStartGame}
            className="btn-primary w-full flex items-center justify-center space-x-2"
            aria-label={t.startGame}
            type="button"
          >
            <SafeIcon icon={FiPlay} />
            <span>{t.startGame}</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default GameSetup;