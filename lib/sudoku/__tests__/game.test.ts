import { describe, it, expect, beforeEach } from 'vitest';
import {
  createGame,
  setCellValue,
  toggleNote,
  getCellNotes,
  formatTime,
  resetGame,
} from '../game.js';
import type { GameState } from '../types.js';

describe('Sudoku Game State', () => {
  let game: GameState;

  beforeEach(() => {
    game = createGame('Kolay');
  });

  describe('createGame', () => {
    it('should create a game with correct difficulty', () => {
      expect(game.difficulty).toBe('Kolay');
    });

    it('should have initial grid with some filled cells', () => {
      const filledCount = game.initialGrid.flat().filter(c => c !== null).length;
      expect(filledCount).toBeGreaterThan(0);
    });

    it('should have matching grid and initialGrid on creation', () => {
      expect(game.grid).toEqual(game.initialGrid);
    });

    it('should have empty errors array', () => {
      expect(game.errors).toEqual([]);
    });

    it('should have empty notes object', () => {
      expect(game.notes).toEqual({});
    });

    it('should have isComplete set to false', () => {
      expect(game.isComplete).toBe(false);
    });

    it('should have startTime set', () => {
      expect(game.startTime).toBeGreaterThan(0);
    });

    it('should work for all difficulties', () => {
      const easy = createGame('Kolay');
      const medium = createGame('Orta');
      const hard = createGame('Zor');

      expect(easy.difficulty).toBe('Kolay');
      expect(medium.difficulty).toBe('Orta');
      expect(hard.difficulty).toBe('Zor');
    });
  });

  describe('setCellValue', () => {
    it('should set value in empty cell', () => {
      let emptyRow = -1, emptyCol = -1;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (game.initialGrid[r][c] === null) {
            emptyRow = r;
            emptyCol = c;
            break;
          }
        }
        if (emptyRow !== -1) break;
      }

      const newGame = setCellValue(game, emptyRow, emptyCol, 5);
      expect(newGame.grid[emptyRow][emptyCol]).toBe(5);
    });

    it('should not modify initial cells', () => {
      let filledRow = -1, filledCol = -1;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (game.initialGrid[r][c] !== null) {
            filledRow = r;
            filledCol = c;
            break;
          }
        }
        if (filledRow !== -1) break;
      }

      const originalValue = game.grid[filledRow][filledCol];
      const newGame = setCellValue(game, filledRow, filledCol, 9);
      expect(newGame.grid[filledRow][filledCol]).toBe(originalValue);
    });
  });

  describe('toggleNote', () => {
    it('should add note to empty cell', () => {
      let emptyRow = -1, emptyCol = -1;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (game.initialGrid[r][c] === null) {
            emptyRow = r;
            emptyCol = c;
            break;
          }
        }
        if (emptyRow !== -1) break;
      }

      const newGame = toggleNote(game, emptyRow, emptyCol, 5);
      expect(getCellNotes(newGame, emptyRow, emptyCol).has(5)).toBe(true);
    });
  });

  describe('formatTime', () => {
    it('should format 0 seconds correctly', () => {
      expect(formatTime(0)).toBe('00:00');
    });

    it('should format seconds correctly', () => {
      expect(formatTime(42)).toBe('00:42');
    });

    it('should format minutes correctly', () => {
      expect(formatTime(125)).toBe('02:05');
    });
  });

  describe('resetGame', () => {
    it('should reset grid to initial state', () => {
      let emptyRow = -1, emptyCol = -1;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (game.initialGrid[r][c] === null) {
            emptyRow = r;
            emptyCol = c;
            break;
          }
        }
        if (emptyRow !== -1) break;
      }

      game = setCellValue(game, emptyRow, emptyCol, 5);
      const reset = resetGame(game);
      expect(reset.grid).toEqual(game.initialGrid);
      expect(reset.notes).toEqual({});
      expect(reset.errors).toEqual([]);
      expect(reset.isComplete).toBe(false);
    });
  });
});
