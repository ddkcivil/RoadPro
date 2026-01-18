/**
 * Advanced search and filtering utilities
 */

/**
 * Search options interface
 */
export interface SearchOptions {
  caseSensitive?: boolean;
  fuzzy?: boolean;
  exactMatch?: boolean;
  searchFields?: string[];
}

/**
 * Filter options interface
 */
export interface FilterOptions {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual' | 'in' | 'notIn';
  value: any;
}

/**
 * Sort options interface
 */
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Performs a search on an array of objects
 */
export function searchItems<T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  options: SearchOptions = {}
): T[] {
  if (!searchTerm) return items;

  const { caseSensitive = false, fuzzy = false, exactMatch = false, searchFields = [] } = options;
  
  const normalizedSearchTerm = caseSensitive ? searchTerm : searchTerm.toLowerCase();

  return items.filter(item => {
    // If specific fields are provided, only search in those fields
    if (searchFields.length > 0) {
      return searchFields.some(field => {
        const fieldValue = item[field];
        return searchFieldValue(fieldValue, normalizedSearchTerm, caseSensitive, fuzzy, exactMatch);
      });
    }

    // Otherwise, search in all fields
    return Object.values(item).some(value => {
      return searchFieldValue(value, normalizedSearchTerm, caseSensitive, fuzzy, exactMatch);
    });
  });
}

/**
 * Helper function to search in a field value
 */
function searchFieldValue(
  value: any,
  searchTerm: string,
  caseSensitive: boolean,
  fuzzy: boolean,
  exactMatch: boolean
): boolean {
  if (value === null || value === undefined) return false;

  const stringValue = String(value);
  const normalizedValue = caseSensitive ? stringValue : stringValue.toLowerCase();

  if (exactMatch) {
    return normalizedValue === searchTerm;
  }

  if (fuzzy) {
    return fuzzyMatch(normalizedValue, searchTerm);
  }

  return normalizedValue.includes(searchTerm);
}

/**
 * Implements fuzzy matching algorithm
 */
function fuzzyMatch(text: string, pattern: string): boolean {
  let patternIdx = 0;
  let textIdx = 0;

  while (patternIdx < pattern.length && textIdx < text.length) {
    if (pattern[patternIdx] === text[textIdx]) {
      patternIdx++;
    }
    textIdx++;
  }

  return patternIdx === pattern.length;
}

/**
 * Applies filters to an array of objects
 */
export function filterItems<T extends Record<string, any>>(
  items: T[],
  filters: FilterOptions[]
): T[] {
  if (!filters || filters.length === 0) return items;

  return items.filter(item => {
    return filters.every(filter => {
      const fieldValue = item[filter.field];

      switch (filter.operator) {
        case 'equals':
          return fieldValue === filter.value;
        case 'notEquals':
          return fieldValue !== filter.value;
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
        case 'startsWith':
          return String(fieldValue).toLowerCase().startsWith(String(filter.value).toLowerCase());
        case 'endsWith':
          return String(fieldValue).toLowerCase().endsWith(String(filter.value).toLowerCase());
        case 'greaterThan':
          return fieldValue > filter.value;
        case 'lessThan':
          return fieldValue < filter.value;
        case 'greaterThanOrEqual':
          return fieldValue >= filter.value;
        case 'lessThanOrEqual':
          return fieldValue <= filter.value;
        case 'in':
          return Array.isArray(filter.value) && filter.value.includes(fieldValue);
        case 'notIn':
          return Array.isArray(filter.value) && !filter.value.includes(fieldValue);
        default:
          return true;
      }
    });
  });
}

/**
 * Sorts an array of objects
 */
export function sortItems<T extends Record<string, any>>(
  items: T[],
  sortOptions: SortOptions[]
): T[] {
  if (!sortOptions || sortOptions.length === 0) return items;

  return [...items].sort((a, b) => {
    for (const sortOption of sortOptions) {
      const fieldA = a[sortOption.field];
      const fieldB = b[sortOption.field];

      // Handle null/undefined values
      if (fieldA == null && fieldB == null) continue;
      if (fieldA == null) return sortOption.direction === 'asc' ? -1 : 1;
      if (fieldB == null) return sortOption.direction === 'asc' ? 1 : -1;

      // Compare values
      let comparison = 0;
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        comparison = fieldA.localeCompare(fieldB);
      } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        comparison = fieldA - fieldB;
      } else {
        comparison = String(fieldA).localeCompare(String(fieldB));
      }

      if (comparison !== 0) {
        return sortOption.direction === 'asc' ? comparison : -comparison;
      }
    }
    return 0;
  });
}

/**
 * Combines search, filter, and sort operations
 */
export function searchFilterSort<T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  searchOptions: SearchOptions = {},
  filters: FilterOptions[] = [],
  sortOptions: SortOptions[] = []
): T[] {
  let result = [...items];

  // Apply search
  if (searchTerm) {
    result = searchItems(result, searchTerm, searchOptions);
  }

  // Apply filters
  if (filters.length > 0) {
    result = filterItems(result, filters);
  }

  // Apply sorting
  if (sortOptions.length > 0) {
    result = sortItems(result, sortOptions);
  }

  return result;
}

/**
 * Creates a debounced search function
 */
export function createDebouncedSearch<T extends Record<string, any>>(
  searchFunction: (items: T[], searchTerm: string, options?: SearchOptions) => T[],
  delay: number = 300
): (items: T[], searchTerm: string, options?: SearchOptions) => Promise<T[]> {
  let timeoutId: NodeJS.Timeout | null = null;

  return (items: T[], searchTerm: string, options?: SearchOptions): Promise<T[]> => {
    return new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        resolve(searchFunction(items, searchTerm, options));
      }, delay);
    });
  };
}

/**
 * Search index for efficient searching
 */
export class SearchIndex<T extends Record<string, any>> {
  private items: T[] = [];
  private index: Map<string, number[]> = new Map(); // field -> [item indices]
  private searchableFields: string[] = [];

  constructor(searchableFields: string[] = []) {
    this.searchableFields = searchableFields;
  }

  /**
   * Adds items to the search index
   */
  addItems(items: T[]): void {
    const startIndex = this.items.length;
    this.items.push(...items);

    // Build index for new items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemIndex = startIndex + i;

      for (const field of this.searchableFields) {
        const value = item[field];
        if (value !== undefined && value !== null) {
          const stringValue = String(value).toLowerCase();
          const words = this.tokenize(stringValue);

          for (const word of words) {
            if (!this.index.has(word)) {
              this.index.set(word, []);
            }
            this.index.get(word)!.push(itemIndex);
          }
        }
      }
    }
  }

  /**
   * Searches the indexed items
   */
  search(searchTerm: string, options: SearchOptions = {}): T[] {
    if (!searchTerm) return this.items;

    const normalizedSearchTerm = options.caseSensitive ? searchTerm : searchTerm.toLowerCase();
    const searchWords = this.tokenize(normalizedSearchTerm);

    if (searchWords.length === 0) return [];

    // Find item indices that contain all search words
    let matchingIndices = new Set<number>();

    for (const word of searchWords) {
      const wordIndices = this.index.get(word);
      if (!wordIndices) {
        // If any word is not found, return empty array (for AND search)
        return [];
      }

      if (matchingIndices.size === 0) {
        // First word - add all indices
        wordIndices.forEach(idx => matchingIndices.add(idx));
      } else {
        // Subsequent words - intersect with existing matches
        // Manual intersection implementation for better browser compatibility
        const wordIndicesSet = new Set(wordIndices);
        const intersection = new Set<number>();
        for (const idx of matchingIndices) {
          if (wordIndicesSet.has(idx)) {
            intersection.add(idx);
          }
        }
        matchingIndices = intersection;
      }
    }

    // Convert indices back to items
    return Array.from(matchingIndices).map(index => this.items[index]);
  }

  /**
   * Tokenizes text into words
   */
  private tokenize(text: string): string[] {
    // Split on whitespace and common punctuation
    return text
      .split(/[\s\-\_\.\,\!\?\;\:]+/)
      .filter(token => token.length > 0);
  }

  /**
   * Clears the search index
   */
  clear(): void {
    this.items = [];
    this.index.clear();
  }
}