import { Project, BOQItem, InventoryItem, StructureAsset, Agency } from '../../types';

/**
 * Utility functions for autofill suggestions to prevent duplication and input errors
 */

export const getAutofillSuggestions = {
  /**
   * Get BOQ item suggestions based on existing data
   */
  boqItems: (project: Project, field: keyof BOQItem, currentValue: string): string[] => {
    if (!project.boq) return [];
    
    const allValues = project.boq
      .map(item => String(item[field]))
      .filter(value => value.toLowerCase().includes(currentValue.toLowerCase()))
      .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
    
    return allValues.slice(0, 5); // Return top 5 suggestions
  },

  /**
   * Get inventory item suggestions
   */
  inventoryItems: (project: Project, field: keyof InventoryItem, currentValue: string): string[] => {
    if (!project.inventory) return [];
    
    const allValues = project.inventory
      .map(item => String(item[field]))
      .filter(value => value.toLowerCase().includes(currentValue.toLowerCase()))
      .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
    
    return allValues.slice(0, 5); // Return top 5 suggestions
  },

  /**
   * Get structure asset suggestions
   */
  structureAssets: (project: Project, field: keyof StructureAsset, currentValue: string): string[] => {
    if (!project.structures) return [];
    
    const allValues = project.structures
      .map(item => String(item[field]))
      .filter(value => value.toLowerCase().includes(currentValue.toLowerCase()))
      .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
    
    return allValues.slice(0, 5); // Return top 5 suggestions
  },

  /**
   * Get agency suggestions
   */
  agencies: (project: Project, field: keyof Agency, currentValue: string): string[] => {
    if (!project.agencies) return [];
    
    const allValues = project.agencies
      .map(item => String(item[field]))
      .filter(value => value.toLowerCase().includes(currentValue.toLowerCase()))
      .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
    
    return allValues.slice(0, 5); // Return top 5 suggestions
  },

  /**
   * Generic suggestion function for any array of items
   */
  generic: <T>(items: T[], field: keyof T, currentValue: string): string[] => {
    if (!items) return [];
    
    const allValues = items
      .map(item => String(item[field]))
      .filter(value => value.toLowerCase().includes(currentValue.toLowerCase()))
      .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
    
    return allValues.slice(0, 5); // Return top 5 suggestions
  }
};

/**
 * Check for potential duplicates
 */
export const checkForDuplicates = {
  /**
   * Check if a BOQ item already exists
   */
  boqItemExists: (project: Project, itemToCheck: Partial<BOQItem>): boolean => {
    if (!project.boq) return false;
    
    return project.boq.some(item => 
      item.description?.toLowerCase() === itemToCheck.description?.toLowerCase() &&
      item.itemNo?.toLowerCase() === itemToCheck.itemNo?.toLowerCase()
    );
  },

  /**
   * Check if an inventory item already exists
   */
  inventoryItemExists: (project: Project, itemToCheck: Partial<InventoryItem>): boolean => {
    if (!project.inventory) return false;
    
    return project.inventory.some(item => 
      item.itemName?.toLowerCase() === itemToCheck.itemName?.toLowerCase() &&
      item.unit?.toLowerCase() === itemToCheck.unit?.toLowerCase()
    );
  },

  /**
   * Check if a structure asset already exists
   */
  structureAssetExists: (project: Project, itemToCheck: Partial<StructureAsset>): boolean => {
    if (!project.structures) return false;
    
    return project.structures.some(item => 
      item.name?.toLowerCase() === itemToCheck.name?.toLowerCase() &&
      item.location?.toLowerCase() === itemToCheck.location?.toLowerCase()
    );
  }
};