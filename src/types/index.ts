// Re-export weather types (if available)
// export * from './weather';

/**
 * Tag entity representing a label that can be assigned to cards
 */
export interface Tag {
  id: string;
  name: string;
  color: string;
}

/**
 * Card entity representing a task/item in the kanban board
 */
export interface Card {
  id: string;
  title: string;
  description: string;
  columnId: string;
  tags: Tag[];
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high';
  assignees: string[];
  attachments: number;
  comments: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Column entity representing a stage in the kanban board
 */
export interface Column {
  id: string;
  title: string;
  order: number;
  cards: Card[];
}

/**
 * Board entity representing the entire kanban board
 */
export interface Board {
  id: string;
  title: string;
  columns: Column[];
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Filter options for searching and filtering cards
 */
export interface CardFilters {
  searchQuery: string;
  tags: string[];
  priority: ('low' | 'medium' | 'high')[];
  dueDateRange: {
    from: string | null;
    to: string | null;
  };
  assignees: string[];
}

/**
 * Board state for React Context
 */
export interface BoardState {
  board: Board | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Actions available for board state management
 */
export type BoardAction =
  | { type: 'SET_BOARD'; payload: Board }
  | { type: 'ADD_COLUMN'; payload: Column }
  | { type: 'UPDATE_COLUMN'; payload: Column }
  | { type: 'DELETE_COLUMN'; payload: string }
  | { type: 'REORDER_COLUMNS'; payload: Column[] }
  | { type: 'ADD_CARD'; payload: { columnId: string; card: Card } }
  | { type: 'UPDATE_CARD'; payload: Card }
  | { type: 'DELETE_CARD'; payload: { columnId: string; cardId: string } }
  | { type: 'MOVE_CARD'; payload: { cardId: string; sourceColumnId: string; targetColumnId: string; targetIndex: number } }
  | { type: 'ADD_TAG'; payload: Tag }
  | { type: 'UPDATE_TAG'; payload: Tag }
  | { type: 'DELETE_TAG'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };
