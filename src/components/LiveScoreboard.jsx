import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const {
  FiTrophy,
  FiUser,
  FiEdit2,
  FiX,
  FiCheck,
  FiFlag,
  FiAward,
  FiChevronLeft,
  FiChevronRight,
  FiSave,
  FiDelete,
  FiUsers
} = FiIcons;

const translations = {
  en: {
    title: 'Live Scoreboard',
    round: 'Round',
    total: 'Total',
    position: 'Position',
    teamView: 'Team View',
    individualView: 'Individual View',
    team: 'Team',
    teamTotal: 'Team Total',
    teamATotal: 'Team A Total',
    teamBTotal: 'Team B Total',
    wins: 'Wins',
    roundHistory: 'Round History',
    noRoundsPlayed: 'No rounds played yet',
    editRound: 'Edit Round',
    whoFinished: 'Who finished this round?',
    selectFinishType: 'Select Hand Type',
    normalHand: 'Normal Hand (-30)',
    fullHand: 'Full Hand (-60)',
    enterRemainingCards: 'Enter remaining cards for other players',
    cardValue: 'Card Value',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    handType: 'Hand Type',
    finishedBy: 'Finished By',
    normal: 'Normal',
    full: 'Full',
    clear: 'Clear',
    backspace: 'Delete',
    doublePoints: 'Double penalty for others',
    leading: 'Leading',
    trailing: 'Trailing',
    tied: 'Tied'
  },
  ar: {
    title: 'لوحة النتائج المباشرة',
    round: 'الجولة',
    total: 'المجموع',
    position: 'المركز',
    teamView: 'عرض الفرق',
    individualView: 'عرض فردي',
    team: 'فريق',
    teamTotal: 'مجموع الفريق',
    teamATotal: 'مجموع الفريق أ',
    teamBTotal: 'مجموع الفريق ب',
    wins: 'يفوز',
    roundHistory: 'سجل الجولات',
    noRoundsPlayed: 'لم يتم لعب أي جولة بعد',
    editRound: 'تعديل الجولة',
    whoFinished: 'من أنهى هذه الجولة؟',
    selectFinishType: 'اختر نوع اليد',
    normalHand: 'يد عادية (-30)',
    fullHand: 'يد كاملة (-60)',
    enterRemainingCards: 'أدخل الأوراق المتبقية للاعبين الآخرين',
    cardValue: 'قيمة الأوراق',
    saveChanges: 'حفظ التغييرات',
    cancel: 'إلغاء',
    handType: 'نوع اليد',
    finishedBy: 'أنهاها',
    normal: 'عادية',
    full: 'كاملة',
    clear: 'مسح',
    backspace: 'حذف',
    doublePoints: 'مضاعفة العقوبة للآخرين',
    leading: 'متقدم',
    trailing: 'متأخر',
    tied: 'متعادل'
  }
};

function LiveScoreboard({ language }) {
  const {
    players,
    rounds,
    currentRound,
    gameMode,
    calculateFinalScores,
    calculateTeamScores,
    getTeamByPlayerId,
    scores,
    dispatch
  } = useGame();
  
  const [viewMode, setViewMode] = useState(gameMode === 'partnership' ? 'team' : 'individual');
  const [editingRound, setEditingRound] = useState(null);
  const [editStep, setEditStep] = useState(1);
  const [finishedPlayerId, setFinishedPlayerId] = useState(null);
  const [handType, setHandType] = useState('normal');
  const [cardValues, setCardValues] = useState({});
  const [activePlayer, setActivePlayer] = useState(null);
  
  const t = translations[language];
  
  const finalScores = calculateFinalScores();
  const teamScores = calculateTeamScores();

  // Safety checks
  const hasPlayers = Array.isArray(players) && players.length > 0;
  const isPartnership = gameMode === 'partnership' && teamScores;

  const getTeamPlayers = (teamId) => {
    if (!hasPlayers) return [];
    return players.filter(player => getTeamByPlayerId(player.id) === teamId);
  };

  // Sort players by score (lowest first for winning)
  const rankedPlayers = hasPlayers ? players
    .map(player => ({ ...player, score: finalScores[player.id] || 0 }))
    .sort((a, b) => a.score - b.score) : [];

  // Generate rounds array for the table
  const roundsArray = Array.from({ length: rounds }, (_, i) => i + 1);
  const completedRounds = currentRound - 1;

  // Get round details
  const getRoundDetails = (roundIndex) => {
    try {
      const roundScores = {};
      let finisherId = null;
      let isFullHand = false;

      // Find the player who finished (negative score)
      players.forEach(player => {
        const score = scores[player.id]?.[roundIndex] || 0;
        roundScores[player.id] = score;
        if (score < 0) {
          finisherId = player.id;
          isFullHand = score <= -60; // Assuming -60 or lower is full hand
        }
      });

      return {
        finisherId,
        handType: isFullHand ? 'full' : 'normal',
        scores: roundScores
      };
    } catch (error) {
      console.error('Error getting round details:', error);
      return { finisherId: null, handType: 'normal', scores: {} };
    }
  };

  const startEditRound = (roundIndex) => {
    const { finisherId, handType: roundHandType, scores: roundScores } = getRoundDetails(roundIndex);

    // Calculate card values for non-finishing players
    const calculatedCardValues = {};
    players.forEach(player => {
      if (player.id !== finisherId) {
        const score = roundScores[player.id] || 0;
        calculatedCardValues[player.id] = roundHandType === 'full' ? (score / 2).toString() : score.toString();
      }
    });

    setEditingRound(roundIndex);
    setFinishedPlayerId(finisherId);
    setHandType(roundHandType);
    setCardValues(calculatedCardValues);
    setActivePlayer(null);
    setEditStep(1);
  };

  const cancelEdit = () => {
    setEditingRound(null);
    setFinishedPlayerId(null);
    setHandType('normal');
    setCardValues({});
    setActivePlayer(null);
    setEditStep(1);
  };

  const handleCardValueChange = (playerId, value) => {
    // Only allow positive numbers
    const numValue = value.replace(/[^0-9]/g, '');
    setCardValues(prev => ({ ...prev, [playerId]: numValue }));
  };

  const handleNumberPadInput = (digit) => {
    if (activePlayer && activePlayer !== finishedPlayerId) {
      const currentValue = cardValues[activePlayer] || '';
      if (digit === 'clear') {
        setCardValues(prev => ({ ...prev, [activePlayer]: '' }));
      } else if (digit === 'backspace') {
        setCardValues(prev => ({ ...prev, [activePlayer]: currentValue.slice(0, -1) }));
      } else {
        setCardValues(prev => ({ ...prev, [activePlayer]: currentValue + digit }));
      }
    }
  };

  const calculateEditedScores = () => {
    const calculatedScores = {};
    players.forEach(player => {
      if (player.id === finishedPlayerId) {
        // Player who finished gets fixed negative score
        calculatedScores[player.id] = handType === 'normal' ? -30 : -60;
      } else {
        // Other players get their card values (doubled for full hand)
        const cardValue = parseInt(cardValues[player.id] || '0');
        calculatedScores[player.id] = handType === 'normal' ? cardValue : cardValue * 2;
      }
    });
    return calculatedScores;
  };

  const canProceedToNextStep = () => {
    switch (editStep) {
      case 1: return finishedPlayerId !== null;
      case 2: return true; // Always can proceed after selecting hand type
      case 3: return players
        .filter(player => player.id !== finishedPlayerId)
        .every(player => cardValues[player.id] && cardValues[player.id] !== '');
      default: return false;
    }
  };

  const saveEditedRound = () => {
    if (editingRound === null) return;

    const calculatedScores = calculateEditedScores();
    const roundScores = players.map(player => ({
      playerId: player.id,
      value: calculatedScores[player.id] || 0
    }));

    dispatch({
      type: 'EDIT_ROUND',
      payload: {
        round: editingRound + 1,
        scores: roundScores
      }
    });

    // Reset editing state
    cancelEdit();
  };

  const getHandTypeLabel = (roundIndex) => {
    const { handType: roundHandType } = getRoundDetails(roundIndex);
    return roundHandType === 'full' ? t.full : t.normal;
  };

  const getFinisherName = (roundIndex) => {
    const { finisherId } = getRoundDetails(roundIndex);
    if (!finisherId) return '-';
    const finisher = players.find(p => p.id === finisherId);
    return finisher ? finisher.name : '-';
  };

  // Get team status
  const getTeamStatus = (teamId) => {
    if (!isPartnership) return '';
    const teamAScore = teamScores.A || 0;
    const teamBScore = teamScores.B || 0;

    if (teamAScore === teamBScore) return t.tied;

    // For lowest score wins
    if (teamId === 'A') return teamAScore < teamBScore ? t.leading : t.trailing;
    if (teamId === 'B') return teamBScore < teamAScore ? t.leading : t.trailing;
    return '';
  };

  // Number pad component
  const NumberPad = () => (
    <div className="number-pad mt-4 grid grid-cols-3 gap-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
        <button
          key={num}
          onClick={() => handleNumberPadInput(num.toString())}
          className="bg-gray-100 hover:bg-gray-200 h-12 rounded-lg font-semibold text-lg"
        >
          {num}
        </button>
      ))}
      <button
        onClick={() => handleNumberPadInput('clear')}
        className="bg-gray-100 hover:bg-gray-200 h-12 rounded-lg font-semibold"
      >
        {t.clear}
      </button>
      <button
        onClick={() => handleNumberPadInput('0')}
        className="bg-gray-100 hover:bg-gray-200 h-12 rounded-lg font-semibold text-lg"
      >
        0
      </button>
      <button
        onClick={() => handleNumberPadInput('backspace')}
        className="bg-gray-100 hover:bg-gray-200 h-12 rounded-lg font-semibold"
      >
        <SafeIcon icon={FiDelete} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">{t.title}</h1>
          <p className="text-white opacity-80">
            {t.round} {Math.min(currentRound, rounds)} / {rounds}
          </p>
        </motion.div>

        {/* View Toggle for Partnership Mode */}
        {isPartnership && (
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-lg p-1 inline-flex">
              <button
                onClick={() => setViewMode('team')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'team'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {t.teamView}
              </button>
              <button
                onClick={() => setViewMode('individual')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'individual'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {t.individualView}
              </button>
            </div>
          </div>
        )}

        {/* Partnership Mode - Enhanced Team View */}
        {isPartnership && viewMode === 'team' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 mb-8"
          >
            {/* Team Totals Summary */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Team Standings</h2>
              <div className="grid grid-cols-2 gap-6">
                {['A', 'B'].sort((a, b) => (teamScores[a] || 0) - (teamScores[b] || 0)).map((teamId) => {
                  const teamScore = teamScores[teamId] || 0;
                  const isLeading = teamScore === Math.min(teamScores.A, teamScores.B) && teamScores.A !== teamScores.B;
                  const status = getTeamStatus(teamId);

                  return (
                    <div
                      key={teamId}
                      className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                        isLeading
                          ? 'border-yellow-400 bg-yellow-50 shadow-lg'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      {isLeading && (
                        <div className="absolute -top-2 -right-2">
                          <SafeIcon icon={FiTrophy} className="text-2xl text-yellow-500" />
                        </div>
                      )}
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-3">
                          <SafeIcon
                            icon={FiUsers}
                            className={`text-2xl ${teamId === 'A' ? 'text-blue-600' : 'text-green-600'}`}
                          />
                          <h3 className="text-xl font-bold text-gray-800">
                            {t.team} {teamId}
                          </h3>
                        </div>
                        <div className={`text-4xl font-bold mb-2 ${
                          teamScore > 0 ? 'text-red-600' : teamScore < 0 ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {teamScore}
                        </div>
                        <div className="text-sm font-medium text-gray-600 mb-4">
                          {teamId === 'A' ? t.teamATotal : t.teamBTotal}
                        </div>
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          status === t.leading
                            ? 'bg-green-100 text-green-800'
                            : status === t.trailing
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {status}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Individual Players by Team */}
            {['A', 'B'].sort((a, b) => (teamScores[a] || 0) - (teamScores[b] || 0)).map((teamId) => (
              <div
                key={teamId}
                className={`bg-white rounded-xl p-6 shadow-lg border-l-4 ${
                  teamId === 'A' ? 'border-blue-500' : 'border-green-500'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <SafeIcon
                      icon={FiUsers}
                      className={`text-2xl ${teamId === 'A' ? 'text-blue-600' : 'text-green-600'}`}
                    />
                    <h3 className="text-xl font-bold text-gray-800">
                      {t.team} {teamId}
                    </h3>
                  </div>
                  <div className={`text-2xl font-bold ${
                    (teamScores[teamId] || 0) > 0
                      ? 'text-red-600'
                      : (teamScores[teamId] || 0) < 0
                        ? 'text-green-600'
                        : 'text-gray-600'
                  }`}>
                    {teamScores[teamId] || 0}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {getTeamPlayers(teamId)
                    .sort((a, b) => (finalScores[a.id] || 0) - (finalScores[b.id] || 0))
                    .map((player) => (
                      <div key={player.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                          {player.avatar ? (
                            <img
                              src={player.avatar}
                              alt={player.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <SafeIcon icon={FiUser} className="text-gray-400 text-xl" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{player.name}</div>
                          <div className={`text-lg font-bold ${
                            (finalScores[player.id] || 0) > 0
                              ? 'text-red-600'
                              : (finalScores[player.id] || 0) < 0
                                ? 'text-green-600'
                                : 'text-gray-600'
                          }`}>
                            {finalScores[player.id] || 0}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Individual View (Enhanced for Partnership Mode) */}
        {(!isPartnership || viewMode === 'individual') && hasPlayers && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mb-8"
          >
            {/* Partnership Mode Team Totals Bar */}
            {isPartnership && (
              <div className="bg-white rounded-xl p-4 shadow-lg mb-6">
                <h3 className="text-lg font-bold text-center text-gray-800 mb-4">Team Totals</h3>
                <div className="grid grid-cols-2 gap-4">
                  {['A', 'B'].sort((a, b) => (teamScores[a] || 0) - (teamScores[b] || 0)).map((teamId) => {
                    const teamScore = teamScores[teamId] || 0;
                    const isLeading = teamScore === Math.min(teamScores.A, teamScores.B) && teamScores.A !== teamScores.B;

                    return (
                      <div
                        key={teamId}
                        className={`p-4 rounded-lg border-2 text-center transition-all duration-300 ${
                          isLeading
                            ? 'border-yellow-400 bg-yellow-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <SafeIcon
                            icon={FiUsers}
                            className={`text-lg ${teamId === 'A' ? 'text-blue-600' : 'text-green-600'}`}
                          />
                          <span className="font-semibold text-gray-800">
                            {t.team} {teamId}
                          </span>
                          {isLeading && <SafeIcon icon={FiTrophy} className="text-yellow-500" />}
                        </div>
                        <div className={`text-2xl font-bold ${
                          teamScore > 0 ? 'text-red-600' : teamScore < 0 ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {teamScore}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Individual Player Cards */}
            {rankedPlayers.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl p-4 shadow-lg flex items-center space-x-4 ${
                  index === 0 ? 'border-2 border-yellow-400' : ''
                } ${
                  isPartnership
                    ? `border-l-4 ${
                        getTeamByPlayerId(player.id) === 'A' ? 'border-blue-500' : 'border-green-500'
                      }`
                    : ''
                }`}
              >
                {/* Position */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                  {index === 0 ? (
                    <SafeIcon icon={FiTrophy} className="text-yellow-500" />
                  ) : (
                    <span className="font-bold text-gray-600">#{index + 1}</span>
                  )}
                </div>

                {/* Player Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                  {player.avatar ? (
                    <img
                      src={player.avatar}
                      alt={player.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <SafeIcon icon={FiUser} className="text-lg text-gray-400" />
                  )}
                </div>

                {/* Player Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{player.name}</h3>
                  {isPartnership && (
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-500">
                        {t.team} {getTeamByPlayerId(player.id)}
                      </p>
                      <div className={`w-2 h-2 rounded-full ${
                        getTeamByPlayerId(player.id) === 'A' ? 'bg-blue-500' : 'bg-green-500'
                      }`} />
                    </div>
                  )}
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    player.score > 0
                      ? 'score-positive'
                      : player.score < 0
                        ? 'score-negative'
                        : 'score-zero'
                  }`}>
                    {player.score}
                  </div>
                  <div className="text-sm text-gray-500">{t.total}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Rounds History Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mt-8"
        >
          <h3 className="text-lg font-bold p-4 bg-gray-50 border-b">
            {t.roundHistory}
          </h3>
          {completedRounds > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      {t.round}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      {t.handType}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      {t.finishedBy}
                    </th>
                    {players.map((player) => (
                      <th key={player.id} className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                        {player.name}
                        {isPartnership && (
                          <span className="text-xs text-gray-500 block">
                            {t.team} {getTeamByPlayerId(player.id)}
                          </span>
                        )}
                      </th>
                    ))}
                    {isPartnership && (
                      <>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                          {t.team} A
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                          {t.team} B
                        </th>
                      </>
                    )}
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                      {t.editRound}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {roundsArray.slice(0, completedRounds).map((roundNum, roundIndex) => {
                    // Calculate team scores for this round
                    let teamARoundScore = 0;
                    let teamBRoundScore = 0;

                    if (isPartnership) {
                      players.forEach(player => {
                        const playerScore = scores[player.id]?.[roundIndex] || 0;
                        const team = getTeamByPlayerId(player.id);
                        if (team === 'A') {
                          teamARoundScore += playerScore;
                        } else if (team === 'B') {
                          teamBRoundScore += playerScore;
                        }
                      });
                    }

                    return (
                      <tr key={roundNum} className="border-t border-gray-100">
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">
                          {roundNum}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">
                          {getHandTypeLabel(roundIndex)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">
                          {getFinisherName(roundIndex)}
                        </td>
                        {players.map((player) => {
                          const score = scores[player.id]?.[roundIndex] || 0;
                          return (
                            <td
                              key={player.id}
                              className={`px-4 py-3 text-center font-medium ${
                                score < 0
                                  ? 'text-green-600'
                                  : score > 0
                                    ? 'text-red-600'
                                    : 'text-gray-500'
                              }`}
                            >
                              {score}
                            </td>
                          );
                        })}
                        {isPartnership && (
                          <>
                            <td className={`px-4 py-3 text-center font-medium ${
                              teamARoundScore < 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {teamARoundScore}
                            </td>
                            <td className={`px-4 py-3 text-center font-medium ${
                              teamBRoundScore < 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {teamBRoundScore}
                            </td>
                          </>
                        )}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => startEditRound(roundIndex)}
                            className="p-2 rounded-full hover:bg-gray-100 text-blue-600"
                          >
                            <SafeIcon icon={FiEdit2} className="text-sm" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Running Total Row */}
                  <tr className="bg-gray-50 border-t border-gray-200">
                    <td className="px-4 py-3 font-bold text-gray-700" colSpan={3}>
                      {t.total}
                    </td>
                    {players.map((player) => (
                      <td
                        key={player.id}
                        className={`px-4 py-3 text-center font-bold ${
                          finalScores[player.id] > 0
                            ? 'text-red-600'
                            : finalScores[player.id] < 0
                              ? 'text-green-600'
                              : 'text-gray-700'
                        }`}
                      >
                        {finalScores[player.id] || 0}
                      </td>
                    ))}
                    {isPartnership && (
                      <>
                        <td className={`px-4 py-3 text-center font-bold ${
                          teamScores.A < 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {teamScores.A}
                        </td>
                        <td className={`px-4 py-3 text-center font-bold ${
                          teamScores.B < 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {teamScores.B}
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">{t.noRoundsPlayed}</div>
          )}
        </motion.div>

        {/* No players message */}
        {!hasPlayers && (
          <div className="text-center text-white p-8">
            <p>No player data available.</p>
          </div>
        )}

        {/* Edit Round Modal */}
        <AnimatePresence>
          {editingRound !== null && (
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
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {t.editRound} {editingRound + 1}
                  </h2>
                  <button
                    onClick={cancelEdit}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <SafeIcon icon={FiX} />
                  </button>
                </div>

                {/* Step 1: Select Winner */}
                {editStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-700 text-center mb-4">
                      {t.whoFinished}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {players.map(player => (
                        <button
                          key={player.id}
                          onClick={() => {
                            setFinishedPlayerId(player.id);
                            setEditStep(2);
                          }}
                          className={`p-4 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                            finishedPlayerId === player.id
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-white">
                            {player.avatar ? (
                              <img
                                src={player.avatar}
                                alt={player.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <SafeIcon icon={FiUser} className="text-gray-400 text-xl" />
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-medium">{player.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Select Hand Type */}
                {editStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-700 text-center mb-4">
                      {t.selectFinishType}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          setHandType('normal');
                          setEditStep(3);
                        }}
                        className={`p-4 rounded-lg text-center transition-colors ${
                          handType === 'normal'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                      >
                        <div className="text-lg mb-1">{t.normalHand}</div>
                        <div className="text-sm opacity-75">(-30)</div>
                      </button>
                      <button
                        onClick={() => {
                          setHandType('full');
                          setEditStep(3);
                        }}
                        className={`p-4 rounded-lg text-center transition-colors ${
                          handType === 'full'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                      >
                        <div className="text-lg mb-1">{t.fullHand}</div>
                        <div className="text-sm opacity-75">(-60)</div>
                      </button>
                    </div>
                    {handType === 'full' && (
                      <p className="text-sm text-orange-600 flex items-center justify-center mt-2">
                        <SafeIcon icon={FiAward} className="mr-1" />
                        {t.doublePoints}
                      </p>
                    )}
                  </div>
                )}

                {/* Step 3: Enter Card Values */}
                {editStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-700 text-center mb-4">
                      {t.enterRemainingCards}
                    </h3>
                    <div className="space-y-3">
                      {players
                        .filter(player => player.id !== finishedPlayerId)
                        .map(player => (
                          <div key={player.id} className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                              {player.avatar ? (
                                <img
                                  src={player.avatar}
                                  alt={player.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <SafeIcon icon={FiUser} className="w-full h-full p-3 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {player.name}
                              </label>
                              <input
                                type="text"
                                value={cardValues[player.id] || ''}
                                onChange={e => handleCardValueChange(player.id, e.target.value)}
                                onFocus={() => setActivePlayer(player.id)}
                                placeholder={t.cardValue}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center text-lg font-semibold"
                                inputMode="none"
                              />
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Number Pad */}
                    <AnimatePresence>
                      {activePlayer && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <NumberPad />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Score Preview */}
                    {canProceedToNextStep() && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 bg-gray-50 p-4 rounded-lg"
                      >
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Score Preview:
                        </h4>
                        <div className="space-y-2">
                          {players.map(player => {
                            const calculatedScores = calculateEditedScores();
                            const score = calculatedScores[player.id] || 0;
                            return (
                              <div key={player.id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-600">{player.name}</span>
                                  {player.id === finishedPlayerId && (
                                    <SafeIcon icon={FiFlag} className="text-green-500" />
                                  )}
                                </div>
                                <span className={`font-semibold ${
                                  score < 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {score}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-6">
                  {editStep === 3 ? (
                    <div className="flex justify-between items-center space-x-4">
                      <button
                        onClick={() => setEditStep(2)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
                      >
                        <SafeIcon icon={FiChevronLeft} />
                        <span>{t.selectFinishType}</span>
                      </button>
                      <button
                        onClick={saveEditedRound}
                        disabled={!canProceedToNextStep()}
                        className={`bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 ${
                          language === 'ar' ? 'order-first' : 'order-last'
                        }`}
                      >
                        <SafeIcon icon={FiSave} />
                        <span>{t.saveChanges}</span>
                      </button>
                    </div>
                  ) : editStep === 2 ? (
                    <div className="flex justify-between items-center space-x-4">
                      <button
                        onClick={() => setEditStep(1)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
                      >
                        <SafeIcon icon={FiChevronLeft} />
                        <span>{t.whoFinished}</span>
                      </button>
                      <button
                        onClick={() => setEditStep(3)}
                        className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 ${
                          language === 'ar' ? 'order-first' : 'order-last'
                        }`}
                      >
                        <span>{t.enterRemainingCards}</span>
                        <SafeIcon icon={FiChevronRight} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center space-x-4">
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg"
                      >
                        {t.cancel}
                      </button>
                      <button
                        onClick={() => setEditStep(2)}
                        disabled={!finishedPlayerId}
                        className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 ${
                          language === 'ar' ? 'order-first' : 'order-last'
                        }`}
                      >
                        <span>{t.selectFinishType}</span>
                        <SafeIcon icon={FiChevronRight} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default LiveScoreboard;