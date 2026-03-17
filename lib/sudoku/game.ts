/**
 * Sudoku Game State Management
 * Functions for managing game state and player interactions
 */

import { 
  Difficulty, 
  GameState, 
  CellPosition
} from './types.js';
import { generatePuzzle } from './generator.js';
import { validateEntireGrid, isPuzzleSolved } from './validation.js';

/**
 * Creates a new game state
 */
export function createGame(difficulty: Difficulty): GameState {
  const { puzzle, solution } = generatePuzzle(difficulty);
  
  return {
    grid: puzzle.map(row => [...row]),
    initialGrid: puzzle,
    solution,
    errors: [],
    notes: {},
    difficulty,
    startTime: Date.now(),
    isComplete: false,
  };
}

/**
 * Sets a cell value in the grid
 */
export function setCellValue(
  gameState: GameState,
  row: number,
  col: number,
  value: number | null
): GameState {
  // Don't modify initial cells
  if (gameState.initialGrid[row][col] !== null) {
    return gameState;
  }

  const newGrid = gameState.grid.map(r => [...r]);
  newGrid[row][col] = value;

  // Clear notes for this cell when setting a value
  const newNotes = { ...gameState.notes };
  delete newNotes[`${row},${col}`];

  const errors = validateEntireGrid(newGrid);
  const isComplete = isPuzzleSolved(newGrid, gameState.solution);

  return {
    ...gameState,
    grid: newGrid,
    notes: newNotes,
    errors,
    isComplete,
  };
}

/**
 * Toggles a note for a cell
 */
export function toggleNote(
  gameState: GameState,
  row: number,
  col: number,
  note: number
): GameState {
  // Don't add notes to filled cells or initial cells
  if (gameState.grid[row][col] !== null || gameState.initialGrid[row][col] !== null) {
    return gameState;
  }

  const key = `${row},${col}`;
  const currentNotes = gameState.notes[key] || new Set<number>();
  const newNotes = new Set(currentNotes);

  if (newNotes.has(note)) {
    newNotes.delete(note);
  } else {
    newNotes.add(note);
  }

  return {
    ...gameState,
    notes: {
      ...gameState.notes,
      [key]: newNotes,
    },
  };
}

/**
 * Clears all notes for a cell
 */
export function clearNotes(
  gameState: GameState,
  row: number,
  col: number
): GameState {
  const key = `${row},${col}`;
  const newNotes = { ...gameState.notes };
  delete newNotes[key];

  return {
    ...gameState,
    notes: newNotes,
  };
}

/**
 * Gets notes for a specific cell
 */
export function getCellNotes(gameState: GameState, row: number, col: number): Set<number> {
  return gameState.notes[`${row},${col}`] || new Set<number>();
}

/**
 * Checks if a cell is part of the initial puzzle
 */
export function isInitialCell(gameState: GameState, row: number, col: number): boolean {
  return gameState.initialGrid[row][col] !== null;
}

/**
 * Gets the current cell value
 */
export function getCellValue(gameState: GameState, row: number, col: number): number | null {
  return gameState.grid[row][col];
}

/**
 * Checks if a cell has an error
 */
export function hasCellError(gameState: GameState, row: number, col: number): boolean {
  return gameState.errors.some(e => e.position.row === row && e.position.col === col);
}

/**
 * Gets elapsed time in seconds
 */
export function getElapsedTime(gameState: GameState): number {
  return Math.floor((Date.now() - gameState.startTime) / 1000);
}

/**
 * Formats elapsed time as MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Resets the game to initial state
 */
export function resetGame(gameState: GameState): GameState {
  return {
    ...gameState,
    grid: gameState.initialGrid.map(row => [...row]),
    errors: [],
    notes: {},
    startTime: Date.now(),
    isComplete: false,
  };
}

/**
 * Gets a hint by revealing the solution value for a cell
 */
export function getHint(gameState: GameState, row: number, col: number): GameState {
  if (gameState.initialGrid[row][col] !== null) {
    return gameState;
  }

  const correctValue = gameState.solution[row][col];
  return setCellValue(gameState, row, col, correctValue);
}

/**
 * Finds the next empty cell that needs to be filled
 */
export function findNextEmptyCell(gameState: GameState): CellPosition | null {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (gameState.grid[row][col] === null) {
        return { row, col };
      }
    }
  }
  return null;
}
