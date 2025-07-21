import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AchievementsContext = createContext();

const initialState = {
  achievements: {},
  totalPoints: 0
};

function achievementsReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_ACHIEVEMENT': {
      const { id, progress } = action.payload;
      const updatedAchievements = {
        ...state.achievements,
        [id]: {
          ...state.achievements[id],
          progress: Math.max(progress, state.achievements[id]?.progress || 0)
        }
      };
      
      return {
        ...state,
        achievements: updatedAchievements
      };
    }
    case 'LOAD_ACHIEVEMENTS':
      return {
        ...state,
        achievements: action.payload
      };
    default:
      return state;
  }
}

export function AchievementsProvider({ children }) {
  const [state, dispatch] = useReducer(achievementsReducer, initialState);

  useEffect(() => {
    // Load achievements from localStorage
    try {
      const savedAchievements = JSON.parse(
        localStorage.getItem('handGameAchievements')
      ) || {};
      dispatch({ type: 'LOAD_ACHIEVEMENTS', payload: savedAchievements });
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  }, []);

  useEffect(() => {
    // Save achievements to localStorage when they change
    try {
      localStorage.setItem(
        'handGameAchievements',
        JSON.stringify(state.achievements)
      );
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  }, [state.achievements]);

  const updateAchievement = (id, progress) => {
    dispatch({
      type: 'UPDATE_ACHIEVEMENT',
      payload: { id, progress }
    });
  };

  const value = {
    ...state,
    updateAchievement
  };

  return (
    <AchievementsContext.Provider value={value}>
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementsProvider');
  }
  return context;
}