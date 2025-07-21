// Register service worker for PWA functionality
export const registerServiceWorker = async () => {
  console.log('Attempting to register service worker...');
  
  // Only register if service workers are supported
  if ('serviceWorker' in navigator) {
    try {
      // Register the service worker with appropriate scope
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
        updateViaCache: 'none' // Don't use cached service worker
      });

      console.log('Service Worker registered successfully:', registration.scope);

      // Check if service worker is already waiting
      if (registration.waiting) {
        console.log('New service worker is waiting to activate');
        notifyUserOfUpdate(registration);
      }

      // Detect when a new service worker has been installed
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('New service worker is installing:', newWorker);

        // When the new service worker changes state
        newWorker.addEventListener('statechange', () => {
          console.log('Service worker state changed:', newWorker.state);
          
          // When the new service worker is installed
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available, notify user
            console.log('New service worker installed and waiting to activate');
            notifyUserOfUpdate(registration);
          }
        });
      });

      // Handle service worker updates
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        console.log('Service worker controller changed, refreshing page');
        refreshing = true;
        window.location.reload();
      });

      // Preload critical assets for image capture
      await preloadCriticalAssets();

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  } else {
    console.log('Service Workers not supported in this browser');
  }
};

// Preload critical assets needed for image capture
const preloadCriticalAssets = async () => {
  console.log('Preloading critical assets...');
  
  try {
    // Create an array to hold all loading promises
    const promises = [];

    // Wait for document fonts to load
    if (document.fonts && document.fonts.ready) {
      promises.push(document.fonts.ready);
    }

    // Preload specific font files with CORS
    const fontFiles = [
      // Roboto (English)
      {
        url: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
        family: 'Roboto',
        weight: '400'
      },
      {
        url: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc4AMP6lQ.woff2',
        family: 'Roboto',
        weight: '500'
      },
      {
        url: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4AMP6lQ.woff2',
        family: 'Roboto',
        weight: '700'
      },
      // Cairo (Arabic)
      {
        url: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hOA-aXFmZw.woff2',
        family: 'Cairo',
        weight: '400'
      },
      {
        url: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hGA-aXFmZw.woff2',
        family: 'Cairo',
        weight: '500'
      },
      {
        url: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hOA-aXE.woff2',
        family: 'Cairo',
        weight: '700'
      }
    ];

    // Load each font file
    fontFiles.forEach(font => {
      try {
        const fontFace = new FontFace(
          font.family,
          `url(${font.url})`, 
          { weight: font.weight, display: 'swap' }
        );
        
        const fontPromise = fontFace.load()
          .then(loadedFont => {
            document.fonts.add(loadedFont);
            console.log(`Font loaded: ${font.family} ${font.weight}`);
            return loadedFont;
          })
          .catch(err => {
            console.warn(`Failed to preload font ${font.family} ${font.weight}:`, err);
            return null; // Don't fail the entire process
          });
          
        promises.push(fontPromise);
      } catch (err) {
        console.warn(`Error creating FontFace for ${font.family}:`, err);
      }
    });

    // Preload external images
    const imageUrls = [
      'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1752690093494-maysalward-primary-logo-landscape.png'
    ];

    imageUrls.forEach(url => {
      const imagePromise = new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          console.log(`Image preloaded: ${url}`);
          resolve(img);
        };
        
        img.onerror = () => {
          console.warn(`Image preload failed: ${url}`);
          resolve(null); // Don't fail the entire process
        };
        
        // Set a timeout to avoid hanging forever
        setTimeout(() => {
          if (!img.complete) {
            console.warn(`Image load timeout: ${url}`);
            resolve(null);
          }
        }, 5000);
        
        img.src = url;
      });
      
      promises.push(imagePromise);
    });

    // Wait for all assets to load (or fail gracefully)
    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    console.log(`Asset preloading complete - Success: ${successful}, Failed: ${failed}`);
    return true;
  } catch (error) {
    console.warn('Asset preloading failed:', error);
    return false;
  }
};

// Function to notify users about updates
const notifyUserOfUpdate = (registration) => {
  // Dispatch event to show update notification in the app
  window.dispatchEvent(new CustomEvent('swUpdate', { detail: registration }));
};

// Check for app updates
export const checkForUpdates = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        console.log('Checking for Service Worker updates...');
        await registration.update();
        console.log('Service Worker update check completed');
      }
    } catch (error) {
      console.error('Service Worker update check failed:', error);
    }
  }
};

// Update the service worker immediately
export const updateServiceWorker = (registration) => {
  if (registration && registration.waiting) {
    console.log('Skipping waiting - activating new service worker');
    // Send message to service worker to skip waiting
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
};