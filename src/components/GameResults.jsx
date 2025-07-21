import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import html2canvas from 'html2canvas';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const {
  FiDownload,
  FiShare2,
  FiRepeat,
  FiCheck,
  FiX,
  FiUser,
  FiTrophy,
  FiChevronDown,
  FiChevronUp,
  FiEye,
  FiEyeOff,
  FiSave,
  FiDatabase
} = FiIcons;

const translations = {
  en: {
    title: 'Game Results',
    winner: 'Winner',
    playAgain: 'Play Again',
    downloadImage: 'Download Result Image',
    shareResults: 'Share on Social Media',
    finalScore: 'Final Scores',
    roundByRound: 'Round by Round Results',
    showRounds: 'Show Round Details',
    hideRounds: 'Hide Round Details',
    round: 'Round',
    total: 'Total',
    downloadSuccess: 'Result image downloaded successfully',
    downloadError: 'Failed to download result image',
    shareSuccess: 'Results shared successfully',
    shareError: 'Failed to share results',
    team: 'Team',
    teamScore: 'Team Score',
    gameDate: 'Game Date',
    gameDuration: 'Game Duration',
    gameMode: 'Game Mode',
    soloMode: 'Solo Mode',
    partnershipMode: 'Partnership Mode',
    tied: 'Tied for the win!',
    preparing: 'Preparing image...',
    loadingAssets: 'Loading fonts and images...',
    saveGame: 'Save Game Results',
    saveSuccess: 'Game results saved successfully!',
    saveError: 'Failed to save game results',
    autoSaved: 'Game automatically saved to statistics',
    gameSaved: 'Game Saved',
    viewStats: 'View Statistics',
    savedToStats: 'Results saved to statistics'
  },
  ar: {
    title: 'نتائج اللعبة',
    winner: 'الفائز',
    playAgain: 'العب مرة أخرى',
    downloadImage: 'تنزيل صورة النتيجة',
    shareResults: 'مشاركة على وسائل التواصل',
    finalScore: 'النتائج النهائية',
    roundByRound: 'نتائج الجولات',
    showRounds: 'عرض تفاصيل الجولات',
    hideRounds: 'إخفاء تفاصيل الجولات',
    round: 'الجولة',
    total: 'المجموع',
    downloadSuccess: 'تم تنزيل صورة النتيجة بنجاح',
    downloadError: 'فشل تنزيل صورة النتيجة',
    shareSuccess: 'تمت مشاركة النتائج بنجاح',
    shareError: 'فشل مشاركة النتائج',
    team: 'فريق',
    teamScore: 'نقاط الفريق',
    gameDate: 'تاريخ اللعبة',
    gameDuration: 'مدة اللعبة',
    gameMode: 'نمط اللعب',
    soloMode: 'نمط فردي',
    partnershipMode: 'نمط الشراكة',
    tied: 'تعادل في الفوز!',
    preparing: 'جاري تحضير الصورة...',
    loadingAssets: 'جاري تحميل الخطوط والصور...',
    saveGame: 'حفظ نتائج اللعبة',
    saveSuccess: 'تم حفظ نتائج اللعبة بنجاح!',
    saveError: 'فشل حفظ نتائج اللعبة',
    autoSaved: 'تم حفظ اللعبة تلقائياً في الإحصائيات',
    gameSaved: 'تم حفظ اللعبة',
    viewStats: 'عرض الإحصائيات',
    savedToStats: 'تم حفظ النتائج في الإحصائيات'
  }
};

// Confetti component for celebration
const Confetti = ({ isActive }) => {
  if (!isActive) return null;

  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 2,
    color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][
      Math.floor(Math.random() * 6)
    ]
  }));

  return (
    <div className="confetti-container absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece absolute w-2 h-2 opacity-80"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`
          }}
        />
      ))}
    </div>
  );
};

// Enhanced asset preloading function
const preloadAssets = async () => {
  console.log('Preloading assets for image capture...');
  const promises = [];

  // Wait for document fonts to load
  if (document.fonts && document.fonts.ready) {
    promises.push(
      document.fonts.ready.then(() => {
        console.log('Document fonts loaded via fonts.ready');
      })
    );
  }

  // Manually load critical fonts with CORS
  const fontFaces = [
    // Roboto fonts (English)
    {
      family: 'Roboto',
      url: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
      weight: '400'
    },
    {
      family: 'Roboto',
      url: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc4AMP6lQ.woff2',
      weight: '500'
    },
    {
      family: 'Roboto',
      url: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4AMP6lQ.woff2',
      weight: '700'
    },
    // Cairo fonts (Arabic)
    {
      family: 'Cairo',
      url: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hOA-aXFmZw.woff2',
      weight: '400'
    },
    {
      family: 'Cairo',
      url: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hGA-aXFmZw.woff2',
      weight: '500'
    },
    {
      family: 'Cairo',
      url: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hOA-aXE.woff2',
      weight: '700'
    }
  ];

  // Create and load each font face
  fontFaces.forEach((font) => {
    try {
      const fontFace = new FontFace(font.family, `url(${font.url})`, {
        weight: font.weight
      });

      const fontPromise = fontFace
        .load()
        .then((loadedFace) => {
          document.fonts.add(loadedFace);
          console.log(`Font loaded: ${font.family} ${font.weight}`);
          return loadedFace;
        })
        .catch((err) => {
          console.warn(`Failed to load font ${font.family} ${font.weight}:`, err);
          // Don't fail the entire process, just log the error
          return null;
        });

      promises.push(fontPromise);
    } catch (e) {
      console.warn(`Error creating FontFace for ${font.family}:`, e);
    }
  });

  // Preload logo image
  const logoPromise = new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      console.log('Logo image preloaded');
      resolve();
    };
    img.onerror = () => {
      console.warn('Failed to preload logo image');
      resolve(); // Don't fail the entire process
    };
    img.src =
      'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1752690093494-maysalward-primary-logo-landscape.png';
  });

  promises.push(logoPromise);

  // Wait for all assets to load (or fail gracefully)
  await Promise.allSettled(promises);
  console.log('Asset preloading complete');
};

// Helper function to save image to device
const saveImageToDevice = async (blob, fileName) => {
  try {
    // For mobile devices using the native share API
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], fileName, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Hand Game Results'
        });
        return true;
      }
    }

    // For desktop or fallback
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error saving image:', error);
    return false;
  }
};

function GameResults({ onPlayAgain, language }) {
  const navigate = useNavigate();
  const {
    players,
    rounds,
    scores,
    gameMode,
    calculateFinalScores,
    calculateTeamScores,
    getTeamByPlayerId,
    dispatch,
    createdAt,
    gameId
  } = useGame();

  const [statusMessage, setStatusMessage] = useState(null);
  const [showRoundDetails, setShowRoundDetails] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [gameSaved, setGameSaved] = useState(false);
  const captureContainerRef = useRef(null);

  const t = translations[language];
  const finalScores = calculateFinalScores();
  const teamScores = gameMode === 'partnership' ? calculateTeamScores() : null;

  // Preload assets on component mount
  useEffect(() => {
    const loadAssets = async () => {
      try {
        await preloadAssets();
        setAssetsLoaded(true);
      } catch (error) {
        console.error('Asset loading failed:', error);
        // Continue anyway - we'll try again when capturing
        setAssetsLoaded(true);
      }
    };

    loadAssets();
  }, []);

  // Show confetti on component mount for winners
  useEffect(() => {
    if (assetsLoaded) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [assetsLoaded]);

  // Auto-save game results on component mount
  useEffect(() => {
    if (assetsLoaded && !gameSaved && players && players.length > 0) {
      handleSaveGame(true); // Auto-save
    }
  }, [assetsLoaded, gameSaved, players]);

  const showStatusMessage = (message, isError = false) => {
    setStatusMessage({ text: message, isError });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handlePlayAgain = () => {
    dispatch({ type: 'RESET_GAME' });
    onPlayAgain();
    navigate('/setup');
  };

  // Enhanced save game function
  const handleSaveGame = async (isAutoSave = false) => {
    try {
      if (!players || players.length === 0 || !finalScores) {
        throw new Error('No game data to save');
      }

      // Find winner (lowest score)
      const sortedPlayers = players
        .map((player) => ({ ...player, score: finalScores[player.id] || 0 }))
        .sort((a, b) => a.score - b.score);

      const winner = sortedPlayers[0];
      const currentTime = new Date().toISOString();

      // Calculate game duration
      const startTime = createdAt ? new Date(createdAt) : new Date();
      const endTime = new Date();
      const duration = Math.round((endTime - startTime) / (1000 * 60)); // in minutes

      // Prepare game data
      const gameData = {
        id: gameId || Date.now().toString(),
        date: createdAt || currentTime,
        completedAt: currentTime,
        players: players.map((player) => ({
          id: player.id,
          name: player.name,
          avatar: player.avatar
        })),
        rounds,
        scores,
        finalScores,
        teamScores,
        gameMode,
        teams: gameMode === 'partnership' ? {
          A: players.filter(p => getTeamByPlayerId(p.id) === 'A').map(p => p.id),
          B: players.filter(p => getTeamByPlayerId(p.id) === 'B').map(p => p.id)
        } : null,
        winner: winner
          ? {
              id: winner.id,
              name: winner.name,
              score: winner.score
            }
          : null,
        duration
      };

      // Save to localStorage
      const savedGamesString = localStorage.getItem('savedGames') || '[]';
      const savedGames = JSON.parse(savedGamesString);
      
      // Check if game already exists (prevent duplicates)
      const existingGameIndex = savedGames.findIndex(game => game.id === gameData.id);
      
      if (existingGameIndex >= 0) {
        // Update existing game
        savedGames[existingGameIndex] = gameData;
      } else {
        // Add new game
        savedGames.push(gameData);
      }

      // Keep only last 100 games to prevent storage issues
      if (savedGames.length > 100) {
        savedGames.splice(0, savedGames.length - 100);
      }

      localStorage.setItem('savedGames', JSON.stringify(savedGames));

      // Update player statistics
      updatePlayerStatistics(gameData);

      setGameSaved(true);

      if (isAutoSave) {
        showStatusMessage(t.autoSaved);
      } else {
        showStatusMessage(t.saveSuccess);
      }

      console.log('Game saved successfully:', gameData);
    } catch (error) {
      console.error('Error saving game:', error);
      showStatusMessage(t.saveError, true);
    }
  };

  // Update player statistics
  const updatePlayerStatistics = (gameData) => {
    try {
      const existingStats = JSON.parse(localStorage.getItem('playerStatistics') || '{}');
      
      gameData.players.forEach((player) => {
        const playerName = player.name;
        const playerScore = gameData.finalScores[player.id] || 0;
        const isWinner = gameData.winner && gameData.winner.id === player.id;

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
            lastPlayed: new Date().toISOString(),
            roundsPlayed: 0,
            fullHandFinishes: 0
          };
        }

        const stats = existingStats[playerName];

        // Update stats
        stats.gamesPlayed++;
        stats.roundsPlayed += gameData.rounds || 0;
        if (isWinner) stats.wins++;
        stats.totalScore += playerScore;
        stats.bestScore = Math.min(stats.bestScore, playerScore);
        stats.worstScore = Math.max(stats.worstScore, playerScore);
        stats.lastPlayed = new Date().toISOString();
        stats.totalDuration += gameData.duration || 0;

        // Check for full hand finishes
        if (isWinner && gameData.scores && gameData.scores[player.id]) {
          const playerRoundScores = gameData.scores[player.id];
          const hasFullHand = playerRoundScores.some(score => score <= -60);
          if (hasFullHand) {
            stats.fullHandFinishes++;
          }
        }

        if (gameData.gameMode === 'solo') {
          stats.soloGames++;
        } else {
          stats.partnershipGames++;
        }

        // Add score to history (keep last 50 scores)
        stats.scores.push({
          score: playerScore,
          date: gameData.completedAt,
          isWinner,
          gameMode: gameData.gameMode,
          gameId: gameData.id,
          rounds: gameData.rounds
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

  // Wait for DOM to be completely rendered
  const waitForCompleteRendering = async () => {
    console.log('Waiting for complete DOM rendering...');

    // Wait for fonts to be fully loaded
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
      console.log('Document fonts ready');
    }

    // Wait for all images in the capture container
    const container = captureContainerRef.current;
    if (!container) {
      console.error('Capture container not found');
      return;
    }

    const images = Array.from(container.querySelectorAll('img'));
    console.log(`Found ${images.length} images to load`);

    if (images.length > 0) {
      const imagePromises = images.map((img) => {
        if (img.complete && img.naturalHeight !== 0) {
          console.log(`Image already loaded: ${img.src}`);
          return Promise.resolve();
        }

        return new Promise((resolve) => {
          const timeout = setTimeout(() => {
            console.warn('Image load timeout:', img.src);
            resolve(); // Resolve anyway to avoid hanging
          }, 5000);

          img.onload = () => {
            clearTimeout(timeout);
            console.log(`Image loaded: ${img.src}`);
            resolve();
          };

          img.onerror = () => {
            clearTimeout(timeout);
            console.warn('Image load error:', img.src);
            resolve(); // Resolve anyway to avoid hanging
          };

          // Force reload if needed
          const currentSrc = img.src;
          img.src = '';
          img.src = currentSrc;
        });
      });

      await Promise.all(imagePromises);
    }

    // Force a layout recalculation
    container.getBoundingClientRect();

    // Wait for CSS animations and transitions to complete
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Force another layout recalculation
    container.offsetHeight;

    // Wait for any final renders
    await new Promise((resolve) =>
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      })
    );

    // Final delay for stability
    await new Promise((resolve) => setTimeout(resolve, 300));

    console.log('DOM rendering complete');
  };

  const captureCompleteResults = async () => {
    console.log('Starting image capture process');
    if (!captureContainerRef.current) {
      throw new Error('Capture container not found');
    }

    // Set capturing state
    setIsCapturing(true);

    // Always show round details and confetti for capture
    setShowRoundDetails(true);
    setShowConfetti(true);

    // Scroll to top and wait for layout
    window.scrollTo(0, 0);

    // Wait for complete rendering
    await waitForCompleteRendering();

    const element = captureContainerRef.current;

    // Target dimensions for 9:16 aspect ratio
    const targetWidth = 1080;
    const targetHeight = 1920;

    try {
      // First capture the content with its original dimensions
      const contentCanvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#1E1E1E',
        scrollY: -window.scrollY,
        scale: 2, // High quality for retina displays
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc, element) => {
          console.log('Preparing cloned document for capture');

          // Preserve document settings
          clonedDoc.documentElement.setAttribute('lang', language);
          clonedDoc.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');

          // Add capture-specific styles
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              -webkit-font-smoothing: antialiased !important;
              -moz-osx-font-smoothing: grayscale !important;
              text-rendering: optimizeLegibility !important;
            }
            
            #results-section {
              font-family: ${language === 'ar' ? "'Cairo', sans-serif" : "'Roboto', sans-serif"} !important;
              background: #1E1E1E !important;
              color: white !important;
              overflow: visible !important;
              height: auto !important;
              max-height: none !important;
              min-height: auto !important;
              padding: 24px !important;
              border-radius: 12px !important;
              position: relative !important;
              width: 100% !important;
              box-sizing: border-box !important;
            }
            
            #results-section * {
              overflow: visible !important;
              backface-visibility: visible !important;
              max-height: none !important;
              height: auto !important;
              box-sizing: border-box !important;
            }
            
            #results-section img {
              image-rendering: -webkit-optimize-contrast !important;
              max-width: 100% !important;
              height: auto !important;
            }
            
            .confetti-container, .confetti-piece {
              opacity: 0.8 !important;
              display: block !important;
              position: absolute !important;
            }
            
            .results-table {
              border-collapse: separate !important;
              border-spacing: 0 !important;
              width: 100% !important;
              table-layout: auto !important;
              margin-bottom: 16px !important;
            }
            
            .results-table th, .results-table td {
              overflow: visible !important;
              text-overflow: clip !important;
              white-space: nowrap !important;
              max-width: none !important;
            }
            
            .final-scores-section {
              background: white !important;
              border-radius: 12px !important;
              padding: 16px !important;
              margin-bottom: 24px !important;
              overflow: visible !important;
            }
            
            .final-scores-section h3 {
              color: #1f2937 !important;
              font-size: 18px !important;
              font-weight: bold !important;
              margin-bottom: 16px !important;
            }
            
            .player-score-row {
              display: flex !important;
              align-items: center !important;
              justify-content: space-between !important;
              background: white !important;
              border-radius: 8px !important;
              padding: 12px !important;
              margin-bottom: 8px !important;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
            }
            
            .player-info {
              display: flex !important;
              align-items: center !important;
              gap: 12px !important;
              flex: 1 !important;
            }
            
            .player-rank {
              width: 32px !important;
              height: 32px !important;
              border-radius: 50% !important;
              background: #f3f4f6 !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              font-size: 14px !important;
              font-weight: bold !important;
              color: #6b7280 !important;
            }
            
            .player-avatar {
              width: 40px !important;
              height: 40px !important;
              border-radius: 50% !important;
              background: #f3f4f6 !important;
              overflow: hidden !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
            
            .player-name {
              font-size: 16px !important;
              font-weight: 500 !important;
              color: #1f2937 !important;
            }
            
            .player-team {
              font-size: 12px !important;
              color: #6b7280 !important;
            }
            
            .player-score {
              font-size: 24px !important;
              font-weight: bold !important;
            }
            
            .winner-score {
              color: #10b981 !important;
            }
            
            .regular-score {
              color: #6b7280 !important;
            }
            
            .rounds-table-section {
              background: white !important;
              border-radius: 12px !important;
              padding: 16px !important;
              overflow: visible !important;
            }
            
            .rounds-table-section h3 {
              color: #1f2937 !important;
              font-size: 18px !important;
              font-weight: bold !important;
              margin-bottom: 16px !important;
            }
            
            .rounds-table {
              width: 100% !important;
              border-collapse: separate !important;
              border-spacing: 0 !important;
              font-size: 12px !important;
            }
            
            .rounds-table th {
              background: #f9fafb !important;
              padding: 8px 4px !important;
              text-align: center !important;
              font-weight: 500 !important;
              color: #374151 !important;
              border-bottom: 1px solid #e5e7eb !important;
              font-size: 11px !important;
            }
            
            .rounds-table td {
              padding: 8px 4px !important;
              text-align: center !important;
              border-bottom: 1px solid #f3f4f6 !important;
              font-size: 12px !important;
            }
            
            .player-name-cell {
              text-align: left !important;
              padding-left: 8px !important;
              font-weight: 500 !important;
              color: #1f2937 !important;
            }
            
            .total-cell {
              font-weight: bold !important;
              font-size: 14px !important;
            }
            
            .positive-score {
              color: #ef4444 !important;
              font-weight: 500 !important;
            }
            
            .negative-score {
              color: #10b981 !important;
              font-weight: 500 !important;
            }
            
            .zero-score {
              color: #6b7280 !important;
            }
            
            .results-footer {
              margin-top: 24px !important;
              text-align: center !important;
              opacity: 0.8 !important;
            }
            
            .results-footer img {
              height: 24px !important;
              margin: 0 auto !important;
            }
          `;
          clonedDoc.head.appendChild(style);

          // Apply ID to the capture container
          element.id = 'results-section';

          // Ensure confetti visibility
          const confettiElements = element.querySelectorAll('.confetti-piece');
          confettiElements.forEach((confetti) => {
            confetti.style.setProperty('opacity', '0.8', 'important');
            confetti.style.setProperty('display', 'block', 'important');
            confetti.style.setProperty('position', 'absolute', 'important');
          });

          // Ensure images have proper attributes
          const images = element.querySelectorAll('img');
          images.forEach((img) => {
            img.crossOrigin = 'anonymous';
            img.style.setProperty('image-rendering', '-webkit-optimize-contrast', 'important');
          });

          // Apply appropriate classes to tables
          const tables = element.querySelectorAll('table');
          tables.forEach((table) => {
            table.classList.add('results-table');
          });
        }
      });

      // Create a new canvas with the target 9:16 aspect ratio
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = targetWidth;
      finalCanvas.height = targetHeight;
      const ctx = finalCanvas.getContext('2d');

      // Fill background with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, targetHeight);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Calculate scaling to fit content within the 9:16 canvas
      // Get content dimensions from the canvas
      const contentWidth = contentCanvas.width;
      const contentHeight = contentCanvas.height;
      console.log(`Content dimensions: ${contentWidth}x${contentHeight}`);

      // Calculate scaling to fit content while maintaining aspect ratio
      // Use 85% of target width/height to leave some margin
      const scaleX = (targetWidth * 0.9) / contentWidth;
      const scaleY = (targetHeight * 0.85) / contentHeight;
      const scale = Math.min(scaleX, scaleY);

      // Calculate dimensions of the scaled content
      const scaledWidth = contentWidth * scale;
      const scaledHeight = contentHeight * scale;

      // Center the content
      const xPos = (targetWidth - scaledWidth) / 2;
      const yPos = Math.max((targetHeight - scaledHeight) / 4, 100); // More space at top

      // Draw the content onto the final canvas
      ctx.drawImage(
        contentCanvas,
        0,
        0,
        contentWidth,
        contentHeight, // Source dimensions
        xPos,
        yPos,
        scaledWidth,
        scaledHeight // Destination dimensions
      );

      // Add title at the top
      ctx.font = `bold ${Math.round(targetWidth * 0.05)}px ${language === 'ar' ? 'Cairo' : 'Roboto'}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.fillText('Hand Game Results', targetWidth / 2, 60);

      // Add a subtle watermark at the bottom
      ctx.font = `${Math.round(targetWidth * 0.025)}px ${language === 'ar' ? 'Cairo' : 'Roboto'}`;
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('Developed by Maysalward', targetWidth / 2, targetHeight - 30);

      console.log('Image capture successful');
      setIsCapturing(false);
      setShowRoundDetails(false); // Reset to user's preference

      return finalCanvas;
    } catch (error) {
      console.error('html2canvas error:', error);
      setIsCapturing(false);
      setShowRoundDetails(false);
      throw error;
    }
  };

  const handleDownloadImage = async () => {
    try {
      if (!assetsLoaded) {
        showStatusMessage(t.loadingAssets, false);
        await preloadAssets();
        setAssetsLoaded(true);
      }

      showStatusMessage(t.preparing, false);
      const canvas = await captureCompleteResults();

      // Convert to high-quality blob
      const blob = await new Promise((resolve, reject) => {
        try {
          canvas.toBlob(
            (b) => {
              if (b) {
                resolve(b);
              } else {
                reject(new Error('Canvas to Blob conversion failed'));
              }
            },
            'image/png',
            1.0 // highest quality
          );
        } catch (err) {
          reject(err);
        }
      });

      if (!blob) {
        throw new Error('Failed to create image blob');
      }

      const gameDate = new Date().toISOString().slice(0, 10);
      const gameTime = new Date().toTimeString().slice(0, 5).replace(':', '-');
      const fileName = `hand-game-results-${gameDate}-${gameTime}.png`;

      const saved = await saveImageToDevice(blob, fileName);

      if (saved) {
        showStatusMessage(t.downloadSuccess);
      } else {
        throw new Error('Failed to save image');
      }
    } catch (error) {
      console.error('Download failed:', error);
      showStatusMessage(t.downloadError, true);
    }
  };

  const handleShareResults = async () => {
    try {
      if (!assetsLoaded) {
        showStatusMessage(t.loadingAssets, false);
        await preloadAssets();
        setAssetsLoaded(true);
      }

      showStatusMessage(t.preparing, false);

      // Create a summary text for sharing
      const winners = getWinners();
      const winnerText =
        winners.length === 1
          ? `🏆 ${winners[0].name} won with ${winners[0].score} points!`
          : `🤝 Tie game! ${winners.map((w) => w.name).join(', ')} tied with ${winners[0].score} points!`;

      // Include round-by-round details in the text
      const roundDetails = players
        .map((player) => {
          const playerScores = scores[player.id] || [];
          const roundScores = playerScores
            .map((score, index) => `R${index + 1}: ${score || 0}`)
            .join(', ');
          return `${player.name}: ${roundScores} (Total: ${finalScores[player.id] || 0})`;
        })
        .join('\n');

      const gameInfo = `🃏 Hand Game Results\n${winnerText}\n\n📊 Game Mode: ${
        gameMode === 'partnership' ? 'Partnership' : 'Solo'
      }\n👥 Players: ${players.length} | 🔄 Rounds: ${rounds}\n\n📈 Round by Round Scores:\n${roundDetails}`;

      // Try native sharing with image first
      if (navigator.share) {
        try {
          const canvas = await captureCompleteResults();
          const blob = await new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Canvas to Blob conversion failed'));
            }, 'image/png', 1.0);
          });

          if (blob) {
            const file = new File([blob], 'hand-game-results.png', {
              type: 'image/png',
              lastModified: new Date().getTime()
            });

            // Try sharing with both image and text
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: '🏆 Hand Game Results',
                text: gameInfo
              });
              showStatusMessage(t.shareSuccess);
              return;
            }
          }

          // Fall back to text-only sharing
          await navigator.share({
            title: '🏆 Hand Game Results',
            text: gameInfo
          });
          showStatusMessage(t.shareSuccess);
          return;
        } catch (shareError) {
          console.warn('Share API failed:', shareError);
          // Continue to fallbacks
        }
      }

      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(gameInfo);
        showStatusMessage(
          '📋 Results copied to clipboard! You can now paste it on WhatsApp, Messenger, or any social media.',
          false
        );
      } catch (clipboardError) {
        console.warn('Clipboard failed:', clipboardError);
        // Final fallback: Download image
        await handleDownloadImage();
      }
    } catch (error) {
      console.error('Share failed:', error);
      showStatusMessage(t.shareError, true);
    }
  };

  // Get winner(s) information - Lowest score wins
  const getWinners = () => {
    if (!players || players.length === 0) return [];

    if (gameMode === 'partnership' && teamScores) {
      const lowestScore = Math.min(teamScores.A, teamScores.B);
      const winningTeam =
        teamScores.A === lowestScore && teamScores.B === lowestScore
          ? 'both'
          : teamScores.A === lowestScore
          ? 'A'
          : 'B';

      if (winningTeam === 'both') {
        return players.map((player) => ({
          ...player,
          score: finalScores[player.id] || 0,
          teamScore: teamScores[getTeamByPlayerId(player.id)],
          team: getTeamByPlayerId(player.id)
        }));
      } else {
        const winners = players.filter((player) => getTeamByPlayerId(player.id) === winningTeam);
        return winners.map((player) => ({
          ...player,
          score: finalScores[player.id] || 0,
          teamScore: teamScores[winningTeam],
          team: winningTeam
        }));
      }
    } else {
      const lowestScore = Math.min(...Object.values(finalScores));
      const winners = players.filter((player) => finalScores[player.id] === lowestScore);
      return winners.map((player) => ({
        ...player,
        score: finalScores[player.id] || 0
      }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(
      language === 'ar' ? 'ar-SA' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  };

  const winners = getWinners();
  const isTie = winners.length > 1;

  // Show loading state if assets aren't ready
  if (!assetsLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="spinner mb-4"></div>
          <p>{t.loadingAssets}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 relative">
      <div className="max-w-4xl mx-auto">
        {/* Complete Results Container for Capture */}
        <div
          ref={captureContainerRef}
          className="capture-container relative"
          style={{
            minHeight: 'auto',
            width: '100%',
            backgroundColor: 'transparent',
            padding: '0',
            borderRadius: '0',
            position: 'relative',
            overflow: 'visible'
          }}
        >
          {/* Confetti Animation */}
          <Confetti isActive={showConfetti} />

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">{t.title}</h1>
            {createdAt && <p className="text-white opacity-70 text-sm mt-2">{formatDate(createdAt)}</p>}
          </motion.div>

          {/* Game Info Header */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">🏆 Hand Game Results</h2>
              <div className="flex justify-center space-x-4 text-sm text-gray-300 flex-wrap">
                <span>
                  🎮 {t.gameMode}: {gameMode === 'partnership' ? t.partnershipMode : t.soloMode}
                </span>
                <span>•</span>
                <span>👥 {players?.length || 0} Players</span>
                <span>•</span>
                <span>🔄 {rounds} Rounds</span>
              </div>
            </div>

            {/* Winners Section */}
            <div className="bg-yellow-50 rounded-lg p-4 mb-6 relative">
              {/* Winner badge */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  🏆 {t.winner}
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-bold text-center text-gray-800 mb-4">
                  {isTie && <span className="text-yellow-600">🤝 {t.tied}</span>}
                </h3>

                <div className="flex flex-wrap justify-center gap-4">
                  {winners.map((winner) => (
                    <div
                      key={winner.id}
                      className="flex items-center space-x-3 bg-white rounded-lg p-3 border-2 border-yellow-400 shadow-md"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-yellow-400">
                        {winner.avatar ? (
                          <img
                            src={winner.avatar}
                            alt={winner.name}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <SafeIcon icon={FiUser} className="text-2xl text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{winner.name}</h4>
                        {gameMode === 'partnership' && (
                          <p className="text-sm text-gray-600">
                            {t.team} {winner.team}
                          </p>
                        )}
                        <div className="flex items-center space-x-2">
                          <SafeIcon icon={FiTrophy} className="text-yellow-500" />
                          <span className="font-bold text-green-600">{winner.score}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Final Scores Section - Enhanced for capture */}
          <div className="mb-6 final-scores-section">
            <h3 className="text-lg font-bold text-white mb-4">📊 {t.finalScore}</h3>
            <div className="space-y-2">
              {players &&
                [...players]
                  .sort((a, b) => (finalScores[a.id] || 0) - (finalScores[b.id] || 0))
                  .map((player, index) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm player-score-row"
                    >
                      <div className="flex items-center space-x-3 player-info">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-bold text-gray-600 player-rank">
                          {index + 1}
                        </div>
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 player-avatar">
                          {player.avatar ? (
                            <img
                              src={player.avatar}
                              alt={player.name}
                              className="w-full h-full object-cover"
                              crossOrigin="anonymous"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <SafeIcon icon={FiUser} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium player-name">{player.name}</div>
                          {gameMode === 'partnership' && (
                            <div className="text-xs text-gray-500 player-team">
                              {t.team} {getTeamByPlayerId(player.id)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div
                        className={`text-xl font-bold player-score ${
                          winners.some((w) => w.id === player.id) ? 'winner-score' : 'regular-score'
                        }`}
                      >
                        {finalScores[player.id] || 0}
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          {/* Team Totals for Partnership Mode */}
          {gameMode === 'partnership' && teamScores && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-4">🏆 {t.teamScore}</h3>
              <div className="space-y-2">
                {['A', 'B']
                  .sort((a, b) => teamScores[a] - teamScores[b])
                  .map((team) => (
                    <div
                      key={team}
                      className={`flex items-center justify-between rounded-lg p-3 ${
                        teamScores[team] === Math.min(teamScores.A, teamScores.B)
                          ? 'bg-yellow-300'
                          : 'bg-gray-200'
                      }`}
                    >
                      <div className="font-bold text-gray-800">
                        🏆 {t.team} {team}
                      </div>
                      <div className="text-xl font-bold text-gray-800">{teamScores[team] || 0}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Round by Round Results - Always show when capturing */}
          {(showRoundDetails || isCapturing) && (
            <div className="mt-6 rounds-table-section">
              <h3 className="text-lg font-bold text-white mb-4">📈 {t.roundByRound}</h3>
              <div className="overflow-visible bg-white rounded-lg">
                <table className="w-full rounds-table">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-700 text-sm">Player</th>
                      {Array.from({ length: rounds }, (_, i) => (
                        <th key={i} className="px-2 py-2 text-center font-medium text-gray-700 text-xs">
                          R{i + 1}
                        </th>
                      ))}
                      <th className="px-3 py-2 text-center font-medium text-gray-700 text-sm">{t.total}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players &&
                      [...players]
                        .sort((a, b) => (finalScores[a.id] || 0) - (finalScores[b.id] || 0))
                        .map((player) => (
                          <tr key={player.id} className="border-t border-gray-200">
                            <td className="px-3 py-2 player-name-cell">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                  {player.avatar ? (
                                    <img
                                      src={player.avatar}
                                      alt={player.name}
                                      className="w-full h-full object-cover"
                                      crossOrigin="anonymous"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <SafeIcon icon={FiUser} className="text-gray-400 text-xs" />
                                    </div>
                                  )}
                                </div>
                                <span className="font-medium text-sm truncate">{player.name}</span>
                              </div>
                            </td>
                            {Array.from({ length: rounds }, (_, roundIndex) => (
                              <td key={roundIndex} className="px-2 py-2 text-center">
                                <span
                                  className={`font-medium text-sm ${
                                    (scores[player.id]?.[roundIndex] || 0) > 0
                                      ? 'positive-score'
                                      : (scores[player.id]?.[roundIndex] || 0) < 0
                                      ? 'negative-score'
                                      : 'zero-score'
                                  }`}
                                >
                                  {scores[player.id]?.[roundIndex] || 0}
                                </span>
                              </td>
                            ))}
                            <td className="px-3 py-2 text-center total-cell">
                              <span
                                className={`font-bold text-lg ${
                                  winners.some((w) => w.id === player.id) ? 'winner-score' : 'regular-score'
                                }`}
                              >
                                {finalScores[player.id] || 0}
                              </span>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer with logo - only shown when capturing */}
          {isCapturing && (
            <div className="results-footer">
              <img
                src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1752690093494-maysalward-primary-logo-landscape.png"
                alt="Maysalward"
                className="h-6 opacity-70"
                crossOrigin="anonymous"
              />
            </div>
          )}
        </div>

        {/* Toggle Round Details Button - Hidden during capture */}
        {!isCapturing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-6"
          >
            <button
              onClick={() => setShowRoundDetails(!showRoundDetails)}
              className="btn-secondary flex items-center justify-center space-x-2 mx-auto"
            >
              <SafeIcon icon={showRoundDetails ? FiEyeOff : FiEye} />
              <span>{showRoundDetails ? t.hideRounds : t.showRounds}</span>
              <SafeIcon icon={showRoundDetails ? FiChevronUp : FiChevronDown} />
            </button>
          </motion.div>
        )}

        {/* Action Buttons - Hidden during capture */}
        {!isCapturing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
          >
            <button
              onClick={handlePlayAgain}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <SafeIcon icon={FiRepeat} />
              <span>{t.playAgain}</span>
            </button>

            <button
              onClick={() => handleSaveGame(false)}
              className={`btn-success flex items-center justify-center space-x-2 ${
                gameSaved ? 'opacity-75' : ''
              }`}
              disabled={gameSaved}
            >
              <SafeIcon icon={gameSaved ? FiCheck : FiSave} />
              <span>{gameSaved ? t.gameSaved : t.saveGame}</span>
            </button>

            <button
              onClick={handleDownloadImage}
              className="btn-secondary flex items-center justify-center space-x-2"
              disabled={isCapturing}
            >
              <SafeIcon icon={FiDownload} />
              <span>{t.downloadImage}</span>
            </button>

            <button
              onClick={handleShareResults}
              className="btn-secondary flex items-center justify-center space-x-2"
              disabled={isCapturing}
            >
              <SafeIcon icon={FiShare2} />
              <span>{t.shareResults}</span>
            </button>
          </motion.div>
        )}

        {/* Additional Navigation */}
        {!isCapturing && gameSaved && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-6"
          >
            <button
              onClick={() => navigate('/statistics')}
              className="btn-secondary flex items-center justify-center space-x-2 mx-auto"
            >
              <SafeIcon icon={FiDatabase} />
              <span>{t.viewStats}</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* Status Message */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm ${
              statusMessage.isError ? 'bg-red-500' : 'bg-green-500'
            } text-white`}
          >
            <SafeIcon icon={statusMessage.isError ? FiX : FiCheck} className="text-xl flex-shrink-0" />
            <span className="text-sm font-medium">{statusMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GameResults;