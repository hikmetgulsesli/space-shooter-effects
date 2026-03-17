import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storageService, generateId, createBoard, createColumn, createCard, createTag } from '../services/storage.js';
import type { Board } from '../types/index.js';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('storageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('load', () => {
    it('should return null when no data exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const result = storageService.load();
      expect(result).toBeNull();
      expect(localStorageMock.getItem).toHaveBeenCalledWith('kanban-board-data');
    });

    it('should return parsed board data', () => {
      const mockBoard: Board = {
        id: 'test-id',
        title: 'Test Board',
        columns: [],
        tags: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockBoard));
      const result = storageService.load();
      expect(result).toEqual(mockBoard);
    });

    it('should return null on parse error', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      const result = storageService.load();
      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should save board to localStorage', () => {
      const mockBoard: Board = {
        id: 'test-id',
        title: 'Test Board',
        columns: [],
        tags: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      const result = storageService.save(mockBoard);
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'kanban-board-data',
        JSON.stringify(mockBoard)
      );
    });

    it('should return false on error', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });
      const result = storageService.save({} as Board);
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove item from localStorage', () => {
      const result = storageService.clear();
      expect(result).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('kanban-board-data');
    });

    it('should return false on error', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      const result = storageService.clear();
      expect(result).toBe(false);
    });
  });

  describe('isAvailable', () => {
    it('should return true when localStorage is available', () => {
      const result = storageService.isAvailable();
      expect(result).toBe(true);
    });

    it('should return false when localStorage throws', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage disabled');
      });
      const result = storageService.isAvailable();
      expect(result).toBe(false);
    });
  });
});

describe('Entity factories', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });
  });

  describe('createBoard', () => {
    it('should create a board with correct structure', () => {
      const board = createBoard('My Board');
      expect(board.title).toBe('My Board');
      expect(board.columns).toEqual([]);
      expect(board.tags).toEqual([]);
      expect(board.id).toBeDefined();
      expect(board.createdAt).toBeDefined();
      expect(board.updatedAt).toBeDefined();
    });
  });

  describe('createColumn', () => {
    it('should create a column with correct structure', () => {
      const column = createColumn('To Do', 0);
      expect(column.title).toBe('To Do');
      expect(column.order).toBe(0);
      expect(column.cards).toEqual([]);
      expect(column.id).toBeDefined();
    });
  });

  describe('createCard', () => {
    it('should create a card with correct structure', () => {
      const card = createCard('Test Card', 'col-1');
      expect(card.title).toBe('Test Card');
      expect(card.columnId).toBe('col-1');
      expect(card.description).toBe('');
      expect(card.tags).toEqual([]);
      expect(card.priority).toBe('medium');
      expect(card.completed).toBe(false);
      expect(card.id).toBeDefined();
    });
  });

  describe('createTag', () => {
    it('should create a tag with correct structure', () => {
      const tag = createTag('Bug', '#ff0000');
      expect(tag.name).toBe('Bug');
      expect(tag.color).toBe('#ff0000');
      expect(tag.id).toBeDefined();
    });
  });
});
