import React, { createContext, useContext, useReducer, useEffect } from 'react';

const GameContext = createContext();

const initialState = {
  players: [],
  rounds: 7,
  currentRound: 1,
  scores: {},
  gameStarted: false,
  gameCompleted: false,
  gameId: null,
  createdAt: null,
  gameMode: 'solo',
  teams: { A: [], B: [] }
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'START_GAME': {
      const gameId = Date.now().toString();
      const initialScores = {};
      
      action.payload.players.forEach(player => {
        initialScores[player.id] = Array(action.payload.rounds).fill(null);
      });

      // Set up teams for partnership mode
      let teams = { A: [], B: [] };
      if (action.payload.gameMode === 'partnership') {
        action.payload.players.forEach((player, index) => {
          if (index % 2 === 0) {
            teams.A.push(player.id);
          } else {
            teams.B.push(player.id);
          }
        });
      }

      return {
        ...state,
        players: action.payload.players,
        rounds: action.payload.rounds,
        scores: initialScores,
        gameStarted: true,
        gameCompleted: false,
        currentRound: 1,
        gameId,
        createdAt: new Date().toISOString(),
        gameMode: action.payload.gameMode,
        teams
      };
    }

    case 'SAVE_ROUND_SCORES': {
      const newScores = { ...state.scores };
      
      action.payload.scores.forEach(({ playerId, value }) => {
        const roundIndex = state.currentRound - 1;
        if (roundIndex >= 0 && newScores[playerId]) {
          newScores[playerId][roundIndex] = value;
        }
      });

      return {
        ...state,
        scores: newScores,
        currentRound: state.currentRound + 1
      };
    }

    case 'EDIT_ROUND': {
      const editedScores = { ...state.scores };
      
      action.payload.scores.forEach(({ playerId, value }) => {
        const roundIndex = action.payload.round - 1;
        if (roundIndex >= 0 && editedScores[playerId]) {
          editedScores[playerId][roundIndex] = value;
        }
      });

      return {
        ...state,
        scores: editedScores
      };
    }

    case 'COMPLETE_GAME':
      return {
        ...state,
        gameCompleted: true
      };

    case 'RESET_GAME':
      return initialState;

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    if (state.gameCompleted && state.gameId) {
      try {
        saveGameToHistory();
        updatePlayerStatistics();
      } catch (error) {
        console.error('Error saving game history:', error);
      }
    }
  }, [state.gameCompleted]);

  const calculateFinalScores = () => {
    try {
      const finalScores = {};
      state.players.forEach(player => {
        const playerScores = state.scores[player.id] || [];
        finalScores[player.id] = playerScores.reduce(
          (sum, score) => sum + (Number(score) || 0), 0
        );
      });
      return finalScores;
    } catch (error) {
      console.error('Error calculating final scores:', error);
      return {};
    }
  };

  const calculateTeamScores = () => {
    try {
      if (state.gameMode !== 'partnership') return null;

      const teamScores = { A: 0, B: 0 };
      const finalScores = calculateFinalScores();

      // Calculate team scores
      if (state.teams.A && state.teams.A.length) {
        state.teams.A.forEach(playerId => {
          teamScores.A += finalScores[playerId] || 0;
        });
      }

      if (state.teams.B && state.teams.B.length) {
        state.teams.B.forEach(playerId => {
          teamScores.B += finalScores[playerId] || 0;
        });
      }

      return teamScores;
    } catch (error) {
      console.error('Error calculating team scores:', error);
      return { A: 0, B: 0 };
    }
  };

  const getTeamByPlayerId = (playerId) => {
    try {
      if (state.teams.A && state.teams.A.includes(playerId)) return 'A';
      if (state.teams.B && state.teams.B.includes(playerId)) return 'B';
      return null;
    } catch (error) {
      console.error('Error getting team by player ID:', error);
      return null;
    }
  };

  const saveGameToHistory = () => {
    try {
      const finalScores = calculateFinalScores();
      const teamScores = calculateTeamScores();
      
      // Find winner (lowest score)
      const sortedPlayers = state.players
        .map(player => ({
          ...player,
          score: finalScores[player.id] || 0
        }))
        .sort((a, b) => a.score - b.score);
      
      const winner = sortedPlayers[0];
      
      const gameData = {
        id: state.gameId,
        date: state.createdAt,
        completedAt: new Date().toISOString(),
        players: state.players.map(player => ({
          id: player.id,
          name: player.name,
          avatar: player.avatar
        })),
        rounds: state.rounds,
        scores: state.scores,
        finalScores,
        teamScores,
        gameMode: state.gameMode,
        teams: state.teams,
        winner: winner ? {
          id: winner.id,
          name: winner.name,
          score: winner.score
        } : null,
        duration: Math.round((new Date() - new Date(state.createdAt)) / (1000 * 60)) // in minutes
      };

      // Save to localStorage
      try {
        const savedGamesString = localStorage.getItem('savedGames') || '[]';
        const savedGames = JSON.parse(savedGamesString);
        savedGames.push(gameData);
        
        // Keep only last 100 games to prevent storage issues
        if (savedGames.length > 100) {
          savedGames.splice(0, savedGames.length - 100);
        }
        
        localStorage.setItem('savedGames', JSON.stringify(savedGames));
        console.log('Game saved to history successfully');
      } catch (storageError) {
        console.error('LocalStorage error:', storageError);
      }
    } catch (error) {
      console.error('Error saving game:', error);
    }
  };

  const updatePlayerStatistics = () => {
    try {
      const finalScores = calculateFinalScores();
      const winner = state.players
        .map(player => ({
          ...player,
          score: finalScores[player.id] || 0
        }))
        .sort((a, b) => a.score - b.score)[0];

      // Get existing player stats
      const existingStats = JSON.parse(localStorage.getItem('playerStatistics') || '{}');
      
      state.players.forEach(player => {
        const playerName = player.name;
        const playerScore = finalScores[player.id] || 0;
        const isWinner = winner && winner.id === player.id;
        
        if (!existingStats[playerName]) {
          existingStats[playerName] = {
            gamesPlayed: 0,
            wins: 0,
            totalScore: 0,
            bestScore: Infinity,
            worstScore: -Infinity,
            scores: [],
            soloGames: 0,
            partnershipGames: 0,
            totalDuration: 0,
            firstPlayed: new Date().toISOString(),
            lastPlayed: new Date().toISOString()
          };
        }

        const stats = existingStats[playerName];
        const gameDuration = Math.round((new Date() - new Date(state.createdAt)) / (1000 * 60));
        
        // Update stats
        stats.gamesPlayed++;
        if (isWinner) stats.wins++;
        stats.totalScore += playerScore;
        stats.bestScore = Math.min(stats.bestScore, playerScore);
        stats.worstScore = Math.max(stats.worstScore, playerScore);
        stats.lastPlayed = new Date().toISOString();
        stats.totalDuration += gameDuration;
        
        if (state.gameMode === 'solo') {
          stats.soloGames++;
        } else {
          stats.partnershipGames++;
        }
        
        // Add score to history (keep last 50 scores)
        stats.scores.push({
          score: playerScore,
          date: new Date().toISOString(),
          isWinner,
          gameMode: state.gameMode,
          gameId: state.gameId
        });
        
        if (stats.scores.length > 50) {
          stats.scores = stats.scores.slice(-50);
        }
        
        // Calculate derived stats
        stats.winRate = (stats.wins / stats.gamesPlayed) * 100;
        stats.avgScore = stats.totalScore / stats.gamesPlayed;
        stats.avgDuration = stats.totalDuration / stats.gamesPlayed;
        
        // Fix infinite values
        if (stats.bestScore === Infinity) stats.bestScore = 0;
        if (stats.worstScore === -Infinity) stats.worstScore = 0;
      });
      
      // Save updated stats
      localStorage.setItem('playerStatistics', JSON.stringify(existingStats));
      console.log('Player statistics updated successfully');
    } catch (error) {
      console.error('Error updating player statistics:', error);
    }
  };

  const value = {
    ...state,
    dispatch,
    calculateFinalScores,
    calculateTeamScores,
    getTeamByPlayerId,
    saveGameToHistory,
    updatePlayerStatistics
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}