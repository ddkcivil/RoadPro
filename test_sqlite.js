// Test script to verify SQLite service behavior
console.log('Testing SQLite service...');

// Import the service
import { sqliteService } from './services/sqliteService.js';

async function testSQLite() {
  try {
    console.log('Initializing SQLite service...');
    await sqliteService.initialize();
    
    console.log('SQLite service initialized. Availability:', sqliteService.isAvailable());
    
    if (sqliteService.isAvailable()) {
      console.log('SQLite is available - testing basic operations...');
      
      // Test getting all users
      const users = await sqliteService.getAllUsers();
      console.log('Users from SQLite:', users);
      
      // Test getting project stats
      const stats = await sqliteService.getProjectStats();
      console.log('Project stats:', stats);
    } else {
      console.log('SQLite is not available - using fallback mode');
    }
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error during SQLite test:', error);
  }
}

// Run the test
testSQLite();