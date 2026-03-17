import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NoteViewModal from '../NoteViewModal';

// Mock the store
const mockSetEditingTodoId = vi.fn();
vi.mock('../../../store/useTodoStore', () => ({
    useTodoStore: () => ({
        editingTodoId: 1,
        setEditingTodoId: mockSetEditingTodoId,
    }),
}));

// Mock hooks
const mockMutateAsync = vi.fn();
vi.mock('../../../hooks/useTodos', () => ({
    useTodoQuery: (id: number | null) => ({
        data: id === 1 ? { id: 1, title: 'Test Note', description: 'Test Desc', category: { id: 1, name: 'Work' }, updated_at: '2023-01-01' } : null,
        isLoading: false,
    }),
    useCategoriesQuery: () => ({
        data: [{ id: 1, name: 'Work', color: '#ff0000' }],
    }),
    useUpdateTodoMutation: () => ({
        mutateAsync: mockMutateAsync,
    }),
    useAddTodoMutation: () => ({
        mutateAsync: vi.fn(),
    }),
}));

vi.mock('../../../hooks/useSpeechToText', () => ({
    useSpeechToText: () => ({
        isListening: false,
        toggleListening: vi.fn(),
    }),
}));

// Mock utils
vi.mock('@/utils', () => ({
    getBackgroundColor: () => '#ffffff',
    getBorderColor: () => '#cccccc',
    formatLastEdited: (date: string) => `Edited ${date}`,
}));

// Mock sub-components to simplify
vi.mock('../../CategoryDropdown', () => ({
    default: () => <div data-testid="category-dropdown">CategoryDropdown</div>,
}));

vi.mock('../../ModalOverlay', () => ({
    default: ({ children, onClose, headerRight }: { children: React.ReactNode, onClose: () => void, headerRight: React.ReactNode }) => (
        <div data-testid="modal-overlay">
            {headerRight}
            {children}
            <button onClick={onClose} data-testid="close-overlay">Close</button>
        </div>
    ),
}));

describe('NoteViewModal component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders note details when editing an existing note', () => {
        render(<NoteViewModal />);

        expect(screen.getByPlaceholderText('Note Title')).toHaveValue('Test Note');
        expect(screen.getByPlaceholderText('Pour your heart out...')).toHaveValue('Test Desc');
        expect(screen.getByText('Edited 2023-01-01')).toBeInTheDocument();
    });

    it('updates local state when typing', () => {
        render(<NoteViewModal />);

        const titleInput = screen.getByPlaceholderText('Note Title');
        fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
        expect(titleInput).toHaveValue('Updated Title');
    });

    it('calls updateTodoMutation when closing with changes', async () => {
        render(<NoteViewModal />);

        const titleInput = screen.getByPlaceholderText('Note Title');
        fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

        const closeBtn = screen.getByTestId('close-modal-btn');
        fireEvent.click(closeBtn);

        await waitFor(() => {
            expect(mockMutateAsync).toHaveBeenCalledWith({
                id: 1,
                data: {
                    title: 'Updated Title',
                    description: 'Test Desc',
                    category_id: 1
                }
            });
        });
        expect(mockSetEditingTodoId).toHaveBeenCalledWith(null);
    });

    it('does not call mutateAsync when closing without changes', () => {
        render(<NoteViewModal />);

        const closeBtn = screen.getByTestId('close-modal-btn');
        fireEvent.click(closeBtn);

        expect(mockMutateAsync).not.toHaveBeenCalled();
        expect(mockSetEditingTodoId).toHaveBeenCalledWith(null);
    });
});
