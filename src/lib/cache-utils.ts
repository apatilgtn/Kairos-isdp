/**
 * Cache Utilities for KAIROS
 * Handles clearing old cached data that might reference invalid table IDs
 */

export class CacheUtils {
  /**
   * Clear all local storage entries that might contain old table IDs
   */
  static clearEnterpriseCache(): void {
    try {
      // Clear Zustand stores that might have old data
      const storesToClear = [
        'enterprise-store',
        'mvp-app-storage',
        'collaboration-store',
        'team-store'
      ];

      storesToClear.forEach(storeName => {
        localStorage.removeItem(storeName);
        console.log(`✅ Cleared cached store: ${storeName}`);
      });

      // Clear any other potential cache entries
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('table') || key.includes('enterprise') || key.includes('export')) {
          localStorage.removeItem(key);
          console.log(`✅ Cleared cached entry: ${key}`);
        }
      });

      console.log('🧹 Cache cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
    }
  }

  /**
   * Clear all application storage
   */
  static clearAllCache(): void {
    try {
      localStorage.clear();
      sessionStorage.clear();
      console.log('🧹 All application cache cleared');
    } catch (error) {
      console.error('❌ Error clearing all cache:', error);
    }
  }

  /**
   * Validate and report current storage state
   */
  static debugStorage(): void {
    console.log('📊 Current localStorage entries:');
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        const size = new Blob([value || '']).size;
        console.log(`  ${key}: ${size} bytes`);
        
        // Check for suspicious table IDs
        if (value && (value.includes('ex9btl') || value.includes('ex9btlh'))) {
          console.warn(`⚠️  Found potentially old table ID in ${key}`);
        }
      } catch (error) {
        console.error(`❌ Error reading ${key}:`, error);
      }
    });
  }

  /**
   * Initialize cache with debug information
   */
  static initializeWithDebug(): void {
    console.log('🔍 Initializing KAIROS with cache debug...');
    this.debugStorage();
    
    // Check if we need to clear cache
    const version = localStorage.getItem('kairos-cache-version');
    const currentVersion = '2.0';
    
    if (version !== currentVersion) {
      console.log('🔄 Cache version mismatch, clearing old data...');
      this.clearEnterpriseCache();
      localStorage.setItem('kairos-cache-version', currentVersion);
    }
  }
}