import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUser, FiSave, FiChevronLeft, FiChevronRight, FiX, FiFlag, FiAward, FiDelete, FiEdit2, FiUsers, FiTrophy } = FiIcons;

const translations = {
  en: {
    title: 'Score Entry',
    round: 'Round',
    whoFinished: 'Who Finished the Round?',
    selectFinishType: 'Select Hand Type',
    normalHand: 'Hand (-30)',
    fullHand: 'Full Hand (-60)',
    enterRemainingCards: 'Enter Scores',
    cardValue: 'Card Value',
    saveRound: 'Save Round',
    saveChanges: 'Save Changes',
    cancelEdit: 'Cancel Edit',
    handType: 'Hand Type',
    finishedBy: 'Finished By',
    normal: 'Normal',
    full: 'Full',
    clear: 'Clear',
    backspace: 'Delete',
    doublePoints: 'Double penalty for others',
    gameComplete: 'Game Complete!',
    viewResults: 'View Results',
    team: 'Team',
    teamTotal: 'Team Total',
    teamATotal: 'Team A Total',
    teamBTotal: 'Team B Total',
    previousRounds: 'Previous Rounds',
    noRoundsPlayed: 'No rounds played yet',
    editRound: 'Edit Round',
    total: 'Total',
    currentStandings: 'Current Standings',
    leading: 'Leading',
    trailing: 'Trailing',
    tied: 'Tied'
  },
  ar: {
    title: 'إدخال النتائج',
    round: 'الجولة',
    whoFinished: 'من أنهى الجولة؟',
    selectFinishType: 'اختر نوع اليد',
    normalHand: 'يد (-30)',
    fullHand: 'يد كاملة (-60)',
    enterRemainingCards: 'إدخال النقاط',
    cardValue: 'قيمة الأوراق',
    saveRound: 'حفظ الجولة',
    saveChanges: 'حفظ التغييرات',
    cancelEdit: 'إلغاء التعديل',
    handType: 'نوع اليد',
    finishedBy: 'أنهاها',
    normal: 'عادية',
    full: 'كاملة',
    clear: 'مسح',
    backspace: 'حذف',
    doublePoints: 'مضاعفة العقوبة للآخرين',
    gameComplete: 'اللعبة مكتملة!',
    viewResults: 'عرض النتائج',
    team: 'فريق',
    teamTotal: 'مجموع الفريق',
    teamATotal: 'مجموع الفريق أ',
    teamBTotal: 'مجموع الفريق ب',
    previousRounds: 'الجولات السابقة',
    noRoundsPlayed: 'لم يتم لعب أي جولة بعد',
    editRound: 'تعديل الجولة',
    total: 'المجموع',
    currentStandings: 'الترتيب الحالي',
    leading: 'متقدم',
    trailing: 'متأخر',
    tied: 'متعادل'
  }
};

function ScoreEntry({ onGameComplete, language }) {
  const navigate = useNavigate();
  const { players, rounds, currentRound, gameMode, getTeamByPlayerId, scores, calculateFinalScores, calculateTeamScores, dispatch } = useGame();
  
  const [step, setStep] = useState(1);
  const [finishedPlayerId, setFinishedPlayerId] = useState(null);
  const [handType, setHandType] = useState('normal');
  const [cardValues, setCardValues] = useState({});
  const [activePlayer, setActivePlayer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRound, setEditingRound] = useState(null);
  
  const t = translations[language];
  
  const finalScores = calculateFinalScores();
  const teamScores = calculateTeamScores();
  const isPartnership = gameMode === 'partnership' && teamScores;

  // Check if game is complete
  useEffect(() => {
    if (currentRound > rounds) {
      dispatch({ type: 'COMPLETE_GAME' });
      onGameComplete();
      navigate('/results');
    }
  }, [currentRound, rounds, dispatch, onGameComplete, navigate]);

  // Initialize card values when players change
  useEffect(() => {
    if (players && players.length > 0) {
      const initialValues = {};
      players.forEach(player => {
        if (player.id !== finishedPlayerId) {
          initialValues[player.id] = '';
        }
      });
      setCardValues(initialValues);
    }
  }, [players, finishedPlayerId]);

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

  const calculateScores = () => {
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
    switch (step) {
      case 1:
        return finishedPlayerId !== null;
      case 2:
        return true; // Always can proceed after selecting hand type
      case 3:
        return players
          .filter(player => player.id !== finishedPlayerId)
          .every(player => cardValues[player.id] && cardValues[player.id] !== '');
      default:
        return false;
    }
  };

  const handleSaveRound = () => {
    if (!canProceedToNextStep()) return;
    
    const calculatedScores = calculateScores();
    const roundScores = players.map(player => ({
      playerId: player.id,
      value: calculatedScores[player.id] || 0
    }));
    
    if (isEditing && editingRound !== null) {
      dispatch({
        type: 'EDIT_ROUND',
        payload: {
          round: editingRound + 1,
          scores: roundScores
        }
      });
    } else {
      dispatch({
        type: 'SAVE_ROUND_SCORES',
        payload: {
          scores: roundScores
        }
      });
    }
    
    // Reset for next round
    setStep(1);
    setFinishedPlayerId(null);
    setHandType('normal');
    setCardValues({});
    setActivePlayer(null);
    setIsEditing(false);
    setEditingRound(null);
  };

  const cancelEdit = () => {
    setStep(1);
    setFinishedPlayerId(null);
    setHandType('normal');
    setCardValues({});
    setActivePlayer(null);
    setIsEditing(false);
    setEditingRound(null);
  };

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
      return {
        finisherId: null,
        handType: 'normal',
        scores: {}
      };
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
    setStep(1);
    setIsEditing(true);
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
    if (teamId === 'A') return teamAScore > teamBScore ? t.leading : t.trailing;
    if (teamId === 'B') return teamBScore > teamAScore ? t.leading : t.trailing;
    
    return '';
  };

  // Generate rounds array for the table
  const roundsArray = Array.from({ length: rounds }, (_, i) => i + 1);
  const completedRounds = currentRound - 1;

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

  // Safety check for players
  if (!players || players.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center text-white">
          <p>No players found. Please start a new game.</p>
          <button
            onClick={() => navigate('/setup')}
            className="btn-primary mt-4"
          >
            Start New Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">{t.title}</h1>
          <p className="text-white opacity-80">
            {t.round} {currentRound} / {rounds}
          </p>
        </motion.div>

        {/* Partnership Mode - Current Team Standings */}
        {isPartnership && completedRounds > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 shadow-lg mb-6"
          >
            <h3 className="text-lg font-bold text-center text-gray-800 mb-4">{t.currentStandings}</h3>
            <div className="grid grid-cols-2 gap-4">
              {['A', 'B'].map((teamId) => {
                const teamScore = teamScores[teamId] || 0;
                const isLeading = teamScore === Math.max(teamScores.A, teamScores.B) && teamScores.A !== teamScores.B;
                const status = getTeamStatus(teamId);
                
                return (
                  <div
                    key={teamId}
                    className={`p-4 rounded-lg border-2 text-center transition-all duration-300 ${
                      isLeading ? 'border-yellow-400 bg-yellow-50 shadow-md' : 'border-gray-200 bg-gray-50'
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
                    <div
                      className={`text-2xl font-bold mb-1 ${
                        teamScore > 0 ? 'text-red-600' : teamScore < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}
                    >
                      {teamScore}
                    </div>
                    <div
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        status === t.leading
                          ? 'bg-green-100 text-green-800'
                          : status === t.trailing
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {status}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Score Entry Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          {/* Step 1: Select Winner */}
          {step === 1 && (
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
                      setStep(2);
                    }}
                    className={`p-4 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                      finishedPlayerId === player.id
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    } ${
                      isPartnership
                        ? `border-l-4 ${getTeamByPlayerId(player.id) === 'A' ? 'border-blue-500' : 'border-green-500'}`
                        : ''
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
                    {isPartnership && (
                      <span className="text-xs opacity-75">
                        {t.team} {getTeamByPlayerId(player.id)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Hand Type */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 text-center mb-4">
                {t.selectFinishType}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setHandType('normal');
                    setStep(3);
                  }}
                  className={`p-4 rounded-lg text-center transition-colors ${
                    handType === 'normal' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  <div className="text-lg mb-1">{t.normalHand}</div>
                </button>
                <button
                  onClick={() => {
                    setHandType('full');
                    setStep(3);
                  }}
                  className={`p-4 rounded-lg text-center transition-colors ${
                    handType === 'full' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  <div className="text-lg mb-1">{t.fullHand}</div>
                </button>
              </div>
              {handType === 'full' && (
                <p className="text-sm text-orange-600 flex items-center justify-center mt-2">
                  <SafeIcon icon={FiAward} className="mr-1" /> {t.doublePoints}
                </p>
              )}
            </div>
          )}

          {/* Step 3: Enter Card Values */}
          {step === 3 && (
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
                          {isPartnership && (
                            <span className="text-xs text-gray-500 ml-1">
                              ({t.team} {getTeamByPlayerId(player.id)})
                            </span>
                          )}
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
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Score Preview:</h4>
                  <div className="space-y-2">
                    {players.map(player => {
                      const calculatedScores = calculateScores();
                      const score = calculatedScores[player.id] || 0;
                      
                      return (
                        <div key={player.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">{player.name}</span>
                            {player.id === finishedPlayerId && (
                              <SafeIcon icon={FiFlag} className="text-green-500" />
                            )}
                            {isPartnership && (
                              <span className="text-xs text-gray-500">
                                ({t.team} {getTeamByPlayerId(player.id)})
                              </span>
                            )}
                          </div>
                          <span className={`font-semibold ${score < 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {score}
                          </span>
                        </div>
                      );
                    })}

                    {/* Team totals preview for partnership mode */}
                    {isPartnership && (
                      <div className="border-t pt-2 mt-2">
                        {['A', 'B'].map(teamId => {
                          const calculatedScores = calculateScores();
                          let teamRoundScore = 0;
                          
                          players.forEach(player => {
                            if (getTeamByPlayerId(player.id) === teamId) {
                              teamRoundScore += calculatedScores[player.id] || 0;
                            }
                          });
                          
                          const newTeamTotal = (teamScores[teamId] || 0) + teamRoundScore;
                          
                          return (
                            <div key={teamId} className="flex items-center justify-between text-sm">
                              <span className="font-medium text-gray-700">
                                {teamId === 'A' ? t.teamATotal : t.teamBTotal}
                              </span>
                              <span className={`font-bold ${newTeamTotal < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {newTeamTotal}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-6">
            {step === 3 ? (
              <div className="flex justify-between items-center space-x-4">
                <button
                  onClick={() => setStep(2)}
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
                  <SafeIcon icon={FiChevronLeft} />
                  <span>{t.selectFinishType}</span>
                </button>
                <button
                  onClick={handleSaveRound}
                  disabled={!canProceedToNextStep()}
                  className={`btn-success flex items-center justify-center space-x-2 ${
                    language === 'ar' ? 'order-first' : 'order-last'
                  }`}
                >
                  <SafeIcon icon={FiSave} />
                  <span>{isEditing ? t.saveChanges : t.saveRound}</span>
                </button>
              </div>
            ) : step === 2 ? (
              <div className="flex justify-between items-center space-x-4">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
                  <SafeIcon icon={FiChevronLeft} />
                  <span>{t.whoFinished}</span>
                </button>
                <button
                  onClick={() => setStep(3)}
                  className={`btn-primary flex items-center justify-center space-x-2 ${
                    language === 'ar' ? 'order-first' : 'order-last'
                  }`}
                >
                  <span>{t.enterRemainingCards}</span>
                  <SafeIcon icon={FiChevronRight} />
                </button>
              </div>
            ) : isEditing ? (
              <div className="flex justify-center">
                <button
                  onClick={cancelEdit}
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
                  <SafeIcon icon={FiX} />
                  <span>{t.cancelEdit}</span>
                </button>
              </div>
            ) : null}
          </div>
        </motion.div>

        {/* Previous Rounds Table - Always Visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mt-8"
        >
          <h3 className="text-lg font-bold p-4 bg-gray-50 border-b">{t.previousRounds}</h3>
          {completedRounds > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t.round}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t.handType}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t.finishedBy}</th>
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
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">{t.team} A</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">{t.team} B</th>
                      </>
                    )}
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">{t.editRound}</th>
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
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">{roundNum}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">{getHandTypeLabel(roundIndex)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">{getFinisherName(roundIndex)}</td>
                        {players.map((player) => {
                          const score = scores[player.id]?.[roundIndex] || 0;
                          
                          return (
                            <td
                              key={player.id}
                              className={`px-4 py-3 text-center font-medium ${
                                score < 0 ? 'text-green-600' : score > 0 ? 'text-red-600' : 'text-gray-500'
                              }`}
                            >
                              {score}
                            </td>
                          );
                        })}
                        {isPartnership && (
                          <>
                            <td
                              className={`px-4 py-3 text-center font-medium ${
                                teamARoundScore < 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {teamARoundScore}
                            </td>
                            <td
                              className={`px-4 py-3 text-center font-medium ${
                                teamBRoundScore < 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
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
                        <td
                          className={`px-4 py-3 text-center font-bold ${
                            teamScores.A < 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {teamScores.A}
                        </td>
                        <td
                          className={`px-4 py-3 text-center font-bold ${
                            teamScores.B < 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
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
      </div>
    </div>
  );
}

export default ScoreEntry;