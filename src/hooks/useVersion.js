import { useState, useEffect } from 'react';

const VERSION_KEY = 'handGameVersion';
const LAST_UPDATED_KEY = 'handGameLastUpdated';

export function useVersion() {
  const [version, setVersion] = useState('1.0.0');
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    try {
      // Get stored version or initialize
      const storedVersion = localStorage.getItem(VERSION_KEY);
      const storedLastUpdated = localStorage.getItem(LAST_UPDATED_KEY);
      
      if (!storedVersion) {
        // First time initialization
        localStorage.setItem(VERSION_KEY, '1.0.0');
        localStorage.setItem(LAST_UPDATED_KEY, new Date().toISOString().split('T')[0]);
        setVersion('1.0.0');
        setLastUpdated(new Date().toISOString().split('T')[0]);
      } else {
        // Increment version on each app load
        const [major, minor, patch] = storedVersion.split('.').map(Number);
        const newPatch = patch + 1;
        const newMinor = newPatch > 9 ? minor + 1 : minor;
        const newMajor = newMinor > 9 ? major + 1 : major;
        
        const newVersion = `${newMajor}.${newMinor % 10}.${newPatch % 10}`;
        
        localStorage.setItem(VERSION_KEY, newVersion);
        localStorage.setItem(LAST_UPDATED_KEY, new Date().toISOString().split('T')[0]);
        
        setVersion(newVersion);
        setLastUpdated(new Date().toISOString().split('T')[0]);
      }
    } catch (error) {
      console.error('Error managing version:', error);
      // Fallback to default values if localStorage fails
      setVersion('1.0.0');
      setLastUpdated(new Date().toISOString().split('T')[0]);
    }
  }, []);

  return { version, lastUpdated };
}