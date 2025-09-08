/**
 * Local DB Service
 * A simple mock database implementation to replace the DevvAI table API
 */

import { v4 as uuidv4 } from 'uuid';

// Simple in-memory storage with localStorage persistence
class LocalDBService {
  private tables: Record<string, any[]> = {};
  private loaded = false;

  constructor() {
    this.loadFromStorage();
  }

  // Load stored data from localStorage if available
  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const storedData = localStorage.getItem('kairos-local-db');
        if (storedData) {
          this.tables = JSON.parse(storedData);
        }
        this.loaded = true;
      } catch (error) {
        console.error('Failed to load local database:', error);
        this.tables = {};
      }
    }
  }

  // Save current data to localStorage
  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('kairos-local-db', JSON.stringify(this.tables));
      } catch (error) {
        console.error('Failed to save local database:', error);
      }
    }
  }

  // Create a new table if it doesn't exist
  ensureTable(tableId: string) {
    if (!this.tables[tableId]) {
      this.tables[tableId] = [];
    }
  }

  // Add an item to a table
  async addItem(tableId: string, item: any) {
    this.ensureTable(tableId);
    
    const newItem = {
      ...item,
      _id: item._id || uuidv4(),
      _uid: item._uid || 'local-user',
      _tid: tableId
    };
    
    this.tables[tableId].push(newItem);
    this.saveToStorage();
    
    return newItem;
  }

  // Update an item in a table
  async updateItem(tableId: string, item: any) {
    this.ensureTable(tableId);
    
    const index = this.tables[tableId].findIndex(i => i._id === item._id);
    if (index !== -1) {
      this.tables[tableId][index] = {
        ...this.tables[tableId][index],
        ...item
      };
      this.saveToStorage();
      return this.tables[tableId][index];
    }
    
    throw new Error(`Item with ID ${item._id} not found in table ${tableId}`);
  }

  // Delete an item from a table
  async deleteItem(tableId: string, item: { _uid: string; _id: string }) {
    this.ensureTable(tableId);
    
    const index = this.tables[tableId].findIndex(i => i._id === item._id);
    if (index !== -1) {
      this.tables[tableId].splice(index, 1);
      this.saveToStorage();
      return true;
    }
    
    throw new Error(`Item with ID ${item._id} not found in table ${tableId}`);
  }

  // Get items from a table
  async getItems(tableId: string, options: any = {}) {
    this.ensureTable(tableId);
    
    let items = [...this.tables[tableId]];
    
    // Apply query filter if provided
    if (options.query) {
      items = items.filter(item => {
        return Object.entries(options.query).every(([key, value]) => {
          return item[key] === value;
        });
      });
    }
    
    // Apply sorting if provided
    if (options.sort) {
      const sortKey = options.sort;
      const sortDirection = options.order === 'desc' ? -1 : 1;
      
      items.sort((a, b) => {
        if (a[sortKey] < b[sortKey]) return -1 * sortDirection;
        if (a[sortKey] > b[sortKey]) return 1 * sortDirection;
        return 0;
      });
    }
    
    // Apply limit if provided
    if (options.limit) {
      items = items.slice(0, options.limit);
    }
    
    return {
      items: items
    };
  }

  // Clear a specific table
  async clearTable(tableId: string) {
    this.tables[tableId] = [];
    this.saveToStorage();
  }

  // Clear all tables
  async clearAllTables() {
    this.tables = {};
    this.saveToStorage();
  }
}

// Create and export a singleton instance
export const localDB = new LocalDBService();
