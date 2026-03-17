import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { Board, Column, Card, Tag, BoardState, BoardAction } from '../types/index.js';
import { storageService, createBoard, createColumn, createCard, createTag } from '../services/storage.js';

const initialState: BoardState = {
  board: null,
  isLoading: true,
  error: null,
};

function boardReducer(state: BoardState, action: BoardAction): BoardState {
  const updateTimestamp = (board: Board | null): Board | null => {
    if (!board) return null;
    return { ...board, updatedAt: new Date().toISOString() };
  };

  switch (action.type) {
    case 'SET_BOARD':
      return { ...state, board: action.payload, isLoading: false };

    case 'ADD_COLUMN': {
      if (!state.board) return state;
      const updatedBoard = {
        ...state.board,
        columns: [...state.board.columns, action.payload],
      };
      storageService.save(updatedBoard);
      return { ...state, board: updateTimestamp(updatedBoard) };
    }

    case 'UPDATE_COLUMN': {
      if (!state.board) return state;
      const updatedBoard = {
        ...state.board,
        columns: state.board.columns.map((col) =>
          col.id === action.payload.id ? action.payload : col
        ),
      };
      storageService.save(updatedBoard);
      return { ...state, board: updateTimestamp(updatedBoard) };
    }

    case 'DELETE_COLUMN': {
      if (!state.board) return state;
      const updatedBoard = {
        ...state.board,
        columns: state.board.columns.filter((col) => col.id !== action.payload),
      };
      storageService.save(updatedBoard);
      return { ...state, board: updateTimestamp(updatedBoard) };
    }

    case 'REORDER_COLUMNS': {
      if (!state.board) return state;
      const updatedBoard = {
        ...state.board,
        columns: action.payload.map((col, index) => ({ ...col, order: index })),
      };
      storageService.save(updatedBoard);
      return { ...state, board: updateTimestamp(updatedBoard) };
    }

    case 'ADD_CARD': {
      if (!state.board) return state;
      const { columnId, card } = action.payload;
      const updatedBoard = {
        ...state.board,
        columns: state.board.columns.map((col) =>
          col.id === columnId ? { ...col, cards: [...col.cards, card] } : col
        ),
      };
      storageService.save(updatedBoard);
      return { ...state, board: updateTimestamp(updatedBoard) };
    }

    case 'UPDATE_CARD': {
      if (!state.board) return state;
      const updatedCard = { ...action.payload, updatedAt: new Date().toISOString() };
      const updatedBoard = {
        ...state.board,
        columns: state.board.columns.map((col) =>
          col.id === updatedCard.columnId
            ? {
                ...col,
                cards: col.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
              }
            : col
        ),
      };
      storageService.save(updatedBoard);
      return { ...state, board: updateTimestamp(updatedBoard) };
    }

    case 'DELETE_CARD': {
      if (!state.board) return state;
      const { columnId, cardId } = action.payload;
      const updatedBoard = {
        ...state.board,
        columns: state.board.columns.map((col) =>
          col.id === columnId
            ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
            : col
        ),
      };
      storageService.save(updatedBoard);
      return { ...state, board: updateTimestamp(updatedBoard) };
    }

    case 'MOVE_CARD': {
      if (!state.board) return state;
      const { cardId, sourceColumnId, targetColumnId, targetIndex } = action.payload;

      const sourceColumn = state.board.columns.find((col) => col.id === sourceColumnId);
      if (!sourceColumn) return state;

      const card = sourceColumn.cards.find((c) => c.id === cardId);
      if (!card) return state;

      const updatedCard = { ...card, columnId: targetColumnId, updatedAt: new Date().toISOString() };

      const updatedColumns = state.board.columns.map((col) => {
        if (col.id === sourceColumnId) {
          return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
        }
        if (col.id === targetColumnId) {
          const newCards = [...col.cards];
          newCards.splice(targetIndex, 0, updatedCard);
          return { ...col, cards: newCards };
        }
        return col;
      });

      const updatedBoard = { ...state.board, columns: updatedColumns };
      storageService.save(updatedBoard);
      return { ...state, board: updateTimestamp(updatedBoard) };
    }

    case 'ADD_TAG': {
      if (!state.board) return state;
      const updatedBoard = {
        ...state.board,
        tags: [...state.board.tags, action.payload],
      };
      storageService.save(updatedBoard);
      return { ...state, board: updateTimestamp(updatedBoard) };
    }

    case 'UPDATE_TAG': {
      if (!state.board) return state;
      const updatedBoard = {
        ...state.board,
        tags: state.board.tags.map((tag) =>
          tag.id === action.payload.id ? action.payload : tag
        ),
      };
      storageService.save(updatedBoard);
      return { ...state, board: updateTimestamp(updatedBoard) };
    }

    case 'DELETE_TAG': {
      if (!state.board) return state;
      const updatedBoard = {
        ...state.board,
        tags: state.board.tags.filter((tag) => tag.id !== action.payload),
        columns: state.board.columns.map((col) => ({
          ...col,
          cards: col.cards.map((card) => ({
            ...card,
            tags: card.tags.filter((tag) => tag.id !== action.payload),
          })),
        })),
      };
      storageService.save(updatedBoard);
      return { ...state, board: updateTimestamp(updatedBoard) };
    }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    default:
      return state;
  }
}

interface BoardContextValue extends BoardState {
  // Board actions
  setBoard: (board: Board) => void;
  createNewBoard: (title: string) => void;
  
  // Column actions
  addColumn: (title: string) => void;
  updateColumn: (column: Column) => void;
  deleteColumn: (columnId: string) => void;
  reorderColumns: (columns: Column[]) => void;
  
  // Card actions
  addCard: (columnId: string, title: string) => void;
  updateCard: (card: Card) => void;
  deleteCard: (columnId: string, cardId: string) => void;
  moveCard: (cardId: string, sourceColumnId: string, targetColumnId: string, targetIndex: number) => void;
  
  // Tag actions
  addTag: (name: string, color: string) => void;
  updateTag: (tag: Tag) => void;
  deleteTag: (tagId: string) => void;
  
  // Utility
  refreshBoard: () => void;
}

const BoardContext = createContext<BoardContextValue | null>(null);

export function BoardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(boardReducer, initialState);

  // Load board from localStorage on mount
  useEffect(() => {
    const loadBoard = () => {
      try {
        const savedBoard = storageService.load();
        if (savedBoard) {
          dispatch({ type: 'SET_BOARD', payload: savedBoard });
        } else {
          // Create default board if none exists
          const defaultBoard = createBoard('My Kanban Board');
          const todoColumn = createColumn('To Do', 0);
          const inProgressColumn = createColumn('In Progress', 1);
          const doneColumn = createColumn('Done', 2);
          
          defaultBoard.columns = [todoColumn, inProgressColumn, doneColumn];
          storageService.save(defaultBoard);
          dispatch({ type: 'SET_BOARD', payload: defaultBoard });
        }
      } catch {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load board data' });
      }
    };

    loadBoard();
  }, []);

  const setBoard = useCallback((board: Board) => {
    dispatch({ type: 'SET_BOARD', payload: board });
  }, []);

  const createNewBoard = useCallback((title: string) => {
    const newBoard = createBoard(title);
    storageService.save(newBoard);
    dispatch({ type: 'SET_BOARD', payload: newBoard });
  }, []);

  const addColumn = useCallback((title: string) => {
    const order = state.board?.columns.length ?? 0;
    const column = createColumn(title, order);
    dispatch({ type: 'ADD_COLUMN', payload: column });
  }, [state.board?.columns.length]);

  const updateColumn = useCallback((column: Column) => {
    dispatch({ type: 'UPDATE_COLUMN', payload: column });
  }, []);

  const deleteColumn = useCallback((columnId: string) => {
    dispatch({ type: 'DELETE_COLUMN', payload: columnId });
  }, []);

  const reorderColumns = useCallback((columns: Column[]) => {
    dispatch({ type: 'REORDER_COLUMNS', payload: columns });
  }, []);

  const addCard = useCallback((columnId: string, title: string) => {
    const card = createCard(title, columnId);
    dispatch({ type: 'ADD_CARD', payload: { columnId, card } });
  }, []);

  const updateCard = useCallback((card: Card) => {
    dispatch({ type: 'UPDATE_CARD', payload: card });
  }, []);

  const deleteCard = useCallback((columnId: string, cardId: string) => {
    dispatch({ type: 'DELETE_CARD', payload: { columnId, cardId } });
  }, []);

  const moveCard = useCallback((cardId: string, sourceColumnId: string, targetColumnId: string, targetIndex: number) => {
    dispatch({ type: 'MOVE_CARD', payload: { cardId, sourceColumnId, targetColumnId, targetIndex } });
  }, []);

  const addTag = useCallback((name: string, color: string) => {
    const tag = createTag(name, color);
    dispatch({ type: 'ADD_TAG', payload: tag });
  }, []);

  const updateTag = useCallback((tag: Tag) => {
    dispatch({ type: 'UPDATE_TAG', payload: tag });
  }, []);

  const deleteTag = useCallback((tagId: string) => {
    dispatch({ type: 'DELETE_TAG', payload: tagId });
  }, []);

  const refreshBoard = useCallback(() => {
    const savedBoard = storageService.load();
    if (savedBoard) {
      dispatch({ type: 'SET_BOARD', payload: savedBoard });
    }
  }, []);

  const value: BoardContextValue = {
    ...state,
    setBoard,
    createNewBoard,
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    addTag,
    updateTag,
    deleteTag,
    refreshBoard,
  };

  return React.createElement(BoardContext.Provider, { value }, children);
}

export function useBoard(): BoardContextValue {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
}
