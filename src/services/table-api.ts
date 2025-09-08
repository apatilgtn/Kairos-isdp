/**
 * Table API Service
 * Provides a clean interface for database operations using the DevvAI SDK
 */

import { table } from '@devvai/devv-code-backend';

export interface TableResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface QueryConditions {
  [key: string]: any;
}

export interface QueryOptions {
  conditions?: QueryConditions;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

class TableAPIService {
  /**
   * Add a new item to a table
   */
  async addItem(tableId: string, data: Record<string, any>): Promise<TableResponse> {
    try {
      await table.addItem(tableId, data);
      // Since addItem doesn't return the created item, we'll simulate it
      const result = {
        ...data,
        _id: `${Date.now()}`, // Approximate ID based on timestamp
        _tid: tableId
      };
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      console.error(`Error adding item to ${tableId}:`, error);
      return {
        success: false,
        error: error.message || 'Failed to add item'
      };
    }
  }

  /**
   * Get items from a table with optional filtering
   */
  async getItems(tableId: string, options: QueryOptions = {}): Promise<TableResponse> {
    try {
      const queryOptions: any = {};
      
      if (options.limit) {
        queryOptions.limit = options.limit;
      }
      
      if (options.conditions) {
        queryOptions.query = options.conditions;
      }
      
      if (options.sortOrder) {
        queryOptions.order = options.sortOrder;
      }

      const result = await table.getItems(tableId, queryOptions);
      
      return {
        success: true,
        data: result.items || result
      };
    } catch (error: any) {
      console.error(`Error getting items from ${tableId}:`, error);
      return {
        success: false,
        error: error.message || 'Failed to get items'
      };
    }
  }

  /**
   * Update an existing item in a table
   */
  async updateItem(tableId: string, data: Record<string, any>): Promise<TableResponse> {
    try {
      await table.updateItem(tableId, data);
      return {
        success: true,
        data: data
      };
    } catch (error: any) {
      console.error(`Error updating item in ${tableId}:`, error);
      return {
        success: false,
        error: error.message || 'Failed to update item'
      };
    }
  }

  /**
   * Delete an item from a table
   */
  async deleteItem(tableId: string, keys: Record<string, any>): Promise<TableResponse> {
    try {
      await table.deleteItem(tableId, keys);
      return {
        success: true
      };
    } catch (error: any) {
      console.error(`Error deleting item from ${tableId}:`, error);
      return {
        success: false,
        error: error.message || 'Failed to delete item'
      };
    }
  }
}

export const tableAPI = new TableAPIService();