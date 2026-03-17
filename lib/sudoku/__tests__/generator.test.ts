import { describe, it, expect } from 'vitest';
import {
  createEmptyGrid,
  cloneGrid,
  isValidPlacement,
  validateGrid,
  isGridComplete,
  getValidNumbers,
  solveSudoku,
  generateSolution,
  generatePuzzle,
  countSolutions,
  hasUniqueSolution,
  generatePuzzleBank,
} from '../generator.js';
import type { Grid } from '../types.js';

describe('Sudoku Generator', () => {
  describe('createEmptyGrid', () => {
    it('should create a 9x9 grid filled with null', () => {
      const grid = createEmptyGrid();
      expect(grid).toHaveLength(9);
      expect(grid.every(row => row.length === 9)).toBe(true);
      expect(grid.every(row => row.every(cell => cell === null))).toBe(true);
    });
  });

  describe('cloneGrid', () => {
    it('should create an independent copy of the grid', () => {
      const original = createEmptyGrid();
      original[0][0] = 5;
      const clone = cloneGrid(original);
      
      expect(clone).toEqual(original);
      clone[0][0] = 3;
      expect(original[0][0]).toBe(5);
    });
  });

  describe('isValidPlacement', () => {
    it('should return true for valid placement', () => {
      const grid = createEmptyGrid();
      expect(isValidPlacement(grid, 0, 0, 5)).toBe(true);
    });

    it('should return false for duplicate in row', () => {
      const grid = createEmptyGrid();
      grid[0][1] = 5;
      expect(isValidPlacement(grid, 0, 0, 5)).toBe(false);
    });

    it('should return false for duplicate in column', () => {
      const grid = createEmptyGrid();
      grid[1][0] = 5;
      expect(isValidPlacement(grid, 0, 0, 5)).toBe(false);
    });

    it('should return false for duplicate in 3x3 box', () => {
      const grid = createEmptyGrid();
      grid[1][1] = 5;
      expect(isValidPlacement(grid, 0, 0, 5)).toBe(false);
    });

    it('should allow same value in same position', () => {
      const grid = createEmptyGrid();
      grid[0][0] = 5;
      expect(isValidPlacement(grid, 0, 0, 5)).toBe(true);
    });
  });

  describe('validateGrid', () => {
    it('should return true for valid empty grid', () => {
      expect(validateGrid(createEmptyGrid())).toBe(true);
    });

    it('should return true for valid complete grid', () => {
      const grid: Grid = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9],
      ];
      expect(validateGrid(grid)).toBe(true);
    });

    it('should return false for invalid grid with duplicate', () => {
      const grid = createEmptyGrid();
      grid[0][0] = 5;
      grid[0][1] = 5;
      expect(validateGrid(grid)).toBe(false);
    });
  });

  describe('isGridComplete', () => {
    it('should return false for empty grid', () => {
      expect(isGridComplete(createEmptyGrid())).toBe(false);
    });

    it('should return true for valid complete grid', () => {
      const grid: Grid = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9],
      ];
      expect(isGridComplete(grid)).toBe(true);
    });

    it('should return false for complete but invalid grid', () => {
      const grid: Grid = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 1));
      expect(isGridComplete(grid)).toBe(false);
    });
  });

  describe('getValidNumbers', () => {
    it('should return empty array for filled cell', () => {
      const grid = createEmptyGrid();
      grid[0][0] = 5;
      expect(getValidNumbers(grid, 0, 0)).toEqual([]);
    });

    it('should return valid numbers for empty cell', () => {
      const grid = createEmptyGrid();
      const valid = getValidNumbers(grid, 0, 0);
      expect(valid).toHaveLength(9);
      expect(valid.sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should exclude numbers that would create conflicts', () => {
      const grid = createEmptyGrid();
      grid[0][1] = 1;
      grid[1][0] = 2;
      grid[1][1] = 3;
      const valid = getValidNumbers(grid, 0, 0);
      expect(valid).not.toContain(1);
      expect(valid).not.toContain(2);
      expect(valid).not.toContain(3);
    });
  });

  describe('solveSudoku', () => {
    it('should solve an empty grid', () => {
      const grid = createEmptyGrid();
      expect(solveSudoku(grid)).toBe(true);
      expect(isGridComplete(grid)).toBe(true);
    });

    it('should solve a partially filled grid', () => {
      const grid = createEmptyGrid();
      grid[0][0] = 5;
      grid[0][1] = 3;
      grid[0][2] = 4;
      expect(solveSudoku(grid)).toBe(true);
      expect(isGridComplete(grid)).toBe(true);
    });
  });

  describe('generateSolution', () => {
    it('should generate a valid complete grid', () => {
      const solution = generateSolution();
      expect(isGridComplete(solution)).toBe(true);
    });

    it('should generate different solutions on multiple calls', () => {
      const solution1 = generateSolution();
      const solution2 = generateSolution();
      // Very unlikely to be identical due to randomization
      const identical = solution1.every((row, i) => 
        row.every((cell, j) => cell === solution2[i][j])
      );
      // Note: There's a tiny chance this could fail, but extremely unlikely
      expect(identical).toBe(false);
    });
  });

  describe('generatePuzzle', () => {
    it('should generate a valid puzzle for Kolay difficulty', () => {
      const puzzle = generatePuzzle('Kolay');
      expect(puzzle.difficulty).toBe('Kolay');
      expect(puzzle.solution).toBeDefined();
      expect(puzzle.puzzle).toBeDefined();
      expect(isGridComplete(puzzle.solution)).toBe(true);
      expect(hasUniqueSolution(puzzle.puzzle)).toBe(true);
    });

    it('should generate a valid puzzle for Orta difficulty', () => {
      const puzzle = generatePuzzle('Orta');
      expect(puzzle.difficulty).toBe('Orta');
      expect(hasUniqueSolution(puzzle.puzzle)).toBe(true);
    });

    it('should generate a valid puzzle for Zor difficulty', () => {
      const puzzle = generatePuzzle('Zor');
      expect(puzzle.difficulty).toBe('Zor');
      expect(hasUniqueSolution(puzzle.puzzle)).toBe(true);
    });

    it('should have fewer filled cells for harder difficulties', () => {
      const easy = generatePuzzle('Kolay');
      const medium = generatePuzzle('Orta');
      const hard = generatePuzzle('Zor');

      const countFilled = (grid: Grid) => grid.flat().filter(c => c !== null).length;

      expect(countFilled(easy.puzzle)).toBeGreaterThan(countFilled(medium.puzzle));
      expect(countFilled(medium.puzzle)).toBeGreaterThan(countFilled(hard.puzzle));
    });
  });

  describe('countSolutions', () => {
    it('should return 0 for unsolvable puzzle', () => {
      const grid = createEmptyGrid();
      grid[0][0] = 1;
      grid[0][1] = 1; // Conflict
      expect(countSolutions(grid)).toBe(0);
    });

    it('should return 1 for uniquely solvable puzzle', () => {
      const grid = createEmptyGrid();
      grid[0][0] = 5;
      expect(countSolutions(grid)).toBe(1);
    });

    it('should respect maxCount parameter', () => {
      const grid = createEmptyGrid();
      // Empty grid has many solutions, but we stop at maxCount
      expect(countSolutions(grid, 5)).toBeLessThanOrEqual(5);
    });
  });

  describe('hasUniqueSolution', () => {
    it('should return true for uniquely solvable puzzle', () => {
      const { puzzle } = generatePuzzle('Kolay');
      expect(hasUniqueSolution(puzzle)).toBe(true);
    });

    it('should return false for empty grid', () => {
      expect(hasUniqueSolution(createEmptyGrid())).toBe(false);
    });
  });

  describe('generatePuzzleBank', () => {
    it('should generate specified number of puzzles per difficulty', () => {
      const bank = generatePuzzleBank(5);
      expect(bank.easy).toHaveLength(5);
      expect(bank.medium).toHaveLength(5);
      expect(bank.hard).toHaveLength(5);
    });

    it('should generate valid puzzles', () => {
      const bank = generatePuzzleBank(3);
      bank.easy.forEach(puzzle => {
        expect(hasUniqueSolution(puzzle.puzzle)).toBe(true);
      });
      bank.medium.forEach(puzzle => {
        expect(hasUniqueSolution(puzzle.puzzle)).toBe(true);
      });
      bank.hard.forEach(puzzle => {
        expect(hasUniqueSolution(puzzle.puzzle)).toBe(true);
      });
    });
  });
});
