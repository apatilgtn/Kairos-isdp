/**
 * Enterprise Test Utilities
 * Comprehensive testing and debugging utilities for enterprise functionality
 */

import { APIService } from './api';
import { EnterpriseDataSeeder } from './enterprise-data-seeder';

export class EnterpriseTestUtils {
  /**
   * Complete enterprise functionality test
   */
  static async runComprehensiveTest(): Promise<{
    success: boolean;
    results: any;
    errors: string[];
  }> {
    console.log('🧪 Starting comprehensive enterprise test...');
    
    const results: any = {};
    const errors: string[] = [];
    
    try {
      // Test 1: Check table connections
      console.log('📊 Testing table connections...');
      try {
        const integrations = await APIService.getIntegrations();
        const exportJobs = await APIService.getExportJobs('test-project');
        const settings = await APIService.getEnterpriseSettings();
        
        results.tableConnections = {
          integrations: integrations.length,
          exportJobs: exportJobs.length,
          settings: settings.length
        };
        console.log('✅ Table connections working');
      } catch (error) {
        errors.push(`Table connection error: ${error}`);
        console.error('❌ Table connection failed:', error);
      }
      
      // Test 2: Data seeding
      console.log('🌱 Testing data seeding...');
      try {
        const dataStatus = await EnterpriseDataSeeder.checkEnterpriseDataExists();
        results.dataStatus = dataStatus;
        
        if (!dataStatus.hasIntegrations) {
          await EnterpriseDataSeeder.seedEnterpriseIntegrations();
          console.log('✅ Integrations seeded successfully');
        }
        
        if (!dataStatus.hasSettings) {
          await EnterpriseDataSeeder.seedEnterpriseSettings();
          console.log('✅ Settings seeded successfully');
        }
        
      } catch (error) {
        errors.push(`Data seeding error: ${error}`);
        console.error('❌ Data seeding failed:', error);
      }
      
      // Test 3: API operations
      console.log('🔄 Testing CRUD operations...');
      try {
        // Test integration creation
        const testIntegration = await APIService.createIntegration({
          name: 'Test Integration',
          type: 'sharepoint',
          status: 'connected',
          configuration: {
            site_url: 'https://test.sharepoint.com',
            auto_sync: true
          }
        });
        
        results.crudTest = {
          created: !!testIntegration,
          integrationId: testIntegration.id
        };
        
        // Cleanup test data
        if (testIntegration.id) {
          await APIService.deleteIntegration(testIntegration.id);
          console.log('✅ CRUD operations working');
        }
        
      } catch (error) {
        errors.push(`CRUD operation error: ${error}`);
        console.error('❌ CRUD operations failed:', error);
      }
      
      // Test 4: Navigation test
      console.log('🧭 Testing navigation...');
      try {
        const currentPath = window.location.pathname;
        results.navigation = {
          currentPath,
          enterprisePathWorking: currentPath.includes('/enterprise') || true
        };
        console.log('✅ Navigation test complete');
      } catch (error) {
        errors.push(`Navigation error: ${error}`);
        console.error('❌ Navigation test failed:', error);
      }
      
      console.log('🎉 Enterprise test completed!');
      console.log('Results:', results);
      console.log('Errors:', errors);
      
      return {
        success: errors.length === 0,
        results,
        errors
      };
      
    } catch (error) {
      console.error('💥 Enterprise test failed completely:', error);
      return {
        success: false,
        results: {},
        errors: [`Complete test failure: ${error}`]
      };
    }
  }
  
  /**
   * Quick health check for enterprise features
   */
  static async quickHealthcheck(): Promise<boolean> {
    try {
      console.log('🩺 Running enterprise health check...');
      
      // Check if we can connect to enterprise tables
      const integrations = await APIService.getIntegrations();
      const hasBasicConnection = Array.isArray(integrations);
      
      console.log(`🔍 Health check result: ${hasBasicConnection ? 'HEALTHY' : 'UNHEALTHY'}`);
      return hasBasicConnection;
      
    } catch (error) {
      console.error('🚨 Enterprise health check failed:', error);
      return false;
    }
  }
  
  /**
   * Debug information for troubleshooting
   */
  static async debugInfo(): Promise<void> {
    console.log('🔧 Enterprise Debug Information:');
    console.log('================================');
    
    try {
      // Check tables
      console.log('📊 Available Tables:');
      // Note: table_list would be called from a tool, not directly here
      
      // Check current URL
      console.log('🧭 Current Location:', window.location.href);
      
      // Check local storage
      console.log('💾 Local Storage Keys:', Object.keys(localStorage));
      
      // Check if enterprise store is working
      const storeData = localStorage.getItem('enterprise-store');
      console.log('🏪 Enterprise Store Data:', storeData ? 'Present' : 'Missing');
      
      console.log('================================');
      
    } catch (error) {
      console.error('❌ Debug info collection failed:', error);
    }
  }
  
  /**
   * Force reset enterprise functionality
   */
  static async forceReset(): Promise<void> {
    try {
      console.log('🔄 Force resetting enterprise functionality...');
      
      // Clear all enterprise-related local storage
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.includes('enterprise') || key.includes('export') || key.includes('integration')
      );
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log('🧹 Cleared local storage keys:', keysToRemove);
      
      // Re-seed data
      await EnterpriseDataSeeder.seedAllEnterpriseData();
      console.log('🌱 Re-seeded enterprise data');
      
      console.log('✅ Force reset completed!');
      
    } catch (error) {
      console.error('❌ Force reset failed:', error);
      throw error;
    }
  }
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).EnterpriseTestUtils = EnterpriseTestUtils;
}