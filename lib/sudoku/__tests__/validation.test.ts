import { describe, it, expect } from 'vitest';
import {
  findConflicts,
  validateMove,
  validateEntireGrid,
  isCellEditable,
  isPuzzleSolved,
  countFilledCells,
  countEmptyCells,
  getEmptyCells,
} from '../validation.js';
import { createEmptyGrid, generateSolution } from '../generator.js';
// No additional types needed

describe('Sudoku Validation', () => {
  describe('findConflicts', () => {
    it('should return empty array when no conflicts', () => {
      const grid = createEmptyGrid();
      const conflicts = findConflicts(grid, 0, 0, 5);
      expect(conflicts).toHaveLength(0);
    });

    it('should find conflict in same row', () => {
      const grid = createEmptyGrid();
      grid[0][5] = 5;
      const conflicts = findConflicts(grid, 0, 0, 5);
      expect(conflicts).toContainEqual({ row: 0, col: 5 });
    });

    it('should find conflict in same column', () => {
      const grid = createEmptyGrid();
      grid[5][0] = 5;
      const conflicts = findConflicts(grid, 0, 0, 5);
      expect(conflicts).toContainEqual({ row: 5, col: 0 });
    });

    it('should find conflict in same 3x3 box', () => {
      const grid = createEmptyGrid();
      grid[2][2] = 5;
      const conflicts = findConflicts(grid, 0, 0, 5);
      expect(conflicts).toContainEqual({ row: 2, col: 2 });
    });

    it('should find multiple conflicts', () => {
      const grid = createEmptyGrid();
      grid[0][5] = 5;
      grid[5][0] = 5;
      grid[2][2] = 5;
      const conflicts = findConflicts(grid, 0, 0, 5);
      expect(conflicts).toHaveLength(3);
    });

    it('should not include the cell itself as conflict', () => {
      const grid = createEmptyGrid();
      grid[0][0] = 5;
      const conflicts = findConflicts(grid, 0, 0, 5);
      expect(conflicts).toHaveLength(0);
    });
  });

  describe('validateMove', () => {
    it('should return valid true for valid move', () => {
      const grid = createEmptyGrid();
      const result = validateMove(grid, 0, 0, 5);
      expect(result.valid).toBe(true);
      expect(result.conflicts).toHaveLength(0);
    });

    it('should return valid false for invalid move', () => {
      const grid = createEmptyGrid();
      grid[0][5] = 5;
      const result = validateMove(grid, 0, 0, 5);
      expect(result.valid).toBe(false);
      expect(result.conflicts.length).toBeGreaterThan(0);
    });
  });

  describe('validateEntireGrid', () => {
    it('should return empty array for valid grid', () => {
      const grid = generateSolution();
      const errors = validateEntireGrid(grid);
      expect(errors).toHaveLength(0);
    });

    it('should return errors for invalid grid', () => {
      const grid = createEmptyGrid();
      grid[0][0] = 5;
      grid[0][1] = 5;
      const errors = validateEntireGrid(grid);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should include position and value in errors', () => {
      const grid = createEmptyGrid();
      grid[0][0] = 5;
      grid[0][1] = 5;
      const errors = validateEntireGrid(grid);
      expect(errors[0]).toHaveProperty('position');
      expect(errors[0]).toHaveProperty('value');
      expect(errors[0].value).toBe(5);
    });
  });

  describe('isCellEditable', () => {
    it('should return true for null cell in initial grid', () => {
      const initialGrid = createEmptyGrid();
      expect(isCellEditable(initialGrid, 0, 0)).toBe(true);
    });

    it('should return false for filled cell in initial grid', () => {
      const initialGrid = createEmptyGrid();
      initialGrid[0][0] = 5;
      expect(isCellEditable(initialGrid, 0, 0)).toBe(false);
    });
  });

  describe('isPuzzleSolved', () => {
    it('should return true when grid matches solution', () => {
      const solution = generateSolution();
      const grid = solution.map(row => [...row]);
      expect(isPuzzleSolved(grid, solution)).toBe(true);
    });

    it('should return false when grid differs from solution', () => {
      const solution = generateSolution();
      const grid = solution.map(row => [...row]);
      grid[0][0] = (grid[0][0]! % 9) + 1;
      expect(isPuzzleSolved(grid, solution)).toBe(false);
    });

    it('should return false for incomplete grid', () => {
      const solution = generateSolution();
      const grid = createEmptyGrid();
      expect(isPuzzleSolved(grid, solution)).toBe(false);
    });
  });

  describe('countFilledCells', () => {
    it('should return 0 for empty grid', () => {
      expect(countFilledCells(createEmptyGrid())).toBe(0);
    });

    it('should return correct count for partially filled grid', () => {
      const grid = createEmptyGrid();
      grid[0][0] = 1;
      grid[4][5] = 2;
      grid[8][8] = 3;
      expect(countFilledCells(grid)).toBe(3);
    });

    it('should return 81 for complete grid', () => {
      const grid = generateSolution();
      expect(countFilledCells(grid)).toBe(81);
    });
  });

  describe('countEmptyCells', () => {
    it('should return 81 for empty grid', () => {
      expect(countEmptyCells(createEmptyGrid())).toBe(81);
    });

    it('should return 0 for complete grid', () => {
      const grid = generateSolution();
      expect(countEmptyCells(grid)).toBe(0);
    });
  });

  describe('getEmptyCells', () => {
    it('should return all cells for empty grid', () => {
      const empty = getEmptyCells(createEmptyGrid());
      expect(empty).toHaveLength(81);
    });

    it('should return empty array for complete grid', () => {
      const empty = getEmptyCells(generateSolution());
      expect(empty).toHaveLength(0);
    });

    it('should return correct positions', () => {
      const grid = createEmptyGrid();
      grid[0][0] = 1;
      grid[1][1] = 2;
      const empty = getEmptyCells(grid);
      expect(empty).not.toContainEqual({ row: 0, col: 0 });
      expect(empty).not.toContainEqual({ row: 1, col: 1 });
      expect(empty).toContainEqual({ row: 0, col: 1 });
    });
  });
});
