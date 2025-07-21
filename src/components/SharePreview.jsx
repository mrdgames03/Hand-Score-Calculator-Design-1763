import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';

function SharePreview() {
  const metaRef = useRef({
    title: document.querySelector('meta[name="title"]'),
    description: document.querySelector('meta[name="description"]'),
    ogTitle: document.querySelector('meta[property="og:title"]'),
    ogDescription: document.querySelector('meta[property="og:description"]'),
    twitterTitle: document.querySelector('meta[property="twitter:title"]'),
    twitterDescription: document.querySelector('meta[property="twitter:description"]')
  });

  const { players, gameMode, rounds, calculateFinalScores, gameCompleted } = useGame();
  
  useEffect(() => {
    // Only update meta when game is completed
    if (gameCompleted && players && players.length > 0) {
      const finalScores = calculateFinalScores();
      const sortedPlayers = [...players].sort((a, b) => 
        (finalScores[b.id] || 0) - (finalScores[a.id] || 0)
      );
      
      // Winner info for dynamic meta
      const winner = sortedPlayers[0];
      const winnerScore = finalScores[winner.id] || 0;
      
      // Create dynamic meta content
      const dynamicTitle = `${winner.name} wins Hand Game with ${winnerScore} points!`;
      const dynamicDescription = `${players.length} players competed in ${rounds} rounds of ${gameMode === 'partnership' ? 'partnership' : 'solo'} Hand Game. Check out the final scores!`;
      
      // Update meta tags for sharing
      if (metaRef.current.title) metaRef.current.title.content = dynamicTitle;
      if (metaRef.current.description) metaRef.current.description.content = dynamicDescription;
      if (metaRef.current.ogTitle) metaRef.current.ogTitle.content = dynamicTitle;
      if (metaRef.current.ogDescription) metaRef.current.ogDescription.content = dynamicDescription;
      if (metaRef.current.twitterTitle) metaRef.current.twitterTitle.content = dynamicTitle;
      if (metaRef.current.twitterDescription) metaRef.current.twitterDescription.content = dynamicDescription;
      
      // Clean up function - restore original meta
      return () => {
        const originalTitle = "Hand Score Calculator – Track Your Card Game Easily-Developed by Maysalward";
        const originalDescription = "A fast, mobile-friendly score tracker for the popular Middle Eastern card game Hand. Supports Full Hand and Normal Hand scoring with team mode. Developed by Maysalward";
        
        if (metaRef.current.title) metaRef.current.title.content = originalTitle;
        if (metaRef.current.description) metaRef.current.description.content = originalDescription;
        if (metaRef.current.ogTitle) metaRef.current.ogTitle.content = originalTitle;
        if (metaRef.current.ogDescription) metaRef.current.ogDescription.content = originalDescription;
        if (metaRef.current.twitterTitle) metaRef.current.twitterTitle.content = originalTitle;
        if (metaRef.current.twitterDescription) metaRef.current.twitterDescription.content = originalDescription;
      };
    }
  }, [gameCompleted, players, calculateFinalScores, gameMode, rounds]);
  
  // This component doesn't render anything visible
  return null;
}

export default SharePreview;